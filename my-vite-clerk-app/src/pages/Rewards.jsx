import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

function Rewards() {
  const { user } = useUser();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRewards, setExpandedRewards] = useState({});

  useEffect(() => {
    const fetchRewards = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/rewards?email=${encodeURIComponent(
            user.primaryEmailAddress?.emailAddress
          )}`
        );
        if (!response.ok) throw new Error('Failed to fetch rewards');
        const data = await response.json();
        setRewards(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRewards();
  }, [user]);

  const toggleDetails = (rewardId) => {
    setExpandedRewards((prev) => ({
      ...prev,
      [rewardId]: !prev[rewardId],
    }));
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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Your Rewards</h1>

      {/* Redemption Steps Card */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">How to Redeem Your Rewards</h2>
        <ol className="list-decimal list-inside text-gray-300 space-y-2">
          <li>Earn cash cards by selling items.</li>
          <li>
            Submit all your cards on <span className="font-bold">5th April</span>. A link will be shared via email.
          </li>
          <li>Visit the OAC and redeem your money.</li>
        </ol>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {rewards.length === 0 && !error ? (
        <p className="text-gray-400">You have no rewards yet. Post an ad to earn one!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {rewards.map((reward) => (
            <div
              key={reward.reward_id}
              className="bg-gray-800 border border-gray-700 rounded-lg shadow-sm p-4"
            >
              <h2 className="text-xl font-bold text-white mb-2">Reward Card</h2>
              <p className="text-3xl font-extrabold text-blue-400 mb-4">
                ₹{reward.value} <span className="text-sm text-gray-300">INR</span>
              </p>
              {expandedRewards[reward.reward_id] && (
                <div className="text-gray-300 mb-2">
                  <p>
                    <span className="font-semibold">Reward ID:</span>{' '}
                    <span className="font-mono">{reward.reward_id}</span>
                  </p>
                  <p className="text-gray-400 text-sm">
                    Earned for Ad ID: {reward.ad_id}
                  </p>
                </div>
              )}
              <button
                onClick={() => toggleDetails(reward.reward_id)}
                className="text-blue-500 hover:text-blue-400 text-sm font-medium mt-2 focus:outline-none"
              >
                {expandedRewards[reward.reward_id] ? 'Less' : 'More'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Rewards;