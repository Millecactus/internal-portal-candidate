'use client'

import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { fetchAPI } from "@/lib/api-request-utils"
import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import { MapPin, Users, Link as LinkIcon, Clock, Tag } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getUser } from "@/lib/utils"

interface Participant {
    firstname: string
    lastname: string
    email: string
}

interface Event {
    _id: string
    name: string
    description: string
    type: 'InPerson' | 'Online'
    location?: string
    date: string
    link?: string
    maxParticipants?: number
    registeredUsers: string[]
    participants: Participant[]
    imageUrl?: string
    organizer?: {
        firstname: string
        lastname: string
        avatarUrl?: string
    }
}

const EVENT_TYPE_TRANSLATIONS = {
    'InPerson': 'Présentiel',
    'Online': 'En ligne'
} as const

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [isRegistering, setIsRegistering] = useState(false)
    const currentUser = getUser()

    const isUserRegistered = event?.participants?.some(
        participant => participant.email === currentUser?.email
    )
    const isEventFull = event?.maxParticipants ? event.registeredUsers.length >= event.maxParticipants : false

    const handleRegistration = async () => {
        if (!event) return
        setIsRegistering(true)
        try {
            const response = await fetchAPI(`/event/${resolvedParams.id}/register`, {
                method: 'POST'
            })
            if (!response.ok) throw new Error('Erreur lors de l\'inscription')

            const eventResponse = await fetchAPI(`/event/${resolvedParams.id}`)
            const updatedEvent = await eventResponse.json()
            setEvent(updatedEvent)
            toast.success('Vous êtes inscrit à l\'événement !')
        } catch (error) {
            console.error('Erreur:', error)
            toast.error('Erreur lors de l\'inscription')
        } finally {
            setIsRegistering(false)
        }
    }

    const handleUnregistration = async () => {
        if (!event) return
        setIsRegistering(true)
        try {
            const response = await fetchAPI(`/event/${resolvedParams.id}/unregister`, {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('Erreur lors de la désinscription')

            const eventResponse = await fetchAPI(`/event/${resolvedParams.id}`)
            const updatedEvent = await eventResponse.json()
            setEvent(updatedEvent)
            toast.success('Vous êtes désinscrit de l\'événement')
        } catch (error) {
            console.error('Erreur:', error)
            toast.error('Erreur lors de la désinscription')
        } finally {
            setIsRegistering(false)
        }
    }

    useEffect(() => {
        async function fetchEvent() {
            try {
                const response = await fetchAPI(`/event/${resolvedParams.id}`)
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération de l\'événement')
                }
                const data = await response.json()
                setEvent(data)
            } catch (error) {
                console.error('Erreur:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchEvent()
    }, [resolvedParams.id])

    if (loading) {
        return (
            <SidebarProvider defaultOpen={false}>
                <AppSidebar />
                <SidebarInset>
                    <div className="p-4">Chargement...</div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    if (!event) {
        return (
            <SidebarProvider defaultOpen={false}>
                <AppSidebar />
                <SidebarInset>
                    <div className="p-4">Événement non trouvé</div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    const eventDate = new Date(event.date)

    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="#">{event.name}</BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="flex flex-1 flex-col md:flex-row gap-6 p-6 bg-gray-50">
                    <div className="flex-1 space-y-6">
                        <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg bg-gray-100">
                            <Image
                                src={event.imageUrl || "/event.png"}
                                alt={event.name}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        <div className="p-6 bg-white rounded-lg shadow space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-3xl font-bold">{event.name}</h1>

                                {event.organizer && (
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={event.organizer.avatarUrl} />
                                            <AvatarFallback>{event.organizer.firstname[0]}{event.organizer.lastname[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm text-gray-500">Organisé par</p>
                                            <p className="font-medium">{event.organizer.firstname} {event.organizer.lastname}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 border-t border-gray-200 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-6 w-6 text-gray-500 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium">{eventDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            <p className="text-gray-600">{eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>

                                    {event.location && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-6 w-6 text-gray-500 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium">Lieu</p>
                                                <p className="text-gray-600">{event.location}</p>
                                            </div>
                                        </div>
                                    )}

                                    {event.type && (
                                        <div className="flex items-start gap-3">
                                            <Tag className="h-6 w-6 text-gray-500 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium">Type d&apos;événement</p>
                                                <p className="text-gray-600">{EVENT_TYPE_TRANSLATIONS[event.type as keyof typeof EVENT_TYPE_TRANSLATIONS]}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-gray-200 pt-6">
                                <h2 className="text-xl font-semibold">Description</h2>
                                <p className="text-gray-600 whitespace-pre-line">{event.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:w-80 space-y-6">
                        <div className="p-6 bg-white rounded-lg shadow">
                            <div className="space-y-4">
                                {event.maxParticipants && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Participants</h3>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Users className="h-5 w-5" />
                                                <span>{event.registeredUsers.length} / {event.maxParticipants} places</span>
                                            </div>
                                            {currentUser && (
                                                <div>
                                                    {!isUserRegistered && !isEventFull && (
                                                        <Button
                                                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                                                            onClick={handleRegistration}
                                                            disabled={isRegistering}
                                                        >
                                                            {isRegistering ? 'Inscription...' : 'Participer'}
                                                        </Button>
                                                    )}

                                                    {isUserRegistered && (
                                                        <Button
                                                            variant="destructive"
                                                            className="w-full"
                                                            onClick={handleUnregistration}
                                                            disabled={isRegistering}
                                                        >
                                                            {isRegistering ? 'Désinscription...' : 'Se désinscrire'}
                                                        </Button>
                                                    )}

                                                    {!isUserRegistered && isEventFull && (
                                                        <p className="text-center text-gray-500 text-sm">
                                                            Cet événement est complet
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {event.link && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Lien externe</h3>
                                        <a
                                            href={event.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-primary hover:underline"
                                        >
                                            <LinkIcon className="h-5 w-5" />
                                            <span>Voir le lien</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {event.participants && event.participants.length > 0 && (
                            <div className="p-6 bg-white rounded-lg shadow">
                                <h3 className="font-semibold mb-4">Liste des participants</h3>
                                <div className="space-y-3">
                                    {event.participants.map((participant, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{participant.firstname[0]}{participant.lastname[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{participant.firstname} {participant.lastname}</p>
                                                <p className="text-sm text-gray-500">{participant.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
} 