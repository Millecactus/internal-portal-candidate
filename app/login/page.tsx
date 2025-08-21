"use client"
import { LoginForm } from "@/components/login-form"

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Utilisation de 'next/navigation' au lieu de 'next/router'

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialEmail, setInitialEmail] = useState<string>("");

  useEffect(() => {
    // Récupérer le paramètre email depuis l'URL
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setInitialEmail(emailParam);
    }

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

  }, [router, searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <LoginForm initialEmail={initialEmail} />
    </div>
  );
}
