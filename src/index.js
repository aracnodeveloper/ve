import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <PayPalScriptProvider options={{ 'client-id': 'AfbecBsoFjZoJL6bVAXkE2uZZVvyA_WY0aGxuSA8Q1UIPAvrRr1h6bRmWMkUQ89F3ztV0GH6jQWb3WEv', 'locale': 'es_EC' }}>
    <App />
  </PayPalScriptProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals