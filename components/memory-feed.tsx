"use client";

import React from 'react';
import { Camera, Heart, MapPin } from 'lucide-react';

interface Memory {
    id: string;
    text: string;
    category: string;
    location: string;
    created_at: string;
    user_id: string;
    image_url?: string;
    profiles?: {
        display_name: string;
        email: string;
    };
}

interface MemoryFeedProps {
    memories: Memory[];
}

export const MemoryFeed: React.FC<MemoryFeedProps> = ({ memories }) => {
    if (memories.length === 0) {
        return (
            <div className="text-center py-20 opacity-50">
                <Camera size={48} className="mx-auto mb-4 text-gray-600" />
                <p>No memories yet. Be the first to post!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {memories.map((memory) => (
                <div key={memory.id} className="group relative pl-8 pb-8 border-l border-white/10 last:border-0 last:pb-0">
                    {/* Timeline Dot */}
                    <div className={`absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full ring-4 ring-neutral-950 ${memory.category === 'Learn' ? 'bg-blue-500' :
                        memory.category === 'Burn' ? 'bg-orange-500' :
                            memory.category === 'Earn' ? 'bg-green-500' : 'bg-pink-500'
                        }`}></div>

                    <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-5 hover:bg-neutral-800/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-black ${memory.category === 'Learn' ? 'bg-blue-500' :
                                    memory.category === 'Burn' ? 'bg-orange-500' :
                                        memory.category === 'Earn' ? 'bg-green-500' : 'bg-pink-500'
                                    }`}>
                                    {memory.category}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center">
                                    <MapPin size={10} className="mr-1" />
                                    {memory.location}
                                </span>
                            </div>
                            <span className="text-[10px] text-gray-600 font-mono">
                                {memory.created_at ? new Date(memory.created_at).toLocaleDateString() : 'Just now'}
                            </span>
                        </div>

                        <p className="text-gray-200 text-sm leading-relaxed">
                            {memory.text}
                        </p>

                        {memory.image_url && (
                            <div className="mt-3 mb-1">
                                <img
                                    src={memory.image_url}
                                    alt="Memory attachment"
                                    className="rounded-xl border border-white/5 w-full max-h-64 object-cover"
                                />
                            </div>
                        )}

                        <div className="mt-4 flex items-center space-x-4">
                            {/* Mock social interactions */}
                            <button className="flex items-center space-x-1 text-gray-600 hover:text-pink-500 transition-colors group-hover:opacity-100 opacity-60 cursor-pointer">
                                <Heart size={14} />
                                <span className="text-xs">Like</span>
                            </button>
                            <div className="text-xs text-gray-700 font-mono">
                                User: {memory.profiles?.display_name || memory.profiles?.email || (memory.user_id ? memory.user_id.slice(0, 4) + '..' : 'Anon')}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
