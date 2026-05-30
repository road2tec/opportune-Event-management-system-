"use client";
import { College, Student } from "@/Types";
import { IconEye, IconEyeOff, IconUpload } from "@tabler/icons-react";
import axios, { AxiosResponse } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [student, setStudent] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
    profileImage: "",
    college: "",
    profile: {
      bio: "",
      skills: [] as string[],
      interests: [] as string[],
    },
  });
  const [otpSent, setOtpSent] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [college, setCollege] = useState<College[]>([]);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const router = useRouter();

  const fetchColleges = async () => {
    try {
      const response = await fetch("/api/colleges");
      const data = await response.json();
      setCollege(data.colleges);
    } catch (error) {
      console.error("Error fetching colleges:", error);
    }
  };
  const verifyEmail = async () => {
    if (
      !student.email ||
      !student.email.includes("@") ||
      !student.email.includes(".")
    ) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!student.name) {
      toast.error("Please enter your name first");
      return;
    }
    try {
      const response = axios.post("/api/helper/verify-email", {
        name: student.name,
        email: student.email,
      });
      toast.promise(response, {
        loading: "Sending Email...",
        success: (data: AxiosResponse) => {
          (
            document.getElementById("otpContainer") as HTMLDialogElement
          ).showModal();
          setOtpSent(data.data.token);
          return "Email Sent!!";
        },
        error: (err) => err.data?.response.message || "Something went wrong",
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!!!");
    }
  };
  useEffect(() => {
    fetchColleges();
  }, []);
  const UploadImage = (folderName: string, imageName: string, path: string) => {
    if (!student.name) {
      toast.error("Name is required for images");
      return;
    }
    if (image) {
      if (image.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB");
        return;
      }
      const imageResponse = axios.postForm("/api/helper/upload-img", {
        file: image,
        name: imageName,
        folderName: folderName,
      });
      console.log(imageResponse);
      toast.promise(imageResponse, {
        loading: "Uploading Image...",
        success: (data: AxiosResponse) => {
          setStudent({
            ...student,
            [path]: data.data.path,
          });
          setShowUploadSuccess(true);
          return "Image Uploaded Successfully";
        },
        error: (err: unknown) => `This just happened: ${err}`,
      });
    }
  };

  const handleUpload = async () => {
    if (
      !student.name ||
      !student.email ||
      !student.phone ||
      !student.password ||
      !student.college ||
      !student.profileImage
    ) {
      toast.error("Please fill all the required fields");
      return;
    }
    try {
      const response = axios.post("/api/students/register", { student });
      toast.promise(response, {
        loading: "Creating your account...",
        success: () => {
          router.push("/login");
          return "Account created successfully!";
        },
        error: (err: unknown) => {
          return `This just happened: ${err}`;
        },
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!!!");
    }
  };

  return (
    <>
      <section className="bg-base-100 Orbitron py-4">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:min-h-screen lg:py-0">
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
                Create an account
              </h1>
              <p className="text-sm font-light text-center">
                Start your journey with Opportune
              </p>
              {/* Name */}
              <fieldset className="fieldset">
                <legend className="legend font-bold">
                  Name <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  className="input input-primary input-bordered w-full"
                  value={student.name}
                  onChange={(e) =>
                    setStudent({
                      ...student,
                      name: e.target.value
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" "),
                    })
                  }
                />
              </fieldset>
              {/* Email */}
              <fieldset className="fieldset">
                <legend className="legend font-bold">
                  Email <span className="text-error">*</span>{" "}
                </legend>
                <div className="join">
                  <input
                    type="email"
                    name="email"
                    placeholder="student@company.com"
                    disabled={isEmailVerified || student.name.length < 3}
                    className="input input-primary input-bordered w-full"
                    value={student.email}
                    onChange={(e) =>
                      setStudent({
                        ...student,
                        email: e.target.value.toLowerCase(),
                      })
                    }
                  />
                  {student.email.includes("@") &&
                    student.email.includes(".") &&
                    student.email.length > 5 &&
                    student.name.length > 2 &&
                    !isEmailVerified && (
                      <button
                        className="btn btn-primary join-item"
                        onClick={verifyEmail}
                      >
                        Verify
                      </button>
                    )}
                </div>
              </fieldset>
              {/* Phone */}
              <fieldset className="fieldset">
                <legend className="legend font-bold">
                  Phone <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  name="phone"
                  placeholder="+91 98765 43210"
                  className="input input-primary input-bordered w-full"
                  value={student.phone}
                  onChange={(e) =>
                    setStudent({
                      ...student,
                      phone:
                        e.target.value.length > 10
                          ? e.target.value.slice(0, 10)
                          : e.target.value,
                    })
                  }
                />
              </fieldset>
              {/* Profile Image */}
              <fieldset className="fieldset">
                <legend className="legend font-bold">
                  {" "}
                  Profile Image <span className="text-error">*</span>
                </legend>
                <div className="join">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!!student.profileImage || !student.name}
                    className="file-input file-input-primary file-input-bordered w-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImage(file);
                      }
                    }}
                  />
                  {image && !student.profileImage && (
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        UploadImage("students", student.name, "profileImage")
                      }
                    >
                      <IconUpload className="mr-2" />
                      Upload
                    </button>
                  )}
                </div>
              </fieldset>
              {/* College */}
              <fieldset className="fieldset">
                <legend className="legend font-bold">
                  College <span className="text-error">*</span>{" "}
                </legend>
                <select
                  className="select select-primary select-bordered w-full"
                  value={student.college}
                  onChange={(e) =>
                    setStudent({ ...student, college: e.target.value })
                  }
                >
                  <option value="">Select your college</option>
                  {college.length > 0 ? (
                    college.map((colg) => (
                      <option key={colg._id} value={colg._id}>
                        {colg.name}
                      </option>
                    ))
                  ) : (
                    <option value="">No colleges available</option>
                  )}
                </select>
              </fieldset>
              {/* Password */}
              <fieldset className="fieldset">
                <legend className="legend font-bold">
                  Password <span className="text-error">*</span>{" "}
                </legend>
                <div className="join">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className="input input-primary input-bordered w-full"
                    value={student.password}
                    onChange={(e) =>
                      setStudent({ ...student, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-square join-item"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </fieldset>
              {/* Terms and Conditions */}
              <div className="flex items-center">
                <label className="label cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  <span className="text-sm ml-2">
                    I agree to the{" "}
                    <Link href="#" className="text-primary hover:underline">
                      Terms and Conditions
                    </Link>
                  </span>
                </label>
              </div>
              <button
                className="btn btn-primary w-full mt-4 py-2"
                disabled={
                  !isEmailVerified ||
                  !student.name ||
                  !student.email ||
                  !student.password ||
                  !student.college ||
                  !student.phone ||
                  !student.profileImage
                }
                onClick={handleUpload}
              >
                Create Account
              </button>
              <p className="text-sm font-light text-base-content/70 text-center">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
      <dialog id="otpContainer" className="modal">
        <div className="modal-box space-y-6">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-base-content hover:text-primary transition duration-200">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-xl text-center text-base-content uppercase my-4">
            Please Enter The OTP
          </h3>

          <div className="flex justify-center gap-4">
            {/* OTP Input fields for 6 digits */}
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="input input-bordered input-primary text-center w-12 h-12 text-xl font-semibold placeholder:text-base-content/70"
                value={student.otp?.[index] ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d$/.test(value) || value === "") {
                    const otp = [...student.otp!];
                    otp[index] = value;
                    setStudent({ ...student, otp: otp.join("") });
                    if (value && index < 5) {
                      document
                        .getElementById(`otp-input-${index + 1}`)
                        ?.focus();
                    }
                  }
                }}
                id={`otp-input-${index}`}
                placeholder="●"
              />
            ))}
          </div>

          <button
            className="btn btn-primary w-full mt-4 py-2"
            onClick={(e) => {
              e.preventDefault();
              if (student.otp?.length === 6 && student.otp === otpSent) {
                setIsEmailVerified(true);
                (
                  document.getElementById("otpContainer") as HTMLDialogElement
                )?.close();
                toast.success("OTP Verified");
              } else {
                toast.error("Invalid OTP!!!");
              }
            }}
          >
            Verify
          </button>
        </div>
      </dialog>

      {showUploadSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-base-100 border border-success rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4 animate-fadeIn poppins">
            <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-outfit text-success">Image Uploaded!</h3>
            <p className="text-sm text-base-content/70 leading-relaxed">
              Your profile image has been uploaded successfully and linked to your registration form!
            </p>
            <button 
              onClick={() => setShowUploadSuccess(false)} 
              className="btn btn-success btn-sm w-full rounded-xl text-white"
            >
              Great, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
