'use client'

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { User, Briefcase } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const isCandidatePage = pathname === '/candidate';

    return (
        <nav className="w-full flex items-center justify-between px-4 py-4 border-b bg-background shadow-sm">
            <Link href="https://programisto.fr" className="flex items-center">
                <Image src="/01.png" alt="Logo Programisto" width={165} height={30} className="w-[165px] h-[30px]" />
            </Link>
            {!isCandidatePage ? (
                <Button asChild className="text-white">
                    <Link href="/candidate" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Espace candidat
                    </Link>
                </Button>
            ) : (
                <Button asChild className="text-white">
                    <Link href="/jobs" className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        Offres d'emploi
                    </Link>
                </Button>
            )}
        </nav>
    );
} 