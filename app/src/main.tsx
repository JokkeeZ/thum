import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/bootstrap.min.css';
import './styles/style_new.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
