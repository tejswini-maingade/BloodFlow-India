import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Dashboard from './pages/Dashboard';
import Availability from './pages/Availability';
import Hospitals from './pages/Hospitals';
import HospitalDetail from './pages/HospitalDetail';
import Admin from './pages/Admin';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="availability" element={<Availability />} />
        <Route path="hospitals" element={<Hospitals />} />
        <Route path="hospitals/:id" element={<HospitalDetail />} />
        <Route
          path="admin"
          element={
            <RequireAuth>
              <Admin />
            </RequireAuth>
          }
        />
        <Route path="login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
