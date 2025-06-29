import React, { useState, useEffect } from 'react';
import './App.css';
import PortCallChecklist from './components/PortCallChecklist';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Note: Link conversion functionality moved to PortCallChecklist component

// Note: TextWithLinks component removed - functionality moved to PortCallChecklist

function App() {
  const [port, setPort] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [activityType, setActivityType] = useState('Charter');
  const [yachtFlag, setYachtFlag] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [checklistData, setChecklistData] = useState(null);

  // This effect polls for the checklist status
  useEffect(() => {
    if (!requestId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/checklist/${requestId}/status`);
        const data = await response.json();

        if (data.status === 'completed') {
          clearInterval(interval);
          const finalResponse = await fetch(`${API_URL}/api/checklist/${requestId}`);
          const finalData = await finalResponse.json();
          setChecklistData(finalData);
          setIsLoading(false);
        }
      } catch (err) {
        setError('Failed to fetch checklist status.');
        setIsLoading(false);
        clearInterval(interval);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [requestId]);

  const handleSubmit = async (event) => {
    console.log('handleSubmit triggered. Attempting to send request...');
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setChecklistData(null);

    try {
      const response = await fetch(`${API_URL}/api/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          port_name: port,
          arrival_date: arrivalDate,
          activity_type: activityType,
          yacht_flag: yachtFlag
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request.');
      }

      const data = await response.json();
      setRequestId(data.requestId);

    } catch (err) {
      console.error('FETCH ERROR:', err); // Log the full error to the console
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return <div className="loading">Generating your checklist... Please wait.</div>;
    }
    if (error) {
      return <div className="error">Error: {error}</div>;
    }
    if (checklistData) {
      return (
        <PortCallChecklist 
          checklistData={checklistData} 
          onNewChecklist={() => setChecklistData(null)}
        />
      );
    }

    return (
      <form onSubmit={handleSubmit} className="portcall-form">
        {/* Form groups... */}
         <div className="form-group">
            <label htmlFor="port">Port</label>
            <input type="text" id="port" value={port} onChange={(e) => setPort(e.target.value)} placeholder="e.g., Monaco" required />
          </div>
          <div className="form-group">
            <label htmlFor="arrivalDate">Arrival Date</label>
            <input type="date" id="arrivalDate" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="activityType">Activity Type</label>
            <select id="activityType" value={activityType} onChange={(e) => setActivityType(e.target.value)} required>
              <option value="Charter">Charter</option>
              <option value="Private">Private</option>
              <option value="Bunkering">Bunkering</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="yachtFlag">Yacht Flag</label>
            <input type="text" id="yachtFlag" value={yachtFlag} onChange={(e) => setYachtFlag(e.target.value)} placeholder="e.g., Cayman Islands" required />
          </div>
        <button type="submit" className="submit-btn">Generate Checklist</button>
      </form>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>PortCall AI</h1>
        <p>Enter the details for your next port call to generate a checklist.</p>
      </header>
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
