import React from 'react'
import { UploadCloud, Activity, Compass, Database, BarChart2, CheckCircle } from 'lucide-react'

export default function Features() {
  const features = [
    { icon: <UploadCloud size={40} color="var(--primary)" />, title: "Image Upload", desc: "Drag & drop interface for seamless leaf image uploading." },
    { icon: <Activity size={40} color="var(--primary)" />, title: "AI Detection", desc: "State-of-the-art CNN model processes images to find anomalies." },
    { icon: <CheckCircle size={40} color="var(--primary)" />, title: "Confidence Score", desc: "Provides a percentage score so you know how sure the AI is." },
    { icon: <Compass size={40} color="var(--primary)" />, title: "Severity Detection", desc: "Color-coded indicators showing disease severity." },
    { icon: <Database size={40} color="var(--primary)" />, title: "Treatment Suggestions", desc: "Instant display of actionable methods to cure the crop." },
    { icon: <BarChart2 size={40} color="var(--primary)" />, title: "Dashboard", desc: "Keep track of all your past predictions in one place." },
  ]

  return (
    <div className="container">
      <div className="page-header">
        <h1>Key Features</h1>
        <p>Everything you need to protect your farm</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {features.map((f, i) => (
          <div key={i} className="card">
            <div style={{ marginBottom: '1rem' }}>{f.icon}</div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>{f.title}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
