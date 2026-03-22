import React, { useEffect, useRef, useState } from "react";
import Client from "../components/Client";
import Editor from "./Editor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from 'axios';
import Sk from "skulpt";
import './EditorPage.css';

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const codeRef = useRef(null);

  const Location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const socketRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const handleErrors = (err) => {
        console.log("Error", err);
        toast.error("Socket connection failed, Try again later");
        navigate("/");
      };

      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: Location.state?.username || `User_${Math.floor(Math.random() * 1000)}`,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== Location.state?.username) {
          toast.success(`${username} joined.`);
        }
        setClients(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
        });
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });

      socketRef.current.on(ACTIONS.CODE_EXECUTED, ({ output }) => {
        setOutput(output);
      });
    };
    init();

    return () => {
      socketRef.current && socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.off(ACTIONS.CODE_EXECUTED);
    };
  }, []);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID copied!`);
    } catch (error) {
      toast.error("Unable to copy Room ID.");
    }
  };

  const leaveRoom = () => {
    navigate("/");
  };

  const executeCode = () => {
    setOutput(""); 
    try {
      let capturedOutput = '';
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      console.log = (...args) => {
        capturedOutput += args.join(' ') + '\n';
      };
      console.error = (...args) => {
        capturedOutput += 'Error: ' + args.join(' ') + '\n';
      };
      console.warn = (...args) => {
        capturedOutput += 'Warning: ' + args.join(' ') + '\n';
      };

      if (language === 'javascript') {
        try {
          const runner = new Function('console', code);
          runner({ 
            log: console.log, 
            error: console.error, 
            warn: console.warn 
          });
        } catch (e) {
          capturedOutput += `Runtime Error: ${e.message}\n`;
        }
      } else if (language === 'python') {
        Sk.configure({ 
          output: (text) => (capturedOutput += text),
          read: (x) => {
            if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
              throw "File not found: '" + x + "'";
            return Sk.builtinFiles["files"][x];
          }
        });
        Sk.importMainWithBody('<stdin>', false, code, true);
      }

      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;

      setOutput(capturedOutput || "> Code executed (no output to console)");
    } catch (error) {
      setOutput(`Execution Error: ${error.message}\n`);
    }
  };

  const handleCodeChange = (code) => {
    setCode(codeRef.current = code);
  };

  const saveCode = async () => {
    try {
      const response = await axios.post('/saveCoderoom', { code, roomId, language });
      if (response.data.success) {
        toast.success('Code saved!');
      } else {
        toast.error('Failed to save');
      }
    } catch (error) {
      toast.error('Save error.');
    }
  };

  return (
    <div className="editor-page-container">
      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar - Refined Alignment, No Duplicate Logo */}
      <aside className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>
        <div className="sidebar-header-section">
          <p className="sidebar-description">
            Collaborative real-time workspace.
          </p>
        </div>

        <div className="session-card">
          <span className="session-card-title">Join Code</span>
          <div className="session-url-container">
            <input 
              readOnly 
              className="session-url-input" 
              value={roomId} 
            />
            <button className="btn-icon-session" onClick={copyRoomId} title="Copy Room ID">
              Copy
            </button>
          </div>
        </div>

        <div className="collaborators-section">
          <div className="collaborators-header">
            <span>Room Members</span>
            <span className="count-badge">{clients.length}</span>
          </div>
          <div className="collaborators-list">
            {clients.map((client) => (
              <div key={client.socketId} className="collaborator-item">
                <div className="avatar">
                  {client.username.charAt(0).toUpperCase()}
                </div>
                <div className="collaborator-info">
                  <span className="collaborator-name">
                    {client.username} {client.username === Location.state?.username ? '(You)' : ''}
                  </span>
                </div>
                <div className="status-dot"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <button 
            className="btn-leave" 
            onClick={leaveRoom}
          >
            Leave Room
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="main-editor-area">
        <header className="editor-toolbar">
          <div className="toolbar-left">
            <button 
              className="btn-mobile-sidebar-toggle" 
              onClick={() => setIsSidebarOpen(true)}
            >
              ☰
            </button>
            <div className="lang-indicator">
              <select
                className="lang-select-premium"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JS</option>
                <option value="python">PY</option>
              </select>
            </div>
          </div>

          <div className="toolbar-right">
            <button className="btn-action btn-save-minimal" onClick={saveCode}>
              Save
            </button>
            <button className="btn-action btn-run-premium" onClick={executeCode}>
              Run Code
            </button>
          </div>
        </header>

        <div className="editor-workspace">
          <div className="code-pane">
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              onCodeChange={handleCodeChange}
            />
          </div>
          
          <div className="console-pane">
            <div className="console-header">
              <span className="console-title">Output</span>
              <button 
                className="btn-console-clear" 
                onClick={() => setOutput("")}
              >
                Clear
              </button>
            </div>
            <div className="console-body">
              {output || "> Ready to execute..."}
            </div>
          </div>
        </div>

        <footer className="editor-status-bar">
          <div className="status-left">
            <span>Room {roomId}</span>
          </div>
          <div className="status-right">
            <span>UTF-8</span>
            <span>JS / Node</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default EditorPage;
