import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Award, Globe, Zap, Video, BookOpen, Smartphone, Phone, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
        <div className="min-h-screen bg-background relative selection:bg-primary/20">
            {/* Hero Section */}
            <div className="pt-24 pb-12 px-4 text-center container mx-auto mb-12">
                <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                    Teach Freely. Earn Fully.
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                    Join the world's premium learning ecosystem. We give you the tools, you keep the ownership.
                </p>
            </div>

            {/* WHY CHOOSE SKILL VERSE */}
            <section className="py-12 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                                <CheckCircle className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Premium Ecosystem</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                A high-quality platform designed for serious educators. Elevate your teaching brand.
                            </p>
                        </div>

                        <div className="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 bg-primary/5 border-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16" />
                            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary">
                                <Award className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Full Ownership</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Your content remains your intellectual property. We never claim rights over your hard work.
                            </p>
                        </div>

                        <div className="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 text-green-500">
                                <Globe className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Global Reach</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Connect with students from around the world. Break geographical barriers instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TEACH YOUR WAY */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold">Teach Your Way</h2>
                            <p className="text-xl text-muted-foreground">Flexible options to suit your teaching style.</p>

                            <div className="space-y-6">
                                {[
                                    { icon: Video, title: "Live Classes", desc: "Interactive real-time sessions with students." },
                                    { icon: BookOpen, title: "Recorded Courses", desc: "Self-paced video lessons accessible anytime." },
                                    { icon: Smartphone, title: "Hybrid Model", desc: "Combine live and recorded content for impact." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start p-4 rounded-xl hover:bg-white/5 transition-colors">
                                        <div className="mt-1 bg-primary/10 p-2.5 rounded-lg text-primary">
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{item.title}</h3>
                                            <p className="text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-square md:aspect-[4/3]">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10" />
                                <img
                                    src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80"
                                    alt="Teaching"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-24 bg-gradient-to-b from-background to-secondary/5">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent border-t border-dashed border-white/20" />

                        {[
                            { step: "01", title: "Create Profile", desc: "Sign up below and build your professional profile." },
                            { step: "02", title: "Upload Content", desc: "Publish your courses, live sessions, or workshops." },
                            { step: "03", title: "Monetize", desc: "Set your price. Keep 100% of what you earn." }
                        ].map((item, i) => (
                            <div key={i} className="relative flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-background border-4 border-secondary shadow-xl flex items-center justify-center mb-6 relative z-10 group transition-transform hover:scale-110">
                                    <span className="text-3xl font-black text-primary/50 group-hover:text-primary transition-colors">{item.step}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-muted-foreground max-w-xs">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Signup Form Section */}
            <div id="signup-form" className="py-24 container mx-auto px-4">
                <div className="max-w-2xl mx-auto glass-card p-8 rounded-2xl relative overflow-hidden border border-primary/20 shadow-glow">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 animate-float" />

                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold mb-4">Complete Your Instructor Profile</h2>
                        <p className="text-muted-foreground">
                            Ready to start? Fill in your details below.
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
                            className="w-full text-lg py-6 shadow-lg"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Start Teaching Now"}
                        </Button>
                    </form>
                </div>
            </div>

            {/* FAQ & TERMS */}
            <section className="py-24 container mx-auto px-4 max-w-4xl">
                <h2 className="text-3xl font-bold text-center mb-12">Common Questions</h2>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Is it really free?</AccordionTrigger>
                        <AccordionContent>
                            Yes. No setup fees and no monthly subscription to join as a creator.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>How do I get paid?</AccordionTrigger>
                        <AccordionContent>
                            Payments are transferred directly to your linked bank account.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Can I teach anything?</AccordionTrigger>
                        <AccordionContent>
                            As long as it's legal and educational, yes! From coding to cooking.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>Who owns my content?</AccordionTrigger>
                        <AccordionContent>
                            You retain full ownership of your courses and materials. By uploading, you grant us a license to host and display the content, which you can revoke at any time by removing your course.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    );
};

export default BecomeInstructor;
