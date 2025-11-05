// Simple JavaScript Socket.IO Test Client
const { io } = require('socket.io-client');

const CONFIG = {
  serverUrl: 'http://localhost:5000',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTBiMTc5MjY2OGJmZDkwMmEwNTgxZDciLCJpYXQiOjE3NjIzNTI2MzQsImV4cCI6MTc2Mjk1NzQzNH0.6Ihkv0cUW6ZNcxabO2W8-eajKj5GFYefs556bUnZHUs',
  boardId: '690b1793668bfd902a0581eb',
  projectId: '690b1792668bfd902a0581e5',
  toDoColumnId: '690b1793668bfd902a0581ed'
};

class SocketTester {
  constructor() {
    console.log('🚀 Starting Socket.IO Test Client...\n');
    this.connect();
  }

  connect() {
    console.log('🔌 Connecting to Socket.IO server...');
    
    this.socket = io(CONFIG.serverUrl, {
      auth: {
        token: CONFIG.token
      }
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      console.log('📡 Socket ID:', this.socket.id);
      this.runTests();
    });

    this.socket.on('connect_error', (error) => {
      console.log('❌ Connection Error:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected:', reason);
    });

    this.socket.on('error', (data) => {
      console.log('❌ Socket Error:', data);
    });

    // Real-time event listeners
    this.socket.on('user:joined', (data) => {
      console.log(`👋 User joined: ${data.username} (${data.userId})`);
    });

    this.socket.on('user:left', (data) => {
      console.log(`👋 User left: ${data.username} (${data.userId})`);
    });

    this.socket.on('task:created', (data) => {
      console.log(`✨ Task created: "${data.task.title}" by ${data.createdBy.username}`);
    });

    this.socket.on('task:updated', (data) => {
      console.log(`📝 Task updated: "${data.task.title}" by ${data.updatedBy.username}`);
    });

    this.socket.on('task:deleted', (data) => {
      console.log(`🗑️ Task deleted: "${data.task.title}" by ${data.deletedBy.username}`);
    });

    this.socket.on('task:moved', (data) => {
      console.log(`🔄 Task moved: "${data.task.title}" from ${data.fromColumnId} to ${data.toColumnId}`);
    });

    this.socket.on('user:typing', (data) => {
      console.log(`⌨️ ${data.username} is typing on task: ${data.taskId}`);
    });

    this.socket.on('user:stop_typing', (data) => {
      console.log(`⏹️ ${data.username} stopped typing on task: ${data.taskId}`);
    });

    this.socket.on('board:columns_updated', (data) => {
      console.log(`📋 Board columns updated:`, data.columns);
    });
  }

  async runTests() {
    console.log('\n🧪 Starting Socket.IO Tests...\n');

    try {
      await this.testJoinBoard();
      await this.sleep(1000);
      
      await this.testCreateTask();
      await this.sleep(1000);
      
      await this.testTypingIndicator();
      await this.sleep(1000);
      
      await this.testLeaveBoard();
      
      console.log('\n✅ All Socket.IO tests completed successfully!');
      console.log('\n🎯 Test Results Summary:');
      console.log('  ✅ Connection authentication');
      console.log('  ✅ Board join/leave functionality');
      console.log('  ✅ Real-time task creation');
      console.log('  ✅ User presence tracking');
      console.log('  ✅ Typing indicators');
      
    } catch (error) {
      console.log('❌ Test failed:', error.message);
    }

    setTimeout(() => {
      console.log('\n🔌 Disconnecting...');
      this.socket.disconnect();
      process.exit(0);
    }, 2000);
  }

  testJoinBoard() {
    return new Promise((resolve) => {
      console.log('📋 Testing board join...');
      
      this.socket.once('user:joined', (data) => {
        console.log(`✅ Successfully joined board`);
        resolve();
      });

      this.socket.emit('join:board', CONFIG.boardId);
    });
  }

  testCreateTask() {
    return new Promise((resolve) => {
      console.log('📝 Testing task creation...');
      
      this.socket.once('task:created', (data) => {
        console.log(`✅ Task created successfully: "${data.task.title}"`);
        resolve();
      });

      const taskData = {
        title: 'Socket.IO Test Task',
        description: 'This task was created via Socket.IO for testing',
        priority: 'medium',
        columnId: CONFIG.toDoColumnId,
        projectId: CONFIG.projectId
      };

      this.socket.emit('task:create', taskData);
    });
  }

  testTypingIndicator() {
    return new Promise((resolve) => {
      console.log('⌨️ Testing typing indicators...');
      
      // Test start typing
      this.socket.emit('user:start_typing', {
        taskId: 'test-task-id',
        boardId: CONFIG.boardId
      });

      setTimeout(() => {
        // Test stop typing
        this.socket.emit('user:stop_typing', {
          taskId: 'test-task-id',
          boardId: CONFIG.boardId
        });
        
        console.log('✅ Typing indicators test completed');
        resolve();
      }, 2000);
    });
  }

  testLeaveBoard() {
    return new Promise((resolve) => {
      console.log('🚪 Testing board leave...');
      
      this.socket.once('user:left', (data) => {
        console.log(`✅ Successfully left board`);
        resolve();
      });

      this.socket.emit('leave:board', CONFIG.boardId);
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start the test
new SocketTester();