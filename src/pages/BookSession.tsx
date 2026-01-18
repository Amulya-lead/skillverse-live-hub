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
import { format } from "date-fns";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CourseData {
  id: string;
  title: string;
  price: number;
  instructor: string;
  booking_type: 'standard' | 'slot_based' | string;
}

interface SlotData {
  id: string;
  course_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
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

  const [course, setCourse] = useState<CourseData | null>(null);
  const [availableSlots, setAvailableSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!id) return;

      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, title, price, instructor, booking_type')
          .eq('id', id)
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);

        // Fetch slots
        const { data: slotsData, error: slotsError } = await supabase
          .from('course_slots')
          .select('*')
          .eq('course_id', id)
          .order('start_time');

        if (slotsError) throw slotsError;

        // Filter slots to only show future slots if needed, but for now show all fetched
        setAvailableSlots(slotsData || []);

      } catch (error) {
        console.error('Error fetching session data:', error);
        toast({
          title: "Error",
          description: "Failed to load session details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [id, toast]);

  const formatSlotDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE, MMM d");
  };

  const formatSlotTime = (start: string, end: string) => {
    return `${format(new Date(start), "h:mm a")} - ${format(new Date(end), "h:mm a")}`;
  };

  const handleBooking = async () => {
    if (!course) return;

    // Validation
    if (course.booking_type === 'slot_based' && !selectedSlot) {
      toast({
        title: "Please select a time slot",
        description: "Choose an available slot to continue",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    const selectedSlotData = availableSlots.find(s => s.id === selectedSlot);

    if (course.booking_type === 'slot_based' && !selectedSlotData) {
      setIsBooking(false);
      return;
    }

    const processBooking = async () => {
      try {
        let error;

        if (course.booking_type === 'slot_based') {
          // Call the secure RPC function to handle session creation and joining for slots
          const { error: bookingError } = await supabase.rpc('book_course_slot', {
            p_course_id: course.id,
            p_user_id: userId,
            p_start_time: selectedSlotData?.start_time,
            p_end_time: selectedSlotData?.end_time
          });
          error = bookingError;
        } else {
          // Standard/Recorded course - just enroll
          const { error: enrollError } = await supabase.rpc('enroll_course', {
            p_course_id: course.id,
            p_user_id: userId
          });
          error = enrollError;
        }

        if (error) throw error;

        await sendConfirmationEmail(selectedSlotData);
        toast({
          title: "Booking Confirmed! 🎉",
          description: course.booking_type === 'slot_based' ? "Session booked successfully! Check your dashboard." : "Course Enrolled! Check My Courses.",
        });
        setTimeout(() => navigate("/dashboard?tab=" + (course.booking_type === 'slot_based' ? 'sessions' : 'courses')), 2000);

      } catch (error: any) {
        console.error("Error processing booking:", error);
        toast({
          title: "Booking Error",
          description: "There was an issue processing your booking. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsBooking(false);
      }
    };

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
          sessionDate: selectedSlotData ? formatSlotDate(selectedSlotData.start_time) : "Standard Course",
          sessionTime: selectedSlotData ? formatSlotTime(selectedSlotData.start_time, selectedSlotData.end_time) : "Lifetime Access",
        },
      });

      if (orderError || !orderData?.configured) {
        console.log("Razorpay not configured, proceeding with direct booking");
        await processBooking();
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
              sessionDate: selectedSlotData ? formatSlotDate(selectedSlotData.start_time) : "Standard Course",
              sessionTime: selectedSlotData ? formatSlotTime(selectedSlotData.start_time, selectedSlotData.end_time) : "Lifetime Access",
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

          await processBooking();
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: "#8b5cf6",
        },
        modal: {
          ondismiss: function () {
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
        description: course?.booking_type === 'slot_based' ? "Session booked successfully! Check your dashboard." : "Course Enrolled! Check My Courses.",
      });
      setTimeout(() => navigate("/dashboard?tab=" + (course?.booking_type === 'slot_based' ? 'sessions' : 'courses')), 2000);
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
    if (!course) return;

    await supabase.functions.invoke("send-booking-confirmation", {
      body: {
        userEmail,
        userName,
        courseName: course.title,
        instructor: course.instructor,
        sessionDate: selectedSlotData ? formatSlotDate(selectedSlotData.start_time) : "Standard Course",
        sessionTime: selectedSlotData ? formatSlotTime(selectedSlotData.start_time, selectedSlotData.end_time) : "Lifetime Access",
        price: `₹${course.price}`,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <Link to="/courses">
          <Button>Back to Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-pulse opacity-50" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] animate-pulse opacity-50" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      {/* Header */}
      <div className="bg-background/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to={`/course/${id}`}>
            <Button variant="ghost" size="sm" className="hover:bg-primary/5 transition-all duration-300 group">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Course
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary/10 to-transparent rounded-full mb-6 border border-primary/20 shadow-sm">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-bold text-primary tracking-wide uppercase">
                {course.booking_type === 'slot_based' ? 'Live Session Booking' : 'Course Enrollment'}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-sm">
              {course.booking_type === 'slot_based' ? 'Book Your Live Session' : 'Secure Your Spot'}
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-light leading-relaxed">
              {course.booking_type === 'slot_based'
                ? 'Choose a convenient time slot and start your learning journey with expert instructors'
                : 'Get instant access to comprehensive learning materials and expert guidance'}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Slot Selection */}
            {course.booking_type === 'slot_based' ? (
              <div className="lg:col-span-2 space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="glass-card rounded-3xl p-8 border border-white/40 shadow-soft relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-sm">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Select a Time Slot</h2>
                      <p className="text-muted-foreground text-sm">All times are in your local timezone</p>
                    </div>
                  </div>

                  <RadioGroup value={selectedSlot} onValueChange={setSelectedSlot}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableSlots.length === 0 ? (
                        <div className="col-span-2 text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border">
                          <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <p className="text-muted-foreground font-medium">No available slots at the moment.</p>
                        </div>
                      ) : (
                        availableSlots.map((slot, index) => (
                          <div
                            key={slot.id}
                            className="relative group h-full"
                          >
                            <Label
                              htmlFor={slot.id}
                              className={`
                                  relative flex flex-col p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer h-full
                                  ${!slot.is_available ? 'opacity-50 cursor-not-allowed bg-secondary/20 border-transparent' : ''}
                                  ${selectedSlot === slot.id
                                  ? 'bg-primary/5 border-primary shadow-glow scale-[1.02]'
                                  : 'bg-white/40 hover:bg-white/60 border-transparent hover:border-primary/30 hover:shadow-md'
                                }
                                `}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <RadioGroupItem value={slot.id} id={slot.id} disabled={!slot.is_available} className="mt-1" />

                                {slot.is_available && selectedSlot === slot.id && (
                                  <Badge className="bg-success text-white shadow-sm animate-scale-in">Selected</Badge>
                                )}
                                {!slot.is_available && (
                                  <Badge variant="secondary">Booked</Badge>
                                )}
                              </div>

                              <div className="mt-auto">
                                <div className="font-bold text-lg text-foreground mb-1">{formatSlotDate(slot.start_time)}</div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-background/50 px-3 py-1.5 rounded-lg w-fit">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatSlotTime(slot.start_time, slot.end_time)}
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </RadioGroup>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { icon: Mail, label: "Instant Access", desc: "Confirmation via Email" },
                    { icon: Shield, label: "Secure Payment", desc: "Encrypted & Safe" },
                    { icon: Zap, label: "Fast Booking", desc: "Takes < 1 minute" },
                  ].map((feature, index) => (
                    <div key={index} className="text-center p-4 rounded-2xl bg-white/30 border border-white/20 shadow-sm hover:bg-white/50 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary mx-auto mb-2 opacity-80" />
                      <div className="font-bold text-sm mb-0.5">{feature.label}</div>
                      <div className="text-xs text-muted-foreground">{feature.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card rounded-3xl p-8 border-0 shadow-soft">
                  <h2 className="text-2xl font-bold mb-6">Course Benefits</h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">By enrolling in this course, you get immediate lifetime access to all materials.</p>

                    <div className="grid gap-4 mt-6">
                      {[
                        "Lifetime Access to all videos and resources",
                        "Certificate of Completion upon finishing",
                        "Access to community discussion forums",
                        "Downloadable source code and project files"
                      ].map((benefit, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                          <div className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          </div>
                          <span className="font-medium text-foreground/90">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Summary - Floating */}
            <div className="lg:col-span-1 animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
              <div className="sticky top-28">
                <div className="glass-card rounded-3xl p-6 border border-white/40 shadow-strong relative overflow-hidden backdrop-blur-xl bg-white/40 dark:bg-black/40">
                  {/* Decorative */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-50" />

                  <div className="relative">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Order Summary
                    </h3>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-start pb-4 border-b border-dashed border-foreground/10">
                        <span className="text-muted-foreground font-medium">Course</span>
                        <span className="font-bold text-right max-w-[60%]">{course.title}</span>
                      </div>

                      <div className="flex justify-between items-center pb-4 border-b border-dashed border-foreground/10">
                        <span className="text-muted-foreground font-medium">Instructor</span>
                        <span className="font-medium">{course.instructor}</span>
                      </div>

                      {selectedSlot && course.booking_type === 'slot_based' && (
                        <div className="flex justify-between items-center pb-4 border-b border-dashed border-foreground/10 bg-primary/5 -mx-6 px-6 py-3">
                          <span className="text-primary font-medium">Selected Slot</span>
                          <div className="text-right">
                            <div className="font-bold text-primary text-sm">{availableSlots.find(s => s.id === selectedSlot) ? formatSlotDate(availableSlots.find(s => s.id === selectedSlot)!.start_time) : ''}</div>
                            <div className="text-xs text-primary/80">{availableSlots.find(s => s.id === selectedSlot) ? formatSlotTime(availableSlots.find(s => s.id === selectedSlot)!.start_time, availableSlots.find(s => s.id === selectedSlot)!.end_time) : ''}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">₹{course.price}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleBooking}
                      className="w-full h-14 rounded-xl text-lg font-bold shadow-medium hover:shadow-glow hover:-translate-y-1 transition-all duration-300"
                      variant="gradient"
                      disabled={(course.booking_type === 'slot_based' && !selectedSlot) || isBooking}
                    >
                      {isBooking ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                        </div>
                      ) : "Proceed to Payment"}
                    </Button>

                    <div className="mt-6 text-center">
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 opacity-80">
                        <Shield className="h-3 w-3" /> Secure SSL Encrypted Transaction
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSession;
