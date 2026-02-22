import User from "../models/User.js"

export const syncUser = async (req, res) => {
  try {
    const { userId } = req.auth;

    const { name, email, role, enrollmentNumber, phoneNumber } = req.body;

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      user = await User.create({
        clerkId: userId,
        name,
        email,
        role,
        enrollmentNumber,
        phoneNumber
      });
    }

    res.json({ success: true, user });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};


export const getMe = async (req, res) => {
  try {
    const { userId } = req.auth || {}

    if (!userId) {
      return res.status(401).json({ success: false })
    }

    const user = await User.findOne({ clerkId: userId })

    if (!user) {
      return res.status(404).json({ success: false })
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

  } catch {
    return res.status(500).json({ success: false })
  }
}


export const logout = async (req, res) => {
  return res.json({ success: true })
}