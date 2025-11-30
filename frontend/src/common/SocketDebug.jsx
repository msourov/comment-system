import { useContext } from "react";
import { useSelector } from "react-redux";
import { SocketContext } from "../context/SocketContext";

const SocketDebug = () => {
  const { connected, error, socket } = useContext(SocketContext);
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        padding: "10px 15px",
        background: connected ? "#10b981" : "#ef4444",
        color: "white",
        borderRadius: 8,
        fontSize: 12,
        zIndex: 9999,
        maxWidth: 300,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 5 }}>
        {connected ? "🟢 Socket Connected" : "🔴 Socket Disconnected"}
      </div>

      {/* Debug info */}
      <div style={{ fontSize: 11, opacity: 0.9 }}>
        <div>Auth: {isAuthenticated ? "✅ Yes" : "❌ No"}</div>
        <div>User: {user?.username || "None"}</div>
        <div>Token: {token ? "✅ Present" : "❌ Missing"}</div>
        <div>Socket ID: {socket?.id || "None"}</div>
      </div>

      {error && (
        <div
          style={{
            fontSize: 11,
            marginTop: 5,
            padding: 5,
            background: "rgba(0,0,0,0.3)",
            borderRadius: 4,
          }}
        >
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default SocketDebug;
