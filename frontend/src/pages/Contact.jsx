import React from 'react'

export default function Contact() {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Contact & Team</h1>
        <p>Meet the minds behind AgriAI</p>
      </div>

      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1rem' }}>MIT Academy of Engineering</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>School of Computer Engineering - Final Year Project</p>

        <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Team Members</h3>
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', fontSize: '1.1rem' }}>
          <li style={{ padding: '0.5rem 0' }}>Vinit Jadhav</li>
          <li style={{ padding: '0.5rem 0' }}>Samadhan Kendhale</li>
          <li style={{ padding: '0.5rem 0' }}>Siddhant Shinde</li>
          <li style={{ padding: '0.5rem 0' }}>Arjun Darwade</li>
        </ul>

        <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Project Guide</h3>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Prof. Disha Sengupta</p>
      </div>
    </div>
  )
}
