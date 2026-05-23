import React from 'react'

export default function Technology() {
  const stack = [
    { title: "Frontend", name: "React.js", desc: "For building a fast, component-driven user interface." },
    { title: "Backend", name: "Node.js & Express", desc: "Handles API requests, image uploads, and database communication." },
    { title: "Machine Learning", name: "Python, Flask & PyTorch", desc: "Serves the trained CNN model to process and infer diseases from images." },
    { title: "Database", name: "MongoDB", desc: "NoSQL DB. Stores the history of all predictions alongside severity and treatment." },
  ]

  return (
    <div className="container">
      <div className="page-header">
        <h1>Technology Stack</h1>
        <p>A robust modern architecture</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        {stack.map((tech, i) => (
          <div key={i} className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              padding: '1rem', 
              borderRadius: '0.5rem', 
              fontWeight: 'bold',
              minWidth: '150px',
              textAlign: 'center'
            }}>
              {tech.title}
            </div>
            <div>
              <h3 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>{tech.name}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{tech.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '800px', margin: '4rem auto 2rem auto' }}>
        <h2 style={{ color: 'var(--primary-dark)', textAlign: 'center', marginBottom: '2rem' }}>Machine Learning Model Specifications</h2>
        
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Architecture</p>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}>MobileNetV2</h3>
            </div>
            
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Framework</p>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}>PyTorch</h3>
            </div>

            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Source Dataset</p>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}>PlantVillage</h3>
            </div>

            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Training Images</p>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}>2,152</h3>
            </div>

            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Input Size</p>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}>224x224 Pixels</h3>
            </div>

            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Output Classes</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span className="severity-badge severity-severe" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>Early Blight</span>
                <span className="severity-badge severity-moderate" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>Late Blight</span>
                <span className="severity-badge severity-none" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>Healthy</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
