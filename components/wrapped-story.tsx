"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Zap, Users, MapPin, Share2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Memory {
    id: string;
    text: string;
    category: string;
    location: string;
    created_at: string;
    user_id: string;
    image_url?: string;
    media_urls?: string[];
    media_types?: ('image' | 'video')[];
}

interface WrappedStoryProps {
    onClose: () => void;
    memories: Memory[];
    globalMemories?: Memory[];
    userName?: string;
}

export const WrappedStory: React.FC<WrappedStoryProps> = ({ onClose, memories, globalMemories = [], userName }) => {
    const [slideIndex, setSlideIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    // Calculate stats
    const stats = useMemo(() => {
        const userMemories = memories || [];
        const totalUserMemories = userMemories.length;

        // Mock data for things we don't track yet
        const residentsMet = 67;
        const eventsJoined = 14;
        const topFriends = ["Alice", "Bob", "Charlie"];

        const categories: Record<string, number> = {};
        userMemories.forEach(m => categories[m.category] = (categories[m.category] || 0) + 1);
        const topCategory = Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b, 'Fun');

        const vibe = topCategory === 'Burn' ? 'Fitness Maximizer' : topCategory === 'Earn' ? 'Deal Closer' : 'Deep Thinker';

        // Global stats
        const totalCommunityMemories = globalMemories.length || 120;
        const activeResidents = 42;

        return {
            totalUserMemories,
            residentsMet,
            eventsJoined,
            topFriends,
            topCategory,
            vibe,
            totalCommunityMemories,
            activeResidents
        };
    }, [memories, globalMemories]);

    const shareText = `My Network School Wrapped: I'm a ${stats.vibe}! Captured ${stats.totalUserMemories} moments. #NetworkSchool #ForestCity`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleShareTwitter = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    const handleShareWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    };

    const handleShareNative = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Network School Wrapped',
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err: any) {
                // Ignore if user cancels the share dialog
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            navigator.clipboard.writeText(shareText);
            alert("Summary copied to clipboard!");
        }
    };

    const slides = [
        // 1. WELCOME CARD
        {
            color: "bg-green-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in duration-700 p-6">
                    <div className="text-sm font-mono text-green-300 uppercase tracking-widest">Your NS Journey</div>
                    <div className="text-5xl font-bold text-white leading-tight">
                        Hello,<br />
                        <span className="text-green-400">{userName || "Networker"}</span>
                    </div>
                    <div className="text-xl text-green-200/80 mt-4">November 2025</div>
                </div>
            )
        },
        // 1.5. EXCITEMENT SLIDE
        {
            color: "bg-neutral-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in zoom-in duration-700">
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 leading-tight tracking-tight">
                        🔥 Ready to relive your time at Network School?
                    </h1>
                </div>
            )
        },
        // 2. PEOPLE YOU MET (Mocked)
        {
            color: "bg-indigo-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <Users size={64} className="text-indigo-300 mb-8" />
                    <h2 className="text-3xl font-bold text-white mb-2">People You Met</h2>
                    <div className="text-6xl font-black text-indigo-400 my-6">{stats.residentsMet}</div>
                    <p className="text-indigo-200 text-lg">Residents were here during your stay.</p>

                    <div className="mt-8 space-y-2">
                        <p className="text-sm text-indigo-300 uppercase tracking-wide">Top Interactions</p>
                        <div className="flex space-x-2 justify-center">
                            {stats.topFriends.map((friend, i) => (
                                <span key={i} className="bg-indigo-800/50 px-3 py-1 rounded-full text-indigo-100 text-sm border border-indigo-700">
                                    {friend}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        // 3. EVENTS YOU JOINED (Mocked)
        {
            color: "bg-purple-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <Zap size={64} className="text-purple-300 mb-8" />
                    <h2 className="text-3xl font-bold text-white mb-2">Events Joined</h2>
                    <div className="text-6xl font-black text-purple-400 my-6">{stats.eventsJoined}</div>
                    <p className="text-purple-200 text-lg">From sunrise runs to late night hacks.</p>

                    <div className="mt-8 bg-purple-800/50 p-4 rounded-xl border border-purple-700 max-w-xs">
                        <div className="text-xs text-purple-300 uppercase mb-1">Highlight</div>
                        <div className="font-bold text-white">Network State Conference 2025</div>
                    </div>
                </div>
            )
        },
        // 4. MEMORIES GALLERY
        {
            color: "bg-black",
            content: (
                <div className="flex flex-col h-full p-6 pt-20">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Gallery</h2>
                    <div className="grid grid-cols-2 gap-2 auto-rows-[100px]">
                        {(() => {
                            // Collect all images from all memories
                            const allImages: string[] = [];
                            memories.forEach(m => {
                                if (m.media_urls && m.media_urls.length > 0) {
                                    m.media_urls.forEach((url, idx) => {
                                        // Only include images, not videos (simple check based on type if available, or just include all for now)
                                        const type = m.media_types?.[idx] || 'image';
                                        if (type === 'image') {
                                            allImages.push(url);
                                        }
                                    });
                                } else if (m.image_url) {
                                    allImages.push(m.image_url);
                                }
                            });

                            return (
                                <>
                                    {allImages.slice(0, 6).map((url, i) => (
                                        <div key={i} className={`rounded-lg overflow-hidden relative ${i === 0 ? 'row-span-2 h-full' : ''}`}>
                                            <img src={url} className="w-full h-full object-cover" alt="Memory" />
                                        </div>
                                    ))}
                                    {allImages.length === 0 && (
                                        <div className="col-span-2 flex items-center justify-center h-40 text-gray-500 italic">
                                            No photos captured yet.
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                    <p className="text-center text-gray-400 mt-auto mb-8">
                        {stats.totalUserMemories} moments captured
                    </p>
                </div>
            )
        },
        // 4.5. EVENT HIGHLIGHTS (Text-only memories)
        {
            color: "bg-gradient-to-br from-violet-900 to-purple-900",
            content: (
                <div className="flex flex-col h-full p-6 pt-20">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Event Highlights</h2>
                    <div className="flex-1 overflow-y-auto space-y-3 pb-8">
                        {memories.filter(m => !m.image_url && (!m.media_urls || m.media_urls.length === 0)).slice(0, 5).map((m) => (
                            <div key={m.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <p className="text-white text-sm leading-relaxed italic">"{m.text}"</p>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                                    <span className={`text-xs px-2 py-0.5 rounded ${m.category === 'Learn' ? 'bg-blue-500/30 text-blue-200' :
                                        m.category === 'Burn' ? 'bg-orange-500/30 text-orange-200' :
                                            m.category === 'Earn' ? 'bg-green-500/30 text-green-200' : 'bg-pink-500/30 text-pink-200'
                                        }`}>
                                        {m.category}
                                    </span>
                                    <span className="text-xs text-gray-400">{m.location}</span>
                                </div>
                            </div>
                        ))}
                        {memories.filter(m => !m.image_url && (!m.media_urls || m.media_urls.length === 0)).length === 0 && (
                            <div className="flex items-center justify-center h-40 text-gray-400 italic">
                                No text-only highlights yet.
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        // 5. CONTRIBUTION
        {
            color: "bg-orange-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <h2 className="text-3xl font-bold text-orange-300 mb-8">Your Contribution</h2>
                    <div className="relative">
                        <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 rounded-full"></div>
                        <Zap size={80} className="text-yellow-400 relative z-10 mb-6" />
                    </div>
                    <div className="text-5xl font-black text-white tracking-tighter uppercase">{stats.topCategory}</div>
                    <p className="mt-4 text-orange-200">You didn't just exist. You lived to {stats.topCategory}.</p>
                </div>
            )
        },
        // 6. COMMUNITY MOMENTS
        {
            color: "bg-blue-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <h2 className="text-3xl font-bold text-blue-300 mb-8">Community Pulse</h2>

                    <div className="grid grid-cols-1 gap-6 w-full max-w-xs">
                        <div className="bg-blue-800/50 p-6 rounded-2xl border border-blue-700">
                            <div className="text-4xl font-bold text-white">{stats.totalCommunityMemories}</div>
                            <div className="text-sm text-blue-300 uppercase tracking-wide">Total Moments</div>
                        </div>
                        <div className="bg-blue-800/50 p-6 rounded-2xl border border-blue-700">
                            <div className="text-4xl font-bold text-white">{stats.activeResidents}</div>
                            <div className="text-sm text-blue-300 uppercase tracking-wide">Active Residents</div>
                        </div>
                    </div>
                </div>
            )
        },
        // 7.5. SENTIMENTAL MESSAGE
        {
            color: "bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950",
            content: (
                <div className="relative flex flex-col items-center justify-center h-full text-center p-8 overflow-hidden">
                    {/* Ambient glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 animate-pulse"></div>

                    <div className="relative z-10 max-w-lg space-y-8">
                        {/* Icon with glow */}
                        <div className="relative inline-block">
                            <div className="absolute inset-0 blur-xl bg-yellow-400/30 rounded-full"></div>
                            <div className="relative text-5xl">✨</div>
                        </div>

                        {/* Main message */}
                        <div className="space-y-6">
                            <p className="text-2xl md:text-3xl font-light text-white/90 leading-relaxed">
                                Some people come for a month.
                                <br />
                                Some stay longer.
                            </p>
                            <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
                            <p className="text-2xl md:text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-300 to-teal-300 leading-relaxed">
                                But the connections you made
                                <br />
                                stay forever.
                            </p>
                        </div>

                        {/* Decorative hearts */}
                        <div className="flex justify-center space-x-2 text-xl opacity-60">
                            <span className="animate-pulse">❤️</span>
                            <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>🤝</span>
                            <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>❤️</span>
                        </div>
                    </div>
                </div>
            )
        },
        // 8. FINAL SUMMARY
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
                        <p className="text-emerald-200/60 text-sm mb-6">Thank you for being part of the community 💛</p>

                        <div className="space-y-3 text-left">
                            <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg">
                                <Zap size={18} className="text-yellow-400" />
                                <span className="text-gray-200 text-sm">Top Vibe: {stats.topCategory}</span>
                            </div>
                            <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg">
                                <MapPin size={18} className="text-red-400" />
                                <span className="text-gray-200 text-sm">Moments: {stats.totalUserMemories}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex space-x-4">
                        {/* Instagram - uses native share which allows selecting IG Stories on mobile */}
                        <button onClick={handleShareNative} className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full hover:from-purple-500/30 hover:to-pink-500/30 transition-all pointer-events-auto relative z-20 border border-white/10">
                            <span className="sr-only">Share to Instagram</span>
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                            </svg>
                        </button>

                        {/* X (formerly Twitter) */}
                        <button onClick={handleShareTwitter} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors pointer-events-auto relative z-20 border border-white/10">
                            <span className="sr-only">Share on X</span>
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </button>

                        {/* WhatsApp */}
                        <button onClick={handleShareWhatsApp} className="p-3 bg-green-500/20 rounded-full hover:bg-green-500/30 transition-colors pointer-events-auto relative z-20 border border-white/10">
                            <span className="sr-only">Share on WhatsApp</span>
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        </button>
                    </div>
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

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (slideIndex < slides.length - 1) {
            setSlideIndex(s => s + 1);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (slideIndex > 0) {
            setSlideIndex(s => s - 1);
            setProgress(0);
        }
    };



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
                <button onClick={onClose} className="absolute top-4 right-4 z-30 text-white/80 hover:text-white cursor-pointer">
                    <X size={24} />
                </button>

                {/* Navigation Overlays & Buttons */}
                <div className="absolute inset-0 z-10 flex items-center justify-between pointer-events-none">
                    {/* Left Side */}
                    <div className="w-[30%] h-full pointer-events-auto flex items-center justify-start pl-2" onClick={handlePrev}>
                        <button className="p-2 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-all backdrop-blur-sm">
                            <ChevronLeft size={24} />
                        </button>
                    </div>

                    {/* Right Side */}
                    <div className="w-[70%] h-full pointer-events-auto flex items-center justify-end pr-2" onClick={handleNext}>
                        <button className="p-2 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-all backdrop-blur-sm">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Slide Content */}
                <div className={`flex-1 transition-colors duration-500 ${slides[slideIndex]?.color || 'bg-black'}`}>
                    {slides[slideIndex]?.content}
                </div>

            </div>
        </div>
    );
};
