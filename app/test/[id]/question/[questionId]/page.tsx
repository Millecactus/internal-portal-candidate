"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { fetchWithoutAuth } from "@/lib/api-request-utils";
import katex from "katex";
import "katex/dist/katex.min.css";
import CodeMirror from '@uiw/react-codemirror';
import { php } from '@codemirror/lang-php';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { markdown } from '@codemirror/lang-markdown';
import { sql } from '@codemirror/lang-sql';
import { csharp } from '@replit/codemirror-lang-csharp';

export default function TestQuestionPage() {
    const router = useRouter();
    const params = useParams();
    const testId = params.id as string;
    const questionId = params.questionId as string;
    const testResultId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('sessionId') : null;

    const [question, setQuestion] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [candidateResponse, setCandidateResponse] = useState<string>("");
    const [nextQuestionId, setNextQuestionId] = useState<string | null>(null);
    const [isLastQuestion, setIsLastQuestion] = useState(false);
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const [remainingTimeString, setRemainingTimeString] = useState<string>("");

    // Liste des langages disponibles
    const codeLanguages = [
        { label: 'PHP', value: 'php', extension: php },
        { label: 'JavaScript', value: 'javascript', extension: javascript },
        { label: 'TypeScript', value: 'typescript', extension: () => javascript({ typescript: true }) },
        { label: 'Python', value: 'python', extension: python },
        { label: 'Java', value: 'java', extension: java },
        { label: 'C++', value: 'cpp', extension: cpp },
        { label: 'C', value: 'c', extension: cpp }, // Utilise cpp pour la coloration C
        { label: 'SQL', value: 'sql', extension: sql },
        { label: 'Markdown', value: 'markdown', extension: markdown },
        { label: 'C#', value: 'csharp', extension: csharp },
        { label: 'Dart', value: 'dart', extension: undefined }, // Pas d'extension officielle
    ];
    const [selectedLanguage, setSelectedLanguage] = useState('php');

    // Trouver l'extension CodeMirror du langage sélectionné
    const getLanguageExtension = useCallback(() => {
        const found = codeLanguages.find(l => l.value === selectedLanguage);
        return found && found.extension ? [found.extension()] : [];
    }, [selectedLanguage]);

    // Détection automatique du langage dans l'énoncé
    useEffect(() => {
        if (question && question.textType === 'code' && question.instruction) {
            // Liste des mots-clés et alias pour chaque langage
            const langKeywords = [
                { value: 'php', regex: /\bphp\b|<\?php/i },
                { value: 'javascript', regex: /\bjavascript\b|\bjs\b|console\.log|function\s*\(/i },
                { value: 'typescript', regex: /\btypescript\b|\bts\b/i },
                { value: 'python', regex: /\bpython\b|\bpy\b|def |print\s*\(/i },
                { value: 'java', regex: /\bjava\b|public\s+class|System\.out\.println/i },
                { value: 'cpp', regex: /\bc\+\+\b|\bcpp\b|std::|#include\s*<iostream>/i },
                { value: 'c', regex: /\bc\b|#include\s*<stdio.h>/i },
                { value: 'sql', regex: /\bsql\b|SELECT |INSERT |UPDATE |DELETE |CREATE TABLE/i },
                { value: 'markdown', regex: /\bmarkdown\b|# |\*\*|__|\[.*\]\(.*\)/i },
                { value: 'csharp', regex: /\bc#\b|\bcsharp\b|using\s+System|Console\.WriteLine/i },
                { value: 'dart', regex: /\bdart\b|void\s+main\s*\(|print\s*\(/i },
            ];
            const found = langKeywords.find(lang => lang.regex.test(question.instruction));
            if (found) {
                // Mappe les alias secondaires vers la valeur attendue
                let langValue = found.value;
                if (langValue === 'cpp') langValue = 'cpp';
                if (langValue === 'csharp') langValue = 'csharp';
                if (langValue === 'js') langValue = 'javascript';
                if (langValue === 'ts') langValue = 'typescript';
                if (langValue === 'py') langValue = 'python';
                if (langValue !== selectedLanguage) {
                    setSelectedLanguage(langValue);
                }
            }
        }
    }, [question]);

    useEffect(() => {
        async function fetchQuestion() {
            try {
                if (!testResultId) throw new Error("Session non trouvée");
                const res = await fetchWithoutAuth(`/result/question/${questionId}?sessionId=${testResultId}`);
                if (!res.ok) throw new Error("Erreur lors de la récupération de la question");
                const data = await res.json();
                setQuestion(data.question);
                // Gestion du timer persistant
                const storageKey = `timer_${testResultId}_${questionId}`;
                const saved = localStorage.getItem(storageKey);
                if (saved !== null) {
                    setRemainingTime(Number(saved));
                } else {
                    setRemainingTime(data.question.time || 0);
                    localStorage.setItem(storageKey, String(data.question.time || 0));
                }
            } catch (e) {
                setError("Impossible de charger la question");
            } finally {
                setLoading(false);
            }
        }
        fetchQuestion();
    }, [questionId, testResultId]);

    useEffect(() => {
        if (!questionId || !testResultId) return;
        async function fetchNextQuestion() {
            const res = await fetchWithoutAuth(`/result/${testResultId}/nextQuestion?currentQuestionId=${questionId}`);
            if (res.ok) {
                const data = await res.json();
                setNextQuestionId(data.nextQuestionId);
                setIsLastQuestion(!data.nextQuestionId);
            }
        }
        fetchNextQuestion();
    }, [testResultId, questionId]);

    useEffect(() => {
        if (loading) return;
        const storageKey = `timer_${testResultId}_${questionId}`;
        if (remainingTime <= 0) {
            localStorage.removeItem(storageKey);
            handleSubmit();
            return;
        }
        const interval = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    localStorage.removeItem(storageKey);
                    return 0;
                }
                const next = prev - 1;
                localStorage.setItem(storageKey, String(next));
                return next;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [remainingTime, loading, testResultId, questionId]);

    useEffect(() => {
        const minutes = Math.floor(remainingTime / 60).toString().padStart(2, '0');
        const seconds = (remainingTime % 60).toString().padStart(2, '0');
        setRemainingTimeString(`${minutes}:${seconds}`);
    }, [remainingTime]);

    // Fonction utilitaire pour rendre l'instruction avec KaTeX
    function renderInstructionWithLatex(text: string) {
        if (!text) return text;
        // On traite dans l'ordre : \[...\], \(...\), $$...$$, $...$
        // \[...\] => display
        text = text.replace(/\\\[([\s\S]+?)\\\]/g, (match, formula) => {
            try {
                return katex.renderToString(formula, { displayMode: true });
            } catch (e) {
                return match;
            }
        });
        // \(...\) => inline
        text = text.replace(/\\\(([\s\S]+?)\\\)/g, (match, formula) => {
            try {
                return katex.renderToString(formula, { displayMode: false });
            } catch (e) {
                return match;
            }
        });
        // $$...$$ => display
        text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
            try {
                return katex.renderToString(formula, { displayMode: true });
            } catch (e) {
                return match;
            }
        });
        // $...$ => inline
        text = text.replace(/\$([\s\S]+?)\$/g, (match, formula) => {
            try {
                return katex.renderToString(formula, { displayMode: false });
            } catch (e) {
                return match;
            }
        });
        return text;
    }

    const handleSubmit = async () => {
        // Nettoyage du timer dans le localStorage
        const storageKey = `timer_${testResultId}_${questionId}`;
        localStorage.removeItem(storageKey);
        try {
            await fetchWithoutAuth(`/result/response`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response: candidateResponse, questionId: questionId, testResultId: testResultId, testId: testId })
            });

            // Récupérer la prochaine question après la soumission
            const nextQuestionRes = await fetchWithoutAuth(`/result/${testResultId}/nextQuestion?currentQuestionId=${questionId}`);
            if (nextQuestionRes.ok) {
                const data = await nextQuestionRes.json();
                const nextQuestionId = data.nextQuestionId;

                if (nextQuestionId === "result" || !nextQuestionId) {
                    router.push(`/test/${testId}/result?sessionId=${testResultId}`);
                } else {
                    router.push(`/test/${testId}/question/${nextQuestionId}?sessionId=${testResultId}`);
                }
            }
        } catch (e) {
            // Erreur silencieuse, ne rien afficher
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }
    if (error || !question) {
        // Redirection automatique vers la prochaine question à répondre
        if (nextQuestionId) {
            router.replace(`/test/${testId}/question/${nextQuestionId}?sessionId=${testResultId}`);
            return null;
        }
        // Si aucune nextQuestionId, aller au résultat
        if (isLastQuestion) {
            router.replace(`/test/${testId}/result?sessionId=${testResultId}`);
            return null;
        }
        // Sinon, afficher l'erreur (cas extrême)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-red-500">{error || "Question introuvable"}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Card className="w-full max-w-2xl mx-4 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Question</h2>
                    <span className="text-gray-600">Temps restant : {remainingTimeString}</span>
                </div>
                <div className="mb-6">
                    <p className="text-lg font-medium mb-2" dangerouslySetInnerHTML={{ __html: renderInstructionWithLatex(question.instruction) }} />
                </div>
                {question.questionType === "MCQ" ? (
                    <div className="flex flex-col gap-4 mb-6">
                        {question.possibleResponses?.map((resp: any, idx: number) => (
                            <Button
                                key={resp._id || idx}
                                variant={candidateResponse === resp.possibleResponse ? "default" : "outline"}
                                className="w-full"
                                onClick={() => setCandidateResponse(resp.possibleResponse)}
                            >
                                {resp.possibleResponse}
                            </Button>
                        ))}
                    </div>
                ) : question.textType === 'code' ? (
                    <div className="mb-6">
                        <div className="mb-2 flex gap-2 items-center">
                            <label htmlFor="language-select" className="text-sm font-medium">Langage :</label>
                            <select
                                id="language-select"
                                className="border rounded px-2 py-1"
                                value={selectedLanguage}
                                onChange={e => setSelectedLanguage(e.target.value)}
                            >
                                {codeLanguages.map(lang => (
                                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                                ))}
                            </select>
                        </div>
                        <CodeMirror
                            value={candidateResponse}
                            height="200px"
                            extensions={getLanguageExtension()}
                            onChange={val => setCandidateResponse(val)}
                            theme="light"
                            basicSetup={{ lineNumbers: true }}
                        />
                    </div>
                ) : (
                    <textarea
                        className="w-full min-h-[120px] border rounded p-2 mb-6"
                        placeholder="Votre réponse..."
                        value={candidateResponse}
                        onChange={e => setCandidateResponse(e.target.value)}
                    />
                )}
                <div className="flex justify-end">
                    <Button onClick={handleSubmit} className="flex items-center gap-2 text-white bg-yellow-500 hover:bg-yellow-600">
                        {isLastQuestion ? "Terminer le test" : "Question suivante"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </Card>
        </div>
    );
} 