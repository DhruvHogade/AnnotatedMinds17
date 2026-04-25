import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PenLine, Trash2, ArrowLeft, Image as ImageIcon, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ReviewExportTemplate from '../components/ReviewExportTemplate';

const METRICS = [
  { key: 'characterDevelopment', label: 'Character Development' },
  { key: 'plotDevelopment', label: 'Plot Development' },
  { key: 'qualityOfWriting', label: 'Quality of Writing' },
  { key: 'pacing', label: 'Pacing' },
  { key: 'thoughtProvoking', label: 'Thought Provoking' },
  { key: 'entertaining', label: 'Entertaining' },
  { key: 'enjoyable', label: 'Enjoyable' },
];

export default function JournalEntryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const exportRef = useRef(null);

  const handleExportImage = async () => {
    if (!exportRef.current) return;
    try {
      const canvas = await html2canvas(exportRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Review_${entry.title.replace(/\s+/g, '_')}.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportPDF = async () => {
    if (!exportRef.current) return;
    try {
      const canvas = await html2canvas(exportRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [1080, 1350]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 1080, 1350);
      pdf.save(`Review_${entry.title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await fetch(`/api/reviews/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEntry(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        navigate('/library');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-20 font-serif text-sage text-2xl italic">Opening the archives...</div>;
  }

  if (!entry) {
    return <div className="text-center py-20 font-serif text-mahogany text-2xl italic">Journal entry not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 animate-fade-in relative">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate('/library')} className="text-sage hover:text-mahogany transition-colors flex items-center gap-2 font-serif uppercase tracking-widest text-sm">
          <ArrowLeft size={18} /> Back to Library
        </button>
        <div className="flex gap-3 flex-wrap justify-end">
          <button onClick={handleExportImage} className="px-3 py-1.5 bg-mahogany/10 text-mahogany hover:bg-mahogany hover:text-white rounded-md flex items-center gap-2 font-serif text-sm transition-colors border border-mahogany/30 shadow-sm">
            <ImageIcon size={16} /> Export Image
          </button>
          <button onClick={handleExportPDF} className="px-3 py-1.5 bg-mahogany/10 text-mahogany hover:bg-mahogany hover:text-white rounded-md flex items-center gap-2 font-serif text-sm transition-colors border border-mahogany/30 shadow-sm">
            <FileText size={16} /> Export PDF
          </button>
          <div className="w-px h-8 bg-mahogany/20 mx-1"></div>
          <button onClick={() => navigate(`/review/${id}/edit`)} className="px-3 py-1.5 bg-sage/10 text-sage hover:bg-sage hover:text-white rounded-md flex items-center gap-2 font-serif text-sm transition-colors border border-sage/30 shadow-sm">
            <PenLine size={16} /> Edit
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="px-3 py-1.5 bg-red-50 text-red-800 hover:bg-red-800 hover:text-white rounded-md flex items-center gap-2 font-serif text-sm transition-colors border border-red-200 shadow-sm">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>
      
      <div className="bg-parchment shadow-2xl rounded-xl p-8 relative overflow-hidden flex flex-col border border-mahogany/10"
            style={{ 
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(143, 151, 121, 0.2) 31px, rgba(143, 151, 121, 0.2) 32px)',
              backgroundAttachment: 'local',
              lineHeight: '32px'
            }}>
            
        {/* Top Stripe: Basic Info */}
        <div className="mb-8 flex flex-col md:flex-row items-start gap-8 bg-white/50 p-6 rounded-lg backdrop-blur-sm border border-mahogany/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]">
          <div className="flex flex-col gap-3 flex-shrink-0 w-32">
            {entry.coverImageUrl ? (
              <img src={entry.coverImageUrl} alt="Cover" className="w-32 h-48 object-cover rounded shadow-lg border border-mahogany/20" />
            ) : (
              <div className="w-32 h-48 bg-mahogany/5 flex items-center justify-center rounded shadow-inner border border-mahogany/20 font-serif text-sm text-mahogany/50 text-center p-2">No Cover</div>
            )}
          </div>
          
          <div className="flex-1 w-full space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block font-serif text-mahogany text-sm font-bold tracking-wider uppercase mb-1">Title</label>
                <div className="w-full border-b border-mahogany/40 font-garamond text-3xl text-ink leading-tight pb-1">{entry.title}</div>
              </div>
              <div className="flex-1">
                <label className="block font-serif text-mahogany text-sm font-bold tracking-wider uppercase mb-1">Author</label>
                <div className="w-full border-b border-mahogany/40 font-garamond text-2xl text-ink leading-tight pb-1">{entry.author}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block font-serif text-mahogany text-xs font-bold tracking-wider uppercase mb-1">Publisher</label>
                <div className="w-full border-b border-mahogany/30 font-garamond text-lg text-ink leading-tight min-h-[28px]">{entry.publisher}</div>
              </div>
              <div>
                <label className="block font-serif text-mahogany text-xs font-bold tracking-wider uppercase mb-1">Page Count</label>
                <div className="w-full border-b border-mahogany/30 font-garamond text-lg text-ink leading-tight min-h-[28px]">{entry.pageCount}</div>
              </div>
              <div>
                <label className="block font-serif text-mahogany text-xs font-bold tracking-wider uppercase mb-1">Genre</label>
                <div className="w-full border-b border-mahogany/30 font-garamond text-lg text-ink leading-tight min-h-[28px]">{entry.genre}</div>
              </div>
              <div>
                <label className="block font-serif text-mahogany text-xs font-bold tracking-wider uppercase mb-1">Format</label>
                <div className="w-full border-b border-mahogany/30 font-garamond text-lg text-ink pb-1">{entry.format}</div>
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
                  <div className="w-full border-b border-mahogany/30 font-garamond text-xl text-ink leading-tight min-h-[30px]">{entry.discoveryMethod}</div>
                </div>
                <div>
                  <label className="block font-serif text-mahogany/80 text-xs tracking-wider uppercase mb-1">Where I got this book</label>
                  <div className="w-full border-b border-mahogany/30 font-garamond text-xl text-ink leading-tight min-h-[30px]">{entry.acquisitionSource}</div>
                </div>
                <div>
                  <label className="block font-serif text-mahogany/80 text-xs tracking-wider uppercase mb-1">Where I read this</label>
                  <div className="w-full border-b border-mahogany/30 font-garamond text-xl text-ink leading-tight min-h-[30px]">{entry.readLocation}</div>
                </div>
                <div>
                  <label className="block font-serif text-mahogany/80 text-xs tracking-wider uppercase mb-1">Other books by author</label>
                  <div className="w-full border-b border-mahogany/30 font-garamond text-xl text-ink leading-tight min-h-[30px]">
                    {Array.isArray(entry.otherBooksByAuthor) ? entry.otherBooksByAuthor.join(', ') : entry.otherBooksByAuthor}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 flex-1 flex flex-col">
              <h3 className="font-serif text-mahogany text-xl font-bold border-b-2 border-mahogany/20 pb-2">Detailed Review Notes</h3>
              <div className="flex-1 min-h-[300px]">
                <div className="w-full h-full bg-white/40 border border-mahogany/20 rounded-md p-4 font-garamond text-xl text-ink leading-relaxed shadow-inner min-h-[300px] whitespace-pre-wrap">
                  {entry.detailedReview}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-end border-b-2 border-mahogany/20 pb-2">
                <h3 className="font-serif text-mahogany text-xl font-bold">Favorite Quotes</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entry.favoriteQuotes && entry.favoriteQuotes.length > 0 ? (
                  entry.favoriteQuotes.map((quote, idx) => (
                    <div key={idx} className="flex gap-4 items-start relative bg-white/60 p-4 rounded-md border border-mahogany/10 shadow-sm">
                      <span className="font-serif text-mahogany/30 text-4xl leading-none absolute -left-2 -top-2">"</span>
                      <div className="flex-1 font-garamond italic text-xl text-ink pt-1 z-10 whitespace-pre-wrap break-words">
                        {quote.text}
                      </div>
                      <div className="flex flex-col gap-3 items-end pt-1 flex-shrink-0">
                        <div className="flex items-center gap-1 border-b border-mahogany/30">
                          <span className="font-serif text-xs text-mahogany/70">Pg.</span>
                          <span className="w-10 font-garamond text-center text-lg text-ink">{quote.pageNumber}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center border-2 border-dashed border-mahogany/20 rounded-md bg-white/30 md:col-span-2">
                    <p className="text-mahogany/60 font-garamond italic text-lg">No quotes recorded.</p>
                  </div>
                )}
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
                        <div
                          key={num}
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-garamond font-semibold text-base sm:text-lg transition-all duration-300
                            ${entry[metric.key] === num 
                              ? 'bg-blue-600/90 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] border-2 border-blue-800 scale-110 z-10' 
                              : 'text-ink/30'
                            }`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t-2 border-mahogany/20 space-y-6">
              <div className="flex flex-col gap-2 bg-white/50 p-4 rounded-lg border border-mahogany/10 shadow-sm text-center">
                <span className="font-serif text-mahogany font-bold tracking-wide uppercase text-sm">Overall Rating</span>
                <div className="flex gap-1 justify-center relative inline-block text-4xl select-none">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} className={`relative ${entry.overallRating >= star ? 'text-yellow-500 drop-shadow-md' : 'text-gray-300'}`}>
                      ★
                      {entry.overallRating >= star - 0.5 && entry.overallRating < star && (
                        <span className="absolute top-0 left-0 w-1/2 overflow-hidden text-yellow-500 drop-shadow-md">
                          ★
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between bg-white/50 px-4 py-3 rounded-lg border border-mahogany/10 shadow-sm">
                <label className="font-serif text-mahogany font-bold tracking-wide uppercase text-sm">Recommend?</label>
                <div className="font-garamond text-2xl text-ink font-bold">{entry.recommendation}</div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#f0e6d2] p-8 rounded shadow-2xl max-w-sm w-full border border-mahogany/50 transform rotate-1">
            <h2 className="font-serif text-2xl text-red-900 font-bold mb-4 uppercase tracking-widest border-b-2 border-red-900/20 pb-2">Burn this entry?</h2>
            <p className="font-garamond text-xl text-ink mb-8 leading-relaxed">
              Are you sure you want to remove this journal entry from your library? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 font-serif text-mahogany hover:bg-mahogany/10 rounded transition-colors uppercase text-sm tracking-wider">
                Keep It
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-900 text-parchment hover:bg-red-800 rounded shadow-md font-serif uppercase text-sm tracking-wider transition-colors">
                Yes, Burn It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Export Template container */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
        <ReviewExportTemplate ref={exportRef} review={entry} />
      </div>
    </div>
  );
}
