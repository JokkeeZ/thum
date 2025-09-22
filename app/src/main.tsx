import { createRoot } from 'react-dom/client';
import 'bootswatch/dist/cerulean/bootstrap.min.css';
import './styles/style_new.css';
import App from './App.tsx';
import 'bootstrap/dist/js/bootstrap.min.js';

createRoot(document.getElementById('root')!).render(
  <App />
)
