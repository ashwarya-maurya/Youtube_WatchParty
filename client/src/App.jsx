import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import socket from "./services/socketService";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";
import NotFoundPage from "./pages/NotFoundPage";
import "./App.css";

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
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/room/:roomId" element = {<RoomPage/>} />
      <Route path="*" element = {<NotFoundPage/>} />
    </Routes>
  );
};

export default App;
