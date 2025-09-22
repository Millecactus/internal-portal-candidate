'use client';

import { useEffect } from 'react';
import { fetchAPI } from '@/lib/api-request-utils';


const AuthCallback = () => {
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (code) {
            console.log('NEXT_PUBLIC_API_URL (azure callback):', process.env.NEXT_PUBLIC_API_URL);
            fetch(process.env.NEXT_PUBLIC_API_URL + '/users/login/azure/exchange', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, state }),
                credentials: 'include', // 🔥 Permet d'envoyer et de recevoir les cookies HTTP-Only
            })
                .then((response) => {
                    if (!response.ok) {
                        console.error('Authentication failed');
                        window.location.href = `/register`;
                    }
                    else {

                        (async () => {
                            try {
                                const data = await response.json();
                                const accessToken = data.accessToken;
                                const refreshToken = data.refreshToken;

                                // Stockage dans sessionStorage
                                sessionStorage.setItem('accessToken', accessToken);
                                sessionStorage.setItem('refreshToken', refreshToken);

                                // Stockage dans les cookies
                                document.cookie = `accessToken=${accessToken}; path=/;`;
                                document.cookie = `refreshToken=${refreshToken}; path=/;`;

                                const profileResponse = await fetchAPI('/users/profile');

                                if (!profileResponse.ok) {
                                    throw new Error('Failed to fetch user profile');
                                }

                                const userData = await profileResponse.json();
                                // Store the full user object in sessionStorage
                                sessionStorage.setItem('user', JSON.stringify(userData));
                                document.cookie = `user=${JSON.stringify(userData)}; path=/;`;

                                window.history.replaceState({}, document.title, window.location.pathname);

                                // Récupérer le redirectUrl depuis les cookies
                                const storedRedirectUrl = document.cookie
                                    .split('; ')
                                    .find(row => row.startsWith('redirectUrl='))
                                    ?.split('=')[1];

                                // Nettoyer le cookie redirectUrl
                                if (storedRedirectUrl) {
                                    const cookies = document.cookie.split('; ');
                                    const updatedCookies = cookies.filter(cookie => !cookie.startsWith('redirectUrl='));
                                    document.cookie = updatedCookies.join('; ');
                                }

                                // Redirection vers l'URL spécifiée ou vers le dashboard par défaut
                                const redirectUrl = storedRedirectUrl ? decodeURIComponent(storedRedirectUrl) : '/dashboard';
                                window.location.href = redirectUrl;
                            } catch (error) {
                                console.error('Failed to process authentication', error);
                                window.location.href = `/register`;
                            }
                        })();
                    }

                })
                .catch((error) => {
                    console.error('Authentication failed', error);
                    window.location.href = `/register`;

                });
        }
    }, []);

    return <div>Authentification en cours...</div>;
};

export default AuthCallback;