import { useState, useEffect } from "react";

const CreateLecture = ({ onCreate }) => {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported");
      return;
    }

    setLocationLoading(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationLoading(false);
        setMessage("Classroom location set successfully");
      },
      () => {
        setLocationLoading(false);
        setMessage("Location access denied");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject || !date || !startTime || !endTime) {
      setMessage("Please fill all lecture details");
      return;
    }

    if (!latitude || !longitude) {
      setMessage("Please set classroom location first");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const success = await onCreate({
        subject,
        date,
        startTime,
        endTime,
        latitude,
        longitude
      });

      if (success) {
        setSubject("");
        setDate("");
        setStartTime("");
        setEndTime("");
        setLatitude(null);
        setLongitude(null);
        setMessage("Lecture created successfully");
      }
    } catch {
      setMessage("Error creating lecture");
    }

    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-5">
        Schedule Lecture
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-sm text-slate-600 mb-2">
            Lecture Title
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border bg-slate-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="px-4 py-2.5 rounded-lg border bg-slate-50"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="px-4 py-2.5 rounded-lg border bg-slate-50"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={locationLoading}
            className="w-full py-2.5 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition"
          >
            {locationLoading ? "Detecting Location..." : "Set Classroom Location"}
          </button>

          {latitude && longitude && (
            <p className="text-xs text-green-600 mt-2">
              Location locked for this lecture
            </p>
          )}
        </div>

        {message && (
          <p className="text-sm text-center text-slate-600">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          {loading ? "Creating..." : "Create Lecture"}
        </button>

      </form>
    </div>
  );
};

export default CreateLecture;
