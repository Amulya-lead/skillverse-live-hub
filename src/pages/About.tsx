import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { GraduationCap, Users, Award, Target } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">About SkillVerse</h1>
            <p className="text-muted-foreground text-lg">
              Empowering learners through interactive live sessions
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert mx-auto mb-12">
            <p className="text-muted-foreground">
              SkillVerse is a modern learning platform dedicated to providing high-quality,
              interactive live sessions that help students master in-demand skills. Our expert
              instructors bring real-world experience and passion for teaching to every session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
              <p className="text-muted-foreground">
                To make quality education accessible through engaging live interactive sessions
                that bridge the gap between theory and practice.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
              <p className="text-muted-foreground">
                To become the leading platform for live skill-based learning, empowering
                millions of learners worldwide.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-muted-foreground">
                Join thousands of active learners and instructors in our vibrant community
                focused on continuous growth and learning.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Instructors</h3>
              <p className="text-muted-foreground">
                Learn from industry professionals with years of experience who are passionate
                about sharing their knowledge.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
