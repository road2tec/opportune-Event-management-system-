import Navbar from "@/components/Navbar";
import "../globals.css";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <title>Opportune | One Platform. Infinite Opportunities</title>
        <meta
          name="description"
          content="Eventure is a next-generation web platform designed for students, clubs, and colleges to connect through events, competitions, and hackathons. It empowers students to discover opportunities, register for individual or team-based events, form cross-college collaborations, upload submissions, and track results — all in one place. With gamification, leaderboards, personalized recommendations, and real-time analytics, Eventure transforms the way students engage in academic and extracurricular activities. 
        
        Whether you’re a student looking to showcase your skills, an organizer hosting inter-college competitions, or an admin managing a network of colleges, Eventure provides the tools to grow, compete, and innovate."
        />
        <meta
          name="keywords"
          content="College events platform,Hackathon registration system,Inter-college competitions portal,Student event management system,Team-based event participation,Gamified student engagement,College fest management app,Cross-college collaboration events,AI-powered event recommendations"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Outfit:wght@100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`antialiased`}>
        <AuthProvider>
          <Toaster />
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
