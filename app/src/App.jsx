import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Themes from './pages/Themes';
import Languages from './pages/Languages';
import Layout from './pages/Layout';
import Modal from './pages/Modal';
import Dialog from './pages/Dialog';
import Toaster from './pages/Toaster';

export default function App() {
  return (
    <main className="font-body text-foreground">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/themes" element={<Themes />} />
        <Route path="/languages" element={<Languages />} />
        <Route path="/layout" element={<Layout />} />
        <Route path="/modal" element={<Modal />} />
        <Route path="/dialog" element={<Dialog />} />
        <Route path="/toaster" element={<Toaster />} />
      </Routes>
    </main>
  );
}
