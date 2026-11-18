import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/mulish/400.css'
import '@fontsource/mulish/500.css'
import '@fontsource/mulish/600.css'
import '@fontsource/mulish/700.css'
import './index.css'
import './styles/cuw-broker-form.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
