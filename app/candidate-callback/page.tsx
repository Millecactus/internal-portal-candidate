'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { fetchWithoutAuth } from '@/lib/api-request-utils'

export default function CandidateCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!token) {
            setError('Token manquant')
            return
        }

        const verifyToken = async () => {
            try {
                const response = await fetchWithoutAuth('/candidate/verify-magic-link', {
                    method: 'POST',
                    body: JSON.stringify({ token })
                })

                const data = await response.json()

                if (data.authToken) {
                    // Stockage du token d'authentification candidat
                    sessionStorage.setItem('candidateToken', data.authToken)
                    document.cookie = `candidateToken=${data.authToken}; path=/;`

                    // Stockage des informations du candidat
                    sessionStorage.setItem('candidate', JSON.stringify(data.candidate))
                    document.cookie = `candidate=${JSON.stringify(data.candidate)}; path=/;`

                    // Redirection vers la page candidate
                    router.push('/candidate')
                } else {
                    setError('Réponse invalide du serveur')
                }
            } catch (error) {
                console.error('Erreur lors de la vérification du token:', error)
                if (error instanceof Error) {
                    if (error.message.includes('401')) {
                        setError('Token expiré ou invalide')
                    } else if (error.message.includes('400')) {
                        setError('Token manquant')
                    } else {
                        setError('Une erreur est survenue lors de la vérification du token')
                    }
                } else {
                    setError('Une erreur est survenue lors de la vérification du token')
                }
            }
        }

        verifyToken()
    }, [token, router])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md p-6 bg-white rounded-md shadow-md">
                <h1 className="text-2xl font-bold mb-4">Vérification du lien...</h1>
                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}
                {!error && !token && (
                    <p>Chargement...</p>
                )}
            </div>
        </div>
    )
} 