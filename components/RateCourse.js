import { useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import { apiPost } from '../lib/api';


const RateCourse = ({ c_id }) => {
  const [isDivVisible, setIsDivVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const toggleDivVisibility = () => {
    setIsDivVisible(!isDivVisible);
  };

  const submitRating = async () => {
    let u_id = secureLocalStorage.getItem('u_id');
    const data = { u_id, c_id, rating, review };
    await apiPost('/api/rate_course', data);
    setIsDivVisible(false);
  };

  return (
    <div>
      <div className='flex items-center justify-center'>
        <button onClick={toggleDivVisibility} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Rate the Course
        </button>
      </div>

      {isDivVisible && (
        <div className="mt-4 p-4 bg-gray-200 rounded relative">
          <p>Rate the course:</p>
          <div className="flex items-center mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <label key={star} className="cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={star}
                  onChange={(event) => setRating(event.target.value)}
                />
                <span className="ml-1">★</span>
              </label>
            ))}
          </div>
          <textarea
            className="mt-2 p-2 w-full border rounded"
            placeholder="Write a review..."
            value={review}
            onChange={(event) => setReview(event.target.value)}
          ></textarea>
          <button
            onClick={submitRating}
            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default RateCourse;
