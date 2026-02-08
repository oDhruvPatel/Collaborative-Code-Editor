import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Assuming you're using axios for HTTP requests
import './room.css'

function Room() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // New state for password

  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };

  const joinRoom = async () => {

    
    if (!roomId || !username || !password) {
      toast.error("All fields are required");
      return;
    }
    
    

    try {
      
      await axios.post("/room", { roomId, username, password });
      navigate(`/editor/${roomId}`, { state: { username } });
      toast.success("Room created successfully");
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Error creating room. Please try again later.");
    }
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div>
    <div className="container1">
      <div className='inner'>
        {/* <div className="field"> */}
        
              <div className="head">
              <img
                src="/images/codecast.png"
                alt="Logo"
                
                style={{ maxWidth: "200px" , height: "50px"}}
              />
              <h4 style={{alignContent:"center", marginTop:"20px"}}>Room Create or Join</h4>
              </div>
              <label className="label">Room ID</label>
                <input
                  type="text"
                  value={roomId}
                  className="input"
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="ROOM ID"
                  onKeyUp={handleInputEnter}
                />
             <label className="label">Username</label>
                <input
                  type="text"
                  value={username}
                  className="input"
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="USERNAME"
                  onKeyUp={handleInputEnter}
                />
             <label className="label">Password</label>
                <input
                  type="password"
                  value={password}
                  className="input"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PASSWORD" // Password field
                  onKeyUp={handleInputEnter}
                />
              
              
              <button
                onClick={joinRoom}
                className="button1"
              >
                JOIN
              </button>
              <p>
                Don't have a room ID? create{" "}
                <span
                  onClick={generateRoomId}
                  style={{ cursor: "pointer",color:"green",}}
                >
                  {" "}
                  Room ID
                </span>
              </p>
              
            </div>
            </div>
          </div>
  );
}

export default Room;


