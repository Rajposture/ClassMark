import { Clerk } from "@clerk/clerk-sdk-node"

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY })

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" })

    const token = authHeader.replace("Bearer ", "")
    const session = await clerk.verifyToken(token)

    req.user = session
    next()
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" })
  }
}