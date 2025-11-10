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
  Loader2
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
  const [codeContent, setCodeContent] = useState(`class Animal {
  public void makeSound() {
    System.out.println("Generic sound");
  }
}

class Dog extends Animal {
  @Override
  public void makeSound() {
    System.out.println("Woof!");
  }
}`);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  
  const [userSettings, setUserSettings] = useState({
    defaultAudioEnabled: true,
    defaultVideoEnabled: true,
    notificationsEnabled: true,
  });

  useEffect(() => {
    const initSession = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        setCurrentUserId(user.id);

        // Fetch session data
        const { data: sessionData, error: sessionError } = await supabase
          .from("live_sessions")
          .select("*")
          .eq("id", id)
          .single();

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

        // Join session as participant
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

        // Load existing notes
        const { data: notesData } = await supabase
          .from("session_notes")
          .select("content")
          .eq("session_id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (notesData) {
          setNotes(notesData.content || "");
        }

        // Load chat messages
        await loadChatMessages();

        // Load participants
        await loadParticipants();

        setLoading(false);
      } catch (error) {
        console.error("Error initializing session:", error);
        setLoading(false);
      }
    };

    initSession();
    
    // Initialize camera and microphone
    const initMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: userSettings.defaultVideoEnabled,
          audio: userSettings.defaultAudioEnabled
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        toast({
          title: "Camera & Microphone Connected",
          description: "Your devices are ready for the session",
        });
      } catch (error) {
        toast({
          title: "Media Access Denied",
          description: "Please allow camera and microphone access",
          variant: "destructive",
        });
      }
    };

    initMedia();

    // Subscribe to real-time chat messages
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

    // Subscribe to participants updates
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
      // Cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      chatChannel.unsubscribe();
      participantsChannel.unsubscribe();
      
      // Mark as left
      if (currentUserId && id) {
        supabase
          .from("session_participants")
          .update({ status: "left", left_at: new Date().toISOString() })
          .eq("session_id", id)
          .eq("user_id", currentUserId)
          .then();
      }
    };
  }, [id]);

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
      // Fetch user profiles separately
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
    setCodeOutput("Woof!\nGeneric sound");
    
    // Save code snippet
    await supabase.from("code_snippets").insert({
      session_id: id,
      user_id: currentUserId,
      code: codeContent,
      language: "java",
      output: "Woof!\nGeneric sound",
    });

    toast({
      title: "Code Executed",
      description: "Check the output below",
    });
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
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
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
        {/* Left Column - Video + Doc + Notepad */}
        <div className="col-span-8 space-y-4 flex flex-col">
          {/* Main Video Area */}
          <Card className="relative aspect-video bg-black flex items-center justify-center flex-shrink-0 overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <VideoOff className="h-12 w-12 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Camera Off</p>
                </div>
              </div>
            )}
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/95 backdrop-blur rounded-full px-4 py-2 shadow-lg">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                className="rounded-full"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                variant={isVideoOff ? "destructive" : "secondary"}
                size="icon"
                className="rounded-full"
                onClick={toggleVideo}
              >
                {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </Button>
            </div>
          </Card>

          {/* Bottom Row - Doc + Notepad */}
          <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
            {/* Doc Area */}
            <Card className="col-span-2 p-3 flex flex-col items-center justify-center bg-muted/30">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground text-center">Course Materials</span>
            </Card>

            {/* Notepad */}
            <Card className="col-span-10 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Session Notes (Auto-saved)
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
        </div>

        {/* Right Column - Code Editor + Chat */}
        <div className="col-span-4 space-y-4 flex flex-col">
          {/* Code Editor */}
          <Card className="flex-1 p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Code className="h-4 w-4" />
                Code Editor
              </h3>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleRunCode}>
                Run Code
              </Button>
            </div>
            <div className="flex-1 flex flex-col gap-2 overflow-auto">
              <Textarea
                className="flex-1 bg-muted/30 rounded-md p-3 font-mono text-xs resize-none"
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
              />
              {codeOutput && (
                <div className="bg-accent/10 border border-accent/20 rounded-md p-3">
                  <p className="text-xs font-semibold mb-1 text-accent">Output:</p>
                  <pre className="text-xs text-foreground">{codeOutput}</pre>
                </div>
              )}
            </div>
          </Card>

          {/* Chat Box */}
          <Card className="flex-1 p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </h3>
              <Badge variant="secondary" className="text-xs">
                {session.chat_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            
            <ScrollArea className="flex-1 pr-4">
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
                placeholder={session.chat_enabled ? "Ask a question..." : "Chat disabled"}
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
