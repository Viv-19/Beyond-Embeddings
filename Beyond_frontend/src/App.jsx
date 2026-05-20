import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import Post from './pages/Post';
import { Notes, Experiments, Papers, Archive, About, Privacy, Terms } from './pages/SecondaryPages';
import Admin from './pages/Admin';
import UserAuth from './pages/UserAuth';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            borderRadius: '8px',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem'
          }
        }}/>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/post/:id" element={<Post />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/experiments" element={<Experiments />} />
            <Route path="/papers" element={<Papers />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<UserAuth />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
