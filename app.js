require('dotenv').config();
const express = require("express");
const app = express();
const port = 3000;
const Chat = require('./models/chatModel');
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/chat");
// const http=require('http').Server(app);
// const io = require('socket.io')(http);


const User=require('./models/userModel');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const userRoute = require("./routes/userRoutes");
app.use("/", userRoute);

var usp = io.of('/user-namespace');

usp.on('connection',async (socket) => {
  console.log('a user connected')
  var userId=socket.handshake.auth.token;
 await  User.findByIdAndUpdate({_id:userId},{$set:{is_online:'1'}})
//broadcast
socket.broadcast.emit('getOnlineUser',{user_id:userId});

socket.on('send message', async (message, receiver_id) => {
  // You can optionally broadcast the message to the recipient
  socket.to(receiver_id).emit('new message', { message, sender_id: userId });

  // Save chat to the database
  const newChat = new Chat({
      sender_id: userId,
      receiver_id,
      message
  });
  
  await newChat.save();
  usp.to(receiver_id).emit('new message', {
    message,
    sender_id: userId
});


});




  socket.on('disconnect',async () => {
    console.log('user disconnected');
    var userId=socket.handshake.auth.token;
      await User.findByIdAndUpdate({_id:userId},{$set:{is_online:'0'}})
      socket.broadcast.emit('getOfflineUser',{user_id:userId});
  });
});

server.listen(port, (req, res) => {
  console.log(`server is running ${port}`);
})
