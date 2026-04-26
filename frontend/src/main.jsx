import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import {AuthProvider} from './context/AuthContext.jsx';

import './styles/main.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
      { /* AuthProvider wraps App so every component
        has access to auth data */ }
      <AuthProvider>
          <App />
      </AuthProvider>
  </StrictMode>
)

// StrictMode
// ---> Auth Provider (gives auth access to everything inside)
//      ---> App (all the pages and routes)