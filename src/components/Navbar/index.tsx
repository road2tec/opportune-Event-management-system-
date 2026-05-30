"use client";
import { IconMenu3 } from "@tabler/icons-react";
import Link from "next/link";
import ThemeToggler from "./ThemeToggler";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function Navbar() {
  const currentPath = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuth();

  const links = [
    { name: "About", href: "/#about" },
    { name: "Features", href: "/#features" },
    { name: "Contact Us", href: "/#contact" },
  ];

  // Dynamically fetch user session on load if not already present
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await axios.get("/api/auth/verifytoken");
        if (res.data && res.data.user) {
          setUser(res.data.user);
        }
      } catch (e) {
        // Ignore session verify errors
      }
    };
    verifySession();
  }, [setUser]);

  const handleLogout = async () => {
    toast.promise(axios.get("/api/auth/logout"), {
      loading: "Logging out...",
      success: () => {
        setUser(null);
        router.push("/");
        router.refresh();
        return "Logged out successfully";
      },
      error: "Error logging out",
    });
  };

  const getDashboardHref = () => {
    if (!user) return "/";
    const role = (user as any).role?.toLowerCase();
    if (role === "student") return "/student/dashboard";
    if (role === "college") return "/college/dashboard";
    if (role === "organizer") return "/organizer/dashboard";
    if (role === "program-manager") return "/program-manager/dashboard";
    if (role === "admin") return "/admin/dashboard";
    return "/";
  };

  return (
    <div
      className={`navbar bg-background/80 backdrop-blur-lg border-b border-border Orbitron lg:px-10 text-base-content ${
        currentPath === "/" ? "fixed top-0 left-0 right-0 z-50" : ""
      }`}
    >
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <IconMenu3 size={24} />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            {links.map((link) => (
              <li key={link.name}>
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <Link href={user ? getDashboardHref() : "/"} className="space-x-3 flex items-center">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-[2px]">
              <img
                className="w-8 h-8 mr-2"
                src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
                alt="logo"
              />
              <span className="font-bold text-lg lg:text-2xl">Opportune</span>
              <span className="text-sm text-base-content/70 italic hidden lg:block">
                v1.0
              </span>
            </div>
            <hr className="w-full border border-base-content hidden lg:block" />
            <span className="text-sm text-base-content/70 italic hidden lg:block">
              Your Gateway to Opportunities
            </span>
          </div>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {links.map((link) => (
            <li key={link.name}>
              <Link href={link.href} className="text-base font-semibold">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-end gap-2">
        <ThemeToggler />
        {user ? (
          <>
            <Link href={getDashboardHref()} className="btn btn-accent">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-outline">
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link href="/register" className="btn btn-secondary btn-outline">
              Sign Up
            </Link>
            <Link href="/login" className="btn btn-accent">
              Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
