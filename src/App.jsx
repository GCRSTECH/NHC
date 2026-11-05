import { Route, Routes } from 'react-router-dom';
import BloodDrips from './components/BloodDrips.jsx';
import Home from './pages/Home.jsx';
import Letter from './pages/Letter.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <>
      <BloodDrips />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/r/:token" element={<Letter />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
