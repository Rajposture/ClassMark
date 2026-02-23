import User from "../models/User.js"

export const syncUser = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const userId = req.auth.userId

    const { name, email, role, enrollmentNumber, phoneNumber } = req.body

    let user = await User.findOne({ clerkId: userId })

    if (!user) {
      user = await User.create({
        clerkId: userId,
        name,
        email,
        role,
        enrollmentNumber,
        phoneNumber
      })
    }

    return res.json({ success: true, user })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: err.message })
  }
}


export const getMe = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const userId = req.auth.userId

    const user = await User.findOne({ clerkId: userId })

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        role: user.role,
        enrollmentNumber: user.enrollmentNumber || null,
        phoneNumber: user.phoneNumber || null
      }
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: err.message })
  }
}


export const logout = async (req, res) => {
  return res.json({ success: true })
}