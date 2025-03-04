const supabase = require('../config/supabase');

const sendChatRequest = async (req, res) => {
  const { buyerEmail, buyerPhone, adId } = req.body;

  if ((!buyerEmail && !buyerPhone) || !adId) {
    return res.status(400).json({ error: 'Missing buyer identifier or ad ID' });
  }

  const { data: adData, error: adError } = await supabase
    .from('product_ads')
    .select('user_email, user_phone')
    .eq('id', adId)
    .single();

  if (adError || !adData) {
    return res.status(404).json({ error: 'Ad not found' });
  }

  const sellerEmail = adData.user_email;
  const sellerPhone = adData.user_phone;

  if (!sellerEmail && !sellerPhone) {
    return res.status(400).json({ error: 'Seller has no contact info' });
  }

  const { data, error } = await supabase
    .from('chat_requests')
    .insert([
      {
        ad_id: adId,
        buyer_email: buyerEmail || null,
        buyer_phone: buyerPhone || null,
        seller_email: sellerEmail || null,
        seller_phone: sellerPhone || null,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Request sent', requestId: data.id });
};

const updateChatRequest = async (req, res) => {
  const { requestId, status, sellerEmail, sellerPhone } = req.body;

  if (!requestId || !status || (!sellerEmail && !sellerPhone)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const { data, error } = await supabase
    .from('chat_requests')
    .update({ status })
    .eq('id', requestId)
    .or(`seller_email.eq.${sellerEmail},seller_phone.eq.${sellerPhone}`)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: `Request ${status}`, request: data });
};

const getUserRequests = async (req, res) => {
  const { email, phone } = req.query;

  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone required' });
  }

  const { data, error } = await supabase
    .from('chat_requests')
    .select('id, ad_id, buyer_email, buyer_phone, seller_email, seller_phone, status, created_at')
    .or(`buyer_email.eq.${email},buyer_phone.eq.${phone},seller_email.eq.${email},seller_phone.eq.${phone}`);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
};

module.exports = {
  sendChatRequest,
  updateChatRequest,
  getUserRequests,
};