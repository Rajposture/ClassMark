import { useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, Sparkles, MessageCircle, AlertTriangle, CheckCircle2 } from "lucide-react"

/**
 * NotificationDrawer
 * ------------------------------------------------------------------
 * Design intent
 * - Subject: notifications are about *time and attention* — a ranked
 *   stream of things that happened, freshest first. The visual language
 *   leans into that: relative timestamps, a soft "unread" pulse, and a
 *   spring-driven stagger that feels like items arriving, not just
 *   fading in.
 * - Type: "Fraunces" (a warm, slightly editorial display serif) for the
 *   header — gives the panel a point of view instead of system-UI
 *   sameness — paired with "Inter" for body copy, which stays calm and
 *   highly legible at small sizes.
 * - Responsive: full-height bottom-anchored sheet on mobile (drag handle,
 *   rounded top only), right-docked panel with full rounding on desktop.
 * - Signature element: the unread dot doesn't just sit there — it has a
 *   slow ambient pulse, and unread cards get a soft indigo wash that
 *   clears the moment they're read.
 * ------------------------------------------------------------------
 */

const FONT_LINK_ID = "notification-drawer-fonts"

function useFonts() {
  if (typeof document !== "undefined" && !document.getElementById(FONT_LINK_ID)) {
    const link = document.createElement("link")
    link.id = FONT_LINK_ID
    link.rel = "stylesheet"
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap"
    document.head.appendChild(link)
  }
}

const TYPE_META = {
  info: { icon: Sparkles, ring: "ring-indigo-200", fg: "text-indigo-600", bg: "bg-indigo-50" },
  message: { icon: MessageCircle, ring: "ring-sky-200", fg: "text-sky-600", bg: "bg-sky-50" },
  warning: { icon: AlertTriangle, ring: "ring-amber-200", fg: "text-amber-600", bg: "bg-amber-50" },
  success: { icon: CheckCircle2, ring: "ring-emerald-200", fg: "text-emerald-600", bg: "bg-emerald-50" },
}

function timeAgo(date) {
  const diffMs = Date.now() - new Date(date).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return "Just now"
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

const NotificationDrawer = ({ open, onClose, notifications = [], onMarkRead }) => {
  useFonts()
  const unreadCount = notifications.filter((n) => !n.read).length

  const content = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-[3px] z-40"
          />

          {/* Panel: bottom sheet on mobile, right-docked on sm+ */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            className="
              fixed inset-x-0 bottom-0 sm:inset-x-auto sm:right-0 sm:top-0
              h-[88vh] sm:h-full
              w-full sm:w-[420px] md:w-[460px]
              bg-white
              shadow-[0_-8px_40px_-12px_rgba(15,23,42,0.25)] sm:shadow-[-12px_0_40px_-12px_rgba(15,23,42,0.18)]
              z-50 flex flex-col
              rounded-t-[28px] sm:rounded-t-none sm:rounded-l-[28px]
              overflow-hidden
            "
          >
            {/* drag handle, mobile only */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-10 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
            <div className="px-6 sm:px-7 pt-3 sm:pt-7 pb-5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="relative inline-flex">
                    <Bell className="text-indigo-600" size={19} strokeWidth={2.2} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
                      </span>
                    )}
                  </span>
                  <h2
                    style={{ fontFamily: "'Fraunces', serif", fontOpticalSizing: "auto" }}
                    className="text-[22px] leading-none font-semibold text-slate-900 tracking-tight"
                  >
                    Notifications
                  </h2>
                </div>
                <p className="mt-1.5 text-[13px] text-slate-400 pl-[1px]">
                  {unreadCount > 0
                    ? `${unreadCount} unread, freshest first`
                    : "You're all caught up"}
                </p>
              </div>

              <button
                onClick={onClose}
                aria-label="Close notifications"
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                <X size={18} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-2.5">
              {!notifications?.length ? (
                <div className="flex flex-col items-center justify-center text-center mt-16 px-6">
                  <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                    <Bell size={26} className="text-slate-300" strokeWidth={1.8} />
                  </div>
                  <p
                    style={{ fontFamily: "'Fraunces', serif" }}
                    className="text-base font-medium text-slate-700"
                  >
                    Nothing here yet
                  </p>
                  <p className="text-[13px] text-slate-400 mt-1 max-w-[220px]">
                    New activity will show up here the moment it happens.
                  </p>
                </div>
              ) : (
                notifications.map((n, i) => {
                  const meta = TYPE_META[n.type] || TYPE_META.info
                  const Icon = meta.icon
                  return (
                    <motion.div
                      key={n._id || i}
                      layout
                      initial={{ opacity: 0, y: 18, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 28,
                        delay: Math.min(i * 0.045, 0.4),
                      }}
                      whileHover={{ y: -1 }}
                      onClick={() => onMarkRead?.(n._id ?? i)}
                      className={`
                        group relative cursor-pointer
                        p-4 rounded-2xl
                        border transition-all duration-200
                        ${n.read
                          ? "bg-white border-slate-100 hover:border-slate-200"
                          : "bg-indigo-50/50 border-indigo-100 hover:border-indigo-200"}
                        hover:shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08)]
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center ring-1 ${meta.ring} ${meta.bg}`}
                        >
                          <Icon size={16} className={meta.fg} strokeWidth={2.2} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-semibold text-slate-900 text-[13.5px] leading-snug">
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                          {n.createdAt && (
                            <span className="text-[11px] text-slate-400 mt-1.5 inline-block tracking-wide">
                              {timeAgo(n.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  if (typeof document === "undefined") return null
  return createPortal(content, document.body)
}

export default NotificationDrawer