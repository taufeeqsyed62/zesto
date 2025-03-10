import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

function PostAd() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceInr, setPriceInr] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [showPhone, setShowPhone] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState(''); // Track phone number validation

  const categories = ['Books', 'Electronics', 'Sports', 'Clothing & Fashion'];

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    if (value.length !== 10) {
      setPhoneError('Phone number must be 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !priceInr || !phoneNumber || !category) {
      setError('Title, price, phone number, and category are required');
      return;
    }

    if (phoneNumber.length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('userEmail', user.primaryEmailAddress?.emailAddress || '');
    formData.append('userPhone', phoneNumber);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('priceInr', priceInr);
    formData.append('category', category);
    formData.append('showPhone', showPhone.toString());
    if (image) formData.append('image', image);

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/ads/create`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      navigate('/my-ads');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Post a New Ad</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-white mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-white mb-1">Price (INR) *</label>
          <input
            type="number"
            value={priceInr}
            onChange={(e) => setPriceInr(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-white mb-1">Phone Number *</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
            required
            disabled={isLoading}
          />
          {phoneError && <p className="mt-1 text-sm text-red-500">{phoneError}</p>}
        </div>
        <div>
          <label className="block text-white mb-1">Show Phone Number</label>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showPhone}
              onChange={() => setShowPhone(!showPhone)}
              className="sr-only peer"
              disabled={isLoading}
            />
            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-white">
              {showPhone ? 'Visible' : 'Hidden'}
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-400">
            {showPhone ? 'Buyers can view your phone number' : 'Your phone number is not visible'}
          </p>
        </div>
        <div>
          <label className="block text-white mb-1">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
            required
            disabled={isLoading}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-white mb-1">Image</label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full p-2 bg-gray-700 text-white rounded"
            accept="image/*"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center disabled:bg-blue-400"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h-8z"
                ></path>
              </svg>
              Posting...
            </>
          ) : (
            'Post Ad'
          )}
        </button>
      </form>
    </div>
  );
}

export default PostAd;