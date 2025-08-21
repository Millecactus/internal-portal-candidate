"use client"
import { LoginForm } from "@/components/login-form"
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginPageContent() {
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

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
