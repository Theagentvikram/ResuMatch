import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Search, Upload, UserCheck, Shield, Zap, Database, BarChart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero Section */}
      <div className="min-h-[90vh] flex flex-col items-center justify-center py-12 px-4">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600">
              Craft the Perfect Resume Match
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            Our AI-powered platform helps recruiters find the perfect candidates
            quickly. Describe what you're looking for, and we'll match you with the
            right candidates.
          </motion.p>

          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          >
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button 
                size="lg"
                className="relative bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8 py-6 text-lg overflow-hidden group"
                onClick={() => navigate("/recruiter-login")}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                <div className="relative z-10 flex items-center">
                  <Search className="h-5 w-5 mr-2" /> Recruiter Login
                </div>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)" }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button 
                size="lg"
                className="relative bg-purple-600 hover:bg-purple-700 text-white gap-2 px-8 py-6 text-lg overflow-hidden group"
                onClick={() => navigate("/user-login")}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                <div className="relative z-10 flex items-center">
                  <Upload className="h-5 w-5 mr-2" /> Applicant Login
                </div>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)" }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button 
                size="lg"
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-500/10 gap-2 px-8 py-6 text-lg"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* How It Works Section */}
      <section className="py-16 bg-black/20 backdrop-blur-sm rounded-lg mb-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-6xl mx-auto px-4"
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-xl"></div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex p-3 bg-blue-500/20 rounded-full transition-all duration-300 group-hover:bg-blue-500/40 group-hover:scale-110">
                  <Upload className="h-8 w-8 text-blue-400 group-hover:text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Upload Resumes</h3>
                <p className="text-gray-300">
                  Bulk upload student resumes in PDF format. Our system will automatically organize and store them securely.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="text-center p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -8, boxShadow: "0 10px 25px -5px rgba(168, 85, 247, 0.5)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-xl"></div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex p-3 bg-purple-500/20 rounded-full transition-all duration-300 group-hover:bg-purple-500/40 group-hover:scale-110">
                  <FileText className="h-8 w-8 text-purple-400 group-hover:text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">AI Summarization</h3>
                <p className="text-gray-300">
                  Our AI engine automatically summarizes and classifies each resume, extracting key skills and experiences.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="text-center p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -8, boxShadow: "0 10px 25px -5px rgba(74, 222, 128, 0.5)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-xl"></div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex p-3 bg-green-500/20 rounded-full transition-all duration-300 group-hover:bg-green-500/40 group-hover:scale-110">
                  <UserCheck className="h-8 w-8 text-green-400 group-hover:text-green-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Smart Matching</h3>
                <p className="text-gray-300">
                  Describe what you're looking for in plain language, and we'll find the most relevant candidates instantly.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 mb-16 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-3xl font-bold mb-6 text-white">Instant Optimization</h2>
            <p className="text-gray-300 mb-6">
              Quickly see how well resumes match your requirements and get keyword suggestions to optimize your search.
            </p>
            
            <ul className="space-y-4">
              <motion.li 
                className="flex items-center gap-3 group"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ x: 5 }}
              >
                <div className="bg-blue-500/20 p-2 rounded-full group-hover:bg-blue-500/40 transition-all duration-300">
                  <Zap className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">Real-time analysis and resume scoring</span>
              </motion.li>
              <motion.li 
                className="flex items-center gap-3 group"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ x: 5 }}
              >
                <div className="bg-blue-500/20 p-2 rounded-full group-hover:bg-blue-500/40 transition-all duration-300">
                  <Shield className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">Private by design - all processing happens locally</span>
              </motion.li>
              <motion.li 
                className="flex items-center gap-3 group"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ x: 5 }}
              >
                <div className="bg-blue-500/20 p-2 rounded-full group-hover:bg-blue-500/40 transition-all duration-300">
                  <Database className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">Open source and transparently developed</span>
              </motion.li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-8 rounded-2xl border border-white/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-500"
            whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(59, 130, 246, 0.3)" }}
          >
            <h3 className="text-2xl font-bold mb-4 text-center text-white">Advanced Analytics Dashboard</h3>
            <p className="text-gray-300 text-center mb-6">
              Get insights into candidate pools, skill distributions, and match quality with our interactive analytics.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.div 
                className="bg-white/5 p-4 rounded-lg text-center hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-blue-500/30"
                whileHover={{ y: -3, boxShadow: "0 10px 30px -15px rgba(59, 130, 246, 0.5)" }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <div className="text-3xl font-bold text-blue-400 mb-1 group-hover:text-blue-300">94%</div>
                <div className="text-sm text-gray-400">Match Accuracy</div>
              </motion.div>
              <motion.div 
                className="bg-white/5 p-4 rounded-lg text-center hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-purple-500/30"
                whileHover={{ y: -3, boxShadow: "0 10px 30px -15px rgba(168, 85, 247, 0.5)" }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <div className="text-3xl font-bold text-purple-400 mb-1">30s</div>
                <div className="text-sm text-gray-400">Processing Time</div>
              </motion.div>
              <motion.div 
                className="bg-white/5 p-4 rounded-lg text-center hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-green-500/30"
                whileHover={{ y: -3, boxShadow: "0 10px 30px -15px rgba(74, 222, 128, 0.5)" }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <div className="text-3xl font-bold text-green-400 mb-1">500+</div>
                <div className="text-sm text-gray-400">Skills Indexed</div>
              </motion.div>
              <motion.div 
                className="bg-white/5 p-4 rounded-lg text-center hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-yellow-500/30"
                whileHover={{ y: -3, boxShadow: "0 10px 30px -15px rgba(250, 204, 21, 0.5)" }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <div className="text-3xl font-bold text-yellow-400 mb-1">10x</div>
                <div className="text-sm text-gray-400">Faster Hiring</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black/20 backdrop-blur-sm rounded-lg mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto px-4"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "100+", label: "GitHub Stars", color: "blue" },
              { value: "30+", label: "Community Users", color: "purple" },
              { value: "3+", label: "Contributors", color: "green" },
              { value: "100%", label: "Open Source", color: "yellow" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="group"
              >
                <motion.h3 
                  className={`text-4xl font-bold text-${stat.color}-400 mb-2 transition-all duration-300 group-hover:text-${stat.color}-300`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                >
                  {stat.value}
                </motion.h3>
                <p className="text-gray-300 group-hover:text-white transition-colors duration-300">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-16 mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-4"
        >
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to streamline your hiring process?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of recruiters who are saving time and finding better candidates with ResuMatch.
          </p>
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)" }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Button 
              size="lg"
              className="relative bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white gap-2 px-8 py-6 text-lg overflow-hidden group"
              onClick={() => navigate("/login")}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              <span className="relative z-10">Get Started Now</span>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </Layout>
  );
};

export default Index;
