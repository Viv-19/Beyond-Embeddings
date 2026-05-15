import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ContentProvider } from './context/ContentContext.jsx'
import { UserAuthProvider } from './context/UserAuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserAuthProvider>
      <ContentProvider>
        <App />
      </ContentProvider>
    </UserAuthProvider>
  </React.StrictMode>,
)
