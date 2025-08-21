'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

interface GoogleAnalyticsProps {
    trackingId: string;
}

export default function GoogleAnalytics({ trackingId }: GoogleAnalyticsProps) {
    useEffect(() => {
        if (typeof window !== 'undefined' && trackingId) {
            // Charger le script Google Analytics
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
            document.head.appendChild(script);

            // Initialiser Google Analytics
            window.dataLayer = window.dataLayer || [];
            function gtag(...args: any[]) {
                window.dataLayer.push(args);
            }
            window.gtag = gtag;

            gtag('js', new Date());
            gtag('config', trackingId, {
                page_title: document.title,
                page_location: window.location.href,
            });
        }
    }, [trackingId]);

    return null;
}
