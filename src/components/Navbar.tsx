import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Search, Upload, User, ChevronDown, LogOut, BarChart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
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
                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 gap-1">
                      <Search className="h-4 w-4" /> Search
                    </Button>
                  </Link>
                  <Link to="/search?tab=analyze">
                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 gap-1">
                      <BarChart className="h-4 w-4" /> AI Analysis
                    </Button>
                  </Link>
                </div>
              )}
              
              {userType === "applicant" && (
                <div className="hidden md:flex space-x-3">
                  <Link to="/upload">
                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 gap-1">
                      <Upload className="h-4 w-4" /> Upload
                    </Button>
                  </Link>
                  <Link to="/upload-status">
                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 gap-1">
                      <FileText className="h-4 w-4" /> Status
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
                          <Search className="h-4 w-4 mr-2" /> Search Resumes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/10 hover:text-white cursor-pointer" asChild>
                        <Link to="/search?tab=analyze" className="flex items-center w-full">
                          <BarChart className="h-4 w-4 mr-2" /> AI Resume Analysis
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/10 hover:text-white cursor-pointer" asChild>
                        <Link to="/recruiter/resumes-management" className="flex items-center w-full">
                          <Trash2 className="h-4 w-4 mr-2" /> Manage Resumes
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
