<div align="center">

<br/>

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        █████╗ ████████╗████████╗███████╗███╗   ██╗██████╗    ║
║       ██╔══██╗╚══██╔══╝╚══██╔══╝██╔════╝████╗  ██║██╔══██╗   ║
║       ███████║   ██║      ██║   █████╗  ██╔██╗ ██║██║  ██║   ║
║       ██╔══██║   ██║      ██║   ██╔══╝  ██║╚██╗██║██║  ██║   ║
║       ██║  ██║   ██║      ██║   ███████╗██║ ╚████║██████╔╝   ║
║       ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═══╝╚═════╝    ║
║                                                               ║
║              University Learning Management System           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

> **A full-stack university LMS built for real-time QR-based attendance,**
> **assignment management, and lecture scheduling — designed for scale.**

<br/>

</div>

---

<br/>

## ◈ What is AttendX?

AttendX is a production-grade **University Learning Management System** that replaces paper-based attendance with a geo-verified, QR-code-driven workflow. Teachers schedule lectures, generate time-expiring QR codes, and download attendance reports. Students scan QR codes, verify their GPS location, and mark attendance in seconds — all from their phone.

Built with a clean **MERN stack** (MongoDB, Express, React, Node.js), it supports role-based access, real-time session management, and Excel report generation — the kind of infrastructure a real university deployment demands.

<br/>

---

<br/>

## ◈ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT  (React 18)                       │
│                                                                 │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   │
│   │   Teacher    │   │   Student    │   │   Auth / Route   │   │
│   │  Dashboard   │   │  Dashboard   │   │    Guards        │   │
│   └──────┬───────┘   └──────┬───────┘   └────────┬─────────┘   │
│          │                  │                    │             │
│   ┌──────▼───────────────────▼────────────────────▼─────────┐  │
│   │               Axios  ·  React Router  ·  Context API    │  │
│   └──────────────────────────┬──────────────────────────────┘  │
└─────────────────────────────│───────────────────────────────────┘
                               │  REST / JSON
┌─────────────────────────────▼───────────────────────────────────┐
│                      SERVER  (Express + Node)                   │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐ │
│   │  /auth      │  │  /lectures  │  │  /attendance           │ │
│   │  register   │  │  create     │  │  mark  ·  verify       │ │
│   │  login      │  │  history    │  │  geo-check  ·  export  │ │
│   └─────────────┘  └─────────────┘  └────────────────────────┘ │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐ │
│   │ /assignments│  │  Multer     │  │  ExcelJS               │ │
│   │  create     │  │  (images)   │  │  daily + monthly xlsx  │ │
│   │  list       │  └─────────────┘  └────────────────────────┘ │
│   └─────────────┘                                               │
│                                                                 │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │         JWT Middleware  ·  Role Guard  ·  Geo Validator   │ │
│   └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                               │  Mongoose ODM
┌─────────────────────────────▼───────────────────────────────────┐
│                       MongoDB Atlas                             │
│                                                                 │
│   users ·  lectures ·  attendance ·  assignments               │
└─────────────────────────────────────────────────────────────────┘
```

<br/>

---

<br/>

## ◈ Features

```
┌─────────────────────────────────┬─────────────────────────────────────────┐
│  TEACHER PORTAL                 │  STUDENT PORTAL                         │
├─────────────────────────────────┼─────────────────────────────────────────┤
│  ✦  Schedule lectures           │  ✦  QR code scanner (camera)            │
│  ✦  Set geo-fence radius        │  ✦  GPS location verification           │
│  ✦  Generate QR (20-min expiry) │  ✦  One-tap attendance submission       │
│  ✦  View lecture history        │  ✦  View personal attendance record      │
│  ✦  Download daily .xlsx        │  ✦  Assignment feed                     │
│  ✦  Download monthly .xlsx      │  ✦  Mobile-first responsive UI          │
│  ✦  Post assignments            │                                         │
│  ✦  Upload assignment images    │                                         │
└─────────────────────────────────┴─────────────────────────────────────────┘
```

<br/>

---

<br/>

## ◈ Tech Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   FRONTEND                          BACKEND                     │
│   ─────────────────────             ─────────────────────────   │
│   React 18                          Node.js + Express           │
│   React Router v6                   MongoDB + Mongoose          │
│   Framer Motion                     JWT Authentication          │
│   html5-qrcode                      Multer (file uploads)       │
│   react-qr-code                     ExcelJS (xlsx reports)      │
│   Tailwind CSS                      bcryptjs                    │
│   Axios                             cors + dotenv               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

<br/>

---

<br/>

## ◈ Getting Started

### Prerequisites

```bash
node  >= 18.0.0
npm   >= 9.0.0
MongoDB Atlas URI  (or local instance)
```

<br/>

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-username/attendx-lms.git
cd attendx-lms

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

<br/>

### Environment Variables

Create a `.env` file inside the `/server` directory:

```env
# ─── Server ───────────────────────────────
PORT=5000

# ─── Database ─────────────────────────────
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/attendx

