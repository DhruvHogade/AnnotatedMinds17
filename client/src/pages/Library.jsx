import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Book as BookIcon, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBookSearch } from '../hooks/useBookSearch';
import BookCard from '../components/BookCard';

export default function Library() {
  const [books, setBooks] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [isAdding, setIsAdding] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  
  const [newBook, setNewBook] = useState({ title: '', author: '', status: 'To-Read', totalPages: 0, readPages: 0, coverImage: '', genre: '' });
  const { searchBook, loading: searchLoading, error: searchError } = useBookSearch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [booksRes, wishlistRes] = await Promise.all([
        fetch('/api/books', { headers }),
        fetch('/api/goals/wishlist', { headers })
      ]);
      
      if (booksRes.ok) setBooks(await booksRes.json());
      if (wishlistRes.ok) setWishlist(await wishlistRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMetadata = async () => {
    if (!newBook.title || !newBook.author) return;
    const metadata = await searchBook(newBook.title, newBook.author);
    if (metadata) {
      setNewBook(prev => ({
        ...prev,
        title: metadata.title || prev.title,
        author: metadata.authors || prev.author,
        totalPages: metadata.pageCount || prev.totalPages,
        coverImage: metadata.coverImg || prev.coverImage,
        genre: metadata.genre || prev.genre
      }));
    }
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const isEditing = !!editingBook;
      const url = isEditing ? `/api/books/${editingBook._id}` : '/api/books';
      const method = isEditing ? 'PUT' : 'POST';
      
      const payload = {
        title: newBook.title,
        author: newBook.author,
        status: newBook.status,
        coverImage: newBook.coverImage,
        genre: newBook.genre,
        progress: { 
          readPages: parseInt(newBook.readPages) || 0, 
          totalPages: parseInt(newBook.totalPages) || 0 
        }
      };
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsAdding(false);
        setEditingBook(null);
        setNewBook({ title: '', author: '', status: 'To-Read', totalPages: 0, readPages: 0, coverImage: '', genre: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBooks = books.filter(b => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Currently Reading') return b.status === 'Currently Reading';
    if (activeTab === 'To-Read') return b.status === 'To-Read';
    if (activeTab === 'Finished') return b.status === 'Finished';
    return false;
  });

  const openEdit = (book) => {
    setEditingBook(book);
    setNewBook({
      title: book.title,
      author: book.author,
      status: book.status,
      totalPages: book.progress.totalPages,
      readPages: book.progress.readPages,
      coverImage: book.coverImage,
      genre: book.genre
    });
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this book from your library? This will also delete any associated reviews and reading logs.")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = ['All', 'Currently Reading', 'To-Read', 'Finished', 'Bucket List'];

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-mahogany">Personal Library</h1>
          <p className="text-ink/60 font-serif italic mt-1 text-sm md:text-base">"A library is not a luxury but one of the necessities of life."</p>
        </div>
        <button onClick={() => { setEditingBook(null); setIsAdding(true); }} className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center">
          <Plus size={18} /> Catalog New Work
        </button>
      </div>

      {/* Stylized Tabs - Scrollable on mobile */}
      <div className="flex items-center justify-between border-b border-sage/30 pb-px overflow-x-auto hide-scrollbar">
        <div className="flex gap-4 md:gap-8 whitespace-nowrap min-w-max">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[11px] md:text-sm font-bold tracking-widest uppercase transition-all relative ${
                activeTab === tab ? 'text-mahogany' : 'text-ink/40 hover:text-ink/60'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-mahogany rounded-t-full shadow-[0_-2px_6px_rgba(74,14,23,0.3)]"></div>
              )}
            </button>
          ))}
        </div>
        
        <div className="hidden md:flex gap-2 bg-sage/10 p-1 rounded-md border border-sage/20 flex-shrink-0">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-mahogany' : 'text-ink/40'}`}><LayoutGrid size={16} /></button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-mahogany' : 'text-ink/40'}`}><List size={16} /></button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-softCream w-full max-w-2xl rounded-lg shadow-2xl border border-mahogany/20 overflow-hidden animate-fade-in">
            <div className="bg-mahogany p-4 text-parchment flex justify-between items-center">
              <h2 className="text-xl font-serif">{editingBook ? 'Edit Book Details' : 'Catalog New Entry'}</h2>
              <button onClick={() => setIsAdding(false)} className="hover:rotate-90 transition-transform"><Plus className="rotate-45" size={24} /></button>
            </div>
            
            <form onSubmit={handleSaveBook} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">Book Title</label>
                  <div className="relative">
                    <input type="text" required className="input-field pr-10" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
                    <button type="button" onClick={handleFetchMetadata} className="absolute right-2 top-1/2 -translate-y-1/2 text-mahogany/40 hover:text-mahogany"><Search size={18} /></button>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">Author</label>
                  <input type="text" required className="input-field" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">Status</label>
                  <select className="input-field appearance-none" value={newBook.status} onChange={e => setNewBook({...newBook, status: e.target.value})}>
                    <option value="To-Read">To-Read</option>
                    <option value="Currently Reading">Currently Reading</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">Total Pages</label>
                  <input type="number" className="input-field" value={newBook.totalPages} onChange={e => setNewBook({...newBook, totalPages: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">Pages Read</label>
                  <input type="number" className="input-field" value={newBook.readPages} onChange={e => setNewBook({...newBook, readPages: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1">Cover Image URL</label>
                  <input type="text" className="input-field" value={newBook.coverImage} onChange={e => setNewBook({...newBook, coverImage: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-black/5">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 rounded font-serif text-ink/60 hover:text-ink">Discard</button>
                <button type="submit" className="btn-primary px-8">Save Archive</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-sage/20 border-t-mahogany rounded-full animate-spin"></div>
          <p className="text-sage font-serif italic">Unlocking the library doors...</p>
        </div>
      ) : (
        <>
          {activeTab === 'Bucket List' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlist.map(item => (
                <div key={item._id} className="relative group">
                  <BookCard 
                    book={{
                      ...item,
                      progress: { readPages: 0, totalPages: item.totalPages || 0 },
                      status: 'Wishlist'
                    }} 
                    onUpdate={() => navigate('/goals')}
                  />
                  <div className="absolute top-2 right-2 bg-mahogany text-parchment text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-widest">
                    Bucket List
                  </div>
                </div>
              ))}
              {wishlist.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-sage/20 rounded-xl">
                  <Plus size={48} className="text-sage/20 mx-auto mb-4" />
                  <p className="text-sage font-serif italic">Your bucket list is empty. Time to find new treasures.</p>
                </div>
              )}
            </div>
          ) : activeTab === 'All' && viewMode === 'grid' ? (
            <div className="space-y-12">
               <div className="flex flex-wrap gap-4 items-end bg-mahogany/5 p-8 rounded-xl border border-mahogany/10 shadow-inner">
                 {books.map(book => (
                   <BookCard key={book._id} book={book} mode="spine" onEdit={() => openEdit(book)} />
                 ))}
                 <div className="w-full h-4 bg-mahogany/20 rounded-full mt-4 shadow-md"></div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {books.map(book => (
                   <BookCard key={book._id} book={book} onUpdate={() => openEdit(book)} onEdit={() => openEdit(book)} onDelete={() => handleDelete(book._id)} />
                 ))}
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBooks.map(book => (
                <BookCard key={book._id} book={book} onUpdate={() => openEdit(book)} onEdit={() => openEdit(book)} onDelete={() => handleDelete(book._id)} />
              ))}
              {filteredBooks.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-sage/20 rounded-xl">
                  <BookIcon size={48} className="text-sage/20 mx-auto mb-4" />
                  <p className="text-sage font-serif italic">No books found in this wing of the library.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
