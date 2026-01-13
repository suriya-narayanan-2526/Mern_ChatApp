const User = require('../models/User');
const Message = require('../models/Message');

// Helper function to create consistent room IDs
const createRoomId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User login event - BUG FIX: Immediate broadcast
    socket.on('user_login', async (userId) => {
      try {
        console.log(`User login attempt: ${userId}`);
        
        // Update user status to online
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            isOnline: true,
            socketId: socket.id,
            lastSeen: new Date()
          },
          { new: true }
        );

        if (!updatedUser) {
          console.error(`User not found: ${userId}`);
          return;
        }

        // Store userId in socket for later use
        socket.userId = userId;

        console.log(`User ${userId} marked as online`);

        // CRITICAL BUG FIX: Get all users and broadcast IMMEDIATELY
        const users = await User.find({}, 'name email bio profilePicture isOnline lastSeen')
          .sort({ isOnline: -1, name: 1 });
        
        // Emit to ALL clients including the one that just connected
        io.emit('user_list_updated', users);
        
        // Also emit directly to this socket to ensure it gets the update
        socket.emit('user_list_updated', users);
        
        console.log(`Broadcasted user list to all clients. Online users: ${users.filter(u => u.isOnline).length}`);

      } catch (err) {
        console.error('User login error:', err);
      }
    });

    // Join private room
    socket.on('join_private_room', async ({ currentUserId, otherUserId }) => {
      try {
        const roomId = createRoomId(currentUserId, otherUserId);
        socket.join(roomId);

        console.log(`User ${currentUserId} joined room ${roomId}`);

        // Load previous messages
        const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
        socket.emit('load_messages', messages);
      } catch (err) {
        console.error('Join room error:', err);
      }
    });

    // Send message (text or media)
    socket.on('send_message', async ({ senderId, senderName, receiverId, message, messageType, mediaUrl }) => {
      try {
        const roomId = createRoomId(senderId, receiverId);

        // Save message to database
        const newMessage = new Message({
          roomId,
          senderId,
          senderName,
          receiverId,
          message: message || '',
          messageType: messageType || 'text',
          mediaUrl: mediaUrl || null,
          timestamp: new Date()
        });

        await newMessage.save();

        // Emit message to room (both sender and receiver)
        io.to(roomId).emit('receive_message', newMessage);

        console.log(`Message sent in room ${roomId}, type: ${messageType}`);
      } catch (err) {
        console.error('Send message error:', err);
      }
    });

    // Delete message
    socket.on('delete_message', async ({ messageId, senderId, receiverId }) => {
      try {
        // Delete message from database
        const deletedMessage = await Message.findByIdAndDelete(messageId);

        if (deletedMessage) {
          const roomId = createRoomId(senderId, receiverId);

          // Emit delete event to room (both users)
          io.to(roomId).emit('message_deleted', messageId);

          console.log(`Message ${messageId} deleted from room ${roomId}`);
        }
      } catch (err) {
        console.error('Delete message error:', err);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        if (socket.userId) {
          // Update user status to offline
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            socketId: null,
            lastSeen: new Date()
          });

          // Broadcast updated user list
          const users = await User.find({}, 'name email bio profilePicture isOnline lastSeen')
            .sort({ isOnline: -1, name: 1 });
          io.emit('user_list_updated', users);

          console.log(`User ${socket.userId} is now offline`);
        }
      } catch (err) {
        console.error('Disconnect error:', err);
      }
    });
  });
};