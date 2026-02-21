import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import lectureRoutes from "./routes/lectureRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";

const app = express();
const server = http.createServer(app);

connectDB();

app.set("trust proxy", 1);

const origins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://class-mark1.vercel.app"
];

app.use(
  cors({
    origin: origins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

const io = new Server(server, {
  cors: {
    origin: origins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io", io);

io.on("connection", () => {});

app.use("/api/auth", authRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/assignments", assignmentRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "ClassMark API running" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});