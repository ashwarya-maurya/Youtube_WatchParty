import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import socket from "./services/socketService";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";
import NotFoundPage from "./pages/NotFoundPage";
import "./App.css";

const App = () => {

  useEffect(() => {
  socket.connect();
}, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/room/:roomId" element={<RoomPage />} />
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
