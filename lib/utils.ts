import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUser() {
  try {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      const userFromSession = sessionStorage.getItem('user');
      if (userFromSession) {
        return JSON.parse(userFromSession);
      } else if (window.document.cookie && window.document.cookie.includes('user')) {
        console.log("userFromSession is undefined");
        const userFromCookie = window.document.cookie.split('; ').find(row => row.startsWith('user='));
        if (userFromCookie) {
          sessionStorage.setItem('user', userFromCookie.split('=')[1]);
          return JSON.parse(userFromCookie.split('=')[1]);
        }
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'accès à sessionStorage:", error);
  }

  return null;
}