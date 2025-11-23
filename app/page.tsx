"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, BookOpen, Zap, DollarSign, Smile, Camera, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { WrappedStory } from '@/components/wrapped-story';
import { AuthModal } from '@/components/auth-modal';
import { ProfileModal } from '@/components/profile-modal';
import { MemoryFeed } from '@/components/memory-feed';

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

interface Profile {
  display_name: string;
  email: string;
  avatar_url: string;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newMemory, setNewMemory] = useState('');
  const [category, setCategory] = useState('Learn');
  const [location, setLocation] = useState('NS Cafe');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [showWrapped, setShowWrapped] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth Init
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    };
    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Data Fetching
  useEffect(() => {
    const fetchMemories = async () => {
      const { data, error } = await supabase
        .from('memories')
        .select('*, profiles(display_name, email)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setMemories(data as Memory[]);
      }
    };

    fetchMemories();

    // Realtime subscription
    const channel = supabase
      .channel('public:memories')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'memories' }, async (payload) => {
        // Fetch the profile for the new memory
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', payload.new.user_id)
          .single();

        const newMemory = {
          ...payload.new,
          profiles: profileData
        } as Memory;

        setMemories((prev) => {
          if (prev.find(m => m.id === newMemory.id)) return prev;
          return [newMemory, ...prev];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const processedFiles: File[] = [];

      for (const file of files) {
        // Check for HEIC by type or extension (case-insensitive)
        const isHeic = file.type === 'image/heic' ||
          file.type === 'image/heif' ||
          /\.heic$/i.test(file.name);

        if (isHeic) {
          try {
            console.log(`Processing HEIC file: ${file.name}`);

            // Dynamic import
            // @ts-ignore
            const heic2anyModule = await import('heic2any');
            const heic2any = heic2anyModule.default || heic2anyModule;

            console.log(`heic2any loaded, type: ${typeof heic2any}`);

            // Explicitly create a Blob to ensure compatibility
            const blob = new Blob([file], { type: file.type });

            const convertedBlob = await heic2any({
              blob: blob,
              toType: 'image/jpeg',
              quality: 0.8
            });

            console.log('HEIC conversion successful');

            const convertedFile = new File(
              [Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob],
              file.name.replace(/\.(heic|HEIC)$/i, '.jpg'),
              { type: 'image/jpeg' }
            );
            processedFiles.push(convertedFile);
          } catch (err: any) {
            console.error("HEIC Conversion Failed");
            console.error("Error type:", typeof err);
            try {
              console.error("Error string:", err.toString());
              console.error("Error keys:", Object.keys(err));
              console.error("Error JSON:", JSON.stringify(err));
            } catch (e) {
              console.error("Could not inspect error object");
            }

            if (err instanceof Error) {
              console.error("Error message:", err.message);
              console.error("Error stack:", err.stack);
            }

            // Fallback: still upload the original HEIC file
            processedFiles.push(file);
          }
        } else {
          processedFiles.push(file);
        }
      }

      setMediaFiles(prev => [...prev, ...processedFiles]);
    }
  };

  const handleRemoveMedia = (indexToRemove: number) => {
    setMediaFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the input value to allow re-selecting the same file
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim() && mediaFiles.length === 0) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setUploading(true);
      const uploadedMedia: { url: string, type: 'image' | 'video' }[] = [];

      // Upload all files
      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('memories')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('memories')
          .getPublicUrl(filePath);

        uploadedMedia.push({
          url: publicUrl,
          type: file.type.startsWith('video/') ? 'video' : 'image'
        });
      }

      const { data, error } = await supabase.from('memories').insert({
        text: newMemory,
        category,
        location: location === 'Other...' ? customLocation : location,
        user_id: user.id,
        media_urls: uploadedMedia.map(m => m.url),
        media_types: uploadedMedia.map(m => m.type),
        created_at: new Date(eventDate).toISOString()
      }).select('*, profiles(display_name, email)').single();

      if (error) {
        console.error("Error adding memory:", error);
        alert("Failed to post memory. Please try again.");
      } else {
        setMemories([data as Memory, ...memories]);
        setNewMemory('');
        setMediaFiles([]);
        setCustomLocation('');
        if (location === 'Other...') setLocation('NS Cafe');
      }
    } catch (error: any) {
      console.error("Error uploading media:", error.message);
      alert("Failed to upload media. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', memoryId);

      if (error) {
        console.error("Error deleting memory:", error);
        alert("Failed to delete memory. Please try again.");
      } else {
        // Remove from local state
        setMemories(prev => prev.filter(m => m.id !== memoryId));
      }
    } catch (err) {
      console.error("Error deleting memory:", err);
    }
  };

  const handleUpdateMemory = async (memoryId: string, updates: { date?: string; location?: string }) => {
    try {
      const updateData: any = {};
      if (updates.date) updateData.created_at = new Date(updates.date).toISOString();
      if (updates.location) updateData.location = updates.location;

      const { error } = await supabase
        .from('memories')
        .update(updateData)
        .eq('id', memoryId);

      if (error) {
        console.error("Error updating memory:", error);
        alert("Failed to update memory.");
      } else {
        setMemories(prev => prev.map(m =>
          m.id === memoryId ? { ...m, ...updateData } : m
        ));
      }
    } catch (err) {
      console.error("Error updating memory:", err);
    }
  };

  const categories = [
    { id: 'Learn', icon: <BookOpen size={16} />, color: 'bg-blue-500' },
    { id: 'Burn', icon: <Zap size={16} />, color: 'bg-orange-500' },
    { id: 'Earn', icon: <DollarSign size={16} />, color: 'bg-green-500' },
    { id: 'Fun', icon: <Smile size={16} />, color: 'bg-pink-500' }
  ];

  const locations = ["NS Cafe", "NS Library", "Co-working", "Gym", "Poolside", "Beach", "Dorms", "Other..."];

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-green-600 font-mono animate-pulse">Connecting to Network...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans selection:bg-green-500/30">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        userId={user?.id}
        onUpdate={() => user && fetchProfile(user.id)}
      />
      {showWrapped && (
        <WrappedStory
          onClose={() => setShowWrapped(false)}
          memories={memories.filter(m => m.user_id === user?.id)}
          globalMemories={memories}
          userName={profile?.display_name || user?.email?.split('@')[0]}
        />
      )}

      <div className="max-w-xl mx-auto min-h-screen flex flex-col border-x border-gray-200 shadow-xl shadow-gray-200/50 bg-white">

        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-bold text-xl tracking-tight">
                <span className="text-gray-900">NS</span> <span className="font-light text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-700">Rewind</span>
              </h1>
              <p className="text-xs text-gray-500 font-mono">Network School • Malaysia</p>
            </div>

            <div className="flex items-center space-x-3">
              {user ? (
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (profile?.display_name?.[0] || user.email?.[0] || 'U').toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700 hidden sm:block">
                    {profile?.display_name || user.email}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors mr-2"
                >
                  Sign In
                </button>
              )}

              <button
                onClick={() => setShowWrapped(true)}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2 shadow-lg shadow-green-900/10 transition-all transform hover:scale-105 cursor-pointer"
              >
                <Play size={14} fill="currentColor" />
                <span className="hidden sm:inline">My Lens</span>
                <span className="sm:hidden">Lens</span>
              </button>
            </div>
          </div>
        </header>

        {/* Input Section */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <form onSubmit={handleAddMemory} className="space-y-4">
            <textarea
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder="Log a moment (e.g., 'Hit a PR at the Burn session' or 'Met a co-founder')..."
              className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none h-24 placeholder-gray-400 shadow-sm"
            />

            {mediaFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative inline-block">
                    {file.type.startsWith('video/') ? (
                      <div className="h-20 w-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">Video</span>
                      </div>
                    ) : (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 text-gray-500 hover:text-red-500 cursor-pointer shadow-sm"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar items-center">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById('media-upload')?.click()}
                    className={`p-2 rounded-full transition-colors ${mediaFiles.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    <Camera size={20} />
                  </button>
                  <input
                    id="media-upload"
                    type="file"
                    accept="image/*,video/*,.heic,.HEIC"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {mediaFiles.length > 0 && (
                    <span className="text-xs text-green-600">{mediaFiles.length} file(s) selected</span>
                  )}
                </div>

                <div className="w-px h-6 bg-gray-200 mx-2"></div>

                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${category === cat.id
                      ? `${cat.color} text-white shadow-md`
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                  >
                    {cat.icon}
                    <span>{cat.id}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setShowCustomLocation(e.target.value === 'Other...');
                    if (e.target.value !== 'Other...') {
                      setCustomLocation('');
                    }
                  }}
                  className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer shadow-sm"
                >
                  {locations.map(loc => <option key={loc} value={loc} className="bg-white text-gray-900">{loc}</option>)}
                </select>

                {showCustomLocation && (
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="Enter location..."
                    className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-sm"
                  />
                )}
              </div>

              {/* Date Selection */}
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={(!newMemory.trim() && mediaFiles.length === 0) || uploading}
                className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-md"
              >
                Log Memory
              </button>
            </div>
          </form>
        </div>

        {/* Feed Section */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          <h2 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-4">Community Timeline</h2>
          <MemoryFeed
            memories={memories}
            currentUserId={user?.id}
            onDelete={handleDeleteMemory}
            onUpdate={handleUpdateMemory}
          />
        </div>

        {/* Footer Info */}
        <div className="p-6 text-center border-t border-white/5 bg-neutral-950">
          <p className="text-xs text-gray-600">
            Built for the Network School Community • Forest City, Malaysia
          </p>
        </div>
      </div>
    </div>
  );
}
