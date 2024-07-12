import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";


const Room = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState<string>('');
    const [myStream, setMyStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const handleUserJoined = useCallback((data:any)=>{
        const {email, id} = data;
        console.log(`${email} joined the room with id ${id}`);
        setRemoteSocketId(id);
    },[]);

    const handleCallUser = useCallback(async()=>{
        const stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
        const offer = await peer.getOffer();
        socket?.emit("user:call", {to: remoteSocketId, offer});
        setMyStream(stream);
    },[remoteSocketId, socket]);

    const handleIncomingCall = useCallback(async({from, offer}:any)=>{
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
        setMyStream(stream);
        const ans = await peer.getAnswer(offer);
        socket?.emit("call:accepted", {to: from, ans})
    },[socket]);

    const sendStream = useCallback(()=>{
        if (myStream) {
            console.log('Sending Stream');
            for(const track of myStream.getTracks()){
                peer.peer?.addTrack(track, myStream);
            }
            console.log('Stream Sent');
        }
    },[myStream]);

    const handleCallAccepted = useCallback(({from, ans}:any)=>{
        peer.setLocalDescription(ans);
        console.log('Call Accepted from', from);
        sendStream();
        
    },[sendStream]);

    const handleNegoNeededIncoming = useCallback(async({from, offer}:any)=>{
        const ans = await peer.getAnswer(offer);
        socket?.emit("peer:nego:done", {to: from, ans});
    },[socket]);

    const handleNegoNeededFinal = useCallback(async({ans}:any)=>{
        await peer.setLocalDescription(ans);
    },[])

    const handleNegoNeeded = useCallback(async()=>{
        const offer = await peer.getOffer();
        socket?.emit("peer:nego:needed", {offer, to: remoteSocketId});
    },[remoteSocketId, socket]);

    useEffect(()=>{
        peer.peer?.addEventListener("negotiationneeded", handleNegoNeeded);
        return()=>{
            peer.peer?.removeEventListener("negotiationneeded", handleNegoNeeded);
        }
    },[handleNegoNeeded]);

    useEffect(()=>{
        peer.peer?.addEventListener("track", (e)=>{
            const remoteStream = e.streams;
            setRemoteStream(remoteStream[0]);
        });
    },[]);

    useEffect(()=>{
        socket?.on("user:joined", handleUserJoined);
        socket?.on("incoming:call", handleIncomingCall);
        socket?.on("call:accepted", handleCallAccepted);
        socket?.on("peer:nego:needed", handleNegoNeededIncoming);
        socket?.on("peer:nego:final", handleNegoNeededFinal);
        return()=>{
            socket?.off("user:joined", handleUserJoined);
            socket?.off("incoming:call", handleIncomingCall);
            socket?.off("call:accepted", handleCallAccepted);
            socket?.off("peer:nego:needed", handleNegoNeededIncoming);
            socket?.off("peer:nego:final", handleNegoNeededFinal);
        }
    },[socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeededIncoming, handleNegoNeededFinal]);
  return (
    <div className="flex flex-col justify-center items-center mt-10">
        <h1 className="text-4xl font-bold">Room</h1>
        <h4 className="text-xl mt-4 font-semibold">{remoteSocketId?"You're Connected" : "No one in room"}</h4>
        {remoteSocketId && <button className="bg-blue-500 text-white p-2 mt-2 w-2/6" onClick={()=>{handleCallUser()}}>Start Call</button>}
        <div className="mt-4 flex gap-5">
        {myStream && <ReactPlayer playing muted height="200px" width="300px" url={myStream} />}
        {remoteStream && <ReactPlayer playing muted height="200px" width="300px" url={remoteStream} />}
        </div>
    </div>
  )
};

export default Room;