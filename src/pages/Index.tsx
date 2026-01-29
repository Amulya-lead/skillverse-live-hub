import { Button } from "@/components/ui/button";
import { Search, Sparkles, ArrowRight, Play, Star, ChevronRight, Zap, MonitorPlay, Layers, Cpu, Palette, BarChart3, Globe2, Rocket, Award, Lightbulb, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CourseCard from "@/components/CourseCard";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  instructor: string;
  instructor_details?: {
    full_name: string;
    avatar_url: string;
  };
  image_url: string;
  level: string;
  students_count: number;
  booking_type?: string;
}

const HYPE_PHRASES = [
  { title: "Redefine Your Reality", subtitle: "Don't just watch the future happen. Build it." },
  { title: "Ignite Your Potential", subtitle: "The skills you need. The mentorship you deserve." },
  { title: "Master The Craft", subtitle: "From zero to expert. Your journey begins here." },
  { title: "Elevate Your Career", subtitle: "Join the top 1% of creators and developers." },
  { title: "Create What's Next", subtitle: "Turn your ideas into tangible, world-changing projects." }
];

const Index = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [featuredCourse, setFeaturedCourse] = useState<Course | null>(null);
  const [hype, setHype] = useState(HYPE_PHRASES[0]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch up to 20 published courses to get a good pool for random selection
        const { data: popularData, error: popularError } = await supabase
          .from('courses')
          .select(`
            *,
            instructor_details:instructor_id(full_name, avatar_url)
          `)
          .eq('status', 'published')
          .limit(20);

        if (popularError) throw popularError;

        if (popularData && popularData.length > 0) {
          const allCourses = popularData as unknown as Course[];
          setCourses(allCourses);

          // 1. Pick a RANDOM course for the featured spot
          const randomIndex = Math.floor(Math.random() * allCourses.length);
          const randomCourse = allCourses[randomIndex];
          setFeaturedCourse(randomCourse);

          // 2. Pick a RANDOM hype phrase
          const randomHype = HYPE_PHRASES[Math.floor(Math.random() * HYPE_PHRASES.length)];
          setHype(randomHype);
        } else {
          setCourses([]);
        }

      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${searchQuery}`);
    }
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/courses?category=${category}`);
  };

  const categories = [
    { name: "Development", icon: Cpu, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Design", icon: Palette, color: "text-pink-500", bg: "bg-pink-500/10" },
    { name: "Business", icon: BarChart3, color: "text-purple-500", bg: "bg-purple-500/10" },
    { name: "Marketing", icon: Globe2, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background relative selection:bg-primary/20 overflow-x-hidden font-sans">

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-32 px-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-purple-50/30 to-transparent dark:from-blue-900/20 dark:via-background dark:to-background -z-10" />

        <div className="container mx-auto max-w-5xl text-center relative z-10 animate-fade-in">

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/10 shadow-sm mb-8 hover:scale-105 transition-transform duration-500 cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-sm font-semibold text-muted-foreground">New Live Batches Starting Soon</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground mb-8 leading-[0.95] drop-shadow-sm">
            Limitless Learning <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-text">
              Unbounded Growth
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-2xl mx-auto mb-14 leading-relaxed font-light">
            Dive into high-impact courses designed for the modern era.
            Experience <span className="text-foreground font-medium">cinema-quality</span> lessons and <span className="text-foreground font-medium">real-time</span> mentorship.
          </p>

          <div className="max-w-2xl mx-auto mb-16 relative group z-20">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <form onSubmit={handleSearch} className="relative flex items-center bg-white dark:bg-black/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-full p-2 shadow-2xl shadow-blue-900/5 transition-transform duration-300 hover:-translate-y-1">
              <div className="pl-6 pr-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Find your next passion..."
                className="h-14 flex-1 border-none bg-transparent text-lg placeholder:text-muted-foreground/50 focus-visible:ring-0 px-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="lg" className="h-14 px-8 rounded-full bg-foreground text-background font-bold text-lg hover:bg-foreground/90 transition-all shadow-lg ml-2">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES ROW */}
      <section className="pb-24 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {categories.map((cat, i) => (
              <div
                key={i}
                onClick={() => handleCategoryClick(cat.name)}
                className="flex-1 bg-white dark:bg-card p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-2xl ${cat.bg} ${cat.color} transition-transform duration-500 group-hover:rotate-6`}>
                    <cat.icon className="w-8 h-8" />
                  </div>
                  <div className="p-2 rounded-full bg-gray-50 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                <p className="text-sm text-muted-foreground">Explore Tracks</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC FEATURED SPOTLIGHT */}
      {featuredCourse ? (
        <section className="py-12 bg-black text-white relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/40" />

          <div className="container mx-auto px-4 py-12 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-8 animate-slide-in-right">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs font-bold uppercase tracking-widest text-blue-300">
                <Sparkles className="w-3 h-3" /> Featured Masterclass
              </div>
              <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                {hype.title}
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-white font-medium">
                  In: <span className="text-blue-400">{featuredCourse.title}</span>
                </p>
                <p className="text-xl text-gray-400 max-w-lg leading-relaxed line-clamp-3 font-light">
                  {featuredCourse.description}
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <Link to={`/course/${featuredCourse.id}`}>
                  <Button className="h-16 px-10 rounded-full bg-white text-black hover:bg-blue-50 hover:text-blue-900 font-bold text-lg shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)] transition-all hover:scale-105">
                    Start Watching Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 relative w-full max-w-xl aspect-video md:aspect-square group cursor-pointer">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[3rem] blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" />

              <div className="relative h-full w-full bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-500">
                <img src={featuredCourse.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80'} alt="Course Cover" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-black transition-all duration-300">
                      <Play className="fill-current w-8 h-8 ml-1" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">{featuredCourse.instructor_details?.full_name || featuredCourse.instructor}</div>
                      <div className="text-sm font-medium text-blue-300 uppercase tracking-wider">Instructor</div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-8 right-8">
                  <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-sm font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live Now
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Fallback if No Courses Exist */
        <section className="py-12 bg-black text-white relative overflow-hidden">
          <div className="container mx-auto px-4 py-12 text-center relative z-10">
            <h2 className="text-4xl font-bold mb-4">Launch Your First Course</h2>
            <p className="text-gray-400 mb-8">Be the first to feature on this platform.</p>
            <Link to="/create-course">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black">Create Course</Button>
            </Link>
          </div>
        </section>
      )}

      {/* 4. POPULAR COURSES */}
      <section className="py-32 bg-background relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 flex items-center gap-3">
                Trending Now <TrendingUp className="w-8 h-8 text-blue-500" />
              </h2>
              <p className="text-xl text-muted-foreground">Curated top-tier content for you.</p>
            </div>
            <Link to="/courses">
              <Button variant="ghost" className="text-xl font-semibold hover:bg-transparent hover:text-primary group px-0">
                Explore All <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>

          {!loading && courses.length === 0 ? (
            <div className="text-center py-20 bg-muted/10 rounded-[3rem] border border-dashed border-muted">
              <div className="inline-flex h-20 w-20 bg-muted/20 rounded-full items-center justify-center mb-6">
                <Rocket className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-muted-foreground mb-2">No courses found yet.</h3>
              <p className="text-muted-foreground/60 mb-8">The database has been reset. Create a course to see it here.</p>
              <Link to="/create-course">
                <Button className="rounded-full px-8">Launch a Course</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {loading ? [1, 2, 3, 4].map(i => (
                <div key={i} className="h-[400px] bg-muted/20 rounded-[2rem] animate-pulse" />
              )) : courses.map((course) => (
                <div key={course.id} className="group hover:-translate-y-2 transition-all duration-500">
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    duration={course.duration}
                    price={`₹${course.price}`}
                    instructor={course.instructor_details?.full_name || course.instructor}
                    image={course.image_url}
                    level={course.level}
                    students={course.students_count}
                    bookingType={course.booking_type}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. EXPERIENCE */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-gradient-to-br from-black to-slate-900 text-white rounded-[3rem] p-12 md:p-24 relative overflow-hidden shadow-2xl border border-white/10">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] -mr-32 -mt-32 animate-pulse-slow" />

            <div className="relative z-10 text-center space-y-10">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter">
                Experience the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Flow State.</span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
                A platform built for focus. No clutter, no distractions.
                Just you and the skills you want to master.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 text-left">
                {[
                  { icon: MonitorPlay, title: "4K Streaming", desc: "Crystal clear video quality with adaptive bitrate.", color: "text-blue-400" },
                  { icon: Layers, title: "Interactive Labs", desc: "Practice coding and design directly in your browser.", color: "text-purple-400" },
                  { icon: Zap, title: "Instant Feedback", desc: "AI-powered quizzes and real-time mentor chat.", color: "text-yellow-400" }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors group">
                    <item.icon className={`w-10 h-10 ${item.color} mb-6 group-hover:scale-110 transition-transform`} />
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="py-20 border-t border-border/40">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="h-12 w-12 bg-foreground rounded-2xl flex items-center justify-center text-background font-bold text-2xl">
              S
            </div>
            <h2 className="text-2xl font-bold tracking-tight">SkillVerse</h2>
            <div className="flex gap-8 text-muted-foreground font-medium">
              <Link to="/courses" className="hover:text-foreground transition-colors">Browse</Link>
              <Link to="/become-instructor" className="hover:text-foreground transition-colors">Teach</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Support</Link>
            </div>
            <p className="text-sm text-muted-foreground/50 mt-8">
              © 2026 SkillVerse. Built for the bold.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Index;
