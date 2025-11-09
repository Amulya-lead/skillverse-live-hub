import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  MessageSquare, 
  Users, 
  FileText,
  Code,
  X,
  Send,
  Settings
} from "lucide-react";

const LiveSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [message, setMessage] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [codeOutput, setCodeOutput] = useState("");

  const chatMessages = [
    { id: 1, user: "Rahul Sharma", message: "Welcome everyone! Let's begin", time: "10:00", isInstructor: true },
    { id: 2, user: "Student 1", message: "Hello!", time: "10:01", isInstructor: false },
    { id: 3, user: "Student 2", message: "Can you explain polymorphism again?", time: "10:05", isInstructor: false },
  ];

  useEffect(() => {
    // Initialize camera and microphone
    const initMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
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
          description: "Please allow camera and microphone access to join the session",
          variant: "destructive",
        });
      }
    };

    initMedia();

    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
      toast({
        title: isMuted ? "Microphone On" : "Microphone Off",
      });
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
      toast({
        title: isVideoOff ? "Camera On" : "Camera Off",
      });
    }
  };

  const handleLeaveSession = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    toast({
      title: "Session Ended",
      description: "You have left the session",
    });
    navigate("/dashboard");
  };

  const handleRunCode = () => {
    setCodeOutput("Woof!\nGeneric sound");
    toast({
      title: "Code Executed",
      description: "Check the output below",
    });
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      toast({
        title: "Message Sent",
        description: message,
      });
      setMessage("");
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg">4 Hours of OOPS in Java</h1>
          <Badge className="bg-destructive text-destructive-foreground animate-pulse">
            ● LIVE
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
            <Users className="h-4 w-4" />
            <span>23 participants</span>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="destructive" size="sm" onClick={handleLeaveSession}>
            Leave Session
          </Button>
        </div>
      </div>

      {/* Main Content - Based on your sketch layout */}
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
                  Session Notes
                </h3>
              </div>
              <Textarea 
                placeholder="Take notes during the session..."
                className="flex-1 resize-none border-0 focus-visible:ring-0 bg-muted/30"
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
                <div className="bg-muted/30 rounded-md p-3 font-mono text-xs">
                  <pre className="text-muted-foreground">
{`class Animal {
  public void makeSound() {
    System.out.println("Generic sound");
  }
}

class Dog extends Animal {
  @Override
  public void makeSound() {
    System.out.println("Woof!");
  }
}`}
                  </pre>
                </div>
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
              <Badge variant="secondary" className="text-xs">Live</Badge>
            </div>
            
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${msg.isInstructor ? 'text-primary' : 'text-foreground'}`}>
                        {msg.user}
                      </span>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{msg.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <Input
                placeholder="Ask a question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button size="icon" variant="default" onClick={handleSendMessage}>
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
