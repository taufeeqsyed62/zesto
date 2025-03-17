const supabase = require('../config/supabase');

const createReward = async (req, res) => {
  const { userEmail, rewardId, value, adId } = req.body;

  if (!userEmail || !rewardId || !value || !adId) {
    return res.status(400).json({ error: 'userEmail, rewardId, value, and adId are required' });
  }

  const rewardValue = parseFloat(value);
  if (isNaN(rewardValue)) {
    return res.status(400).json({ error: 'Reward value must be a valid number' });
  }

  try {
    const { data, error } = await supabase
      .from('rewards')
      .insert([
        {
          user_email: userEmail,
          reward_id: rewardId,
          value: rewardValue,
          ad_id: adId,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Supabase Insert Error (createReward):', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Reward created', reward: data[0] });
  } catch (err) {
    console.error('Unexpected Error (createReward):', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserRewards = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false }); // Optional: sort by creation date

    if (error) {
      console.error('Supabase Query Error (getUserRewards):', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data); // Return the array of rewards
  } catch (err) {
    console.error('Unexpected Error (getUserRewards):', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createReward, getUserRewards };