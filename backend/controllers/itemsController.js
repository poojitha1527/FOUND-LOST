const Item = require('../models/Item');
const compressImage = require('../utils/imageProcessor');

exports.getItems = async (req, res) => {
  try {
    const { status = 'open', category, type, search, limit = 20, skip = 0, sort = '-createdAt' } = req.query;
    
    let query = {};
    
    if (status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (type && type !== 'all') query.type = type;
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const items = await Item.find(query)
      .select('-__v')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Item.countDocuments(query);
    
    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findOne({ id: req.params.id }).select('-__v');
    
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    // Increment views
    item.views += 1;
    await item.save();
    
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { type, title, category, date, location, description, contact } = req.body;
    
    if (!type || !title || !contact) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    let photoData = null;
    if (req.file) {
      try {
        photoData = await compressImage(req.file.buffer);
      } catch (err) {
        console.error('Image compression failed:', err);
        return res.status(400).json({ success: false, error: 'Could not process image' });
      }
    }
    
    const item = new Item({
      type,
      title,
      category: category || 'other',
      date: date || new Date(),
      location,
      description,
      contact,
      photo: photoData,
      createdAt: Date.now()
    });
    
    await item.save();
    
    res.status(201).json({
      success: true,
      message: 'Item posted successfully',
      data: item
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Don't allow updating certain fields
    delete updates.id;
    delete updates.createdAt;
    delete updates.__v;
    
    const item = await Item.findOneAndUpdate(
      { id },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markResolved = async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { id: req.params.id },
      { status: 'resolved' },
      { new: true }
    );
    
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    res.json({ success: true, message: 'Item marked as resolved', data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addClaim = async (req, res) => {
  try {
    const { contact, message } = req.body;
    const item = await Item.findOne({ id: req.params.id });
    
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    item.claims.push({
      timestamp: Date.now(),
      message: message || '',
      contact
    });
    
    await item.save();
    
    res.json({ success: true, message: 'Claim added', data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      Item.countDocuments({ type: 'lost', status: 'open' }),
      Item.countDocuments({ type: 'found', status: 'open' }),
      Item.countDocuments({ status: 'resolved' }),
      Item.countDocuments({})
    ]);
    
    res.json({
      success: true,
      data: {
        lostOpen: stats[0],
        foundOpen: stats[1],
        resolved: stats[2],
        total: stats[3]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
