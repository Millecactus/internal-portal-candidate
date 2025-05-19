'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = false; // Remplacez par votre logique d'authentification

    if (isAuthenticated) {
      console.log("HERE2")
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return null; // Pas de rendu de contenu
}
