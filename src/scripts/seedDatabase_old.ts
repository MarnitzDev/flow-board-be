import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Project from '../models/Project';
import Board from '../models/Board';
import Task from '../models/Task';
import Comment from '../models/Comment';
import Collection from '../models/Collection';

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
    await Collection.deleteMany({});
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
        { name: 'Design Queue', color: '#6B7280', order: 0, taskIds: [] },
        { name: 'Ready for Dev', color: '#8B5CF6', order: 1, taskIds: [] },
        { name: 'Development', color: '#F59E0B', order: 2, taskIds: [] },
        { name: 'Testing', color: '#3B82F6', order: 3, taskIds: [] },
        { name: 'Live', color: '#10B981', order: 4, taskIds: [] }
      ]
    });

    const mobileBoard = await Board.create({
      name: `${mobileProject.name} Board`,
      projectId: mobileProject._id,
      columns: [
        { name: 'Feature Requests', color: '#6B7280', order: 0, taskIds: [] },
        { name: 'Sprint Ready', color: '#EC4899', order: 1, taskIds: [] },
        { name: 'Active Sprint', color: '#F59E0B', order: 2, taskIds: [] },
        { name: 'QA Testing', color: '#06B6D4', order: 3, taskIds: [] },
        { name: 'App Store', color: '#10B981', order: 4, taskIds: [] }
      ]
    });

    const marketingBoard = await Board.create({
      name: `${marketingProject.name} Board`,
      projectId: marketingProject._id,
      columns: [
        { name: 'Ideas', color: '#6B7280', order: 0, taskIds: [] },
        { name: 'Planning', color: '#F59E0B', order: 1, taskIds: [] },
        { name: 'Creating', color: '#8B5CF6', order: 2, taskIds: [] },
        { name: 'Review & Approve', color: '#3B82F6', order: 3, taskIds: [] },
        { name: 'Published', color: '#10B981', order: 4, taskIds: [] }
      ]
    });

    console.log('✅ Created 3 boards');

    // Create Collections/Epics
    console.log('🗂️ Creating collections/epics...');
    
    // Website Project Collection
    const websiteCollection = await Collection.create({
      name: 'Website Development',
      description: 'Complete website development from design to deployment',
      color: '#3B82F6',
      projectId: websiteProject._id,
      createdBy: adminUser._id,
      order: 0
    });

    // Mobile Project Collection
    const mobileCollection = await Collection.create({
      name: 'Mobile App Features',
      description: 'Core mobile application features and functionality',
      color: '#10B981',
      projectId: mobileProject._id,
      createdBy: johnUser._id,
      order: 0
    });

    // Marketing Project Collection
    const marketingCollection = await Collection.create({
      name: 'Marketing Campaign',
      description: 'Q1 digital marketing campaign execution',
      color: '#F59E0B',
      projectId: marketingProject._id,
      createdBy: janeUser._id,
      order: 0
    });

    console.log('✅ Created 3 collections/epics');

    // Create Sample Tasks with Subtasks
    console.log('📝 Creating tasks with subtasks...');
    
    // Website Project Tasks (5 tasks)
    const homepageTask = await Task.create({
      title: 'Design Homepage Layout',
      description: 'Create modern homepage design with hero section, features, and testimonials',
      status: 'done',
      priority: 'high',
      assignee: janeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id, // Live column
      collectionId: websiteCollection._id,
      labels: [{ name: 'Design', color: '#8B5CF6' }],
      dueDate: new Date('2025-11-15'),
      order: 0,
      timeTracked: 480
    });

    const navigationTask = await Task.create({
      title: 'Build Responsive Navigation',
      description: 'Implement mobile-first navigation with smooth animations',
      status: 'in-progress',
      priority: 'high',
      assignee: johnUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[2]?._id, // Development column
      collectionId: websiteCollection._id,
      labels: [{ name: 'Frontend', color: '#3B82F6' }],
      dueDate: new Date('2025-11-20'),
      order: 1,
      timeTracked: 300
    });

    const authAPITask = await Task.create({
      title: 'User Authentication API',
      description: 'Build secure JWT-based authentication system',
      status: 'testing',
      priority: 'high',
      assignee: mikeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[3]?._id, // Testing column
      collectionId: websiteCollection._id,
      labels: [{ name: 'Backend', color: '#10B981' }],
      dueDate: new Date('2025-11-18'),
      order: 2,
      timeTracked: 600
    });

    const databaseTask = await Task.create({
      title: 'Database Schema Design',
      description: 'Design MongoDB schemas for users, projects, and tasks',
      status: 'done',
      priority: 'medium',
      assignee: mikeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id, // Live column
      collectionId: websiteCollection._id,
      labels: [{ name: 'Database', color: '#F59E0B' }],
      dueDate: new Date('2025-11-10'),
      order: 3,
      timeTracked: 240
    });

    const deploymentTask = await Task.create({
      title: 'Production Deployment Setup',
      description: 'Configure CI/CD pipeline and hosting environment',
      status: 'todo',
      priority: 'medium',
      assignee: johnUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[1]?._id, // Ready for Dev column
      collectionId: websiteCollection._id,
      labels: [{ name: 'DevOps', color: '#EF4444' }],
      dueDate: new Date('2025-11-30'),
      order: 4
    });

    // Create subtasks for navigation task
    await Task.create({
      title: 'HTML Structure',
      description: 'Set up semantic HTML navigation structure',
      status: 'done',
      priority: 'medium',
      assignee: johnUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id,
      collectionId: websiteCollection._id,
      parentTaskId: navigationTask._id,
      isSubtask: true,
      order: 0,
      timeTracked: 60
    });

    await Task.create({
      title: 'Mobile Menu Implementation',
      description: 'Create hamburger menu for mobile devices',
      status: 'in-progress',
      priority: 'high',
      assignee: johnUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[2]?._id,
      collectionId: websiteCollection._id,
      parentTaskId: navigationTask._id,
      isSubtask: true,
      order: 1,
      timeTracked: 120
    });

    // Mobile Project Tasks (5 tasks)
    const mobileAuthTask = await Task.create({
      title: 'Mobile Authentication System',
      description: 'Implement biometric and social login for mobile app',
      status: 'in-progress',
      priority: 'high',
      assignee: sarahUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[2]?._id, // Active Sprint column
      collectionId: mobileCollection._id,
      labels: [{ name: 'Mobile', color: '#EC4899' }],
      dueDate: new Date('2025-11-30'),
      order: 0,
      timeTracked: 480
    });

    const offlineTask = await Task.create({
      title: 'Offline Data Sync',
      description: 'Enable app functionality without internet connection',
      status: 'todo',
      priority: 'medium',
      assignee: mikeUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[1]?._id, // Sprint Ready column
      collectionId: mobileCollection._id,
      labels: [{ name: 'Data', color: '#06B6D4' }],
      dueDate: new Date('2025-12-10'),
      order: 1
    });

    const pushNotificationsTask = await Task.create({
      title: 'Push Notifications',
      description: 'Implement Firebase push notifications for iOS and Android',
      status: 'todo',
      priority: 'medium',
      assignee: sarahUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[0]?._id, // Feature Requests column
      collectionId: mobileCollection._id,
      labels: [{ name: 'Notifications', color: '#F59E0B' }],
      dueDate: new Date('2025-12-15'),
      order: 2
    });

    const appStoreTask = await Task.create({
      title: 'App Store Submission',
      description: 'Prepare and submit app to iOS App Store and Google Play',
      status: 'todo',
      priority: 'low',
      assignee: johnUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[0]?._id, // Feature Requests column
      collectionId: mobileCollection._id,
      labels: [{ name: 'Release', color: '#8B5CF6' }],
      dueDate: new Date('2025-12-20'),
      order: 3
    });

    const performanceTask = await Task.create({
      title: 'App Performance Optimization',
      description: 'Optimize app startup time and memory usage',
      status: 'done',
      priority: 'medium',
      assignee: mikeUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[4]?._id, // App Store column
      collectionId: mobileCollection._id,
      labels: [{ name: 'Performance', color: '#10B981' }],
      dueDate: new Date('2025-11-05'),
      order: 4,
      timeTracked: 360
    });

    // Create subtasks for mobile auth
    await Task.create({
      title: 'Biometric Setup',
      description: 'Configure fingerprint and face ID authentication',
      status: 'in-progress',
      priority: 'high',
      assignee: sarahUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[2]?._id,
      collectionId: mobileCollection._id,
      parentTaskId: mobileAuthTask._id,
      isSubtask: true,
      order: 0,
      timeTracked: 180
    });

    await Task.create({
      title: 'Social Login Integration',
      description: 'Add Google, Apple, and Facebook login options',
      status: 'todo',
      priority: 'medium',
      assignee: sarahUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[1]?._id,
      collectionId: mobileCollection._id,
      parentTaskId: mobileAuthTask._id,
      isSubtask: true,
      order: 1,
      dueDate: new Date('2025-12-05')
    });

    // Marketing Project Tasks (5 tasks)
    const contentStrategyTask = await Task.create({
      title: 'Q1 Content Strategy',
      description: 'Develop comprehensive content calendar and themes',
      status: 'in-progress',
      priority: 'high',
      assignee: sarahUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[2]?._id, // Creating column
      collectionId: marketingCollection._id,
      labels: [{ name: 'Content', color: '#F97316' }],
      dueDate: new Date('2025-11-25'),
      order: 0,
      timeTracked: 240
    });

    const seoAuditTask = await Task.create({
      title: 'Website SEO Audit',
      description: 'Complete technical and content SEO analysis',
      status: 'todo',
      priority: 'medium',
      assignee: mikeUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[1]?._id, // Planning column
      collectionId: marketingCollection._id,
      labels: [{ name: 'SEO', color: '#84CC16' }],
      dueDate: new Date('2025-12-01'),
      order: 1
    });

    const socialMediaTask = await Task.create({
      title: 'Social Media Campaign',
      description: 'Launch multi-platform social media advertising campaign',
      status: 'review',
      priority: 'high',
      assignee: janeUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[3]?._id, // Review & Approve column
      collectionId: marketingCollection._id,
      labels: [{ name: 'Social Media', color: '#EC4899' }],
      dueDate: new Date('2025-11-22'),
      order: 2,
      timeTracked: 180
    });

    const emailCampaignTask = await Task.create({
      title: 'Email Marketing Campaign',
      description: 'Create automated email sequences for lead nurturing',
      status: 'done',
      priority: 'medium',
      assignee: sarahUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[4]?._id, // Published column
      collectionId: marketingCollection._id,
      labels: [{ name: 'Email', color: '#3B82F6' }],
      dueDate: new Date('2025-11-15'),
      order: 3,
      timeTracked: 320
    });

    const analyticsTask = await Task.create({
      title: 'Marketing Analytics Setup',
      description: 'Configure Google Analytics, tracking pixels, and conversion goals',
      status: 'todo',
      priority: 'low',
      assignee: mikeUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[0]?._id, // Ideas column
      collectionId: marketingCollection._id,
      labels: [{ name: 'Analytics', color: '#06B6D4' }],
      dueDate: new Date('2025-12-05'),
      order: 4
    });

    // Create subtasks for content strategy
    await Task.create({
      title: 'Audience Research',
      description: 'Define target audience personas and preferences',
      status: 'done',
      priority: 'high',
      assignee: sarahUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[4]?._id,
      collectionId: marketingCollection._id,
      parentTaskId: contentStrategyTask._id,
      isSubtask: true,
      order: 0,
      timeTracked: 120
    });

    await Task.create({
      title: 'Content Calendar Creation',
      description: 'Plan monthly content themes and posting schedule',
      status: 'in-progress',
      priority: 'medium',
      assignee: sarahUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[2]?._id,
      collectionId: marketingCollection._id,
      parentTaskId: contentStrategyTask._id,
      isSubtask: true,
      order: 1,
      timeTracked: 90
    });

    console.log('✅ Created comprehensive tasks with subtasks and collections');
      title: 'Design Homepage Mockups',
      description: 'Create wireframes and high-fidelity mockups for the new homepage design including hero section, features overview, and call-to-action areas',
      status: 'done',
      priority: 'high',
      assignee: janeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id, // Live column
      collectionId: websiteUICollection._id,
      labels: [
        { name: 'Design', color: '#8B5CF6' },
        { name: 'High Priority', color: '#EF4444' }
      ],
      dueDate: new Date('2025-11-15'),
      order: 0,
      timeTracked: 480
    });

    // Create subtasks for homepage design
    await Task.create({
      title: 'Research competitor websites',
      description: 'Analyze 5 competitor websites to identify design trends and best practices',
      status: 'done',
      priority: 'medium',
      assignee: janeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id,
      collectionId: websiteUICollection._id,
      parentTaskId: homepageDesignTask._id,
      isSubtask: true,
      order: 0,
      timeTracked: 120
    });

    await Task.create({
      title: 'Create wireframes',
      description: 'Design low-fidelity wireframes for homepage layout and information architecture',
      status: 'done',
      priority: 'medium',
      assignee: janeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id,
      collectionId: websiteUICollection._id,
      parentTaskId: homepageDesignTask._id,
      isSubtask: true,
      order: 1,
      timeTracked: 180
    });

    await Task.create({
      title: 'Design high-fidelity mockups',
      description: 'Create detailed visual designs with colors, typography, and imagery',
      status: 'done',
      priority: 'high',
      assignee: janeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id,
      collectionId: websiteUICollection._id,
      parentTaskId: homepageDesignTask._id,
      isSubtask: true,
      order: 2,
      timeTracked: 240
    });

    const navigationTask = await Task.create({
      title: 'Implement Responsive Navigation',
      description: 'Code the responsive navigation menu with mobile-first approach, including hamburger menu and smooth animations',
      status: 'in-progress',
      priority: 'high',
      assignee: johnUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[2]?._id, // Development column
      collectionId: websiteFrontendCollection._id,
      labels: [
        { name: 'Development', color: '#10B981' },
        { name: 'Frontend', color: '#3B82F6' }
      ],
      dueDate: new Date('2025-11-20'),
      order: 0,
      timeTracked: 360
    });

    // Navigation subtasks
    await Task.create({
      title: 'Set up HTML structure',
      description: 'Create semantic HTML structure for navigation menu',
      status: 'done',
      priority: 'medium',
      assignee: johnUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id,
      collectionId: websiteFrontendCollection._id,
      parentTaskId: navigationTask._id,
      isSubtask: true,
      order: 0,
      timeTracked: 60
    });

    await Task.create({
      title: 'Style desktop navigation',
      description: 'Apply CSS styles for desktop navigation layout and hover effects',
      status: 'done',
      priority: 'medium',
      assignee: johnUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id,
      collectionId: websiteFrontendCollection._id,
      parentTaskId: navigationTask._id,
      isSubtask: true,
      order: 1,
      timeTracked: 120
    });

    await Task.create({
      title: 'Implement mobile menu',
      description: 'Create responsive hamburger menu for mobile devices',
      status: 'in-progress',
      priority: 'high',
      assignee: johnUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[2]?._id,
      collectionId: websiteFrontendCollection._id,
      parentTaskId: navigationTask._id,
      isSubtask: true,
      order: 2,
      timeTracked: 90
    });

    await Task.create({
      title: 'Add animations and transitions',
      description: 'Implement smooth animations for menu interactions',
      status: 'todo',
      priority: 'low',
      assignee: johnUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[1]?._id, // Ready for Dev column
      collectionId: websiteFrontendCollection._id,
      parentTaskId: navigationTask._id,
      isSubtask: true,
      order: 3,
      dueDate: new Date('2025-11-25')
    });

    const apiTask = await Task.create({
      title: 'Build User Authentication API',
      description: 'Develop RESTful API endpoints for user registration, login, and profile management with JWT tokens',
      status: 'review',
      priority: 'high',
      assignee: mikeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[3]?._id, // Testing column
      collectionId: websiteBackendCollection._id,
      labels: [
        { name: 'Backend', color: '#10B981' },
        { name: 'Security', color: '#F59E0B' }
      ],
      dueDate: new Date('2025-11-18'),
      order: 0,
      timeTracked: 600
    });

    // API subtasks
    await Task.create({
      title: 'Setup JWT middleware',
      description: 'Configure JWT token generation and validation middleware',
      status: 'done',
      priority: 'high',
      assignee: mikeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id,
      collectionId: websiteBackendCollection._id,
      parentTaskId: apiTask._id,
      isSubtask: true,
      order: 0,
      timeTracked: 180
    });

    await Task.create({
      title: 'Create user registration endpoint',
      description: 'Implement POST /api/auth/register with validation and password hashing',
      status: 'done',
      priority: 'high',
      assignee: mikeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id,
      collectionId: websiteBackendCollection._id,
      parentTaskId: apiTask._id,
      isSubtask: true,
      order: 1,
      timeTracked: 150
    });

    await Task.create({
      title: 'Create login endpoint',
      description: 'Implement POST /api/auth/login with credential verification',
      status: 'done',
      priority: 'high',
      assignee: mikeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id,
      collectionId: websiteBackendCollection._id,
      parentTaskId: apiTask._id,
      isSubtask: true,
      order: 2,
      timeTracked: 120
    });

    await Task.create({
      title: 'Add password reset functionality',
      description: 'Implement forgot password and reset password endpoints with email verification',
      status: 'review',
      priority: 'medium',
      assignee: mikeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[3]?._id,
      collectionId: websiteBackendCollection._id,
      parentTaskId: apiTask._id,
      isSubtask: true,
      order: 3,
      timeTracked: 150
    });

    // Mobile Project Tasks
    const mobileAuthTask = await Task.create({
      title: 'Build Mobile Authentication Flow',
      description: 'Implement complete authentication system including biometric login, social auth, and secure token storage',
      status: 'in-progress',
      priority: 'high',
      assignee: sarahUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[2]?._id, // Active Sprint column
      collectionId: mobileAuthCollection._id,
      labels: [
        { name: 'Mobile', color: '#EC4899' },
        { name: 'Security', color: '#F59E0B' }
      ],
      dueDate: new Date('2025-11-30'),
      order: 0,
      timeTracked: 480
    });

    // Mobile auth subtasks
    await Task.create({
      title: 'Setup secure storage',
      description: 'Configure encrypted storage for tokens and sensitive user data',
      status: 'done',
      priority: 'high',
      assignee: sarahUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[4]?._id, // App Store column
      collectionId: mobileAuthCollection._id,
      parentTaskId: mobileAuthTask._id,
      isSubtask: true,
      order: 0,
      timeTracked: 120
    });

    await Task.create({
      title: 'Implement biometric authentication',
      description: 'Add fingerprint and face ID authentication for iOS and Android',
      status: 'in-progress',
      priority: 'medium',
      assignee: sarahUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[2]?._id,
      collectionId: mobileAuthCollection._id,
      parentTaskId: mobileAuthTask._id,
      isSubtask: true,
      order: 1,
      timeTracked: 180
    });

    await Task.create({
      title: 'Add social login options',
      description: 'Integrate Google, Apple, and Facebook authentication',
      status: 'todo',
      priority: 'medium',
      assignee: sarahUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[1]?._id,
      collectionId: mobileAuthCollection._id,
      parentTaskId: mobileAuthTask._id,
      isSubtask: true,
      order: 2,
      dueDate: new Date('2025-12-05')
    });

    const mobileComponentsTask = await Task.create({
      title: 'Create Reusable UI Component Library',
      description: 'Build a comprehensive library of reusable React Native components with consistent theming',
      status: 'todo',
      priority: 'medium',
      assignee: mikeUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[1]?._id,
      collectionId: mobileUICollection._id,
      labels: [
        { name: 'Mobile', color: '#EC4899' },
        { name: 'Components', color: '#8B5CF6' }
      ],
      dueDate: new Date('2025-12-10'),
      order: 0
    });

    // Component library subtasks
    await Task.create({
      title: 'Design component specifications',
      description: 'Define design system with colors, typography, spacing, and component variants',
      status: 'todo',
      priority: 'high',
      assignee: janeUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[1]?._id,
      collectionId: mobileUICollection._id,
      parentTaskId: mobileComponentsTask._id,
      isSubtask: true,
      order: 0,
      dueDate: new Date('2025-11-28')
    });

    await Task.create({
      title: 'Build basic form components',
      description: 'Create input fields, buttons, checkboxes, and form validation',
      status: 'todo',
      priority: 'medium',
      assignee: mikeUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[1]?._id,
      collectionId: mobileUICollection._id,
      parentTaskId: mobileComponentsTask._id,
      isSubtask: true,
      order: 1,
      dueDate: new Date('2025-12-02')
    });

    await Task.create({
      title: 'Create navigation components',
      description: 'Build tab bars, navigation headers, and drawer components',
      status: 'todo',
      priority: 'medium',
      assignee: mikeUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[1]?._id,
      collectionId: mobileUICollection._id,
      parentTaskId: mobileComponentsTask._id,
      isSubtask: true,
      order: 2,
      dueDate: new Date('2025-12-05')
    });

    // Marketing Project Tasks
    const contentStrategyTask = await Task.create({
      title: 'Develop Q1 Content Strategy',
      description: 'Create comprehensive content calendar and strategy for blog posts, social media, and email campaigns',
      status: 'in-progress',
      priority: 'high',
      assignee: sarahUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[2]?._id, // Creating column
      collectionId: marketingContentCollection._id,
      labels: [
        { name: 'Content', color: '#F97316' },
        { name: 'Strategy', color: '#8B5CF6' }
      ],
      dueDate: new Date('2025-11-25'),
      order: 0,
      timeTracked: 240
    });

    // Content strategy subtasks
    await Task.create({
      title: 'Research target audience personas',
      description: 'Define detailed buyer personas and content preferences',
      status: 'done',
      priority: 'high',
      assignee: sarahUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[4]?._id,
      collectionId: marketingContentCollection._id,
      parentTaskId: contentStrategyTask._id,
      isSubtask: true,
      order: 0,
      timeTracked: 120
    });

    await Task.create({
      title: 'Create content calendar template',
      description: 'Design monthly content calendar with themes and posting schedule',
      status: 'in-progress',
      priority: 'medium',
      assignee: sarahUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[2]?._id,
      collectionId: marketingContentCollection._id,
      parentTaskId: contentStrategyTask._id,
      isSubtask: true,
      order: 1,
      timeTracked: 90
    });

    await Task.create({
      title: 'Plan blog post topics',
      description: 'Brainstorm and outline 20 blog post ideas for Q1',
      status: 'todo',
      priority: 'medium',
      assignee: sarahUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[1]?._id,
      collectionId: marketingContentCollection._id,
      parentTaskId: contentStrategyTask._id,
      isSubtask: true,
      order: 2,
      dueDate: new Date('2025-11-20')
    });

    const seoAuditTask = await Task.create({
      title: 'Complete Website SEO Audit',
      description: 'Comprehensive SEO analysis including technical SEO, content optimization, and competitor analysis',
      status: 'todo',
      priority: 'medium',
      assignee: mikeUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[1]?._id,
      collectionId: marketingSEOCollection._id,
      labels: [
        { name: 'SEO', color: '#84CC16' },
        { name: 'Analytics', color: '#06B6D4' }
      ],
      dueDate: new Date('2025-12-01'),
      order: 0
    });

    // SEO audit subtasks
    await Task.create({
      title: 'Technical SEO analysis',
      description: 'Check site speed, mobile responsiveness, and crawlability',
      status: 'todo',
      priority: 'high',
      assignee: mikeUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[1]?._id,
      collectionId: marketingSEOCollection._id,
      parentTaskId: seoAuditTask._id,
      isSubtask: true,
      order: 0,
      dueDate: new Date('2025-11-22')
    });

    await Task.create({
      title: 'Keyword research and mapping',
      description: 'Identify target keywords and map them to existing content',
      status: 'todo',
      priority: 'medium',
      assignee: mikeUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[1]?._id,
      collectionId: marketingSEOCollection._id,
      parentTaskId: seoAuditTask._id,
      isSubtask: true,
      order: 1,
      dueDate: new Date('2025-11-28')
    });

    await Task.create({
      title: 'Competitor SEO analysis',
      description: 'Analyze top 5 competitors SEO strategies and identify opportunities',
      status: 'todo',
      priority: 'low',
      assignee: mikeUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[1]?._id,
      collectionId: marketingSEOCollection._id,
      parentTaskId: seoAuditTask._id,
      isSubtask: true,
      order: 2,
      dueDate: new Date('2025-12-01')
    });

    // Add some standalone tasks without subtasks for variety
    await Task.create({
      title: 'Setup Google Analytics 4',
      description: 'Configure GA4 tracking for website with custom events and conversions',
      status: 'backlog',
      priority: 'low',
      assignee: mikeUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[0]?._id,
      collectionId: marketingSEOCollection._id,
      labels: [
        { name: 'Analytics', color: '#06B6D4' }
      ],
      order: 1
    });

    await Task.create({
      title: 'Design Social Media Templates',
      description: 'Create branded templates for Instagram, LinkedIn, and Twitter posts',
      status: 'review',
      priority: 'medium',
      assignee: janeUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[3]?._id,
      collectionId: marketingContentCollection._id,
      labels: [
        { name: 'Design', color: '#8B5CF6' },
        { name: 'Social Media', color: '#EC4899' }
      ],
      dueDate: new Date('2025-11-16'),
      order: 1,
      timeTracked: 180
    });

    await Task.create({
      title: 'Launch Google Ads Campaign',
      description: 'Set up and launch targeted Google Ads campaign for new customer acquisition',
      status: 'backlog',
      priority: 'high',
      assignee: sarahUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[0]?._id,
      collectionId: marketingCampaignCollection._id,
      labels: [
        { name: 'Paid Ads', color: '#EF4444' },
        { name: 'Google', color: '#3B82F6' }
      ],
      dueDate: new Date('2025-12-15'),
      order: 0
    });

    // Add more mobile tasks for better variety
    await Task.create({
      title: 'Implement Push Notifications',
      description: 'Add Firebase push notification support with custom message handling',
      status: 'backlog',
      priority: 'medium',
      assignee: mikeUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[0]?._id,
      collectionId: mobileDataCollection._id,
      labels: [
        { name: 'Mobile', color: '#EC4899' },
        { name: 'Notifications', color: '#F59E0B' }
      ],
      order: 0
    });

    await Task.create({
      title: 'Setup Offline Data Sync',
      description: 'Implement offline-first data synchronization with conflict resolution',
      status: 'backlog',
      priority: 'low',
      assignee: sarahUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[0]?._id,
      collectionId: mobileDataCollection._id,
      labels: [
        { name: 'Mobile', color: '#EC4899' },
        { name: 'Offline', color: '#6B7280' }
      ],
      order: 1
    });

    // Add more website tasks
    await Task.create({
      title: 'Optimize Website Performance',
      description: 'Improve site speed through image optimization, code splitting, and lazy loading',
      status: 'backlog',
      priority: 'medium',
      assignee: johnUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[0]?._id,
      collectionId: websiteFrontendCollection._id,
      labels: [
        { name: 'Performance', color: '#10B981' },
        { name: 'Optimization', color: '#F59E0B' }
      ],
      order: 1
    });

    console.log('✅ Created comprehensive tasks with subtasks and collections');

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
      content: 'Great work on the design! The color scheme looks modern and professional. The wireframes really capture our brand vision.',
      author: adminUser._id,
      taskId: homepageDesignTask._id,
      mentions: [janeUser._id]
    });

    await Comment.create({
      content: 'The navigation is coming along well. Should we add a search functionality to the mobile menu?',
      author: janeUser._id,
      taskId: navigationTask._id,
      mentions: [johnUser._id]
    });

    await Comment.create({
      content: 'The API endpoints are solid. I tested the registration flow and it works perfectly. Just need to review the password reset implementation.',
      author: johnUser._id,
      taskId: apiTask._id,
      mentions: [mikeUser._id]
    });

    await Comment.create({
      content: 'The biometric authentication is tricky on Android. Might need to adjust the implementation for different device manufacturers.',
      author: mikeUser._id,
      taskId: mobileAuthTask._id,
      mentions: [sarahUser._id]
    });

    await Comment.create({
      content: 'Love the content strategy direction! The persona research really helps target our messaging. Should we also consider video content?',
      author: janeUser._id,
      taskId: contentStrategyTask._id,
      mentions: [sarahUser._id]
    });

    console.log('✅ Created 5 comments');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Seeded Data Summary:');
    console.log('- 5 users (including admin)');
    console.log('- 3 projects (Website, Mobile App, Marketing)');
    console.log('- 3 boards with unique project-specific columns');
    console.log('- 3 collections/epics for task organization');
    console.log('- 15 main tasks distributed across projects');
    console.log('- Multiple subtasks demonstrating task hierarchy');
    console.log('- 5 comments with user mentions');
    console.log('- Comprehensive task statuses, priorities, and labels');
    console.log('- Realistic due dates and time tracking data');

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