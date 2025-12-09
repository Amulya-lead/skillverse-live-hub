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
import FloatingPanel from "@/components/FloatingPanel";
import ToolToggleBar from "@/components/ToolToggleBar";
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
  Sparkles,
  GraduationCap,
  Zap,
  Monitor,
  MonitorOff,
  Volume2,
  VolumeX
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
  profile?: {
    full_name: string | null;
    email: string | null;
  };
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
  const screenRef = useRef<HTMLVideoElement>(null);
  const viewerVideoRef = useRef<HTMLVideoElement>(null);
  const aiChatRef = useRef<HTMLDivElement>(null);
  const sessionChatRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<LiveSessionData | null>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isViewer, setIsViewer] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [message, setMessage] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
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
  const [instructorProfile, setInstructorProfile] = useState<{ full_name: string | null } | null>(null);
  
  // Floating panel states
  const [showNotes, setShowNotes] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // AI Chatbot states
  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>([
    { role: 'assistant', content: 'Hi! I\'m your AI programming tutor. I can help you with code explanations, debugging, concepts, and best practices. What would you like to learn today?' }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [userSettings, setUserSettings] = useState({
    defaultAudioEnabled: true,
    defaultVideoEnabled: true,
    notificationsEnabled: true,
  });

  // Auto-scroll AI chat
  useEffect(() => {
    if (aiChatRef.current) {
      aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
    }
  }, [aiMessages]);

  // Auto-scroll session chat
  useEffect(() => {
    if (sessionChatRef.current) {
      sessionChatRef.current.scrollTop = sessionChatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Initialize camera and microphone - only for instructors
  useEffect(() => {
    if (loading) return;
    
    if (isViewer) {
      console.log("Viewer mode - setting up to receive instructor stream");
      // For viewers, we simulate receiving instructor's stream
      // In production, this would use WebRTC/mediasoup
      return;
    }
    
    const initMedia = async () => {
      try {
        console.log("Requesting media access for instructor...");
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        
        console.log("Media stream obtained:", mediaStream.getTracks());
        setStream(mediaStream);
        
        setTimeout(() => {
          if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.muted = true;
            videoRef.current.play().catch(e => console.error("Play error:", e));
            console.log("Video connected to element");
          }
        }, 100);

        toast({ title: "Camera & Microphone Connected", description: "Your devices are ready for the session" });
      } catch (error) {
        console.error("Media access error:", error);
        toast({ title: "Media Access Denied", description: "Please allow camera and microphone access", variant: "destructive" });
      }
    };

    initMedia();
  }, [loading, isViewer]);

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

  // Handle screen stream connection
  useEffect(() => {
    if (screenStream && screenRef.current) {
      console.log("Connecting screen stream to element");
      screenRef.current.srcObject = screenStream;
      screenRef.current.onloadedmetadata = () => {
        screenRef.current?.play().catch(console.error);
      };
    }
  }, [screenStream]);

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        setCurrentUserId(user.id);

        // Check if user has admin or instructor role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", ["admin", "instructor"]);

        const hasAdminAccess = roleData && roleData.length > 0;

        // Get session data
        const { data: sessionData, error: sessionError } = await supabase
          .from("live_sessions")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (sessionError || !sessionData) {
          toast({ title: "Error", description: "Session not found", variant: "destructive" });
          navigate("/dashboard");
          return;
        }

        setSession(sessionData);
        
        // Get instructor profile for viewers to see
        const { data: instructorData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", sessionData.instructor_id)
          .maybeSingle();
        
        setInstructorProfile(instructorData);
        
        // Determine role
        const isSessionInstructor = sessionData.instructor_id === user.id || hasAdminAccess;
        setIsInstructor(isSessionInstructor);
        setIsViewer(!isSessionInstructor);

        if (!isSessionInstructor) {
          toast({ title: "Joined as Viewer", description: "You're watching this session as a student" });
        }

        const { error: participantError } = await supabase
          .from("session_participants")
          .upsert({
            session_id: id,
            user_id: user.id,
            status: "active",
            audio_enabled: isSessionInstructor ? userSettings.defaultAudioEnabled : false,
            video_enabled: isSessionInstructor ? userSettings.defaultVideoEnabled : false,
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
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${id}` }, () => {
        loadChatMessages();
      })
      .subscribe();

    const participantsChannel = supabase
      .channel(`participants:${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "session_participants", filter: `session_id=eq.${id}` }, () => {
        loadParticipants();
      })
      .subscribe();

    return () => {
      chatChannel.unsubscribe();
      participantsChannel.unsubscribe();
    };
  }, [id]);

  // Cleanup streams on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
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
  }, [stream, screenStream, currentUserId, id]);

  // Auto-save notes every 5 seconds
  useEffect(() => {
    if (!currentUserId || !id || !notes) return;

    const saveNotes = setTimeout(async () => {
      await supabase.from("session_notes").upsert({
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

      const profilesMap = new Map(profilesData?.map(p => [p.id, p.full_name]) || []);

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
      const userIds = data.map(p => p.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, { full_name: p.full_name, email: p.email }]) || []);

      const participantsWithProfiles = data.map(p => ({
        ...p,
        profile: profilesMap.get(p.user_id) || { full_name: null, email: null }
      }));

      setParticipants(participantsWithProfiles);
      setParticipantCount(data.length);
    }
  };

  const toggleMute = async () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => { track.enabled = !track.enabled; });
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      
      await supabase.from("session_participants").update({ audio_enabled: !newMutedState }).eq("session_id", id).eq("user_id", currentUserId);
      toast({ title: newMutedState ? "Microphone Off" : "Microphone On" });
    }
  };

  const toggleVideo = async () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => { track.enabled = !track.enabled; });
      const newVideoState = !isVideoOff;
      setIsVideoOff(newVideoState);
      
      await supabase.from("session_participants").update({ video_enabled: !newVideoState }).eq("session_id", id).eq("user_id", currentUserId);
      toast({ title: newVideoState ? "Camera Off" : "Camera On" });
    }
  };

  const handleLeaveSession = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }

    await supabase.from("session_participants").update({ status: "left", left_at: new Date().toISOString() }).eq("session_id", id).eq("user_id", currentUserId);

    toast({ title: "Session Ended", description: "You have left the session" });
    navigate("/dashboard");
  };

  // Screen sharing toggle for instructor
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      toast({ title: "Screen Sharing Stopped", description: "Your screen is no longer being shared" });
    } else {
      // Start screen sharing
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        setScreenStream(displayStream);
        setIsScreenSharing(true);
        
        // Handle when user stops sharing via browser controls
        displayStream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
          toast({ title: "Screen Sharing Stopped" });
        };
        
        toast({ title: "Screen Sharing Started", description: "Students can now see your screen/PPT" });
      } catch (error) {
        console.error("Screen share error:", error);
        toast({ title: "Screen Share Failed", description: "Could not start screen sharing", variant: "destructive" });
      }
    }
  };

  // Toggle speaker for viewers
  const toggleSpeaker = () => {
    setIsSpeakerMuted(!isSpeakerMuted);
    if (viewerVideoRef.current) {
      viewerVideoRef.current.muted = !isSpeakerMuted;
    }
    toast({ title: isSpeakerMuted ? "Sound On" : "Sound Muted" });
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
      
      await supabase.from("code_snippets").insert({
        session_id: id,
        user_id: currentUserId,
        code: codeContent,
        language: codeLanguage,
        output: data.output,
      });

      toast({ title: "Code Executed", description: "Check the output below" });
    } catch (error) {
      console.error("Code execution error:", error);
      setCodeOutput("Error executing code. Please try again.");
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !session?.chat_enabled) return;

    const { error } = await supabase.from("chat_messages").insert({
      session_id: id,
      user_id: currentUserId,
      message: message.trim(),
    });

    if (error) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
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
        body: { message: userMessage, context: session?.title || 'Programming session' }
      });

      if (error) throw error;
      
      setAiMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error("AI error:", error);
      setAiMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again in a moment." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    await supabase.from("user_settings").upsert({
      user_id: currentUserId,
      default_audio_enabled: userSettings.defaultAudioEnabled,
      default_video_enabled: userSettings.defaultVideoEnabled,
      notifications_enabled: userSettings.notificationsEnabled,
    });

    toast({ title: "Settings Saved", description: "Your preferences have been updated" });
  };

  // Get students (non-instructors) for instructor view
  const studentParticipants = participants.filter(p => p.user_id !== session?.instructor_id);
  
  // Get instructor for viewer view
  const instructorParticipant = participants.find(p => p.user_id === session?.instructor_id);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
            <div className="absolute inset-0 h-16 w-16 mx-auto rounded-full bg-primary/20 animate-ping" />
          </div>
          <p className="text-muted-foreground animate-pulse">Joining session...</p>
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
    <div className="h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 bg-card/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{session.title}</h1>
              <p className="text-xs text-muted-foreground">Live Session</p>
            </div>
          </div>
          <Badge className="bg-destructive/90 text-destructive-foreground animate-pulse shadow-lg shadow-destructive/30">
            ● LIVE
          </Badge>
          {isInstructor ? (
            <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 shadow-lg">
              <GraduationCap className="h-3 w-3 mr-1" />
              Instructor
            </Badge>
          ) : (
            <Badge variant="outline" className="border-accent/50 text-accent bg-accent/10">
              <Users className="h-3 w-3 mr-1" />
              Viewer
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-medium">{participantCount}</span>
            <span>participants</span>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle>Session Settings</DialogTitle>
                <DialogDescription>Configure your session preferences</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="audio">Default Audio On</Label>
                  <Switch id="audio" checked={userSettings.defaultAudioEnabled} onCheckedChange={(checked) => setUserSettings({ ...userSettings, defaultAudioEnabled: checked })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="video">Default Video On</Label>
                  <Switch id="video" checked={userSettings.defaultVideoEnabled} onCheckedChange={(checked) => setUserSettings({ ...userSettings, defaultVideoEnabled: checked })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Notifications</Label>
                  <Switch id="notifications" checked={userSettings.notificationsEnabled} onCheckedChange={(checked) => setUserSettings({ ...userSettings, notificationsEnabled: checked })} />
                </div>
                <Button onClick={handleSaveSettings} className="w-full">Save Settings</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="destructive" size="sm" onClick={handleLeaveSession} className="rounded-xl shadow-lg shadow-destructive/30">
            Leave Session
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative p-6 overflow-hidden">
        {/* Center Video Area */}
        <div className="flex flex-col lg:flex-row gap-6 h-full max-w-6xl mx-auto">
          {/* Main Video/Screen Area */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Primary Display - Screen Share or Video */}
            <Card className="flex-1 relative bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/20 group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
              
              {isInstructor ? (
                <>
                  {/* Screen Share Display (when sharing) */}
                  {isScreenSharing && screenStream ? (
                    <video
                      ref={screenRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                        style={{ transform: 'scaleX(-1)' }}
                      />
                      {isVideoOff && (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl shadow-primary/30">
                              <VideoOff className="h-14 w-14 text-primary" />
                            </div>
                            <p className="text-white font-medium">Camera Off</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Instructor Controls */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-background/90 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-2xl border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant={isMuted ? "destructive" : "secondary"} size="icon" className="rounded-xl h-12 w-12" onClick={toggleMute} title="Toggle Microphone">
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button variant={isVideoOff ? "destructive" : "secondary"} size="icon" className="rounded-xl h-12 w-12" onClick={toggleVideo} title="Toggle Camera">
                      {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </Button>
                    <div className="w-px h-8 bg-border" />
                    <Button variant={isScreenSharing ? "destructive" : "default"} size="icon" className="rounded-xl h-12 w-12" onClick={toggleScreenShare} title="Share Screen/PPT">
                      {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                    </Button>
                  </div>
                  
                  {/* Small self-view when screen sharing */}
                  {isScreenSharing && !isVideoOff && (
                    <div className="absolute bottom-20 right-4 w-40 h-28 rounded-xl overflow-hidden border-2 border-primary/50 shadow-xl z-30">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                    </div>
                  )}
                </>
              ) : (
                // Viewer sees instructor's stream simulation
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center mx-auto mb-6 ring-4 ring-primary/30 shadow-2xl shadow-primary/30 animate-pulse">
                      <GraduationCap className="h-16 w-16 text-primary" />
                    </div>
                    <p className="text-white font-bold text-xl mb-1">{instructorProfile?.full_name || 'Instructor'}</p>
                    <p className="text-muted-foreground text-sm mb-4">Teaching Live</p>
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-success">
                        <Video className="h-4 w-4" />
                        <span>Video On</span>
                      </div>
                      <div className="flex items-center gap-1 text-success">
                        <Volume2 className="h-4 w-4" />
                        <span>Audio On</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 px-8">
                      Note: Full video streaming requires WebRTC integration. <br />
                      In production, you would see the instructor's live video here.
                    </p>
                  </div>
                  
                  {/* Viewer Speaker Control */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-background/90 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-2xl border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant={isSpeakerMuted ? "destructive" : "secondary"} size="icon" className="rounded-xl h-12 w-12" onClick={toggleSpeaker} title="Toggle Speaker">
                      {isSpeakerMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Live Indicator */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-destructive/40">
                <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
              
              {/* Screen Share Indicator */}
              {isScreenSharing && isInstructor && (
                <div className="absolute top-4 left-28 z-20 flex items-center gap-2 bg-success/90 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-success/40">
                  <Monitor className="h-4 w-4" />
                  Sharing Screen
                </div>
              )}
              
              {/* Role Badge */}
              <div className="absolute top-4 right-4 z-20">
                {isViewer ? (
                  <Badge className="bg-accent/90 text-white border-0 shadow-lg shadow-accent/30">
                    <Users className="h-3 w-3 mr-1" />
                    Viewing
                  </Badge>
                ) : (
                  <Badge className="bg-primary/90 text-white border-0 shadow-lg shadow-primary/30">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Broadcasting
                  </Badge>
                )}
              </div>
            </Card>
          </div>

          {/* Participants Panel */}
          <Card className="w-full lg:w-80 p-4 bg-card/80 backdrop-blur-xl border-border/50 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{isInstructor ? 'Enrolled Students' : 'Session Info'}</h3>
              <Badge variant="secondary" className="ml-auto">{isInstructor ? studentParticipants.length : participantCount}</Badge>
            </div>
            
            <ScrollArea className="h-[calc(100%-3rem)]">
              {isInstructor ? (
                // Instructor sees students
                <div className="space-y-3">
                  {studentParticipants.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No students have joined yet</p>
                    </div>
                  ) : (
                    studentParticipants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-sm font-bold text-primary shadow-lg">
                            {participant.profile?.full_name?.[0]?.toUpperCase() || 'S'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{participant.profile?.full_name || 'Student'}</p>
                            <p className="text-xs text-muted-foreground">{participant.profile?.email || 'No email'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {participant.audio_enabled ? <Mic className="h-4 w-4 text-success" /> : <MicOff className="h-4 w-4 text-muted-foreground" />}
                          {participant.video_enabled ? <Video className="h-4 w-4 text-success" /> : <VideoOff className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                // Viewer sees instructor info
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                        <GraduationCap className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="font-bold">{instructorProfile?.full_name || 'Instructor'}</p>
                        <Badge variant="secondary" className="text-xs">Instructor</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      Currently teaching
                    </div>
                  </div>
                  
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-2">Other viewers in session</p>
                    <p className="text-2xl font-bold text-primary">{studentParticipants.length}</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>

        {/* Tool Toggle Bar */}
        <ToolToggleBar
          showNotes={showNotes}
          showAI={showAI}
          showCode={showCode}
          showChat={showChat}
          onToggleNotes={() => setShowNotes(!showNotes)}
          onToggleAI={() => setShowAI(!showAI)}
          onToggleCode={() => setShowCode(!showCode)}
          onToggleChat={() => setShowChat(!showChat)}
        />

        {/* Floating Panels */}
        <FloatingPanel
          title="Session Notes"
          icon={<FileText className="h-4 w-4" />}
          isOpen={showNotes}
          onClose={() => setShowNotes(false)}
          defaultPosition={{ x: 50, y: 50 }}
          defaultSize={{ width: 350, height: 300 }}
          glowColor="primary"
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-xs">Auto-saved</Badge>
            </div>
            <Textarea
              placeholder="Take notes during the session..."
              className="flex-1 resize-none border-0 focus-visible:ring-0 bg-muted/30"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </FloatingPanel>

        <FloatingPanel
          title="AI Tutor"
          icon={<Bot className="h-4 w-4" />}
          isOpen={showAI}
          onClose={() => setShowAI(false)}
          defaultPosition={{ x: 100, y: 80 }}
          defaultSize={{ width: 400, height: 400 }}
          glowColor="accent"
        >
          <div className="h-full flex flex-col">
            <div className="flex flex-wrap gap-1 mb-2">
              {['Explain code', 'Debug help', 'Best practices'].map((action) => (
                <button key={action} onClick={() => setAiInput(action)} className="text-xs px-2 py-1 rounded-full bg-accent/10 hover:bg-accent/20 text-accent transition-colors">
                  {action}
                </button>
              ))}
            </div>
            
            <div ref={aiChatRef} className="flex-1 overflow-y-auto pr-2 space-y-3">
              {aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-accent text-white rounded-br-sm' 
                      : 'bg-muted border border-border rounded-bl-sm'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted border border-border rounded-xl rounded-bl-sm px-3 py-2 text-sm flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-2 pt-2 border-t border-accent/20">
              <Input
                placeholder="Ask anything..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isAiLoading && handleAskAI()}
                className="flex-1 text-sm"
                disabled={isAiLoading}
              />
              <Button size="icon" onClick={handleAskAI} disabled={isAiLoading || !aiInput.trim()} className="bg-accent hover:bg-accent/90">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </FloatingPanel>

        <FloatingPanel
          title="Code Editor"
          icon={<Code className="h-4 w-4" />}
          isOpen={showCode}
          onClose={() => setShowCode(false)}
          defaultPosition={{ x: 150, y: 60 }}
          defaultSize={{ width: 500, height: 450 }}
          minWidth={400}
          glowColor="success"
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
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
              <Button variant="default" size="sm" className="h-8 px-3 gap-1 bg-success hover:bg-success/90" onClick={handleRunCode} disabled={isRunningCode}>
                {isRunningCode ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                Run
              </Button>
            </div>
            <Textarea
              className="flex-1 bg-slate-900 text-green-400 rounded-lg p-3 font-mono text-sm resize-none border border-slate-700 focus-visible:ring-success"
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              spellCheck={false}
            />
            {codeOutput && (
              <div className="mt-2 bg-slate-900 border border-slate-700 rounded-lg p-3 max-h-24 overflow-y-auto">
                <p className="text-xs font-semibold mb-1 text-success flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Output:
                </p>
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{codeOutput}</pre>
              </div>
            )}
          </div>
        </FloatingPanel>

        <FloatingPanel
          title="Session Chat"
          icon={<MessageSquare className="h-4 w-4" />}
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          defaultPosition={{ x: 200, y: 100 }}
          defaultSize={{ width: 350, height: 350 }}
          glowColor="primary"
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-xs">{session.chat_enabled ? "Enabled" : "Disabled"}</Badge>
            </div>
            
            <div ref={sessionChatRef} className="flex-1 overflow-y-auto pr-2 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${msg.user_id === session.instructor_id ? 'text-primary' : 'text-foreground'}`}>
                      {msg.profiles?.full_name || "Anonymous"}
                      {msg.user_id === session.instructor_id && <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1">Instructor</Badge>}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{msg.message}</p>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-2 pt-2 border-t">
              <Input
                placeholder={session.chat_enabled ? "Send a message..." : "Chat disabled"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 text-sm"
                disabled={!session.chat_enabled}
              />
              <Button size="icon" onClick={handleSendMessage} disabled={!session.chat_enabled}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </FloatingPanel>
      </div>
    </div>
  );
};

export default LiveSession;
