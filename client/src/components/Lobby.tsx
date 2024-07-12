import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";


const Lobby = () => {
    const [email, setEmail] = useState('');
    const [room, setRoom] = useState('');

    const socket = useSocket();
    const navigate = useNavigate();

    const handleSubmitJoin = useCallback((e:React.FormEvent)=>{
        e.preventDefault();
        socket?.emit('join:room', {email, room});
    },[email, room, socket]);

    const handleJoinRoom = useCallback((data: any)=>{
        const {email, room} = data;
        console.log('Joined Room', email, room);
        navigate(`/room/${room}`);
    },[navigate]);

    useEffect(()=>{
        socket?.on('room:join', handleJoinRoom);
        return()=>{
            socket?.off('room:join', handleJoinRoom);
        }
    },[socket, handleJoinRoom]);

  return (
    <div>
        <form className="flex flex-col justify-center items-center mt-10" onSubmit={handleSubmitJoin}>
        <input type="email" placeholder="Email ID" value={email} onChange={(e)=>{setEmail(e.target.value)}} className="border-2 p-2 w-2/6" />
        <input type="text" placeholder="Room ID" value={room} onChange={(e)=>{setRoom(e.target.value)}} className="border-2 p-2 w-2/6 mt-2" />
        <button type="submit" className="bg-blue-500 text-white p-2 mt-2 w-2/6">Join Room</button>
        </form>
    </div>
  )
};

export default Lobby;