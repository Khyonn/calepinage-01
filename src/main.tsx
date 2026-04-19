import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { createAppStore } from '@/store'
import { applyTheme, readTheme, resolveTheme } from '@/persistence/theme'
import './index.css'
import App from './App.tsx'

applyTheme(resolveTheme(readTheme()))

const store = await createAppStore()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
