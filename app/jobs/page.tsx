'use client'
import { useEffect, useState, useCallback } from "react";
import Navbar from '@/components/navbar';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchWithoutAuth } from '@/lib/api-request-utils';
import Link from "next/link";
import { MapPin, Laptop, Euro } from 'lucide-react';

interface Job {
    _id: string;
    title: string;
    location: string;
    city: string;
    contractType: string;
    workMode: string;
    experienceLevel: string;
    salary?: string;
    minSalary?: number;
    maxSalary?: number;
    description: string;
    requiredSkills: string[];
    createdAt: string;
    updatedAt: string;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

interface JobsResponse {
    data: Job[];
    pagination: Pagination;
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        contractType: 'all',
        workMode: 'all',
        experienceLevel: 'all',
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        page: 1,
        limit: 10
    });

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: filters.page.toString(),
                limit: filters.limit.toString(),
                search: filters.search,
                contractType: filters.contractType,
                workMode: filters.workMode,
                experienceLevel: filters.experienceLevel,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder
            });

            const response = await fetchWithoutAuth(`/job?${queryParams.toString()}`);
            const data: JobsResponse = await response.json();

            setJobs(data.data);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Erreur lors de la récupération des offres:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchJobs();
    }, [filters, fetchJobs]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Réinitialiser la page lors du changement de filtre
        }));
    };

    const formatWorkMode = (mode: string) => {
        return mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase();
    };

    return (
        <div className="min-h-screen bg-muted">
            <Navbar />
            <main className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 p-6">
                {/* Filtres */}
                <aside className="w-full md:w-64 mb-6 md:mb-0">
                    <div className="bg-white rounded-lg shadow p-4 space-y-4">
                        <Input
                            placeholder="Rechercher..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="mb-4"
                        />
                        <Accordion type="multiple" defaultValue={["type", "mode", "experience"]} className="bg-white rounded-lg">
                            <AccordionItem value="type">
                                <AccordionTrigger>Type de contrat</AccordionTrigger>
                                <AccordionContent>
                                    <Select
                                        value={filters.contractType}
                                        onValueChange={(value) => handleFilterChange('contractType', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous</SelectItem>
                                            <SelectItem value="CDI">CDI</SelectItem>
                                            <SelectItem value="CDD">CDD</SelectItem>
                                            <SelectItem value="STAGE">Stage</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="mode">
                                <AccordionTrigger>Mode de travail</AccordionTrigger>
                                <AccordionContent>
                                    <Select
                                        value={filters.workMode}
                                        onValueChange={(value) => handleFilterChange('workMode', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous</SelectItem>
                                            <SelectItem value="ONSITE">Sur site</SelectItem>
                                            <SelectItem value="REMOTE">Télétravail</SelectItem>
                                            <SelectItem value="HYBRID">Hybride</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="experience">
                                <AccordionTrigger>Expérience</AccordionTrigger>
                                <AccordionContent>
                                    <Select
                                        value={filters.experienceLevel}
                                        onValueChange={(value) => handleFilterChange('experienceLevel', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous</SelectItem>
                                            <SelectItem value="JUNIOR">Junior</SelectItem>
                                            <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                                            <SelectItem value="SENIOR">Senior</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </aside>

                {/* Liste des offres */}
                <section className="flex-1 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">
                            {loading ? 'Chargement...' : `${jobs.length} offres affichées sur ${pagination?.totalItems || 0} disponibles`}
                        </h2>
                        <Select
                            value={`${filters.sortBy}-${filters.sortOrder}`}
                            onValueChange={(value) => {
                                const [sortBy, sortOrder] = value.split('-');
                                handleFilterChange('sortBy', sortBy);
                                handleFilterChange('sortOrder', sortOrder);
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Trier par" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="updatedAt-desc">Plus récent</SelectItem>
                                <SelectItem value="updatedAt-asc">Plus ancien</SelectItem>
                                <SelectItem value="title-asc">Titre A-Z</SelectItem>
                                <SelectItem value="title-desc">Titre Z-A</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8">Chargement des offres...</div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-8">Aucune offre ne correspond à vos critères</div>
                        ) : (
                            jobs.map((job) => (
                                <Card key={job._id} className="flex flex-col md:flex-row items-center md:items-stretch p-4 gap-4 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-center w-16 h-16">
                                        <Avatar>
                                            <AvatarFallback className="bg-[#fbbf24] text-white text-xl font-bold">
                                                {job.title[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <CardHeader className="p-0 mb-2">
                                            <CardTitle className="text-xl flex items-center gap-2">
                                                <span className="text-xl font-bold">{job.title}</span> <span className="text-xs">({job.contractType})</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 text-sm text-gray-600 flex flex-col md:flex-row gap-2 md:gap-6">
                                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                                            <span className="flex items-center gap-1"><Laptop className="w-4 h-4" /> {formatWorkMode(job.workMode)}</span>
                                            <span className="flex items-center gap-1"><Euro className="w-4 h-4" /> {typeof job.minSalary === 'number' && typeof job.maxSalary === 'number' ? `${job.minSalary}K€ - ${job.maxSalary}K€` : job.salary}</span>
                                        </CardContent>
                                    </div>
                                    <div className="flex items-center">
                                        <Link href={`/jobs/${job._id}`}>
                                            <Button variant="outline" className="whitespace-nowrap">
                                                {/* eslint-disable-next-line react/no-unescaped-entities */}
                                                Voir l'offre
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            <Button
                                variant="outline"
                                onClick={() => handleFilterChange('page', (filters.page - 1).toString())}
                                disabled={!pagination.hasPreviousPage}
                            >
                                Précédent
                            </Button>
                            <span className="flex items-center px-4">
                                Page {pagination.currentPage} sur {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => handleFilterChange('page', (filters.page + 1).toString())}
                                disabled={!pagination.hasNextPage}
                            >
                                Suivant
                            </Button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
