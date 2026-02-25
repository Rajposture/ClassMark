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
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
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
            {/* DESKTOP VIEW */}
            <div className="hidden md:grid grid-cols-3 gap-8">
              <div className="col-span-1 bg-white rounded-3xl shadow-xl border p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {lectures.map((lecture) => (
                  <div
                    key={lecture._id}
                    onClick={() => setSelectedLecture(lecture)}
                    className={`p-4 rounded-2xl cursor-pointer transition ${
                      selectedLecture?._id === lecture._id
                        ? "bg-indigo-100"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">
                      {lecture.subject}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(lecture.startDateTime).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="col-span-2 bg-white rounded-3xl shadow-xl border p-8">
                {selectedLecture ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {selectedLecture.subject}
                    </h2>

                    <p className="text-gray-600 mb-2">
                      {new Date(
                        selectedLecture.startDateTime
                      ).toLocaleDateString()}
                    </p>

                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={() =>
                          handleExcelDownload(
                            selectedLecture._id,
                            selectedLecture.subject
                          )
                        }
                        className="px-6 py-3 rounded-xl bg-gray-900 text-white"
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
                        className="px-6 py-3 rounded-xl bg-indigo-600 text-white"
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

            {/* MOBILE PREMIUM CHAT STYLE */}
            <div className="md:hidden relative overflow-hidden">

              <AnimatePresence mode="wait">
                {!selectedLecture ? (
                  <motion.div
                    key="list"
                    initial={{ x: 0 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    {lectures.map((lecture) => (
                      <div
                        key={lecture._id}
                        onClick={() => setSelectedLecture(lecture)}
                        className="bg-white p-4 rounded-2xl shadow-sm border cursor-pointer active:scale-95 transition"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-gray-900">
                            {lecture.subject}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {new Date(
                              lecture.startDateTime
                            ).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(
                            lecture.startDateTime
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="detail"
                    initial={{ x: 300 }}
                    animate={{ x: 0 }}
                    exit={{ x: 300 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl shadow-xl border p-6"
                  >
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
                      {new Date(
                        selectedLecture.startDateTime
                      ).toLocaleDateString()}
                    </p>

                    <p className="text-gray-600 mb-6">
                      {new Date(
                        selectedLecture.startDateTime
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}{" "}
                      –{" "}
                      {new Date(
                        selectedLecture.endDateTime
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={() =>
                          handleExcelDownload(
                            selectedLecture._id,
                            selectedLecture.subject
                          )
                        }
                        className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium"
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
                        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium"
                      >
                        Download Monthly Excel
                      </button>
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