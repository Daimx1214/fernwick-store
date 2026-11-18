import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ThemeProvider } from './state/ThemeContext.jsx';
import { UiProvider } from './state/UiContext.jsx';
import { AuthProvider } from './state/AuthContext.jsx';
import { CartProvider } from './state/CartContext.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <UiProvider>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </UiProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
