import { io } from "socket.io-client";
import API_BASE from "./config/api";

const socket = io(API_BASE, {
  transports: ["websocket"],
  withCredentials: true
});

export default socket;
