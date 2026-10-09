import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Placeholder from './components/Placeholder';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="availability" element={<Placeholder title="Blood availability" />} />
        <Route path="hospitals" element={<Placeholder title="Hospitals and blood banks" />} />
        <Route path="admin" element={<Placeholder title="Inventory management" />} />
        <Route path="login" element={<Placeholder title="Admin login" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
