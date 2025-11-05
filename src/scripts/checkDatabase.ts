import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Project from '../models/Project';
import Board from '../models/Board';
import Task from '../models/Task';
import Comment from '../models/Comment';

dotenv.config();

const checkDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env['MONGODB_URI'] || 'mongodb://localhost:27017/flowboard');
    console.log('Connected to MongoDB');

    // Check collections
    console.log('\n📊 Database Status:');
    
    const userCount = await User.countDocuments();
    console.log(`👥 Users: ${userCount}`);
    
    const projectCount = await Project.countDocuments();
    console.log(`📂 Projects: ${projectCount}`);
    
    const boardCount = await Board.countDocuments();
    console.log(`📋 Boards: ${boardCount}`);
    
    const taskCount = await Task.countDocuments();
    console.log(`📝 Tasks: ${taskCount}`);
    
    const commentCount = await Comment.countDocuments();
    console.log(`💬 Comments: ${commentCount}`);

    // Sample data check
    console.log('\n🔍 Sample Data:');
    
    const sampleUser = await User.findOne({}, 'username email role');
    console.log(`Sample User: ${sampleUser?.username} (${sampleUser?.email}) - ${sampleUser?.role}`);
    
    const sampleProject = await Project.findOne({}, 'name description color')
      .populate('createdBy', 'username')
      .populate('members', 'username');
    console.log(`Sample Project: ${sampleProject?.name}`);
    console.log(`  Description: ${sampleProject?.description}`);
    console.log(`  Created by: ${(sampleProject?.createdBy as any)?.username}`);
    console.log(`  Members: ${sampleProject?.members.length}`);
    
    const sampleTask = await Task.findOne({}, 'title status priority assignee')
      .populate('assignee', 'username');
    console.log(`Sample Task: ${sampleTask?.title}`);
    console.log(`  Priority: ${sampleTask?.priority}`);
    console.log(`  Priority: ${sampleTask?.priority}`);
    console.log(`  Assigned to: ${(sampleTask?.assignee as any)?.username}`);

    console.log('\n✅ Database verification complete!');

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the check
checkDatabase();