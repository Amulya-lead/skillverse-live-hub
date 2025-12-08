import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, CreditCard, Sparkles, CheckCircle2, Mail, Shield, Zap, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const BookSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Mock data - would come from API
  const course = {
    id: id || "course-1",
    title: "4 Hours of OOPS in Java",
    price: 999,
    priceDisplay: "₹999",
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

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
        setUserId(user.id);
      }
    };
    fetchUserDetails();
  }, []);

  const handleBooking = async () => {
    if (!selectedSlot) {
      toast({
        title: "Please select a time slot",
        description: "Choose an available slot to continue",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    const selectedSlotData = availableSlots.find(s => s.id === selectedSlot);

    try {
      // Create Razorpay order
      const { data: orderData, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          amount: course.price,
          currency: "INR",
          courseId: course.id,
          courseName: course.title,
          userId: userId,
          userEmail: userEmail,
          sessionDate: selectedSlotData?.date || "",
          sessionTime: selectedSlotData?.time || "",
        },
      });

      if (orderError || !orderData?.configured) {
        // Fallback: Book without payment if Razorpay not configured
        console.log("Razorpay not configured, proceeding with direct booking");
        await completeBookingWithoutPayment(selectedSlotData);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SkillVerse",
        description: course.title,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Verify payment
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course.id,
              userId: userId,
              sessionDate: selectedSlotData?.date || "",
              sessionTime: selectedSlotData?.time || "",
            },
          });

          if (verifyError || !verifyData?.verified) {
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted.",
              variant: "destructive",
            });
            setIsBooking(false);
            return;
          }

          // Send confirmation email
          await sendConfirmationEmail(selectedSlotData);
          
          toast({
            title: "Payment Successful! 🎉",
            description: "Your session has been booked. Check your email for details.",
          });
          
          setTimeout(() => navigate("/dashboard"), 2000);
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: "#8b5cf6",
        },
        modal: {
          ondismiss: function() {
            setIsBooking(false);
          }
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error("Razorpay not loaded");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsBooking(false);
    }
  };

  const completeBookingWithoutPayment = async (selectedSlotData: any) => {
    try {
      await sendConfirmationEmail(selectedSlotData);
      toast({
        title: "Booking Confirmed! 🎉",
        description: "Check your email for confirmation and session details",
      });
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Booking Confirmed! 🎉",
        description: "Session booked successfully!",
      });
      setTimeout(() => navigate("/dashboard"), 2000);
    } finally {
      setIsBooking(false);
    }
  };

  const sendConfirmationEmail = async (selectedSlotData: any) => {
    await supabase.functions.invoke("send-booking-confirmation", {
      body: {
        userEmail,
        userName,
        courseName: course.title,
        instructor: course.instructor,
        sessionDate: selectedSlotData?.date || "",
        sessionTime: selectedSlotData?.time || "",
        price: course.priceDisplay,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary rounded-full animate-pulse shadow-glow" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-accent rounded-full animate-pulse shadow-glow" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-5 h-5 bg-primary/80 rounded-full animate-pulse shadow-glow" style={{ animationDelay: '1s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Header */}
      <div className="bg-background/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to={`/course/${id}`}>
            <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-all duration-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Page Header with Glow */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Live Session Booking</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Book Your Live Session
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Choose a convenient time slot and start your learning journey with expert instructors
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Slot Selection */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm shadow-strong overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary" />
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    Select Your Preferred Time Slot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedSlot} onValueChange={setSelectedSlot}>
                    <div className="space-y-4">
                      {availableSlots.map((slot, index) => (
                        <div 
                          key={slot.id} 
                          className="relative group animate-fade-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          {/* Glow effect on hover */}
                          <div className={`absolute -inset-0.5 bg-gradient-primary rounded-xl opacity-0 group-hover:opacity-30 blur-sm transition-all duration-500 ${selectedSlot === slot.id ? 'opacity-40' : ''}`} />
                          
                          <Card className={`relative hover:shadow-strong transition-all duration-500 hover:-translate-y-1 border-2 ${
                            !slot.available
                              ? "opacity-50 cursor-not-allowed bg-muted/20"
                              : selectedSlot === slot.id
                              ? "border-primary bg-primary/5 shadow-glow"
                              : "border-border/50 hover:border-primary/50 cursor-pointer bg-card/50"
                          }`}>
                            <div className="flex items-center justify-between p-5">
                              <div className="flex items-center gap-4">
                                <RadioGroupItem
                                  value={slot.id}
                                  id={slot.id}
                                  disabled={!slot.available}
                                  className="border-2 h-5 w-5"
                                />
                                <Label
                                  htmlFor={slot.id}
                                  className={`cursor-pointer ${!slot.available && "cursor-not-allowed"}`}
                                >
                                  <div className="font-semibold text-lg">{slot.date}</div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                    <Clock className="h-4 w-4 text-primary" />
                                    {slot.time}
                                  </div>
                                </Label>
                              </div>
                              <div className="flex items-center gap-2">
                                {!slot.available && (
                                  <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
                                    Fully Booked
                                  </Badge>
                                )}
                                {slot.available && selectedSlot === slot.id && (
                                  <Badge className="bg-success text-success-foreground shadow-soft animate-scale-in flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Selected
                                  </Badge>
                                )}
                                {slot.available && selectedSlot !== slot.id && (
                                  <Badge variant="outline" className="border-success/30 text-success">
                                    Available
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Features Section */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Mail, label: "Instant Email", desc: "Confirmation" },
                  { icon: Shield, label: "Secure", desc: "Payment" },
                  { icon: Zap, label: "Quick", desc: "Access" },
                ].map((feature, index) => (
                  <Card 
                    key={index} 
                    className="p-4 text-center bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-medium group"
                  >
                    <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="font-semibold text-sm">{feature.label}</div>
                    <div className="text-xs text-muted-foreground">{feature.desc}</div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="border-2 border-primary/20 bg-card/90 backdrop-blur-sm shadow-strong overflow-hidden">
                  {/* Glow effect at top */}
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                  
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Booking Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 relative">
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Course</div>
                      <div className="font-semibold text-lg">{course.title}</div>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Instructor</div>
                      <div className="font-medium">{course.instructor}</div>
                    </div>
                    
                    {selectedSlot && (
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 animate-scale-in">
                        <div className="text-xs text-primary mb-1 uppercase tracking-wide font-medium">Selected Slot</div>
                        <div className="font-semibold">
                          {availableSlots.find(s => s.id === selectedSlot)?.date}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {availableSlots.find(s => s.id === selectedSlot)?.time}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex justify-between items-center mb-6">
                        <span className="font-medium text-muted-foreground">Total Amount</span>
                        <div className="text-right">
                          <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {course.price}
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleBooking}
                        className="w-full relative overflow-hidden group" 
                        size="lg" 
                        variant="gradient"
                        disabled={!selectedSlot || isBooking}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <CreditCard className="mr-2 h-5 w-5" />
                        {isBooking ? "Processing..." : "Proceed to Payment"}
                      </Button>
                    </div>
                    
                    <div className="space-y-2 pt-4">
                      {[
                        "Instant email confirmation",
                        "Session link sent after payment",
                        "30-day money-back guarantee"
                      ].map((text, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          {text}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSession;
