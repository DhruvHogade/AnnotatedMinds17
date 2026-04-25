import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Camera } from 'lucide-react';

export default function InstagramExport({ book, review }) {
  const exportRef = useRef(null);

  const handleExport = async () => {
    if (!exportRef.current) return;
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#F5E6CA' // Parchment
      });
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `review-${book.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error('Error generating image', err);
    }
  };

  return (
    <div className="mt-8 border-t border-mahogany/20 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-serif text-xl font-bold text-mahogany">Share on Instagram</h3>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
          <Camera size={18} /> Export Image
        </button>
      </div>

      {/* Hidden element just for canvas rendering, or make it visible but scaled down */}
      <div className="overflow-hidden rounded-xl border-4 border-mahogany/10 bg-gray-100 p-4">
        <div 
          ref={exportRef} 
          className="w-[1080px] h-[1080px] bg-parchment p-12 relative flex flex-col justify-center items-center shadow-2xl mx-auto"
          style={{ transform: 'scale(0.3)', transformOrigin: 'top center', marginBottom: '-700px' }}
        >
          {/* Background texture via CSS class is ideally applied, but we use inline for canvas reliability */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }}></div>
          
          <div className="z-10 bg-white/80 p-16 rounded-lg border-2 border-sage/40 shadow-xl w-full max-w-3xl text-center relative">
             {/* Washi tape effect */}
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-12 bg-sage/40 rotate-2 opacity-80 mix-blend-multiply rounded-sm"></div>

             <h1 className="text-6xl font-serif text-mahogany mb-4 leading-tight">"{review?.favoriteQuotes?.[0] || 'A phenomenal read that captivates from page one.'}"</h1>
             
             <div className="flex items-center justify-center gap-8 my-10">
                {book?.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="w-48 h-72 object-cover border-4 border-white shadow-lg" crossOrigin="anonymous" />
                ) : (
                  <div className="w-48 h-72 bg-mahogany/10 border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-mahogany font-serif text-xl">No Cover</span>
                  </div>
                )}
                <div className="text-left flex-1">
                  <h2 className="text-5xl font-bold text-ink mb-2">{book?.title || 'Book Title'}</h2>
                  <p className="text-3xl text-sage font-serif italic mb-6">{book?.author || 'Author Name'}</p>
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-4xl ${i < (review?.rating || 4) ? 'text-mahogany' : 'text-gray-300'}`}>✒️</span>
                    ))}
                  </div>
                </div>
             </div>

             <p className="text-2xl text-ink/80 leading-relaxed max-w-2xl mx-auto">
               {review?.digitalMarginalia || 'My thoughts on this book were profound. Highly recommend to anyone who loves deep, atmospheric storytelling.'}
             </p>

             <div className="mt-12 flex gap-4 justify-center">
               {(review?.moodTags || ['dark academia', 'mystery', 'atmospheric']).map((tag, i) => (
                 <span key={i} className="px-4 py-2 bg-sage/20 text-sage-900 rounded-full text-xl border border-sage/30">#{tag}</span>
               ))}
             </div>
          </div>

          <div className="absolute bottom-8 right-12 text-sage font-serif text-2xl font-bold flex items-center gap-2">
            @annotatedminds
          </div>
        </div>
      </div>
    </div>
  );
}
