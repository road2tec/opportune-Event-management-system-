"use client";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import { College } from "@/Types";
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
import CollegeCard from "./CollegeCard";

export default function ManageCollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [newCollege, setNewCollege] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    profileImage: "",
    address: {
      street: "",
      taluka: "",
      district: "",
      state: "",
      pincode: "",
    },
    website: "",
    admin: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [image, setImage] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/colleges");
      const data = await response.json();
      setColleges(data.colleges);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchColleges();
  }, []);

  const UploadImage = (folderName: string, imageName: string, path: string) => {
    if (!newCollege.name) {
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
          setNewCollege({
            ...newCollege,
            [path]: data.data.path,
          });
          setShowUploadSuccess(true);
          return "Image Uploaded Successfully";
        },
        error: (err: unknown) => `This just happened: ${err}`,
      });
    }
  };

  const validateCollege = () => {
    if (!newCollege.name) {
      toast.error("College Name is required");
      return false;
    }
    if (!newCollege.code) {
      toast.error("College Code is required");
      return false;
    }
    if (!newCollege.email) {
      toast.error("College Email is required");
      return false;
    }
    if (!newCollege.admin.email) {
      toast.error("College Admin Email is required");
      return false;
    }
    if (!newCollege.admin.password) {
      toast.error("Password is required");
      return false;
    }
    if (newCollege.admin.password !== newCollege.admin.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleAddCollege = async () => {
    if (validateCollege() === false) return;
    try {
      setLoading(true);
      const res = axios.post("/api/admin/add-college", { college: newCollege });
      toast.promise(res, {
        loading: "Adding College...",
        success: (data: AxiosResponse) => {
          fetchColleges();
          (
            document.getElementById("add-college-modal") as HTMLDialogElement
          ).close();
          return "College Added Successfully";
        },
        error: (err: unknown) => `This just happened: ${err}`,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredColleges = colleges.filter((college) =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;
  return (
    <>
      <Title
        title="Manage Colleges"
        subtitle="View and manage all registered colleges on the platform"
      />
      <div className="flex flex-row gap-6">
        <label
          htmlFor=""
          className="input input-primary input-bordered w-full mb-4"
        >
          <IconSearch size={16} />
          <input
            className="grow"
            value={searchTerm}
            name="search"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Colleges by their name..."
          />
        </label>
        <button
          className="btn btn-primary"
          onClick={() =>
            (
              document.getElementById("add-college-modal") as HTMLDialogElement
            ).showModal()
          }
        >
          + Add College
        </button>
      </div>
      {filteredColleges.length === 0 ? (
        <div className="text-2xl py-10 w-full text-center text-base-content/60">
          No Colleges Found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map((college) => (
            <CollegeCard key={college._id} college={college} />
          ))}
        </div>
      )}
      <dialog
        id="add-college-modal"
        className="modal bg-base-100/70 backdrop-blur-lg opacity-100"
      >
        <div className="modal-box w-11/12 max-w-5xl bg-base-100 backdrop-blur-lg Orbitron">
          <h3 className="font-bold text-2xl text-primary text-center py-2">
            Add New College!!!
          </h3>
          <div className="px-10 py-5 mx-auto bg-base-200 rounded-lg">
            <h1 className="border-b text-lg font-bold mb-4">College Details</h1>
            <div className="grid grid-cols-2 gap-4 my-4">
              {/* College Name */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  College Name <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the college name"
                  value={newCollege.name}
                  onChange={(e) =>
                    setNewCollege({ ...newCollege, name: e.target.value })
                  }
                />
              </fieldset>
              {/* College Code */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  College Code <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the college code"
                  value={newCollege.code}
                  onChange={(e) =>
                    setNewCollege({ ...newCollege, code: e.target.value })
                  }
                />
              </fieldset>
              {/* College Contact Email */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  College Contact Email <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the college contact email"
                  value={newCollege.email}
                  onChange={(e) =>
                    setNewCollege({ ...newCollege, email: e.target.value })
                  }
                />
                <span className="fieldset-label">
                  This will be used for college communications and for college
                  login.
                </span>
              </fieldset>
              {/* College Contact Phone */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  College Contact Phone <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the college contact phone"
                  value={newCollege.phone}
                  onChange={(e) =>
                    setNewCollege({ ...newCollege, phone: e.target.value })
                  }
                />
              </fieldset>
              {/* College Image */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  College Image <span className="text-error">*</span>{" "}
                </legend>
                <div className="join">
                  <input
                    type="file"
                    className="file-input file-input-bordered w-full join-item"
                    accept="image/* jpeg png"
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
                      UploadImage("colleges", newCollege.name, "profileImage")
                    }
                  >
                    <IconCloudUpload size={20} className="mr-2" />
                    Upload
                  </button>
                </div>
              </fieldset>
              {/* College Website */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  College Website <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the college website"
                  value={newCollege.website}
                  onChange={(e) =>
                    setNewCollege({ ...newCollege, website: e.target.value })
                  }
                />
              </fieldset>
            </div>
            <h1 className="border-b text-lg font-bold mb-4">Address Details</h1>
            {/* College Address */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                College Address <span className="text-error">*</span>{" "}
              </legend>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Enter the college address"
                value={newCollege.address.street}
                onChange={(e) =>
                  setNewCollege({
                    ...newCollege,
                    address: { ...newCollege.address, street: e.target.value },
                  })
                }
              />
            </fieldset>
            <div className="grid grid-cols-2 gap-4 my-4">
              {/* College Taluka */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  College Taluka <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the college taluka"
                  value={newCollege.address.taluka}
                  onChange={(e) =>
                    setNewCollege({
                      ...newCollege,
                      address: {
                        ...newCollege.address,
                        taluka:
                          e.target.value.charAt(0).toUpperCase() +
                          e.target.value.slice(1),
                      },
                    })
                  }
                />
              </fieldset>
              {/* College District */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  College District <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the college district"
                  value={newCollege.address.district}
                  onChange={(e) =>
                    setNewCollege({
                      ...newCollege,
                      address: {
                        ...newCollege.address,
                        district:
                          e.target.value.charAt(0).toUpperCase() +
                          e.target.value.slice(1),
                      },
                    })
                  }
                />
              </fieldset>
              {/* College State */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  College State <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the college state"
                  value={newCollege.address.state}
                  onChange={(e) =>
                    setNewCollege({
                      ...newCollege,
                      address: {
                        ...newCollege.address,
                        state:
                          e.target.value.charAt(0).toUpperCase() +
                          e.target.value.slice(1),
                      },
                    })
                  }
                />
              </fieldset>
              {/* College Pincode */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  College Pincode <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the college pincode"
                  value={newCollege.address.pincode}
                  onChange={(e) =>
                    setNewCollege({
                      ...newCollege,
                      address: {
                        ...newCollege.address,
                        pincode:
                          e.target.value.length <= 6
                            ? e.target.value
                            : newCollege.address.pincode,
                      },
                    })
                  }
                />
              </fieldset>
            </div>
            <h1 className="border-b text-lg font-bold mb-4">
              Administor Details
            </h1>
            <div className="grid grid-cols-2 gap-4 my-4">
              {/* College Admin Name */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  College Admin Name <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the college admin name"
                  value={newCollege.admin.name}
                  onChange={(e) =>
                    setNewCollege({
                      ...newCollege,
                      admin: {
                        ...newCollege.admin,
                        name:
                          e.target.value.charAt(0).toUpperCase() +
                          e.target.value.slice(1),
                      },
                    })
                  }
                />
              </fieldset>
              {/* College Admin Email */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  College Admin Email <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the college admin email"
                  value={newCollege.admin.email}
                  onChange={(e) =>
                    setNewCollege({
                      ...newCollege,
                      admin: {
                        ...newCollege.admin,
                        email: e.target.value.toLowerCase().trim() || "",
                      },
                    })
                  }
                />
                <span className="fieldset-label">
                  This will be used for college communications and for college
                  login.
                </span>
              </fieldset>
              {/* College Admin Phone */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  College Admin Phone <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the college admin phone"
                  value={newCollege.admin.phone}
                  onChange={(e) =>
                    setNewCollege({
                      ...newCollege,
                      admin: {
                        ...newCollege.admin,
                        phone:
                          e.target.value.length <= 10
                            ? e.target.value
                            : newCollege.admin.phone,
                      },
                    })
                  }
                />
              </fieldset>
              {/* College Website */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  College Website <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the college website"
                  readOnly
                  value={newCollege.website}
                  onChange={(e) =>
                    setNewCollege({
                      ...newCollege,
                      website: e.target.value,
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
                    value={newCollege.admin.password}
                    onChange={(e) =>
                      setNewCollege({
                        ...newCollege,
                        admin: {
                          ...newCollege.admin,
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
                    value={newCollege.admin.confirmPassword}
                    onChange={(e) =>
                      setNewCollege({
                        ...newCollege,
                        admin: {
                          ...newCollege.admin,
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
              onClick={() =>
                setNewCollege({
                  name: "",
                  code: "",
                  email: "",
                  phone: "",
                  profileImage: "",
                  address: {
                    street: "",
                    taluka: "",
                    district: "",
                    state: "",
                    pincode: "",
                  },
                  website: "",
                  admin: {
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    confirmPassword: "",
                  },
                })
              }
            >
              <IconRestore size={16} className="mr-2" />
              Reset
            </button>
            <button
              className="btn btn-primary mx-auto"
              onClick={handleAddCollege}
            >
              <IconPlus size={16} className="mr-2" />
              Submit
            </button>
            <button
              className="btn btn-secondary mx-auto"
              onClick={() => {
                (
                  document.getElementById(
                    "add-college-modal"
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
                  The college profile image has been uploaded successfully and linked!
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
        </div>
      </dialog>
    </>
  );
}
