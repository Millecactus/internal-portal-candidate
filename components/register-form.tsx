'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithoutAuth, checkUserAuthentication } from '../lib/api-request-utils';

export const RegisterForm: React.FC = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        birthday: '',
        discordId: '',
        email: '',
    });

    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = sessionStorage.getItem('accessToken') || document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1] || null;
            const isAuthenticated = await checkUserAuthentication(accessToken);
            if (isAuthenticated) {
                router.push('/dashboard');
            }
        };

        checkAuth();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email.endsWith('@programisto.fr')) {
            alert('L\'email doit se terminer par @programisto.fr');
            return;
        }
        try {
            const response = await fetchWithoutAuth('/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'enregistrement');
            } else {
                router.push('/login');
            }


        } catch (error) {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de l\'inscription.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold">Bienvenue chez Programisto</h2>
            <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">
                    Prénom
                </label>
                <input
                    type="text"
                    name="firstname"
                    id="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
                    Nom de famille
                </label>
                <input
                    type="text"
                    name="lastname"
                    id="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <div>
                <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
                    Date de naissance
                </label>
                <input
                    type="date"
                    name="birthday"
                    id="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <div>
                <label htmlFor="discordId" className="block text-sm font-medium text-gray-700">
                    ID Discord
                </label>
                <input
                    type="text"
                    name="discordId"
                    id="discordId"
                    value={formData.discordId}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
            >
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                S'inscrire
            </button>
        </form>
    );
};
