import { motion, AnimatePresence } from "framer-motion"
import { Bell, X } from "lucide-react"

const NotificationDrawer = ({ open, onClose, notifications }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* DRAWER */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="
              fixed right-0 top-0 h-full 
              w-[90%] sm:w-[420px] 
              bg-white shadow-2xl 
              z-50 flex flex-col
              rounded-l-3xl
            "
          >
            {/* HEADER */}
            <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="text-indigo-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h2>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">

              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-gray-400 mt-20">
                  <Bell size={40} className="mb-4 opacity-40" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="
                      bg-gradient-to-br from-gray-50 to-gray-100
                      p-4 rounded-2xl shadow-sm
                      hover:shadow-md transition
                      border border-gray-100
                    "
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-gray-900 text-sm">
                        {n.title}
                      </p>
                      {n.time && (
                        <span className="text-xs text-gray-400">
                          {n.time}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      {n.message}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default NotificationDrawer