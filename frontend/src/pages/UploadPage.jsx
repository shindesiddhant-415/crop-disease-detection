import React, { useState, useRef } from 'react'
import axios from 'axios'
import { Upload, X, Loader, AlertTriangle, CheckCircle, Leaf } from 'lucide-react'
import { API_URL } from '../config'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (selectedFile) => {
    // Only accept images
    if (!selectedFile.type.startsWith('image/')) {
      setError("Please upload an image file.")
      return
    }
    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
    setResult(null)
    setError(null)
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }

  const loadDemoImage = async (imagePath, fileName) => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const demoFile = new File([blob], fileName, { type: blob.type });
      processFile(demoFile);
    } catch (err) {
      console.error("Failed to load demo image", err);
      setError("Failed to load demo image.");
    }
  }

  const handlePredict = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await axios.post(`${API_URL}/api/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
    } catch (err) {
      console.error(err)
      if (err.response && err.response.data && err.response.data.error) {
        setError(`Error: ${err.response.data.error}`)
      } else {
        setError("Failed to connect to the Node.js backend. Please ensure the server is running on port 3000.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <h1>Upload Leaf Image</h1>
        <p>Instantly detect diseases using our AI engine</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        
        {!preview ? (
          <>
            <div 
              className={`uploader-area ${dragActive ? 'drag-over' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current.click()}
            >
              <input 
                ref={inputRef}
                type="file" 
                accept="image/*" 
                onChange={handleChange} 
                style={{ display: 'none' }} 
              />
              <Upload size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--primary-dark)' }}>Drag & Drop your image here</h3>
              <p style={{ color: 'var(--text-muted)' }}>or click to browse from your device</p>
            </div>
            
            <div style={{ marginTop: '2.5rem' }}>
              <p style={{ textAlign: 'center', color: 'var(--primary-dark)', fontWeight: 'bold', marginBottom: '1.5rem' }}>Or try a sample image:</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div onClick={() => loadDemoImage('/demo_images/healthy.png', 'healthy.png')} style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }} className="demo-image-card">
                  <img src="/demo_images/healthy.png" alt="Healthy" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.75rem', border: '3px solid #bbf7d0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: '500', color: 'var(--success)' }}>Healthy</p>
                </div>
                <div onClick={() => loadDemoImage('/demo_images/early_blight.png', 'early_blight.png')} style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }} className="demo-image-card">
                  <img src="/demo_images/early_blight.png" alt="Early Blight" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.75rem', border: '3px solid #fecaca', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: '500', color: 'var(--danger)' }}>Early Blight</p>
                </div>
                <div onClick={() => loadDemoImage('/demo_images/late_blight.png', 'late_blight.png')} style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }} className="demo-image-card">
                  <img src="/demo_images/late_blight.png" alt="Late Blight" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.75rem', border: '3px solid #fecaca', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: '500', color: 'var(--danger)' }}>Late Blight</p>
                </div>
              </div>
              <style>{`.demo-image-card:hover { transform: scale(1.05); }`}</style>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2rem' }}>
              <img 
                src={preview} 
                alt="Upload Preview" 
                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
              />
              <button 
                onClick={clearFile}
                style={{
                  position: 'absolute', top: '-15px', right: '-15px',
                  background: 'var(--danger)', color: 'white', border: 'none',
                  borderRadius: '50%', width: '40px', height: '40px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ paddingBottom: '1rem' }}>
              {!result && !loading && (
                <button className="btn btn-primary" onClick={handlePredict} style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>
                  Analyze with AI
                </button>
              )}
              
              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div className="spinner" style={{ animation: 'spin 1s linear infinite' }}>
                    <Loader size={48} color="var(--primary)" />
                  </div>
                  <p style={{ color: 'var(--primary-dark)', fontWeight: '500', fontSize: '1.2rem' }}>Analyzing crop image...</p>
                  <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        {result && (
          <div className="animate-fade-in" style={{ marginTop: '2rem', padding: '2rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '1rem' }}>
            {result.confidence < 70 && (!result.ai_recommendation || result.ai_recommendation.disease === "Unknown crop or unsupported disease detected") && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#991b1b',
                fontWeight: '600'
              }}>
                <AlertTriangle size={24} color="#dc2626" style={{ flexShrink: 0 }} />
                <span>Unknown crop or unsupported disease detected</span>
              </div>
            )}

            <h2 style={{ color: 'var(--primary-dark)', borderBottom: '2px solid #bbf7d0', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle color="var(--success)" />
              Primary CNN Diagnosis
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Detected Disease</p>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>{result.disease}</h3>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Confidence Score</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ flexGrow: 1, background: '#e2e8f0', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${result.confidence}%`, height: '100%', background: 'var(--primary)' }}></div>
                  </div>
                  <span style={{ fontWeight: 'bold' }}>{result.confidence}%</span>
                </div>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Severity Level</p>
                <span className={`severity-badge severity-${result.severity && result.severity !== 'Unknown' ? result.severity.toLowerCase() : 'none'}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem', marginTop: '0.5rem', display: 'inline-block' }}>
                  {result.severity === 'Unknown' ? 'Not Applicable' : result.severity || 'None'}
                </span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Recommended Treatment</p>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <Leaf color="var(--success)" style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0 }}>{result.treatment}</p>
                </div>
              </div>
            </div>

            {result.ai_recommendation && (
              <div style={{ marginTop: '2rem', borderTop: '2px dashed #bbf7d0', paddingTop: '1.5rem' }}>
                <h3 style={{ color: '#0284c7', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={20} color="#0284c7" />
                  AI Recommendation Assistance
                </h3>
                <div style={{ background: '#e0f2fe', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #bae6fd' }}>
                  {result.ai_recommendation.disease === "Unknown crop or unsupported disease detected" ? (
                    <p style={{ margin: 0, color: '#0369a1', lineHeight: '1.6', fontWeight: '500' }}>
                      Image may belong to an unsupported crop or disease outside trained categories. Consult agricultural expert or upload a supported crop image.
                    </p>
                  ) : (
                    <>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#0369a1' }}><strong>Secondary Analysis:</strong> {result.ai_recommendation.disease}</p>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#0369a1' }}><strong>AI Confidence:</strong> {result.ai_recommendation.confidence}%</p>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#0369a1' }}><strong>Severity:</strong> {result.ai_recommendation.severity}</p>
                      <p style={{ margin: 0, color: '#0369a1' }}><strong>Supplementary Treatment:</strong> {result.ai_recommendation.treatment}</p>
                    </>
                  )}
                </div>
              </div>
            )}


          </div>
        )}

      </div>
    </div>
  )
}
