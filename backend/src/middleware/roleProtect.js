import User from "../models/User.js"

const roleProtect = (role) => {
  return async (req, res, next) => {
    try {
      const { userId } = req.auth || {}

      const user = await User.findOne({ clerkId: userId })

      if (!user || user.role !== role) {
        return res.status(403).json({ message: "Forbidden" })
      }

      req.dbUser = user
      next()
    } catch {
      return res.status(500).json({ message: "Server error" })
    }
  }
}

export default roleProtect