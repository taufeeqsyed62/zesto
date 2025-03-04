const supabase = require('../config/supabase');
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const createAd = async (req, res) => {
  const { userEmail, userPhone, title, description, priceInr, category, showPhone } = req.body;
  const imageFile = req.file;

  if (!title || !priceInr || !userPhone || !category) {
    return res.status(400).json({ error: 'Title, price, phone number, and category are required' });
  }

  if (Array.isArray(userPhone)) {
    return res.status(400).json({ error: 'Phone number must be a single string, not an array' });
  }

  const price = parseFloat(priceInr);
  if (isNaN(price)) {
    return res.status(400).json({ error: 'Price must be a valid number' });
  }

  let imageUrl = null;
  if (imageFile) {
    const fileName = `${Date.now()}-${imageFile.originalname}`;
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile.buffer, {
        contentType: imageFile.mimetype,
      });

    if (error) {
      console.error('Image Upload Error (createAd):', error);
      return res.status(500).json({ error: 'Image upload failed: ' + error.message });
    }

    const { data: publicData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    imageUrl = publicData.publicUrl;
  }

  const { data, error } = await supabase
    .from('product_ads')
    .insert([
      {
        user_email: userEmail || null,
        user_phone: userPhone,
        title,
        description: description || null,
        price_inr: price,
        category,
        image_url: imageUrl,
        show_phone: showPhone === 'true', // Convert string to boolean
      },
    ])
    .select();

  if (error) {
    console.error('Supabase Insert Error (createAd):', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Ad created', ad: data[0] });
};

const getActiveAds = async (req, res) => {
  const { category } = req.query;

  let query = supabase
    .from('product_ads')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase Query Error (getActiveAds):', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
};

const getUserAds = async (req, res) => {
  const { email, phone } = req.query;

  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone required' });
  }

  const { data, error } = await supabase
    .from('product_ads')
    .select('*')
    .or(`user_email.eq.${email},user_phone.eq.${phone}`);

  if (error) {
    console.error('Supabase Query Error (getUserAds):', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
};

const updateAd = async (req, res) => {
  const { adId, userEmail, userPhone, title, description, priceInr, category, showPhone } = req.body;
  const imageFile = req.file;

  console.log('Update Request Body:', { adId, userEmail, userPhone, title, description, priceInr, category, showPhone });
  console.log('Image File:', imageFile);

  if (!adId || !userPhone) {
    return res.status(400).json({ error: 'Ad ID and phone number are required' });
  }

  if (Array.isArray(userPhone)) {
    return res.status(400).json({ error: 'Phone number must be a single string, not an array' });
  }

  const price = priceInr ? parseFloat(priceInr) : undefined;
  if (priceInr && isNaN(price)) {
    return res.status(400).json({ error: 'Price must be a valid number' });
  }

  let imageUrl = null;
  if (imageFile) {
    const fileName = `${Date.now()}-${imageFile.originalname}`;
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile.buffer, {
        contentType: imageFile.mimetype,
      });

    if (error) {
      console.error('Image Upload Error (updateAd):', error);
      return res.status(500).json({ error: 'Image upload failed: ' + error.message });
    }

    const { data: publicData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    imageUrl = publicData.publicUrl;
  }

  const updateData = {
    title: title || undefined,
    description: description || undefined,
    price_inr: price,
    user_phone: userPhone,
    category: category || undefined,
    image_url: imageUrl || undefined,
    show_phone: showPhone === 'true', // Convert string to boolean
  };

  console.log('Update Data:', updateData);

  const { data, error } = await supabase
    .from('product_ads')
    .update(updateData)
    .eq('id', adId)
    .select()
    .single();

  if (error) {
    console.error('Supabase Update Error (updateAd):', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: 'Ad updated', ad: data });
};

const deleteAd = async (req, res) => {
  const { adId, userEmail, userPhone } = req.body;

  if (!adId || !userPhone) {
    return res.status(400).json({ error: 'Ad ID and phone number are required' });
  }

  if (Array.isArray(userPhone)) {
    return res.status(400).json({ error: 'Phone number must be a single string, not an array' });
  }

  const { data, error } = await supabase
    .from('product_ads')
    .delete()
    .eq('id', adId)
    .or(`user_email.eq.${userEmail},user_phone.eq.${userPhone}`)
    .select()
    .single();

  if (error) {
    console.error('Supabase Delete Error (deleteAd):', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: 'Ad deleted', ad: data });
};

const getAdDetail = async (req, res) => {
  const { adId } = req.params;

  if (!adId) {
    return res.status(400).json({ error: 'Ad ID required' });
  }

  const { data, error } = await supabase
    .from('product_ads')
    .select('*')
    .eq('id', adId)
    .single();

  if (error || !data) {
    console.error('Supabase Query Error (getAdDetail):', error);
    return res.status(404).json({ error: 'Ad not found' });
  }

  res.status(200).json(data);
};

module.exports = {
  createAd: [upload.single('image'), createAd],
  getActiveAds,
  getUserAds,
  updateAd: [upload.single('image'), updateAd],
  deleteAd,
  getAdDetail,
};