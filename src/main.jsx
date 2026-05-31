import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'
import './styles/toast.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 phút
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'Inter, sans-serif',
              background: 'rgba(30, 26, 22, 0.95)',
              color: '#d8cbb8',
              border: '1px solid rgba(216, 203, 184, 0.2)',
              borderRadius: '3px',
              fontSize: '14px',
              boxShadow: '0 14px 40px rgba(0, 0, 0, 0.4)',
            },
            success: {
              style: { borderLeft: '3px solid rgba(34, 197, 94, 0.6)' },
              iconTheme: { primary: '#4ade80', secondary: '#1e1a16' },
            },
            error: {
              style: { borderLeft: '3px solid rgba(200, 114, 114, 0.6)' },
              iconTheme: { primary: '#c87272', secondary: '#1e1a16' },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
