import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import DashboardLayout from "../common/DashboardLayout"
import api from "../../utils/axios"

const LectureHistory = () => {
  const [lectures, setLectures] = useState([])
  const [selectedLecture, setSelectedLecture] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get("/lectures/history")
        setLectures(res.data.lectures || [])
      } catch {
        setLectures([])
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  const handleExcelDownload = async (lectureId, subject) => {
    try {
      const res = await api.get(`/lectures/${lectureId}/excel`, {
        responseType: "blob"
      })

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      })

      const url = window.URL.createObjectURL(blob)

      const safeSubject = subject.replace(/[^a-z0-9]/gi, "_").toLowerCase()

      const a = document.createElement("a")
      a.href = url
      a.download = `${safeSubject}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(url)
    } catch {
      alert("Failed to generate Excel")
    }
  }

  const handleMonthlyDownload = async (lectureId, subject) => {
    try {
      const res = await api.get(`/lectures/${lectureId}/monthly-excel`, {
        responseType: "blob"
      })

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      })

      const url = window.URL.createObjectURL(blob)

      const safeSubject = subject.replace(/[^a-z0-9]/gi, "_").toLowerCase()

      const a = document.createElement("a")
      a.href = url
      a.download = `${safeSubject}_monthly.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(url)
    } catch {
      alert("Failed to generate Monthly Excel")
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center text-slate-500 mt-24 text-lg">
          Loading history...
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Lecture History
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            View and download past lecture attendance
          </p>
        </motion.div>

        {lectures.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
            No lecture history available
          </div>
        ) : (
          <>
            {/* ================= DESKTOP ================= */}
            <div className="hidden md:grid grid-cols-3 gap-8">

              {/* LEFT PANEL – PREMIUM LIST */}
              <div className="col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-2">

                {lectures.map((lecture) => (
                  <motion.div
                    key={lecture._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedLecture(lecture)}
                    className="relative group cursor-pointer"
                  >
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition duration-500" />

                    <div className={`relative bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-5 transition ${
                      selectedLecture?._id === lecture._id
                        ? "ring-2 ring-indigo-500"
                        : ""
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {lecture.subject}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(lecture.startDateTime).toLocaleDateString()}
                          </p>
                        </div>

                        <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          Completed
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* RIGHT PANEL – PREMIUM DETAIL */}
              <div className="col-span-2 relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl">

                <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-10 min-h-[400px]">

                  {selectedLecture ? (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {selectedLecture.subject}
                      </h2>

                      <p className="text-gray-600 mb-2">
                        {new Date(selectedLecture.startDateTime).toLocaleDateString()}
                      </p>

                      <p className="text-gray-600 mb-8">
                        {new Date(selectedLecture.startDateTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}{" "}
                        –{" "}
                        {new Date(selectedLecture.endDateTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>

                      <div className="flex gap-6">
                        <button
                          onClick={() =>
                            handleExcelDownload(
                              selectedLecture._id,
                              selectedLecture.subject
                            )
                          }
                          className="px-6 py-3 rounded-xl bg-gray-900 text-white font-medium hover:scale-105 transition"
                        >
                          Daily Excel
                        </button>

                        <button
                          onClick={() =>
                            handleMonthlyDownload(
                              selectedLecture._id,
                              selectedLecture.subject
                            )
                          }
                          className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:scale-105 transition"
                        >
                          Monthly Excel
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      Select a lecture
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ================= MOBILE ================= */}
            <div className="md:hidden relative overflow-hidden">

              <AnimatePresence mode="wait">

                {!selectedLecture ? (
                  <motion.div
                    key="list"
                    initial={{ x: 0 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {lectures.map((lecture) => (
                      <motion.div
                        key={lecture._id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedLecture(lecture)}
                        className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg"
                      >
                        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-4">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">
                              {lecture.subject}
                            </h3>
                            <span className="text-xs text-gray-400">
                              {new Date(lecture.startDateTime).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(lecture.startDateTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="detail"
                    initial={{ x: 300 }}
                    animate={{ x: 0 }}
                    exit={{ x: 300 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl"
                  >
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6">

                      <button
                        onClick={() => setSelectedLecture(null)}
                        className="text-indigo-600 text-sm mb-6"
                      >
                        ← Back
                      </button>

                      <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {selectedLecture.subject}
                      </h2>

                      <p className="text-gray-600 mb-2">
                        {new Date(selectedLecture.startDateTime).toLocaleDateString()}
                      </p>

                      <p className="text-gray-600 mb-8">
                        {new Date(selectedLecture.startDateTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}{" "}
                        –{" "}
                        {new Date(selectedLecture.endDateTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>

                      <div className="space-y-4">
                        <button
                          onClick={() =>
                            handleExcelDownload(
                              selectedLecture._id,
                              selectedLecture.subject
                            )
                          }
                          className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium active:scale-95 transition"
                        >
                          Download Daily Excel
                        </button>

                        <button
                          onClick={() =>
                            handleMonthlyDownload(
                              selectedLecture._id,
                              selectedLecture.subject
                            )
                          }
                          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium active:scale-95 transition"
                        >
                          Download Monthly Excel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default LectureHistory