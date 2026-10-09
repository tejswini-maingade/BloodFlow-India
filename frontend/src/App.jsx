import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Placeholder from './components/Placeholder';
import Dashboard from './pages/Dashboard';
import Availability from './pages/Availability';
import Hospitals from './pages/Hospitals';
import HospitalDetail from './pages/HospitalDetail';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="availability" element={<Availability />} />
        <Route path="hospitals" element={<Hospitals />} />
        <Route path="hospitals/:id" element={<HospitalDetail />} />
        <Route path="admin" element={<Placeholder title="Inventory management" />} />
        <Route path="login" element={<Placeholder title="Admin login" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
