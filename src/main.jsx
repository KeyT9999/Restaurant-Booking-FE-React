import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'
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
              fontFamily: "'Inter', system-ui, sans-serif",
              background: '#1A1D24',
              color: '#FFFFFF',
              border: '1px solid #2C313C',
              borderRadius: '0.75rem',
              fontSize: '14px',
              boxShadow: '0 14px 40px rgba(0, 0, 0, 0.5)',
            },
            success: {
              style: { borderLeft: '3px solid #22C55E' },
              iconTheme: { primary: '#22C55E', secondary: '#0F1115' },
            },
            error: {
              style: { borderLeft: '3px solid #EF4444' },
              iconTheme: { primary: '#EF4444', secondary: '#0F1115' },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
