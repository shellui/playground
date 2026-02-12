import { Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Home from './pages/Home';
import About from './pages/About';

export default function App() {
  const { t } = useTranslation();

  return (
    <>
      <nav>
        <Link to="/">{t('home')}</Link>
        <Link to="/about">{t('about')}</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </>
  );
}
