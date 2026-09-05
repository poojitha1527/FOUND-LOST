const mongoose = require('mongoose');
require('dotenv').config();

const Item = require('./models/Item');
const User = require('./models/User');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-lost-found');
    console.log('MongoDB connected');

    // Clear existing data
    await Item.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const user1 = new User({
      name: 'Alex Johnson',
      email: 'alex@campus.edu',
      password: 'password123',
      phone: '555-0101',
      isAdmin: false
    });
    await user1.save();

    const user2 = new User({
      name: 'Jordan Smith',
      email: 'jordan@campus.edu',
      password: 'password123',
      phone: '555-0102',
      isAdmin: false
    });
    await user2.save();

    console.log('Users created');

    // Create sample items
    const items = [
      {
        type: 'lost',
        title: 'Black Sony Headphones',
        description: 'Over-ear black Sony headphones with blue accents. Last working condition, slight scratch on left ear.',
        category: 'electronics',
        location: 'Library, 2nd floor',
        date: new Date('2024-01-10'),
        contact: 'alex@campus.edu',
        status: 'open',
        userId: user1._id,
        userEmail: user1.email
      },
      {
        type: 'found',
        title: 'Red Water Bottle',
        description: 'YETI red water bottle with stainless steel cap. Found with name "Sarah" on it.',
        category: 'bottle',
        location: 'Student Center Cafe',
        date: new Date('2024-01-12'),
        contact: 'jordan@campus.edu',
        status: 'open',
        userId: user2._id,
        userEmail: user2.email
      },
      {
        type: 'lost',
        title: 'Student ID Card',
        description: 'Campus ID card for Spring semester. Has my photo with brown hair.',
        category: 'id',
        location: 'Gym locker room',
        date: new Date('2024-01-08'),
        contact: 'alex@campus.edu',
        status: 'resolved'
      },
      {
        type: 'found',
        title: 'Set of Keys',
        description: 'Silver keys on blue keychain. One key has "APT 405" written on it.',
        category: 'keys',
        location: 'Science Building entrance',
        date: new Date('2024-01-11'),
        contact: 'jordan@campus.edu',
        status: 'open',
        userId: user2._id
      },
      {
        type: 'lost',
        title: 'Economics Textbook',
        description: 'Microeconomics 101 textbook, 5th edition. Has my notes inside.',
        category: 'books',
        location: 'Dining hall',
        date: new Date('2024-01-09'),
        contact: 'alex@campus.edu',
        status: 'open'
      },
      {
        type: 'found',
        title: 'Black Backpack',
        description: 'North Face black backpack with multiple pockets. Found in library study area.',
        category: 'bag',
        location: 'Central Library',
        date: new Date('2024-01-13'),
        contact: 'jordan@campus.edu',
        status: 'open',
        userId: user2._id
      }
    ];

    const createdItems = await Item.insertMany(items);
    console.log(`${createdItems.length} items created`);

    console.log('✅ Seed data loaded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
