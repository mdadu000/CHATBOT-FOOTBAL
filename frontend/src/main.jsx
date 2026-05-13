import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            className: '!bg-pitch-panel !text-slate-100 !border !border-white/10',
            duration: 4000,
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
