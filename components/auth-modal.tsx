"use client";

import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showVerification, setShowVerification] = useState(false);

    if (!isOpen) return null;

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (activeTab === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onClose();
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            display_name: displayName
                        }
                    }
                });
                if (error) throw error;
                setShowVerification(true);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setEmail('');
        setPassword('');
        setDisplayName('');
        setError(null);
        setShowVerification(false);
        setActiveTab('login');
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-md p-8 relative shadow-2xl shadow-green-900/20">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {showVerification ? (
                    <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="text-green-500" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Check your inbox</h2>
                        <p className="text-gray-400 mb-8">
                            We've sent a verification link to <span className="text-white font-mono">{email}</span>.
                            Please verify your email to continue.
                        </p>
                        <button
                            onClick={handleClose}
                            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {activeTab === 'login' ? 'Welcome Back' : 'Join the Network'}
                            </h2>
                            <p className="text-gray-400 text-sm">
                                {activeTab === 'login'
                                    ? 'Sign in to share your moments'
                                    : 'Create an account to start posting'}
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="flex p-1 bg-white/5 rounded-xl mb-6">
                            <button
                                onClick={() => { setActiveTab('login'); setError(null); }}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'login'
                                    ? 'bg-neutral-800 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => { setActiveTab('signup'); setError(null); }}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'signup'
                                    ? 'bg-neutral-800 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-4">
                            {activeTab === 'signup' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-gray-500 uppercase">Display Name</label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                                        placeholder="Your Name"
                                        required
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-gray-500 uppercase">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                                        placeholder="citizen@network.school"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-gray-500 uppercase">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
