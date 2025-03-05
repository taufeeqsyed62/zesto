import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

function AdDetail() {
  const { adId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [ad, setAd] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buyerPhone, setBuyerPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    const fetchAdDetail = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/ads/${adId}`);
        if (!response.ok) throw new Error('Failed to fetch ad details');
        const data = await response.json();
        setAd(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAdDetail();
  }, [adId]);

  const handleContactSellerClick = () => {
    if (!user) return;
    setIsModalOpen(true);
  };

  const handlePhoneSubmit = async () => {
    if (buyerPhone.length !== 10 || !/^\d{10}$/.test(buyerPhone)) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/chat/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerEmail: user.primaryEmailAddress?.emailAddress,
          buyerPhone,
          adId,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setIsModalOpen(false);
      setBuyerPhone('');
      setPhoneError('');
      navigate(`/chat?requestId=${result.requestId}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!ad) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Ad Details</h1>
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
        <div className="relative w-full h-96 bg-gray-700 rounded-t-lg overflow-hidden">
          <img
            className="w-full h-full object-contain"
            src={ad.image_url || 'https://via.placeholder.com/150'}
            alt={ad.title}
          />
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">{ad.title}</h2>
          <p className="text-gray-400 mb-4">{ad.description || 'No description available.'}</p>
          <p className="text-white mb-2">
            <span className="font-semibold">Price:</span> ₹{ad.price_inr}
          </p>
          <p className="text-white mb-2">
            <span className="font-semibold">Category:</span> {ad.category}
          </p>
          <p className="text-white mb-2">
            <span className="font-semibold">Contact Number:</span>{' '}
            {ad.show_phone ? (
              <span className="text-xl font-bold">{ad.user_phone}</span>
            ) : (
              '(Not Provided by Seller) Request for Chat'
            )}
          </p>
          <p className="text-white mb-2">
            <span className="font-semibold">Posted On:</span>{' '}
            {new Date(ad.created_at).toLocaleDateString()}
          </p>
          <p className="text-white mb-4">
            <span className="font-semibold">Expires On:</span>{' '}
            {new Date(ad.expires_at).toLocaleDateString()}
          </p>
          {ad.show_phone ? (
            <a
              href={`tel:${ad.user_phone}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-800"
            >
              Call Now
              <svg
                className="rtl:rotate-180 w-3.5 h-3.5 ml-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                />
              </svg>
            </a>
          ) : (
            <button
              onClick={handleContactSellerClick}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800"
            >
              Request Chat
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
            </button>
          )}
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold text-white mb-4">
              Enter Your Phone Number <br /> To send chat request to seller ..
            </h2>
            <input
              type="tel"
              value={buyerPhone}
              onChange={(e) => {
                setBuyerPhone(e.target.value);
                setPhoneError(
                  e.target.value.length === 10 && /^\d{10}$/.test(e.target.value)
                    ? ''
                    : 'Phone number must be exactly 10 digits'
                );
              }}
              className="w-full p-2 bg-gray-700 text-white rounded mb-2"
              placeholder="Enter 10-digit phone number"
              maxLength={10}
            />
            {phoneError && <p className="text-red-500 text-sm mb-2">{phoneError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handlePhoneSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                disabled={phoneError || !buyerPhone}
              >
                Submit
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setBuyerPhone('');
                  setPhoneError('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdDetail;