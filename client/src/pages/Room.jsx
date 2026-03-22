import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Room() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const generateRoomId = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success("New Room ID generated!");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Room ID & Username are required");
      return;
    }

    // Redirect to editor
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="join-container">
      <div className="join-glass-card">
        <div className="join-header">
          <div className="join-logo">
            <span className="logo-icon-accent">&lt;/&gt;</span>
            <span className="logo-text-accent">CodeCast</span>
          </div>
          <h1 className="join-title">Collaborate in Real-Time</h1>
          <p className="join-subtitle">Enter a session ID or create a new room to start coding together.</p>
        </div>

        <div className="join-form">
          <div className="premium-input-group">
            <label className="input-label">Session ID</label>
            <input
              type="text"
              placeholder="Paste invitation code..."
              className="premium-input"
              onChange={(e) => setRoomId(e.target.value.trim())}
              value={roomId}
              onKeyUp={handleInputEnter}
              required
            />
          </div>

          <div className="premium-input-group">
            <label className="input-label">Display Name</label>
            <input
              type="text"
              placeholder="How should others see you?"
              className="premium-input"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              onKeyUp={handleInputEnter}
              required
            />
          </div>

          <button className="btn-join-primary" onClick={joinRoom}>
            Join Session
          </button>

          <div className="join-footer">
            <span>Don't have a session ID?</span>
            <button onClick={generateRoomId} className="btn-link-action">
              Generate New ID
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Room;
