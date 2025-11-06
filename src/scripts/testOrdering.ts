// Test script to verify task ordering functionality
import mongoose from 'mongoose';
import Task from '../models/Task';
import dotenv from 'dotenv';

dotenv.config();

const testTaskOrdering = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env['MONGODB_URI'] || 'mongodb://localhost:27017/flowboard');
    console.log('Connected to MongoDB for testing');

    // Find a board with tasks
    const sampleTask = await Task.findOne({}).populate('boardId');
    
    if (!sampleTask) {
      console.log('No tasks found in database. Please run the seeder first.');
      return;
    }

    const boardId = sampleTask.boardId;
    const columnId = sampleTask.columnId;

    console.log(`\n🧪 Testing task ordering for board: ${boardId}`);
    console.log(`📋 Column: ${columnId}`);

    // Get all tasks in the first column, sorted by order
    const tasksInColumn = await Task.find({ 
      boardId, 
      columnId,
      isSubtask: false 
    }).sort({ order: 1 });

    console.log(`\n📊 Found ${tasksInColumn.length} tasks in column:`);
    tasksInColumn.forEach((task, index) => {
      console.log(`${index + 1}. "${task.title}" - Order: ${task.order}`);
    });

    // Verify they are properly sorted
    let isProperlyOrdered = true;
    for (let i = 1; i < tasksInColumn.length; i++) {
      const currentTask = tasksInColumn[i];
      const previousTask = tasksInColumn[i-1];
      
      if (currentTask && previousTask && currentTask.order <= previousTask.order) {
        isProperlyOrdered = false;
        console.log(`❌ Order violation: Task "${currentTask.title}" (${currentTask.order}) should be after "${previousTask.title}" (${previousTask.order})`);
      }
    }

    if (isProperlyOrdered) {
      console.log('✅ Tasks are properly ordered!');
    } else {
      console.log('❌ Tasks are NOT properly ordered!');
    }

    // Test fetching with correct sort
    const sortedTasks = await Task.find({ boardId })
      .sort({ columnId: 1, order: 1, createdAt: 1 });

    console.log(`\n📈 Total tasks in board sorted by column and order: ${sortedTasks.length}`);
    
    // Group by column
    const tasksByColumn = sortedTasks.reduce((acc, task) => {
      const colId = task.columnId.toString();
      if (!acc[colId]) acc[colId] = [];
      acc[colId].push(task);
      return acc;
    }, {} as Record<string, typeof sortedTasks>);

    Object.entries(tasksByColumn).forEach(([colId, tasks]) => {
      console.log(`\n📂 Column ${colId}:`);
      tasks.forEach((task, index) => {
        console.log(`  ${index + 1}. "${task.title}" - Order: ${task.order}`);
      });
    });

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the test
testTaskOrdering();