import { Layout } from "@/components/Layout";
import { UserLoginForm } from "@/components/UserLoginForm";
import { motion } from "framer-motion";

export default function SignupPage() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UserLoginForm mode="signup" />
        </motion.div>
      </div>
    </Layout>
  );
} 