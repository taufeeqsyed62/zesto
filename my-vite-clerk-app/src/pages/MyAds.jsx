import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

function MyAds() {
  const { user } = useUser();
  const [ads, setAds] = useState([]);
  const [error, setError] = useState(null);
  const [editAd, setEditAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null); // Track which ad is being deleted

  useEffect(() => {
    const fetchMyAds = async (retryCount = 3, delayMs = 1000) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      const attemptFetch = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/ads/my-ads?email=${user.primaryEmailAddress?.emailAddress}`
          );
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

    fetchMyAds();
  }, [user]);

  const handleEdit = (ad) => {
    setEditAd({
      ...ad,
      showPhone: ad.show_phone,
      userPhone: Array.isArray(ad.user_phone) ? ad.user_phone[0] : ad.user_phone,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editAd) return;

    setIsUpdating(true);
    setError(null);

    const formData = new FormData(e.target);
    formData.append('adId', editAd.id);
    formData.append('userEmail', user.primaryEmailAddress?.emailAddress || '');
    formData.append('showPhone', editAd.showPhone.toString());
    formData.set('userPhone', editAd.userPhone);

    const updateAd = async (retryCount = 3, delayMs = 1000) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/ads/update`, {
          method: 'PUT',
          body: formData,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to update ad');
        setAds((prev) => prev.map((ad) => (ad.id === editAd.id ? result.ad : ad)));
        setEditAd(null);
        setIsUpdating(false);
      } catch (err) {
        if (retryCount > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          return updateAd(retryCount - 1, delayMs);
        } else {
          setError(err.message);
          setIsUpdating(false);
        }
      }
    };

    updateAd();
  };

  const handleDelete = async (adId) => {
    const adToDelete = ads.find((ad) => ad.id === adId);
    if (!adToDelete) return;

    const confirmed = window.confirm('Do you want to confirm delete?');
    if (!confirmed) return;

    setIsDeleting(adId); // Set loading state for this ad
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/ads/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId,
          userEmail: user.primaryEmailAddress?.emailAddress || '',
          userPhone: adToDelete.user_phone,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete ad');
      setAds((prev) => prev.filter((ad) => ad.id !== adId));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(null); // Reset loading state
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">My Ads</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <div className="flex justify-center items-center h-64">
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
      ) : (
        <>
          {ads.length === 0 && !error && <p className="text-gray-400">No ads found.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="max-w-sm bg-gray-800 border border-gray-700 rounded-lg shadow-sm"
              >
                <img
                  className="rounded-t-lg w-full h-48 object-cover"
                  src={ad.image_url || 'https://via.placeholder.com/150'}
                  alt={ad.title}
                />
                <div className="p-5">
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">{ad.title}</h5>
                  <p className="mb-3 font-normal text-gray-400">
                    {ad.description || 'No description available.'}
                  </p>
                  <p className="mb-3 text-white">
                    <span className="font-semibold">Price:</span> ₹{ad.price_inr}
                  </p>
                  <p className="mb-3 text-white">
                    <span className="font-semibold">Category:</span> {ad.category}
                  </p>
                  <p className="mb-3 text-white">
                    <span className="font-semibold">Phone:</span> {ad.user_phone}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                      disabled={isDeleting === ad.id}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-400"
                      disabled={isDeleting === ad.id}
                    >
                      {isDeleting === ad.id ? (
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
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {editAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form onSubmit={handleUpdate} className="bg-gray-800 p-6 rounded-lg space-y-4 w-96">
            <h2 className="text-xl font-bold text-white">Edit Ad</h2>
            <div>
              <label className="block text-white">Title</label>
              <input
                type="text"
                name="title"
                defaultValue={editAd.title}
                className="w-full p-2 bg-gray-700 text-white rounded"
                disabled={isUpdating}
              />
            </div>
            <div>
              <label className="block text-white">Description</label>
              <textarea
                name="description"
                defaultValue={editAd.description}
                className="w-full p-2 bg-gray-700 text-white rounded"
                disabled={isUpdating}
              />
            </div>
            <div>
              <label className="block text-white">Price (INR)</label>
              <input
                type="number"
                name="priceInr"
                defaultValue={editAd.price_inr}
                className="w-full p-2 bg-gray-700 text-white rounded"
                disabled={isUpdating}
              />
            </div>
            <div>
              <label className="block text-white">Phone Number</label>
              <input
                type="tel"
                name="userPhone"
                value={editAd.userPhone}
                onChange={(e) => setEditAd({ ...editAd, userPhone: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
                disabled={isUpdating}
              />
            </div>
            <div>
              <label className="block text-white">Show Phone Number</label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editAd.showPhone}
                  onChange={() => setEditAd({ ...editAd, showPhone: !editAd.showPhone })}
                  className="sr-only peer"
                  disabled={isUpdating}
                />
                <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-white">
                  {editAd.showPhone ? 'Visible' : 'Hidden'}
                </span>
              </label>
              <p className="mt-1 text-sm text-gray-400">
                {editAd.showPhone ? 'Buyers can view your phone number' : 'Your phone number is not visible'}
              </p>
            </div>
            <div>
              <label className="block text-white">Category</label>
              <select
                name="category"
                defaultValue={editAd.category}
                className="w-full p-2 bg-gray-700 text-white rounded"
                disabled={isUpdating}
              >
                <option value="Books">Books</option>
                <option value="Electronics">Electronics</option>
                <option value="Sports">Sports</option>
                <option value="Clothing and Fashion">Clothing and Fashion</option>
              </select>
            </div>
            <div>
              <label className="block text-white">Image</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="w-full p-2 bg-gray-700 text-white rounded"
                disabled={isUpdating}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center disabled:bg-blue-400"
                disabled={isUpdating}
              >
                {isUpdating ? (
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
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
              <button
                type="button"
                onClick={() => setEditAd(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                disabled={isUpdating}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default MyAds;