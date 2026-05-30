"use client";
import { Student } from "@/Types";
import { IconEyeOff } from "@tabler/icons-react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [captcha, setCaptcha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    captchaInput: "",
    role: "",
  });
  const genereateCaptcha = () => {
    const randomCaptcha = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    setCaptcha(randomCaptcha);
  };
  useEffect(() => {
    genereateCaptcha();
  }, []);

  const handleSubmit = () => {
    try {
      if (formData.captchaInput !== captcha) {
        toast.error("Captcha does not match. Please try again.");
        return;
      }
      const res = axios.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      toast.promise(res, {
        loading: "Logging in...",
        success: (data) => {
          console.log(data);
          router.push(data.data.route);
          return "Login successful!";
        },
        error: "Login failed. Please try again.",
      });
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <section className="bg-base-100 Orbitron">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <Link
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-base-content"
        >
          <img
            className="w-8 h-8 mr-2"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
            alt="logo"
          />
          Opportune
        </Link>
        <div className="w-full bg-base-300 rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-base-content md:text-2xl text-center">
              Login to your account
            </h1>
            {/* Email Field */}
            <fieldset className="fieldset">
              <legend className="legend font-bold">
                Email <span className="text-error">*</span>
              </legend>
              <input
                type="email"
                name="email"
                placeholder="student@company.com"
                className="input input-bordered w-full"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </fieldset>
            {/* Password Field */}
            <fieldset className="fieldset">
              <legend className="legend font-bold">
                Password <span className="text-error">*</span>
              </legend>
              <div className="join">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="input input-bordered join-item w-full"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  className="btn btn-square join-item"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <IconEyeOff /> : <IconEyeOff />}
                </button>
              </div>
            </fieldset>
            {/* Role Selection */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Role
                <span className="text-error">*</span>
              </legend>
              <select
                className="select select-bordered w-full"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="">Select Role</option>
                {[
                  "Admin",
                  "College",
                  "Organizer",
                  "Program Manager",
                  "Student",
                ].map((role) => (
                  <option key={role} value={role.toLowerCase()}>
                    {role}
                  </option>
                ))}
              </select>
            </fieldset>
            {/* Captcha Field */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Captcha</legend>
              <div className="flex flex-row gap-2">
                <div className="join">
                  <div className="bg-base-100 text-center px-4 py-1 text-xl font-mono tracking-widest join-item">
                    {captcha}
                  </div>
                  <button
                    type="button"
                    className="btn btn-neutral join-item px-4 py-2"
                    aria-label="Regenerate Captcha"
                    onClick={genereateCaptcha}
                  >
                    &#x21bb;
                  </button>
                </div>
                <input
                  type="text"
                  className="input"
                  value={formData.captchaInput}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      captchaInput: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Enter Captcha"
                />
              </div>
            </fieldset>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Remember Me
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot Password?
              </a>
            </div>
            <button
              className="btn btn-primary w-full"
              disabled={
                formData.captchaInput !== captcha ||
                !formData.role ||
                !formData.email ||
                !formData.password
              }
              onClick={handleSubmit}
            >
              Login
            </button>
            <p className="text-sm font-light text-center text-base-content/80">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary-600 hover:underline dark:text-primary-500"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
