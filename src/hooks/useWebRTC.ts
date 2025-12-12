import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseWebRTCOptions {
  sessionId: string;
  isInstructor: boolean;
  userId: string;
  onRemoteStream?: (stream: MediaStream, peerId: string) => void;
  onPeerJoined?: (peerId: string, isInstructor: boolean) => void;
  onPeerLeft?: (peerId: string) => void;
  onScreenShareStarted?: (peerId: string) => void;
  onScreenShareStopped?: (peerId: string) => void;
}

interface PeerConnection {
  pc: RTCPeerConnection;
  stream?: MediaStream;
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export const useWebRTC = ({
  sessionId,
  isInstructor,
  userId,
  onRemoteStream,
  onPeerJoined,
  onPeerLeft,
  onScreenShareStarted,
  onScreenShareStopped,
}: UseWebRTCOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Initialize WebSocket connection for signaling
  const initSignaling = useCallback(() => {
    const wsUrl = `wss://cklgsjulvimzvxucevmb.supabase.co/functions/v1/webrtc-signaling`;
    
    console.log('Connecting to signaling server...');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Signaling connected');
      setIsConnected(true);
      
      // Join the session
      ws.send(JSON.stringify({
        type: 'join',
        sessionId,
        peerId: userId,
        isInstructor
      }));
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log('Signaling message:', data.type);

      switch (data.type) {
        case 'peer-joined':
          console.log('Peer joined:', data.peerId, 'isInstructor:', data.isInstructor);
          onPeerJoined?.(data.peerId, data.isInstructor);
          
          // If we're the instructor, create offer for new viewer
          if (isInstructor && !data.isInstructor && localStream) {
            await createOffer(data.peerId);
          }
          break;

        case 'peer-left':
          console.log('Peer left:', data.peerId);
          handlePeerLeft(data.peerId);
          onPeerLeft?.(data.peerId);
          break;

        case 'offer':
          console.log('Received offer from:', data.fromPeerId);
          await handleOffer(data.offer, data.fromPeerId, data.isInstructor);
          break;

        case 'answer':
          console.log('Received answer from:', data.fromPeerId);
          await handleAnswer(data.answer, data.fromPeerId);
          break;

        case 'ice-candidate':
          console.log('Received ICE candidate from:', data.fromPeerId);
          await handleIceCandidate(data.candidate, data.fromPeerId);
          break;

        case 'screen-share-started':
          onScreenShareStarted?.(data.fromPeerId);
          break;

        case 'screen-share-stopped':
          onScreenShareStopped?.(data.fromPeerId);
          break;
      }
    };

    ws.onclose = () => {
      console.log('Signaling disconnected');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('Signaling error:', error);
    };
  }, [sessionId, userId, isInstructor]);

