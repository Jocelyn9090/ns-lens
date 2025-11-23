"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Zap, Users, MapPin, Share2, X } from 'lucide-react';

interface Memory {
    id: string;
    text: string;
    category: string;
    location: string;
    timestamp: any;
    userId: string;
}

interface WrappedStoryProps {
    onClose: () => void;
    memories: Memory[];
    userName?: string;
}

export const WrappedStory: React.FC<WrappedStoryProps> = ({ onClose, memories, userName }) => {
    const [slideIndex, setSlideIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    // Calculate stats from memories (or mock if empty)
    const stats = useMemo(() => {
        if (!memories || memories.length === 0) {
            return {
                topCategory: 'Build',
                totalMemories: 42,
                topLocation: 'Co-working Space',
                vibe: 'Relentless Founder'
            };
        }

        const categories: Record<string, number> = {};
        memories.forEach(m => categories[m.category] = (categories[m.category] || 0) + 1);
        const topCat = Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b, 'Fun');

        return {
            topCategory: topCat,
            totalMemories: memories.length,
            topLocation: memories[0]?.location || 'Forest City Cafe',
            vibe: topCat === 'Burn' ? 'Fitness Maximizer' : topCat === 'Earn' ? 'Deal Closer' : 'Deep Thinker'
        };
    }, [memories]);

    const slides = [
        // INTRO
        {
            color: "bg-green-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in duration-700">
                    <div className="text-6xl font-bold text-green-400">Hello,</div>
                    <div className="text-4xl font-bold text-white">{userName || "Networker"}</div>
                    <div className="text-xl text-green-200/80 mt-4">Ready to relive your time at Forest City?</div>
                </div>
            )
        },
        // VIBE CHECK
        {
            color: "bg-indigo-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <h2 className="text-3xl font-bold text-indigo-300 mb-8">Your Main Character Energy</h2>
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full"></div>
                        <Zap size={80} className="text-yellow-400 relative z-10 mb-6" />
                    </div>
                    <div className="text-5xl font-black text-white tracking-tighter uppercase">{stats.topCategory}</div>
                    <p className="mt-4 text-indigo-200">You didn't just exist. You lived to {stats.topCategory}.</p>
                </div>
            )
        },
        // STATS
        {
            color: "bg-gray-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <h2 className="text-2xl font-bold text-gray-400 mb-12">The Numbers</h2>

                    <div className="grid grid-cols-1 gap-8 w-full max-w-xs">
                        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                            <div className="text-4xl font-bold text-green-400">{stats.totalMemories}</div>
                            <div className="text-sm text-gray-400 uppercase tracking-wide">Moments Captured</div>
                        </div>
                        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                            <div className="text-2xl font-bold text-blue-400">{stats.topLocation}</div>
                            <div className="text-sm text-gray-400 uppercase tracking-wide">Favorite Haunt</div>
                        </div>
                    </div>
                </div>
            )
        },
        // SUMMARY CARD
        {
            color: "bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 w-full">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-sm transform transition-all hover:scale-105">
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-xs font-mono text-emerald-400">NETWORK SCHOOL WRAPPED</div>
                            <div className="text-xs font-mono text-emerald-400">2025</div>
                        </div>

                        <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                            <Users size={40} className="text-white" />
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-2">{stats.vibe}</h1>
                        <p className="text-emerald-200/60 text-sm mb-6">Forest City Cohort</p>

                        <div className="space-y-3 text-left">
                            <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg">
                                <Zap size={18} className="text-yellow-400" />
                                <span className="text-gray-200 text-sm">Most active in: {stats.topCategory}</span>
                            </div>
                            <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg">
                                <MapPin size={18} className="text-red-400" />
                                <span className="text-gray-200 text-sm">Top Spot: {stats.topLocation}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <p className="text-xs text-gray-500 font-mono">The Network State • Johor</p>
                        </div>
                    </div>
                    <button onClick={() => {
                        const text = `My Network School Wrapped: I'm a ${stats.vibe}! Captured ${stats.totalMemories} moments. #NetworkSchool #ForestCity`;
                        navigator.clipboard.writeText(text);
                        alert("Summary copied to clipboard!");
                    }} className="mt-8 flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors cursor-pointer">
                        <Share2 size={18} />
                        <span>Share Artifact</span>
                    </button>
                </div>
            )
        }
    ];

    // Auto-advance logic
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((old) => {
                if (old >= 100) {
                    if (slideIndex < slides.length - 1) {
                        setSlideIndex(s => s + 1);
                        return 0;
                    } else {
                        clearInterval(timer);
                        return 100;
                    }
                }
                return old + 2; // Speed of progress bar
            });
        }, 100); // Update interval

        return () => clearInterval(timer);
    }, [slideIndex, slides.length]);

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Phone Frame */}
            <div className="relative w-full max-w-md h-full md:h-[85vh] md:rounded-3xl overflow-hidden shadow-2xl bg-black flex flex-col">

                {/* Progress Bars */}
                <div className="absolute top-0 left-0 w-full z-20 flex space-x-1 p-2">
                    {slides.map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-white transition-all duration-100 ease-linear ${idx < slideIndex ? 'w-full' : idx === slideIndex ? 'w-full' : 'w-0'}`}
                                style={{
                                    width: idx === slideIndex ? `${progress}%` : idx < slideIndex ? '100%' : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 z-20 text-white/80 hover:text-white cursor-pointer">
                    <X size={24} />
                </button>

                {/* Slide Content */}
                <div className={`flex-1 transition-colors duration-500 ${slides[slideIndex].color}`}>
                    {slides[slideIndex].content}
                </div>

            </div>
        </div>
    );
};
