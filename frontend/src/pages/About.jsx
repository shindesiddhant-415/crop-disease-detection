import React from 'react'

export default function About() {
  return (
    <div className="container">
      <div className="page-header">
        <h1>About the Project</h1>
        <p>Understanding the problem and our solution</p>
      </div>
      
      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1rem' }}>Problem Statement</h2>
        <p style={{ marginBottom: '2rem' }}>
          Crop diseases are a major threat to food security, but their rapid identification remains difficult for many farmers.
          Misidentification leads to incorrect pesticide usage, costing time and yielding poor harvests.
        </p>

        <h2 style={{ color: 'var(--primary-dark)', marginBottom: '1rem' }}>Objectives</h2>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
          <li style={{ marginBottom: '0.5rem' }}><strong>CNN-based Prediction:</strong> Utilize Deep Learning to accurately classify diseases from leaf images.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Severity Detection:</strong> Determine how far the disease has progressed (Mild/Moderate/Severe).</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Farmer-friendly UI:</strong> Create a responsive, intuitive interface accessible from any device.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Prediction History:</strong> Provide a dashboard to view past diagnoses and track spread.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Treatment Recommendation:</strong> Offer actionable advice specific to the identified disease.</li>
        </ul>
      </div>
    </div>
  )
}
