const http = require("http");
const express = require('express');
const io = require("socket.io")(3000, {
  cors: {
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

// This function send message to room in new document with that servers time stamp
async function sendToChat(from,to,msg,room) {
  var data = { // send data formate
    from: from,
    to: to,
    msg: msg,
    time: FieldValue.serverTimestamp()
  };
  
  try {
    const snapshot = await db.collection('chatRooms').doc(room).collection("chats").add(data); // createing new doccumnet and adding that data to that doument
  } catch (error) {
    console.error('Error fetching users:', error); // if any error
  }
}

// This function create new room for users new chats
async function newChat(from,to,msg) {
  var details = { // that new chat user details
    userA: from,
    userB: to
  }
  var data = { // send data formate
    from: from,
    to: to,
    msg: msg,
    time: FieldValue.serverTimestamp()
  };
  
  try {
    const snapshot = await db.collection('chatRooms').add(details); // createing new doccumnet in chatRoom for new chats and adding that two usr IDs
    if(snapshot!=null){ // if new doument is created 
      const chat = await db.collection('chatRooms').doc(snapshot.id).collection("chats").add(data); // then add message in chats collection in new documnet
      console.log("doumentID",snapshot.id);
      return snapshot.id; // returns doumnet id to user so it can store and use at further refrences as room id
    }
  } catch (error) {
    console.error('Error fetching users:', error); // if any error
  }
}
// newChat("nishiket04gmail.com","abc042gmail.com","byy");
// sendToChat("nishiket04gmail.com","abc042gmail.com","byy","ZZJvPQhpVcYa3mAtfe3c");

io.on('connection', (socket) => {

  console.log('a user connected', socket.id); // logs when user is connected and it's ID
  
  socket.on('disconnect', () => { // when  user is diconnectd it logs
    console.log('user disconnected');
  });

  socket.on('send name', (username) => {
    io.emit('send name', (username));
  });

  socket.on('joinRoom', (room) => { // fire when user joins a room in existing chats
    socket.join(room);
    console.log(`User joined room: ${room}`);
    socket.to(room).emit('message', `A new user has joined room: ${room}`);
  });

  socket.on('leaveRoom', (room) => { // fire when user go back ffrom that chat
    socket.leave(room);
    console.log(`User left room: ${room}`);
    socket.to(room).emit('message', `A user has left room: ${room}`);
  });

  socket.on('chat message', (from, to, msg,room) => { //
    socket.to(room).emit('chat message', msg);
    console.log("message:", msg);
    sendToChat(from,to,msg,room);
  });

  socket.on("new chat", (userA, userB, msg) => { // when user try to chat with new user for the first time
    console.log("message:", msg);
    newChat(userA,userB,msg);
  });

  socket.on("stop typing", () => { // when user stop typing

  })

  socket.on("typing", () => { // when user is typing
    socket.broadcast.emit("typing", "typing");
  })

});
