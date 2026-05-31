import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();

  // Fix viewport when keyboard opens/closes
  const setVh = () => {
    const h = tg.viewportStableHeight || window.innerHeight;
    document.documentElement.style.setProperty('--tg-vh', h + 'px');
  };
  setVh();
  tg.onEvent('viewportChanged', setVh);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
