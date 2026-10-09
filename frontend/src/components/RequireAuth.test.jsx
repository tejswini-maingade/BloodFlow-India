import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import RequireAuth from './RequireAuth';

afterEach(cleanup);

function renderAdmin(user) {
  return render(
    <AuthContext.Provider value={{ user }}>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <div>Secret admin</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('RequireAuth', () => {
  test('redirects to /login when logged out', () => {
    renderAdmin(null);
    expect(screen.getByText('Login page')).toBeTruthy();
    expect(screen.queryByText('Secret admin')).toBeNull();
  });

  test('shows the page when logged in', () => {
    renderAdmin({ name: 'Demo Admin', role: 'ADMIN' });
    expect(screen.getByText('Secret admin')).toBeTruthy();
  });
});
