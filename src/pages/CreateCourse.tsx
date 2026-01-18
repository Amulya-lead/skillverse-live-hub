import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Check, ChevronRight, BookOpen, Image as ImageIcon, List, DollarSign, Plus, Trash2, Video, FileText, StickyNote, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const STEPS = [
    { number: 1, title: "Basic Info", icon: BookOpen },
    { number: 2, title: "Course Media", icon: ImageIcon },
    { number: 3, title: "Curriculum", icon: List },
    { number: 4, title: "Review", icon: Check },
];

interface ModuleItem {
    title: string;
    type: 'video' | 'pdf' | 'assignment' | 'quiz';
    content_url: string;
    is_free_preview: boolean;
    duration: number; // in minutes
}

interface Module {
    title: string;
    items: ModuleItem[];
}

const CreateCourse = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        duration: "",
        level: "Beginner",
        category: "Development",
        booking_type: "standard", // 'standard' | 'slot_based'
        imageUrl: "",
    });

    // Curriculum State
    const [modules, setModules] = useState<Module[]>([
        { title: "Introduction", items: [] }
    ]);

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(c => c + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(c => c - 1);
    };

    // Curriculum Handlers
    const addModule = () => {
        setModules([...modules, { title: `Module ${modules.length + 1}`, items: [] }]);
    };

    const updateModuleTitle = (index: number, title: string) => {
        const newModules = [...modules];
        newModules[index].title = title;
        setModules(newModules);
    };

    const addItemToModule = (moduleIndex: number) => {
        const newModules = [...modules];
        newModules[moduleIndex].items.push({
            title: "New Lesson",
            type: "video",
            content_url: "",
            is_free_preview: false,
            duration: 10
        });
        setModules(newModules);
    };

    const updateItem = (moduleIndex: number, itemIndex: number, field: keyof ModuleItem, value: any) => {
        const newModules = [...modules];
        newModules[moduleIndex].items[itemIndex] = { ...newModules[moduleIndex].items[itemIndex], [field]: value };
        setModules(newModules);
    };

    const removeItem = (moduleIndex: number, itemIndex: number) => {
        const newModules = [...modules];
        newModules[moduleIndex].items.splice(itemIndex, 1);
        setModules(newModules);
    };

    const removeModule = (index: number) => {
        if (modules.length === 1) return;
        const newModules = [...modules];
        newModules.splice(index, 1);
        setModules(newModules);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Create Course
            const { data: courseData, error: courseError } = await supabase
                .from("courses")
                .insert({
                    instructor_id: user.id,
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    duration: formData.duration,
                    level: formData.level,
                    image_url: formData.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
                    status: 'published',
                    booking_type: formData.booking_type
                })
                .select()
                .single();

            if (courseError) throw courseError;

            // 2. Add Modules & Items
            for (let i = 0; i < modules.length; i++) {
                const module = modules[i];
                const { data: moduleData, error: moduleError } = await supabase
                    .from("course_modules")
                    .insert({
                        course_id: courseData.id,
                        title: module.title,
                        order_index: i
                    })
                    .select()
                    .single();

                if (moduleError) throw moduleError;

                // Add Items
                const itemsToInsert = module.items.map((item, j) => ({
                    module_id: moduleData.id,
                    title: item.title,
                    type: item.type,
                    content_url: item.content_url, // For demo, we assume valid URLs
                    is_free_preview: item.is_free_preview,
                    duration: item.duration * 60, // Convert to seconds
                    order_index: j
                }));

                if (itemsToInsert.length > 0) {
                    const { error: itemsError } = await supabase
                        .from("course_content_items")
                        .insert(itemsToInsert);

                    if (itemsError) throw itemsError;
                }
            }

            toast({ title: "Success!", description: "Course created successfully." });
            navigate("/instructor");
        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-hero pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Link to="/instructor" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>

                {/* Steps Header */}
                <div className="flex justify-between items-center mb-10 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 rounded-full" />
                    <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded-full transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                    />

                    {STEPS.map((step) => {
                        const isActive = currentStep >= step.number;
                        const isCurrent = currentStep === step.number;
                        return (
                            <div key={step.number} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${isActive ? "bg-primary border-primary text-white shadow-glow" : "bg-background border-white/10 text-muted-foreground"
                                    }`}>
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <span className={`text-xs font-medium uppercase tracking-wider transition-colors ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="glass-card p-8 rounded-3xl animate-fade-in relative overflow-hidden">
                    {/* Background glow for card */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-slide-in-right">
                            <h2 className="text-2xl font-bold mb-6">Course Essentials</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2">
                                    <Label>Course Title</Label>
                                    <Input
                                        placeholder="e.g. Advanced React Patterns"
                                        className="bg-white/5 border-white/10 h-12 text-lg"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        placeholder="What will students learn in this course?"
                                        className="bg-white/5 border-white/10 min-h-[120px]"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Price (₹)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            placeholder="999"
                                            className="bg-white/5 border-white/10 h-11 pl-10"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Duration (approx)</Label>
                                    <Input
                                        placeholder="e.g. 10 Hours"
                                        className="bg-white/5 border-white/10 h-11"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Difficulty Level</Label>
                                    <Select value={formData.level} onValueChange={v => setFormData({ ...formData, level: v })}>
                                        <SelectTrigger className="bg-white/5 border-white/10 h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Booking Type</Label>
                                    <Select value={formData.booking_type} onValueChange={v => setFormData({ ...formData, booking_type: v })}>
                                        <SelectTrigger className="bg-white/5 border-white/10 h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="standard">Standard (Video Course)</SelectItem>
                                            <SelectItem value="slot_based">Live Classes (Slots)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Media */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-slide-in-right">
                            <h2 className="text-2xl font-bold mb-6">Course Media</h2>
                            <div className="space-y-4">
                                <Label>Cover Image URL</Label>
                                <Input
                                    placeholder="https://..."
                                    className="bg-white/5 border-white/10"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                />
                                <div className="aspect-video rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-muted-foreground p-8">
                                            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>Enter an image URL to see a preview</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Tip: Use a high-quality 16:9 image (1920x1080) for the best look on the course card.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Curriculum Builder */}
                    {currentStep === 3 && (
                        <div className="space-y-6 animate-slide-in-right">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Curriculum</h2>
                                <Button variant="outline" size="sm" onClick={addModule} className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Module
                                </Button>
                            </div>

                            {modules.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                                    <List className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                                    <p className="text-muted-foreground">No modules yet. Add one to start building your course.</p>
                                </div>
                            )}

                            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {modules.map((module, mIndex) => (
                                    <Card key={mIndex} className="bg-white/5 border-white/10 overflow-hidden">
                                        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-3">
                                            <div className="font-bold text-muted-foreground">#{mIndex + 1}</div>
                                            <Input
                                                value={module.title}
                                                onChange={(e) => updateModuleTitle(mIndex, e.target.value)}
                                                className="h-8 bg-transparent border-transparent hover:bg-white/5 focus:bg-black/20 font-semibold"
                                                placeholder="Module Title"
                                            />
                                            <div className="ml-auto flex items-center gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => removeModule(mIndex)} className="text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardContent className="p-4 space-y-3">
                                            {module.items.map((item, iIndex) => (
                                                <div key={iIndex} className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg bg-black/20 border border-white/5 group">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <Select value={item.type} onValueChange={(v: any) => updateItem(mIndex, iIndex, 'type', v)}>
                                                            <SelectTrigger className="w-[110px] h-8 bg-white/5 border-white/10 text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="video">Video</SelectItem>
                                                                <SelectItem value="pdf">PDF</SelectItem>
                                                                <SelectItem value="assignment">Task</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Input
                                                            value={item.title}
                                                            onChange={(e) => updateItem(mIndex, iIndex, 'title', e.target.value)}
                                                            className="h-8 bg-transparent border-transparent hover:bg-white/5 focus:bg-black/20 text-sm flex-1"
                                                            placeholder="Lesson Title"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={item.content_url}
                                                            onChange={(e) => updateItem(mIndex, iIndex, 'content_url', e.target.value)}
                                                            className="h-8 bg-white/5 border-white/10 text-xs w-full sm:w-48"
                                                            placeholder="Content URL (YouTube/PDF)"
                                                        />
                                                        <div className="flex items-center gap-1 bg-white/5 rounded px-2 h-8" title="Duration (mins)">
                                                            <span className="text-xs text-muted-foreground">min</span>
                                                            <Input
                                                                type="number"
                                                                value={item.duration}
                                                                onChange={(e) => updateItem(mIndex, iIndex, 'duration', parseInt(e.target.value))}
                                                                className="h-6 w-12 bg-transparent border-0 text-right p-0"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2" title="Free Preview?">
                                                            <Switch
                                                                checked={item.is_free_preview}
                                                                onCheckedChange={(checked) => updateItem(mIndex, iIndex, 'is_free_preview', checked)}
                                                            />
                                                            <span className="text-xs text-muted-foreground hidden sm:inline">Preview</span>
                                                        </div>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(mIndex, iIndex)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            <Button variant="outline" size="sm" className="w-full border-dashed border-white/20 hover:border-primary/50 text-muted-foreground hover:text-primary" onClick={() => addItemToModule(mIndex)}>
                                                <Plus className="h-4 w-4 mr-2" /> Add Lesson
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {currentStep === 4 && (
                        <div className="space-y-8 animate-slide-in-right">
                            <h2 className="text-2xl font-bold text-center">Ready to Publish?</h2>

                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-1/3 aspect-video rounded-xl bg-black overflow-hidden">
                                        {formData.imageUrl && <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Course" />}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h3 className="text-2xl font-bold">{formData.title || "Untitled Course"}</h3>
                                            <p className="text-muted-foreground">{formData.description || "No description provided."}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">{formData.level}</Badge>
                                            <Badge variant="outline">{formData.booking_type === 'standard' ? 'Standard Course' : 'Live Sessions'}</Badge>
                                            <Badge className="bg-primary text-white">₹{formData.price}</Badge>
                                        </div>
                                        <div className="pt-4 border-t border-white/10">
                                            <div className="text-sm text-muted-foreground">
                                                Includes {modules.length} modules and {modules.reduce((acc, m) => acc + m.items.length, 0)} lessons.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                        {currentStep > 1 ? (
                            <Button variant="outline" onClick={handleBack} size="lg">
                                Back
                            </Button>
                        ) : (
                            <div />
                        )}

                        <div className="flex gap-3">
                            {currentStep < 4 ? (
                                <Button onClick={handleNext} size="lg" className="shadow-lg hover:shadow-glow px-8">
                                    Next Step <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} size="lg" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white shadow-glow px-8">
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2 h-4 w-4" />}
                                    Publish Course
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;
