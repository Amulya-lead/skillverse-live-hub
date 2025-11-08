import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, CreditCard } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const BookSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState("");

  // Mock data - would come from API
  const course = {
    title: "4 Hours of OOPS in Java",
    price: "₹999",
    instructor: "Rahul Sharma",
  };

  const availableSlots = [
    { id: "1", date: "Monday, Nov 11", time: "10:00 AM - 2:00 PM", available: true },
    { id: "2", date: "Monday, Nov 11", time: "3:00 PM - 7:00 PM", available: true },
    { id: "3", date: "Tuesday, Nov 12", time: "10:00 AM - 2:00 PM", available: false },
    { id: "4", date: "Tuesday, Nov 12", time: "3:00 PM - 7:00 PM", available: true },
    { id: "5", date: "Wednesday, Nov 13", time: "10:00 AM - 2:00 PM", available: true },
    { id: "6", date: "Wednesday, Nov 13", time: "3:00 PM - 7:00 PM", available: true },
  ];

  const handleBooking = () => {
    if (!selectedSlot) {
      toast({
        title: "Please select a time slot",
        description: "Choose an available slot to continue",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would process payment
    toast({
      title: "Booking Confirmed! 🎉",
      description: "Check your email for confirmation and session link",
    });
    
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to={`/course/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Book Your Live Session</h1>
          <p className="text-muted-foreground mb-8">
            Choose a convenient time slot for your learning session
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Slot Selection */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Select Time Slot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedSlot} onValueChange={setSelectedSlot}>
                    <div className="space-y-3">
                      {availableSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                            !slot.available
                              ? "opacity-50 cursor-not-allowed"
                              : selectedSlot === slot.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <RadioGroupItem
                              value={slot.id}
                              id={slot.id}
                              disabled={!slot.available}
                            />
                            <Label
                              htmlFor={slot.id}
                              className={`cursor-pointer ${!slot.available && "cursor-not-allowed"}`}
                            >
                              <div className="font-medium">{slot.date}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {slot.time}
                              </div>
                            </Label>
                          </div>
                          {!slot.available && (
                            <Badge variant="secondary">Fully Booked</Badge>
                          )}
                          {slot.available && selectedSlot === slot.id && (
                            <Badge className="bg-success text-success-foreground">Selected</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Course</div>
                    <div className="font-medium">{course.title}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Instructor</div>
                    <div className="font-medium">{course.instructor}</div>
                  </div>
                  
                  {selectedSlot && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Selected Slot</div>
                      <div className="font-medium text-sm">
                        {availableSlots.find(s => s.id === selectedSlot)?.date}
                        <br />
                        {availableSlots.find(s => s.id === selectedSlot)?.time}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">{course.price}</span>
                    </div>
                    
                    <Button 
                      onClick={handleBooking}
                      className="w-full" 
                      size="lg" 
                      variant="gradient"
                      disabled={!selectedSlot}
                    >
                      <CreditCard className="mr-2 h-5 w-5" />
                      Proceed to Payment
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>✓ Instant email confirmation</p>
                    <p>✓ Session link sent after payment</p>
                    <p>✓ 30-day money-back guarantee</p>
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

export default BookSession;
