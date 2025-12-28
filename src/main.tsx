import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Report from './Report'
import './styles/index.css'

const isReportWindow = window.location.pathname === '/report'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isReportWindow ? <Report /> : <App />}
  </React.StrictMode>,
)
