import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store/store'
import './index.css'
import App from './App.jsx'
import HealthCheck from './components/HealthCheck.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HealthCheck>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </HealthCheck>
  </StrictMode>,
)
