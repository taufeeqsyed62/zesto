import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

function Chat() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Added for page load

  const queryParams = new URLSearchParams(location.search);
  const requestIdFromUrl = queryParams.get('requestId');

  useEffect(() => {
    const fetchRequests = async (retryCount = 5, delayMs = 1000) => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const attemptFetch = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/chat/requests?email=${encodeURIComponent(
              user.primaryEmailAddress?.emailAddress
            )}&phone=${encodeURIComponent(user.primaryPhoneNumber?.phoneNumber || '')}`
          );
          if (!response.ok) throw new Error('Failed to fetch chat requests');
          const data = await response.json();

          const enrichedData = await Promise.all(
            data.map(async (req) => {
              try {
                const adResponse = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/ads/${req.ad_id}`);
                if (!adResponse.ok) throw new Error(`Failed to fetch ad ${req.ad_id}`);
                const adData = await adResponse.json();
                return {
                  ...req,
                  ad_title: adData.title || 'Unknown Title',
                  ad_description: adData.description || 'No description available',
                };
              } catch (adErr) {
                console.error(`Error fetching ad ${req.ad_id}:`, adErr.message);
                return {
                  ...req,
                  ad_title: 'Error Loading Title',
                  ad_description: 'Error loading description',
                };
              }
            })
          );

          setRequests(enrichedData);

          if (requestIdFromUrl) {
            const matchingRequest = enrichedData.find((req) => req.id === requestIdFromUrl);
            if (matchingRequest) {
              setSelectedRequest(matchingRequest);
            } else {
              console.warn(`No matching request found for requestId: ${requestIdFromUrl}`);
            }
          }

          setLoading(false);
        } catch (err) {
          if (retryCount > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            return attemptFetch(retryCount - 1);
          } else {
            console.error('Error in fetchRequests after retries:', err.message);
            setError(err.message);
            setLoading(false);
          }
        }
      };

      attemptFetch();
    };

    fetchRequests();
  }, [user, requestIdFromUrl]);

  const handleRequestAction = async (requestId, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/chat/request/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          status,
          sellerEmail: user?.primaryEmailAddress?.emailAddress || null,
          sellerPhone: user?.primaryPhoneNumber?.phoneNumber || null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update request');
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status } : req))
      );
      setSelectedRequest((prev) => (prev?.id === requestId ? { ...prev, status } : prev));
    } catch (err) {
      console.error('Error in handleRequestAction:', err.message);
      setError(err.message);
    }
  };

  const isSeller = (request) =>
    request?.seller_email === user?.primaryEmailAddress?.emailAddress ||
    request?.seller_phone === user?.primaryPhoneNumber?.phoneNumber;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600 hover:bg-yellow-500';
      case 'accepted':
        return 'bg-green-600 hover:bg-green-500';
      case 'declined':
        return 'bg-red-600 hover:bg-red-500';
      default:
        return 'bg-gray-700 hover:bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <svg
          className="animate-spin h-10 w-10 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="md:flex md:gap-6">
        <div
          className={`w-full md:w-1/3 bg-gray-800 p-4 rounded-lg h-auto md:h-96 overflow-y-auto ${
            selectedRequest ? 'hidden md:block' : 'block'
          }`}
        >
          <h2 className="text-xl font-bold text-white mb-4">Chat Requests</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {requests.length === 0 && !error && <p className="text-gray-400">No requests yet.</p>}
          {requests.map((req) => (
            <div
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              className={`p-2 mb-2 rounded-lg cursor-pointer ${getStatusColor(req.status)} ${
                selectedRequest?.id === req.id ? 'ring-2 ring-blue-400' : ''
              }`}
            >
              <p className="text-white font-semibold text-sm">{req.ad_title}</p>
              <p className="text-gray-300 text-xs truncate">{req.ad_description}</p>
              <p className="text-xs text-gray-200">Status: {req.status}</p>
            </div>
          ))}
        </div>

        <div
          className={`w-full md:w-2/3 mt-4 md:mt-0 ${selectedRequest ? 'block' : 'hidden md:block'}`}
        >
          <div className="flex items-center mb-4">
            {selectedRequest && (
              <button
                onClick={() => setSelectedRequest(null)}
                className="md:hidden flex items-center text-white hover:text-blue-400 mr-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-xl md:text-2xl font-bold text-white">Chat Requests</h1>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {selectedRequest ? (
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-white mb-2 font-semibold text-sm md:text-base">{selectedRequest.ad_title}</p>
              <p className="text-gray-400 mb-2 text-sm md:text-base">{selectedRequest.ad_description}</p>
              <p className="text-white mb-2 text-sm md:text-base">
                <span className="font-semibold">Status:</span> {selectedRequest.status}
              </p>
              {isSeller(selectedRequest) && selectedRequest.status === 'pending' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequestAction(selectedRequest.id, 'accepted')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 md:px-4 md:py-2 rounded text-sm md:text-base"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequestAction(selectedRequest.id, 'declined')}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 md:px-4 md:py-2 rounded text-sm md:text-base"
                  >
                    Decline
                  </button>
                </div>
              ) : selectedRequest.status === 'accepted' ? (
                <div>
                  {isSeller(selectedRequest) ? (
                    <>
                      <p className="text-white mb-2 text-sm md:text-base">
                        <span className="font-semibold">Buyer Phone:</span> {selectedRequest.buyer_phone || 'Not provided'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-white mb-2 text-sm md:text-base">
                        <span className="font-semibold">Seller Phone:</span> {selectedRequest.seller_phone || 'Not provided'}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm md:text-base">Request {selectedRequest.status}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm md:text-base">Select a request to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;