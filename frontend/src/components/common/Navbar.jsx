import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("classmark_user"));

  const handleLogout = () => {
    localStorage.removeItem("classmark_user");
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          ClassMark
        </Link>

        {!user ? (
          <Link
            to="/login"
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Login
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-500 text-white rounded-lg"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
