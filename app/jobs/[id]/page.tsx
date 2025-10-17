"use client"
import Navbar from '@/components/navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from "@/components/ui/textarea";
import { fetchWithoutAuth } from '@/lib/api-request-utils';
import { ArrowRight, ChevronDown, Euro, Facebook, GraduationCap, Instagram, Linkedin, MapPin, Upload } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Job {
    _id: string;
    title: string;
    description: string;
    contractType: string;
    location: string;
    workMode: string;
    experienceLevel: string;
    requiredSkills: string[];
    createdAt: string;
    updatedAt: string;
    status: string;
    applications: string[];
    minSalary?: number;
    maxSalary?: number;
}


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

export default function JobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isSuccess, setIsSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
    const [isEntrepriseExpanded, setIsEntrepriseExpanded] = useState(true);
    const [isVideosExpanded, setIsVideosExpanded] = useState(true);
    const [faqOpen, setFaqOpen] = useState([false, false, false, false, false]);
    const [isLocauxOpen, setIsLocauxOpen] = useState(false);
    const [currentPhoto, setCurrentPhoto] = useState(0);
    const locauxPhotos = Array.from({ length: 13 }, (_, i) => `/photos_locaux/photo_locaux${i + 1}.jpg`);
    const [isPhotosExpanded, setIsPhotosExpanded] = useState(true);
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string | null}>({});
    const formRef = useRef<HTMLFormElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).filter(file => {
                if (file.type !== 'application/pdf') {
                    alert('Seuls les fichiers PDF sont acceptés');
                    return false;
                }
                return true;
            });
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Fonction pour valider les champs du formulaire
    const validateField = (name: string, value: string) => {
        switch (name) {
            case 'email':
                if (!value) return 'L\'email est obligatoire';
                if (!emailRegex.test(value)) return 'Format d\'email invalide (ex: test@test.com)';
                return null;
            case 'phone':
                if (!value) return 'Le téléphone est obligatoire';
                if (!phoneRegex.test(value)) return 'Format de téléphone invalide (ex: 06 06 06 06 06)';
                return null;
            case 'firstName':
                if (!value) return 'Le prénom est obligatoire';
                return null;
            case 'lastName':
                if (!value) return 'Le nom est obligatoire';
                return null;
            default:
                return null;
        }
    };

    // Fonction pour gérer les changements des champs du formulaire
    const handleFieldChange = (name: string, value: string) => {
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // Fonction pour uploader un fichier vers S3
    const uploadFileToS3 = async (file: File, fileIndex: number): Promise<string> => {
        const fileKey = `${fileIndex}-${file.name}`;
        
        try {
            setUploadStatus(`Initialisation de l'upload de ${file.name}...`);
            setUploadProgress(prev => ({ ...prev, [fileKey]: 10 }));

            // Étape 1: Initialiser l'upload
            console.log('🚀 Initialisation de l\'upload pour:', file.name);
            console.log('📊 Données envoyées:', {
                filename: file.name,
                contentType: file.type,
                size: file.size
            });

            const initResponse = await fetchWithoutAuth('/edrm-storage/files/init', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    originalName: file.name,
                    mimeType: file.type,
                    size: file.size,
                    tenantId: "endurance-internal",
                    entityName: "job-application",
                    entityId: `application-${Date.now()}`
                })
            });

            console.log('📡 Réponse init:', {
                status: initResponse.status,
                statusText: initResponse.statusText,
                ok: initResponse.ok
            });

            if (!initResponse.ok) {
                const errorText = await initResponse.text();
                console.error('❌ Erreur init:', errorText);
                throw new Error(`Erreur lors de l'initialisation de l'upload: ${initResponse.status} - ${errorText}`);
            }

            const initData = await initResponse.json();
            console.log('🔍 Structure complète de initData:', JSON.stringify(initData, null, 2));
            console.log('✅ Données init reçues:', initData);
            const { fileId, presignedUrl } = initData.data || initData;

            console.log('📋 fileId extrait:', fileId);
            console.log('📋 presignedUrl extrait:', presignedUrl);
            setUploadStatus(`Upload de ${file.name} vers S3...`);
            setUploadProgress(prev => ({ ...prev, [fileKey]: 50 }));

            // Étape 2: Upload direct vers S3
            console.log('☁️ Upload vers S3:', presignedUrl);
            if (!presignedUrl) {
                throw new Error('URL d\'upload S3 non fournie par l\'API');
            }
            const uploadResponse = await fetch(presignedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                }
            });

            console.log('📡 Réponse S3:', {
                status: uploadResponse.status,
                statusText: uploadResponse.statusText,
                ok: uploadResponse.ok
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('❌ Erreur S3:', errorText);
                throw new Error(`Erreur lors de l'upload vers S3: ${uploadResponse.status} - ${errorText}`);
            }

            setUploadStatus(`Finalisation de l'upload de ${file.name}...`);
            setUploadProgress(prev => ({ ...prev, [fileKey]: 80 }));

            // Étape 3: Finaliser l'upload
            console.log('✅ Finalisation de l\'upload pour fileId:', fileId);
            if (!fileId) {
                throw new Error('ID de fichier non fourni par l\'API');
            }
            const completeResponse = await fetchWithoutAuth(`/edrm-storage/files/${fileId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('📡 Réponse complete:', {
                status: completeResponse.status,
                statusText: completeResponse.statusText,
                ok: completeResponse.ok
            });

            if (!completeResponse.ok) {
                const errorText = await completeResponse.text();
                console.error('❌ Erreur complete:', errorText);
                throw new Error(`Erreur lors de la finalisation de l'upload: ${completeResponse.status} - ${errorText}`);
            }

            setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
            setUploadStatus(`${file.name} uploadé avec succès !`);
            console.log('🎉 Upload terminé avec succès pour:', file.name);

            return fileId;
        } catch (error) {
            console.error('Erreur upload S3:', error);
            setUploadStatus(`Erreur lors de l'upload de ${file.name}`);
            throw error;
        }
    };

    // Fonction de test pour vérifier la connectivité API
    const testApiConnectivity = async (testFileName = "test.pdf") => {
        try {
            console.log('🔍 Test de connectivité API...');
            const testResponse = await fetchWithoutAuth('/edrm-storage/files/init', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    originalName: testFileName,
                    mimeType: "application/pdf",
                    size: 2097152,
                    tenantId: "endurance-internal",
                    entityName: "job-application",
                    entityId: `application-${Date.now()}`
                })
            });
            console.log('✅ API accessible:', testResponse.status);
            return testResponse.ok;
        } catch (error) {
            console.error('❌ API non accessible:', error);
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Test de connectivité avant de commencer
            const isApiAccessible = await testApiConnectivity();
            if (!isApiAccessible) {
                throw new Error('API non accessible. Vérifiez votre connexion et la configuration.');
            }
            // Upload des fichiers vers S3 et récupération des IDs
            const uploadedFileIds: string[] = [];
            
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (file instanceof File) {
                        const fileId = await uploadFileToS3(file, i);
                        uploadedFileIds.push(fileId);
                    }
                }
            }

            // Préparer les données de candidature
            const applicationData = {
                firstname: (e.currentTarget.firstName as HTMLInputElement).value,
                lastname: (e.currentTarget.lastName as HTMLInputElement).value,
                email: (e.currentTarget.email as HTMLInputElement).value,
                phone: (e.currentTarget.phone as HTMLInputElement).value,
                linkedin: (e.currentTarget.linkedin as HTMLInputElement).value,
                message: (e.currentTarget.message as HTMLTextAreaElement).value,
                city: job?.location || '',
                documentIds: uploadedFileIds // IDs des fichiers uploadés vers S3
            };

            // Envoyer la candidature avec les IDs des fichiers
            const response = await fetchWithoutAuth(`/job/${params.id}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(applicationData),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Erreur lors de l'envoi de la candidature: ${errorData}`);
            }

            // Réinitialiser le formulaire avant de changer l'état
            formRef.current?.reset();
            setFiles([]);
            setUploadProgress({});
            setUploadStatus('');
            setIsSuccess(true);
        } catch (error) {
            console.error('❌ Erreur globale:', error);
            setUploadStatus(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
            // TODO: Ajouter une notification d'erreur
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            try {
                const res = await fetchWithoutAuth(`/job/${params.id}`);
                if (!res.ok) throw new Error('Erreur lors de la récupération de l\'offre');
                const data = await res.json();
                setJob(data);
            } catch {
                setJob(null);
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchJob();
    }, [params.id]);

    return (
        <div className="min-h-screen bg-muted">
            <Navbar />
            <main className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 p-6">
                {/* Colonne principale scrollable */}
                <section className="flex-1 min-w-0">
                    <div className="w-full mb-4">
                        <Button variant="link" className="text-gray-500 pl-0" onClick={() => router.push('/jobs')}>
                            &larr; Retour aux offres
                        </Button>
                    </div>
                    <Card className="bg-[#bee6ee] rounded-xl p-8 mb-6">
                        {loading ? (
                            <Skeleton className="h-8 w-1/2 mb-2" />
                        ) : (
                            <Badge variant="secondary" className="bg-white text-black mb-4 uppercase font-bold w-fit">{job?.contractType}</Badge>
                        )}
                        <CardTitle className="text-3xl font-bold mb-2">
                            {loading ? <Skeleton className="h-10 w-1/3" /> : job?.title}
                        </CardTitle>
                        <div className="text-lg text-gray-700 mb-2">
                            {loading ? <Skeleton className="h-6 w-1/4" /> : job?.location}
                        </div>
                    </Card>

                    <Card className={`pt-0 px-8 ${isDescriptionExpanded ? 'pb-8' : 'pb-0'} mb-6`}>
                        <div className={`flex justify-between items-center -mx-8 px-8 py-3 bg-gray-100 rounded-t-md ${isDescriptionExpanded ? 'mb-8' : 'mb-0'}`}>
                            <h2 className="text-2xl font-bold">Le poste</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                className="p-0"
                            >
                                <ChevronDown className={`w-6 h-6 transition-transform ${isDescriptionExpanded ? 'rotate-180' : ''}`} />
                            </Button>
                        </div>
                        <CardContent className={`prose max-w-none p-0 transition-all duration-300 ${isDescriptionExpanded ? 'block' : 'hidden'}`}>
                            {loading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: job?.description || '' }} />
                            )}
                        </CardContent>
                    </Card>

                    <Card className={`pt-0 px-8 ${isVideosExpanded ? 'pb-8' : 'pb-0'} mb-6`}>
                        <div className={`flex justify-between items-center -mx-8 px-8 py-3 bg-gray-100 rounded-t-md ${isVideosExpanded ? 'mb-8' : 'mb-0'}`}>
                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                            <h2 className="text-2xl font-bold">Envie d'en savoir plus ?</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsVideosExpanded(!isVideosExpanded)}
                                className="p-0"
                            >
                                <ChevronDown className={`w-6 h-6 transition-transform ${isVideosExpanded ? 'rotate-180' : ''}`} />
                            </Button>
                        </div>
                        <CardContent className={`prose max-w-none p-0 transition-all duration-300 ${isVideosExpanded ? 'block' : 'hidden'}`}>
                            <div className="flex flex-row gap-6 justify-center">
                                <video controls width="320" className="rounded shadow" poster="/TrouStoryCindy-6.5s.jpg">
                                    <source src="/TrouStoryCindy.mp4" type="video/mp4" />
                                    Votre navigateur ne supporte pas la lecture vidéo.
                                </video>
                                <video controls width="320" className="rounded shadow" poster="/FastCuriousGauthier-5s.jpg">
                                    <source src="/FastCuriousGauthier.mp4" type="video/mp4" />
                                    Votre navigateur ne supporte pas la lecture vidéo.
                                </video>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bloc FAQ */}
                    <Card className="pt-0 px-8 pb-8 mb-6">
                        <div className="-mx-8 px-8 py-3 bg-gray-100 rounded-t-md mb-8">
                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                            <h2 className="text-xl font-bold">QUESTIONS ET RÉPONSES SUR L'OFFRE</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {[
                                {
                                    question: "L'envoi d'un CV est-il obligatoire pour postuler à cette offre ?",
                                    answer: "Pour postuler à cette offre, l'envoi de votre CV est obligatoire."
                                },
                                {
                                    question: "Le télétravail est-il possible pour ce poste ?",
                                    answer: job?.workMode === 'HYBRIDE'
                                        ? "Le télétravail occasionnel est autorisé pour ce poste."
                                        : job?.workMode === 'PRESENTIEL'
                                            ? "Le télétravail n'est pas autorisé pour ce poste."
                                            : job?.workMode === 'REMOTE'
                                                ? "Le poste est majoritairement en télétravail."
                                                : "Information non renseignée."
                                },
                                {
                                    question: "Quel est le type de contrat pour ce poste ?",
                                    answer: job?.contractType === 'CDI'
                                        ? "Le contrat pour ce poste est de type CDI."
                                        : job?.contractType === 'CDD'
                                            ? "Le contrat pour ce poste est de type CDD."
                                            : job?.contractType === 'FREELANCE'
                                                ? "Il s'agit d'un poste en sous-traitance (Freelance)"
                                                : job?.contractType === 'STAGE'
                                                    ? "Il s'agit d'un stage."
                                                    : "Information non renseignée."
                                },
                                {
                                    question: "Une lettre de motivation est-elle obligatoire pour postuler à cette offre ?",
                                    answer: "La lettre de motivation n'est pas obligatoire pour postuler à cette offre."
                                },
                                {
                                    question: "Quelle est la date de début du contrat?",
                                    answer: "Le contrat pour cette offre de job démarre le 2 juin 2025"
                                }
                            ].map((item, idx) => (
                                <div key={idx}>
                                    <button
                                        type="button"
                                        className="w-full flex justify-between items-center py-5 focus:outline-none"
                                        onClick={() => setFaqOpen(faqOpen.map((open, i) => i === idx ? !open : open))}
                                    >
                                        <span className="text-base font-bold text-left">{item.question}</span>
                                        <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${faqOpen[idx] ? 'rotate-180' : ''}`} />
                                    </button>
                                    {faqOpen[idx] && (
                                        <div className="text-gray-700 text-base pb-5 pl-1 pr-8">
                                            {item.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Card postuler en bas */}
                    <Card className="pt-0 px-8 pb-8 mb-6">
                        <div className="-mx-8 px-8 py-3 bg-gray-100 rounded-t-md mb-8">
                            <h2 className="text-2xl font-bold">Cette offre vous tente ?</h2>
                        </div>
                        <div className="flex justify-center">
                            <Button className="text-black font-bold" onClick={() => setIsApplyDialogOpen(true)}>
                                Postuler <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </Card>
                </section>

                {/* Colonne de droite fixe */}
                <aside className="w-full md:w-96 shrink-0 h-fit">
                    <Card className="bg-white rounded-xl p-6 mb-4 mt-12">
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">{loading ? <Skeleton className="h-4 w-24" /> : job?.location} ({loading ? <Skeleton className="h-4 w-12" /> : job?.workMode?.toLowerCase()})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">{loading ? <Skeleton className="h-4 w-24" /> : job?.experienceLevel === 'JUNIOR' ? 'Junior (0-2 ans)' : job?.experienceLevel === 'CONFIRMED' ? 'Confirmé (3-6 ans)' : job?.experienceLevel === 'SENIOR' ? 'Senior (6+ ans)' : job?.experienceLevel}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Euro className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">
                                    {loading ? <Skeleton className="h-4 w-16" /> :
                                        (typeof job?.minSalary === 'number' && typeof job?.maxSalary === 'number'
                                            ? `${job.minSalary}K€ - ${job.maxSalary}K€`
                                            : null)
                                    }
                                </span>
                            </div>
                        </div>
                        <Separator className="my-4" />
                        <div>
                            <div className="font-semibold mb-2">Expertises</div>
                            <div className="flex flex-wrap gap-2">
                                {loading ? <Skeleton className="h-6 w-16" /> : job?.requiredSkills?.map((skill, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                        <Separator className="my-4" />
                        <div>
                            <div className="font-semibold mb-2">Process de recrutement</div>
                            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                                <li>Appel avec un recruteur</li>
                                <li>Entretien technique</li>
                                <li>Entretien avec le CEO ou un manager</li>
                            </ol>
                        </div>
                        <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full mt-6 text-black font-bold" onClick={() => setIsApplyDialogOpen(true)}>
                                    Postuler <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Postuler à {job?.title}</DialogTitle>
                                </DialogHeader>
                                <div className={isSuccess ? 'hidden' : 'block'}>
                                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">Prénom</Label>
                                                <Input id="firstName" required
                                                onBlur={(e) => handleFieldChange('firstName', e.target.value)}
                                                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                                />
                                                {errors.firstName && <span className="text-red-500 text-sm">{errors.firstName}</span>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Nom</Label>
                                                <Input id="lastName" required
                                                onBlur={(e) => handleFieldChange('lastName', e.target.value)}
                                                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                                                />
                                                {errors.lastName && <span className="text-red-500 text-sm">{errors.lastName}</span>}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" required 
                                            onBlur={(e) => handleFieldChange('email', e.target.value)}
                                            onChange={(e) => handleFieldChange('email', e.target.value)}
                                            />
                                            {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Téléphone</Label>
                                            <Input id="phone" type="tel" required
                                            onBlur={(e) => handleFieldChange('phone', e.target.value)}
                                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                                            />
                                            {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="linkedin">Lien LinkedIn</Label>
                                            <Input id="linkedin" type="url" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="message">Message</Label>
                                            <Textarea id="message" rows={4} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Documents joints</Label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Upload className="w-8 h-8 text-gray-400" />
                                                    <div className="text-sm text-gray-500">
                                                        Glissez-déposez vos fichiers PDF ici ou
                                                        <label htmlFor="file-upload" className="text-blue-600 hover:text-blue-500 cursor-pointer ml-1">
                                                            parcourir
                                                        </label>
                                                    </div>
                                                    <input
                                                        id="file-upload"
                                                        type="file"
                                                        className="hidden"
                                                        accept=".pdf"
                                                        multiple
                                                        onChange={handleFileChange}
                                                    />
                                                </div>
                                                {files.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        {files.map((file, index) => (
                                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                                <span className="text-sm truncate">{file.name}</span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeFile(index)}
                                                                    className="text-red-500 hover:text-red-600"
                                                                >
                                                                    Supprimer
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-4">
                                            <Button type="button" variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
                                                Annuler
                                            </Button>
                                            <Button type="submit" disabled={isSubmitting} className="text-black">
                                                {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
                                            </Button>
                                        </div>
                                        {/* Indicateur de progression d'upload */}
                                        {isSubmitting && files.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <div className="text-sm text-gray-600">{uploadStatus}</div>
                                                {files.map((file, index) => {
                                                    const fileKey = `${index}-${file.name}`;
                                                    const progress = uploadProgress[fileKey] || 0;
                                                    return (
                                                        <div key={fileKey} className="space-y-1">
                                                            <div className="flex justify-between text-xs text-gray-500">
                                                                <span>{file.name}</span>
                                                                <span>{progress}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${progress}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </form>
                                </div>
                                <div className={isSuccess ? 'block' : 'hidden'}>
                                    <div className="py-6 text-center space-y-4">
                                        <div className="text-green-600 text-lg font-semibold">
                                            Votre candidature a bien été envoyée !
                                        </div>
                                        <p className="text-gray-600">
                                            Nous avons bien reçu votre candidature et nous vous recontacterons dans les plus brefs délais.
                                        </p>
                                        <div className="pt-4">
                                            <Button
                                                variant="outline"
                                                className="text-black"
                                                onClick={() => router.push('/login')}
                                            >
                                                Se connecter pour suivre ma candidature
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </Card>
                    <Card className={`bg-white rounded-xl pt-0 px-6 ${isEntrepriseExpanded ? 'pb-6' : 'pb-0'} mb-4`}>
                        <div className={`flex justify-between items-center -mx-6 px-6 py-3 bg-gray-100 rounded-t-md ${isEntrepriseExpanded ? 'mb-6' : 'mb-0'}`}>
                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                            <h2 className="text-xl font-bold">L'entreprise</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEntrepriseExpanded(!isEntrepriseExpanded)}
                                className="p-0"
                            >
                                <ChevronDown className={`w-6 h-6 transition-transform ${isEntrepriseExpanded ? 'rotate-180' : ''}`} />
                            </Button>
                        </div>
                        <CardContent className={`prose max-w-none p-0 transition-all duration-300 ${isEntrepriseExpanded ? 'block' : 'hidden'}`}>
                            <div className="flex flex-col items-center gap-4">
                                <Image src="/01.png" alt="Logo entreprise" width={120} height={64} className="rounded" />
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">50 collaborateurs</span>
                                    <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">Créée en 2020</span>
                                    <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">Âge moyen : 27 ans</span>
                                </div>
                                <div className="text-center text-sm text-gray-600 mt-2">
                                    <strong>Siège :</strong><br />
                                    Quai Lawton, Ponton 5, 33300 Bordeaux
                                    <div className="flex justify-center gap-4 mt-3">
                                        <a href="https://www.linkedin.com/company/programisto" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                            <Linkedin className="w-6 h-6 text-gray-500 hover:text-blue-700 transition-colors" />
                                        </a>
                                        <a href="https://www.facebook.com/ProgramistoTech" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                            <Facebook className="w-6 h-6 text-gray-500 hover:text-blue-600 transition-colors" />
                                        </a>
                                        <a href="https://www.instagram.com/programistotech/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                            <Instagram className="w-6 h-6 text-gray-500 hover:text-pink-500 transition-colors" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Card preview locaux */}
                    <Card className={`bg-white rounded-xl p-6 mb-4 pt-0 ${isPhotosExpanded ? 'pb-6' : 'pb-0'}`}>
                        <div className={`flex justify-between items-center -mx-6 px-6 py-3 bg-gray-100 rounded-t-md ${isPhotosExpanded ? 'mb-4' : 'mb-0'}`}>
                            <h2 className="text-xl font-bold">Quelques photos</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsPhotosExpanded(!isPhotosExpanded)}
                                className="p-0"
                            >
                                <ChevronDown className={`w-6 h-6 transition-transform ${isPhotosExpanded ? 'rotate-180' : ''}`} />
                            </Button>
                        </div>
                        <div className={`flex flex-col gap-4 transition-all duration-300 ${isPhotosExpanded ? 'block' : 'hidden'}`}>
                            <div className="grid grid-cols-2 gap-2">
                                {locauxPhotos.slice(0, 4).map((src, idx) => (
                                    <button key={src} onClick={() => { setCurrentPhoto(idx); setIsLocauxOpen(true); }} className="focus:outline-none">
                                        <Image src={src} alt={`Photo locaux ${idx + 1}`} width={160} height={120} className="object-cover rounded w-full h-24" />
                                    </button>
                                ))}
                            </div>
                            <Dialog open={isLocauxOpen} onOpenChange={setIsLocauxOpen}>
                                <DialogContent
                                    tabIndex={0}
                                    onKeyDown={e => {
                                        if (e.key === 'ArrowRight') {
                                            setCurrentPhoto((currentPhoto + 1) % locauxPhotos.length);
                                        } else if (e.key === 'ArrowLeft') {
                                            setCurrentPhoto((currentPhoto - 1 + locauxPhotos.length) % locauxPhotos.length);
                                        }
                                    }}
                                    className="max-w-2xl flex flex-col items-center"
                                >
                                    <DialogTitle className="sr-only">Aperçu photo locaux</DialogTitle>
                                    <div className="flex flex-col items-center">
                                        <Image src={locauxPhotos[currentPhoto]} alt={`Photo locaux ${currentPhoto + 1}`} width={600} height={400} className="rounded mb-4 max-h-[60vh] object-contain" />
                                        <div className="flex justify-between w-full">
                                            <button
                                                onClick={() => setCurrentPhoto((currentPhoto - 1 + locauxPhotos.length) % locauxPhotos.length)}
                                                className="px-4 py-2 text-lg font-bold"
                                                aria-label="Précédent"
                                            >
                                                ←
                                            </button>
                                            <span className="text-sm text-gray-500">{currentPhoto + 1} / {locauxPhotos.length}</span>
                                            <button
                                                onClick={() => setCurrentPhoto((currentPhoto + 1) % locauxPhotos.length)}
                                                className="px-4 py-2 text-lg font-bold"
                                                aria-label="Suivant"
                                            >
                                                →
                                            </button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </Card>
                </aside>
            </main>
        </div>
    );
}
