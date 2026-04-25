import { useState } from 'react';
import axios from 'axios';

export function useBookSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const searchBook = async (title, author) => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, this might hit our backend proxy, e.g., /api/books/search?title=...
      const response = await axios.get(`http://localhost:5000/api/books/search?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`);
      setResult(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { searchBook, loading, error, result };
}
