import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  MessageSquare, 
  Users, 
  FileText,
  Code,
  Send,
  Settings,
  Loader2,
  Bot,
  Play,
  Sparkles
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

interface SessionParticipant {
  id: string;
  user_id: string;
  audio_enabled: boolean;
  video_enabled: boolean;
  status: string;
}

interface LiveSessionData {
  id: string;
  title: string;
  instructor_id: string;
  status: string;
  chat_enabled: boolean;
  current_participants: number;
}

interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const LiveSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<LiveSessionData | null>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [message, setMessage] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [codeOutput, setCodeOutput] = useState("");
  const [notes, setNotes] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("java");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeContent, setCodeContent] = useState(`public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
    
    int sum = 0;
    for (int i = 1; i <= 10; i++) {
      sum += i;
    }
    System.out.println("Sum of 1 to 10: " + sum);
  }
}`);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  
  // AI Chatbot states
  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>([
    { role: 'assistant', content: 'Hi! I\'m your AI tutor. Ask me anything about programming, and I\'ll help you understand! 🚀' }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [userSettings, setUserSettings] = useState({
    defaultAudioEnabled: true,
    defaultVideoEnabled: true,
    notificationsEnabled: true,
  });

  // Initialize camera and microphone
  useEffect(() => {
    const initMedia = async () => {
      try {
        console.log("Requesting media access...");
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: "user" },
          audio: true
        });
        
        console.log("Media stream obtained:", mediaStream.getTracks());
        setStream(mediaStream);
        
        // Immediately connect to video element
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded");
            videoRef.current?.play().catch(e => console.error("Play error:", e));
          };
        }

        toast({
          title: "Camera & Microphone Connected",
          description: "Your devices are ready for the session",
        });
      } catch (error) {
        console.error("Media access error:", error);
        toast({
          title: "Media Access Denied",
          description: "Please allow camera and microphone access to join the session",
          variant: "destructive",
        });
      }
    };

    initMedia();

    return () => {
      // Cleanup handled in separate effect
    };
  }, []);

  // Reconnect stream to video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log("Connecting stream to video element");
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(console.error);
      };
    }
  }, [stream]);

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        setCurrentUserId(user.id);

        const { data: sessionData, error: sessionError } = await supabase
          .from("live_sessions")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (sessionError || !sessionData) {
          toast({
            title: "Error",
            description: "Session not found",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setSession(sessionData);
        setIsInstructor(sessionData.instructor_id === user.id);

        const { error: participantError } = await supabase
          .from("session_participants")
          .upsert({
            session_id: id,
            user_id: user.id,
            status: "active",
            audio_enabled: userSettings.defaultAudioEnabled,
            video_enabled: userSettings.defaultVideoEnabled,
          });

        if (participantError) {
          console.error("Error joining session:", participantError);
        }

        const { data: notesData } = await supabase
          .from("session_notes")
          .select("content")
          .eq("session_id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (notesData) {
          setNotes(notesData.content || "");
        }

        await loadChatMessages();
        await loadParticipants();
        setLoading(false);
      } catch (error) {
        console.error("Error initializing session:", error);
        setLoading(false);
      }
    };

    initSession();

    const chatChannel = supabase
      .channel(`chat:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `session_id=eq.${id}`,
        },
        () => {
          loadChatMessages();
        }
      )
      .subscribe();

    const participantsChannel = supabase
      .channel(`participants:${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_participants",
          filter: `session_id=eq.${id}`,
        },
        () => {
          loadParticipants();
        }
      )
      .subscribe();

    return () => {
      chatChannel.unsubscribe();
      participantsChannel.unsubscribe();
    };
  }, [id]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (currentUserId && id) {
        supabase
          .from("session_participants")
          .update({ status: "left", left_at: new Date().toISOString() })
          .eq("session_id", id)
          .eq("user_id", currentUserId)
          .then();
      }
    };
  }, [stream, currentUserId, id]);

  // Auto-save notes every 5 seconds
  useEffect(() => {
    if (!currentUserId || !id || !notes) return;

    const saveNotes = setTimeout(async () => {
      await supabase
        .from("session_notes")
        .upsert({
          session_id: id,
          user_id: currentUserId,
          content: notes,
        });
    }, 5000);

    return () => clearTimeout(saveNotes);
  }, [notes, currentUserId, id]);

  const loadChatMessages = async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      const userIds = [...new Set(data.map(msg => msg.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profilesMap = new Map(
        profilesData?.map(p => [p.id, p.full_name]) || []
      );

      const messagesWithProfiles = data.map(msg => ({
        ...msg,
        profiles: { full_name: profilesMap.get(msg.user_id) || "Anonymous" }
      }));

      setChatMessages(messagesWithProfiles);
    }
  };

  const loadParticipants = async () => {
    const { data, error } = await supabase
      .from("session_participants")
      .select("*")
      .eq("session_id", id)
      .eq("status", "active");

    if (!error && data) {
      setParticipants(data);
      setParticipantCount(data.length);
    }
  };

  const toggleMute = async () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      
      await supabase
        .from("session_participants")
        .update({ audio_enabled: !newMutedState })
        .eq("session_id", id)
        .eq("user_id", currentUserId);

      toast({
        title: newMutedState ? "Microphone Off" : "Microphone On",
      });
    }
  };

  const toggleVideo = async () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      const newVideoState = !isVideoOff;
      setIsVideoOff(newVideoState);
      
      await supabase
        .from("session_participants")
        .update({ video_enabled: !newVideoState })
        .eq("session_id", id)
        .eq("user_id", currentUserId);

      toast({
        title: newVideoState ? "Camera Off" : "Camera On",
      });
    }
  };

  const handleLeaveSession = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    await supabase
      .from("session_participants")
      .update({ status: "left", left_at: new Date().toISOString() })
      .eq("session_id", id)
      .eq("user_id", currentUserId);

    toast({
      title: "Session Ended",
      description: "You have left the session",
    });
    navigate("/dashboard");
  };

  const handleRunCode = async () => {
    setIsRunningCode(true);
    setCodeOutput("Running...");
    
    try {
      const { data, error } = await supabase.functions.invoke('run-code', {
        body: { code: codeContent, language: codeLanguage }
      });

      if (error) throw error;
      
      setCodeOutput(data.output || "No output");
      
      // Save code snippet
      await supabase.from("code_snippets").insert({
        session_id: id,
        user_id: currentUserId,
        code: codeContent,
        language: codeLanguage,
        output: data.output,
      });

      toast({
        title: "Code Executed",
        description: "Check the output below",
      });
    } catch (error) {
      console.error("Code execution error:", error);
      setCodeOutput("Error executing code. Please try again.");
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !session?.chat_enabled) return;

    const { error } = await supabase
      .from("chat_messages")
      .insert({
        session_id: id,
        user_id: currentUserId,
        message: message.trim(),
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } else {
      setMessage("");
    }
  };

  const handleAskAI = async () => {
    if (!aiInput.trim()) return;
    
    const userMessage = aiInput.trim();
    setAiInput("");
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsAiLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: { 
          message: userMessage, 
          context: session?.title || 'Programming session'
        }
      });

      if (error) throw error;
      
      setAiMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error("AI error:", error);
      setAiMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting. Please try again in a moment." 
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    await supabase
      .from("user_settings")
      .upsert({
        user_id: currentUserId,
        default_audio_enabled: userSettings.defaultAudioEnabled,
        default_video_enabled: userSettings.defaultVideoEnabled,
        notifications_enabled: userSettings.notificationsEnabled,
      });

    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated",
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Joining session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Session not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-card/80 backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg">{session.title}</h1>
          <Badge className="bg-destructive text-destructive-foreground animate-pulse">
            ● {session.status.toUpperCase()}
          </Badge>
          {isInstructor && (
            <Badge variant="secondary">Instructor</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
            <Users className="h-4 w-4" />
            <span>{participantCount} participants</span>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Session Settings</DialogTitle>
                <DialogDescription>
                  Configure your session preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="audio">Default Audio On</Label>
                  <Switch
                    id="audio"
                    checked={userSettings.defaultAudioEnabled}
                    onCheckedChange={(checked) =>
                      setUserSettings({ ...userSettings, defaultAudioEnabled: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="video">Default Video On</Label>
                  <Switch
                    id="video"
                    checked={userSettings.defaultVideoEnabled}
                    onCheckedChange={(checked) =>
                      setUserSettings({ ...userSettings, defaultVideoEnabled: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Notifications</Label>
                  <Switch
                    id="notifications"
                    checked={userSettings.notificationsEnabled}
                    onCheckedChange={(checked) =>
                      setUserSettings({ ...userSettings, notificationsEnabled: checked })
                    }
                  />
                </div>
                <Button onClick={handleSaveSettings} className="w-full">
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="destructive" size="sm" onClick={handleLeaveSession}>
            Leave Session
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden">
        {/* Left Column - Video + Notes */}
        <div className="col-span-5 space-y-4 flex flex-col">
          {/* Main Video Area */}
          <Card className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-primary/20">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <VideoOff className="h-12 w-12 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Camera Off</p>
                </div>
              </div>
            )}
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/90 backdrop-blur rounded-full px-4 py-2 shadow-lg border border-border">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button
                variant={isVideoOff ? "destructive" : "secondary"}
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={toggleVideo}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
            </div>

            {/* Live indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-3 py-1 rounded-full text-xs font-medium">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          </Card>

          {/* Notepad */}
          <Card className="flex-1 p-4 flex flex-col bg-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Session Notes
                <Badge variant="outline" className="text-xs">Auto-saved</Badge>
              </h3>
            </div>
            <Textarea 
              placeholder="Take notes during the session..."
              className="flex-1 resize-none border-0 focus-visible:ring-0 bg-muted/30"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Card>
        </div>

        {/* Middle Column - Code Editor */}
        <div className="col-span-4 flex flex-col">
          <Card className="flex-1 p-4 flex flex-col bg-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Code className="h-4 w-4 text-accent" />
                Code Editor
              </h3>
              <div className="flex items-center gap-2">
                <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="c++">C++</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="h-8 px-3 gap-1"
                  onClick={handleRunCode}
                  disabled={isRunningCode}
                >
                  {isRunningCode ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                  Run
                </Button>
              </div>
            </div>
            <Textarea
              className="flex-1 bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm resize-none border border-slate-700 focus-visible:ring-primary"
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              spellCheck={false}
            />
            {codeOutput && (
              <div className="mt-3 bg-slate-900 border border-slate-700 rounded-lg p-4">
                <p className="text-xs font-semibold mb-2 text-primary flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  Output:
                </p>
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{codeOutput}</pre>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - AI Chatbot + Session Chat */}
        <div className="col-span-3 space-y-4 flex flex-col">
          {/* AI Tutor Chatbot */}
          <Card className="flex-1 p-4 flex flex-col bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                AI Tutor
                <Badge className="bg-primary/20 text-primary text-xs">Ask Doubts</Badge>
              </h3>
            </div>
            
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-3">
                {aiMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2 mt-3 pt-3 border-t border-primary/20">
              <Input
                placeholder="Ask your doubt..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                className="flex-1 bg-background/50"
                disabled={isAiLoading}
              />
              <Button 
                size="icon" 
                variant="default" 
                onClick={handleAskAI}
                disabled={isAiLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Session Chat */}
          <Card className="flex-1 p-4 flex flex-col bg-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-accent" />
                Session Chat
              </h3>
              <Badge variant="secondary" className="text-xs">
                {session.chat_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${
                        msg.user_id === session.instructor_id ? 'text-primary' : 'text-foreground'
                      }`}>
                        {msg.profiles?.full_name || "Anonymous"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{msg.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <Input
                placeholder={session.chat_enabled ? "Send a message..." : "Chat disabled"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                disabled={!session.chat_enabled}
              />
              <Button 
                size="icon" 
                variant="default" 
                onClick={handleSendMessage}
                disabled={!session.chat_enabled}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveSession;
