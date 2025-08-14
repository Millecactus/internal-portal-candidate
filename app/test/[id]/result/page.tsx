"use client";

import { useRouter } from "next/navigation";
import { CircleCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ResultPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-sm p-8 border max-w-md w-full">
                <div className="flex flex-col items-center space-y-6 text-center">
                    <div className="flex items-center gap-2">
                        <CircleCheck className="w-8 h-8 text-green-500" />
                        <h1 className="text-2xl font-bold">Test terminé avec succès</h1>
                    </div>

                    <p className="text-gray-600">
                        Merci d&apos;avoir complété ce test. Vos réponses ont été enregistrées avec succès.
                    </p>

                    <Button
                        onClick={() => router.push('/candidate')}
                        className="w-full"
                    >
                        Retour à l&apos;accueil
                    </Button>
                </div>
            </div>
        </div>
    );
} 