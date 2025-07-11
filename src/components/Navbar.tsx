import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Search, Upload, User, ChevronDown, LogOut, Briefcase, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

export function Navbar() {
  const { user, logout, isAuthenticated, userType } = useAuth();
  const location = useLocation();

  // Helper function to determine if a path is active
  const isActivePath = (path: string) => {
    if (path === '/search') {
      return location.pathname === '/search' || location.pathname.startsWith('/search');
    }
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Helper function to get button classes with active state
  const getButtonClasses = (path: string) => {
    const baseClasses = "text-gray-300 hover:text-white hover:bg-white/10 gap-1";
    const activeClasses = "text-white bg-white/20 border-purple-500/50";
    return isActivePath(path) ? `${baseClasses} ${activeClasses}` : baseClasses;
  };

  return (
    <motion.nav 
      className="bg-white/5 backdrop-blur-md border-b border-white/10 py-4 px-6 sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-md">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ResuMatch
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {userType === "recruiter" && (
                <div className="hidden md:flex space-x-3">
                  <Link to="/search">
                    <Button 
                      variant={isActivePath('/search') ? 'default' : 'ghost'} 
                      size="sm" 
                      className={getButtonClasses('/search')}
                    >
                      <Search className="h-4 w-4" /> AI Analysis
                    </Button>
                  </Link>
                  <Link to="/recruiter/post-job">
                    <Button 
                      variant={isActivePath('/recruiter/post-job') ? 'default' : 'ghost'} 
                      size="sm" 
                      className={getButtonClasses('/recruiter/post-job')}
                    >
                      <Plus className="h-4 w-4" /> Post Job
                    </Button>
                  </Link>
                </div>
              )}
              
              {userType === "applicant" && (
                <div className="hidden md:flex space-x-3">
                  <Link to="/upload">
                    <Button 
                      variant={isActivePath('/upload') ? 'default' : 'ghost'} 
                      size="sm" 
                      className={getButtonClasses('/upload')}
                    >
                      <Upload className="h-4 w-4" /> Upload
                    </Button>
                  </Link>
                  <Link to="/upload-status">
                    <Button 
                      variant={isActivePath('/upload-status') ? 'default' : 'ghost'} 
                      size="sm" 
                      className={getButtonClasses('/upload-status')}
                    >
                      <FileText className="h-4 w-4" /> Status
                    </Button>
                  </Link>
                  <Link to="/jobs">
                    <Button 
                      variant={isActivePath('/jobs') ? 'default' : 'ghost'} 
                      size="sm" 
                      className={getButtonClasses('/jobs')}
                    >
                      <Briefcase className="h-4 w-4" /> Jobs
                    </Button>
                  </Link>
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className="bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700 gap-1">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">{user?.username}</span>
                    {userType && (
                      <span className="md:ml-2 text-xs bg-blue-500/20 text-blue-300 py-0.5 px-2 rounded-full">
                        {userType === "recruiter" ? "Recruiter" : "Applicant"}
                      </span>
                    )}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black/90 border-white/10 text-gray-300">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  
                  {userType === "recruiter" && (
                    <>
                      <DropdownMenuItem className="hover:bg-white/10 hover:text-white cursor-pointer" asChild>
                        <Link to="/search" className="flex items-center w-full">
                          <Search className="h-4 w-4 mr-2" /> AI Resume Analysis
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/10 hover:text-white cursor-pointer" asChild>
                        <Link to="/recruiter/job-listings" className="flex items-center w-full">
                          <Briefcase className="h-4 w-4 mr-2" /> Manage Job Listings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/10 hover:text-white cursor-pointer" asChild>
                        <Link to="/recruiter/post-job" className="flex items-center w-full">
                          <Plus className="h-4 w-4 mr-2" /> Post Job
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {userType === "applicant" && (
                    <>
                      <DropdownMenuItem className="hover:bg-white/10 hover:text-white cursor-pointer" asChild>
                        <Link to="/upload" className="flex items-center w-full">
                          <Upload className="h-4 w-4 mr-2" /> Upload Resume
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/10 hover:text-white cursor-pointer" asChild>
                        <Link to="/upload-status" className="flex items-center w-full">
                          <FileText className="h-4 w-4 mr-2" /> View Status
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/10 hover:text-white cursor-pointer" asChild>
                        <Link to="/jobs" className="flex items-center w-full">
                          <Briefcase className="h-4 w-4 mr-2" /> Browse Jobs
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    className="text-red-400 hover:text-red-300 hover:bg-white/10 cursor-pointer"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <div className="hidden sm:flex space-x-3">
                <Link to="/recruiter-login">
                  <Button variant="outline" size="sm" className="border-blue-400/30 text-blue-400 hover:bg-blue-600 hover:text-white">
                    Recruiter Login
                  </Button>
                </Link>
                <Link to="/user-login">
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 text-white">
                    Applicant Login
                  </Button>
                </Link>
              </div>
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white">
                      Login <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-black/90 border-white/10 text-gray-300">
                    <DropdownMenuItem className="hover:bg-white/10 hover:text-white cursor-pointer" asChild>
                      <Link to="/recruiter-login" className="flex items-center w-full">
                        <User className="h-4 w-4 mr-2" /> Recruiter Login
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-white/10 hover:text-white cursor-pointer" asChild>
                      <Link to="/user-login" className="flex items-center w-full">
                        <User className="h-4 w-4 mr-2" /> Applicant Login
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
