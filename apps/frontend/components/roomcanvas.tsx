"use client";
import { useEffect, useRef, useState } from "react"
import { WS_URL } from "@/config";
import { Canvas } from "./canvas";
import dynamic from "next/dynamic";

const GridLoader = dynamic(() => import("react-spinners").then((mod) => mod.GridLoader), {
  ssr: false,
});

interface params{
    roomId : string 
}

export default function RoomCanvas(props : params){
    const [socket,setSocket]=useState<WebSocket | null>(null);
    useEffect(()=>{
        const token=localStorage.getItem('token');
        const ws=new WebSocket(`${WS_URL}?token=${token}`);
        ws.onopen=()=>{
            setSocket(ws);
            ws.send(JSON.stringify({
                type : "join_room",
                roomId : props.roomId
            }))
        }
    },[]);

    if(!socket){
        return <div className="flex justify-center items-center h-screen">
            <GridLoader  color="#ffffff" size={30} />
        </div>
    }

    return <div>
        
        <Canvas roomId={props.roomId} socket={socket} />
    </div>
}