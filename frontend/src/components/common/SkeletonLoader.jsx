import { motion } from "framer-motion"

const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent"

const SkeletonLoader = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-6 py-28">

      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="space-y-4">
          <div className={`h-8 w-64 bg-gray-200 rounded-lg ${shimmer}`} />
          <div className={`h-4 w-96 bg-gray-200 rounded-md ${shimmer}`} />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {[1,2,3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/60 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-xl p-6 space-y-6"
            >
              <div className={`h-6 w-40 bg-gray-200 rounded-lg ${shimmer}`} />
              <div className={`h-4 w-full bg-gray-200 rounded-md ${shimmer}`} />
              <div className={`h-4 w-3/4 bg-gray-200 rounded-md ${shimmer}`} />
              <div className={`h-10 w-32 bg-gray-200 rounded-xl ${shimmer}`} />
            </motion.div>
          ))}

        </div>

        {/* Table Skeleton */}
        <div className="bg-white/60 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-xl p-8 space-y-6">

          <div className={`h-6 w-48 bg-gray-200 rounded-lg ${shimmer}`} />

          {[1,2,3,4].map((row) => (
            <div key={row} className="grid grid-cols-3 gap-6">
              <div className={`h-4 bg-gray-200 rounded-md ${shimmer}`} />
              <div className={`h-4 bg-gray-200 rounded-md ${shimmer}`} />
              <div className={`h-4 bg-gray-200 rounded-md ${shimmer}`} />
            </div>
          ))}

        </div>

      </div>

      <style>
        {`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        `}
      </style>

    </div>
  )
}

export default SkeletonLoader