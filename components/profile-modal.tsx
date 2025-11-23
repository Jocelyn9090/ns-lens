"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Loader2, LogOut, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Profile {
    display_name: string;
    email: string;
    avatar_url: string;
}

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: Profile | null;
    userId: string;
    onUpdate: () => void; // Callback to refresh profile in parent
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile, userId, onUpdate }) => {
    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.display_name || '');
            setAvatarUrl(profile.avatar_url || null);
        }
    }, [profile, isOpen]);

    if (!isOpen) return null;

    const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = e.target.files?.[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `avatars/${userId}/${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('memories') // Reusing memories bucket
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('memories')
                .getPublicUrl(fileName);

            setAvatarUrl(publicUrl);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Error uploading avatar');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name: displayName,
                    avatar_url: avatarUrl,
                })
                .eq('id', userId);

            if (error) throw error;

            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-md p-8 relative shadow-2xl shadow-green-900/20">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-8 text-center">Edit Profile</h2>

                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-white/10 overflow-hidden flex items-center justify-center">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-gray-500" />
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {uploading ? <Loader2 className="animate-spin text-white" /> : <Camera className="text-white" />}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarSelect}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Tap to change photo</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                            placeholder="Your Name"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving || uploading}
                        className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin mx-auto" /> : 'Save Changes'}
                    </button>

                    <div className="border-t border-white/5 pt-6">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center space-x-2 text-red-400 hover:text-red-300 transition-colors py-2"
                        >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
