import React, { useState, useEffect } from 'react';
import { Target, Flame, ShoppingCart, Search, Plus, Trash2, CheckCircle, RefreshCw, Dice5, Book } from 'lucide-react';
import axios from 'axios';

export default function ReadingStrategy() {
  const [goals, setGoals] = useState({ yearlyBookGoal: 24, dailyPageGoal: 30, currentStreak: 0, milestones: [] });
  const [wishlist, setWishlist] = useState([]);
  const [tbrList, setTbrList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState({ title: '', author: '' });
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [goalsRes, wishlistRes, booksRes] = await Promise.all([
        axios.get('http://localhost:5000/api/goals'),
        axios.get('http://localhost:5000/api/goals/wishlist'),
        axios.get('http://localhost:5000/api/books')
      ]);
      setGoals(goalsRes.data);
      setWishlist(wishlistRes.data);
      const tbr = booksRes.data.filter(b => b.status === 'To-Read');
      setTbrList(tbr);
      const reading = booksRes.data.find(b => b.status === 'Currently Reading');
      setCurrentBook(reading);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateGoals = async (updates) => {
    try {
      const res = await axios.put('http://localhost:5000/api/goals', updates);
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.title) return;
    setSearching(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/books/search?title=${searchQuery.title}&author=${searchQuery.author}`);
      setSearchResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const addToWishlist = async () => {
    if (!searchResult) return;
    try {
      await axios.post('http://localhost:5000/api/goals/wishlist', {
        title: searchResult.title,
        author: searchResult.authors,
        coverImage: searchResult.coverImg,
        genre: searchResult.genre,
        totalPages: searchResult.pageCount
      });
      setSearchResult(null);
      setSearchQuery({ title: '', author: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const purchaseBook = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/goals/wishlist/${id}/purchase`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteWishlistItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/goals/wishlist/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const pickNextRead = () => {
    const combined = [...tbrList, ...wishlist];
    if (combined.length === 0) {
      alert("Your queues are empty! Add some books first.");
      return;
    }
    const random = combined[Math.floor(Math.random() * combined.length)];
    alert(`Fate has decided! Your next read should be: "${random.title}" by ${random.author}`);
  };

  const calculatePace = () => {
    if (!currentBook) return null;
    const read = currentBook.progress.readPages;
    const total = currentBook.progress.totalPages;
    const remaining = total - read;
    if (remaining <= 0) return "Finished!";
    
    const days = Math.ceil(remaining / goals.dailyPageGoal);
    const finishDate = new Date();
    finishDate.setDate(finishDate.getDate() + days);
    return finishDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-12">
      {/* Header */}
      <div className="flex justify-between items-center bg-white/60 p-8 rounded-lg shadow-sm border border-sage/20 washi-tape">
        <div>
          <h1 className="text-4xl font-bold text-mahogany font-serif">Reading Strategy</h1>
          <p className="text-ink/60 italic font-serif mt-1">"The reading of all good books is like a conversation with the finest minds."</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-6 py-2 bg-mahogany/5 rounded-md border border-mahogany/20 shadow-inner">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-mahogany">Current Streak</span>
            <span className="text-3xl font-serif text-ink flex items-center justify-center gap-2">
              <Flame size={24} className="text-sienna fill-sienna animate-pulse" />
              {goals.currentStreak} Days
            </span>
          </div>
          <button 
            onClick={pickNextRead}
            className="flex flex-col items-center justify-center px-6 py-2 bg-sage/10 rounded-md border border-sage/20 hover:bg-sage/20 transition-all text-sage group"
          >
            <Dice5 size={24} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Decide Next</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Goals & Streaks */}
        <div className="col-span-8 space-y-8">
          <section className="bg-white/60 p-8 rounded-lg shadow-sm border border-sage/20">
            <div className="flex items-center gap-3 mb-8">
              <Target size={24} className="text-mahogany" />
              <h2 className="text-xl font-bold uppercase tracking-wider text-ink font-serif">Mission Objectives</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-textGray">Yearly Book Target</label>
                <div className="flex items-center gap-4">
                   <input 
                    type="number" 
                    value={goals.yearlyBookGoal}
                    onChange={(e) => updateGoals({ yearlyBookGoal: Number(e.target.value) })}
                    className="w-24 bg-transparent border-b-2 border-mahogany/30 focus:border-mahogany outline-none text-3xl font-serif text-ink pb-1"
                  />
                  <span className="text-sage font-serif italic text-lg pt-2">Volumes to be archived</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-textGray">Daily Page Goal</label>
                <div className="flex items-center gap-4">
                   <input 
                    type="number" 
                    value={goals.dailyPageGoal}
                    onChange={(e) => updateGoals({ dailyPageGoal: Number(e.target.value) })}
                    className="w-24 bg-transparent border-b-2 border-mahogany/30 focus:border-mahogany outline-none text-3xl font-serif text-ink pb-1"
                  />
                  <span className="text-sage font-serif italic text-lg pt-2">Pages/Day Target</span>
                </div>
              </div>
            </div>
          </section>

          {/* PACE CALCULATOR */}
          {currentBook && (
            <section className="bg-mahogany/5 p-8 rounded-lg border border-mahogany/10 shadow-inner relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-mahogany font-serif uppercase tracking-tight">The Pace Calculator</h3>
                  <p className="text-ink/70 font-serif italic mt-1">Analyzing your current reading journey...</p>
                  
                  <div className="mt-6 flex items-center gap-12">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-mahogany/60 tracking-widest mb-1">Current Book</span>
                      <span className="text-xl font-bold text-ink">{currentBook.title}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-mahogany/60 tracking-widest mb-1">Predicted Finish</span>
                      <span className="text-2xl font-serif text-mahogany font-bold">{calculatePace()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded shadow-sm border border-sage/20">
                  <RefreshCw size={14} className="text-sage" />
                  <span className="text-[10px] font-bold text-ink uppercase tracking-widest">Live Syncing</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 opacity-10 -translate-y-1/2 translate-x-1/4">
                <RefreshCw size={200} />
              </div>
            </section>
          )}

          {/* MILESTONES */}
          <section className="bg-white/60 p-8 rounded-lg border border-sage/20 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-textGray mb-6 flex items-center gap-2">
              <CheckCircle size={14} className="text-sage" /> Milestone Achievements
            </h3>
            <div className="flex gap-4">
              {['Century Club', 'Consistency King'].map(badge => {
                const earned = goals.milestones.find(m => m.name === badge);
                return (
                  <div key={badge} className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-all ${
                    earned ? 'bg-sage/20 border-sage text-sage font-bold' : 'bg-gray-100 border-gray-200 text-gray-400 opacity-50 grayscale'
                  }`}>
                    <CheckCircle size={14} />
                    <span className="text-[10px] uppercase tracking-widest">{badge}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right: Buy List / Wishlist */}
        <div className="col-span-4 space-y-8">
           <section className="bg-[#FAF8F5] p-6 rounded-lg border border-[#E5E0D8] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart size={20} className="text-mahogany" />
              <h2 className="text-lg font-bold uppercase tracking-wider text-ink font-serif">The Buy List</h2>
            </div>

            {/* SEARCH / ADD */}
            <div className="space-y-4 mb-8">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Book Title..."
                  value={searchQuery.title}
                  onChange={(e) => setSearchQuery({...searchQuery, title: e.target.value})}
                  className="w-full bg-white border border-sage/30 rounded px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-mahogany/30"
                />
                <button 
                  onClick={handleSearch}
                  disabled={searching}
                  className="p-1.5 bg-mahogany text-white rounded hover:bg-mahogany/90 transition-colors"
                >
                  <Search size={16} />
                </button>
              </div>
              
              {searchResult && (
                <div className="bg-white p-3 rounded border border-sage/20 shadow-md animate-fade-in flex gap-3 relative">
                  <div className="w-12 h-16 bg-mahogany/5 border border-mahogany/10 rounded flex items-center justify-center shrink-0 overflow-hidden">
                    {searchResult.coverImg ? (
                      <img src={searchResult.coverImg} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <Book size={20} className="text-mahogany/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-ink leading-tight line-clamp-1">{searchResult.title}</p>
                    <p className="text-[10px] text-ink/60 italic mt-1">{searchResult.authors}</p>
                    <button 
                      onClick={addToWishlist}
                      className="mt-2 w-full py-1 bg-sage/10 text-sage text-[9px] font-bold uppercase rounded border border-sage/20 hover:bg-sage/20 transition-colors"
                    >
                      Add to List
                    </button>
                  </div>
                  <button onClick={() => setSearchResult(null)} className="absolute top-1 right-1 text-ink/30">×</button>
                </div>
              )}
            </div>

            {/* LIST */}
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {wishlist.map(item => (
                <div key={item._id} className="group flex gap-3 p-3 bg-white rounded border border-black/5 hover:border-mahogany/20 transition-all shadow-sm">
                  <div className="w-10 h-14 bg-mahogany/5 border border-mahogany/10 rounded flex items-center justify-center shrink-0 overflow-hidden">
                    {(item.coverImage || item.coverImg) ? (
                      <img src={item.coverImage || item.coverImg} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <Book size={16} className="text-mahogany/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-ink leading-tight truncate">{item.title}</p>
                    <p className="text-[10px] text-ink/60 truncate italic">{item.author}</p>
                    <div className="mt-2 flex gap-2">
                      <button 
                        onClick={() => purchaseBook(item._id)}
                        className="text-[9px] font-bold text-mahogany bg-mahogany/5 px-2 py-0.5 rounded hover:bg-mahogany/10 transition-colors"
                      >
                        Purchased
                      </button>
                      <button 
                         onClick={() => deleteWishlistItem(item._id)}
                        className="text-[9px] font-bold text-ink/40 hover:text-red-900 transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {wishlist.length === 0 && (
                <div className="text-center py-12 text-ink/40 font-serif italic text-sm">
                  Your buy list is clear. Time to browse...
                </div>
              )}
            </div>
           </section>
        </div>
      </div>
    </div>
  );
}
