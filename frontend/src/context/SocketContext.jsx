import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import API_BASE from "../config/api";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(API_BASE);
    setSocket(newSocket);

    newSocket.emit("join-students");

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
