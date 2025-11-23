"use client";

import React, { useState, useEffect } from 'react';
import { Play, BookOpen, Zap, DollarSign, Smile } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { WrappedStory } from '@/components/wrapped-story';
import { MemoryFeed } from '@/components/memory-feed';

interface Memory {
  id: string;
  text: string;
  category: string;
  location: string;
  timestamp: any;
  userId: string;
  likes: number;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newMemory, setNewMemory] = useState('');
  const [category, setCategory] = useState('Learn');
  const [location, setLocation] = useState('Cafe');
  const [showWrapped, setShowWrapped] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auth Init
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (data?.user) setUser(data.user);
      }
      setLoading(false);
    };
    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
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
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (data) {
        setMemories(data);
      }
    };

    fetchMemories();

    // Realtime subscription
    const channel = supabase
      .channel('public:memories')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'memories' }, (payload) => {
        setMemories((prev) => [payload.new as Memory, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim() || !user) return;

    try {
      const { error } = await supabase.from('memories').insert({
        text: newMemory,
        category,
        location,
        userId: user.id,
        timestamp: new Date().toISOString(),
        likes: 0
      });

      if (error) {
        console.error("Error adding memory:", error);
        // Fallback for mock mode if insert fails (e.g. no table)
        const mockMemory = {
          id: Math.random().toString(),
          text: newMemory,
          category,
          location,
          userId: user.id,
          timestamp: new Date().toISOString(),
          likes: 0
        };
        setMemories(prev => [mockMemory, ...prev]);
      }

      setNewMemory('');
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
            <button
              onClick={() => setShowWrapped(true)}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2 shadow-lg shadow-green-900/20 transition-all transform hover:scale-105 cursor-pointer"
            >
              <Play size={14} fill="currentColor" />
              <span>My Lens</span>
            </button>
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

            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
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
