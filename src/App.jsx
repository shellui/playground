import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Themes from './pages/Themes';
import Languages from './pages/Languages';
import Layout from './pages/Layout';
import Modal from './pages/Modal';
import Dialog from './pages/Dialog';
import Toaster from './pages/Toaster';
import Account from './pages/Account';
import Storage from './pages/Storage';
import NotFound from './pages/NotFound';
import OverlaySample from './pages/OverlaySample';
import PlaygroundSettings from './pages/PlaygroundSettings';
import Actions, { ActionsDetail, ActionsLayout } from './pages/Actions';

/** Reset scroll when the hash route changes (in-app links or shell-driven hash replace). */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Links with an anchor (for example /languages#region) scroll on their own.
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  const { pathname } = useLocation();
  // These set their own padding: the shell draws the frame or the Settings pane around them.
  const bare = pathname === '/overlay-sample' || pathname === '/settings';
  return (
    <main className={`font-body text-foreground ${bare ? 'pg-bare' : ''}`}>
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
          path="/account"
          element={<Account />}
        />
        <Route
          path="/storage"
          element={<Storage />}
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
        <Route
          path="/overlay-sample"
          element={<OverlaySample />}
        />
        <Route
          path="/settings"
          element={<PlaygroundSettings />}
        />
        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </main>
  );
}
