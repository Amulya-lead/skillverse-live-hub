import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Users, Award, CheckCircle2, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const CourseDetail = () => {
  const { id } = useParams();
  
  // Mock course data - would come from API/database
  const course = {
    title: "4 Hours of OOPS in Java",
    description: "Master Object-Oriented Programming concepts with hands-on practice and real-world examples",
    duration: "4 hours",
    price: "₹999",
    instructor: "Rahul Sharma",
    level: "Intermediate",
    students: 234,
    rating: 4.8,
    offerings: [
      "Live interactive video session with Q&A",
      "Hands-on coding exercises",
      "Real-world project examples",
      "Access to code editor during session",
      "Live notepad for collaborative learning",
      "Instant doubt resolution via chat",
    ],
    perks: [
      "Auto-generated certificate upon completion",
      "Lifetime access to session recordings",
      "Free PDF notes and code samples",
      "Priority support for 7 days post-session",
      "Access to private Discord community",
      "30-day money-back guarantee",
    ],
    syllabus: [
      "Introduction to OOP concepts",
      "Classes and Objects in Java",
      "Inheritance and Polymorphism",
      "Encapsulation and Abstraction",
      "Practical implementation exercises",
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary">{course.level}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {course.students} enrolled
                </div>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">
                {course.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium">
                      {course.instructor.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">Instructor</div>
                    <div className="text-muted-foreground">{course.instructor}</div>
                  </div>
                </div>
                
                <Separator orientation="vertical" className="h-12" />
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Duration</div>
                    <div className="text-muted-foreground">{course.duration}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* What We'll Offer */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">What We'll Be Offering</h2>
                <div className="space-y-3">
                  {course.offerings.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Perks */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Perks of Joining</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {course.perks.map((perk, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{perk}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Syllabus */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
                <div className="space-y-2">
                  {course.syllabus.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-strong">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="text-4xl font-bold text-primary mb-2">{course.price}</div>
                  <div className="text-sm text-muted-foreground">One-time payment</div>
                </div>
                
                <Link to={`/book/${id}`} className="block mb-4">
                  <Button className="w-full" size="lg" variant="gradient">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Live Session
                  </Button>
                </Link>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Students</span>
                    <span className="font-medium">{course.students}+ enrolled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Certificate</span>
                    <span className="font-medium">✓ Included</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Instant session access after payment</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
