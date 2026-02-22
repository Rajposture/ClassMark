import { SignUp } from "@clerk/clerk-react"
import { motion } from "framer-motion"

const Signup = () => {
  return (
    <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center px-4 py-10">

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md sm:max-w-lg"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Join ClassMark
          </p>
          <div className="w-12 h-[3px] bg-purple-500 mx-auto mt-4 rounded-full" />
        </div>

<SignUp
  routing="path"
  path="/signup"
  signInUrl="/login"
  forceRedirectUrl="/complete-profile"
  fallbackRedirectUrl="/complete-profile"
  appearance={{
    elements: {
      card:
        "shadow-[0_15px_50px_rgba(0,0,0,0.08)] border border-gray-200 rounded-2xl",
      formFieldInput:
        "bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-400 rounded-xl",
      formButtonPrimary:
        "bg-gray-900 text-white hover:bg-purple-600 transition rounded-xl",
      socialButtonsBlockButton:
        "bg-white border border-gray-300 hover:bg-gray-900 hover:text-white transition rounded-xl",
      footerActionLink:
        "text-purple-600 hover:text-purple-800"
    }
  }}
/>

      </motion.div>
    </div>
  )
}

export default Signup