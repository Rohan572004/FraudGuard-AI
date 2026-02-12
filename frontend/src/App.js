import React, { useState, useEffect } from 'react';
import { predictTransaction, getHistory } from './api';
import Auth from './Auth'; // Ensure you've created this file
import { ShieldAlert, ShieldCheck, Activity, History, PieChart as ChartIcon, Info, Search, LogOut } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function App() {
  // Check if token exists to determine initial auth state
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  
  const [formData, setFormData] = useState({
    distance_from_home: 0,
    distance_from_last_transaction: 0,
    ratio_to_median_purchase_price: 0,
    repeat_retailer: false,
    used_chip: false,
    used_pin_number: false,
    online_order: false
  });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    try {
      const response = await getHistory();
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      // If 401 Unauthorized, clear token and redirect to login
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setResult(null);
    setHistory([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const startTime = performance.now();
    setLoading(true);
    
    try {
      const response = await predictTransaction(formData);
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(0);
      
      setResult({ ...response.data, latency: duration }); 
      fetchHistory();
    } catch (error) {
      alert("Session expired or Backend error!");
      if (error.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  // --- AUTH GATE ---
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  const chartData = [
    { name: 'Legit', value: history.filter(tx => !tx.is_fraud).length },
    { name: 'Fraud', value: history.filter(tx => tx.is_fraud).length }
  ];

  const COLORS = ['#22c55e', '#ef4444'];

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: 'auto', fontFamily: 'Segoe UI, Tahoma, sans-serif', color: '#1f2937', backgroundColor: '#fbfcfd' }}>
      <header style={{ borderBottom: '2px solid #f3f4f6', marginBottom: '30px', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, color: '#2563eb' }}>
            <Activity size={32} /> FraudGuard AI Dashboard
          </h1>
          <p style={{ color: '#6b7280', margin: '5px 0' }}>Hybrid ML Analysis: Statistical & Heuristic Protection</p>
        </div>
        
        {/* Logout Button */}
        <button onClick={handleLogout} style={logoutButtonStyle}>
          <LogOut size={16} /> Logout
        </button>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', marginBottom: '40px' }}>
        
        {/* --- SECTION 1: PREDICTION FORM --- */}
        <section style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}><Info size={18} /> New Transaction Analysis</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={inputGroup}>
              <label style={labelStyle}>Distance from Home (km)</label>
              <input type="number" step="0.1" style={inputStyle} required
                     onChange={e => setFormData({...formData, distance_from_home: parseFloat(e.target.value)})} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Price Ratio to Median</label>
              <input type="number" step="0.1" style={inputStyle} required
                     onChange={e => setFormData({...formData, ratio_to_median_purchase_price: parseFloat(e.target.value)})} />
            </div>
            
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #edf2f7' }}>
              <label style={checkboxStyle}><input type="checkbox" onChange={e => setFormData({...formData, online_order: e.target.checked})} /> Online Order</label>
              <label style={checkboxStyle}><input type="checkbox" onChange={e => setFormData({...formData, used_chip: e.target.checked})} /> Used Chip</label>
              <label style={checkboxStyle}><input type="checkbox" onChange={e => setFormData({...formData, used_pin_number: e.target.checked})} /> Used PIN</label>
            </div>
            
            <button type="submit" disabled={loading} style={loading ? {...buttonStyle, opacity: 0.7} : buttonStyle}>
              {loading ? "Analyzing Patterns..." : "Run ML Prediction"}
            </button>
          </form>

          {result && (
            <div style={{ 
              marginTop: '25px', padding: '20px', borderRadius: '10px', border: '1px solid', 
              backgroundColor: result.is_fraud ? '#fef2f2' : '#f0fdf4',
              borderColor: result.is_fraud ? '#fecaca' : '#bbf7d0' 
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                {result.is_fraud ? <ShieldAlert color="#ef4444" size={32} /> : <ShieldCheck color="#22c55e" size={32} />}
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: result.is_fraud ? '#991b1b' : '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {result.is_fraud ? "Potential Fraud Detected" : "Transaction Verified"}
                  </h4>
                  <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: '500' }}>Confidence Score: {(result.confidence_score * 100).toFixed(2)}%</p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                    <span style={badgeStyle}>⚡ Latency: {result.latency}ms</span>
                    {result.reasons && result.reasons.map((reason, idx) => (
                      <span key={idx} style={{...badgeStyle, backgroundColor: '#e2e8f0', color: '#475569'}}>
                        <Search size={10} /> {reason}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* --- SECTION 2: ANALYTICS CHART --- */}
        <section style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <ChartIcon size={20} color="#2563eb" /> ML Data Distribution
          </h3>
          <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value" animationDuration={1000}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>Real-time updates for your account</p>
        </section>
      </div>

      {/* --- SECTION 3: HISTORY TABLE --- */}
      <section style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={20} color="#2563eb" /> Advanced Transaction Logs
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Distance/Price</th>
                <th style={thStyle}>Primary Risk Factors</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>ML Probability</th>
                <th style={thStyle}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {history.slice().reverse().map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={tdStyle}>#{tx.id}</td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '13px' }}>{tx.distance_from_home.toFixed(1)} km</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{tx.ratio_to_median_purchase_price.toFixed(1)}x Median</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {tx.reasons && tx.reasons.map((r, i) => (
                        <span key={i} style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{r}</span>
                      ))}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
                      backgroundColor: tx.is_fraud ? '#fee2e2' : '#dcfce7', 
                      color: tx.is_fraud ? '#991b1b' : '#166534' 
                    }}>
                      {tx.is_fraud ? "FRAUD" : "LEGIT"}
                    </span>
                  </td>
                  <td style={tdStyle}>{(tx.confidence_score * 100).toFixed(1)}%</td>
                  <td style={{...tdStyle, fontSize: '11px', color: '#94a3b8'}}>{new Date(tx.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// Styling
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#374151' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' };
const checkboxStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', color: '#4b5563' };
const buttonStyle = { gridColumn: 'span 2', padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };
const thStyle = { padding: '15px 10px' };
const tdStyle = { padding: '15px 10px' };
const badgeStyle = { fontSize: '11px', padding: '3px 8px', borderRadius: '5px', background: '#f1f5f9', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' };
const logoutButtonStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' };

export default App;