import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { HashRouter } from 'react-router-dom'
import { SnackbarProvider } from './Context/SnackbarContext'
import { AppProvider } from './context/AppContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <SnackbarProvider>
      <AppProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AppProvider>
    </SnackbarProvider>
  </React.StrictMode>
)
