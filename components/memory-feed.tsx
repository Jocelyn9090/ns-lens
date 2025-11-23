"use client";

import React, { useState } from 'react';
import { BookOpen, Zap, DollarSign, Smile, MapPin, Trash2, Pencil, Check, X } from 'lucide-react';

interface Memory {
    id: string;
    text: string;
    category: string;
    location: string;
    media_urls?: string[];
    media_types?: ('image' | 'video')[];
    created_at: string;
    user_id: string;
    image_url?: string; // Legacy support
    profiles?: {
        display_name: string;
        email: string;
    };
}

interface MemoryFeedProps {
    memories: Memory[];
    currentUserId?: string;
    onDelete?: (memoryId: string) => void;
    onUpdate?: (memoryId: string, updates: { date?: string; location?: string }) => void;
}

export const MemoryFeed: React.FC<MemoryFeedProps> = ({ memories, currentUserId, onDelete, onUpdate }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDate, setEditDate] = useState('');
    const [editLocation, setEditLocation] = useState('');

    const categoryIcons: Record<string, React.ReactNode> = {
        Learn: <BookOpen size={18} className="text-blue-500" />,
        Burn: <Zap size={18} className="text-orange-500" />,
        Earn: <DollarSign size={18} className="text-green-500" />,
        Fun: <Smile size={18} className="text-pink-500" />
    };

    const categoryColors: Record<string, string> = {
        Learn: 'border-blue-500/30 bg-blue-500/10',
        Burn: 'border-orange-500/30 bg-orange-500/10',
        Earn: 'border-green-500/30 bg-green-500/10',
        Fun: 'border-pink-500/30 bg-pink-500/10'
    };

    const handleDelete = (memoryId: string, memoryText: string) => {
        if (window.confirm(`Are you sure you want to delete this memory?\n\n"${memoryText.substring(0, 50)}${memoryText.length > 50 ? '...' : ''}"`)) {
            onDelete?.(memoryId);
        }
    };

    const startEditing = (memory: Memory) => {
        setEditingId(memory.id);
        setEditDate(new Date(memory.created_at).toISOString().split('T')[0]);
        setEditLocation(memory.location);
    };

    const saveEdit = (memoryId: string) => {
        onUpdate?.(memoryId, { date: editDate, location: editLocation });
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    return (
        <div className="space-y-4">
            {memories.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-sm">No memories yet. Start logging your moments!</p>
                </div>
            ) : (
                memories.map((memory) => (
                    <div
                        key={memory.id}
                        className={`rounded-2xl border ${categoryColors[memory.category] || 'border-gray-500/30 bg-gray-500/10'} p-5 backdrop-blur-sm transition-all hover:scale-[1.01] relative`}
                    >
                        {/* Action buttons - only show for user's own memories */}
                        {currentUserId && memory.user_id === currentUserId && (
                            <div className="absolute top-3 right-3 flex space-x-2">
                                {editingId === memory.id ? (
                                    <>
                                        <button
                                            onClick={() => saveEdit(memory.id)}
                                            className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300 transition-colors"
                                            title="Save changes"
                                        >
                                            <Check size={14} />
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300 transition-colors"
                                            title="Cancel edit"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => startEditing(memory)}
                                            className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300 transition-colors"
                                            title="Edit memory"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(memory.id, memory.text)}
                                            className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300 transition-colors"
                                            title="Delete memory"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="flex items-start space-x-3">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    {categoryIcons[memory.category]}
                                    <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">{memory.category}</span>
                                </div>

                                {/* Media Gallery */}
                                {(memory.media_urls && memory.media_urls.length > 0) ? (
                                    <div className={`grid gap-2 mb-3 ${memory.media_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                        {memory.media_urls.map((url, index) => {
                                            const type = memory.media_types?.[index] || 'image';
                                            return (
                                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                    {type === 'video' ? (
                                                        <video
                                                            src={url}
                                                            controls
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={url}
                                                            alt={`Memory attachment ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : memory.image_url && (
                                    // Legacy support for single image
                                    <img src={memory.image_url} alt="Memory" className="w-full h-48 object-cover rounded-lg mb-3 border border-gray-200" />
                                )}

                                {editingId === memory.id ? (
                                    <div className="space-y-3 mb-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Date</label>
                                            <input
                                                type="date"
                                                value={editDate}
                                                onChange={(e) => setEditDate(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Location</label>
                                            <input
                                                type="text"
                                                value={editLocation}
                                                onChange={(e) => setEditLocation(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-800 leading-relaxed mb-3 text-sm font-medium">{memory.text}</p>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <MapPin size={12} />
                                            <span>{memory.location}</span>
                                        </div>
                                        <div>{new Date(memory.created_at).toLocaleDateString()}</div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-1 text-gray-400">
                                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-[8px] font-bold text-gray-600 overflow-hidden">
                                                {memory.profiles?.display_name?.[0] || 'U'}
                                            </div>
                                            <span className="text-xs">{memory.profiles?.display_name?.split(' ')[0] || 'User'}</span>
                                        </div>

                                        {/* Edit/Delete Controls */}
                                        {currentUserId && memory.user_id === currentUserId && (
                                            <div className="flex items-center space-x-1 ml-2 pl-2 border-l border-gray-200">
                                                {editingId === memory.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => saveEdit(memory.id)}
                                                            className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                                            title="Save changes"
                                                        >
                                                            <Check size={12} />
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="p-1.5 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => startEditing(memory)}
                                                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors"
                                                        title="Edit memory"
                                                    >
                                                        <Pencil size={12} />
                                                    </button>
                                                )}

                                                {!editingId && onDelete && (
                                                    <button
                                                        onClick={() => handleDelete(memory.id, memory.text)}
                                                        className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Delete memory"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
