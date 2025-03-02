'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }) {
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}