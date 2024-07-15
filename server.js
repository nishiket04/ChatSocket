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

async function setUserFriends(email,user,msg,room) {
  var data = { // send data formate
    userId: user,
    lastMessage : msg,
    room: room
  };
  
  try {
    const snapshot = await db.collection('users').doc(email).collection("userFriends").add(data); // createing new doccumnet and adding that data to that doument
  } catch (error) {
    console.error('Error fetching users:', error); // if any error
  }
}
// setUserFriends("abc04@gmail.com","nishiket04@gmail.com","45","ZZJvPQhpVcYa3mAtfe3c");


async function setLastMesseage(from,to,msg) {
  var data = { // send data formate
    lastMessage: msg
  };
  
  try {
    const snapshot = await db.collection('users').doc(from).collection("userFriends").where("userId","==",to).limit(1).get(); // createing new doccumnet and adding that data to that doument
    if (snapshot.empty) {
      console.log('No matching documents.');
      return;
    }

    // Update each document that matches the query
    snapshot.forEach(async (doc) => {
      await doc.ref.update(data);
      console.log(`Document with ID ${doc.id} successfully updated!`);
    });
  } catch (error) {
    console.error('Error fetching users:', error); // if any error
  }
}

// setLastMesseage('nishiket04@gmail.com',"abc04@gmail.com","41");

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

  socket.on('chat message', (from, to, msg,room) => { // This send chat to ther user
    const messageData = { // converted into JSON boject beacuse in android we set that only one JSON Object will be recived
      message: msg,
      from: from,
      to: to,
      room: room
  };
    socket.to(room).emit('chat message',messageData); // here we send that object to other user
    console.log("message:", msg);
    console.log("room",room);
    sendToChat(from,to,msg,room);
    setLastMesseage(from,to,msg);
    setLastMesseage(to,from,msg);
  });

  socket.on("new chat", async (userA, userB, msg) => { // when user try to chat with new user for the first time
    console.log("message:", msg);
    var room = await newChat(userA,userB,msg);
    setUserFriends(userA,userB,msg,room);
    setUserFriends(userB,userA,msg,room);

  });

  socket.on("stop typing", (room) => { // when user stop typing
    socket.to(room).emit("stop typing");
  })

  socket.on("typing", (room) => { // when user is typing
    socket.to(room).emit("typing");
  })

});
