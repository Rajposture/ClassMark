import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="relative mt-24">

      <div className="backdrop-blur-2xl bg-white/60 border-t border-white/30 shadow-inner">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">

          {/* Top Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-slate-700">

            {/* Brand */}
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                ClassMark
              </h2>
              <p className="mt-4 text-sm text-slate-500 leading-relaxed max-w-sm mx-auto sm:mx-0">
                Smart attendance system built for modern classrooms.
                Secure, location-based, and real-time.
              </p>
            </div>

            {/* Navigation */}
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Navigation
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link to="/dashboard" className="hover:text-indigo-600 transition">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/assignments" className="hover:text-indigo-600 transition">
                    Assignments
                  </Link>
                </li>
                <li>
                  <Link to="/scan" className="hover:text-indigo-600 transition">
                    Scan QR
                  </Link>
                </li>
              </ul>
            </div>

            {/* Platform Info */}
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Platform
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-500">
                <li>Real-time QR Attendance</li>
                <li>Geo-location Verification</li>
                <li>Secure Role Authentication</li>
              </ul>
            </div>

          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} ClassMark. All rights reserved.
          </div>

        </div>
      </div>

    </footer>
  )
}

export default Footer