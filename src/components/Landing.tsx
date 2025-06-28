import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Search, Upload, UserCheck, Eye, Shield, Code, Zap, Database, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function Landing() {
  return (
    <div className="flex flex-col items-center text-white">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 text-center max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Craft the Perfect Resume Match
            </span>
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Our AI-powered platform helps recruiters find the perfect candidates quickly. 
            Describe what you're looking for, and we'll match you with the best resumes.
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}  
        >
          <Link to="/login">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:scale-105">
              <Search className="h-4 w-4" /> Try Resume Search
            </Button>
          </Link>
          <Link to="/upload">
            <Button size="lg" variant="outline" className="gap-2 border-blue-400/30 text-blue-400 hover:bg-blue-900/30 shadow-lg transition-all duration-300 transform hover:scale-105">
              <Upload className="h-4 w-4" /> Upload Resumes
            </Button>
          </Link>
        </motion.div>

        <motion.div
          className="mt-16 max-w-4xl mx-auto relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.7 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-xl opacity-30"></div>
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm p-6 shadow-2xl">
            <div className="flex flex-col items-center">
              <Zap className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered Resume Matching</h3>
              <p className="text-gray-300 text-center">
                Our advanced algorithms analyze resumes to identify the perfect candidates based on your requirements.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-2 text-white">How It Works</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-12 rounded-full"></div>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {/* Feature 1 */}
            <motion.div 
              className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-lg shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group hover:-translate-y-1"
              variants={item}
            >
              <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-500/30 transition-all duration-300">
                <Upload className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2 text-blue-300">Upload Resumes</h3>
              <p className="text-gray-400 text-center">
                Bulk upload student resumes in PDF format. Our system will automatically organize and store them securely.
              </p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-lg shadow-xl hover:shadow-purple-500/5 transition-all duration-300 group hover:-translate-y-1"
              variants={item}
            >
              <div className="h-12 w-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-purple-500/30 transition-all duration-300">
                <FileText className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2 text-purple-300">AI Summarization</h3>
              <p className="text-gray-400 text-center">
                Our AI engine automatically summarizes and classifies each resume, extracting key skills and experiences.
              </p>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div 
              className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-lg shadow-xl hover:shadow-green-500/5 transition-all duration-300 group hover:-translate-y-1"
              variants={item}
            >
              <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-green-500/30 transition-all duration-300">
                <UserCheck className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2 text-green-300">Smart Matching</h3>
              <p className="text-gray-400 text-center">
                Describe what you're looking for in plain language, and we'll find the most relevant candidates instantly.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Details Section */}
      <section className="w-full py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
          >
            <div className="order-2 md:order-1">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold mb-4 text-blue-300">Instant Optimization</h3>
                <p className="text-gray-300 mb-6">
                  Quickly see how well resumes match your requirements and get keyword suggestions to optimize your search.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 mt-1">
                      <Eye className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="text-gray-400">Real-time analysis and resume scoring</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 mt-1">
                      <Shield className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="text-gray-400">Private by design - all processing happens locally</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 mt-1">
                      <Code className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="text-gray-400">Open source and transparently developed</span>
                  </li>
                </ul>
              </motion.div>
            </div>
            <motion.div 
              className="order-1 md:order-2 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg blur-xl opacity-30"></div>
              <div className="relative rounded-lg shadow-2xl border border-white/10 z-10 bg-black/20 backdrop-blur-sm p-6">
                <div className="flex flex-col items-center">
                  <Database className="h-12 w-12 text-purple-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Advanced Analytics Dashboard</h3>
                  <p className="text-gray-300 text-center">
                    Get insights into candidate pools, skill distributions, and match quality with our interactive analytics.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 w-full">
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <div className="text-2xl font-bold text-blue-300">94%</div>
                      <div className="text-xs text-gray-400">Match Accuracy</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <div className="text-2xl font-bold text-purple-300">30s</div>
                      <div className="text-xs text-gray-400">Processing Time</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <div className="text-2xl font-bold text-green-300">500+</div>
                      <div className="text-xs text-gray-400">Skills Indexed</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <div className="text-2xl font-bold text-orange-300">10x</div>
                      <div className="text-xs text-gray-400">Faster Hiring</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-16 bg-black/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300 mb-2">100+</h3>
              <p className="text-gray-400">GitHub Stars</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300 mb-2">30+</h3>
              <p className="text-gray-400">Community Users</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-300 mb-2">3</h3>
              <p className="text-gray-400">Contributors</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-300 mb-2">100%</h3>
              <p className="text-gray-400">Open Source</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-16 text-center max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to streamline your hiring process?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of recruiters who are saving time and finding better candidates with ResuMatch.
          </p>
          <Link to="/login">
            <Button 
              size="lg" 
              className="px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-purple-500/20 transition-all duration-300 transform hover:scale-105"
            >
              Get Started Now
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
