import { Socket } from "socket.io";

const { Server } = require('socket.io');

const io = new Server(process.env.PORT || 8000, {
    cors: true
});

const emailToSocketId = new Map();
const socketIdToEmail = new Map();

io.on('connection', (socket:Socket)=>{
    console.log('Socket Connected', socket.id);
    socket.on('join:room', (data)=>{
        const {email, room} = data;
        console.log('Joining Room', email, room);
        emailToSocketId.set(email, socket.id);
        socketIdToEmail.set(socket.id, email);
        io.to(room).emit("user:joined", {email, id: socket.id});
        socket.join(room);
        io.to(socket.id).emit("room:join", data);
    });

    socket.on("user:call", ({to, offer})=>{
        io.to(to).emit("incoming:call", {from: socket.id, offer});
    });

    socket.on("call:accepted", ({to, ans})=>{
        io.to(to).emit("call:accepted", {from: socket.id, ans});
    });

    socket.on("peer:nego:needed", ({offer, to})=>{
        // console.log('Negotiation Needed', offer, to);
        io.to(to).emit("peer:nego:needed", {offer, from: socket.id});
    });
    
    socket.on("peer:nego:done", ({to, ans})=>{
        // console.log('Negotiation Done', ans, to);
        io.to(to).emit("peer:nego:final", {from: socket.id, ans});
    });
});