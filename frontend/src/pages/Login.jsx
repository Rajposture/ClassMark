import { SignIn } from "@clerk/clerk-react";
import { motion } from "framer-motion";

const Login = () => {
  return (
    <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center px-4 py-8">

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            ClassMark
          </h1>
          <div className="w-12 h-[3px] bg-purple-500 mx-auto mt-3 rounded-full" />
        </div>

        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/signup"
          afterSignInUrl="/dashboard"
          appearance={{
            elements: {
              card:
                "shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-200 rounded-2xl",

              socialButtonsBlockButton:
                "bg-white border border-gray-300 text-gray-800 hover:bg-gray-900 hover:text-white transition rounded-xl",

              formFieldInput:
                "bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-400 rounded-xl",

              formButtonPrimary:
                "bg-gray-900 text-white hover:bg-purple-600 transition rounded-xl",

              footerActionLink:
                "text-purple-600 hover:text-purple-800"
            }
          }}
        />
      </motion.div>
    </div>
  );
};

export default Login;