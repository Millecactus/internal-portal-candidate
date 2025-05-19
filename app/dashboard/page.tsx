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
import { CircleParking } from 'lucide-react'; // Importation de l'icône de calendrier

import { useState, useEffect } from 'react';
import { Star, Award, CheckCircle } from 'lucide-react'; // Importation des icônes pertinentes
import Image from 'next/image'; // Importation de l'élément Image de Next.js
import Link from 'next/link'; // Ajout de l'import de Link

interface Event {
  _id: string; // Ajout de l'ID
  name: string;
  description: string;
  type: string;
  location?: string;
  date: string;
  link?: string;
  maxParticipants?: number;
  registeredUsers: string[];
  imageUrl?: string;
}

interface UserData {
  xpHistory: { amount: number }[];
  completedQuests: object[]; // Remplacement de any par object
  badges: object[]; // Remplacement de any par object
  level: number;
  xpForNextLevel: number;
}

interface ProfileData {
  firstname: string;
  lastname: string;
  email: string;
}

export default function Page() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [peopleAtOfficeToday, setPeopleAtOfficeToday] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>([]);


  useEffect(() => {
    const konamiCode = [
      "ArrowUp", "ArrowUp",
      "ArrowDown", "ArrowDown",
      "ArrowLeft", "ArrowRight",
      "ArrowLeft", "ArrowRight",
      "b", "a"
    ];

    let konamiIndex = 0;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          activateNeonMode();
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    }

    function activateNeonMode() {
      document.body.classList.add("neon-mode");
      const konamiImage = document.createElement("img");
      konamiImage.src = "/konamicode.png";
      konamiImage.style.position = "fixed";
      konamiImage.style.left = "0";
      konamiImage.style.top = "50%";
      konamiImage.style.transform = "translateY(-50%)";
      konamiImage.style.transition = "left 5s ease-in-out";
      document.body.appendChild(konamiImage);

      // Déplacer l'image vers la droite
      setTimeout(() => {
        konamiImage.style.left = "100%";
      }, 0);

      // Revenir à la normale après 5s
      setTimeout(() => {
        document.body.classList.remove("neon-mode");
        document.body.removeChild(konamiImage);
      }, 5000);
    }

    document.addEventListener("keydown", handleKeyDown);

    // Nettoyage de l'événement lors du démontage du composant
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetchAPI('/levelling/');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données de levelling');
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données de levelling:', error);
      }
    }

    async function fetchProfileData() {
      try {
        const response = await fetchAPI('/users/profile');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données de profil');
        }
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données de profil:', error);
      }
    }

    async function fetchPresenceData() {
      try {
        const response = await fetchAPI('/presence/today/office');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données de présence');
        }
        const data = await response.json();
        const officePeople = data
          .map((entry: { user: { firstname: string, lastname: string } }) => `${entry.user.firstname} ${entry.user.lastname}`);
        setPeopleAtOfficeToday(officePeople);
      } catch (error) {
        console.error('Erreur lors de la récupération des données de présence:', error);
      }
    }

    async function fetchEvents() {
      try {
        const response = await fetchAPI('/event/upcoming');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des événements');
        }
        const data = await response.json();
        setEvents(data.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
      }
    }

    fetchUserData();
    fetchProfileData();
    fetchPresenceData();
    fetchEvents();
  }, []);

  const totalXP = userData?.xpHistory.reduce((acc, entry) => acc + entry.amount, 0) || 0;
  const completedQuestsCount = userData?.completedQuests.length || 0;
  const badgesCount = userData?.badges.length || 0;
  const level = userData?.level;
  const xpForNextLevel = userData?.xpForNextLevel;
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 bg-gray-50">
          {profileData && (
            <div className="p-4 bg-white rounded-lg shadow mb-4 flex items-center gap-4">
              <Image
                src="/avatar.png"
                alt="Photo de profil"
                width={64}
                height={64}
                className="w-16 h-16 rounded-full flex-shrink-0"
              />
              <div>
                <h3 className="text-lg font-medium">Bienvenue !</h3>
                <p className="text-sm font-bold">
                  <span className="text-lg">
                    {profileData.firstname} {profileData.lastname}
                  </span>
                </p>
                <p className="text-sm font-bold">
                  <span className="text-lg">{profileData.email}</span>
                </p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg shadow flex items-center gap-2">
              <Star className="h-10 w-10 text-yellow-500" />
              <div className="flex-1">
                <p className="text-lg font-bold">Niveau {level}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{
                      width: `${(totalXP / (totalXP + (xpForNextLevel || 0))) * 100
                        }%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm mt-1">
                  Progrès vers le niveau suivant : {totalXP}/
                  {xpForNextLevel ? totalXP + xpForNextLevel : "N/A"} XP
                </p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow flex items-center gap-2">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <div>
                <h3 className="text-sm font-medium">Quêtes complétées</h3>
                <p className="text-lg font-bold">{completedQuestsCount}</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow flex items-center gap-2">
              <Award className="h-10 w-10 text-blue-500" />
              <div>
                <h3 className="text-sm font-medium">Badges</h3>
                <p className="text-lg font-bold">{badgesCount}</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow flex flex-col gap-2">
              <h3 className="text-sm font-medium">Au bureau aujourd&apos;hui</h3>
              <ul className="list-disc pl-5">
                {peopleAtOfficeToday.length > 0 ? (
                  peopleAtOfficeToday.map((person, index) => (
                    <li key={index} className="text-sm font-bold">
                      {person}
                    </li>
                  ))
                ) : (
                  <li className="text-sm font-bold">Personne 😱</li>
                )}
              </ul>
              <div className="mt-2 flex justify-start">
                <a
                  href="/presence"
                  className="rounded bg-primary px-4 py-2 text-white hover:bg-secondary flex items-center gap-2"
                >
                  <CircleParking />
                  Planning de présence
                </a>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow flex justify-center items-center">
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium mb-2">
                  Rejoindre notre serveur Discord
                </h3>
                <iframe
                  src="https://discord.com/widget?id=785522078152392705&theme=dark"
                  width="350"
                  height="500"
                  frameBorder="0"
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                ></iframe>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow flex flex-col gap-2">
              <h3 className="text-sm font-medium">Prochains évènements</h3>
              <div className="space-y-2">
                {events.map((event) => (
                  <Link
                    href={`/events/${event._id}`}
                    key={event._id}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg flex items-center gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                        <Image
                          src={event.imageUrl || "/event.png"}
                          alt={event.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-md font-bold truncate">{event.name}</h4>
                        <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                        {event.location && (
                          <p className="text-sm text-gray-600 truncate">{event.location}</p>
                        )}
                        {event.maxParticipants && (
                          <p className="text-sm text-gray-600">
                            {event.registeredUsers.length} / {event.maxParticipants} participants
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                {events.length === 0 && (
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">Aucun événement à venir</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );

}