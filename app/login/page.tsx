"use client"
import { LoginForm } from "@/components/login-form"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Utilisation de 'next/navigation' au lieu de 'next/router'

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    let accessToken = null;
    try {
      accessToken = sessionStorage.getItem('accessToken');
    } catch (error) {
      console.error('Erreur lors de l\'accès à sessionStorage:', error);
    }

    if (!accessToken) {
      const cookieToken = document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];
      accessToken = cookieToken || null;
    }



  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}
