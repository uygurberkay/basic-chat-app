const path = require('path');  //Local node.js packet
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage , generateLocationMessage} = require('./utils/messages');
const {addUser , getUser, getUserInRoom , removeUser} = require('./utils/users'); 

/*Generate new express application */
const app = express();
const server = http.createServer(app);
const io = socketio(server)

const port = process.env.PORT || 3000
/*html dosyasına bağlar */
const publicDirectoryPath = path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath))


// server(emit) -->client(receive) - countUpdated (acknowledge ---> server)
// client(emit) -->server(receive) - increment    (acknowledge ---> client)

/* Küçük harf-büyük harf dikkate alınıyor. */
io.on('connection', (socket) =>{ // Runs for each connection (client)
    console.log('New WebSocket connection')
    /*Send user a welcome message */
    
    socket.on('join',(options, callback)=>{
        const {error, user} = addUser({id : socket.id, ...options}) // ES6 syntax
        
        if(error){
            return callback(error)
        }
        
        
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome ChatApp'))    // Send it to single user
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`)) // Sent it all user except new one
        io.to(user.room).emit('roomData',{
            room : user.room,
            users:getUserInRoom(user.room)
        })
        callback()
        /*Bunların ne olduğunu tam olarak yaz not defterine */
        // socket.emit       io.emit     socket.broadcast.emit
        // io.to.emit        socket.broadcast.to.emit       
    })


    /*Sends users message to all users */
    socket.on('sendMessage', (message,callback) => {
        const filter = new Filter();
        const  user = getUser(socket.id)

        /*Küfür önleyici */
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username,message))    // Send it to all user
        callback('Delivered!')
    })

    /*Sends users location to all users */
    socket.on('sendLocation', (coords,callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))    // Send it to all user
        callback('Location shared!')
    })

    /*Send users a disconnection message */
    socket.on('disconnect',()=>{        // Listen to the event for disconnection
        const user = removeUser(socket.id)
        
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left the channel!`))    // Send it to all users
            io.to(user.room).emit('roomData',{
                room:user.room,
                users: getUserInRoom(user.room)
            })
        }
  
    })
})

server.listen(port,()=>{
    console.log('Server is up on port ' + port)
});