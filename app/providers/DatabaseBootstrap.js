"use client";

import { useEffect, useState } from 'react';
import { initializeLocalStore } from '../api/utils/localStore';

export default function DatabaseBootstrap({ children }) {
  const [state, setState] = useState({ ready: false, error: '' });

  const start = async () => {
    setState({ ready: false, error: '' });
    try {
      await initializeLocalStore();
      setState({ ready: true, error: '' });
    } catch (error) {
      setState({ ready: false, error: error?.message || 'The local finance notebook could not be opened.' });
    }
  };

  useEffect(() => { start(); }, []);

  if (state.ready) return children;
  return (
    <main className="database-startup" role="status" aria-live="polite">
      <div className="database-startup-card">
        <span className="database-startup-mark">◌</span>
        <h1>{state.error ? 'Your notebook needs attention' : 'Opening your notebook'}</h1>
        <p>{state.error || 'Preparing private storage on this device…'}</p>
        {state.error && <button onClick={start}>Try again</button>}
        {state.error && <small>Your previous browser data has not been deleted.</small>}
      </div>
    </main>
  );
}
