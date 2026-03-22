import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import Room from './pages/Room';
import Navbar from '../src/components/Navbar';
import axios from 'axios';
import EditorPage from './components/EditorPage';
import { Toaster } from 'react-hot-toast';

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true;

function App() {
  return (
    <>
      <Navbar />
      <Toaster position='top-center' toastOptions={{ duration: 2000, style: { background: '#333', color: '#fff' } }} />
      <Routes>
        <Route path='/' element={<Room />} />
        <Route path='/room' element={<Room />} />
        <Route path='/editor/:roomId' element={<EditorPage />} />
        <Route path='*' element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
