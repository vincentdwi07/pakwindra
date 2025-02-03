'use client';

import { useEffect } from 'react';

export default function Providers({ children }) {
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return children;
}