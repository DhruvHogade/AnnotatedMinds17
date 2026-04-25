import React, { useState, useEffect } from 'react';
import { User, Palette, Save, Moon, Sun, Book } from 'lucide-react';

export default function Settings() {
  const [username, setUsername] = useState('Dhruv');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'parchment');
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Apply basic body background color changes based on theme
    const body = document.body;
    if (theme === 'dark') {
      body.style.backgroundColor = '#1A1A1A';
      body.style.color = '#E5E0D8';
    } else if (theme === 'parchment') {
      body.style.backgroundColor = '#F5E6CA';
      body.style.color = '#1A1A1A';
    } else {
      body.style.backgroundColor = '#FDFCF8';
      body.style.color = '#1A1A1A';
    }
  }, [theme]);

  const handleSave = (e) => {
    e.preventDefault();
    setMessage('Settings updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-mahogany font-serif">Account Settings</h1>
        <p className="text-textGray italic font-serif mt-2">Manage your personal sanctuary.</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-sage/20 text-sage rounded border border-sage/30 font-serif animate-fade-in">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-12">
        {/* Profile Section */}
        <section className="bg-white/60 backdrop-blur-sm rounded-lg p-8 border border-sage/20 shadow-sm relative washi-tape">
          <div className="flex items-center gap-3 mb-6">
            <User className="text-mahogany" size={20} />
            <h2 className="text-xl font-bold text-ink uppercase tracking-wider">Profile Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-textGray uppercase tracking-widest mb-2">Display Name</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Enter your name..."
              />
            </div>
          </div>
        </section>

        {/* Theme Section */}
        <section className="bg-white/60 backdrop-blur-sm rounded-lg p-8 border border-sage/20 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="text-mahogany" size={20} />
            <h2 className="text-xl font-bold text-ink uppercase tracking-wider">Aesthetic Preference</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'parchment', name: 'Vintage Parchment', icon: Book, color: 'bg-[#F5E6CA]' },
              { id: 'light', name: 'Clean Ivory', icon: Sun, color: 'bg-[#FDFCF8]' },
              { id: 'dark', name: 'Midnight Ink', icon: Moon, color: 'bg-[#1A1A1A]' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-md border-2 transition-all flex flex-col items-center gap-3 ${
                  theme === t.id 
                    ? 'border-mahogany bg-mahogany/5 shadow-md scale-105' 
                    : 'border-transparent bg-white/40 hover:bg-white/60'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${t.color} border border-black/10`}>
                  <t.icon size={20} className={t.id === 'dark' ? 'text-white' : 'text-mahogany'} />
                </div>
                <span className="text-sm font-bold tracking-tight text-ink">{t.name}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button type="submit" className="btn-primary flex items-center gap-2 px-8 py-3 text-lg">
            <Save size={18} /> Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
