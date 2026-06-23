import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      readBy: {
        $ne: req.user.id
      }
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications"
    });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        readBy: {
          $ne: req.user.id
        }
      },
      {
        $addToSet: {
          readBy: req.user.id
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Notifications marked as read"
    });
  } catch (error) {
    console.error("Mark Notifications Read Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications"
    });
  }
};