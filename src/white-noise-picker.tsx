import React from 'react';
import ReactDOM from 'react-dom/client';
import { WhiteNoisePickerWindow } from './components/WhiteNoisePickerWindow';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WhiteNoisePickerWindow />
  </React.StrictMode>,
);
