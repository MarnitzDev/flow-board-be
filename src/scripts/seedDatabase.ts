import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Project from '../models/Project';
import Board from '../models/Board';
import Task from '../models/Task';
import Comment from '../models/Comment';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env['MONGODB_URI'] || 'mongodb://localhost:27017/flowboard');
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️ Clearing existing data...');
    await Comment.deleteMany({});
    await Task.deleteMany({});
    await Board.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    
    console.log('✅ Existing data cleared');

    // Create Users
    console.log('👥 Creating users...');
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@flowboard.com',
      password: 'admin123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    });

    const johnUser = await User.create({
      username: 'john_doe',
      email: 'john@flowboard.com',
      password: 'password123',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    });

    const janeUser = await User.create({
      username: 'jane_smith',
      email: 'jane@flowboard.com',
      password: 'password123',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    });

    const mikeUser = await User.create({
      username: 'mike_wilson',
      email: 'mike@flowboard.com',
      password: 'password123',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
    });

    const sarahUser = await User.create({
      username: 'sarah_jones',
      email: 'sarah@flowboard.com',
      password: 'password123',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    });

    console.log('✅ Created 5 users');

    // Create Projects
    console.log('📂 Creating projects...');
    const websiteProject = await Project.create({
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design and improved UX',
      color: '#3B82F6',
      createdBy: adminUser._id,
      members: [adminUser._id, johnUser._id, janeUser._id]
    });

    const mobileProject = await Project.create({
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android platforms',
      color: '#10B981',
      createdBy: johnUser._id,
      members: [johnUser._id, janeUser._id, mikeUser._id, sarahUser._id]
    });

    const marketingProject = await Project.create({
      name: 'Marketing Campaign Q1',
      description: 'Digital marketing campaign for the first quarter targeting new customers',
      color: '#F59E0B',
      createdBy: janeUser._id,
      members: [janeUser._id, mikeUser._id, sarahUser._id]
    });

    console.log('✅ Created 3 projects');

    // Create Boards
    console.log('📋 Creating boards...');
    const websiteBoard = await Board.create({
      name: `${websiteProject.name} Board`,
      projectId: websiteProject._id,
      columns: [
        { name: 'Backlog', color: '#6B7280', order: 0, taskIds: [] },
        { name: 'To Do', color: '#EF4444', order: 1, taskIds: [] },
        { name: 'In Progress', color: '#F59E0B', order: 2, taskIds: [] },
        { name: 'Review', color: '#3B82F6', order: 3, taskIds: [] },
        { name: 'Done', color: '#10B981', order: 4, taskIds: [] }
      ]
    });

    const mobileBoard = await Board.create({
      name: `${mobileProject.name} Board`,
      projectId: mobileProject._id,
      columns: [
        { name: 'Backlog', color: '#6B7280', order: 0, taskIds: [] },
        { name: 'To Do', color: '#EF4444', order: 1, taskIds: [] },
        { name: 'In Progress', color: '#F59E0B', order: 2, taskIds: [] },
        { name: 'Review', color: '#3B82F6', order: 3, taskIds: [] },
        { name: 'Done', color: '#10B981', order: 4, taskIds: [] }
      ]
    });

    const marketingBoard = await Board.create({
      name: `${marketingProject.name} Board`,
      projectId: marketingProject._id,
      columns: [
        { name: 'Backlog', color: '#6B7280', order: 0, taskIds: [] },
        { name: 'To Do', color: '#EF4444', order: 1, taskIds: [] },
        { name: 'In Progress', color: '#F59E0B', order: 2, taskIds: [] },
        { name: 'Review', color: '#3B82F6', order: 3, taskIds: [] },
        { name: 'Done', color: '#10B981', order: 4, taskIds: [] }
      ]
    });

    console.log('✅ Created 3 boards');

    // Create Sample Tasks
    console.log('📝 Creating tasks...');
    
    const task1 = await Task.create({
      title: 'Design Homepage Mockups',
      description: 'Create wireframes and high-fidelity mockups for the new homepage design',
      status: 'done',
      priority: 'high',
      assignee: janeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id, // Done column
      labels: [
        { name: 'Design', color: '#8B5CF6' },
        { name: 'High Priority', color: '#EF4444' }
      ],
      dueDate: new Date('2025-11-15'),
      subtasks: [
        { title: 'Research competitor websites', completed: true },
        { title: 'Create wireframes', completed: true },
        { title: 'Design high-fidelity mockups', completed: true }
      ],
      timeTracked: 480
    });

    const task2 = await Task.create({
      title: 'Implement Responsive Navigation',
      description: 'Code the responsive navigation menu with mobile-first approach',
      status: 'in-progress',
      priority: 'high',
      assignee: johnUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[2]?._id, // In Progress column
      labels: [
        { name: 'Development', color: '#10B981' },
        { name: 'Frontend', color: '#3B82F6' }
      ],
      dueDate: new Date('2025-11-20'),
      subtasks: [
        { title: 'Set up HTML structure', completed: true },
        { title: 'Style desktop navigation', completed: true },
        { title: 'Implement mobile menu', completed: false },
        { title: 'Add animations', completed: false }
      ],
      timeTracked: 360
    });

    const task3 = await Task.create({
      title: 'Setup React Native Project',
      description: 'Initialize React Native project with navigation and state management',
      status: 'done',
      priority: 'high',
      assignee: mikeUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[4]?._id, // Done column
      labels: [
        { name: 'Setup', color: '#6B7280' },
        { name: 'React Native', color: '#61DAFB' }
      ],
      dueDate: new Date('2025-11-10'),
      subtasks: [
        { title: 'Install React Native CLI', completed: true },
        { title: 'Setup navigation', completed: true },
        { title: 'Configure Redux', completed: true }
      ],
      timeTracked: 240
    });

    const task4 = await Task.create({
      title: 'Social Media Content Calendar',
      description: 'Plan and schedule social media posts for Q1 campaign',
      status: 'in-progress',
      priority: 'medium',
      assignee: sarahUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[2]?._id, // In Progress column
      labels: [
        { name: 'Social Media', color: '#3B82F6' },
        { name: 'Content', color: '#F59E0B' }
      ],
      dueDate: new Date('2025-11-28'),
      subtasks: [
        { title: 'Research trending hashtags', completed: true },
        { title: 'Create content templates', completed: false },
        { title: 'Schedule posts', completed: false }
      ],
      timeTracked: 120
    });

    console.log('✅ Created 4 tasks');

    // Update board columns with task IDs
    if (websiteBoard.columns[4] && task1._id) {
      websiteBoard.columns[4].taskIds.push(task1._id as any);
    }
    if (websiteBoard.columns[2] && task2._id) {
      websiteBoard.columns[2].taskIds.push(task2._id as any);
    }
    if (mobileBoard.columns[4] && task3._id) {
      mobileBoard.columns[4].taskIds.push(task3._id as any);
    }
    if (marketingBoard.columns[2] && task4._id) {
      marketingBoard.columns[2].taskIds.push(task4._id as any);
    }

    await websiteBoard.save();
    await mobileBoard.save();
    await marketingBoard.save();

    // Create Comments
    console.log('💬 Creating comments...');
    await Comment.create({
      content: 'Great work on the design! The color scheme looks modern and professional.',
      author: adminUser._id,
      taskId: task1._id,
      mentions: [janeUser._id]
    });

    await Comment.create({
      content: 'The navigation is coming along well. Should we add a search functionality?',
      author: janeUser._id,
      taskId: task2._id,
      mentions: [johnUser._id]
    });

    await Comment.create({
      content: 'The setup is complete. Ready to start working on the core features.',
      author: mikeUser._id,
      taskId: task3._id,
      mentions: [johnUser._id]
    });

    console.log('✅ Created 3 comments');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Seeded Data Summary:');
    console.log('- 5 users (including admin)');
    console.log('- 3 projects');
    console.log('- 3 boards with 5 columns each');
    console.log('- 4 tasks with various statuses');
    console.log('- 3 comments');

    console.log('\n🔐 Test Credentials:');
    console.log('Admin: admin@flowboard.com / admin123');
    console.log('User: john@flowboard.com / password123');
    console.log('User: jane@flowboard.com / password123');
    console.log('User: mike@flowboard.com / password123');
    console.log('User: sarah@flowboard.com / password123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeder
seedDatabase();