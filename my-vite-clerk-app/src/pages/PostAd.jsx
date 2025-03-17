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
  const [phoneError, setPhoneError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [rewardPopup, setRewardPopup] = useState(null);

  const categories = ['Books', 'Electronics', 'Sports', 'Clothing & Fashion'];

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    if (value.length !== 10 || !/^\d{10}$/.test(value)) {
      setPhoneError('Phone number must be 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const generateReward = (adId) => {
    const value = Math.floor(Math.random() * (20 - 5 + 1)) + 5; // Random 5–20 INR
    const rewardId = `${adId}`; // Use adId as the rewardId for simplicity
    return { value, rewardId };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !priceInr || !phoneNumber || !category) {
      setError('Title, price, phone number, and category are required');
      return;
    }

    if (phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
      setError('Phone number must be 10 digits');
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowPopup(false);
    setRewardPopup(null);

    const formData = new FormData();
    formData.append('userEmail', user.primaryEmailAddress?.emailAddress || '');
    formData.append('userPhone', phoneNumber);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('priceInr', priceInr);
    formData.append('category', category);
    formData.append('showPhone', showPhone.toString());
    if (image) formData.append('image', image);

    const submitAd = async (retryCount = 3, delayMs = 1000) => {
      try {
        // Post the ad
        const adResponse = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/ads/create`, {
          method: 'POST',
          body: formData,
        });
        const adResult = await adResponse.json();
        if (!adResponse.ok) throw new Error(adResult.error || 'Failed to post ad');
    
        // Generate and save reward only on creation
        const { value, rewardId } = generateReward(adResult.ad.id); // Ensure ad.id is the correct field from your backend
        const rewardResponse = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/rewards/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: user.primaryEmailAddress?.emailAddress,
            rewardId,
            value,
            adId: adResult.ad.id, // Ensure this matches the backend response
          }),
        });
        if (!rewardResponse.ok) {
          const rewardResult = await rewardResponse.json();
          throw new Error(rewardResult.error || 'Failed to save reward');
        }
    
        setRewardPopup({ value, rewardId });
        setIsLoading(false);
      } catch (err) {
        if (retryCount > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          return submitAd(retryCount - 1, delayMs);
        } else {
          setError(err.message);
          setShowPopup(true);
          setIsLoading(false);
        }
      }
    };

    submitAd();
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
          <label className="block text-white mb-1 text-sm font-medium">
            <span className="flex items-center">Show Phone Number</span>
            <span className="block text-xs text-gray-300 mt-1">(Set visible for better reach)</span>
          </label>
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

      {/* Popup for failure */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <p className="text-white mb-4">Please try using some other image</p>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Congratulatory Popup for Reward */}
      {rewardPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold text-white mb-4">Congratulations!</h2>
            <p className="text-white mb-4">
              You’ve earned a reward card worth <span className="font-bold">₹{rewardPopup.value}</span>!<br />
              Reward ID: <span className="font-mono">{rewardPopup.rewardId}</span>
            </p>
            <p className="text-gray-300 mb-4">Please go to the Rewards page to claim it.</p>
            <button
              onClick={() => {
                setRewardPopup(null);
                navigate('/rewards');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Go to Rewards
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostAd;