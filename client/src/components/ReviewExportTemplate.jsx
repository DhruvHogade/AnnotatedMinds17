import React, { forwardRef } from 'react';

const ReviewExportTemplate = forwardRef(({ review }, ref) => {
  if (!review) return null;

  const DARK_GREEN = '#243E36';
  const BG_COLOR = '#FAF5EF';
  const SAGE_GREEN = '#7A8B76';

  return (
    <div 
      ref={ref}
      style={{
        width: '1080px',
        height: '1920px',
        backgroundColor: BG_COLOR,
        fontFamily: '"Playfair Display", serif',
        color: DARK_GREEN,
        position: 'relative',
        padding: '80px 60px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Decorative blobs/leaves can go here if needed, keeping it clean for now */}

      {/* HEADER */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '85px', fontWeight: 'bold', letterSpacing: '2px', margin: 0, lineHeight: 1 }}>
          BOOK REVIEW
        </h1>
        <p style={{ fontSize: '24px', margin: '10px 0 0 0', fontStyle: 'italic' }}>
          Created by @annotated.minds17
        </p>
      </div>

      <div style={{ display: 'flex', gap: '40px', flex: 1 }}>
        
        {/* LEFT COLUMN */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Book Cover */}
          <div style={{ width: '100%', height: '550px', backgroundColor: SAGE_GREEN, border: `2px solid ${DARK_GREEN}`, overflow: 'hidden' }}>
            {review.coverImageUrl && (
              <img src={review.coverImageUrl} alt="Cover" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', gap: '10px', fontSize: '50px', color: DARK_GREEN }}>
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star}>
                {review.overallRating >= star ? '★' : '☆'}
              </span>
            ))}
          </div>

          {/* Emojis Percentage */}
          <div>
            <h3 style={{ fontSize: '28px', fontWeight: 'normal', margin: '0 0 15px 0' }}>Emojis Percentage</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[0, 1, 2, 3, 4, 5, 6].map(i => {
                const stat = review.emojiStats && review.emojiStats[i] ? review.emojiStats[i] : null;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45px' }}>
                    <div style={{ width: '100%', height: '45px', border: `2px solid ${DARK_GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', backgroundColor: 'transparent' }}>
                      {stat ? stat.emoji : ''}
                    </div>
                    <div style={{ fontSize: '16px', marginTop: '5px', borderBottom: `2px solid ${DARK_GREEN}`, width: '100%', textAlign: 'center', paddingBottom: '2px' }}>
                      {stat ? stat.percentage : ''} %
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Favorite Quote */}
          <div style={{ flex: '0 0 250px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '28px', fontWeight: 'normal', margin: '0 0 15px 0' }}>Favorite quote</h3>
            <div style={{ flex: 1, border: `2px solid ${DARK_GREEN}`, padding: '20px', fontSize: '22px', fontStyle: 'italic', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {review.favoriteQuotes && review.favoriteQuotes.length > 0 ? (
                <span style={{ display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  "{review.favoriteQuotes[0].text}"
                </span>
              ) : ''}
            </div>
          </div>

          {/* Pictures that describe the book */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '28px', fontWeight: 'normal', margin: '0 0 15px 0' }}>Pictures that describe the book</h3>
            <div style={{ flex: 1, border: `2px solid ${DARK_GREEN}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ border: `1px solid ${DARK_GREEN}`, overflow: 'hidden' }}>
                  {review.moodboardImages && review.moodboardImages[i] ? (
                    <img src={review.moodboardImages[i]} alt={`Moodboard ${i}`} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Details Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '30px' }}>
            <DetailLine label="Title" value={review.title} />
            <DetailLine label="Author" value={review.author} />
            <DetailLine label="Genre" value={review.genre} />
            <DetailLine label="Pages" value={review.pageCount} />
            <DetailLine label="Star Date" value={review.startDate ? new Date(review.startDate).toLocaleDateString() : ''} />
            <DetailLine label="End Date" value={review.endDate ? new Date(review.endDate).toLocaleDateString() : ''} />
          </div>

          <div style={{ marginBottom: '30px' }}>
             <DetailLine label="Recommend book" value={review.recommendation} />
          </div>

          {/* Review Box */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '28px', fontWeight: 'normal', margin: '0 0 15px 0' }}>Review</h3>
            <div style={{ 
              flex: 1, 
              border: `2px solid ${DARK_GREEN}`, 
              padding: '30px',
              fontSize: '24px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              overflow: 'hidden'
            }}>
              <span style={{ display: '-webkit-box', WebkitLineClamp: 35, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {review.detailedReview}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

// Helper component for the underlined detail rows
function DetailLine({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: '28px' }}>
      <span style={{ width: '220px', flexShrink: 0 }}>{label}</span>
      <span style={{ margin: '0 10px' }}>:</span>
      <div style={{ flex: 1, borderBottom: '2px solid #243E36', minHeight: '35px', paddingBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value || ''}
      </div>
    </div>
  );
}

export default ReviewExportTemplate;
