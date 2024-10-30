import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FileCompressionApp from './FileCompression.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FileCompressionApp />
  </StrictMode>,
)
