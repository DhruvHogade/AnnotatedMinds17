import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Clock, Edit3, MoreVertical, RefreshCw, FileText, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BookCard({ book, mode = 'card', onUpdate, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [reviewInfo, setReviewInfo] = useState({ exists: false, id: null });

  useEffect(() => {
    if (book.status === 'Finished') {
      checkReview();
    }
  }, [book.status, book._id]);

  const checkReview = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/books/check-review/${book._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReviewInfo({ exists: data.exists, id: data.reviewId });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (mode === 'spine') {
    return (
      <div 
        className="book-spine flex items-center justify-center group"
        onClick={onEdit}
        title={book.title}
        style={{ backgroundColor: book.genre === 'Fiction' ? '#4A0E17' : book.genre === 'Fantasy' ? '#5C4033' : '#8F9779' }}
      >
        <span className="group-hover:text-white transition-colors">{book.title}</span>
      </div>
    );
  }

  const progressPct = book.progress?.totalPages 
    ? Math.round((book.progress.readPages / book.progress.totalPages) * 100) 
    : 0;

  return (
    <div className="bg-white/60 border border-sage/20 rounded p-4 shadow hover:shadow-md transition-all relative washi-tape group">
      <div className="flex gap-4">
        {(book.coverImage || book.coverImg) ? (
          <img src={book.coverImage || book.coverImg} alt="Cover" className="w-20 h-28 object-cover shadow-md rounded-sm border border-black/10 transition-transform group-hover:scale-105" />
        ) : (
          <div className="w-20 h-28 bg-sage/10 flex items-center justify-center rounded-sm border border-sage/20">
            <BookOpen size={24} className="text-sage/40" />
          </div>
        )}
        
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex justify-between items-start gap-1">
            <h3 className="font-bold text-mahogany font-serif text-lg leading-tight line-clamp-2">{book.title}</h3>
            <div className="relative group/menu">
              <button className="text-ink/40 hover:text-mahogany p-1"><MoreVertical size={16} /></button>
              <div className="absolute right-0 top-full mt-1 bg-white border border-sage/20 shadow-xl rounded-md opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-opacity z-20 min-w-[120px] py-1">
                <button onClick={onEdit} className="w-full text-left px-3 py-1.5 text-xs hover:bg-sage/10 flex items-center gap-2 text-ink"><Edit3 size={12} /> Edit Details</button>
                <button onClick={onUpdate} className="w-full text-left px-3 py-1.5 text-xs hover:bg-sage/10 flex items-center gap-2 text-ink"><RefreshCw size={12} /> Update Status</button>
                <div className="h-px bg-black/5 my-1"></div>
                <button onClick={onDelete} className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 flex items-center gap-2 text-red-600 font-bold"><Trash2 size={12} /> Delete Book</button>
              </div>
            </div>
          </div>
          <p className="text-ink/60 text-sm font-serif mb-2 line-clamp-1 italic">by {book.author}</p>
          
          <div className="mt-auto flex flex-wrap gap-2">
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
              book.status === 'Finished' ? 'bg-sage/20 text-sage' : 
              book.status === 'Currently Reading' ? 'bg-sienna/20 text-sienna' : 
              'bg-ink/5 text-ink/40'
            }`}>
              {book.status === 'Finished' ? <CheckCircle size={10} /> : book.status === 'Currently Reading' ? <BookOpen size={10} /> : <Clock size={10} />}
              {book.status}
            </div>

            {book.status === 'Finished' && (
              <div className="flex gap-2">
                {reviewInfo.exists ? (
                  <>
                    <button 
                      onClick={() => navigate(`/review/${reviewInfo.id}`)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sage/20 text-sage hover:bg-sage/30 transition-colors"
                    >
                      <FileText size={10} />
                      View Journal
                    </button>
                    <button 
                      onClick={() => navigate(`/review/${reviewInfo.id}/edit`)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-mahogany/10 text-mahogany hover:bg-mahogany/20 transition-colors"
                    >
                      <Edit3 size={10} />
                      Edit
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => navigate(`/reviews?bookId=${book._id}`)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-mahogany/10 text-mahogany hover:bg-mahogany/20 transition-colors"
                  >
                    <Plus size={10} />
                    Add Review
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {book.status === 'Currently Reading' && (
        <div className="mt-4 pt-3 border-t border-black/5">
          <div className="flex justify-between text-[10px] text-ink/50 mb-1 font-bold tracking-tighter uppercase">
            <span>Reading Progress</span>
            <span className="ink-blue-text">{book.progress.readPages} / {book.progress.totalPages || '??'} p</span>
          </div>
          <div className="w-full h-[4px] bg-black/5 rounded-full overflow-hidden relative border border-black/5">
            <div 
              className="h-full bg-gradient-to-r from-mahogany to-sage transition-all duration-500"
              style={{ width: `${Math.min(100, progressPct)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
