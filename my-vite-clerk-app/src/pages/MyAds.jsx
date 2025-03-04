import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

function MyAds() {
  const { user } = useUser();
  const [ads, setAds] = useState([]);
  const [error, setError] = useState(null);
  const [editAd, setEditAd] = useState(null);

  useEffect(() => {
    const fetchMyAds = async () => {
      if (!user) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/ads/my-ads?email=${user.primaryEmailAddress?.emailAddress}`
        );
        if (!response.ok) throw new Error('Failed to fetch ads');
        const data = await response.json();
        setAds(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMyAds();
  }, [user]);

  const handleEdit = (ad) => {
    setEditAd({ ...ad });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editAd) return;
  
    const formData = new FormData(e.target);
    formData.append('adId', editAd.id);
    formData.append('userEmail', user.primaryEmailAddress?.emailAddress || '');
    
    // Normalize userPhone to a single string
    const userPhone = Array.isArray(editAd.user_phone) ? editAd.user_phone[0] : editAd.user_phone;
    formData.set('userPhone', userPhone); // Use set() to ensure single value
  
    // Debug FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/ads/update', {
        method: 'PUT',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setAds((prev) => prev.map((ad) => (ad.id === editAd.id ? result.ad : ad)));
      setEditAd(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (adId) => {
    const adToDelete = ads.find((ad) => ad.id === adId);
    if (!adToDelete) return;

    try {
      const response = await fetch('http://localhost:5000/api/ads/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId,
          userEmail: user.primaryEmailAddress?.emailAddress || '',
          userPhone: adToDelete.user_phone, // Use phone from the ad
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setAds((prev) => prev.filter((ad) => ad.id !== adId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">My Ads</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
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
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
              />
            </div>
            <div>
              <label className="block text-white">Description</label>
              <textarea
                name="description"
                defaultValue={editAd.description}
                className="w-full p-2 bg-gray-700 text-white rounded"
              />
            </div>
            <div>
              <label className="block text-white">Price (INR)</label>
              <input
                type="number"
                name="priceInr"
                defaultValue={editAd.price_inr}
                className="w-full p-2 bg-gray-700 text-white rounded"
              />
            </div>
            <div>
              <label className="block text-white">Phone Number</label>
              <input
                type="tel"
                name="userPhone"
                defaultValue={editAd.user_phone}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              />
            </div>
            <div>
              <label className="block text-white">Category</label>
              <select
                name="category"
                defaultValue={editAd.category}
                className="w-full p-2 bg-gray-700 text-white rounded"
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
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditAd(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
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