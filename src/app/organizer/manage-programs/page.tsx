"use client";

import Loading from "@/components/Loading";
import Title from "@/components/Title";
import {
  IconCancel,
  IconCloudUpload,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconRestore,
  IconSearch,
} from "@tabler/icons-react";
import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Program } from "@/Types";
import ProgramCard from "./ProgramCard";

export default function ManageProgramPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [newProgram, setNewProgram] = useState({
    title: "",
    slug: "",
    description: "",
    coverImage: "",
    manager: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    programType: "",
    rules: "",
    roundsCount: 0,
    rounds: [
      {
        name: "",
        order: 1,
        startTime: new Date(),
        endTime: new Date(),
        instructions: "",
        submissionAllowed: false,
        scoringMethod: "automatic",
        maxScore: 0,
      },
    ],
    type: "individual" as "individual" | "team",
    teamSize: {
      min: 1,
      max: 1,
    },
    maxTeams: 0,
    pricePerTeam: 0,
    status: "draft",
    tags: [] as string[],
    submissionCriteria: "",
    prizes: [] as { title: string; amount: number }[],
    registrationStart: new Date(),
    registrationEnd: new Date(),
  });
  const [image, setImage] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [prizes, setPrizes] = useState<{ title: string; amount: number }>({
    title: "",
    amount: 0,
  });

  // Email verification states
  const [otpSent, setOtpSent] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  const verifyManagerEmail = async () => {
    const email = newProgram.manager.email;
    if (!email || !email.includes("@") || !email.includes(".")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!newProgram.manager.name) {
      toast.error("Please enter the manager name first");
      return;
    }
    try {
      const response = axios.post("/api/helper/verify-email", {
        name: newProgram.manager.name,
        email: email,
      });
      toast.promise(response, {
        loading: "Sending Verification OTP Email...",
        success: (data: AxiosResponse) => {
          (document.getElementById("otpContainer") as HTMLDialogElement).showModal();
          setOtpSent(data.data.token);
          return "Verification OTP Sent!";
        },
        error: (err: any) => err.response?.data?.message || "Failed to send email.",
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/programs/get-programs-by-organizer");
      const data = await response.json();
      setPrograms(data.programs);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const uploadImage = (folderName: string, imageName: string, path: string) => {
    if (!newProgram.title) {
      toast.error("Program title is required before uploading an image");
      return;
    }
    if (image) {
      if (image.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB");
        return;
      }

      const uploadPromise = axios.postForm("/api/helper/upload-img", {
        file: image,
        name: imageName,
        folderName,
      });

      toast.promise(uploadPromise, {
        loading: "Uploading image...",
        success: (data: AxiosResponse) => {
          setNewProgram({
            ...newProgram,
            [path]: data.data.path,
          });
          setShowUploadSuccess(true);
          return "Image uploaded successfully!";
        },
        error: (err: unknown) => `Upload failed: ${err}`,
      });
    } else toast.error("Please select an image first");
  };

  const validateProgram = () => {
    const p = newProgram;
    console.log("Starting program validation. Form state:", p);

    if (!p.title) {
      console.warn("Validation failed: Program title is missing.");
      return toast.error("Program title is required"), false;
    }
    if (!p.slug) {
      console.warn("Validation failed: Program slug is missing.");
      return toast.error("Program slug is required"), false;
    }
    if (!p.description) {
      console.warn("Validation failed: Program description is missing.");
      return toast.error("Program description is required"), false;
    }
    if (!p.programType) {
      console.warn("Validation failed: Program type is missing.");
      return toast.error("Program type is required"), false;
    }
    if (!p.manager.name) {
      console.warn("Validation failed: Manager name is missing.");
      return toast.error("Manager name is required"), false;
    }
    if (!p.manager.email) {
      console.warn("Validation failed: Manager email is missing.");
      return toast.error("Manager email is required"), false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(p.manager.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!isEmailVerified) {
      toast.error("Please verify the Manager Email first");
      return false;
    }
    if (!p.manager.phone) {
      console.warn("Validation failed: Manager phone is missing.");
      return toast.error("Manager phone is required"), false;
    }
    if (!p.coverImage) {
      console.warn("Validation failed: Program cover image is missing (Did you click the blue 'Upload' button?).");
      return toast.error("Program cover image is required"), false;
    }
    if (!p.manager.password) {
      console.warn("Validation failed: Password is missing.");
      return toast.error("Password is required"), false;
    }
    if (p.manager.password !== p.manager.confirmPassword) {
      console.warn(`Validation failed: Passwords do not match. Password: "${p.manager.password}", Confirm: "${p.manager.confirmPassword}"`);
      return toast.error("Passwords do not match"), false;
    }
    
    console.log("Validation successful! Submitting form...");
    return true;
  };

  const handleAddProgram = async () => {
    console.log("handleAddProgram button clicked!");
    if (!validateProgram()) {
      console.log("handleAddProgram stopped: validation failed.");
      return;
    }
    try {
      setLoading(true);
      (
        document.getElementById("add-program-modal") as HTMLDialogElement
      ).close();
      console.log("Sending POST request to /api/programs/add-program with payload:", newProgram);
      const res = axios.post("/api/programs/add-program", {
        program: newProgram,
      });
      toast.promise(res, {
        loading: "Adding program...",
        success: (data: AxiosResponse) => {
          console.log("Program added successfully! Response:", data);
          fetchPrograms();
          return "Program added successfully!";
        },
        error: (err: unknown) => {
          console.error("Program addition failed:", err);
          return `Error: ${err}`;
        },
      });
    } catch (error) {
      console.error("Catastrophic error in handleAddProgram:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter((program) =>
    program.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <>
      <Title
        title="Manage Programs"
        subtitle="Add and manage all your organized programs here"
      />

      {/* Search + Add */}
      <div className="flex flex-row gap-6">
        <label className="input input-bordered w-full mb-4 flex items-center gap-2">
          <IconSearch size={16} />
          <input
            className="grow"
            type="text"
            placeholder="Search Programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
        <button
          className="btn btn-primary"
          onClick={() =>
            (
              document.getElementById("add-program-modal") as HTMLDialogElement
            ).showModal()
          }
        >
          + Add Program
        </button>
      </div>

      {/* Cards */}
      {filteredPrograms.length === 0 ? (
        <div className="text-2xl py-10 w-full text-center text-base-content/60">
          No programs found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <ProgramCard key={program._id} program={program} />
          ))}
        </div>
      )}

      <dialog
        id="add-program-modal"
        className="modal bg-base-100/70 backdrop-blur-lg Orbitron"
      >
        <div className="modal-box w-11/12 max-w-5xl bg-base-100">
          <h3 className="font-bold text-2xl text-primary text-center py-2">
            Add New Program !!!
          </h3>

          <div className="px-10 py-5 mx-auto bg-base-200 rounded-lg">
            <h1 className="border-b text-lg font-bold mb-4">Program Details</h1>

            <div className="grid grid-cols-2 gap-4 my-4">
              {/* Title */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Program Title <span className="text-error">*</span>
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter title"
                  value={newProgram.title}
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      title: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                />
              </fieldset>

              {/* Slug */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Slug <span className="text-error">*</span>
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="auto-generated"
                  value={newProgram.slug}
                  readOnly
                />
              </fieldset>
            </div>

            {/* Description */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Description <span className="text-error">*</span>
              </legend>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Program Description"
                value={newProgram.description}
                onChange={(e) =>
                  setNewProgram({
                    ...newProgram,
                    description: e.target.value,
                  })
                }
              />
            </fieldset>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* Image Upload */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Cover Image
                  <span className="text-error">*</span>
                </legend>
                <div className="join">
                  <input
                    type="file"
                    className="file-input file-input-bordered w-full join-item"
                    accept="image/jpg, image/jpeg, image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setImage(file);
                    }}
                  />
                  <button
                    className="btn btn-primary join-item"
                    type="button"
                    onClick={() =>
                      uploadImage("programs", newProgram.title, "coverImage")
                    }
                  >
                    <IconCloudUpload size={20} className="mr-2" /> Upload
                  </button>
                </div>
              </fieldset>
              {/* Program Type */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Program Type
                  <span className="text-error">*</span>
                </legend>
                <select
                  name="programType"
                  value={newProgram.programType}
                  className="select select-bordered w-full"
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      programType: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  {[
                    "hackathon",
                    "coding",
                    "quiz",
                    "workshop",
                    "other",
                    "puzzle",
                    "ideathon",
                    "brainstorm",
                  ].map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </fieldset>
            </div>

            {/* Manager Info */}
            <h1 className="border-b text-lg font-bold my-4">
              Program Manager Details
            </h1>

            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Name <span className="text-error">*</span>
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Manager Name"
                  value={newProgram.manager.name}
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      manager: {
                        ...newProgram.manager,
                        name:
                          e.target.value.charAt(0).toUpperCase() +
                          e.target.value.slice(1),
                      },
                    })
                  }
                />
              </fieldset>

              {/* Email */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Email <span className="text-error">*</span>
                </legend>
                <div className="join w-full">
                  <input
                    type="email"
                    disabled={isEmailVerified}
                    className="input input-bordered w-full join-item"
                    placeholder="Manager Email"
                    value={newProgram.manager.email}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        manager: {
                          ...newProgram.manager,
                          email: e.target.value.toLowerCase().trim() || "",
                        },
                      })
                    }
                  />
                  {newProgram.manager.email.includes("@") &&
                    newProgram.manager.email.includes(".") &&
                    newProgram.manager.name.length > 2 && (
                      <button
                        type="button"
                        className={`btn join-item ${isEmailVerified ? "btn-success text-white cursor-default" : "btn-primary"}`}
                        onClick={verifyManagerEmail}
                      >
                        {isEmailVerified ? "Verified" : "Verify"}
                      </button>
                    )}
                </div>
              </fieldset>

              {/* Phone */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Phone <span className="text-error">*</span>
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Phone number"
                  value={newProgram.manager.phone}
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      manager: {
                        ...newProgram.manager,
                        phone: e.target.value.slice(0, 10),
                      },
                    })
                  }
                />
              </fieldset>

              {/* Tags */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Tags</legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="e.g. AI, Robotics, Coding"
                  value={newProgram.tags.join(", ")}
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      tags: e.target.value.split(",").map((tag) => tag.trim()),
                    })
                  }
                />
              </fieldset>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Password</legend>
                <div className="join">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    className="input input-bordered w-full join-item"
                    placeholder="Enter password"
                    value={newProgram.manager.password}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        manager: {
                          ...newProgram.manager,
                          password: e.target.value,
                        },
                      })
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-primary join-item"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? (
                      <IconEyeOff size={16} />
                    ) : (
                      <IconEye size={16} />
                    )}
                  </button>
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Confirm Password</legend>
                <div className="join">
                  <input
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    className="input input-bordered w-full join-item"
                    placeholder="Confirm password"
                    value={newProgram.manager.confirmPassword}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        manager: {
                          ...newProgram.manager,
                          confirmPassword: e.target.value,
                        },
                      })
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-primary join-item"
                    onClick={() =>
                      setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                    }
                  >
                    {isConfirmPasswordVisible ? (
                      <IconEyeOff size={16} />
                    ) : (
                      <IconEye size={16} />
                    )}
                  </button>
                </div>
              </fieldset>
            </div>
            {/* Program Information */}
            <h1 className="border-b text-lg font-bold my-4">
              Program Information
            </h1>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Rules & Guidelines
                <span className="text-error">*</span>
              </legend>
              <textarea
                name="programInformation"
                className="textarea textarea-bordered w-full"
                placeholder="Enter program rules, guidelines, and other information here..."
                value={newProgram.rules}
                onChange={(e) =>
                  setNewProgram({ ...newProgram, rules: e.target.value })
                }
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Total Number of Rounds <span className="text-error">*</span>
              </legend>
              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="e.g. 3"
                min={1}
                value={newProgram.roundsCount || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 0;
                  setNewProgram({
                    ...newProgram,
                    roundsCount: val,
                    rounds: Array.from(
                      { length: val || 1 },
                      (_, i) => ({
                        name: `Round ${i + 1}`,
                        order: i + 1,
                        startTime: new Date(),
                        endTime: new Date(),
                        instructions: "",
                        submissionAllowed: false,
                        scoringMethod: "automatic",
                        maxScore: 0,
                      })
                    ),
                  });
                }}
              />
            </fieldset>
            {newProgram.roundsCount > 0 && (
              <div className="alert alert-info mt-2">
                <span>
                  Note: You can edit round details after creating the program.
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Team Type */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Team Type <span className="text-error">*</span>
                </legend>
                <select
                  name="teamType"
                  value={newProgram.type}
                  className="select select-bordered w-full"
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      type: e.target.value as "individual" | "team",
                      teamSize:
                        e.target.value === "individual"
                          ? { min: 1, max: 1 }
                          : { min: 1, max: 1 },
                    })
                  }
                >
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                </select>
              </fieldset>
              {/* Max Teams count */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Maximum Teams Allowed <span className="text-error">*</span>
                </legend>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="e.g. 50"
                  min={1}
                  value={newProgram.maxTeams || ""}
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      maxTeams: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </fieldset>
              {/* Price Per Team */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Price Per Team (in ₹) <span className="text-error">*</span>
                </legend>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="e.g. 500"
                  min={0}
                  value={newProgram.pricePerTeam || ""}
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      pricePerTeam: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </fieldset>
              {/* Team Size - only if team type is 'team' */}
              {newProgram.type === "team" && (
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    Team Size (Min - Max) <span className="text-error">*</span>
                  </legend>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      placeholder="Min"
                      min={1}
                      value={newProgram.teamSize.min || ""}
                      onChange={(e) =>
                        setNewProgram({
                          ...newProgram,
                          teamSize: {
                            ...newProgram.teamSize,
                            min: parseInt(e.target.value, 10) || 0,
                          },
                        })
                      }
                    />
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      placeholder="Max"
                      min={1}
                      value={newProgram.teamSize.max || ""}
                      onChange={(e) =>
                        setNewProgram({
                          ...newProgram,
                          teamSize: {
                            ...newProgram.teamSize,
                            max: parseInt(e.target.value, 10) || 0,
                          },
                        })
                      }
                    />
                  </div>
                </fieldset>
              )}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Status <span className="text-error">*</span>
                </legend>
                <select
                  name="status"
                  value={newProgram.status}
                  className="select select-bordered w-full"
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </fieldset>
            </div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Submission Criteria <span className="text-error">*</span>
              </legend>
              <textarea
                name="submissionCriteria"
                className="textarea textarea-bordered w-full"
                placeholder="Criteria for submission"
                value={newProgram.submissionCriteria}
                onChange={(e) =>
                  setNewProgram({
                    ...newProgram,
                    submissionCriteria: e.target.value,
                  })
                }
              />
            </fieldset>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Registration Start */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Registration Start Date <span className="text-error">*</span>
                </legend>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={
                    newProgram.registrationStart.toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      registrationStart: new Date(e.target.value),
                    })
                  }
                />
              </fieldset>
              {/* Registration End */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Registration End Date <span className="text-error">*</span>
                </legend>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={newProgram.registrationEnd.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      registrationEnd: new Date(e.target.value),
                    })
                  }
                />
              </fieldset>
            </div>
            {/* Prizes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {newProgram.prizes.length > 0 && (
                <div className="col-span-3">
                  <h2 className="font-bold mb-2">Prizes Added:</h2>
                  <ul className="list-disc list-inside">
                    {newProgram.prizes.map((prize, index) => (
                      <li key={index}>
                        {prize.title} - ₹{prize.amount}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Prize Title</legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Prize Title"
                  value={prizes.title}
                  onChange={(e) =>
                    setPrizes({ ...prizes, title: e.target.value })
                  }
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Amount (in ₹)</legend>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="Amount (in ₹)"
                  min={0}
                  value={prizes.amount || ""}
                  onChange={(e) =>
                    setPrizes({
                      ...prizes,
                      amount: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </fieldset>
              <button
                className="btn btn-primary lg:mt-8.5"
                onClick={() => {
                  setNewProgram({
                    ...newProgram,
                    prizes: [...newProgram.prizes, prizes],
                  });
                  setPrizes({ title: "", amount: 0 });
                }}
              >
                <IconPlus size={16} className="mr-2" />
                Add More
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex mt-6 justify-center gap-4">
            <button
              className="btn btn-error btn-outline"
              onClick={() => window.location.reload()}
            >
              <IconRestore size={16} className="mr-2" />
              Reset
            </button>
            <button className="btn btn-primary" onClick={handleAddProgram}>
              <IconPlus size={16} className="mr-2" />
              Submit
            </button>
            <button
              className="btn btn-secondary"
              onClick={() =>
                (
                  document.getElementById(
                    "add-program-modal"
                  ) as HTMLDialogElement
                ).close()
              }
            >
              <IconCancel size={16} className="mr-2" />
              Cancel
            </button>
          </div>

          {showUploadSuccess && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-base-100 border border-success rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4 animate-fadeIn poppins">
                <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold font-outfit text-success">Image Uploaded!</h3>
                <p className="text-sm text-base-content/70 leading-relaxed">
                  The program cover image has been uploaded successfully and linked!
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

          {/* OTP Verification modal for Program Manager */}
          <dialog id="otpContainer" className="modal bg-black/60 backdrop-blur-sm z-[99999]">
            <div className="modal-box bg-base-100 border border-primary rounded-3xl p-6 space-y-6 Orbitron">
              <button 
                type="button"
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-base-content hover:text-primary transition duration-200"
                onClick={() => (document.getElementById("otpContainer") as HTMLDialogElement).close()}
              >
                ✕
              </button>
              <h3 className="font-bold text-xl text-center text-base-content uppercase my-4">
                Enter Manager OTP
              </h3>
              
              <div className="flex justify-center gap-3">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    className="input input-bordered input-primary text-center w-11 h-11 text-lg font-semibold placeholder:text-base-content/40"
                    value={otpInput[index] || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d$/.test(value) || value === "") {
                        const otp = otpInput.split("");
                        otp[index] = value;
                        setOtpInput(otp.join(""));
                        if (value && index < 5) {
                          document.getElementById(`otp-input-${index + 1}`)?.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otpInput[index] && index > 0) {
                        document.getElementById(`otp-input-${index - 1}`)?.focus();
                      }
                    }}
                    id={`otp-input-${index}`}
                    placeholder="●"
                  />
                ))}
              </div>

              <button
                type="button"
                className="btn btn-primary w-full mt-4 py-2 text-white font-bold"
                onClick={(e) => {
                  e.preventDefault();
                  if (otpInput.length === 6 && otpInput === otpSent) {
                    setIsEmailVerified(true);
                    (document.getElementById("otpContainer") as HTMLDialogElement).close();
                    toast.success("Program Manager Email Verified!");
                  } else {
                    toast.error("Invalid OTP! Please try again.");
                  }
                }}
              >
                Verify OTP
              </button>
            </div>
          </dialog>
        </div>
      </dialog>
    </>
  );
}
