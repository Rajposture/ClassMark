import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Link } from "react-router-dom";
import classroomVideo from "../assets/videos/classroom.mp4";

const Landing = () => {
  return (
    <div className="bg-slate-50">
      <Navbar />

      {/* HERO SECTION WITH VIDEO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">

        {/* 🎥 Background Video */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={classroomVideo}
          autoPlay
          loop
          muted
          playsInline
        />

        {/* 🌑 Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* 🧠 Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            ClassMark
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-200">
            Smart Attendance. Zero Proxy.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="px-8 py-3 rounded-xl border border-white/40 text-white hover:bg-white/10 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
