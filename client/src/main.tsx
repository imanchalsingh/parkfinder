import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { PWAProvider } from './context/PWAContext.tsx'
import "./i18n";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <PWAProvider>
          <App />
        </PWAProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);
