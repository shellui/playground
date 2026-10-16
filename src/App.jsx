import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Themes from './pages/Themes';
import Languages from './pages/Languages';
import Layout from './pages/Layout';
import Modal from './pages/Modal';
import Dialog from './pages/Dialog';
import Toaster from './pages/Toaster';
import Chat from './pages/Chat';
import Actions, { ActionsDetail, ActionsLayout } from './pages/Actions';

/** Reset scroll when the hash route changes (in-app links or shell-driven hash replace). */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <main className="font-body text-foreground">
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/themes"
          element={<Themes />}
        />
        <Route
          path="/languages"
          element={<Languages />}
        />
        <Route
          path="/layout"
          element={<Layout />}
        />
        <Route
          path="/modal"
          element={<Modal />}
        />
        <Route
          path="/dialog"
          element={<Dialog />}
        />
        <Route
          path="/toaster"
          element={<Toaster />}
        />
        <Route
          path="/chat"
          element={<Chat />}
        />
        <Route
          path="/actions"
          element={<ActionsLayout />}
        >
          <Route
            index
            element={<Actions />}
          />
          <Route
            path="detail"
            element={<ActionsDetail />}
          />
        </Route>
      </Routes>
    </main>
  );
}
