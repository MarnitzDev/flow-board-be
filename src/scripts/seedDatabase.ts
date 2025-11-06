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
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    });

    const johnUser = await User.create({
      username: 'john_doe',
      email: 'john@flowboard.com',
      password: 'password123',
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
    });

    const janeUser = await User.create({
      username: 'jane_smith',
      email: 'jane@flowboard.com',
      password: 'password123',
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane'
    });

    const mikeUser = await User.create({
      username: 'mike_wilson',
      email: 'mike@flowboard.com',
      password: 'password123',
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'
    });

    const sarahUser = await User.create({
      username: 'sarah_connor',
      email: 'sarah@flowboard.com',
      password: 'password123',
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
    });

    console.log('✅ Created 5 users');

    // Create Projects
    console.log('📂 Creating projects...');
    const websiteProject = await Project.create({
      name: 'E-commerce Website',
      description: 'Modern e-commerce platform with React and Node.js',
      color: '#3B82F6',
      createdBy: adminUser._id,
      members: [adminUser._id, johnUser._id, janeUser._id] // Admin + 2 developers
    });

    const mobileProject = await Project.create({
      name: 'Mobile Fitness App',
      description: 'Cross-platform fitness tracking application',
      color: '#10B981',
      createdBy: johnUser._id,
      members: [adminUser._id, johnUser._id, janeUser._id, mikeUser._id, sarahUser._id] // Admin + 4 team members
    });

    const marketingProject = await Project.create({
      name: 'Brand Redesign',
      description: 'Complete brand identity and marketing material refresh',
      color: '#F59E0B',
      createdBy: janeUser._id,
      members: [adminUser._id, janeUser._id, mikeUser._id, sarahUser._id] // Admin + 3 design-focused members
    });

    console.log('✅ Created 3 projects');

    // Create Boards with unique column names
    console.log('📋 Creating boards...');
    const websiteBoard = await Board.create({
      name: `${websiteProject.name} Board`,
      projectId: websiteProject._id,
      columns: [
        { name: 'Backlog', color: '#6B7280', order: 0, taskIds: [] },
        { name: 'Design', color: '#8B5CF6', order: 1, taskIds: [] },
        { name: 'Development', color: '#F59E0B', order: 2, taskIds: [] },
        { name: 'Testing', color: '#3B82F6', order: 3, taskIds: [] },
        { name: 'Deployed', color: '#10B981', order: 4, taskIds: [] }
      ]
    });

    const mobileBoard = await Board.create({
      name: `${mobileProject.name} Board`,
      projectId: mobileProject._id,
      columns: [
        { name: 'Ideas', color: '#6B7280', order: 0, taskIds: [] },
        { name: 'Sprint Planning', color: '#EC4899', order: 1, taskIds: [] },
        { name: 'In Progress', color: '#F59E0B', order: 2, taskIds: [] },
        { name: 'Review', color: '#06B6D4', order: 3, taskIds: [] },
        { name: 'Released', color: '#10B981', order: 4, taskIds: [] }
      ]
    });

    const marketingBoard = await Board.create({
      name: `${marketingProject.name} Board`,
      projectId: marketingProject._id,
      columns: [
        { name: 'Concepts', color: '#6B7280', order: 0, taskIds: [] },
        { name: 'Brainstorming', color: '#F59E0B', order: 1, taskIds: [] },
        { name: 'Creating', color: '#8B5CF6', order: 2, taskIds: [] },
        { name: 'Client Review', color: '#3B82F6', order: 3, taskIds: [] },
        { name: 'Approved', color: '#10B981', order: 4, taskIds: [] }
      ]
    });

    console.log('✅ Created 3 boards');

    // Create Collections/Epics (varied distribution: 2, 3, 1 respectively)
    console.log('🗂️ Creating collections/epics...');
    
    // Website Project: 2 Collections
    const websiteCollection1 = await Collection.create({
      name: 'Core E-commerce Features',
      description: 'Essential shopping cart, payment, and user account functionality',
      color: '#3B82F6',
      projectId: websiteProject._id,
      createdBy: adminUser._id,
      order: 0
    });

    const websiteCollection2 = await Collection.create({
      name: 'User Experience & Design',
      description: 'UI/UX improvements, responsive design, and accessibility features',
      color: '#8B5CF6',
      projectId: websiteProject._id,
      createdBy: adminUser._id,
      order: 1
    });

    // Mobile Project: 3 Collections (most complex project)
    const mobileCollection1 = await Collection.create({
      name: 'Workout Tracking',
      description: 'Exercise logging, progress tracking, and analytics features',
      color: '#10B981',
      projectId: mobileProject._id,
      createdBy: johnUser._id,
      order: 0
    });

    const mobileCollection2 = await Collection.create({
      name: 'Social & Community',
      description: 'User profiles, social features, leaderboards, and community challenges',
      color: '#EC4899',
      projectId: mobileProject._id,
      createdBy: johnUser._id,
      order: 1
    });

    const mobileCollection3 = await Collection.create({
      name: 'Infrastructure & Performance',
      description: 'App optimization, offline sync, push notifications, and technical debt',
      color: '#06B6D4',
      projectId: mobileProject._id,
      createdBy: johnUser._id,
      order: 2
    });

    // Marketing Project: 1 Collection (focused project)
    const marketingCollection = await Collection.create({
      name: 'Visual Identity',
      description: 'Logo, typography, color palette, and brand guidelines',
      color: '#F59E0B',
      projectId: marketingProject._id,
      createdBy: janeUser._id,
      order: 0
    });

    console.log('✅ Created 6 collections/epics (2 + 3 + 1 per project)');

    // Create 15 diverse tasks with varied scenarios
    console.log('📝 Creating 15 diverse tasks...');
    
    // Website Project Tasks (5 tasks) - Distributed across 2 collections
    const homepageTask = await Task.create({
      title: 'Homepage Hero Section',
      description: 'Design and implement the main landing page hero with product showcase, call-to-action buttons, and responsive layout for desktop and mobile users',
      status: 'done',
      priority: 'high',
      assignee: janeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id, // Deployed
      collectionId: websiteCollection2._id, // UX & Design collection
      labels: [
        { name: 'Frontend', color: '#3B82F6' },
        { name: 'Critical', color: '#EF4444' }
      ],
      dueDate: new Date('2025-11-15'), // SHORT deadline
      order: 0,
      timeTracked: 720 // 12 hours
    });

    const paymentTask = await Task.create({
      title: 'Payment Gateway Integration',
      description: 'Implement secure payment processing with Stripe, including one-time purchases, subscriptions, refunds, and comprehensive error handling for edge cases.',
      status: 'in-progress',
      priority: 'high',
      assignee: mikeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[2]?._id, // In Progress
      collectionId: websiteCollection1._id, // IN COLLECTION
      labels: [
        { name: 'Backend', color: '#10B981' },
        { name: 'Critical', color: '#EF4444' }
      ],
      dueDate: new Date('2025-11-15'), // SHORT deadline
      subtasks: [
        { title: 'Research payment providers', completed: true },
        { title: 'Set up Stripe account', completed: true },
        { title: 'Implement webhook handlers', completed: false },
        { title: 'Add payment form validation', completed: false },
        { title: 'Test refund scenarios', completed: false }
      ],
      dependencies: [], // Will be updated after creating dependent tasks
      order: 2,
      timeTracked: 480 // 8 hours
    });

    const seoTask = await Task.create({
      title: 'SEO Optimization',
      // NO DESCRIPTION - testing empty description
      status: 'todo',
      priority: 'medium',
      assignee: johnUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[0]?._id, // Backlog
      // NO COLLECTION - standalone task
      labels: [{ name: 'Marketing', color: '#EC4899' }],
      dueDate: new Date('2025-11-28'), // MEDIUM deadline
      order: 2
    });

    const dbTask = await Task.create({
      title: 'Database Schema',
      description: 'Design MongoDB collections for products, users, orders, and inventory management',
      status: 'done',
      priority: 'high',
      assignee: mikeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id, // Deployed
      // NO COLLECTION - standalone task
      labels: [{ name: 'Database', color: '#8B5CF6' }],
      // NO DUE DATE - testing open-ended tasks
      order: 3,
      timeTracked: 360
    });

    const analyticsTask = await Task.create({
      title: 'Analytics Dashboard',
      description: 'Create admin dashboard with sales metrics, user behavior analytics, and real-time reporting using Chart.js and WebSocket connections for live updates.',
      status: 'testing',
      priority: 'low',
      assignee: janeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[3]?._id, // Testing
      collectionId: websiteCollection1._id, // Core E-commerce collection
      labels: [
        { name: 'Analytics', color: '#06B6D4' },
        { name: 'Dashboard', color: '#84CC16' }
      ],
      dueDate: new Date('2026-02-14'), // VERY LONG deadline for calendar testing
      order: 4,
      timeTracked: 240
    });

    // Mobile Project Tasks (5 tasks) - Distributed across 3 collections
    const workoutLogTask = await Task.create({
      title: 'Workout Logger',
      description: 'Core feature allowing users to log exercises, sets, reps, and weights with progress tracking, personal records, and workout history analytics.',
      status: 'testing',
      priority: 'high',
      assignee: sarahUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[3]?._id, // Testing
      collectionId: mobileCollection1._id, // IN COLLECTION
      labels: [
        { name: 'Core Feature', color: '#8B5CF6' },
        { name: 'Analytics', color: '#F59E0B' }
      ],
      dueDate: new Date('2025-11-12'), // THIS WEEK
      subtasks: [
        { title: 'Design exercise selection UI', completed: true },
        { title: 'Implement set/rep tracking', completed: true },
        { title: 'Add weight progression graphs', completed: false },
        { title: 'Create workout templates', completed: false }
      ],
      dependencies: [], // Will be updated after creating dependent tasks
      order: 0,
      timeTracked: 720 // 12 hours
    });

    const offlineTask = await Task.create({
      title: 'Offline Mode',
      // NO DESCRIPTION
      status: 'todo',
      priority: 'medium',
      assignee: mikeUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[1]?._id, // Sprint Planning
      collectionId: mobileCollection3._id, // Infrastructure & Performance collection
      labels: [{ name: 'Data Sync', color: '#F59E0B' }],
      subtasks: [
        { title: 'Design offline data schema', completed: false },
        { title: 'Implement SQLite caching', completed: false },
        { title: 'Add sync conflict resolution', completed: false }
      ],
      dependencies: [], // Standalone task
      // NO DUE DATE
      order: 1
    });

    const pushNotifTask = await Task.create({
      title: 'Push Notifications',
      description: 'Firebase Cloud Messaging integration for workout reminders, achievement notifications, and social features with custom notification scheduling.',
      status: 'todo',
      priority: 'low',
      assignee: sarahUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[0]?._id, // Ideas
      // NO COLLECTION - standalone
      labels: [{ name: 'Notifications', color: '#8B5CF6' }],
      dueDate: new Date('2025-12-31'), // End of year deadline
      order: 2
    });

    const socialTask = await Task.create({
      title: 'Social Features',
      description: 'Friend connections, workout sharing, leaderboards, challenges, and community features with real-time chat and photo sharing capabilities.',
      status: 'review',
      priority: 'medium',
      assignee: johnUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[3]?._id, // Review
      collectionId: mobileCollection2._id, // Social & Community collection
      labels: [
        { name: 'Social', color: '#EC4899' },
        { name: 'Community', color: '#F97316' }
      ],
      dueDate: new Date('2025-11-18'), // VERY SHORT deadline
      order: 3,
      timeTracked: 180
    });

    const performanceTask = await Task.create({
      title: 'App Performance',
      // NO DESCRIPTION
      status: 'done',
      priority: 'high',
      assignee: mikeUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[4]?._id, // Released
      collectionId: mobileCollection3._id, // Infrastructure & Performance collection
      labels: [{ name: 'Optimization', color: '#10B981' }],
      // NO DUE DATE
      order: 4,
      timeTracked: 300
    });

    // Marketing Project Tasks (5 tasks) - Mix scenarios
    const logoTask = await Task.create({
      title: 'Logo Design',
      description: 'Create modern, memorable logo that works across all media formats: digital, print, merchandise, and social media with scalable vector formats.',
      status: 'done',
      priority: 'high',
      assignee: janeUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[4]?._id, // Done
      collectionId: marketingCollection._id, // IN COLLECTION
      labels: [
        { name: 'Design', color: '#EC4899' },
        { name: 'Branding', color: '#8B5CF6' }
      ],
      dueDate: new Date('2025-11-08'), // OVERDUE
      subtasks: [
        { title: 'Brainstorm concepts', completed: true },
        { title: 'Create initial sketches', completed: true },
        { title: 'Develop digital mockups', completed: true },
        { title: 'Client feedback round 1', completed: true },
        { title: 'Final refinements', completed: true },
        { title: 'Export all file formats', completed: true }
      ],
      dependencies: [], // Will be updated after creating dependent tasks
      order: 0,
      timeTracked: 960 // 16 hours
    });

    const colorPaletteTask = await Task.create({
      title: 'Color Palette',
      description: 'Develop primary, secondary, and accent color schemes with accessibility considerations (WCAG AA compliance) and usage guidelines for digital and print media.',
      status: 'creating',
      priority: 'high',
      assignee: sarahUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[2]?._id, // Creating
      collectionId: marketingCollection._id, // IN COLLECTION
      labels: [{ name: 'Color Theory', color: '#F59E0B' }],
      dueDate: new Date('2025-11-19'), // SHORT deadline
      order: 1,
      timeTracked: 120
    });

    const websiteRedTask = await Task.create({
      title: 'Website Redesign',
      // NO DESCRIPTION
      status: 'brainstorming',
      priority: 'medium',
      assignee: johnUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[1]?._id, // Brainstorming
      // NO COLLECTION - standalone
      labels: [{ name: 'Web Design', color: '#3B82F6' }],
      dueDate: new Date('2026-01-15'), // VERY LONG deadline
      order: 2
    });

    const socialMediaTask = await Task.create({
      title: 'Social Media Templates',
      description: 'Design Instagram, Facebook, Twitter, and LinkedIn post templates with brand guidelines, multiple size formats, and seasonal variations.',
      status: 'concepts',
      priority: 'low',
      assignee: sarahUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[0]?._id, // Concepts
      // NO COLLECTION - standalone
      labels: [
        { name: 'Social Media', color: '#EC4899' },
        { name: 'Templates', color: '#06B6D4' }
      ],
      // NO DUE DATE
      order: 3
    });

    const brandGuideTask = await Task.create({
      title: 'Brand Guidelines Document',
      description: 'Comprehensive 50-page brand guide covering logo usage, typography hierarchy, color applications, photography style, tone of voice, and do/don\'ts with examples.',
      status: 'client-review',
      priority: 'medium',
      assignee: mikeUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[3]?._id, // Client Review
      collectionId: marketingCollection._id, // IN COLLECTION
      labels: [
        { name: 'Documentation', color: '#8B5CF6' },
        { name: 'Guidelines', color: '#84CC16' }
      ],
      dueDate: new Date('2025-12-01'), // MEDIUM deadline
      order: 4,
      timeTracked: 840 // 14 hours
    });

    // Create subtasks for some tasks (testing parent-child relationships)
    console.log('📝 Creating subtasks...');

    // Subtasks for Payment Gateway (has collection)
    await Task.create({
      title: 'Stripe Setup',
      description: 'Configure Stripe account, API keys, and webhook endpoints',
      status: 'done',
      priority: 'high',
      assignee: mikeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[4]?._id,
      collectionId: websiteCollection1._id,
      parentTaskId: paymentTask._id,
      isSubtask: true,
      order: 0,
      timeTracked: 120
    });

    await Task.create({
      title: 'Payment Form UI',
      // NO DESCRIPTION
      status: 'in-progress',
      priority: 'medium',
      assignee: janeUser._id,
      reporter: adminUser._id,
      projectId: websiteProject._id,
      boardId: websiteBoard._id,
      columnId: websiteBoard.columns[2]?._id,
      collectionId: websiteCollection1._id,
      parentTaskId: paymentTask._id,
      isSubtask: true,
      order: 1,
      timeTracked: 90
    });

    // Subtasks for Workout Logger (mobile - has collection)
    await Task.create({
      title: 'Exercise Database',
      description: 'Import and categorize 200+ exercises with images, instructions, and muscle group tags',
      status: 'done',
      priority: 'high',
      assignee: sarahUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[4]?._id,
      collectionId: mobileCollection1._id,
      parentTaskId: workoutLogTask._id,
      isSubtask: true,
      order: 0,
      timeTracked: 300,
      // NO DUE DATE
    });

    await Task.create({
      title: 'Timer Component',
      // NO DESCRIPTION
      status: 'in-progress',
      priority: 'medium',
      assignee: mikeUser._id,
      reporter: johnUser._id,
      projectId: mobileProject._id,
      boardId: mobileBoard._id,
      columnId: mobileBoard.columns[2]?._id,
      collectionId: mobileCollection1._id,
      parentTaskId: workoutLogTask._id,
      isSubtask: true,
      order: 1,
      dueDate: new Date('2025-11-20'), // SHORT deadline
      timeTracked: 150
    });

    // Subtasks for Logo Design (marketing - has collection)
    await Task.create({
      title: 'Initial Sketches',
      description: 'Hand-drawn concept sketches exploring different visual directions and symbolic representations',
      status: 'done',
      priority: 'medium',
      assignee: janeUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[4]?._id,
      collectionId: marketingCollection._id,
      parentTaskId: logoTask._id,
      isSubtask: true,
      order: 0,
      // NO DUE DATE
      timeTracked: 240
    });

    await Task.create({
      title: 'Digital Refinements',
      description: 'Convert best sketches to vector format in Adobe Illustrator with multiple variations and color tests',
      status: 'done',
      priority: 'high',
      assignee: janeUser._id,
      reporter: janeUser._id,
      projectId: marketingProject._id,
      boardId: marketingBoard._id,
      columnId: marketingBoard.columns[4]?._id,
      collectionId: marketingCollection._id,
      parentTaskId: logoTask._id,
      isSubtask: true,
      order: 1,
      dueDate: new Date('2025-11-10'), // Past deadline for testing
      timeTracked: 360
    });

    console.log('✅ Created 15 main tasks + 7 subtasks = 22 total tasks');

    // Add task dependencies (realistic blocking relationships)
    console.log('🔗 Adding task dependencies...');
    
    // Brand Guidelines depends on Logo Design being complete
    await Task.findByIdAndUpdate(brandGuideTask._id, {
      dependencies: [logoTask._id]
    });

    // Social Media Templates depend on both Logo and Brand Guidelines
    await Task.findByIdAndUpdate(socialMediaTask._id, {
      dependencies: [logoTask._id, brandGuideTask._id]
    });

    // Website Redesign depends on Logo being complete
    await Task.findByIdAndUpdate(websiteRedTask._id, {
      dependencies: [logoTask._id]
    });

    console.log('✅ Added 3 dependency relationships');

    // Create realistic comments
    console.log('💬 Creating comments...');
    
    await Comment.create({
      taskId: paymentTask._id,
      createdBy: adminUser._id,
      content: '@mike_wilson Great progress on the Stripe integration! Make sure to test the webhook endpoints thoroughly. Also, we need to handle edge cases like partial payments and refunds.',
      createdAt: new Date('2025-11-05T10:30:00Z')
    });

    await Comment.create({
      taskId: workoutLogTask._id,
      createdBy: johnUser._id,
      content: '@sarah_connor The exercise database looks fantastic! Users will love the detailed instructions. Can we add video demonstrations for complex movements?',
      createdAt: new Date('2025-11-06T14:15:00Z')
    });

    await Comment.create({
      taskId: logoTask._id,
      createdBy: mikeUser._id,
      content: 'The logo concepts are really strong, especially concepts 3, 7, and 9. The minimalist approach in #3 would work well across digital platforms.',
      createdAt: new Date('2025-11-06T09:45:00Z')
    });

    await Comment.create({
      taskId: socialTask._id,
      createdBy: sarahUser._id,
      content: '@john_doe Should we prioritize the leaderboard feature? It could drive user engagement significantly. What do you think about weekly challenges?',
      createdAt: new Date('2025-11-06T16:20:00Z')
    });

    await Comment.create({
      taskId: brandGuideTask._id,
      createdBy: janeUser._id,
      content: 'First draft is complete and ready for review. The document covers all brand touchpoints with clear examples. @mike_wilson please review the technical specifications section.',
      createdAt: new Date('2025-11-06T11:30:00Z')
    });

    console.log('✅ Created 5 comments');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Diverse Data Summary:');
    console.log('- 5 users (admin, john, jane, mike, sarah)');
    console.log('- 3 projects (E-commerce, Mobile App, Branding)');
    console.log('- 3 boards with unique project-specific columns');
    console.log('- 6 collections/epics (2 + 3 + 1 per project - realistic distribution)');
    console.log('- 15 main tasks (5 per project)');
    console.log('- 7 separate subtask documents (complex hierarchy)');
    console.log('- 22 embedded subtasks within main tasks (quick subtasks)');
    console.log('- 3 task dependencies (blocking relationships)');
    console.log('- 5 realistic comments with mentions');
    
    console.log('\n🎯 Test Scenarios Covered:');
    console.log('✅ Tasks WITH collections vs WITHOUT collections');
    console.log('✅ Tasks WITH subtasks vs WITHOUT subtasks (both embedded & separate docs)');
    console.log('✅ Tasks WITH dependencies vs WITHOUT dependencies');
    console.log('✅ Tasks WITH descriptions vs WITHOUT descriptions');
    console.log('✅ Tasks WITH due dates vs WITHOUT due dates');
    console.log('✅ SHORT deadlines (1-2 weeks) vs LONG deadlines (months)');
    console.log('✅ OVERDUE tasks (past deadlines)');
    console.log('✅ Various priorities (high, medium, low)');
    console.log('✅ All status types across different columns');
    console.log('✅ Different time tracking amounts (some none, some heavy)');
    console.log('✅ Diverse label categories and colors');
    console.log('✅ Mixed assignee distributions');
    console.log('✅ Realistic project access (admin not in all projects)');
    console.log('✅ Variable collection counts per project (1-3 collections)');
    
    console.log('\n🔗 Dependency Examples:');
    console.log('- Brand Guidelines → depends on → Logo Design');
    console.log('- Social Media Templates → depends on → Logo Design + Brand Guidelines');
    console.log('- Website Redesign → depends on → Logo Design');
    console.log('- Shopping Cart → depends on → Payment Gateway');
    
    console.log('\n📝 Subtask Types:');
    console.log('- Embedded subtasks: Quick checklist items within tasks');
    console.log('- Separate subtask docs: Complex subtasks with full task properties');
    
    console.log('\n📂 Project Access Model:');
    console.log('- Website Project: Admin + John + Jane (3 members)');
    console.log('- Mobile Project: Admin + John + Jane + Mike + Sarah (5 members)');
    console.log('- Marketing Project: Admin + Jane + Mike + Sarah (4 members)');
    console.log('- Admin has access to ALL projects for oversight and management');
    
    console.log('\n🗂️ Collection Distribution:');
    console.log('- Website (2 collections): Core E-commerce + UX & Design');
    console.log('- Mobile (3 collections): Workout Tracking + Social & Community + Infrastructure');
    console.log('- Marketing (1 collection): Visual Identity');
    
    console.log('\n📅 Timeline & Calendar Testing:');
    console.log('- Tasks due THIS WEEK (Nov 12-19, 2025)');
    console.log('- Tasks due NEXT MONTH (December 2025)');
    console.log('- Tasks due NEXT YEAR (2026) for long-term planning');
    console.log('- Tasks with NO due dates for backlog testing');
    console.log('- OVERDUE tasks for urgency testing');

    console.log('\n🔐 Test Credentials:');
    console.log('Admin: admin@flowboard.com / admin123');
    console.log('User: john@flowboard.com / password123');
    console.log('User: jane@flowboard.com / password123');
    console.log('User: mike@flowboard.com / password123');
    console.log('User: sarah@flowboard.com / password123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedDatabase();