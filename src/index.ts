import 'dotenv/config';
import express from 'express';
import globalRouter from './global-router';
import { logger } from './logger';
import cors from 'cors';
import {Server, Socket} from 'socket.io';
import {createServer} from 'node:http';
import { IMessage } from './types/message';
import  Message  from './models/Message';
import mongoose from 'mongoose';
import connectDB from './db';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors:{
    origin: "*",
    methods: ["GET", "POST"]
  }
})
const PORT = process.env.PORT || 4000;

connectDB();

let socketsConnected = new Set();

app.use(cors());
app.use(logger);
app.use(express.json());


io.on("connection", onConnected);

async function onConnected(socket: Socket) {
  console.log("connected");
  console.log(socket.id);
  socketsConnected.add(socket.id);

  const existingMessages = await Message.find().sort('createdAt');
  socket.on("get-message", () => {
    // console.log(existingMessages)
    socket.emit("init-message", existingMessages);
  })

  io.emit("clients-total", socketsConnected.size);

  socket.on("disconnect", () => {
    console.log("disconnected");
    socketsConnected.delete(socket.id);
    io.emit("clients-total", socketsConnected.size);
  });

  socket.on('message', async (data: IMessage) => {
    const newMessage = new Message(data);
    await newMessage.save();

    const messages = await Message.find();

    // console.log(messages);
    socket.broadcast.emit('chat-message', messages);


  });

  socket.on('feedback', (data: string) => {
    console.log(data);
    if (data === '') {
      console.log('empty');
      socket.broadcast.emit('feedback-check', data);
    } else{
      console.log('not empty');
      socket.broadcast.emit('feedback-check', data);
    }
  });
}



server.listen(PORT, () => {
  console.log(`Server runs at http://localhost:${PORT}`);
});
