import { yupResolver } from "@hookform/resolvers/yup"
import axios from "axios"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Link, useNavigate } from "react-router-dom"
import { useSetRecoilState } from "recoil"
import * as yup from "yup"
import { baseUrl } from "../../baseUrl/baseUrl"
import { userRoleState } from "../../store/userRoleAtom"

const userSchema = yup.object({
  email: yup
    .string()
    .required("Please enter your email")
    .email("Please enter a valid email"),
  password: yup.string().required("Please enter your password"),
})

export default function AdminLogin() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setUserRole = useSetRecoilState(userRoleState)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchema),
  })
  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const res = await axios.post(`${baseUrl}/api/owner/signin`, data, {
        withCredentials: true,
      })

      const userRole = res.data.role
      setUserRole(userRole)
      if (userRole === "admin") {
        navigate("/adminDashboard")
      } else if (userRole === "owner") {
        navigate("/ownerDashboard")
      } else {
        navigate("/login")
      }
      toast.success(res.data.message)
      setLoading(false)
    } catch (error) {
      toast.error("Invalid Credentials")
      console.log(error)
      setLoading(false)
    }
  }
  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='bg-base-200 shadow-lg rounded-lg p-8 animate-fade-in'>
        <h1 className='text-3xl font-bold text-center text-dark mb-4'>
          <span className='text-primary'>FilmGo</span> Login
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col'>
          <div className='my-3'>
            <input
              type='email'
              placeholder='Email'
              className='input input-bordered input-primary w-72 '
              {...register("email")}
            />
            {errors.email && (
              <span className='text-error block text-sm  mt-1 ml-2'>
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
                <span className='loading loading-spinner bg-primary '></span>
              ) : (
                "Login"
              )}
            </button>
          </div>
          <Link to='/signup' className='text-right w-72  hover:underline'>
            Don't have an account?
          </Link>
        </form>
      </div>
    </div>
  )
}
