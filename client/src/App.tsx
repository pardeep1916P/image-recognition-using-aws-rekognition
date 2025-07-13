import React from 'react';
import Aurora from './components/Aurora';
import ImageLabeler from './components/ImageLabeler';
import './index.css';

const App: React.FC = () => (
  <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
    {/* Aurora background */}
    <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
      <Aurora />
    </div>

    {/* Header */}
    <header className="header">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(0,0,0,0.4)',
          padding: '8px 16px',
          borderRadius: 12,
          width: 'fit-content',
        }}
      >
        <img src="/logo.png" alt="logo" style={{ width: 48, height: 48 }} />
        <h1 style={{ margin: 0 }}>Image Labeler</h1>
      </div>
    </header>

    {/* Main content */}
    <main style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <ImageLabeler />
    </main>
  </div>
);

export default App;
