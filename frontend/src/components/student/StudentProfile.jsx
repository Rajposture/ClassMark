import { useState } from "react";
import Navbar from "../common/Navbar";

const StudentProfile = () => {
  const storedStudent = JSON.parse(
    localStorage.getItem("classmark_student")
  );

  const [name, setName] = useState(storedStudent?.name || "");
  const [enrollment, setEnrollment] = useState(
    storedStudent?.enrollment || ""
  );
  const [avatar, setAvatar] = useState(storedStudent?.avatar || "");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
  const updatedUser = {
    ...storedStudent,
    name,
    enrollment,
    avatar,
    role: "student",
  };

  // 1️⃣ Save updated user
  localStorage.setItem("classmark_user", JSON.stringify(updatedUser));
  localStorage.setItem("classmark_student", JSON.stringify(updatedUser));

  // 2️⃣ 🔥 NOTIFY NAVBAR
  window.dispatchEvent(new Event("userUpdated"));

  alert("Profile updated successfully!");
};


  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="pt-28 max-w-md mx-auto px-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">
            Edit Profile
          </h2>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-4">
            <img
              src={
                avatar ||
                "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff"
              }
              className="w-24 h-24 rounded-full mb-2 object-cover"
            />

            <label className="cursor-pointer text-indigo-600 text-sm">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Name */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full mb-3 px-4 py-2 border rounded-lg"
          />

          {/* Enrollment */}
          <input
            value={enrollment}
            onChange={(e) => setEnrollment(e.target.value)}
            placeholder="Enrollment Number"
            className="w-full mb-4 px-4 py-2 border rounded-lg"
          />

      <button
  onClick={handleSave}
  className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition"
>
  Save Changes
</button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
