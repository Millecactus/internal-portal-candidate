'use client'

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const isCandidatePage = pathname === '/candidate';

    return (
        <nav className="w-full flex items-center justify-between px-4 py-4 border-b bg-background shadow-sm">
            <Link href="/" className="flex items-center">
                <Image src="/01.png" alt="Logo Programisto" width={165} height={30} className="w-[165px] h-[30px]" />
            </Link>
            {!isCandidatePage && (
                <Button asChild className="text-black">
                    <Link href="/login" className="">Espace candidat</Link>
                </Button>
            )}
        </nav>
    );
} 