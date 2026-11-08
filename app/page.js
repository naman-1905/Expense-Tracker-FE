"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function App() {
  const router = useRouter();
  useEffect(() => router.replace('/home/'), [router]);
  return <main className="page-loader" aria-label="Opening your local expense tracker"><span className="loader-dot" /></main>;
}
