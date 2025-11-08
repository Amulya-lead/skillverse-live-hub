import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RequestSession = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      toast({
        title: "Request Submitted! 🎯",
        description: "We'll get back to you within 24 hours with session details",
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Request a <span className="text-primary">Custom Session</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Can't find what you're looking for? Request a personalized learning session
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tell Us What You Want to Learn</CardTitle>
              <CardDescription>
                Fill out this form and our team will create a custom session just for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <Input id="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic / Skill *</Label>
                  <Input id="topic" placeholder="e.g., Advanced React Hooks, Machine Learning Basics" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Your Current Level *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - Just starting out</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                      <SelectItem value="advanced">Advanced - Looking to master</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Preferred Duration</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="custom">Custom duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">What do you want to learn? *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you want to learn, specific topics to cover, your learning goals, etc."
                    className="min-h-32"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Range (Optional)</Label>
                  <Input id="budget" placeholder="e.g., ₹1000 - ₹2000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Your Availability</Label>
                  <Textarea
                    id="availability"
                    placeholder="Let us know your preferred days and times (e.g., Weekdays 6-8 PM, Weekends anytime)"
                    className="min-h-20"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  variant="gradient"
                  disabled={isLoading}
                >
                  <Send className="mr-2 h-5 w-5" />
                  {isLoading ? "Submitting..." : "Submit Request"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By submitting this form, you agree to our terms of service and privacy policy.
                  We typically respond within 24 hours.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RequestSession;
