import React from 'react';
import { Layers } from 'lucide-react';

export default function SeriesTracker() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <h1 className="text-4xl font-bold text-mahogany flex items-center gap-3">
        <Layers className="text-sage" size={32} />
        Series Tracker
      </h1>
      
      <div className="card text-center py-16">
        <p className="text-sage font-serif italic text-xl">The series tracker is under construction.</p>
        <p className="mt-4 text-ink/70">Visually track your progress through epic fantasy, sci-fi, and other book series.</p>
      </div>
    </div>
  );
}
