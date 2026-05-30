"use client";
import { Admin, College, Event, Program, Student } from "@/Types";
import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  user: Student | Admin | College | Event | Program | null;
  setUser: (user: Student | Admin | College | Event | Program | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<
    Student | Admin | College | Event | Program | null
  >(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
