import Assignment from "../models/Assignment.js";

export const createAssignment = async (req, res) => {
  try {
    const { title, description, subject, dueDate } = req.body;

    if (!req.user || req.user.role?.toLowerCase() !== "teacher") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (!title || !subject || !dueDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const imageUrl = req.file ? req.file.path || req.file.secure_url : null;

    const assignment = await Assignment.create({
      title,
      description: description || "",
      subject,
      dueDate,
      imageUrl,
      teacherId: req.user._id,
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("newAssignment", {
        id: assignment._id,
        title: assignment.title,
        subject: assignment.subject,
        dueDate: assignment.dueDate,
        teacher: req.user.name,
      });
    }

    return res.status(201).json({ success: true, assignment });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
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
