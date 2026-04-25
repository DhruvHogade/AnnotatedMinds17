import React, { useState, useEffect } from 'react';
import { Quote, Plus, Trash2, Book, User, Tag, Save } from 'lucide-react';

export default function QuotesArchive() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newQuote, setNewQuote] = useState({
    text: '',
    author: '',
    bookTitle: '',
    pageNumber: '',
    tags: ''
  });

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/quotes');
      if (res.ok) {
        const data = await res.json();
        setQuotes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newQuote,
          tags: newQuote.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        setNewQuote({ text: '', author: '', bookTitle: '', pageNumber: '', tags: '' });
        setIsAdding(false);
        fetchQuotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/quotes/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchQuotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 animate-fade-in">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold text-mahogany font-serif">Quotes Archive</h1>
          <p className="text-textGray italic font-serif mt-2">"Words are, in my not-so-humble opinion, our most inexhaustible source of magic."</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-lg hover:scale-105 transition-transform"
        >
          <Plus size={18} /> Add New Quote
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-softCream w-full max-w-lg rounded-lg shadow-2xl border border-mahogany/20 overflow-hidden animate-fade-in">
            <div className="bg-mahogany p-4 text-parchment flex justify-between items-center">
              <h2 className="text-xl font-serif">New Archive Entry</h2>
              <button onClick={() => setIsAdding(false)} className="hover:rotate-90 transition-transform"><Plus className="rotate-45" size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-textGray mb-1">Quote Text</label>
                <textarea 
                  required
                  rows="4"
                  className="input-field resize-none italic"
                  placeholder="Capture the magic..."
                  value={newQuote.text}
                  onChange={e => setNewQuote({...newQuote, text: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-textGray mb-1">Author</label>
                  <input 
                    type="text" 
                    className="input-field"
                    placeholder="Who said it?"
                    value={newQuote.author}
                    onChange={e => setNewQuote({...newQuote, author: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-textGray mb-1">Book Title</label>
                  <input 
                    type="text" 
                    className="input-field"
                    placeholder="Which work?"
                    value={newQuote.bookTitle}
                    onChange={e => setNewQuote({...newQuote, bookTitle: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-textGray mb-1">Page No.</label>
                  <input 
                    type="text" 
                    className="input-field"
                    placeholder="e.g. 42"
                    value={newQuote.pageNumber}
                    onChange={e => setNewQuote({...newQuote, pageNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-textGray mb-1">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    className="input-field"
                    placeholder="life, magic, wisdom"
                    value={newQuote.tags}
                    onChange={e => setNewQuote({...newQuote, tags: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-black/5">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-textGray font-serif hover:text-mahogany transition-colors">Discard</button>
                <button type="submit" className="btn-primary px-8 flex items-center gap-2"><Save size={16} /> Archive Quote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-sage/20 border-t-mahogany rounded-full animate-spin"></div>
          <p className="text-sage font-serif italic">Reviewing the archives...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {quotes.map(quote => (
            <div key={quote._id} className="bg-white/60 backdrop-blur-sm p-8 rounded-lg border border-sage/20 shadow-sm relative group hover:shadow-md transition-all washi-tape">
              <button 
                onClick={() => handleDelete(quote._id)}
                className="absolute top-4 right-4 text-red-900/20 hover:text-red-900 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 rounded-full"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="mb-6 relative">
                <Quote className="absolute -top-4 -left-4 text-mahogany/10 rotate-180" size={64} />
                <p className="text-2xl font-handwriting text-[#2B4F81] leading-relaxed relative z-10 italic">
                  "{quote.text}"
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-6 border-t border-black/5">
                <div className="flex items-center gap-6">
                  {quote.author && (
                    <div className="flex items-center gap-2 text-xs font-bold text-textGray uppercase tracking-wider">
                      <User size={14} className="text-mahogany/60" />
                      {quote.author}
                    </div>
                  )}
                  {quote.bookTitle && (
                    <div className="flex items-center gap-2 text-xs font-bold text-textGray uppercase tracking-wider">
                      <Book size={14} className="text-mahogany/60" />
                      {quote.bookTitle} {quote.pageNumber && `(Pg. ${quote.pageNumber})`}
                    </div>
                  )}
                </div>
                
                {quote.tags && quote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {quote.tags.map((tag, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-sage/10 text-sage text-[10px] font-bold uppercase tracking-widest rounded-full">
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {quotes.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white/40 border-2 border-dashed border-sage/30 rounded-xl">
              <Quote size={48} className="text-sage/30 mx-auto mb-4" />
              <p className="text-sage font-serif italic text-lg">The archive is empty. Begin capturing the words that move you.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
