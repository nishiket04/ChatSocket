const http = require("http");
const express = require('express');
const io = require("socket.io")(3000,{
    cors:{
        origin: "*",
    }
});

io.on('connection', (socket) => {
    console.log('a user connected',socket.id);
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('send name', (username) => { 
        io.emit('send name', (username)); 
    }); 
  
    socket.on('chat message', (msg) => {
      socket.broadcast.emit('chat message', msg);
      console.log("message:",msg)
    });
  });
