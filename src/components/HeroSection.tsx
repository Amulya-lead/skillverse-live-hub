import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Navbar */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">FOCSERA</h1>
              <p className="text-xs text-muted-foreground">SkillVerse</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/courses" className="text-sm font-medium hover:text-primary transition-colors">
              Courses
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" variant="gradient">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full">
            <span className="text-sm font-medium text-primary">Hub of Skills Under a Roof 🚀</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Master Skills Through
            <span className="text-primary block mt-2">Live Interactive Learning</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Book live sessions with expert instructors. Learn at your pace with flexible time slots, 
            interactive tools, and instant certificates.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search for courses... (e.g., Java, Photoshop, Web Development)" 
                className="pl-12 h-14 text-base shadow-medium border-0"
              />
            </div>
          </div>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/courses">
              <Button size="lg" variant="gradient" className="text-lg px-8">
                Explore Courses
              </Button>
            </Link>
            <Link to="/request-session">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Request a Session
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-xl mx-auto">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">2000+</div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Expert Instructors</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">100+</div>
              <div className="text-sm text-muted-foreground">Live Sessions</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
    </section>
  );
};

export default HeroSection;
