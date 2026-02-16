"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { connectSocket, disconnectSocket, getSocket } from "../lib/socket";

interface SocketContextType {
  isConnected: boolean;
  socket: any;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  socket: null,
});

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const { status } = useSession();

  useEffect(() => {
    // Only connect when authenticated
    if (status !== "authenticated") {
      return;
    }

    const socket = connectSocket();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);
      // Join rooms for real-time updates
      socket.emit("join", "jobs");
      socket.emit("join", "agents");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (err: Error) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      disconnectSocket();
    };
  }, [status]);

  return (
    <SocketContext.Provider value={{ isConnected, socket: getSocket() }}>
      {children}
    </SocketContext.Provider>
  );
}
