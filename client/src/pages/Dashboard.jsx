import React, { useEffect, useState } from 'react';
import { BookOpen, Flame, Calendar, Target, Quote, Star, LayoutDashboard, Layers, Plus, Calendar as CalendarIcon, AlignLeft, User } from 'lucide-react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingBookId, setEditingBookId] = useState(null);
  const [editPages, setEditPages] = useState('');
  const [editTotalPages, setEditTotalPages] = useState('');
  const readingGoal = stats?.goals?.yearlyBookGoal || 24;
  const currentStreak = stats?.goals?.currentStreak || 0;

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/api/dashboard/stats', { headers });
      if (res.ok) {
        const statsData = await res.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePages = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          progress: {
            readPages: Number(editPages),
            totalPages: Number(editTotalPages)
          }
        })
      });
      if (res.ok) {
        setEditingBookId(null);
        setEditPages('');
        setEditTotalPages('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (bookId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchData();
        if (newStatus === 'Finished') {
          if (window.confirm("You've finished the story! Would you like to write your journal entry now?")) {
            const checkRes = await fetch(`/api/books/check-review/${bookId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              if (checkData.exists) {
                navigate(`/review/${checkData.reviewId}/edit`);
              } else {
                navigate(`/reviews?bookId=${bookId}`);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const currentlyReading = stats?.readingNow || [];

  const today = new Date();
  const shiftDate = (date, numDays) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
  };

  const WidgetHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 bg-[#FAF8F5] border border-black/5 px-3 py-1.5 rounded-md w-max mb-4 shadow-sm">
      <Icon size={14} className="text-mahogany" />
      <h2 className="text-[11px] font-semibold tracking-wider text-ink font-serif uppercase">{title}</h2>
    </div>
  );

  const openUpdateModal = (book) => {
    setEditingBookId(book._id);
    setEditPages(book.progress.readPages);
    setEditTotalPages(book.progress.totalPages);
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

  return (
    <div className="relative min-h-screen bg-[#F5E6CA] pb-12 w-[900px] mx-auto mt-4 px-12 pt-8 font-sans bg-[url('/parchment-texture.png')] bg-cover">

      {/* Decorative Assets */}
      <img src="/assets/vintage_desk_lamp.png" alt="Lamp" className="absolute top-[20px] -right-[30px] w-32 mix-blend-multiply z-50 pointer-events-none drop-shadow-2xl" />
      <img src="/assets/3d_coffee_cup.png" alt="Coffee" className="absolute top-[400px] right-[10px] w-24 mix-blend-multiply z-50 pointer-events-none drop-shadow-xl" />
      <img src="/assets/open_book.png" alt="Open Book" className="absolute bottom-[200px] -left-[40px] w-28 mix-blend-multiply z-50 pointer-events-none rotate-12 drop-shadow-lg" />
      <img src="/assets/fountain_pen.png" alt="Pen" className="absolute bottom-[30px] right-[0px] w-28 mix-blend-multiply z-50 pointer-events-none -rotate-12 drop-shadow-md" />

      {/* Header Image */}
      <div className="w-full h-44 overflow-hidden rounded-md mb-6 border-4 border-white shadow-md relative group">
        <div className="absolute inset-0 bg-mahogany/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
        <img src="/assets/header_illustration.png" alt="Reading Space" className="w-full h-full object-cover" />
      </div>

      {/* Header Text */}
      <div className="text-center mb-8 relative z-20 flex justify-center items-center gap-8">
        <h1 className="text-[36px] leading-[1.2] font-serif text-mahogany inline-block border-b-2 border-mahogany/20 pb-2">
          Reading Space <span className="text-sage mx-2">|</span> Annotated.Minds17
        </h1>
        {currentStreak > 0 && (
          <div className="flex items-center gap-2 bg-sienna/10 px-4 py-2 rounded-full border border-sienna/20">
            <Flame size={20} className="text-sienna fill-sienna" />
            <span className="font-serif font-bold text-sienna">{currentStreak} Day Streak!</span>
          </div>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6 relative z-10">

        {/* ROW 1 */}
        {/* CURRENTLY READING */}
        <section className="col-span-8 bg-[#FDFCF8] border border-[#E5E0D8] rounded-md shadow-sm p-5 relative overflow-hidden">
          <WidgetHeader icon={BookOpen} title="CURRENTLY READING" />

          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {currentlyReading.length > 0 ? (
              currentlyReading.slice(0, 3).map(book => (
                <div key={book._id} className="min-w-[200px] relative">
                  <BookCard
                    book={book}
                    onUpdate={() => openUpdateModal(book)}
                    onEdit={() => navigate('/library')}
                    onDelete={() => handleDelete(book._id)}
                  />
                  {editingBookId === book._id && (
                    <div className="absolute inset-x-0 bottom-0 mb-4 bg-white border border-sage/30 shadow-2xl rounded-lg p-3 z-50 flex flex-col gap-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-mahogany uppercase">Update Progress</span>
                        <button onClick={() => setEditingBookId(null)} className="text-ink/40">×</button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={editPages}
                          onChange={(e) => setEditPages(e.target.value)}
                          className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none"
                          placeholder="Page"
                          autoFocus
                        />
                        <input
                          type="number"
                          value={editTotalPages}
                          onChange={(e) => setEditTotalPages(e.target.value)}
                          className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none"
                          placeholder="Total"
                        />
                      </div>
                      <button
                        onClick={() => handleUpdatePages(book._id)}
                        className="bg-mahogany text-white text-[10px] py-1.5 rounded font-bold"
                      >
                        Save Progress
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="w-full text-center text-ink/50 font-serif italic py-8">No books currently on your nightstand.</div>
            )}
          </div>
        </section>

        {/* READING GOALS */}
        <section className="col-span-4 bg-[#FDFCF8] border border-[#E5E0D8] rounded-md shadow-sm p-5 flex flex-col items-center justify-center">
          <WidgetHeader icon={Target} title="YEARLY GOAL" />
          <p className="text-[13px] font-serif italic text-ink/70 mb-4 text-center">Books Finished in 2024</p>
          <div className="w-[160px] h-[160px] relative">
            <CircularProgressbarWithChildren
              value={stats ? stats.booksFinished : 0}
              maxValue={readingGoal}
              strokeWidth={7}
              styles={buildStyles({
                pathColor: '#4A0E17', // Mahogany
                trailColor: '#EBE7E2',
                strokeLinecap: 'round'
              })}
            >
              <div className="flex flex-col items-center justify-center mt-2">
                <span className="text-[32px] font-serif font-bold text-ink tracking-tight drop-shadow-sm">
                  {stats ? stats.booksFinished : 0}
                </span>
                <div className="w-8 h-[1px] bg-mahogany/30 my-1"></div>
                <span className="text-[14px] font-medium text-ink/60 tracking-wider">
                  {readingGoal}
                </span>
              </div>
            </CircularProgressbarWithChildren>
          </div>
        </section>

        {/* ROW 2 */}
        {/* MONTHLY READING LOG */}
        <section className="col-span-8 bg-[#FDFCF8] border border-[#E5E0D8] rounded-md shadow-sm p-5">
          <WidgetHeader icon={BookOpen} title="RECENT REVIEWS LOG" />

          <div className="overflow-hidden mt-2 border border-ink/20 rounded-sm hand-inked-border">
            <table className="w-full text-left border-collapse text-[12px] font-sans">
              <thead>
                <tr className="bg-sage/10 text-ink border-b border-ink/20 font-serif">
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Book Title</th>
                  <th className="py-3 px-4 font-semibold">Rating</th>
                  <th className="py-3 px-4 font-semibold">Rec</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {stats?.recentLogs?.length > 0 ? (
                  stats.recentLogs.map((log, idx) => (
                    <tr
                      key={log._id || idx}
                      onClick={() => navigate(`/review/${log._id}`)}
                      className="text-ink hover:bg-mahogany/5 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-medium text-ink/70">
                        {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold line-clamp-1 group-hover:text-mahogany transition-colors">{log.title}</div>
                        <div className="text-[10px] text-ink/60 font-serif italic mt-0.5">{log.author}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-[2px]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} className={i < (log.overallRating || 0) ? "text-[#D4AF37] fill-[#D4AF37] drop-shadow-sm" : "text-gray-200"} />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {log.recommendation === 'Yes' ? (
                          <span className="bg-sage/20 text-sage px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase">Yes</span>
                        ) : log.recommendation === 'No' ? (
                          <span className="bg-mahogany/10 text-mahogany px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase">No</span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-ink/50 font-serif italic">No recent reviews logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ACTIVITY HEATMAP */}
        <section className="col-span-4 bg-[#FDFCF8] border border-[#E5E0D8] rounded-md shadow-sm p-5 flex flex-col">
          <WidgetHeader icon={Flame} title="ACTIVITY TRACKER" />
          <p className="text-[11px] text-ink/60 mb-6 font-medium uppercase tracking-tighter">Your ink footprint</p>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full sepia-heatmap" style={{ transform: 'scale(1.1)', transformOrigin: 'center' }}>
              <CalendarHeatmap
                startDate={shiftDate(today, -90)}
                endDate={today}
                values={stats?.activityMap || []}
                classForValue={(value) => {
                  if (!value) return 'color-empty';
                  if (value.count >= 4) return `color-scale-4`;
                  return `color-scale-${value.count}`;
                }}
                showWeekdayLabels={false}
                showMonthLabels={true}
              />
            </div>
          </div>
        </section>

        {/* BUCKET LIST / WISHLIST */}
        <section className="col-span-4 bg-[#FDFCF8] border border-[#E5E0D8] rounded-md shadow-sm p-5 flex flex-col h-[400px]">
          <WidgetHeader icon={Star} title="THE BUCKET LIST" />
          <p className="text-[11px] font-serif italic text-ink/70 mb-4">Books calling your name...</p>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {stats?.bucketList?.length > 0 ? (
              stats.bucketList.map(item => (
                <div key={item._id} className="flex gap-3 items-start group">
                  <div className="w-8 h-12 bg-mahogany/5 border border-mahogany/20 rounded flex items-center justify-center shrink-0 overflow-hidden">
                    {(item.coverImage || item.coverImg) ? (
                      <img src={item.coverImage || item.coverImg} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <Star size={12} className="text-mahogany/20" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-ink leading-tight truncate group-hover:text-mahogany transition-colors">{item.title}</p>
                    <p className="text-[10px] text-ink/60 truncate italic">{item.author}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-30 grayscale">
                <Star size={32} className="mb-2" />
                <p className="text-[11px] font-serif italic">Your bucket is empty...</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/goals')}
            className="mt-4 w-full py-2 bg-mahogany/5 text-mahogany text-[10px] font-bold uppercase tracking-widest rounded border border-mahogany/10 hover:bg-mahogany/10 transition-colors"
          >
            Manage List
          </button>
        </section>

        {/* ROW 3 */}
        {/* FAVORITE QUOTES */}
        <section className="col-span-12 bg-[#FDFCF8] border border-[#E5E0D8] rounded-md shadow-sm p-6">
          <WidgetHeader icon={Quote} title="QUOTES ARCHIVE" />
          <div className="grid grid-cols-2 gap-6 mt-4">
            {stats?.favoriteQuotes?.slice(0, 2).map((quote, idx) => (
              <div key={idx} className="relative p-6 border-l-4 border-mahogany bg-[#F5E6CA]/30 rounded-r-md group hover:bg-[#F5E6CA]/50 transition-colors">
                <Quote className="absolute top-2 left-2 text-mahogany/10 rotate-180" size={48} />
                <p className="text-ink font-handwriting text-lg leading-relaxed mb-4 relative z-10 italic ink-blue-text">
                  "{quote.text}"
                </p>
                <div className="flex justify-end items-center gap-2 relative z-10">
                  <div className="h-[1px] w-8 bg-ink/30"></div>
                  <p className="text-ink text-[12px] font-medium font-sans tracking-wide uppercase">
                    {quote.author} <span className="text-ink/50 ml-1">({quote.bookTitle})</span>
                  </p>
                </div>
              </div>
            ))}
            {(!stats?.favoriteQuotes || stats.favoriteQuotes.length === 0) && (
              <div className="col-span-2 text-center text-ink/50 font-serif italic py-4">
                No quotes saved yet. Add some from your reviews!
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
