import React, { useState } from 'react';
import { 
  Cpu, 
  RefreshCw, 
  Database,
  Sparkles
} from 'lucide-react';
import { AI_MODEL_METRICS } from '../data/mockData';

export default function AdminAnalytics({ cases = [] }) {
  const [retrainingStatus, setRetrainingStatus] = useState('idle');

  const casesCount = cases.length;

  // Compute dynamic disease counts from cases
  const diseaseCounts = cases.reduce((acc, c) => {
    const pred = c.aiPrediction || 'Canine Mange';
    acc[pred] = (acc[pred] || 0) + 1;
    return acc;
  }, {});

  const totalCasesInState = cases.length || 1;
  const dynamicDiseaseList = [
    { name: "Canine Mange", count: (diseaseCounts["Canine Mange"] || 0) + 480 },
    { name: "Fungal Ringworm", count: (diseaseCounts["Fungal Ringworm"] || 0) + 318 },
    { name: "Allergic Dermatitis", count: (diseaseCounts["Allergic Dermatitis"] || 0) + 208 },
    { name: "Severe Infection", count: (diseaseCounts["Severe Open Infection & Dermatitis"] || 0) + 115 },
  ].map(item => {
    const total = 480 + 318 + 208 + 115 + totalCasesInState;
    return {
      ...item,
      percentage: Math.round((item.count / total) * 100)
    };
  });

  // Compute dynamic area counts from cases
  const areaMap = {};
  cases.forEach(c => {
    const loc = c.locationName ? c.locationName.split(',')[0].trim() : 'Nagarbhavi';
    areaMap[loc] = (areaMap[loc] || 0) + 1;
  });

  const dynamicAreaList = [
    { area: "Nagarbhavi", count: (areaMap["Nagarbhavi"] || 0) + 140 },
    { area: "Vijayanagar", count: (areaMap["Vijayanagar"] || 0) + 117 },
    { area: "Kengeri", count: (areaMap["Kengeri"] || 0) + 94 },
    { area: "Rajajinagar", count: (areaMap["Rajajinagar"] || 0) + 85 },
    { area: "Mallathahalli", count: (areaMap["Mallathahalli"] || 0) + 64 }
  ];

  const triggerRetraining = () => {
    setRetrainingStatus('running');
    setTimeout(() => {
      setRetrainingStatus('done');
      setTimeout(() => setRetrainingStatus('idle'), 4000);
    }, 2000);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '30px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <span className="badge badge-low" style={{ marginBottom: '6px' }}>
          <Cpu size={14} /> MODEL & SYSTEM PERFORMANCE METRICS
        </span>
        <h1 style={{ fontSize: '2.2rem', color: 'var(--text-main)', fontWeight: 800 }}>
          Model Analytics & System Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
          Validation accuracy, confusion matrix, disease distribution, and veterinary feedback loop.
        </p>
      </div>

      {/* Model Versioning & KPI */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>DEPLOYED CLASSIFIER MODEL</div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--text-main)', fontWeight: 800 }}>
              {AI_MODEL_METRICS.version}
            </h2>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Dataset Size: <strong>{AI_MODEL_METRICS.datasetCount} Verified Images</strong> • Active Tracked Cases: <strong>{casesCount}</strong> • Status: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>● Active Production</span>
            </div>
          </div>

          <button
            onClick={triggerRetraining}
            className="btn-secondary"
            disabled={retrainingStatus === 'running'}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={15} className={retrainingStatus === 'running' ? 'animate-spin' : ''} />
            <span>
              {retrainingStatus === 'running' 
                ? 'Retraining Pipeline...' 
                : retrainingStatus === 'done' 
                  ? '✓ Model Updated to v1.3' 
                  : 'Trigger Model Retraining'}
            </span>
          </button>
        </div>

        {/* 4 Core Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
          
          <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700 }}>VALIDATION ACCURACY</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
              {AI_MODEL_METRICS.accuracy}%
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--primary)' }}>+1.2% vs baseline</div>
          </div>

          <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700 }}>PRECISION RATE</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
              {AI_MODEL_METRICS.precision}%
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>False Positive Minimized</div>
          </div>

          <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700 }}>RECALL SCORE</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--high)', fontFamily: 'var(--font-heading)' }}>
              {AI_MODEL_METRICS.recall}%
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>High Disease Catching</div>
          </div>

          <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700 }}>HARMONIC F1-SCORE</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', fontFamily: 'var(--font-heading)' }}>
              {AI_MODEL_METRICS.f1Score}%
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Balanced Performance</div>
          </div>

        </div>

      </div>

      {/* Confusion Matrix Table */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={16} color="var(--secondary)" />
          Classification Confusion Matrix (Validation Benchmark)
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', color: 'var(--text-main)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)' }}>Actual \ Predicted</th>
                <th style={{ padding: '10px', textAlign: 'center', color: 'var(--primary)' }}>Mange</th>
                <th style={{ padding: '10px', textAlign: 'center', color: 'var(--accent)' }}>Fungal</th>
                <th style={{ padding: '10px', textAlign: 'center', color: 'var(--high)' }}>Dermatitis</th>
                <th style={{ padding: '10px', textAlign: 'center', color: 'var(--primary)' }}>Healthy</th>
              </tr>
            </thead>
            <tbody>
              {AI_MODEL_METRICS.confusionMatrix.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-main)' }}>{row.class}</td>
                  <td style={{ padding: '10px', textAlign: 'center', background: row.class === 'Mange' ? 'var(--primary-light)' : 'transparent', fontWeight: row.class === 'Mange' ? 800 : 500, color: row.class === 'Mange' ? 'var(--primary)' : 'var(--text-main)' }}>
                    {row.predictedMange}%
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', background: row.class === 'Fungal' ? 'rgba(2, 132, 199, 0.1)' : 'transparent', fontWeight: row.class === 'Fungal' ? 800 : 500, color: row.class === 'Fungal' ? 'var(--accent)' : 'var(--text-main)' }}>
                    {row.predictedFungal}%
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', background: row.class === 'Dermatitis' ? 'var(--high-bg)' : 'transparent', fontWeight: row.class === 'Dermatitis' ? 800 : 500, color: row.class === 'Dermatitis' ? 'var(--high)' : 'var(--text-main)' }}>
                    {row.predictedDermatitis}%
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', background: row.class === 'Healthy' ? 'var(--primary-light)' : 'transparent', fontWeight: row.class === 'Healthy' ? 800 : 500, color: row.class === 'Healthy' ? 'var(--primary)' : 'var(--text-main)' }}>
                    {row.predictedHealthy}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disease Distribution & Cases by Area Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Disease Distribution */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '14px' }}>
            Disease Distribution Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dynamicDiseaseList.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.name}</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.count} cases ({item.percentage}%)</span>
                </div>
                <div style={{ height: '7px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.percentage}%`, height: '100%', background: 'var(--primary)' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cases by Area */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '14px' }}>
            Reported Cases by Region (Bengaluru)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dynamicAreaList.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>📍 {item.area}</span>
                <span className="badge badge-low" style={{ fontSize: '0.75rem' }}>{item.count} cases</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Veterinary Feedback Loop */}
      <div style={{
        background: 'var(--primary-light)',
        border: '1px solid rgba(5, 150, 105, 0.3)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 800 }}>
            Veterinary Feedback Loop & Model Tuning
          </h3>
        </div>

        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          When a registered veterinarian confirms or updates an initial assessment result, the verified clinical label is added to the training queue to continuously improve model sensitivity.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          <div>Verified Vet Labels Queued: <strong style={{ color: 'var(--primary)' }}>312 Samples</strong></div>
          <div>AI-Vet Agreement Rate: <strong style={{ color: 'var(--text-main)' }}>94.2%</strong></div>
        </div>
      </div>

    </div>
  );
}

