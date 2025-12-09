import { ReactNode, useState } from "react";
import { Rnd } from "react-rnd";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Maximize2, Minimize2, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingPanelProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
  className?: string;
  headerClassName?: string;
  glowColor?: string;
}

const FloatingPanel = ({
  title,
  icon,
  children,
  isOpen,
  onClose,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 400, height: 350 },
  minWidth = 280,
  minHeight = 200,
  className,
  headerClassName,
  glowColor = "primary",
}: FloatingPanelProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [size, setSize] = useState(defaultSize);

  if (!isOpen) return null;

  return (
    <Rnd
      default={{
        x: defaultPosition.x,
        y: defaultPosition.y,
        width: defaultSize.width,
        height: isMinimized ? 48 : defaultSize.height,
      }}
      size={{
        width: size.width,
        height: isMinimized ? 48 : size.height,
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (!isMinimized) {
          setSize({
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          });
        }
      }}
      minWidth={minWidth}
      minHeight={isMinimized ? 48 : minHeight}
      maxWidth={800}
      maxHeight={600}
      bounds="parent"
      dragHandleClassName="drag-handle"
      enableResizing={!isMinimized}
      className="z-50"
    >
      <Card
        className={cn(
          "h-full flex flex-col overflow-hidden transition-all duration-300",
          "bg-card/95 backdrop-blur-xl border-2",
          glowColor === "primary" && "border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.2)]",
          glowColor === "accent" && "border-accent/30 shadow-[0_0_30px_hsl(var(--accent)/0.2)]",
          glowColor === "success" && "border-success/30 shadow-[0_0_30px_hsl(var(--success)/0.2)]",
          className
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "drag-handle flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing",
            "bg-gradient-to-r border-b",
            glowColor === "primary" && "from-primary/10 to-primary/5 border-primary/20",
            glowColor === "accent" && "from-accent/10 to-accent/5 border-accent/20",
            glowColor === "success" && "from-success/10 to-success/5 border-success/20",
            headerClassName
          )}
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="h-4 w-4 text-muted-foreground" />
            <div className={cn(
              "flex items-center gap-2 font-medium text-sm",
              glowColor === "primary" && "text-primary",
              glowColor === "accent" && "text-accent",
              glowColor === "success" && "text-success"
            )}>
              {icon}
              {title}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-muted/50"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="h-3 w-3" />
              ) : (
                <Minimize2 className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-destructive/20 hover:text-destructive"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="flex-1 overflow-hidden p-3">
            {children}
          </div>
        )}
      </Card>
    </Rnd>
  );
};

export default FloatingPanel;
