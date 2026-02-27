import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";

import Landing from "./pages/Landing";
import Login from "./pages/Login";

import StudentDashboard from "./pages/StudentDashboard";
import StudentChatbot from "./pages/StudentChatbot";
import Attendance from "./pages/Attendance";
import Results from "./pages/Results";
import Timetable from "./pages/Timetable";
import StudyMaterials from "./pages/StudyMaterials";
import StressBuster from "./pages/StressBuster";
import StudentProfile from "./pages/StudentProfile";
import PublicChatbot from "./pages/PublicChatbot";

import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffChatbot from "./pages/staff/StaffChatbot";
import StaffAttendance from "./pages/staff/StaffAttendance";
import StaffTeachingPlan from "./pages/staff/StaffTeachingPlan";
import StaffMarkAttendance from "./pages/staff/StaffMarkAttendance";
import StaffResults from "./pages/staff/StaffResults";
import StaffResultAnalysis from "./pages/staff/StaffResultAnalysis";
import StaffStudyMaterials from "./pages/staff/StaffStudyMaterials";
import StaffTimetable from "./pages/staff/StaffTimetable";
import StaffStressBuster from "./pages/staff/StaffStressBuster";
import StaffProfile from "./pages/staff/StaffProfile";


import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>



            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chatbot" element={<PublicChatbot />} />



            {/* Student Protected Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute>
                  <RoleGuard role="student">
                    <StudentDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/chatbot"
              element={
                <ProtectedRoute>
                  <RoleGuard role="student">
                    <StudentChatbot />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <RoleGuard role="student">
                    <Attendance />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <RoleGuard role="student">
                    <Results />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/timetable"
              element={
                <ProtectedRoute>
                  <RoleGuard role="student">
                    <Timetable />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/noticeboard"
              element={
                <ProtectedRoute>
                  <RoleGuard role="student">
                    <StudyMaterials />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/stress-buster"
              element={
                <ProtectedRoute>
                  <RoleGuard role="student">
                    <StressBuster />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <RoleGuard role="student">
                    <StudentProfile />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />



            {/* Staff Protected Routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute>
                  <RoleGuard role="staff">
                    <StaffDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/chatbot"
              element={
                <ProtectedRoute>
                  <RoleGuard role="staff">
                    <StaffChatbot />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/attendance"
              element={
                <ProtectedRoute>
                  <RoleGuard role="staff">
                    <StaffAttendance />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/attendance/teaching-plan/:assignmentId"
              element={
                <ProtectedRoute>
                  <RoleGuard role="staff">
                    <StaffTeachingPlan />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/attendance/mark/:assignmentId"
              element={
                <ProtectedRoute>
                  <RoleGuard role="staff">
                    <StaffMarkAttendance />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/results"
              element={
                <ProtectedRoute>
                  <RoleGuard role="staff">
                    <StaffResults />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/result-analysis"
              element={
                <ProtectedRoute>
                  <RoleGuard role="staff">
                    <StaffResultAnalysis />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/noticeboard"
              element={
                <ProtectedRoute>
                  <RoleGuard role="staff">
                    <StaffStudyMaterials />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/timetable"
              element={
                <ProtectedRoute>
                  <RoleGuard role="staff">
                    <StaffTimetable />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/stress-buster"
              element={
                <ProtectedRoute>
                  <RoleGuard role="staff">
                    <StaffStressBuster />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/profile"
              element={
                <ProtectedRoute>
                  <RoleGuard role="staff">
                    <StaffProfile />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />


            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;