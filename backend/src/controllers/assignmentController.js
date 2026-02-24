import Assignment from "../models/Assignment.js";

export const createAssignment = async (req, res) => {
  try {
    const { title, subject, dueDate } = req.body;

    const assignment = await Assignment.create({
      title,
      subject,
      dueDate,
      teacherId: req.user.id,
      imageUrl: req.file?.path
    });

    // 🔥 SOCKET EMIT HERE
    const io = req.app.get("io");

    io.emit("newAssignment", {
      title: assignment.title,
      subject: assignment.subject,
      dueDate: assignment.dueDate,
      teacher: req.user.name
    });

    res.status(201).json({
      success: true,
      assignment
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("teacherId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, assignments });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment)
      return res.status(404).json({ success: false, message: "Not found" });

    if (assignment.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Unauthorized" });

    await assignment.deleteOne();

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
