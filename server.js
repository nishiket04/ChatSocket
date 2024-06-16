const http = require("http");
const express = require('express');
const io = require("socket.io")(3000,{
    cors:{
        origin: "*",
    }
});
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccount.json');

initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();
// firebase firetore is all setuped
// async function fetchUsers() {
//   try {
//     const snapshot = await db.collection('users').get();
//     // Process the snapshot here
//     snapshot.forEach((doc) => {
//       console.log(doc.id, '=>', doc.data());
//     });
//   } catch (error) {
//     console.error('Error fetching users:', error);
//   }
// }

// // Call the async function
// fetchUsers();

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
      console.log("message:",msg);
    });
  });
