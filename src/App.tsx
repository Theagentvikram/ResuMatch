import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ResumeProvider } from "@/contexts/ResumeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RecruiterLoginPage from "./pages/RecruiterLoginPage";
import UserLoginPage from "./pages/UserLoginPage";
import SignupPage from "./pages/SignupPage";
import RecruiterSignupPage from "./pages/RecruiterSignupPage";
import UploadPage from "./pages/UploadPage";
import SearchPage from "./pages/SearchPage";
import UploadStatusPage from "./pages/UploadStatusPage";
import ResumeDetailsPage from "./pages/ResumeDetailsPage";
import NotFound from "./pages/NotFound";
import { RecruiterResumesManagementPage } from "./pages/RecruiterResumesManagementPage";
import JobPostingPage from "./pages/JobPostingPage";
import JobPortalPage from "./pages/JobPortalPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ResumeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/recruiter-login" element={<RecruiterLoginPage />} />
              <Route path="/recruiter-signup" element={<RecruiterSignupPage />} />
              <Route path="/user-login" element={<UserLoginPage />} />
              
              {/* Applicant Routes */}
              <Route 
                path="/upload" 
                element={
                  <ProtectedRoute requiredUserType="applicant">
                    <UploadPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/upload-status" 
                element={
                  <ProtectedRoute requiredUserType="applicant">
                    <UploadStatusPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resume/:id" 
                element={
                  <ProtectedRoute requiredUserType="applicant">
                    <ResumeDetailsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jobs" 
                element={
                  <ProtectedRoute requiredUserType="applicant">
                    <JobPortalPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Recruiter Routes */}
              <Route 
                path="/search" 
                element={
                  <ProtectedRoute requiredUserType="recruiter">
                    <SearchPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/recruiter/resumes-management" 
                element={
                  <ProtectedRoute requiredUserType="recruiter">
                    <RecruiterResumesManagementPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/recruiter/post-job" 
                element={
                  <ProtectedRoute requiredUserType="recruiter">
                    <JobPostingPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Job Portal Routes */}
              <Route 
                path="/job-portal" 
                element={
                  <ProtectedRoute requiredUserType="applicant">
                    <JobPortalPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/job-posting" 
                element={
                  <ProtectedRoute requiredUserType="recruiter">
                    <JobPostingPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ResumeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
