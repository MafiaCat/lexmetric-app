import React, { useState } from 'react';
import { UserPlus, Building, MapPin, Briefcase, Calendar, Euro, CheckCircle2, ShieldCheck } from 'lucide-react';
import { createLawyer } from '../../services/api';

export const AddLawyer: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [barAssociation, setBarAssociation] = useState('');
    const [oathDate, setOathDate] = useState('');
    const [specialtiesStr, setSpecialtiesStr] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');
    const [inNetwork, setInNetwork] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Process specialties (comma separated list)
        const specialties = specialtiesStr
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        const newLawyerData = {
            first_name: firstName,
            last_name: lastName,
            bar_association: barAssociation,
            oath_date: oathDate,
            specialties: specialties,
            average_hourly_rate: parseFloat(hourlyRate),
            in_network: inNetwork
        };

        try {
            await createLawyer(newLawyerData);
            setIsSuccess(true);

            // Reset form
            setFirstName('');
            setLastName('');
            setBarAssociation('');
            setOathDate('');
            setSpecialtiesStr('');
            setHourlyRate('');
            setInNetwork(false);

            // Hide success message after 4s
            setTimeout(() => {
                setIsSuccess(false);
            }, 4000);

        } catch (error) {
            console.error("Failed to submit lawyer", error);
            alert("Une erreur est survenue lors de l'ajout de l'avocat.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                    <UserPlus className="w-8 h-8 text-indigo-500" />
                    Référencer un avocat
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Proposez l'ajout d'un nouveau profil dans l'annuaire LexMetric. Ces informations seront validées par nos équipes pour enrichir la plateforme.
                </p>
            </div>

            {isSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">Demande envoyée avec succès</h4>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                            Merci d'avoir contribué à LexMetric ! Le profil a bien été enregistré dans la base de données. Il sera désormais visible dans les recherches.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                    {/* Infos Personnelles */}
                    <div className="col-span-full border-b border-slate-100 dark:border-slate-700 pb-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Informations du professionnel</h3>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Prénom <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="Jean"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Nom <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="Dupont"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Barreau <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <input
                                required
                                value={barAssociation}
                                onChange={(e) => setBarAssociation(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="Paris, Lyon, Marseille..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Date de prestation de serment <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                required
                                type="date"
                                value={oathDate}
                                onChange={(e) => setOathDate(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Expertise et Titres */}
                    <div className="col-span-full border-b border-slate-100 dark:border-slate-700 pb-2 mb-2 mt-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Expertise & Facturation</h3>
                    </div>

                    <div className="space-y-2 col-span-full md:col-span-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Spécialités (séparées par des virgules) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <input
                                required
                                value={specialtiesStr}
                                onChange={(e) => setSpecialtiesStr(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="Préjudice Corporel, Droit Social..."
                            />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ex: Droit des Assurances, Droit Immobilier</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Taux horaire moyen (€) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Euro className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <input
                                required
                                type="number"
                                min="0"
                                step="10"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="250"
                            />
                        </div>
                    </div>

                    {/* Options Complémentaires */}
                    <div className="col-span-full mt-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white">Membre d'un réseau de partenariat assurance</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cochez cette case si le cabinet a signé une charte spécifique (tarif / KPI).</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={inNetwork}
                                onChange={() => setInNetwork(!inNetwork)}
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Envoi en cours...
                            </>
                        ) : (
                            <>Envoyer la demande</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
