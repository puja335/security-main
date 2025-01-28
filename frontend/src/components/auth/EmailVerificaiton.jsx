import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { baseUrl } from "../../baseUrl/baseUrl";

export const EmailVerification = () => {
  const [verifying, setVerifying] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token) {
          toast.error("Invalid verification link");
          navigate("/login");
          return;
        }

        await axios.get(`${baseUrl}/api/user/verify-email?token=${token}`);
        toast.success("Email verified successfully");
        navigate("/login");
      } catch (error) {
        toast.error(error.response?.data?.error || "Verification failed");
        navigate("/login");
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [location, navigate]);

  return (
    <div className='flex justify-center items-center h-screen'>
      {verifying ? (
        <div className='text-center'>
          <span className='loading loading-spinner loading-lg'></span>
          <p className='mt-4'>Verifying your email...</p>
        </div>
      ) : null}
    </div>
  );
};
