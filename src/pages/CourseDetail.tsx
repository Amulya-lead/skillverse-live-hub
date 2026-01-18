import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlayCircle, FileText, HelpCircle, StickyNote, Lock, Unlock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Users, Award, CheckCircle2, Calendar, Loader2, Star, Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CourseDetailData {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  instructor: string;
  level: string;
  students_count: number;
  rating: number;
  offerings: string[];
  perks: string[];
  syllabus: string[];
  booking_type: 'standard' | 'slot_based' | string;
}

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

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [courseContent, setCourseContent] = useState<Module[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;

      try {
        // Fetch course basic info
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();

        if (courseError) throw courseError;

        // Fetch offerings
        const { data: offeringsData, error: offeringsError } = await supabase
          .from('course_offerings')
          .select('offering')
          .eq('course_id', id);

        if (offeringsError) throw offeringsError;

        // Fetch perks
        const { data: perksData, error: perksError } = await supabase
          .from('course_perks')
          .select('perk')
          .eq('course_id', id);

        if (perksError) throw perksError;

        // Fetch syllabus
        const { data: syllabusData, error: syllabusError } = await supabase
          .from('course_syllabus')
          .select('topic')
          .eq('course_id', id)
          .order('order_index');

        if (syllabusError) throw syllabusError;

        setCourse({
          ...courseData,
          offerings: offeringsData.map(o => o.offering),
          perks: perksData.map(p => p.perk),
          syllabus: syllabusData.map(s => s.topic),
        });

        // Check if user is enrolled
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: enrollmentData } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', id)
            .single();

          if (enrollmentData) {
            setIsEnrolled(true);
          }
        }

        // Fetch course content (modules + items) for EVERYONE
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

        if (!modulesError && modulesData) {
          setCourseContent(modulesData.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description || "",
            items: (m.items as any[]).sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          })));
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        toast({
          title: "Error",
          description: "Failed to load course details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <Link to="/courses">
          <Button>Back to Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 font-sans">
      {/* Immersive Header */}
      <div className="relative bg-gradient-hero pt-8 pb-16 lg:pb-24 border-b border-border/40 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        {/* Navbar placeholder feeling */}
        <div className="container mx-auto px-4 mb-8 relative z-10">
          <Link to="/courses">
            <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary px-3 py-1 text-sm font-medium backdrop-blur-sm">
                  {course.level}
                </Badge>
                <div className="flex items-center gap-1 text-sm font-medium text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{course.rating || 4.8}</span>
                  <span className="text-muted-foreground ml-1">({course.students_count} ratings)</span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-foreground">
                {course.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl font-light">
                {course.description}
              </p>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <span className="font-bold text-white text-lg">
                      {course.instructor.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Instructor</div>
                    <div className="font-semibold">{course.instructor}</div>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-10 hidden sm:block" />
                <div className="flex items-center gap-3 hidden sm:flex">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-semibold">{course.duration}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats / Visuals */}
            <div className="hidden lg:grid grid-cols-2 gap-4 animate-scale-in relative">
              <div className="glass-card p-6 rotate-3 hover:rotate-0 transition-transform duration-500 hover:shadow-glow z-10">
                <Users className="h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold">{course.students_count}+</div>
                <div className="text-sm text-muted-foreground">Active Learners</div>
              </div>
              <div className="glass-card p-6 -rotate-2 mt-8 hover:rotate-0 transition-transform duration-500 hover:shadow-glow z-10">
                <Award className="h-8 w-8 text-accent mb-2" />
                <div className="text-2xl font-bold">Certified</div>
                <div className="text-sm text-muted-foreground">Upon Completion</div>
              </div>

              {/* Blur behind stats */}
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full z-0 pointer-events-none opacity-50" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-10 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>

            {/* What We'll Offer */}
            <Card className="glass-card border-0 hover-lift">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  What You'll Get
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {course.offerings.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-background/40 border border-white/10 hover:bg-background/60 transition-colors">
                      <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/80 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Content / Syllabus */}
            <Card className="glass-card border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">
                  {courseContent.length > 0 ? "Course Content" : "Course Syllabus"}
                </h2>

                {courseContent.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {courseContent.map((module, index) => (
                      <AccordionItem key={module.id} value={module.id} className="border border-border/50 rounded-xl px-4 data-[state=open]:bg-primary/5 transition-all duration-300">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex text-left flex-col sm:flex-row sm:items-center gap-2 w-full">
                            <span className="font-semibold text-lg">Module {index + 1}: {module.title}</span>
                            <span className="text-sm text-muted-foreground font-normal ml-auto mr-4 bg-background/50 px-2 py-1 rounded-md border border-border/50">{module.items.length} items</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="space-y-2 pt-2">
                            {module.description && <p className="text-sm text-muted-foreground mb-4 italic">{module.description}</p>}
                            {module.items.map((item) => {
                              const isLocked = !isEnrolled && !item.is_free_preview;

                              return (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    if (!isLocked) {
                                      // Navigate to the shiny new Course Player!
                                      navigate(`/course/${id}/learn?moduleId=${module.id}&itemId=${item.id}`);
                                    }
                                  }}
                                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 group relative
                                    ${isLocked
                                      ? 'opacity-70 bg-muted/30 border-transparent cursor-not-allowed grayscale-[0.5]'
                                      : 'hover:bg-white/40 cursor-pointer border-transparent hover:border-primary/20 hover:shadow-sm bg-background/30'}`}
                                >
                                  <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-transform flex-shrink-0 duration-300 shadow-sm ${!isLocked && 'group-hover:scale-110 group-hover:rotate-3'} ${isLocked ? 'bg-muted text-muted-foreground' : 'bg-gradient-to-br from-white to-secondary text-primary'}`}>
                                    {isLocked ? (
                                      <Lock className="h-4 w-4" />
                                    ) : (
                                      item.type === 'video' ? <PlayCircle className="h-5 w-5" /> :
                                        item.type === 'pdf' ? <FileText className="h-5 w-5" /> :
                                          item.type === 'assignment' ? <StickyNote className="h-5 w-5" /> :
                                            <HelpCircle className="h-5 w-5" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <div className="font-medium text-foreground/90 truncate group-hover:text-primary transition-colors">{item.title}</div>
                                      {!isEnrolled && item.is_free_preview && (
                                        <Badge variant="secondary" className="text-xs py-0 h-5 bg-accent/20 text-accent-foreground border-accent/20 flex-shrink-0 animate-pulse">Free Preview</Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                      <span className="capitalize">{item.type}</span>
                                      {item.duration && <span>• {Math.round(item.duration / 60)} mins</span>}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {!isLocked && item.content_url && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white rounded-full"
                                        asChild
                                        onClick={(e) => e.stopPropagation()} // Prevent double open from parent click
                                      >
                                        <Link to={`/course/${id}/learn?moduleId=${module.id}&itemId=${item.id}`}>
                                          {isEnrolled ? "Open" : "Preview"}
                                        </Link>
                                      </Button>
                                    )}

                                    {isLocked && (
                                      <Lock className="h-4 w-4 text-muted-foreground opacity-50" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="space-y-4">
                    {course.syllabus.map((item, index) => (
                      <div key={index} className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-primary/30 hover:shadow-soft hover:bg-white/5 transition-all duration-300">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-inner">
                          {index + 1}
                        </div>
                        <span className="font-medium text-lg text-foreground/80 group-hover:text-primary transition-colors">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Perks */}
            <Card className="bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border-0 shadow-inner">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-foreground/80">Exclusive Perks</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.perks.map((perk, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Award className="h-4 w-4 text-accent" />
                      </div>
                      <span className="font-medium text-foreground/90">{perk}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="glass-card border-0 overflow-hidden animate-slide-in-right hover:shadow-glow transition-shadow duration-500">
                <div className="h-2 bg-gradient-primary" />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1 font-medium uppercase tracking-wide">Total Price</div>
                      <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-primary">₹{course.price}</div>
                    </div>
                    <div className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse border border-destructive/20">
                      Limited Slots
                    </div>
                  </div>

                  {isEnrolled ? (
                    <div className="mb-6">
                      <Button className="w-full text-lg h-14 font-bold bg-success hover:bg-success/90 text-white shadow-soft" size="lg" disabled>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Already Enrolled
                      </Button>
                      <Link to="/dashboard?tab=courses" className="block mt-4 text-center">
                        <Button variant="outline" className="w-full glass-button">
                          Go to My Courses
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Link to={`/book/${id}`} className="block mb-6">
                      <Button className="w-full text-lg h-14 font-bold shadow-strong hover:shadow-glow hover:scale-[1.02] transition-all duration-300" size="lg" variant="gradient">
                        {course.booking_type === 'slot_based' ? <Calendar className="mr-2 h-5 w-5" /> : <Award className="mr-2 h-5 w-5" />}
                        {course.booking_type === 'slot_based' ? 'Book Live Session' : 'Enroll Now'}
                      </Button>
                    </Link>
                  )}

                  <p className="text-center text-xs text-muted-foreground mb-6">
                    30-day money-back guarantee • Cancel listed anytime
                  </p>

                  <div className="space-y-4 pt-6 border-t border-border/50">
                    <div className="flex justify-between items-center text-sm group hover:bg-white/5 p-2 rounded-lg transition-colors">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" /> Duration
                      </span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm group hover:bg-white/5 p-2 rounded-lg transition-colors">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" /> Enrolled
                      </span>
                      <span className="font-medium">{course.students_count} students</span>
                    </div>
                    <div className="flex justify-between items-center text-sm group hover:bg-white/5 p-2 rounded-lg transition-colors">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-primary" /> Access
                      </span>
                      <span className="font-medium">Lifetime mobile & web</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
