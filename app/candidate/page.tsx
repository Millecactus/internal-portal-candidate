'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/navbar'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchAPICandidate } from '@/lib/api-request-utils'
import { Play } from 'lucide-react'

interface JobApplication {
    _id: string;
    status: string;
    jobId: {
        _id: string;
        title: string;
        contractType: string;
        workMode: string;
        status: string;
    };
}

interface TestCategory {
    categoryId: string;
    expertiseLevel: string;
    categoryName: string;
}

interface TestResult {
    _id: string;
    testId: string;
    state: string;
    score?: number;
    maxScore?: number;
    invitationDate: string;
    completedDate?: string;
    createdAt: string;
    testResultId: string;
    test: {
        title: string;
        description: string;
        targetJob: string;
        seniorityLevel: string;
        categories?: TestCategory[];
    };
}

interface Candidate {
    _id: string;
    contact: {
        firstname: string;
        lastname: string;
        email: string;
        phone: string;
        linkedin: string;
        city: string;
        notes: string;
    };
    applications: JobApplication[];
}

export default function CandidatePage() {
    const router = useRouter()
    const [candidate, setCandidate] = useState<Candidate | null>(null)
    const [testResults, setTestResults] = useState<TestResult[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCandidateData = async () => {
            try {
                const candidateCookie = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('candidate='))
                    ?.split('=')[1]

                if (!candidateCookie) {
                    setError('Session non trouvée')
                    setLoading(false)
                    return
                }

                const cookieData = JSON.parse(decodeURIComponent(candidateCookie))
                const [candidateResponse, testResultsResponse] = await Promise.all([
                    fetchAPICandidate(`/candidate/${cookieData.email}`),
                    fetchAPICandidate(`/result/results/${cookieData.id}?page=1&limit=10&sortBy=invitationDate&sortOrder=desc`)
                ])

                if (!candidateResponse.ok || !testResultsResponse.ok) {
                    throw new Error('Erreur lors de la récupération des données')
                }

                const [candidateResponseData, testResultsResponseData] = await Promise.all([
                    candidateResponse.json(),
                    testResultsResponse.json()
                ])

                setCandidate(candidateResponseData)
                setTestResults(testResultsResponseData.data)
            } catch (err) {
                setError('Une erreur est survenue lors du chargement des données')
                console.error('Erreur:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchCandidateData()
    }, [router])

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'en cours':
                return 'bg-yellow-500'
            case 'validé':
                return 'bg-green-500'
            case 'refusé':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    const translateStatus = (status: string) => {
        switch (status.toUpperCase()) {
            case 'IN_PROGRESS':
                return 'En cours'
            case 'VALIDATED':
                return 'Validé'
            case 'REJECTED':
                return 'Refusé'
            case 'PENDING':
                return 'En attente'
            case 'ACCEPTED':
                return 'Accepté'
            case 'CANCELLED':
                return 'Annulé'
            default:
                return status
        }
    }

    const getTestStateColor = (state: string) => {
        switch (state.toLowerCase()) {
            case 'pending':
            case 'inprogress':
                return 'bg-yellow-500'
            case 'completed':
            case 'finish':
                return 'bg-green-500'
            case 'expired':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    const getTestStateLabel = (state: string) => {
        switch (state.toLowerCase()) {
            case 'pending':
                return 'À faire'
            case 'inprogress':
                return 'En cours'
            case 'completed':
            case 'finish':
                return 'Terminé'
            case 'expired':
                return 'Expiré'
            default:
                return state
        }
    }

    const handleStartTest = (testId: string, testResultId: string) => {
        router.push(`/test/${testId}?sessionId=${testResultId}`)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-[50vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-red-500">{error}</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                {candidate && (
                    <>
                        <div className="mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                                    <Image src="/54.png" alt="Illustration" width={64} height={64} className="w-full h-full object-cover ml-[-20px] mt-[22px]" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">
                                        Bonjour {candidate.contact.firstname} {candidate.contact.lastname}
                                    </h1>
                                    <p className="text-gray-600">{candidate.contact.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Mes candidatures</CardTitle>
                                    <CardDescription>
                                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                                        Suivez l'état de vos candidatures
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {candidate.applications.length === 0 ? (
                                        <p className="text-gray-500">Aucune candidature en cours</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {candidate.applications.map((application) => (
                                                <div key={application._id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-semibold text-lg">
                                                                {application.jobId.title}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {application.jobId.contractType} - {application.jobId.workMode}
                                                            </p>
                                                        </div>
                                                        <Badge className={getStatusColor(translateStatus(application.status))}>
                                                            {translateStatus(application.status)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Tests techniques</CardTitle>
                                    <CardDescription>
                                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                                        Suivez l'état de vos tests techniques
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {testResults.length === 0 ? (
                                        <p className="text-gray-500">Aucun test technique en attente</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {testResults.map((result) => (
                                                <div key={result._id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="w-full">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-semibold text-lg">
                                                                    {result.test.title}
                                                                </h3>
                                                                <Badge className={getTestStateColor(result.state)}>
                                                                    {getTestStateLabel(result.state)}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 mb-1">
                                                                <span className="font-medium">
                                                                    {result.test.targetJob.charAt(0).toUpperCase() + result.test.targetJob.slice(1)}
                                                                </span>
                                                                <span>- Niveau {result.test.seniorityLevel}</span>
                                                                <span className="text-gray-500">- Invité le {formatDate(result.createdAt)}</span>
                                                            </div>
                                                            {result.test.categories && result.test.categories.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mb-1 mt-1">
                                                                    {result.test.categories.map((cat) => (
                                                                        <span key={cat.categoryId} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                                                                            {cat.categoryName}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2 min-w-[120px] max-w-[180px]">
                                                            {result.score !== undefined && result.maxScore !== undefined && (
                                                                <div className="bg-gray-100 rounded-lg px-4 py-2 w-full">
                                                                    <span className="flex items-baseline gap-1 text-lg text-gray-800 font-normal">
                                                                        <span>Score&nbsp;:</span>
                                                                        <span className="font-bold">{Math.ceil((result.score / result.maxScore) * 100)}%</span>
                                                                    </span>
                                                                    <span className="block text-xs text-gray-500">
                                                                        ({Math.round(result.score)} / {result.maxScore} pts)
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {(result.state.toLowerCase() === 'pending' || result.state.toLowerCase() === 'inprogress') && (
                                                                <Button
                                                                    onClick={() => handleStartTest(result.testId, result.testResultId)}
                                                                    className="mt-2 flex items-center gap-2"
                                                                >
                                                                    <Play className="w-4 h-4" />
                                                                    {result.state.toLowerCase() === 'pending' ? 'Démarrer le test' : 'Reprendre le test'}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                        </div>
                    </>
                )}
            </div>
        </div>
    )
} 