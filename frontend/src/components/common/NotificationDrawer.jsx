import { motion, AnimatePresence } from "framer-motion";

const NotificationDrawer = ({ open, onClose, notifications }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[85%] sm:w-[400px] bg-white shadow-2xl z-50 p-6 overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-6">
              Notifications
            </h2>

            {notifications.map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 p-4 rounded-2xl mb-4 shadow-sm"
              >
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-gray-500">
                  {n.message}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationDrawer;
