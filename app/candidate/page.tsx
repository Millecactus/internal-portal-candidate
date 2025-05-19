'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fetchAPICandidate } from '@/lib/api-request-utils'

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

                const candidateData = JSON.parse(decodeURIComponent(candidateCookie))
                const response = await fetchAPICandidate(`/candidate/${candidateData.email}`)
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des données')
                }

                const data = await response.json()
                setCandidate(data)
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
                            <h1 className="text-3xl font-bold mb-2">
                                Bonjour {candidate.contact.firstname} {candidate.contact.lastname}
                            </h1>
                            <p className="text-gray-600">{candidate.contact.email}</p>
                        </div>

                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Mes candidatures</CardTitle>
                                    <CardDescription>
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
                                                        <Badge className={getStatusColor(application.status)}>
                                                            {application.status}
                                                        </Badge>
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