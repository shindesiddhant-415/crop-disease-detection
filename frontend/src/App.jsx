import React from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { Leaf } from 'lucide-react'

// Pages
import Home from './pages/Home'
import About from './pages/About'
import Features from './pages/Features'
import Technology from './pages/Technology'
import UploadPage from './pages/UploadPage'
import Dashboard from './pages/Dashboard'
import Contact from './pages/Contact'

function Navbar() {
  return (
    <nav className="navbar container">
      <NavLink className="nav-brand" to="/">
        <Leaf color="#2d6a4f" size={28} />
        <span>AgriAI</span>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/features">Features</NavLink>
        <NavLink to="/tech">Technology</NavLink>
        <NavLink to="/upload" className="btn btn-primary" style={{color: 'white', textDecoration: 'none'}}>Detect Disease</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <Navbar />
      <main className="animate-fade-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/tech" element={<Technology />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