  // Create peer connection
  const createPeerConnection = useCallback((peerId: string): RTCPeerConnection => {
    console.log('Creating peer connection for:', peerId);
    
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          sessionId,
          candidate: event.candidate,
          fromPeerId: userId
        }));
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track from:', peerId);
      const stream = event.streams[0];
      if (stream) {
        setRemoteStreams(prev => {
          const updated = new Map(prev);
          updated.set(peerId, stream);
          return updated;
        });
        onRemoteStream?.(stream, peerId);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState, 'for peer:', peerId);
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        handlePeerLeft(peerId);
      }
    };

    peerConnectionsRef.current.set(peerId, { pc });
    return pc;
  }, [sessionId, userId, onRemoteStream]);

  // Create offer (instructor to viewer)
  const createOffer = useCallback(async (peerId: string) => {
    const pc = createPeerConnection(peerId);

    // Add local tracks to connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Add screen share tracks if active
    if (screenStream) {
      screenStream.getTracks().forEach(track => {
        pc.addTrack(track, screenStream);
      });
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    wsRef.current?.send(JSON.stringify({
      type: 'offer',
      sessionId,
      offer,
      fromPeerId: userId,
      isInstructor
    }));
  }, [localStream, screenStream, sessionId, userId, isInstructor, createPeerConnection]);

  // Handle incoming offer (viewer receives from instructor)
  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit, fromPeerId: string, fromIsInstructor: boolean) => {
    const pc = createPeerConnection(fromPeerId);

    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    // If we're a viewer, we don't add our own tracks (just receive)
    // If we wanted two-way video, we'd add tracks here

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    wsRef.current?.send(JSON.stringify({
      type: 'answer',
      sessionId,
      answer,
      fromPeerId: userId
    }));
  }, [sessionId, userId, createPeerConnection]);

  // Handle answer
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit, fromPeerId: string) => {
    const peerData = peerConnectionsRef.current.get(fromPeerId);
    if (peerData?.pc) {
      await peerData.pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }, []);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit, fromPeerId: string) => {
    const peerData = peerConnectionsRef.current.get(fromPeerId);
    if (peerData?.pc) {
      try {
        await peerData.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  }, []);

  // Handle peer leaving
  const handlePeerLeft = useCallback((peerId: string) => {
    const peerData = peerConnectionsRef.current.get(peerId);
    if (peerData) {
      peerData.pc.close();
      peerConnectionsRef.current.delete(peerId);
    }
    setRemoteStreams(prev => {
      const updated = new Map(prev);
      updated.delete(peerId);
      return updated;
    });
  }, []);

  // Start local media
  const startLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      setLocalStream(stream);
      console.log('Local media started');
      return stream;
    } catch (error) {
      console.error('Error getting local media:', error);
      throw error;
    }
  }, []);

  // Stop local media
  const stopLocalMedia = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  }, [localStream]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      setScreenStream(stream);

      // Notify peers about screen share
      wsRef.current?.send(JSON.stringify({
        type: 'screen-share-started',
        sessionId,
        fromPeerId: userId
      }));

      // Add screen tracks to existing peer connections
      peerConnectionsRef.current.forEach(({ pc }) => {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      });

      // Handle when user stops sharing via browser
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      return stream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }, [sessionId, userId]);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);

      wsRef.current?.send(JSON.stringify({
        type: 'screen-share-stopped',
        sessionId,
        fromPeerId: userId
      }));
    }
  }, [screenStream, sessionId, userId]);

  // Toggle audio
  const toggleAudio = useCallback((enabled: boolean) => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback((enabled: boolean) => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }, [localStream]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!localStream && !screenStream) {
      console.error('No stream to record');
      return;
    }

    const streamToRecord = screenStream || localStream;
    if (!streamToRecord) return;

    recordedChunksRef.current = [];
    
    const mediaRecorder = new MediaRecorder(streamToRecord, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      setRecordedChunks([...recordedChunksRef.current]);
      console.log('Recording stopped, chunks:', recordedChunksRef.current.length);
    };

    mediaRecorder.start(1000); // Collect data every second
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    console.log('Recording started');
  }, [localStream, screenStream]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Save recording to Supabase storage
  const saveRecording = useCallback(async (sessionId: string) => {
    if (recordedChunksRef.current.length === 0) {
      console.error('No recorded data to save');
      return null;
    }

    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    const fileName = `recordings/${sessionId}/${Date.now()}.webm`;

    try {
      // First check if bucket exists, create if not
      const { data: buckets } = await supabase.storage.listBuckets();
      const recordingsBucket = buckets?.find(b => b.name === 'session-recordings');
      
      if (!recordingsBucket) {
        // Bucket will be created via SQL migration
        console.log('Recordings bucket not found, please run migration');
      }

      const { data, error } = await supabase.storage
        .from('session-recordings')
        .upload(fileName, blob, {
          contentType: 'video/webm',
          cacheControl: '3600'
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('session-recordings')
        .getPublicUrl(fileName);

      // Save recording metadata to database
      const { error: dbError } = await supabase
        .from('session_recordings')
        .insert({
          session_id: sessionId,
          recording_url: urlData.publicUrl,
          duration: Math.round(blob.size / 1000), // Rough estimate
          file_size: blob.size
        });

      if (dbError) throw dbError;

      console.log('Recording saved:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error saving recording:', error);
      throw error;
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopLocalMedia();
      stopScreenShare();
      stopRecording();
      
      peerConnectionsRef.current.forEach(({ pc }) => pc.close());
      peerConnectionsRef.current.clear();
      
      wsRef.current?.close();
    };
  }, []);

  return {
    isConnected,
    localStream,
    screenStream,
    remoteStreams,
    isRecording,
    recordedChunks,
    initSignaling,
    startLocalMedia,
    stopLocalMedia,
    startScreenShare,
    stopScreenShare,
    toggleAudio,
    toggleVideo,
    startRecording,
    stopRecording,
    saveRecording,
  };
};
