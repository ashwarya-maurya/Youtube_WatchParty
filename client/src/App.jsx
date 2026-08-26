import React from "react";
import { useEffect, useState } from "react";
import socket from "./services/socketService";

const App = () => {
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");

  useEffect(() => {
    const handleConnect = () => {
      setConnectionStatus("Connected");
    };

    const handleDisconnect = () => {
      setConnectionStatus("Disconnected");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  return (
    <main>
      <h1>YouTube Watch Party</h1>
      <p>Socket status: {connectionStatus}</p>
    </main>
  );
};

export default App;