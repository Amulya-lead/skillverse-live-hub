import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Store active connections per session
const sessionConnections = new Map<string, Set<WebSocket>>();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  // Handle WebSocket upgrade for signaling
  if (upgradeHeader.toLowerCase() === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    let sessionId = "";
    let peerId = "";
    let isInstructor = false;

    socket.onopen = () => {
      console.log("WebSocket connection opened");
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received message:", data.type);

        switch (data.type) {
          case 'join':
            sessionId = data.sessionId || "";
            peerId = data.peerId || "";
            isInstructor = data.isInstructor || false;
            
            if (!sessionId) {
              console.error("No session ID provided");
              return;
            }
            
            // Get or create session connections set
            if (!sessionConnections.has(sessionId)) {
              sessionConnections.set(sessionId, new Set());
            }
            sessionConnections.get(sessionId)?.add(socket);
            
            console.log(`Peer ${peerId} joined session ${sessionId} as ${isInstructor ? 'instructor' : 'viewer'}`);
            
            // Notify all peers in session about new peer
            broadcastToSession(sessionId, {
              type: 'peer-joined',
              peerId,
              isInstructor
            }, socket);
            
            break;

          case 'offer':
            // Forward offer to target peer
            if (data.sessionId) {
              broadcastToSession(data.sessionId, {
                type: 'offer',
                offer: data.offer,
                fromPeerId: data.fromPeerId,
                isInstructor: data.isInstructor
              }, socket);
            }
            break;

          case 'answer':
            // Forward answer to target peer
            if (data.sessionId) {
              broadcastToSession(data.sessionId, {
                type: 'answer',
                answer: data.answer,
                fromPeerId: data.fromPeerId
              }, socket);
            }
            break;

          case 'ice-candidate':
            // Forward ICE candidate
            if (data.sessionId) {
              broadcastToSession(data.sessionId, {
                type: 'ice-candidate',
                candidate: data.candidate,
                fromPeerId: data.fromPeerId
              }, socket);
            }
            break;

          case 'screen-share-started':
            if (data.sessionId) {
              broadcastToSession(data.sessionId, {
                type: 'screen-share-started',
                fromPeerId: data.fromPeerId
              }, socket);
            }
            break;

          case 'screen-share-stopped':
            if (data.sessionId) {
              broadcastToSession(data.sessionId, {
                type: 'screen-share-stopped',
                fromPeerId: data.fromPeerId
              }, socket);
            }
            break;
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    };

    socket.onclose = () => {
      console.log(`Peer ${peerId} disconnected from session ${sessionId}`);
      if (sessionId && sessionConnections.has(sessionId)) {
        sessionConnections.get(sessionId)?.delete(socket);
        
        // Notify others about peer leaving
        broadcastToSession(sessionId, {
          type: 'peer-left',
          peerId
        }, socket);
        
        // Clean up empty sessions
        if (sessionConnections.get(sessionId)?.size === 0) {
          sessionConnections.delete(sessionId);
        }
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return response;
  }

  // Handle HTTP requests for TURN credentials
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      
      if (body.action === 'get-turn-credentials') {
        // Return STUN servers (TURN requires external service)
        const iceServers = [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ];

        return new Response(JSON.stringify({ iceServers }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Unknown action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('WebRTC Signaling Server', {
    headers: corsHeaders,
  });
});

function broadcastToSession(
  sessionId: string,
  message: object,
  excludeSocket: WebSocket
) {
  const connections = sessionConnections.get(sessionId);
  if (connections) {
    const messageStr = JSON.stringify(message);
    connections.forEach((ws) => {
      if (ws !== excludeSocket && ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }
}
