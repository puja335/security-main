import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import * as yup from "yup";
import { baseUrl } from "../../baseUrl/baseUrl";
import { userRoleState } from "../../store/userRoleAtom";

const userSchema = yup.object({
  email: yup
    .string()
    .required("Please enter your email")
    .email("Please enter a valid email"),
  password: yup.string().required("Please enter your password"),
});

export const setSessionStorage = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const navigate = useNavigate();
  const setUserRole = useSetRecoilState(userRoleState);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchema),
  });
  const navigateBasedOnRole = (role) => {
    const routes = {
      user: "/userHome",
      admin: "/adminDashboard",
      owner: "/ownerDashboard",
    };
    navigate(routes[role] || "/login");
  };

  const verify2FA = async () => {
    try {
      setLoading(true);
      const email = getValues("email");
      const response = await axios.post(
        `${baseUrl}/api/user/verify-2fa`,
        { email, otp: verificationCode },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${tempToken}` },
        }
      );
      setShow2FA(false);
      setTempToken("");
      setSessionStorage('sessionId', response.data.sessionId);

      const userRole = response.data.role;
      setUserRole(userRole);
      navigateBasedOnRole(userRole);
      toast.success("Login successful");
    } catch (error) {
      toast.error(error.response?.data?.error || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post(`${baseUrl}/api/user/signin`, data, {
        withCredentials: true,
      });

      if (res.data.requires2FA) {
        setShow2FA(true);
        setTempToken(res.data.token); // Store temporary token
        toast.success(res.data.message);
        return;
      }
      const userRole = res.data.role;
      console.log("User role:", userRole);
      setUserRole(userRole);
      setSessionStorage('sessionId', res?.data?.sessionId);
      navigateBasedOnRole(userRole);
      toast.success(res.data.message);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to login";
      toast.error(errorMessage);
      console.log("Error:", error);

      if (errorMessage.includes("Account locked")) {
        // Optional: Show remaining lock time to user
        const lockTimeMatch = errorMessage.match(/try again in (\d+) minutes/);
        if (lockTimeMatch) {
          toast.error(
            `Account locked. Please wait ${lockTimeMatch[1]} minutes.`
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='bg-base-200 shadow-lg rounded-lg p-8 animate-fade-in'>
        <h1 className='text-3xl font-bold text-center text-dark mb-4'>
          <span className='text-primary'>FilmGo</span> Login
        </h1>
        {!show2FA ? (
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col'>
            <div className='my-3'>
              <input
                type='email'
                placeholder='Email'
                className='input input-bordered input-primary w-72'
                {...register("email")}
              />
              {errors.email && (
                <span className='text-error block text-sm mt-1 ml-2'>
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className='my-3'>
              <input
                type='password'
                placeholder='Password'
                className='input input-bordered input-primary w-72'
                {...register("password")}
              />
              {errors.password && (
                <span className='text-error block text-sm mt-1 ml-2'>
                  {errors.password.message}
                </span>
              )}
            </div>
            <div className='my-3'>
              <button className='btn btn-primary w-72' disabled={loading}>
                {loading ? (
                  <span className='loading loading-spinner bg-primary'></span>
                ) : (
                  "Login"
                )}
              </button>
            </div>
            <Link to='/signup' className='text-right w-72 hover:underline'>
              Don't have an account?
            </Link>
          </form>
        ) : (
          <div className='flex flex-col'>
            <input
              type='text'
              placeholder='Enter verification code'
              className='input input-bordered input-primary w-72 my-3'
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button
              className='btn btn-primary w-72 my-3'
              onClick={verify2FA}
              disabled={loading}
            >
              {loading ? (
                <span className='loading loading-spinner bg-primary'></span>
              ) : (
                "Verify"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
