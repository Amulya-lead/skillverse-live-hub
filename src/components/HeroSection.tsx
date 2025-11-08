import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Navbar */}
      <nav className="container mx-auto px-4 py-6 relative z-10 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-110">
              <span className="text-primary-foreground font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">FOCSERA</h1>
              <p className="text-xs text-muted-foreground">SkillVerse</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/courses" className="text-sm font-medium hover:text-primary transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
              Courses
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
              Contact
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">Login</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" variant="gradient" className="shadow-medium hover:shadow-strong">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full shadow-soft animate-slide-in-left">
            <span className="text-sm font-medium text-primary">Hub of Skills Under a Roof 🚀</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
            Master Skills Through
            <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent">Live Interactive Learning</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Book live sessions with expert instructors. Learn at your pace with flexible time slots, 
            interactive tools, and instant certificates.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
              <Input 
                placeholder="Search for courses... (e.g., Java, Photoshop, Web Development)" 
                className="pl-12 h-14 text-base shadow-medium border-2 border-transparent focus:border-primary transition-all duration-300 hover:shadow-strong"
              />
            </div>
          </div>
          
          <div className="flex gap-4 justify-center flex-wrap animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/courses">
              <Button size="lg" variant="gradient" className="text-lg px-8 shadow-strong hover:shadow-glow transition-all duration-300 hover:scale-105">
                Explore Courses
              </Button>
            </Link>
            <Link to="/request-session">
              <Button size="lg" variant="outline" className="text-lg px-8 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105">
                Request a Session
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-xl mx-auto">
            <div className="animate-slide-in-left" style={{ animationDelay: '0.5s' }}>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">2000+</div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Expert Instructors</div>
            </div>
            <div className="animate-slide-in-right" style={{ animationDelay: '0.7s' }}>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">100+</div>
              <div className="text-sm text-muted-foreground">Live Sessions</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s', animationDuration: '8s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-primary opacity-[0.02] rounded-full blur-3xl" />
    </section>
  );
};

export default HeroSection;
