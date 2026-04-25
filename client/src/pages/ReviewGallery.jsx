import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Star, MessageSquare, BookOpen, Clock, ArrowRight } from 'lucide-react';

export default function ReviewGallery() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => 
    review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 bg-white/60 p-8 rounded-lg border border-sage/20 shadow-sm washi-tape">
        <div>
          <h1 className="text-4xl font-bold text-mahogany font-serif">The Review Gallery</h1>
          <p className="text-textGray italic font-serif mt-2">A collection of your literary journeys and reflections.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textGray" size={16} />
            <input 
              type="text" 
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-sage/30 rounded-full text-sm outline-none focus:ring-2 focus:ring-mahogany/20 w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => navigate('/reviews/new')}
            className="btn-primary flex items-center gap-2 px-6 py-2 shadow-md hover:scale-105 transition-transform"
          >
            <Plus size={18} /> New Review
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-sage/20 border-t-mahogany rounded-full animate-spin"></div>
          <p className="text-sage font-serif italic">Unrolling the scrolls...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredReviews.map((review) => (
            <div 
              key={review._id} 
              className="group bg-white/80 backdrop-blur-sm rounded-xl border border-sage/20 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
              onClick={() => navigate(`/review/${review._id}`)}
            >
              {/* Card Cover & Header */}
              <div className="relative h-48 overflow-hidden bg-mahogany/5">
                {review.coverImageUrl ? (
                  <img 
                    src={review.coverImageUrl} 
                    alt={review.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-mahogany/20">
                    <BookOpen size={64} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={i < review.overallRating ? "text-yellow-400 fill-yellow-400" : "text-white/30"} 
                      />
                    ))}
                  </div>
                  <h3 className="text-white font-serif font-bold text-lg leading-tight line-clamp-2">{review.title}</h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-textGray text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Clock size={12} /> {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                
                <p className="text-textDark font-serif italic line-clamp-3 mb-6 flex-1">
                  "{review.detailedReview || "No detailed reflections added yet..."}"
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-black/5">
                  <span className="text-[10px] font-bold text-mahogany/60 uppercase tracking-tighter">By {review.author}</span>
                  <div className="flex items-center gap-1 text-mahogany font-bold text-xs group-hover:gap-2 transition-all">
                    View Journal <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white/40 border-2 border-dashed border-sage/30 rounded-xl">
              <MessageSquare size={48} className="text-sage/30 mx-auto mb-4" />
              <p className="text-sage font-serif italic text-lg">
                {searchTerm ? `No reviews found matching "${searchTerm}"` : "The gallery is empty. Your reflections await."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
