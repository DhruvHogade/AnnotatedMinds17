import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import ReviewSystem from './pages/ReviewSystem';
import Wishlist from './pages/Wishlist';
import SeriesTracker from './pages/SeriesTracker';
import Login from './pages/Login';
import Register from './pages/Register';
import JournalEntryView from './pages/JournalEntryView';
import SettingsPage from './pages/Settings';
import QuotesArchive from './pages/QuotesArchive';
import ReadingStrategy from './pages/ReadingStrategy';
import ReviewGallery from './pages/ReviewGallery';

function App() {
  const isAuthenticated = true; // Auth temporarily removed

  return (
    <Router>
      <div className="min-h-screen bg-contentBg text-textDark font-sans flex">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/reviews" element={<ReviewGallery />} />
            <Route path="/reviews/new" element={<ReviewSystem />} />
            <Route path="/review/:id" element={<JournalEntryView />} />
            <Route path="/review/:id/edit" element={<ReviewSystem />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/series" element={<SeriesTracker />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/quotes" element={<QuotesArchive />} />
            <Route path="/goals" element={<ReadingStrategy />} />
            <Route path="*" element={<Navigate to="/library" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
