import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
    PlayCircle, FileText, CheckCircle2, Lock, Menu,
    ChevronLeft, ChevronRight, ArrowLeft, Loader2, StickyNote, HelpCircle,
    Maximize2, Volume2
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface ContentItem {
    id: string;
    title: string;
    type: 'video' | 'pdf' | 'assignment' | 'quiz' | 'note';
    duration?: number;
    content_url?: string;
    description?: string;
    is_free_preview?: boolean;
}

interface Module {
    id: string;
    title: string;
    description?: string;
    items: ContentItem[];
}

const CoursePlayer = () => {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [modules, setModules] = useState<Module[]>([]);
    const [activeItem, setActiveItem] = useState<ContentItem | null>(null);
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For desktop toggle? simplified for now
    const [courseTitle, setCourseTitle] = useState("");

    useEffect(() => {
        const fetchCourseContent = async () => {
            if (!id) return;

            try {
                // Fetch Course Title
                const { data: courseData } = await supabase
                    .from('courses')
                    .select('title')
                    .eq('id', id)
                    .single();

                if (courseData) setCourseTitle(courseData.title);

                // Fetch Modules and Items
                const { data: modulesData, error: modulesError } = await supabase
                    .from('course_modules')
                    .select(`
            id, title, description, order_index,
            items:course_content_items(
              id, title, type, duration, content_url, description, order_index, is_free_preview
            )
          `)
                    .eq('course_id', id)
                    .order('order_index');

                if (modulesError) throw modulesError;

                if (modulesData) {
                    const formattedModules = modulesData.map(m => ({
                        id: m.id,
                        title: m.title,
                        description: m.description || "",
                        items: (m.items as any[]).sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                    }));

                    setModules(formattedModules);

                    // Determine active item from URL or default to first
                    const itemId = searchParams.get('itemId');
                    const moduleId = searchParams.get('moduleId');

                    if (itemId && moduleId) {
                        const module = formattedModules.find(m => m.id === moduleId);
                        const item = module?.items.find(i => i.id === itemId);
                        if (module && item) {
                            setActiveItem(item);
                            setActiveModuleId(module.id);
                        }
                    } else if (formattedModules.length > 0 && formattedModules[0].items.length > 0) {
                        // Default to first item of first module
                        const firstModule = formattedModules[0];
                        const firstItem = firstModule.items[0];
                        setActiveItem(firstItem);
                        setActiveModuleId(firstModule.id);
                        // Update URL without reload
                        setSearchParams({ moduleId: firstModule.id, itemId: firstItem.id }, { replace: true });
                    }
                }
            } catch (error) {
                console.error('Error fetching course content:', error);
                toast({
                    title: "Error",
                    description: "Failed to load course content.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCourseContent();
    }, [id, toast]);

    const handleItemClick = (module: Module, item: ContentItem) => {
        setActiveItem(item);
        setActiveModuleId(module.id);
        setSearchParams({ moduleId: module.id, itemId: item.id });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    // Sidebar Component (Reusable for mobile/desktop)
    const SidebarContent = () => (
        <div className="h-full flex flex-col bg-background/95 backdrop-blur-xl border-r border-border/40">
            <div className="p-4 border-b border-border/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    Course Layout
                </div>
                <h2 className="font-bold text-lg leading-tight line-clamp-2">{courseTitle}</h2>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                {modules.map((module, mIndex) => (
                    <div key={module.id} className="animate-fade-in" style={{ animationDelay: `${mIndex * 0.1}s` }}>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                            Module {mIndex + 1}: {module.title}
                        </h3>
                        <div className="space-y-1">
                            {module.items.map((item, iIndex) => {
                                const isActive = activeItem?.id === item.id;
                                const Icon = item.type === 'video' ? PlayCircle :
                                    item.type === 'pdf' ? FileText :
                                        item.type === 'assignment' ? StickyNote : HelpCircle;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleItemClick(module, item)}
                                        className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                      ${isActive
                                                ? 'bg-primary/10 text-primary font-medium ring-1 ring-primary/20 shadow-sm'
                                                : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                                            }
                    `}
                                    >
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md" />}

                                        <Icon className={`h-5 w-5 shrink-0 mt-0.5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />

                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm truncate">{item.title}</div>
                                            <div className="text-xs opacity-60 mt-0.5 flex items-center gap-2">
                                                <span>{item.type}</span>
                                                {item.duration && <span>• {Math.round(item.duration / 60)}m</span>}
                                            </div>
                                        </div>

                                        {/* Mock Status Indicator */}
                                        {/* In a real app, check 'completed' status */}
                                        <div className={`w-4 h-4 rounded-full border border-current flex items-center justify-center opacity-30 ${isActive ? 'opacity-100' : ''}`}>
                                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-border/40 bg-black/5">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate(`/course/${id}`)}>
                    <ArrowLeft className="h-4 w-4" /> Back to Course
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-foreground flex overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-80 h-screen sticky top-0 shrink-0">
                <SidebarContent />
            </div>

            {/* Mobile Header & Sidebar Trigger */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40 p-4 flex items-center justify-between">
                <span className="font-bold truncate max-w-[200px]">{courseTitle}</span>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-80 bg-background border-r border-border/40">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto relative pt-16 lg:pt-0">
                {/* Cinematic Background Glow */}
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent pointer-events-none opacity-40" />

                <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full relative z-10 flex-1 flex flex-col">

                    {/* Breadcrumbs / Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                                {activeItem?.title || "Select a lesson"}
                            </h2>
                            <p className="text-muted-foreground mt-1 text-lg">
                                Module: {modules.find(m => m.id === activeModuleId)?.title}
                            </p>
                        </div>
                        {/* Navigation Buttons (Mock) */}
                        <div className="hidden md:flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2 glass-button">
                                <ChevronLeft className="h-4 w-4" /> Previous
                            </Button>
                            <Button variant="gradient" size="sm" className="gap-2">
                                Next Lesson <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Video Player Container */}
                    <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group mb-8">
                        {activeItem?.content_url ? (
                            itemTypeIsVideo(activeItem.type) ? (
                                <iframe
                                    src={activeItem.content_url.replace("watch?v=", "embed/")}
                                    className="w-full h-full"
                                    title={activeItem.title}
                                    allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center bg-zinc-900/50">
                                    <FileText className="h-24 w-24 text-muted-foreground mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold mb-2">Non-Video Content</h3>
                                    <p className="text-muted-foreground mb-6 max-w-md">
                                        This lesson contains {activeItem.type} material.
                                    </p>
                                    <Button asChild variant="default" className="gap-2">
                                        <a href={activeItem.content_url} target="_blank" rel="noopener noreferrer">
                                            Open Resource <Maximize2 className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            )
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-zinc-900">
                                <p>Select a content item from the sidebar to start learning.</p>
                            </div>
                        )}
                    </div>

                    {/* Content Description & Tabs */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h3 className="text-xl font-bold mb-3">About this lesson</h3>
                                <Separator className="mb-4 bg-white/10" />
                                <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                                    <p>{activeItem?.description || "No description available for this lesson."}</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                            <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5">
                                <h4 className="font-bold flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    Lesson Progress
                                </h4>
                                <div className="w-full bg-secondary/30 h-2 rounded-full mb-2 overflow-hidden">
                                    <div className="bg-success h-full w-0 transition-all duration-1000" style={{ width: '0%' }} />
                                </div>
                                <p className="text-xs text-muted-foreground">0% Completed</p>

                                <Button className="w-full mt-6" variant="outline">
                                    Mark as Complete
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="h-20" /> {/* Bottom spacer */}
            </div>
        </div>
    );
};

const itemTypeIsVideo = (type: string) => {
    return type === 'video' || type === 'video_url'; // Robust check
};

export default CoursePlayer;
