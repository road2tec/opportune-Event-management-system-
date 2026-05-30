"use client";

import {
  IconCircleChevronRight,
  IconGraph,
  IconMailOpened,
  IconRocket,
  IconSchool,
  IconTrophy,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import CountUp from "react-countup";

export default function LandingPage() {
  return (
    <div className="mx-auto Orbitron">
      {/* Hero Section */}
      <section className="hero min-h-screen bg-gradient-to-br from-primary via-neutral to-secondary text-base-content backdrop-blur-lg border-b border-border">
        <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
          <div className="mr-auto place-self-center lg:col-span-7">
            <h1 className="max-w-2xl mb-4 text-4xl text-base-content font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl">
              Welcome to <span className="text-accent">Opportune</span>
            </h1>
            <p className="max-w-2xl mb-6 font-light text-base-content/70 lg:mb-8 md:text-lg lg:text-xl">
              The futuristic hub for cross-college{" "}
              <span className="text-primary font-bold">
                competitions, events, and hackathons
              </span>
              . Connect. Compete. Grow. 🚀
              <br /> One Platform. Infinite Opportunities. Discover, compete,
              and grow with students and colleges worldwide.{" "}
              <strong>Join us today!</strong>
            </p>
            <a
              href="/student/ongoing-events"
              className="btn btn-primary text-base font-medium text-center rounded-lg mr-4"
            >
              Explore Events
              <IconCircleChevronRight />
            </a>
            <a
              href="/register"
              className="btn btn-outline text-base font-medium text-center rounded-lg mr-4"
            >
              Get Started for Free
            </a>
          </div>
          <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
            <img src="/background-image.png" alt="hero image" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        className="w-full py-20 px-6 md:px-16 bg-base-200 min-h-screen"
        id="about"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-primary">About Opportune</h2>
          <p className="mt-6 text-lg opacity-80 poppins">
            Opportune is the ultimate platform where colleges, clubs, and
            students come together to{" "}
            <span className="text-accent">
              create, discover, and participate{" "}
            </span>
            in life-changing competitions. Whether it’s hackathons, cultural
            fests, or skill challenges —{" "}
            <span className="text-secondary font-semibold">
              we’ve got it all
            </span>
            .
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-10 mt-16 max-w-6xl mx-auto">
          <div className="mt-12 max-w-4xl mx-auto bg-base-100 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <IconSchool className="text-4xl text-primary mr-4" />
              <h3 className="text-2xl font-bold">For Colleges & Clubs</h3>
            </div>
            <p className="opacity-80">
              Host and manage cross-college events with ease. From registrations
              to analytics, everything you need is at your fingertips.
            </p>
          </div>
          <div className="mt-12 max-w-4xl mx-auto bg-base-100 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <IconUsers className="text-4xl text-secondary mr-4" />
              <h3 className="text-2xl font-bold">For Students</h3>
            </div>
            <p className="opacity-80">
              Discover a world of opportunities. Join events, form teams,
              showcase your skills, and climb leaderboards — all in one place.
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-10 mt-16 max-w-6xl mx-auto">
          {[
            {
              icon: <IconSchool className="text-4xl text-primary" size={25} />,
              number: 100,
              title: "Colleges",
              description: "Join a vast network of institutions worldwide.",
            },
            {
              icon: <IconUsers className="text-4xl text-secondary" size={25} />,
              number: 5000,
              title: "Events",
              description: "From hackathons to cultural fests, find it all.",
            },
            {
              icon: <IconUsers className="text-4xl text-secondary" size={25} />,
              number: 20000,
              title: "Students",
              description: "Connect and compete with peers globally.",
            },
            {
              icon: <IconTrophy className="text-4xl text-accent" size={25} />,
              number: 100,
              title: "Competitions",
              description: "Showcase your skills and win exciting prizes.",
            },
          ].map((stat, index) => (
            <div key={index} className="bg-base-100 p-6 rounded-lg shadow-lg">
              <div className="mb-4 flex items-center justify-center">
                {stat.icon}
              </div>
              <h4 className="text-xl font-bold">
                <CountUp start={0} end={stat.number} duration={10} />+{" "}
                {stat.title}
              </h4>
              <p className="mt-2 opacity-80">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section
        className="w-full py-20 px-6 md:px-20 bg-gradient-to-b from-base-100 via-base-200 to-base-300 min-h-screen"
        id="features"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-accent mb-12">
            Futuristic Features
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl border border-primary hover:scale-105 transition">
              <div className="card-body items-center">
                <IconRocket className="text-5xl text-primary mb-4" size={30} />
                <h3 className="card-title text-lg">Cross-College Events</h3>
                <p className="opacity-70">
                  Participate in events hosted by multiple colleges & clubs on
                  one platform.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl border border-secondary hover:scale-105 transition">
              <div className="card-body items-center">
                <IconUser className="text-5xl text-secondary mb-4" size={30} />
                <h3 className="card-title text-lg">Team Collaboration</h3>
                <p className="opacity-70">
                  Find teammates, join groups, and collaborate across campuses
                  seamlessly.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl border border-accent hover:scale-105 transition">
              <div className="card-body items-center">
                <IconTrophy className="text-5xl text-accent mb-4" size={30} />
                <h3 className="card-title text-lg">Leaderboards & Rewards</h3>
                <p className="opacity-70">
                  Track your progress, climb leaderboards, and earn rewards &
                  badges.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl border border-primary hover:scale-105 transition">
              <div className="card-body items-center">
                <IconGraph className="text-5xl text-primary mb-4" size={30} />
                <h3 className="card-title text-lg">Smart Analytics</h3>
                <p className="opacity-70">
                  Organizers and admins get deep insights into registrations,
                  feedback, and success metrics.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl border border-secondary hover:scale-105 transition">
              <div className="card-body items-center">
                <IconRocket
                  className="text-5xl text-secondary mb-4"
                  size={30}
                />
                <h3 className="card-title text-lg">AI Chatbot</h3>
                <p className="opacity-70">
                  Get instant answers to FAQs like event timings, venues, and
                  deadlines using AI.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl border border-accent hover:scale-105 transition">
              <div className="card-body items-center">
                <IconUsers className="text-5xl text-accent mb-4" size={30} />
                <h3 className="card-title text-lg">Gamified Experience</h3>
                <p className="opacity-70">
                  Earn points, showcase achievements, and compete across global
                  leaderboards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full py-20 px-6 md:px-20 bg-base-200" id="contact">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-primary">Contact Us</h2>
          <p className="mt-4 opacity-80">
            Have questions or want to collaborate? Drop us a message below 👇
          </p>

          <form className="mt-8 grid gap-6">
            <input
              type="text"
              placeholder="Your Name"
              className="input input-bordered w-full bg-base-100"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="input input-bordered w-full bg-base-100"
            />
            <textarea
              placeholder="Your Message"
              className="textarea textarea-bordered w-full bg-base-100 h-32"
            ></textarea>
            <button className="btn btn-accent w-full btn-lg">
              <IconMailOpened className="mr-2" /> Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
