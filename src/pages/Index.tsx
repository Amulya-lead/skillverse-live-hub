import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Video, Award, Clock, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import CourseCard from "@/components/CourseCard";
import FeatureCard from "@/components/FeatureCard";

const courses = [
  {
    id: "oops-java",
    title: "4 Hours of OOPS in Java",
    description: "Master Object-Oriented Programming concepts with hands-on practice",
    duration: "4 hours",
    price: "₹999",
    instructor: "Rahul Sharma",
    image: "/course-java.jpg",
    level: "Intermediate",
    students: 234,
  },
  {
    id: "photoshop-basics",
    title: "2 Hours of Photoshop Basics",
    description: "Learn essential Photoshop tools and techniques from scratch",
    duration: "2 hours",
    price: "₹599",
    instructor: "Priya Desai",
    image: "/course-photoshop.jpg",
    level: "Beginner",
    students: 456,
  },
  {
    id: "web-development",
    title: "5 Hours of Modern Web Dev",
    description: "Build responsive websites with HTML, CSS, and JavaScript",
    duration: "5 hours",
    price: "₹1299",
    instructor: "Amit Patel",
    image: "/course-web.jpg",
    level: "Beginner",
    students: 789,
  },
  {
    id: "data-structures",
    title: "6 Hours of Data Structures",
    description: "Deep dive into essential DS concepts with real-world examples",
    duration: "6 hours",
    price: "₹1499",
    instructor: "Neha Singh",
    image: "/course-ds.jpg",
    level: "Advanced",
    students: 345,
  },
];

const features = [
  {
    icon: Video,
    title: "Live Interactive Sessions",
    description: "Join real-time classes with video, chat, and collaborative tools",
  },
  {
    icon: Clock,
    title: "Flexible Time Slots",
    description: "Choose from multiple 4-hour slots that fit your schedule",
  },
  {
    icon: Award,
    title: "Instant Certificates",
    description: "Get auto-generated certificates immediately after completion",
  },
  {
    icon: Users,
    title: "Expert Instructors",
    description: "Learn from industry professionals with years of experience",
  },
  {
    icon: BookOpen,
    title: "Custom Doubt Sessions",
    description: "Book personalized 1-on-1 sessions for your specific queries",
  },
  {
    icon: TrendingUp,
    title: "Career-Focused Content",
    description: "Skills that matter in today's competitive job market",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <HeroSection />
      
      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="text-primary">SkillVerse</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to master new skills in a live, interactive environment
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>

      {/* Courses Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Courses</h2>
            <p className="text-muted-foreground text-lg">
              Learn from the best. Start your journey today.
            </p>
          </div>
          <Link to="/courses">
            <Button variant="outline" className="hidden md:flex">
              View All Courses
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
        
        <div className="text-center mt-8 md:hidden">
          <Link to="/courses">
            <Button variant="outline">View All Courses</Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Learn Something New?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of learners mastering in-demand skills with live, interactive sessions
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/courses">
              <Button variant="secondary" size="lg" className="text-lg px-8">
                Browse Courses
              </Button>
            </Link>
            <Link to="/request-session">
              <Button variant="outline" size="lg" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Request Custom Session
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
