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


◈ What is Classmark?
Classmark is a production-grade University Learning Management System that replaces paper-based attendance with a geo-verified, QR-code-driven workflow. Teachers schedule lectures, generate time-expiring QR codes, and download attendance reports. Students scan QR codes, verify their GPS location, and mark attendance in seconds — all from their phone.
Built with a clean MERN stack (MongoDB, Express, React, Node.js), it supports role-based access, real-time session management, and Excel report generation — the kind of infrastructure a real university deployment demands.

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
◈ Features
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
◈ Tech Stack
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

Clone & Install
bash# Clone the repository
cd attendx-lms

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
