import React, { useEffect, useState, useRef, useContext } from 'react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import './codeeditor.css';
import CodeMirror from 'codemirror';
import axios from 'axios'; // Import axios for making HTTP requests
import Sk from 'skulpt'; // Import Skulpt for Python execution
import { UserContext } from '../context/useContext';

const CodeEdit = () => {
  const { user } = useContext(UserContext);
  const editorRef = useRef(null);
  const outputRef = useRef(null);
  const [code, setCode] = useState('');
  const [editor, setEditor] = useState(null);
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript'); // Default language is JavaScript

  useEffect(() => {
    if (!editor && editorRef.current) {
      const newEditor = CodeMirror(editorRef.current, {
        value: code,
        lineNumbers: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        theme: 'material',
        mode: language, // Set the mode based on the selected language
        direction: 'ltr'
        
      });

      newEditor.on('change', (cm) => {
        const newCode = cm.getValue();
        setCode(newCode);
      });

      setEditor(newEditor);
    }
  }, [editor, code, language]);

  const executeCode = () => {
    console.log("Selected language:", language); // Log the selected language
    try {
      let capturedOutput = '';
      const originalLog = console.log;
  
      console.log = (...args) => {
        capturedOutput += args.join(' ') + '\n';
      };
  
      if (language === 'javascript') {
        eval(code);
      } else if (language === 'python') {
        Sk.configure({ output: (text) => (capturedOutput += text + '\n') });
        Sk.importMainWithBody('<stdin>', false, code, true);
      }
  
      console.log = originalLog;
  
      setOutput(capturedOutput);
    } catch (error) {
      setOutput(`Error: ${error.message}\n`);
    }
  };
  

  const saveCode = async () => {
    try {
      const id = user.id;
      
      // Make an HTTP POST request to save the code
      const response = await axios.post('/savecode', { code, id, language });

      if (response.data.success) {
        alert('Code saved successfully!');
      } else {
        alert('Failed to save code');
      }
    } catch (error) {
      console.error('Error saving code:', error);
      alert('Error saving code. Please try again later.');
    }
  };


  const savechat =async ()=>{
    alert('Ai saved successfully!');
  }


  return (
    <div style={{ display: 'flex', height: '90.3vh' }}>
      <div style={{ flex: 3 }}>
        <div ref={editorRef} style={{ height: '90%', marginTop:"2px"}}></div>
        <select style={{borderRadius:"5px",margin:"10px", height:"6%", width:"10%"}} value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          {/* Add more options for other languages as needed */}
        </select>
        <button
          className="btn btn-primary mt-2 mb-2 px-5 m-3 btn-block"
          onClick={executeCode}
        >
          Execute Code
        </button>
        <button
          className="btn btn-success mt-2 mb-2 px-5 m-3 btn-block"
          onClick={saveCode}
        >
          Save Code
        </button>
        <button
          className="ai btn btn-primary mt-2 mb-2 px-5 btn-block "
          onClick={savechat}
        >
          Chat With AI
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', height: '100%', backgroundColor:"#2d2f3b", color:"white", margin:"2px 0px 0px 5px"}}>
        <h4 style={{marginLeft:"10px"}}>Output:</h4>
        <pre ref={outputRef} style={{ whiteSpace: 'pre-wrap', marginLeft:"10px"}}>{output}</pre>
      </div>
    </div>
  );
};

export default CodeEdit;











