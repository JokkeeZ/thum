import { createRoot } from 'react-dom/client';
import 'bootswatch/dist/cerulean/bootstrap.min.css';
import './styles/style_new.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <App />
)
