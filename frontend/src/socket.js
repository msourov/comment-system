import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export const socket = io(URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  timeout: 20000,
});

socket.onAny((eventName, ...args) => {
  console.log(`SOCKET EVENT RECEIVED: "${eventName}"`, args);
});

if (typeof window !== "undefined") {
  window.socket = socket;
}

export default socket;
