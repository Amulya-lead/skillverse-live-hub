import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileText, Bot, Code, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolToggleBarProps {
  showNotes: boolean;
  showAI: boolean;
  showCode: boolean;
  showChat: boolean;
  onToggleNotes: () => void;
  onToggleAI: () => void;
  onToggleCode: () => void;
  onToggleChat: () => void;
}

const ToolToggleBar = ({
  showNotes,
  showAI,
  showCode,
  showChat,
  onToggleNotes,
  onToggleAI,
  onToggleCode,
  onToggleChat,
}: ToolToggleBarProps) => {
  const tools = [
    {
      id: "notes",
      icon: FileText,
      label: "Notes",
      active: showNotes,
      onClick: onToggleNotes,
      color: "primary",
    },
    {
      id: "ai",
      icon: Bot,
      label: "AI Tutor",
      active: showAI,
      onClick: onToggleAI,
      color: "accent",
      badge: "AI",
    },
    {
      id: "code",
      icon: Code,
      label: "Code Editor",
      active: showCode,
      onClick: onToggleCode,
      color: "success",
    },
    {
      id: "chat",
      icon: MessageSquare,
      label: "Session Chat",
      active: showChat,
      onClick: onToggleChat,
      color: "primary",
    },
  ];

  return (
    <TooltipProvider>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
        <div className="bg-card/90 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-border/50">
          <div className="flex flex-col gap-2">
            {tools.map((tool) => (
              <Tooltip key={tool.id} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant={tool.active ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-12 w-12 relative transition-all duration-300 rounded-xl",
                      tool.active && tool.color === "primary" && "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30",
                      tool.active && tool.color === "accent" && "bg-accent hover:bg-accent/90 shadow-lg shadow-accent/30",
                      tool.active && tool.color === "success" && "bg-success hover:bg-success/90 shadow-lg shadow-success/30",
                      !tool.active && "hover:bg-muted/80"
                    )}
                    onClick={tool.onClick}
                  >
                    <tool.icon className={cn(
                      "h-5 w-5",
                      tool.active && "text-white"
                    )} />
                    {tool.badge && (
                      <span className={cn(
                        "absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center",
                        tool.active ? "bg-white text-accent" : "bg-accent text-white"
                      )}>
                        ✨
                      </span>
                    )}
                    {tool.active && (
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-white/80" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="font-medium">
                  <div className="flex items-center gap-2">
                    {tool.label}
                    {tool.active && (
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-32 bg-primary/10 rounded-full blur-2xl" />
      </div>
    </TooltipProvider>
  );
};

export default ToolToggleBar;
