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
import { College, Event } from "@/Types";
import EventCard from "./EventCard";
import { useAuth } from "@/context/AuthContext";

export default function ManageEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    slug: "",
    description: "",
    organizer: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    startDate: new Date(),
    endDate: new Date(),
    status: "draft",
    coverImage: "",
    tags: [""],
  });
  const [image, setImage] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  // Email verification states
  const [otpSent, setOtpSent] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  const verifyOrganizerEmail = async () => {
    const email = newEvent.organizer.email;
    if (!email || !email.includes("@") || !email.includes(".")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!newEvent.organizer.name) {
      toast.error("Please enter the organizer name first");
      return;
    }
    try {
      const response = axios.post("/api/helper/verify-email", {
        name: newEvent.organizer.name,
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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/events/get-events-by-college");
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEvents();
  }, []);

  const UploadImage = (folderName: string, imageName: string, path: string) => {
    if (!newEvent.title) {
      toast.error("Title is required for images");
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
          setNewEvent({
            ...newEvent,
            [path]: data.data.path,
          });
          setShowUploadSuccess(true);
          return "Image Uploaded Successfully";
        },
        error: (err: unknown) => `This just happened: ${err}`,
      });
    }
  };

  const validateEvent = () => {
    if (!newEvent.title) {
      toast.error("Event Title is required");
      return false;
    }
    if (!newEvent.slug) {
      toast.error("Event Slug is required");
      return false;
    }
    if (!newEvent.description) {
      toast.error("Event Description is required");
      return false;
    }
    if (!newEvent.startDate) {
      toast.error("Event Start Date is required");
      return false;
    }
    if (!newEvent.endDate) {
      toast.error("Event End Date is required");
      return false;
    }
    if (newEvent.endDate < newEvent.startDate) {
      toast.error("End Date cannot be before Start Date");
      return false;
    }
    if (!newEvent.organizer.name) {
      toast.error("Event Organizer Name is required");
      return false;
    }
    if (!newEvent.organizer.email) {
      toast.error("Event Organizer Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEvent.organizer.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!isEmailVerified) {
      toast.error("Please verify the Organizer Email first");
      return false;
    }
    if (!newEvent.organizer.phone) {
      toast.error("Event Organizer Phone is required");
      return false;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(newEvent.organizer.phone)) {
      toast.error("Invalid phone number format");
      return false;
    }
    if (!newEvent.organizer.password) {
      toast.error("Password is required");
      return false;
    }
    if (newEvent.organizer.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    if (newEvent.organizer.password !== newEvent.organizer.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!newEvent.coverImage) {
      toast.error("Event Cover Image is required");
      return false;
    }
    return true;
  };

  const handleAddEvent = async () => {
    if (validateEvent() === false) return;
    try {
      setLoading(true);
      (document.getElementById("add-event-modal") as HTMLDialogElement).close();
      const res = axios.post("/api/events/add-event", { event: newEvent });
      toast.promise(res, {
        loading: "Adding Event...",
        success: (data: AxiosResponse) => {
          fetchEvents();
          return "Event Added Successfully";
        },
        error: (err: unknown) => `This just happened: ${err}`,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;
  return (
    <>
      <Title
        title="Manage Events"
        subtitle="View and manage all registered events on the platform"
      />
      <div className="flex flex-row gap-6">
        <label
          htmlFor=""
          className="input input-primary input-bordered w-full mb-4"
        >
          <IconSearch size={16} />
          <input
            className="grow"
            type="text"
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Events by their name..."
          />
        </label>
        <button
          className="btn btn-primary"
          onClick={() =>
            (
              document.getElementById("add-event-modal") as HTMLDialogElement
            ).showModal()
          }
        >
          + Add Event
        </button>
      </div>
      {filteredEvents.length === 0 ? (
        <div className="text-2xl py-10 w-full text-center text-base-content/60">
          No Events Found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
      <dialog
        id="add-event-modal"
        className="modal bg-base-100/70 backdrop-blur-lg opacity-100"
      >
        <div className="modal-box w-11/12 max-w-5xl bg-base-100 backdrop-blur-lg Orbitron">
          <h3 className="font-bold text-2xl text-primary text-center py-2">
            Add New Event!!!
          </h3>
          <div className="px-10 py-5 mx-auto bg-base-200 rounded-lg">
            <h1 className="border-b text-lg font-bold mb-4">Event Details</h1>
            <div className="grid grid-cols-2 gap-4 my-4">
              {/* Event Name */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Event Name <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Event name"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      title: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                />
              </fieldset>
              {/* Event Slug */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Event Slug <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Event slug"
                  value={newEvent.slug}
                  readOnly
                />
              </fieldset>
              {/* Start Date */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Start Date <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  placeholder="Enter the Event start date"
                  value={newEvent.startDate.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      startDate: new Date(e.target.value),
                    })
                  }
                />
              </fieldset>
              {/* End Date */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  End Date <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  min={newEvent.startDate.toISOString().split("T")[0]}
                  placeholder="Enter the Event end date"
                  value={newEvent.endDate.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      endDate: new Date(e.target.value),
                    })
                  }
                />
              </fieldset>
            </div>
            {/* Event Description */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Event Description <span className="text-error">*</span>{" "}
              </legend>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Enter the Event description"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
              />
            </fieldset>
            {/* Event Image */}
            <fieldset className="fieldset mt-2">
              <legend className="fieldset-legend">
                Event Cover Image <span className="text-error">*</span>{" "}
              </legend>
              <div className="join">
                <input
                  type="file"
                  className="file-input file-input-bordered w-full join-item"
                  accept="image/jpg, image/jpeg, image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImage(file);
                    }
                  }}
                />
                <button
                  className="btn btn-primary join-item"
                  onClick={() =>
                    UploadImage("events", newEvent.title, "coverImage")
                  }
                >
                  <IconCloudUpload size={20} className="mr-2" />
                  Upload
                </button>
              </div>
            </fieldset>

            <h1 className="border-b text-lg font-bold my-4">
              Event Organizer Details
            </h1>
            <div className="grid grid-cols-2 gap-4 my-4">
              {/* Event organizer Name */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Event organizer Name <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Event organizer name"
                  value={newEvent.organizer.name}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      organizer: {
                        ...newEvent.organizer,
                        name:
                          e.target.value.charAt(0).toUpperCase() +
                          e.target.value.slice(1),
                      },
                    })
                  }
                />
              </fieldset>
              {/* Event organizer Email */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Event Organizer Email <span className="text-error">*</span>{" "}
                </legend>
                <div className="join w-full">
                  <input
                    type="text"
                    disabled={isEmailVerified}
                    className="input input-bordered w-full join-item"
                    placeholder="Enter the Event organizer email"
                    value={newEvent.organizer.email}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        organizer: {
                          ...newEvent.organizer,
                          email: e.target.value.toLowerCase().trim() || "",
                        },
                      })
                    }
                  />
                  {newEvent.organizer.email.includes("@") &&
                    newEvent.organizer.email.includes(".") &&
                    newEvent.organizer.name.length > 2 && (
                      <button
                        type="button"
                        className={`btn join-item ${isEmailVerified ? "btn-success text-white cursor-default" : "btn-primary"}`}
                        onClick={verifyOrganizerEmail}
                      >
                        {isEmailVerified ? "Verified" : "Verify"}
                      </button>
                    )}
                </div>
                <span className="fieldset-label">
                  This will be used for Event communications and for Event
                  login.
                </span>
              </fieldset>
              {/* Event organizer Phone */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Event organizer Phone <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Event organizer phone"
                  value={newEvent.organizer.phone}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      organizer: {
                        ...newEvent.organizer,
                        phone:
                          e.target.value.length <= 10
                            ? e.target.value
                            : newEvent.organizer.phone,
                      },
                    })
                  }
                />
              </fieldset>
              {/* Event Tags */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Event Tags <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Event tags"
                  value={newEvent.tags}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      tags: e.target.value.split(",").map((tag) => tag.trim()),
                    })
                  }
                />
              </fieldset>

              {/* Password */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Password <span className="text-error">*</span>{" "}
                </legend>
                <div className="join">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    className="input input-bordered w-full join-item"
                    placeholder="Enter the password"
                    value={newEvent.organizer.password}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        organizer: {
                          ...newEvent.organizer,
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
              {/* Confirm Password */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Confirm Password <span className="text-error">*</span>{" "}
                </legend>
                <div className="join">
                  <input
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    className="input input-bordered w-full"
                    placeholder="Enter the confirm password"
                    value={newEvent.organizer.confirmPassword}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        organizer: {
                          ...newEvent.organizer,
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
          </div>
          <div className="flex mt-6 justify-center gap-4">
            <button
              className="btn btn-error btn-outline mx-auto"
              onClick={() => window.location.reload()}
            >
              <IconRestore size={16} className="mr-2" />
              Reset
            </button>
            <button
              className="btn btn-primary mx-auto"
              onClick={handleAddEvent}
            >
              <IconPlus size={16} className="mr-2" />
              Submit
            </button>
            <button
              className="btn btn-secondary mx-auto"
              onClick={() => {
                (
                  document.getElementById(
                    "add-event-modal"
                  ) as HTMLDialogElement
                ).close();
              }}
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
                  The event cover image has been uploaded successfully and linked!
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

          {/* OTP Verification modal for Event Organizer */}
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
                Enter Organizer OTP
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
                    toast.success("Event Organizer Email Verified!");
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
