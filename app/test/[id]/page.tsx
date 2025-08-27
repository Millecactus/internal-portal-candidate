"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Play } from "lucide-react";
import { fetchWithoutAuth } from "@/lib/api-request-utils";

const SENIORITY_OPTIONS = [
    { label: "Étudiant", value: "student" },
    { label: "Junior", value: "junior" },
    { label: "Intermédiaire", value: "intermediate" },
    { label: "Senior", value: "senior" },
];

const EXPERTISE_LEVELS = [
    { label: "Débutant", value: "beginner" },
    { label: "Intermédiaire", value: "intermediate" },
    { label: "Avancé", value: "advanced" },
];

// Fonction pour convertir le niveau de séniorité en français
const getSeniorityLabel = (seniorityLevel: string | undefined): string => {
    if (!seniorityLevel) return 'Non spécifié';

    const option = SENIORITY_OPTIONS.find(opt => opt.value === seniorityLevel.toLowerCase());
    return option ? option.label : seniorityLevel.charAt(0).toUpperCase() + seniorityLevel.slice(1);
};

// Fonction pour convertir le niveau d'expertise en français
const getExpertiseLabel = (expertiseLevel: string | undefined): string => {
    if (!expertiseLevel) return '';

    const option = EXPERTISE_LEVELS.find(opt => opt.value === expertiseLevel.toLowerCase());
    return option ? option.label : expertiseLevel.charAt(0).toUpperCase() + expertiseLevel.slice(1);
};

export default function TestInstructionsPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const testId = params.id as string;
    const testResultId = searchParams.get('sessionId');
    const [test, setTest] = useState<{
        title: string;
        description: string;
        questions?: Array<unknown>;
        numberOfQuestions?: number;
        maxTime?: number;
        targetJob?: string;
        targetJobName?: string;
        seniorityLevel?: string;
        categories?: Array<{
            categoryId: string;
            categoryName?: string;
            expertiseLevel?: string;
        }>;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTestSubmitted, setIsTestSubmitted] = useState(false);

    useEffect(() => {
        if (!testId || !testResultId) return;
        async function fetchTest() {
            try {
                const res = await fetchWithoutAuth(`/result/test/${testId}`);
                if (!res.ok) throw new Error("Erreur lors de la récupération du test");
                const data = await res.json();
                setTest(data);

                // Vérifier si le test est déjà soumis
                const nextQuestionRes = await fetchWithoutAuth(`/result/${testResultId}/nextQuestion`);
                if (nextQuestionRes.ok) {
                    const nextQuestionData = await nextQuestionRes.json();
                    setIsTestSubmitted(nextQuestionData.nextQuestionId === "result");
                }
            } catch {
                setError("Impossible de charger le test");
            } finally {
                setLoading(false);
            }
        }
        fetchTest();
    }, [testId, testResultId]);

    const handleStart = async () => {
        if (!testResultId) return;
        try {
            const res = await fetchWithoutAuth(`/result/${testResultId}/nextQuestion`);
            if (!res.ok) throw new Error("Impossible de récupérer la première question");
            const data = await res.json();
            const nextQuestionId = data.nextQuestionId;
            if (nextQuestionId) {
                router.push(`/test/${testId}/question/${nextQuestionId}?sessionId=${testResultId}`);
            }
        } catch {
            alert("Impossible de démarrer le test");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }
    if (error || !test) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-red-500">{error || "Test introuvable"}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Card className="w-full max-w-2xl mx-4 p-8">
                <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                            <Image src="/54.png" alt="Illustration" width={80} height={80} className="w-full h-full object-cover ml-[-22px] mt-[28px]" />
                        </div>
                        <CardTitle className="text-2xl font-bold">{test.title}</CardTitle>
                    </div>
                    <CardDescription className="text-lg mb-2">{test.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        {(test.numberOfQuestions || test.questions) && (
                            <p className="font-medium">Ce test comporte <b>{test.numberOfQuestions || test.questions?.length}</b> questions.</p>
                        )}
                        {test.maxTime && (
                            <p className="text-gray-600">Durée maximum : <b>{Math.round(test.maxTime / 60)} minutes</b></p>
                        )}
                        <p className="text-gray-600 mt-2">
                            Poste visé : <b>{test.targetJobName ? test.targetJobName : test.targetJob ? test.targetJob.charAt(0).toUpperCase() + test.targetJob.slice(1) : 'Non spécifié'}</b> - Niveau <b>{test.seniorityLevel ? getSeniorityLabel(test.seniorityLevel) : 'Non spécifié'}</b>
                        </p>
                        <p className="text-gray-600 mt-2">
                            Compétences visées :
                        </p>
                        {test.categories && test.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {test.categories.map((cat: {
                                    categoryId: string;
                                    categoryName?: string;
                                    expertiseLevel?: string;
                                }) => (
                                    <span key={cat.categoryId} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                                        {cat.categoryName || cat.categoryId}{cat.expertiseLevel ? ` - ${getExpertiseLabel(cat.expertiseLevel)}` : ''}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 mt-10">
                        Règles du test :
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 mb-6">
                        <li>Vous devez réaliser ce test par vous-même.</li>
                        <li>Assurez-vous d&apos;être dans un endroit calme et stable.</li>
                        <li>Le test doit être complété en une seule session.</li>
                    </ul>
                    <div className="flex justify-center mt-10">
                        {isTestSubmitted ? (
                            <div className="text-center">
                                <p className="text-green-600 font-medium mb-2">Test déjà soumis avec succès</p>
                                <Button
                                    onClick={() => router.push('/candidate')}
                                    variant="outline"
                                >
                                    Retour à l&apos;accueil
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={handleStart} className="flex items-center gap-2 text-white bg-yellow-500 hover:bg-yellow-600">
                                <Play className="w-4 h-4" />
                                Démarrer le test
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 