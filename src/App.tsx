import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CourseDetail from "./pages/CourseDetail";
import BookSession from "./pages/BookSession";
import Dashboard from "./pages/Dashboard";
import LiveSession from "./pages/LiveSession";
import Auth from "./pages/Auth";
import RequestSession from "./pages/RequestSession";
import BecomeInstructor from "./pages/BecomeInstructor";
import TeacherDashboard from "./pages/TeacherDashboard";
import CoursePlayer from "./pages/CoursePlayer";
import CreateCourse from "./pages/CreateCourse";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import AdminDashboard from "./pages/AdminDashboard";
import Courses from "./pages/Courses";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleBasedRoute } from "./components/RoleBasedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Public Course Detail (visible to all) */}
          <Route path="/course/:id" element={<CourseDetail />} />

          {/* Course Player - Dedicated Learning Mode */}
          <Route path="/course/:id/learn" element={
            <RoleBasedRoute allowedRoles={['student', 'instructor', 'admin']}>
              <CoursePlayer />
            </RoleBasedRoute>
          } />

          {/* Student Routes */}
          <Route path="/dashboard" element={
            <RoleBasedRoute allowedRoles={['student', 'instructor', 'admin']}>
              <Dashboard />
            </RoleBasedRoute>
          } />
          <Route path="/book/:id" element={
            <RoleBasedRoute allowedRoles={['student', 'instructor', 'admin']}>
              <BookSession />
            </RoleBasedRoute>
          } />
          <Route path="/session/:id" element={
            <RoleBasedRoute allowedRoles={['student', 'instructor', 'admin']}>
              <LiveSession />
            </RoleBasedRoute>
          } />
          <Route path="/request-session" element={
            <RoleBasedRoute allowedRoles={['student']}>
              <RequestSession />
            </RoleBasedRoute>
          } />

          {/* Instructor Routes */}
          <Route path="/become-instructor" element={<BecomeInstructor />} />
          <Route path="/instructor" element={
            <RoleBasedRoute allowedRoles={['instructor', 'admin']}>
              <TeacherDashboard />
            </RoleBasedRoute>
          } />
          <Route path="/create-course" element={
            <RoleBasedRoute allowedRoles={['instructor', 'admin']}>
              <CreateCourse />
            </RoleBasedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </RoleBasedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleBasedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
