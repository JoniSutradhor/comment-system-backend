import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import commentRoutes from './routes/comments.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    // origin: process.env.CLIENT_URL || 'http://localhost:5173',
    origin: ['http://localhost:5173', 'https://comment-system-frontend-five.vercel.app'],
    methods: ['GET', 'POST']
  }
});

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-page', (pageId) => {
    socket.join(pageId);
    console.log(`User ${socket.id} joined page: ${pageId}`);
  });

  socket.on('new-comment', (data) => {
    io.to(data.pageId).emit('comment-added', data.comment);
  });

  socket.on('update-comment', (data) => {
    io.to(data.pageId).emit('comment-updated', data.comment);
  });

  socket.on('delete-comment', (data) => {
    io.to(data.pageId).emit('comment-deleted', data.commentId);
  });

  socket.on('like-comment', (data) => {
    io.to(data.pageId).emit('comment-liked', data);
  });

  socket.on('dislike-comment', (data) => {
    io.to(data.pageId).emit('comment-disliked', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});