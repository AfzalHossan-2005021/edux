import { useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import { apiPost } from '../lib/api';
import { Button } from './ui';

const Star = ({ filled, onMouseEnter, onMouseLeave, onClick, label }) => (
  <button
    type="button"
    className={`text-2xl transition-transform duration-150 ${filled ? 'text-yellow-400 scale-110' : 'text-gray-300 hover:text-yellow-300 hover:scale-105'}`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
    aria-label={label}
  >
    {filled ? '★' : '☆'}
  </button>
);

const RateCourse = ({ c_id, onSubmitted }) => {
  const [isDivVisible, setIsDivVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const toggleDivVisibility = () => {
    setIsDivVisible(!isDivVisible);
    setMessage(null);
    setError(null);
  };

  const handleStarClick = (value) => {
    setRating(value);
    setError(null);
  };

  const submitRating = async () => {
    if (rating === 0) {
      setError('Please select a rating before submitting.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const u_id = secureLocalStorage.getItem('u_id');
      const data = { u_id, c_id, rating, review };
      const res = await apiPost('/api/rate_course', data);
      if (res && res.ok === false) {
        throw new Error(res.message || 'Failed to submit rating');
      }
      setMessage('Thanks! Your rating was submitted.');
      setRating(0);
      setReview('');
      setTimeout(() => setMessage(null), 3000);
      setIsDivVisible(false);
      if (typeof onSubmitted === 'function') onSubmitted();
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className='flex items-center justify-center'>
        <Button variant="primary" size="md" onClick={toggleDivVisibility}>
          {isDivVisible ? 'Close' : 'Rate the Course'}
        </Button>
      </div>

      {isDivVisible && (
        <div className="mt-4 p-4 bg-white border rounded shadow relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Rate the course</p>
              <p className="text-sm text-gray-500">Tap a star to select</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600" onClick={toggleDivVisibility} aria-label="Close">
              ×
            </button>
          </div>

          <div className="flex items-center mt-3 space-x-2">
            {[1,2,3,4,5].map((star) => (
              <Star
                key={star}
                filled={hoverRating ? star <= hoverRating : star <= rating}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleStarClick(star)}
                label={`${star} star${star>1?'s':''}`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">{rating ? `${rating}/5` : 'No rating'}</span>
          </div>

          <textarea
            className="mt-3 p-2 w-full border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Write a short review (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
          />

          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
          {message && <div className="mt-2 text-sm text-green-600">{message}</div>}

          <div className="mt-3 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => { setRating(0); setReview(''); setError(null); }}>
              Reset
            </Button>
            <div className="ml-2">
              <Button variant="primary" size="md" onClick={submitRating} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default RateCourse;
