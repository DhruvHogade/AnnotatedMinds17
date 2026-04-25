import React from 'react';
import { ShoppingCart } from 'lucide-react';

export default function Wishlist() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <h1 className="text-4xl font-bold text-mahogany flex items-center gap-3">
        <ShoppingCart className="text-sage" size={32} />
        To-Buy & Wishlist
      </h1>
      
      <div className="card text-center py-16">
        <p className="text-sage font-serif italic text-xl">The wishlist feature is currently being curated.</p>
        <p className="mt-4 text-ink/70">Soon, you'll be able to track books you want to purchase and manage your book-buying budget here.</p>
      </div>
    </div>
  );
}
