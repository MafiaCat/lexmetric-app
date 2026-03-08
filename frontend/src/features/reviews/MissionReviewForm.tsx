import React, { useState, useEffect, useRef } from 'react';
import { Star, MessageSquare, Info, CheckCircle2, Search, Edit3 } from 'lucide-react';
import { submitLawyerReview, getLawyers, getLawyerReviews } from '../../services/api';
import { Lawyer } from '../../types';

interface ReviewFormProps {
    onClose?: () => void;
}

export const MissionReviewForm: React.FC<ReviewFormProps> = ({
    onClose
}) => {
    const [scores, setScores] = useState({
        reactivity: 0,
        technical: 0,
        negotiation: 0,
        fees: 0
    });

    const [comment, setComment] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Lawyer Search & Selection State
    const [lawyers, setLawyers] = useState<Lawyer[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
    const [loadingLawyers, setLoadingLawyers] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Existing Review State
    const [hasExistingReview, setHasExistingReview] = useState(false);
    const [loadingReview, setLoadingReview] = useState(false);

    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const fetchLawyers = async () => {
            setLoadingLawyers(true);
            try {
                const data = await getLawyers(1, 15, debouncedSearchQuery);
                setLawyers(data.items);
            } catch (error) {
                console.error("Failed to fetch lawyers for review form:", error);
            } finally {
                setLoadingLawyers(false);
            }
        };
        fetchLawyers();
    }, [debouncedSearchQuery]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch existing review when lawyer is selected
    useEffect(() => {
        const fetchReview = async () => {
            if (!selectedLawyer) {
                setHasExistingReview(false);
                setScores({ reactivity: 0, technical: 0, negotiation: 0, fees: 0 });
                setComment("");
                return;
            }

            setLoadingReview(true);
            try {
                const reviews = await getLawyerReviews(selectedLawyer.id);
                if (reviews && reviews.length > 0) {
                    const latestReview = reviews[0];
                    setScores({
                        reactivity: latestReview.reactivity_score,
                        technical: latestReview.technical_expertise_score,
                        negotiation: latestReview.negotiation_score,
                        fees: latestReview.fee_respect_score
                    });
                    setComment(latestReview.comment || "");
                    setHasExistingReview(true);
                } else {
                    setHasExistingReview(false);
                    setScores({ reactivity: 0, technical: 0, negotiation: 0, fees: 0 });
                    setComment("");
                }
            } catch (error) {
                console.error("Error checking for existing review", error);
            } finally {
                setLoadingReview(false);
            }
        };

        fetchReview();
    }, [selectedLawyer]);

    const handleScoreChange = (category: keyof typeof scores, value: number) => {
        setScores(prev => ({ ...prev, [category]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLawyer) return;

        setSubmitting(true);
        try {
            await submitLawyerReview(selectedLawyer.id, {
                reactivity_score: scores.reactivity,
                technical_expertise_score: scores.technical,
                negotiation_score: scores.negotiation,
                fee_respect_score: scores.fees,
                comment: comment
            });
            setSubmitted(true);
            if (onClose) {
                setTimeout(onClose, 2000);
            }
        } catch (err) {
            console.error("Failed to submit review", err);
            alert("Erreur lors de l'envoi de l'évaluation.");
        }
        setSubmitting(false);
    };

    const renderStars = (category: keyof typeof scores, label: string, description: string) => {
        return (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 mb-4 transition-colors hover:border-slate-300 dark:hover:border-slate-600/80">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <span className="text-slate-900 dark:text-white font-medium block">{label}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{description}</span>
                    </div>
                    <div className="flex gap-1 bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700 transition-colors">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => handleScoreChange(category, value)}
                                className={`p-1 transition-all ${scores[category] >= value ? 'text-yellow-400 scale-110' : 'text-slate-600 hover:text-slate-400'}`}
                            >
                                <Star className="w-6 h-6" fill={scores[category] >= value ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    if (submitted) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-8 max-w-2xl mx-auto text-center animate-in fade-in zoom-in duration-300 transition-colors">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50">
                    <CheckCircle2 className="w-10 h-10 text-green-500 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Évaluation Enregistrée !</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    Vos retours nourrissent l'algorithme LexMetric. Le score de l'avocat évalué vient d'être mis à jour en temps réel.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 lg:p-8 max-w-2xl mx-auto transition-colors duration-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-200 dark:border-slate-700/60 transition-colors">
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                        <MessageSquare className="text-indigo-500 dark:text-indigo-400 w-6 h-6" />
                        Évaluer un Avocat
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Votre avis affine l'IA de sélection pour vos confrères.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Lawyer Search & Selection */}
                <div className="mb-8 relative" ref={dropdownRef}>
                    <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 block mb-2 px-1">
                        Rechercher un avocat à évaluer
                    </label>
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder={selectedLawyer ? `Me ${selectedLawyer.first_name} ${selectedLawyer.last_name}` : "Tapez un nom ou barreau..."}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsDropdownOpen(true);
                                if (selectedLawyer) setSelectedLawyer(null);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            disabled={loadingLawyers}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm disabled:opacity-60"
                        />
                        {selectedLawyer && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedLawyer(null);
                                    setSearchQuery("");
                                    setIsDropdownOpen(true);
                                }}
                                className="absolute right-4 top-3.5 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                Changer
                            </button>
                        )}
                    </div>

                    {/* Autocomplete Dropdown */}
                    {isDropdownOpen && !selectedLawyer && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                            {loadingLawyers ? (
                                <div className="p-4 text-center text-sm text-slate-500">Chargement...</div>
                            ) : (
                                lawyers
                                    .map(lawyer => (
                                        <button
                                            key={lawyer.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedLawyer(lawyer);
                                                setSearchQuery("");
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700/50 last:border-0 flex items-center justify-between group transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                                    {lawyer.first_name[0]}{lawyer.last_name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        Me {lawyer.first_name} {lawyer.last_name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        Barreau de {lawyer.bar_association}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                            )}
                            {!loadingLawyers && lawyers.length === 0 && (
                                <div className="p-4 text-center text-sm text-slate-500">Aucun avocat trouvé pour "{searchQuery}"</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Existing Review Badge */}
                {selectedLawyer && hasExistingReview && !loadingReview && (
                    <div className="mb-6 flex items-start gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl animate-in fade-in duration-300">
                        <Edit3 className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Évaluation existante</h4>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                                Vous avez déjà évalué ce profil. Les champs ci-dessous ont été préremplis. En validant, vous modifierez votre évaluation précédente.
                            </p>
                        </div>
                    </div>
                )}

                {selectedLawyer && loadingReview && (
                    <div className="mb-6 flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                )}

                <div className={`space-y-2 mb-8 transition-opacity duration-300 ${!selectedLawyer || loadingReview ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex items-center gap-2 text-sm text-indigo-300 font-medium px-2 mb-4 bg-indigo-500/10 py-2 rounded border border-indigo-500/20">
                        <Info className="w-4 h-4" />
                        Notez objectivement la prestation de 1 à 5 étoiles (5 étant exceptionnel).
                    </div>

                    {renderStars('reactivity', 'Réactivité & Communication', 'Rappels rapides, respect des délais de procédure.')}
                    {renderStars('technical', 'Expertise Technique', 'Maîtrise du sujet, solidité des conclusions.')}
                    {renderStars('negotiation', 'Qualité de Négociation', 'Capacité à transiger quand le dossier s\'y prête.')}
                    {renderStars('fees', 'Respect de l\'Enveloppe Budgétaire', 'Conformité avec la convention d\'honoraires initiale.')}
                </div>

                <div className={`mb-8 transition-opacity duration-300 ${!selectedLawyer || loadingReview ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    <label className="block text-slate-800 dark:text-white font-medium mb-2 pl-1">Commentaire Libre (Optionnel)</label>
                    <textarea
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Ex: Excellent travail sur l'aspect médical du dossier, le cabinet a su faire preuve d'empathie..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none placeholder-slate-400 dark:placeholder-slate-600"
                    ></textarea>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-medium transition-colors"
                    >
                        Plus tard
                    </button>

                    <button
                        type="submit"
                        disabled={!selectedLawyer || loadingReview || Object.values(scores).some(s => s === 0) || submitting}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl flex items-center space-x-2 transition-all transform hover:scale-[1.02] shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed group"
                    >
                        <span>{submitting ? "Envoi..." : hasExistingReview ? "Modifier l'Évaluation" : "Confirmer l'Évaluation"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};
