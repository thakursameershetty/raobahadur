'use client';
import { useEffect } from 'react';
import { AdminProvider } from './AdminProvider';

export default function AdminLayout({ children }) {
  useEffect(() => {
    // Add the admin-mode class to html to override globals.css
    document.documentElement.classList.add('admin-mode');
    document.body.classList.add('admin-mode');

    return () => {
      document.documentElement.classList.remove('admin-mode');
      document.body.classList.remove('admin-mode');
    };
  }, []);

  return (
    <div className="admin-mode-container">
      <AdminProvider>
        {children}
      </AdminProvider>
    </div>
  );
}
