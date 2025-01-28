// components/auth/Signup.jsx
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import zxcvbn from "zxcvbn";
import { baseUrl } from "../../baseUrl/baseUrl";

const userSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(/[^A-Za-z0-9]/, "Must contain at least one special character"),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match"),
});

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchema),
  });

  const password = watch("password", "");

  React.useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setPasswordStrength(result);
    }
  }, [password]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await axios.post(`${baseUrl}/api/user/signup`, data);
      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (score) => {
    const colors = ["text-error", "text-warning", "text-info", "text-success"];
    return colors[score] || "text-error";
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-base-100'>
      <div className='bg-base-200 shadow-lg rounded-lg p-8 w-full max-w-md'>
        <h1 className='text-3xl font-bold text-center mb-6'>
          <span className='text-primary'>FilmGo</span> Signup
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <input
              type='text'
              placeholder='Name'
              className={`input input-bordered w-full ${
                errors.name ? "input-error" : "input-primary"
              }`}
              {...register("name")}
            />
            {errors.name && (
              <p className='text-error text-sm mt-1'>{errors.name.message}</p>
            )}
          </div>

          <div>
            <input
              type='email'
              placeholder='Email'
              className={`input input-bordered w-full ${
                errors.email ? "input-error" : "input-primary"
              }`}
              {...register("email")}
            />
            {errors.email && (
              <p className='text-error text-sm mt-1'>{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type='password'
              placeholder='Password'
              className={`input input-bordered w-full ${
                errors.password ? "input-error" : "input-primary"
              }`}
              {...register("password")}
            />
            {errors.password && (
              <p className='text-error text-sm mt-1'>
                {errors.password.message}
              </p>
            )}
            {passwordStrength && password && (
              <div className='mt-2'>
                <div
                  className={`text-sm ${getStrengthColor(
                    passwordStrength.score
                  )}`}
                >
                  Strength:{" "}
                  {
                    ["Very Weak", "Weak", "Fair", "Good", "Strong"][
                      passwordStrength.score
                    ]
                  }
                </div>
                {passwordStrength.feedback.suggestions.length > 0 && (
                  <ul className='text-xs text-gray-500 mt-1 list-disc pl-4'>
                    {passwordStrength.feedback.suggestions.map(
                      (suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      )
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div>
            <input
              type='password'
              placeholder='Confirm Password'
              className={`input input-bordered w-full ${
                errors.confirmPassword ? "input-error" : "input-primary"
              }`}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className='text-error text-sm mt-1'>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type='submit'
            className='btn btn-primary w-full'
            disabled={loading}
          >
            {loading ? (
              <span className='loading loading-spinner'></span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className='mt-4 text-center'>
          <Link to='/login' className='link link-primary'>
            Already have an account?
          </Link>
        </div>
      </div>
    </div>
  );
}
