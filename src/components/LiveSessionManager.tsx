import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Link as LinkIcon, Plus, Trash2, Video } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface Session {
    id: string;
    title: string;
    scheduled_start: string;
    scheduled_end: string;
    meeting_url: string;
    course_id: string;
    courses: { title: string };
    status: string;
}

export const LiveSessionManager = ({ userId }: { userId: string }) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // New Session Form
    const [newSession, setNewSession] = useState({
        courseId: "",
        title: "",
        date: "",
        startTime: "",
        duration: "60", // minutes
        meetingUrl: ""
    });

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        try {
            // Fetch Instructor's Courses (Slot Based only preferrably, but all for now)
            const { data: coursesData } = await supabase
                .from("courses")
                .select("id, title")
                .eq("instructor_id", userId)
                .eq("booking_type", "slot_based");

            setCourses(coursesData || []);

            // Fetch Sessions
            const { data: sessionData, error } = await supabase
                .from("live_sessions")
                .select("*, courses(title)")
                .eq("instructor_id", userId)
                .order("scheduled_start", { ascending: true });

            if (error) throw error;
            setSessions(sessionData || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load sessions");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            if (!newSession.courseId || !newSession.date || !newSession.startTime) {
                toast.error("Please fill in all required fields");
                return;
            }

            const startDateTime = new Date(`${newSession.date}T${newSession.startTime}`);
            const endDateTime = new Date(startDateTime.getTime() + parseInt(newSession.duration) * 60000);

            const { error } = await supabase
                .from("live_sessions")
                .insert({
                    instructor_id: userId,
                    course_id: newSession.courseId,
                    title: newSession.title || "Live Class",
                    scheduled_start: startDateTime.toISOString(),
                    scheduled_end: endDateTime.toISOString(),
                    meeting_url: newSession.meetingUrl,
                    status: 'scheduled'
                });

            if (error) throw error;

            toast.success("Session scheduled successfully");
            setIsCreateOpen(false);
            fetchData();
            // Reset form
            setNewSession({ ...newSession, title: "", meetingUrl: "" });
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this session?")) return;

        try {
            const { error } = await supabase
                .from("live_sessions")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Session cancelled");
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Live Sessions</h2>
                    <p className="text-muted-foreground">Manage your upcoming class schedule</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 shadow-glow">
                            <Plus className="h-4 w-4" /> Schedule Session
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] glass-card border-white/10">
                        <DialogHeader>
                            <DialogTitle>Schedule New Session</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Select Course</Label>
                                <Select
                                    value={newSession.courseId}
                                    onValueChange={v => setNewSession({ ...newSession, courseId: v })}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue placeholder="Choose a course..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Session Title</Label>
                                <Input
                                    placeholder="e.g. Q&A Session"
                                    value={newSession.title}
                                    onChange={e => setNewSession({ ...newSession, title: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={newSession.date}
                                        onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <Input
                                        type="time"
                                        value={newSession.startTime}
                                        onChange={e => setNewSession({ ...newSession, startTime: e.target.value })}
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Duration (Minutes)</Label>
                                <Select
                                    value={newSession.duration}
                                    onValueChange={v => setNewSession({ ...newSession, duration: v })}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="30">30 Mins</SelectItem>
                                        <SelectItem value="60">1 Hour</SelectItem>
                                        <SelectItem value="90">1.5 Hours</SelectItem>
                                        <SelectItem value="120">2 Hours</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Meeting URL (Zoom/Meet)</Label>
                                <Input
                                    placeholder="https://meet.google.com/..."
                                    value={newSession.meetingUrl}
                                    onChange={e => setNewSession({ ...newSession, meetingUrl: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>

                            <Button onClick={handleCreate} className="w-full mt-2">Schedule Now</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading schedule...</div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-bold mb-2">No Sessions Scheduled</h3>
                    <p className="text-muted-foreground mb-6">Create a 'Slot Based' course and schedule your first session.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map(session => (
                        <div key={session.id} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 hover:bg-white/5 transition-colors group">
                            <div className="flex flex-col items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                                <span className="text-xs font-bold uppercase">{format(new Date(session.scheduled_start), 'MMM')}</span>
                                <span className="text-2xl font-black">{format(new Date(session.scheduled_start), 'dd')}</span>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <h3 className="text-xl font-bold">{session.title}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${new Date() > new Date(session.scheduled_end) ? 'bg-gray-500/20 text-gray-400' :
                                            new Date() >= new Date(session.scheduled_start) ? 'bg-green-500/20 text-green-500 animate-pulse' :
                                                'bg-blue-500/20 text-blue-500'
                                        }`}>
                                        {new Date() > new Date(session.scheduled_end) ? 'Completed' :
                                            new Date() >= new Date(session.scheduled_start) ? 'Live Now' :
                                                'Upcoming'}
                                    </span>
                                </div>
                                <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                                    <span>{session.courses?.title}</span>
                                    <span>•</span>
                                    <Clock className="h-4 w-4" />
                                    {format(new Date(session.scheduled_start), 'h:mm a')} - {format(new Date(session.scheduled_end), 'h:mm a')}
                                </p>
                                {session.meeting_url && (
                                    <a href={session.meeting_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1 justify-center md:justify-start">
                                        <LinkIcon className="h-3 w-3" /> {session.meeting_url}
                                    </a>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => window.open(session.meeting_url, '_blank')} disabled={!session.meeting_url}>
                                    Join Room
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(session.id)} className="text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
