import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const BecomeInstructor = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        fullName: "",
        bio: "",
        avatarUrl: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast({
                    title: "Authentication required",
                    description: "Please login to become an instructor",
                    variant: "destructive",
                });
                navigate("/auth");
                return;
            }

            // Update profile with instructor role
            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    full_name: formData.fullName,
                    bio: formData.bio,
                    avatar_url: formData.avatarUrl,
                    role: "instructor",
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            toast({
                title: "Welcome aboard!",
                description: "You are now an instructor on SkillVerse.",
            });

            navigate("/dashboard");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto glass-card p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 animate-float" />

                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                        Become an Instructor
                    </h1>
                    <p className="text-muted-foreground">
                        Share your expertise with the world. Create content, mentor students, and earn.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                            required
                            placeholder="e.g. John Doe"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="bg-background/50 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Avatar URL</label>
                        <Input
                            placeholder="https://example.com/photo.jpg"
                            value={formData.avatarUrl}
                            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                            className="bg-background/50 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Bio</label>
                        <Textarea
                            required
                            placeholder="Tell students about your experience..."
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="bg-background/50 border-white/10 min-h-[120px]"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full text-lg py-6"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Complete Profile"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default BecomeInstructor;
