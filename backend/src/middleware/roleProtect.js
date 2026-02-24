import User from "../models/User.js";

const roleProtect = (role) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id)
        return res.status(401).json({ message: "Unauthorized" });

      const user = await User.findById(req.user.id).select("-password");

      if (!user)
        return res.status(401).json({ message: "User not found" });

      if (user.role !== role)
        return res.status(403).json({ message: "Forbidden" });

      req.user = {
        id: user._id.toString(),
        role: user.role,
        name: user.name,
        enrollment: user.enrollment
      };

      next();
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  };
};

export default roleProtect;