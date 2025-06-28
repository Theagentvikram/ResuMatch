import { Layout } from "@/components/Layout";
import { UploadForm } from "@/components/UploadForm";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UploadPage = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/user-login");
    } else if (userType === "recruiter") {
      navigate("/search");
    }
  }, [isAuthenticated, userType, navigate]);

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-8 text-center text-white">Upload Resume</h1>
        <UploadForm />
      </div>
    </Layout>
  );
};

export default UploadPage;
