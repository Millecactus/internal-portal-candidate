'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

interface ClarityProps {
    projectId: string;
}

export default function ClarityBlock({ projectId }: ClarityProps) {
    useEffect(() => {
        if (typeof window !== 'undefined' && projectId) {
            Clarity.init(projectId);
        }
    }, [projectId]);

    return null;
}
