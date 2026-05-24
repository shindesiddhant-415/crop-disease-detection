import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../config'

export default function Dashboard() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/history`)
      setHistory(res.data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setError("Failed to load prediction history. Please ensure the backend and database are running.")
      setLoading(false)
    }
  }

  const getSeverityClass = (sev) => {
    if (!sev) return ''
    const s = sev.toLowerCase()
    if (s.includes('mild')) return 'severity-mild'
    if (s.includes('moderate')) return 'severity-moderate'
    if (s.includes('severe')) return 'severity-severe'
    return 'severity-mild'
  }

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="spinner" style={{ animation: 'spin 1s linear infinite' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          </div>
          <p style={{ color: 'var(--primary-dark)', fontWeight: '500' }}>Loading prediction history...</p>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Prediction History</h1>
        <p>Review your recent crop scans</p>
      </div>

      {!error && history.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Predictions</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>{history.length}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Healthy Count</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>
              {history.filter(item => item.disease === 'Healthy').length}
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Disease Count</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>
              {history.filter(item => item.disease !== 'Healthy').length}
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Avg Confidence</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {(history.reduce((acc, curr) => acc + curr.confidence, 0) / history.length).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #f87171' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          {error}
        </div>
      )}

      {!error && history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '1rem' }}>
          <p>No history found. Try uploading an image first!</p>
        </div>
      ) : !error ? (
        <div style={{ overflowX: 'auto' }} className="glass-panel">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--primary-dark)', color: 'white' }}>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Image</th>
                <th style={{ padding: '1rem' }}>Disease Detected</th>
                <th style={{ padding: '1rem' }}>Confidence</th>
                <th style={{ padding: '1rem' }}>Severity</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', height: '96px' }}>
                  <td style={{ padding: '1rem' }}>{new Date(item.timestamp).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ width: '80px', height: '80px', overflow: 'hidden', borderRadius: '0.5rem', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={
                          (item.imageUrl || item.image)?.startsWith("http")
                            ? (item.imageUrl || item.image)
                            : `https://crop-backend-production.up.railway.app/${item.imageUrl || item.image}`
                        }
                        alt="crop"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{item.disease}</td>
                  <td style={{ padding: '1rem' }}>{item.confidence}%</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`severity-badge ${getSeverityClass(item.severity)}`}>
                      {item.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
