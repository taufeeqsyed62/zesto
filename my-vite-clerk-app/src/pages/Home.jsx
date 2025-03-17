import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import image from '../assets/img.jpg';
import image2 from '../assets/img1.jpg';

function Home() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSaleGuideOpen, setIsSaleGuideOpen] = useState(false);
  const [isBuyGuideOpen, setIsBuyGuideOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // State for popup visibility

  const categories = ['All', 'Books', 'Electronics', 'Sports', 'Clothing & Fashion'];

  useEffect(() => {
    // Check if it's the user's first visit
    const hasVisited = localStorage.getItem('hasVisitedHome');
    if (!hasVisited) {
      setShowPopup(true); // Show popup if first visit
      localStorage.setItem('hasVisitedHome', 'true'); // Mark as visited
    }

    const fetchActiveAds = async (retryCount = 5, delayMs = 1000) => {
      setLoading(true);
      setError(null);

      const attemptFetch = async () => {
        try {
          let url = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/ads/active`;
          if (selectedCategory !== 'All') {
            url += `?category=${encodeURIComponent(selectedCategory)}`;
          }
          const response = await fetch(url);
          if (!response.ok) throw new Error('Failed to fetch ads');
          const data = await response.json();
          setAds(data);
          setLoading(false);
        } catch (err) {
          if (retryCount > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            return attemptFetch(retryCount - 1);
          } else {
            setError(err.message);
            setLoading(false);
          }
        }
      };

      attemptFetch();
    };

    fetchActiveAds();
  }, [selectedCategory]);

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setError(null);
  };

  const truncateDescription = (desc) => {
    if (!desc) return 'No description available.';
    const words = desc.split(' ');
    if (words.length <= 50) return desc;
    return words.slice(0, 50).join(' ') + '....';
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              Sell Your Old Items!
            </h2>
            <p className="text-gray-300 mb-6">
              Get a <span className="font-semibold text-blue-400">guaranteed OAC Cash Card</span> worth up to{' '}
              <span className="text-xl font-bold text-blue-400">₹500*</span>!
            </p>
            <button
              onClick={closePopup}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {/* Dropdown Buttons */}
        <div className="w-full bg-[#1F2937] shadow-md flex flex-col sm:flex-row">
          {/* How to Sale Button */}
          <div className="w-full sm:w-1/2">
            <button
              onClick={() => setIsSaleGuideOpen(!isSaleGuideOpen)}
              className="w-full py-3 text-white text-lg font-semibold hover:bg-gray-700 transition duration-300 focus:outline-none flex items-center justify-center gap-2"
            >
              HOW TO SELL
              <ChevronDownIcon
                className={`h-5 w-5 transition-transform duration-300 ${isSaleGuideOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isSaleGuideOpen && (
              <div className="w-full bg-gray-800 p-2">
                <img
                  src={image}
                  alt="How to Sale Guide"
                  className="w-full max-w-[800px] h-auto mx-auto object-contain md:max-h-[2000px] sm:max-h-[1000px] max-h-[600px]"
                />
              </div>
            )}
          </div>

          {/* How to Buy Button */}
          <div className="w-full sm:w-1/2">
            <button
              onClick={() => setIsBuyGuideOpen(!isBuyGuideOpen)}
              className="w-full py-3 text-white text-lg font-semibold hover:bg-gray-700 transition duration-300 focus:outline-none flex items-center justify-center gap-2"
            >
              HOW TO BUY
              <ChevronDownIcon
                className={`h-5 w-5 transition-transform duration-300 ${isBuyGuideOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isBuyGuideOpen && (
              <div className="w-full bg-gray-800 p-2">
                <img
                  src={image2}
                  alt="How to Buy Guide"
                  className="w-full max-w-[800px] h-auto mx-auto object-contain md:max-h-[2000px] sm:max-h-[1000px] max-h-[600px]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                  selectedCategory === category
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <svg
                className="animate-spin h-10 w-10 text-blue-600"
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
            </div>
          ) : (
            <>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              {ads.length === 0 && !error && (
                <p className="text-gray-400">
                  No active ads available{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}.
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="max-w-sm bg-gray-800 border border-gray-700 rounded-lg shadow-sm"
                  >
                    <Link to={`/ad-detail/${ad.id}`}>
                      <div className="relative w-full h-48 bg-gray-700 rounded-t-lg overflow-hidden">
                        <img
                          className="w-full h-full object-contain"
                          src={ad.image_url || 'https://via.placeholder.com/150'}
                          alt={ad.title}
                        />
                      </div>
                    </Link>
                    <div className="p-5">
                      <p className="mb-1 text-white">
                        <span className="text-2xl font-bold">₹{ad.price_inr}</span>
                      </p>
                      <Link to={`/ad-detail/${ad.id}`}>
                        <h5 className="text-xl mb-1 font-bold tracking-tight text-white">
                          {ad.title}
                        </h5>
                      </Link>
                      <p className="mb-3 font-bold text-gray-400">
                        {truncateDescription(ad.description)}
                      </p>
                      <Link
                        to={`/ad-detail/${ad.id}`}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800"
                      >
                        View Detail
                        <svg
                          className="rtl:rotate-180 w-3.5 h-3.5 ml-2"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 14 10"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M1 5h12m0 0L9 1m4 4L9 9"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      {user && (
        <Link
          to="/post-ad"
          className="fixed bottom-9 right-4 bg-blue-600 text-white px-8 py-4 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 z-50 text-base font-medium"
          aria-label="Sell an Item"
        >
          Sell an Item
        </Link>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 rounded-lg shadow-sm m-4">
        <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
          <span className="text-sm text-gray-400 sm:text-center">
            © {new Date().getFullYear()}{' '}
            <a href="/" className="hover:underline">
              Zesto™
            </a>
            . All Rights Reserved.
          </span>
          <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-400 sm:mt-0">
            <li>
              <a href="/my-ads" className="hover:underline me-4 md:me-6">
                My Ads
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:underline">
                Contact Us
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default Home;