import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Activity, ShieldCheck, Database } from 'lucide-react'

export default function Home() {
  return (
    <div className="container">
      <div className="hero">
        <div className="hero-content">
          <h1>Smart Crop Disease Detection using AI</h1>
          <p>
            An advanced platform designed for farmers to instantly upload leaf images
            and detect crop diseases using sophisticated Convolutional Neural Networks (CNN).
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/upload" className="btn btn-primary">
              Start Detection <ArrowRight size={20} />
            </Link>
            <Link to="/about" className="btn btn-outline">
              Learn More
            </Link>
          </div>
        </div>
        <div className="hero-image glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <img 
            src="/crop_disease_home.png" 
            alt="Expert Inspecting Crop Leaves for Disease"
            style={{ width: '100%', borderRadius: '0.5rem' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center' }}>
            <div>
              <Activity color="#2d6a4f" size={32} />
              <h4 style={{marginTop:'0.5rem'}}>High Accuracy</h4>
            </div>
            <div>
              <ShieldCheck color="#2d6a4f" size={32} />
              <h4 style={{marginTop:'0.5rem'}}>Instant Results</h4>
            </div>
            <div>
              <Database color="#2d6a4f" size={32} />
              <h4 style={{marginTop:'0.5rem'}}>History Tracking</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
