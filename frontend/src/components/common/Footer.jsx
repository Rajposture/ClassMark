import { Link } from "react-router-dom"
import { Github, Mail, Linkedin } from "lucide-react"

const Footer = () => {
  return (
    <footer className="relative mt-24 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">

      {/* Subtle Glow Effect */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-600/20 blur-3xl rounded-full -z-0" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-600/20 blur-3xl rounded-full -z-0" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 z-10">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand Section */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              ClassMark
            </h2>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Smart attendance platform for modern classrooms.
              Secure, location-based and real-time.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-indigo-600 transition">
                <Github size={18} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-indigo-600 transition">
                <Linkedin size={18} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-indigo-600 transition">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Navigation
            </h3>
            <ul className="mt-6 space-y-4 text-sm text-slate-400">
              <li>
                <Link to="/teacher-dashboard" className="hover:text-white hover:translate-x-1 transition duration-200 inline-block">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/teacher/history" className="hover:text-white hover:translate-x-1 transition duration-200 inline-block">
                  Lecture History
                </Link>
              </li>
              <li>
                <Link to="/scan" className="hover:text-white hover:translate-x-1 transition duration-200 inline-block">
                  Scan QR
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Features */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Platform
            </h3>
            <ul className="mt-6 space-y-4 text-sm text-slate-400">
              <li>Real-time QR Attendance</li>
              <li>Geo-location Verification</li>
              <li>Role-based Authentication</li>
              <li>Excel Report Generation</li>
            </ul>
          </div>

          {/* CTA Section */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Built For
            </h3>
            <p className="mt-6 text-sm text-slate-400">
              Schools, colleges, and institutions that want
              smarter attendance tracking.
            </p>

            <button className="mt-6 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-xl text-sm font-medium shadow-lg">
              Get Started
            </button>
          </div>

        </div>

        {/* Divider */}
        <div className="mt-16 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">

          <p>
            © {new Date().getFullYear()} ClassMark. All rights reserved.
          </p>

          <div className="flex gap-6">
            <span className="hover:text-white transition cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-white transition cursor-pointer">
              Terms of Service
            </span>
          </div>

        </div>
      </div>
    </footer>
  )
}

export default Footer