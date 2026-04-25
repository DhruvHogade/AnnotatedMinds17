import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Save, Search, Plus, Trash2 } from 'lucide-react';

const METRICS = [
  { key: 'characterDevelopment', label: 'Character Development' },
  { key: 'plotDevelopment', label: 'Plot Development' },
  { key: 'qualityOfWriting', label: 'Quality of Writing' },
  { key: 'pacing', label: 'Pacing' },
  { key: 'thoughtProvoking', label: 'Thought Provoking' },
  { key: 'entertaining', label: 'Entertaining' },
  { key: 'enjoyable', label: 'Enjoyable' },
];

export default function ReviewSystem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const bookId = queryParams.get('bookId');

  const [formData, setFormData] = useState({
    title: '', author: '', publisher: '', pageCount: '', genre: '', format: 'Paperback',
    discoveryMethod: '', acquisitionSource: '', readLocation: '', otherBooksByAuthor: '',
    characterDevelopment: 0, plotDevelopment: 0, qualityOfWriting: 0, pacing: 0,
    thoughtProvoking: 0, entertaining: 0, enjoyable: 0,
    recommendation: 'Yes', overallRating: 0, detailedReview: '',
    favoriteQuotes: [], coverImageUrl: '',
    startDate: '', endDate: '', moodboardImages: ['', '', '', ''], emojiStats: []
  });
  
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      const fetchReview = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/reviews/${id}`);
          if (res.ok) {
            const data = await res.json();
            setFormData({
              ...data,
              otherBooksByAuthor: Array.isArray(data.otherBooksByAuthor) 
                ? data.otherBooksByAuthor.join(', ') 
                : data.otherBooksByAuthor || ''
            });
          }
        } catch (error) {
          console.error('Failed to load review', error);
        }
      };
      fetchReview();
    } else if (bookId) {
      // New review for a specific book - pre-fill metadata
      const fetchBookDetails = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:5000/api/books`, {
             headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const books = await res.json();
            const book = books.find(b => b._id === bookId);
            if (book) {
              setFormData(prev => ({
                ...prev,
                title: book.title || '',
                author: book.author || '',
                genre: book.genre || '',
                pageCount: book.progress?.totalPages || '',
                coverImageUrl: book.coverImage || '',
                book: bookId // Link the review to the book
              }));
              setMessage(`Details for "${book.title}" pre-filled from your library.`);
            }
          }
        } catch (error) {
          console.error('Failed to pre-fill book details', error);
        }
      };
      fetchBookDetails();
    }
  }, [id, bookId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMetricChange = (metricKey, value) => {
    setFormData(prev => ({ ...prev, [metricKey]: value }));
  };

  const fetchMetadata = async () => {
    if (!formData.title) return;
    setLoadingMetadata(true);
    setMessage('');
    try {
      const query = new URLSearchParams({ title: formData.title, author: formData.author });
      const res = await fetch(`/api/books/search?${query}`);
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          title: data.title || prev.title,
          author: data.authors || prev.author,
          coverImageUrl: data.coverImg || prev.coverImageUrl,
          publisher: data.publisher || prev.publisher,
          pageCount: data.pageCount || prev.pageCount,
          genre: data.genre || prev.genre,
        }));
        setMessage('Book details loaded successfully.');
      } else if (res.status === 404) {
        setMessage('Book details not found, please enter manually.');
      } else {
        setMessage('Book details not found, please enter manually.');
      }
    } catch (error) {
      console.error("Failed to fetch metadata", error);
      setMessage('Book details not found, please enter manually.');
    } finally {
      setLoadingMetadata(false);
    }
  };

  const handleAddQuote = () => {
    setFormData(prev => ({
      ...prev,
      favoriteQuotes: [...prev.favoriteQuotes, { text: '', pageNumber: '' }]
    }));
  };

  const handleQuoteChange = (index, field, value) => {
    const newQuotes = [...formData.favoriteQuotes];
    newQuotes[index][field] = value;
    setFormData(prev => ({ ...prev, favoriteQuotes: newQuotes }));
  };

  const handleRemoveQuote = (index) => {
    const newQuotes = formData.favoriteQuotes.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, favoriteQuotes: newQuotes }));
  };

  const handleMoodboardChange = (index, value) => {
    const newImages = [...(formData.moodboardImages || ['', '', '', ''])];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, moodboardImages: newImages }));
  };

  const handleAddEmojiStat = () => {
    setFormData(prev => ({
      ...prev,
      emojiStats: [...(prev.emojiStats || []), { emoji: '📚', percentage: 50 }]
    }));
  };

  const handleEmojiStatChange = (index, field, value) => {
    const newStats = [...formData.emojiStats];
    newStats[index][field] = value;
    setFormData(prev => ({ ...prev, emojiStats: newStats }));
  };

  const handleRemoveEmojiStat = (index) => {
    const newStats = formData.emojiStats.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, emojiStats: newStats }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      const payload = { ...formData };
      if (typeof payload.otherBooksByAuthor === 'string') {
        payload.otherBooksByAuthor = payload.otherBooksByAuthor.split(',').map(s => s.trim()).filter(Boolean);
      }
      
      const url = id ? `http://localhost:5000/api/reviews/${id}` : 'http://localhost:5000/api/reviews';
      const method = id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setMessage('Journal entry saved successfully!');
        setTimeout(() => {
          navigate(id ? `/review/${id}` : '/library');
        }, 1500);
      } else {
        setMessage('Failed to save journal entry.');
      }
    } catch (error) {
      setMessage('Error saving entry.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-mahogany font-serif tracking-wide">
          {id ? 'Edit Journal Entry' : 'New Journal Entry'}
        </h1>
        {id && (
          <button type="button" onClick={() => navigate(`/review/${id}`)} className="text-sage hover:text-mahogany transition-colors font-serif uppercase tracking-widest text-sm border border-sage/30 px-4 py-2 rounded">
            Cancel Edit
          </button>
        )}
      </div>
      
      {message && (
        <div className={`mb-6 p-4 rounded font-serif shadow-md ${message.includes('success') ? 'bg-sage/20 text-sage border border-sage/30' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} 
            className="bg-parchment shadow-2xl rounded-xl p-8 relative overflow-hidden flex flex-col border border-mahogany/10"
            style={{ 
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(143, 151, 121, 0.2) 31px, rgba(143, 151, 121, 0.2) 32px)',
              backgroundAttachment: 'local',
              lineHeight: '32px'
            }}>
            
        {/* Top Stripe: Basic Info */}
        <div className="mb-8 flex flex-col md:flex-row items-start gap-8 bg-white/50 p-6 rounded-lg backdrop-blur-sm border border-mahogany/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]">
          <div className="flex flex-col gap-3 flex-shrink-0 w-32">
            {formData.coverImageUrl ? (
              <img src={formData.coverImageUrl} alt="Cover" className="w-32 h-48 object-cover rounded shadow-lg border border-mahogany/20" />
            ) : (
              <div className="w-32 h-48 bg-mahogany/5 flex items-center justify-center rounded shadow-inner border border-mahogany/20 font-serif text-sm text-mahogany/50 text-center p-2">No Cover</div>
            )}
            <div>
              <input type="text" name="coverImageUrl" value={formData.coverImageUrl} onChange={handleChange} className="w-full bg-white/50 border border-mahogany/30 focus:border-mahogany rounded outline-none font-sans text-xs text-ink p-1 placeholder-mahogany/30" placeholder="Paste image URL..." />
            </div>
          </div>
          
          <div className="flex-1 w-full space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block font-serif text-mahogany text-sm font-bold tracking-wider uppercase mb-1">Title</label>
                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-transparent border-b border-mahogany/40 focus:border-mahogany outline-none font-garamond text-3xl text-ink leading-tight placeholder-mahogany/20" placeholder="Book Title" />
              </div>
              <div className="flex-1">
                <label className="block font-serif text-mahogany text-sm font-bold tracking-wider uppercase mb-1">Author</label>
                <div className="flex gap-3">
                  <input required type="text" name="author" value={formData.author} onChange={handleChange} className="w-full bg-transparent border-b border-mahogany/40 focus:border-mahogany outline-none font-garamond text-2xl text-ink leading-tight placeholder-mahogany/20" placeholder="Author Name" />
                  <button type="button" onClick={fetchMetadata} disabled={loadingMetadata} className="p-2 rounded-full bg-mahogany/10 text-mahogany hover:bg-mahogany hover:text-parchment transition-colors shadow-sm self-end mb-1" title="Auto-fill Metadata">
                    <Search size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block font-serif text-mahogany text-xs font-bold tracking-wider uppercase mb-1">Publisher</label>
                <input type="text" name="publisher" value={formData.publisher} onChange={handleChange} className="w-full bg-transparent border-b border-mahogany/30 focus:border-mahogany outline-none font-garamond text-lg text-ink leading-tight" />
              </div>
              <div>
                <label className="block font-serif text-mahogany text-xs font-bold tracking-wider uppercase mb-1">Page Count</label>
                <input type="number" name="pageCount" value={formData.pageCount} onChange={handleChange} className="w-full bg-transparent border-b border-mahogany/30 focus:border-mahogany outline-none font-garamond text-lg text-ink leading-tight" />
              </div>
              <div>
                <label className="block font-serif text-mahogany text-xs font-bold tracking-wider uppercase mb-1">Genre</label>
                <input type="text" name="genre" value={formData.genre} onChange={handleChange} className="w-full bg-transparent border-b border-mahogany/30 focus:border-mahogany outline-none font-garamond text-lg text-ink leading-tight" />
              </div>
              <div>
                <label className="block font-serif text-mahogany text-xs font-bold tracking-wider uppercase mb-1">Format</label>
                <select name="format" value={formData.format} onChange={handleChange} className="w-full bg-transparent border-b border-mahogany/30 focus:border-mahogany outline-none font-garamond text-lg text-ink pb-1 cursor-pointer">
                  <option value="Hardcover">Hardcover</option>
                  <option value="Paperback">Paperback</option>
                  <option value="E-Book">E-Book</option>
                  <option value="Audio">Audio</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block font-serif text-mahogany text-xs font-bold tracking-wider uppercase mb-1">Start Date</label>
                <input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} className="w-full bg-transparent border-b border-mahogany/30 focus:border-mahogany outline-none font-garamond text-lg text-ink leading-tight" />
              </div>
              <div>
                <label className="block font-serif text-mahogany text-xs font-bold tracking-wider uppercase mb-1">End Date</label>
                <input type="date" name="endDate" value={formData.endDate || ''} onChange={handleChange} className="w-full bg-transparent border-b border-mahogany/30 focus:border-mahogany outline-none font-garamond text-lg text-ink leading-tight" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Big Section (Review & Quotes) */}
          <div className="lg:w-2/3 space-y-8 bg-white/50 p-6 rounded-lg backdrop-blur-sm border border-mahogany/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] flex flex-col">
            
            <div className="space-y-4">
              <h3 className="font-serif text-mahogany text-xl font-bold border-b-2 border-mahogany/20 pb-2">Context & Discovery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block font-serif text-mahogany/80 text-xs tracking-wider uppercase mb-1">How I discovered this book</label>
                  <input type="text" name="discoveryMethod" value={formData.discoveryMethod} onChange={handleChange} className="w-full bg-transparent border-b border-mahogany/30 focus:border-mahogany outline-none font-garamond text-xl text-ink leading-tight" />
                </div>
                <div>
                  <label className="block font-serif text-mahogany/80 text-xs tracking-wider uppercase mb-1">Where I got this book</label>
                  <input type="text" name="acquisitionSource" value={formData.acquisitionSource} onChange={handleChange} className="w-full bg-transparent border-b border-mahogany/30 focus:border-mahogany outline-none font-garamond text-xl text-ink leading-tight" />
                </div>
                <div>
                  <label className="block font-serif text-mahogany/80 text-xs tracking-wider uppercase mb-1">Where I read this</label>
                  <input type="text" name="readLocation" value={formData.readLocation} onChange={handleChange} className="w-full bg-transparent border-b border-mahogany/30 focus:border-mahogany outline-none font-garamond text-xl text-ink leading-tight" placeholder="e.g. Home, Train, Office" />
                </div>
                <div>
                  <label className="block font-serif text-mahogany/80 text-xs tracking-wider uppercase mb-1">Other books by author (comma separated)</label>
                  <input type="text" name="otherBooksByAuthor" value={formData.otherBooksByAuthor} onChange={handleChange} className="w-full bg-transparent border-b border-mahogany/30 focus:border-mahogany outline-none font-garamond text-xl text-ink leading-tight" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4 flex-1 flex flex-col">
              <h3 className="font-serif text-mahogany text-xl font-bold border-b-2 border-mahogany/20 pb-2">Detailed Review Notes</h3>
              <div className="flex-1 min-h-[300px]">
                <textarea name="detailedReview" value={formData.detailedReview} onChange={handleChange} className="w-full h-full bg-white/40 border border-mahogany/20 rounded-md p-4 outline-none focus:border-mahogany/50 focus:bg-white/60 font-garamond text-xl text-ink leading-relaxed resize-y shadow-inner min-h-[300px]" placeholder="Write your extensive thoughts here..." />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-end border-b-2 border-mahogany/20 pb-2">
                <h3 className="font-serif text-mahogany text-xl font-bold">Favorite Quotes</h3>
                <button type="button" onClick={handleAddQuote} className="text-sage hover:text-mahogany flex items-center gap-1 text-sm font-sans font-medium transition-colors bg-sage/10 px-3 py-1 rounded-full">
                  <Plus size={16} /> Add Quote
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.favoriteQuotes.map((quote, idx) => (
                  <div key={idx} className="flex gap-4 items-start group relative bg-white/60 p-4 rounded-md border border-mahogany/10 shadow-sm transition-all hover:shadow-md">
                    <span className="font-serif text-mahogany/30 text-4xl leading-none absolute -left-2 -top-2">"</span>
                    <textarea 
                      value={quote.text} 
                      onChange={(e) => handleQuoteChange(idx, 'text', e.target.value)} 
                      className="flex-1 bg-transparent border-none outline-none font-garamond italic text-xl text-ink resize-none pt-1 z-10" 
                      placeholder="Quote text..."
                      rows="3"
                    />
                    <div className="flex flex-col gap-3 items-end pt-1">
                      <div className="flex items-center gap-1 border-b border-mahogany/30">
                        <span className="font-serif text-xs text-mahogany/70">Pg.</span>
                        <input 
                          type="text" 
                          value={quote.pageNumber} 
                          onChange={(e) => handleQuoteChange(idx, 'pageNumber', e.target.value)} 
                          className="w-10 bg-transparent outline-none font-garamond text-center text-lg text-ink" 
                        />
                      </div>
                      <button type="button" onClick={() => handleRemoveQuote(idx)} className="text-red-900/40 hover:text-red-900 transition-colors bg-red-50 p-1 rounded-full opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {formData.favoriteQuotes.length === 0 && (
                  <div className="p-6 text-center border-2 border-dashed border-mahogany/20 rounded-md bg-white/30 md:col-span-2">
                    <p className="text-mahogany/60 font-garamond italic text-lg">No quotes added yet. Click above to add your favorite lines.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-end border-b-2 border-mahogany/20 pb-2">
                <h3 className="font-serif text-mahogany text-xl font-bold">Moodboard Images (URLs)</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col gap-1">
                    <input type="text" placeholder={`Image URL ${i+1}`} value={formData.moodboardImages?.[i] || ''} onChange={e => handleMoodboardChange(i, e.target.value)} className="w-full bg-white/40 border border-mahogany/20 rounded p-2 focus:border-mahogany outline-none font-sans text-xs text-ink shadow-inner" />
                    {formData.moodboardImages?.[i] && (
                      <img src={formData.moodboardImages[i]} alt={`Moodboard ${i+1}`} className="w-full h-24 object-cover rounded opacity-80" />
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Small Section (Analysis & Rating) */}
          <div className="lg:w-1/3 space-y-8 bg-white/50 p-6 rounded-lg backdrop-blur-sm border border-mahogany/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]">
            
            <div className="space-y-4">
              <h3 className="font-serif text-mahogany text-xl font-bold border-b-2 border-mahogany/20 pb-2">Analysis</h3>
              
              <div className="space-y-4">
                {METRICS.map(metric => (
                  <div key={metric.key} className="flex flex-col gap-1">
                    <div className="font-serif text-ink tracking-wide text-xs font-medium uppercase">{metric.label}</div>
                    <div className="flex justify-between items-center bg-white/40 rounded-full px-1 py-1 shadow-inner border border-mahogany/5">
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleMetricChange(metric.key, num)}
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-garamond font-semibold text-base sm:text-lg transition-all duration-300
                            ${formData[metric.key] === num 
                              ? 'bg-blue-600/90 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] border-2 border-blue-800 scale-110 z-10' 
                              : 'text-ink/60 hover:bg-mahogany/10 hover:text-ink hover:scale-105'
                            }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t-2 border-mahogany/20 space-y-4">
              <div className="flex justify-between items-end border-b-2 border-mahogany/20 pb-2">
                <h3 className="font-serif text-mahogany text-xl font-bold">Emoji Stats</h3>
                <button type="button" onClick={handleAddEmojiStat} className="text-sage hover:text-mahogany flex items-center gap-1 text-sm font-sans font-medium transition-colors bg-sage/10 px-3 py-1 rounded-full">
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className="space-y-3">
                {(formData.emojiStats || []).map((stat, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-white/40 p-2 rounded shadow-sm border border-mahogany/10">
                    <input type="text" value={stat.emoji} onChange={e => handleEmojiStatChange(idx, 'emoji', e.target.value)} className="w-12 text-center text-2xl bg-transparent border-b border-mahogany/30 focus:border-mahogany outline-none" placeholder="📚" />
                    <input type="number" min="0" max="100" value={stat.percentage} onChange={e => handleEmojiStatChange(idx, 'percentage', parseInt(e.target.value) || 0)} className="flex-1 bg-transparent border-b border-mahogany/30 focus:border-mahogany outline-none font-garamond text-lg text-center" placeholder="%" />
                    <span className="font-serif text-mahogany/50">%</span>
                    <button type="button" onClick={() => handleRemoveEmojiStat(idx)} className="text-red-900/40 hover:text-red-900 p-1 transition-colors"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t-2 border-mahogany/20 space-y-6">
              <div className="flex flex-col gap-2 bg-white/50 p-4 rounded-lg border border-mahogany/10 shadow-sm text-center">
                <span className="font-serif text-mahogany font-bold tracking-wide uppercase text-sm">Overall Rating</span>
                <div className="flex gap-1 justify-center">
                  {[1,2,3,4,5].map(star => (
                    <div key={star} className="relative inline-block text-4xl cursor-pointer hover:scale-110 transition-transform select-none">
                      <span className={`${formData.overallRating >= star ? 'text-yellow-500 drop-shadow-md' : 'text-gray-300'}`}>
                        ★
                      </span>
                      {formData.overallRating >= star - 0.5 && formData.overallRating < star && (
                        <span className="absolute top-0 left-0 w-1/2 overflow-hidden text-yellow-500 drop-shadow-md pointer-events-none">
                          ★
                        </span>
                      )}
                      <div className="absolute top-0 left-0 w-full h-full flex">
                        <div className="flex-1 h-full" onClick={() => handleMetricChange('overallRating', star - 0.5)} />
                        <div className="flex-1 h-full" onClick={() => handleMetricChange('overallRating', star)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between bg-white/50 px-4 py-3 rounded-lg border border-mahogany/10 shadow-sm">
                <label className="font-serif text-mahogany font-bold tracking-wide uppercase text-sm">Recommend?</label>
                <select name="recommendation" value={formData.recommendation} onChange={handleChange} className="bg-transparent outline-none font-garamond text-2xl text-ink cursor-pointer text-right">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={isSaving} className="w-full py-4 mt-4 bg-mahogany text-parchment font-serif text-lg font-bold tracking-widest uppercase rounded-md shadow-xl hover:bg-mahogany/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 group">
              <Save size={20} className="group-hover:scale-110 transition-transform" /> 
              {isSaving ? 'Saving...' : 'Save Entry'}
            </button>
            
          </div>

        </div>

      </form>
    </div>
  );
}
