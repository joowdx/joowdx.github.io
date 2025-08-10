import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Footer from './components/footer.jsx';
import Navbar from './components/navigation.jsx';
import './index.css';
import Page from './page.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Navbar />
    <Page />
    <Footer />
  </StrictMode>,
);