# ─── Auth ─────────────────────────────────
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# ─── File Storage ─────────────────────────
UPLOAD_DIR=uploads
```

Create a `.env` file inside the `/client` directory:

```env
VITE_API_BASE=http://localhost:5000/api
```

<br/>

### Run Locally

```bash
# Terminal 1 — start the API server
cd server
npm run dev

# Terminal 2 — start the React client
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.

<br/>

---

<br/>

## ◈ QR Attendance Flow

```
  TEACHER                                    STUDENT
  ───────                                    ───────

  1. Schedules lecture                       
     (subject, date, time,                  
      geo-fence radius)                      
          │                                  
          ▼                                  
  2. Opens lecture →                         
     Generates QR code                       
     (expires in 20 min)                     
          │                                  
          ▼                                  
  3. Displays QR on                          
     projector / screen  ──────────────▶  4. Opens QR Scanner
                                             on mobile browser
                                                    │
                                                    ▼
                                          5. Camera detects QR
                                             → extracts lectureId
                                                    │
                                                    ▼
                                          6. Captures GPS coords
                                             (high accuracy)
                                                    │
                                                    ▼
                                          7. POST /attendance/mark
                                             {lectureId, lat, lng}
                                                    │
                                                    ▼
                                          8. Server checks:
                                             ✓ QR not expired
                                             ✓ Student within radius
                                             ✓ Not already marked
                                                    │
                                                    ▼
                                          9. Attendance recorded ✓
          │                                         │
          ▼                                         │
  10. Downloads .xlsx ◀─────────────────────────────┘
      (daily / monthly)
```

<br/>

---

<br/>

## ◈ Project Structure

```
attendx-lms/
│
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Navbar, DashboardLayout
│   │   │   ├── teacher/             # CreateLecture, CreateAssignment
│   │   │   │                        # GenerateQR, LectureHistory
│   │   │   └── student/             # QRScanner, AttendanceForm
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state
│   │   ├── utils/
│   │   │   └── axios.js             # Configured Axios instance
│   │   ├── config/
│   │   │   └── api.js               # API base URL
│   │   └── pages/                   # Route-level page components
│   └── package.json
│
├── server/                          # Express backend
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── lectureController.js
│   │   ├── attendanceController.js
│   │   └── assignmentController.js
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verify
│   │   └── roleMiddleware.js        # teacher / student guard
│   ├── models/
│   │   ├── User.js
│   │   ├── Lecture.js
│   │   ├── Attendance.js
│   │   └── Assignment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── lectures.js
│   │   ├── attendance.js
│   │   └── assignments.js
│   ├── utils/
│   │   └── geoCheck.js              # Haversine radius validation
│   └── index.js
│
└── README.md
```

<br/>

---

<br/>

## ◈ API Reference

```
AUTH
────────────────────────────────────────────────────────────
POST   /api/auth/register        Register teacher or student
POST   /api/auth/login           Login → returns JWT

LECTURES
────────────────────────────────────────────────────────────
POST   /api/lectures             Create lecture       [teacher]
GET    /api/lectures/history     Get all lectures     [teacher]
GET    /api/lectures/:id/excel         Daily xlsx     [teacher]
GET    /api/lectures/:id/monthly-excel Monthly xlsx   [teacher]

ATTENDANCE
────────────────────────────────────────────────────────────
POST   /api/attendance/mark      Mark attendance      [student]
GET    /api/attendance/:id       Get for lecture      [teacher]

ASSIGNMENTS
────────────────────────────────────────────────────────────
POST   /api/assignments          Create assignment    [teacher]
GET    /api/assignments          List assignments     [student]
```

<br/>

---

<br/>

## ◈ Screenshots

<br/>

> _Add your screenshots here_

| Teacher Dashboard | QR Generator | Student Scanner |
|:-----------------:|:------------:|:---------------:|
| `screenshot-1.png` | `screenshot-2.png` | `screenshot-3.png` |

| Attendance Form | Lecture History | Assignment Board |
|:-----------------:|:------------:|:---------------:|
| `screenshot-4.png` | `screenshot-5.png` | `screenshot-6.png` |

<br/>

---

<br/>

## ◈ Roadmap

```
 ✅  QR-based geo-verified attendance
 ✅  Teacher lecture scheduling
 ✅  Assignment posting with image uploads
 ✅  Daily + monthly Excel exports
 ✅  Role-based access (teacher / student)
 ✅  Mobile-optimised QR scanner

 ◻   Push notifications for new assignments
 ◻   Student attendance percentage dashboard
 ◻   Admin super-panel (multi-department)
 ◻   Bulk student import via CSV
 ◻   Dark mode
 ◻   PWA / offline support
```

<br/>

---

<br/>

## ◈ Contributing

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature"

# 4. Push to your branch
git push origin feature/your-feature-name

# 5. Open a Pull Request
```

Please follow the existing code style and write clear commit messages.

<br/>

---

<br/>

## ◈ License

```
MIT License  —  Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software to use, copy, modify, merge, publish, or
distribute, subject to the conditions of the MIT License.
```

<br/>

---

<br/>

<div align="center">

```
Built with precision for universities that deserve better infrastructure.
```

<br/>

**[⬆ Back to top](#)**

</div>