import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Global uncaught error listener to safeguard against blank white screen
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Captured window error event:', event.error || event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Captured unhandled promise rejection:', event.reason);
  });
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  const fallback = document.createElement('div');
  fallback.id = 'root';
  document.body.appendChild(fallback);
  createRoot(fallback).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} else {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
