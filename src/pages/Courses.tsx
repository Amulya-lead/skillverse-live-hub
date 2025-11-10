import { Navbar } from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

const allCourses = [
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

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">All Courses</h1>
          <p className="text-muted-foreground text-lg mb-6">
            Explore our comprehensive collection of live interactive courses
          </p>
          
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No courses found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
