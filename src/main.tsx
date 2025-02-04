import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { setupErrorHandlers } from './utils/errorHandler';

// Initialize error handlers
setupErrorHandlers();

// Create root with error handling
const renderApp = () => {
  try {
    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div class="min-h-screen bg-gray-900 flex items-center justify-center px-4">
          <div class="max-w-md w-full space-y-6 text-center">
            <div class="space-y-4">
              <h2 class="text-2xl font-bold text-gray-100">
                Failed to Load Application
              </h2>
              <p class="text-gray-400">
                We're sorry, but the application failed to load. Please try refreshing the page.
              </p>
              <button 
                onclick="window.location.reload()"
                class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 
                       text-white rounded-lg transition-colors duration-200"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }
};

// Start the app
renderApp();

// Add hot module replacement support
if (import.meta.hot) {
  import.meta.hot.accept();
}
