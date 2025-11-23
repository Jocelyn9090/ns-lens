"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, BookOpen, Zap, DollarSign, Smile, Camera, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { WrappedStory } from '@/components/wrapped-story';
import { AuthModal } from '@/components/auth-modal';
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
  const [location, setLocation] = useState('Cafe');
  const [showWrapped, setShowWrapped] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth Init
  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) setProfile(data);
    };

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim()) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      let imageUrl = null;

      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('memories')
          .upload(fileName, selectedImage);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert('Failed to upload image');
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('memories')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { data, error } = await supabase.from('memories').insert({
        text: newMemory,
        category,
        location,
        user_id: user.id,
        image_url: imageUrl
      }).select('*, profiles(display_name, email)').single();

      if (error) {
        console.error("Error adding memory:", error);
        alert("Failed to add memory. Please try again.");
      } else if (data) {
        setMemories(prev => [data as Memory, ...prev]);
      }

      setNewMemory('');
      handleRemoveImage();
    } catch (err) {
      console.error("Error adding memory:", err);
    }
  };

  const categories = [
    { id: 'Learn', icon: <BookOpen size={16} />, color: 'bg-blue-500' },
    { id: 'Burn', icon: <Zap size={16} />, color: 'bg-orange-500' },
    { id: 'Earn', icon: <DollarSign size={16} />, color: 'bg-green-500' },
    { id: 'Fun', icon: <Smile size={16} />, color: 'bg-pink-500' }
  ];

  const locations = ["The Cafe", "Co-working", "Gym", "Poolside", "Beach", "Dorms"];

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-mono animate-pulse">Connecting to Network...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 font-sans selection:bg-green-500/30">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {showWrapped && <WrappedStory onClose={() => setShowWrapped(false)} memories={memories} userName={user?.id?.slice(0, 6)} />}

      <div className="max-w-xl mx-auto min-h-screen flex flex-col border-x border-white/5 shadow-2xl shadow-black">

        {/* Header */}
        <header className="sticky top-0 z-10 bg-neutral-950/80 backdrop-blur-lg border-b border-white/10 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 tracking-tight">
                Network School <span className="font-light text-white">Lens</span>
              </h1>
              <p className="text-xs text-gray-500 font-mono">Network School • Johor</p>
            </div>

            <div className="flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (profile?.display_name?.[0] || user.email?.[0] || 'U').toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-300 hidden sm:block">
                    {profile?.display_name || user.email}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-xs font-bold text-green-400 hover:text-green-300 transition-colors mr-2"
                >
                  Sign In
                </button>
              )}

              <button
                onClick={() => setShowWrapped(true)}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2 shadow-lg shadow-green-900/20 transition-all transform hover:scale-105 cursor-pointer"
              >
                <Play size={14} fill="currentColor" />
                <span className="hidden sm:inline">My Lens</span>
                <span className="sm:hidden">Lens</span>
              </button>
            </div>
          </div>
        </header>

        {/* Input Section */}
        <div className="p-4 border-b border-white/5 bg-neutral-900/30">
          <form onSubmit={handleAddMemory} className="space-y-4">
            <textarea
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder="Log a moment (e.g., 'Hit a PR at the Burn session' or 'Met a co-founder')..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all resize-none h-24 placeholder-gray-600"
            />

            {imagePreview && (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-white/10" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-black border border-white/10 rounded-full p-1 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  title="Add Image"
                >
                  <Camera size={18} />
                </button>

                <div className="w-px h-6 bg-white/10 mx-2"></div>

                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${category === cat.id
                      ? `${cat.color} text-white shadow-lg`
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                  >
                    {cat.icon}
                    <span>{cat.id}</span>
                  </button>
                ))}
              </div>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-white/5 border border-white/10 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer"
              >
                {locations.map(loc => <option key={loc} value={loc} className="bg-neutral-900">{loc}</option>)}
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newMemory.trim()}
                className="bg-white text-black px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Log Memory
              </button>
            </div>
          </form>
        </div>

        {/* Feed Section */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          <h2 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-4">Community Timeline</h2>
          <MemoryFeed memories={memories} />
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
