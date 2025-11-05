import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Project from '../models/Project';
import Board from '../models/Board';
import Task from '../models/Task';
import Comment from '../models/Comment';
import Attachment from '../models/Attachment';

dotenv.config();

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env['MONGODB_URI'] || 'mongodb://localhost:27017/flowboard');
    console.log('Connected to MongoDB');

    // Ensure indexes are created (Mongoose does this automatically, but we can be explicit)
    await User.createIndexes();
    await Project.createIndexes();
    await Board.createIndexes();
    await Task.createIndexes();
    await Comment.createIndexes();
    await Attachment.createIndexes();
    
    console.log('✅ Database indexes created successfully');

    // Optional: Create a default admin user
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const adminUser = new User({
        username: 'admin',
        email: 'admin@flowboard.com',
        password: 'admin123', // Will be hashed automatically
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Default admin user created');
    }

    console.log('🎉 Database initialization completed!');
    console.log('\nYour collections are ready:');
    console.log('- users');
    console.log('- projects');
    console.log('- boards');
    console.log('- tasks');
    console.log('- comments');
    console.log('- attachments');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the initialization
initializeDatabase();