import User from "../models/User.js"

const roleProtect = (role) => {
  return async (req, res, next) => {
    try {
      if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const user = await User.findOne({ clerkId: req.auth.userId })

      if (!user) {
        return res.status(401).json({ message: "User not found" })
      }

      if (user.role !== role) {
        return res.status(403).json({ message: "Forbidden" })
      }

      req.user = user   // ✅ THIS IS THE FIX
      next()

    } catch {
      return res.status(500).json({ message: "Server error" })
    }
  }
}

export default roleProtect