import {WebSocket,WebSocketServer} from "ws";
import jwt,{ JwtPayload } from "jsonwebtoken";
import { prismaClient } from "@repo/postgress-db/client";

const JWT_SECRET=process.env.JWT_SECRET as string;

const wss=new WebSocketServer({port:8080});

interface Message {
    message : string,  
    roomId : string,
    userId : string
}

interface ConnectedUser {
    ws : WebSocket,
    rooms : string[]
    userId : string
}

const UserArr : ConnectedUser[]=[];

function authenticateUser(token : string) : string | null{
    try{
        const decoded=jwt.verify(token,JWT_SECRET);
        if(typeof decoded=="string") return null;
        if(!decoded || !decoded.userId) return null;
        return decoded.userId;
    }catch(e){
        return null;
    }
}

wss.on('connection',function connection(ws,request){
    const url=request.url;
    if(!url) return;
    
    const queryParams=new URLSearchParams(url.split('?')[1]);
    const token=queryParams.get('token') ?? "";
    const userAuthentication=authenticateUser(token);
    
    if(userAuthentication==null){
        ws.close();
        return;
    }

    UserArr.push({
        ws : ws,
        rooms : [],
        userId : userAuthentication
    })

    ws.on('message',async function message(data){
        try{
            const parsedData=JSON.parse(data as unknown as string);
            if(parsedData.type === 'clear'){
                console.log('Clearing Request');
                const roomId=parsedData.roomId;
                await prismaClient.chat.deleteMany({
                    where:{
                        roomId:roomId
                    }
                }).catch(err=>console.error('Error in clearing data of a room.'))
                UserArr.forEach(user=>{
                    if(user.rooms.includes(String(roomId))){
                        user.ws.send(JSON.stringify({
                            type:"clear",
                        }))
                    }
                })
            }
            else if(parsedData.type==='join_room'){
                const user=UserArr.find(x=>x.ws===ws);
                if(user) user?.rooms.push(parsedData.roomId);
                else return;
            }
            else if(parsedData.type==='leave_room'){
                const user=UserArr.find(x=>x.ws===ws)
                if(!user) return;
                user.rooms=user?.rooms.filter(id=>id!==parsedData.roomId);
            }
            else if(parsedData.type==='chat'){
                const roomId=parsedData.roomId;
                const message=parsedData.shape;
                await prismaClient.chat.create({
                    data: {
                        message: JSON.stringify(message),
                        userId: userAuthentication,
                        roomId: roomId,
                    }
                }).catch(err=>console.error("DataBase entry Error"));
                UserArr.forEach(user=>{
                    if(user.rooms.includes(String(roomId))){
                        user.ws.send(JSON.stringify({
                            type:"chat",
                            message : message,
                            roomId : roomId,
                        }))
                    }
                })
            }
            else if(parsedData.type==='eraser'){
                const chatId=parsedData.chatId;
                const roomId=parsedData.roomId;
                if(chatId!=undefined){
                    const Id=await prismaClient.chat.findFirst({
                        where:{
                            roomId:roomId,
                            message:{
                                contains:JSON.stringify(chatId)
                            }
                        }
                    }).catch(err=>console.error('Error in founding Id.'));
                    if(Id){
                        await prismaClient.chat.delete({
                            where:{
                                id:Number(Id.id)
                            }
                        }).catch(err=>console.error('Error in deleting chat'))
                        UserArr.forEach(user=>{
                            if(user.rooms.includes(String(roomId))){
                                user.ws.send(JSON.stringify({
                                    type:"eraser",
                                    chatId : chatId,
                                    roomId : roomId,
                                }))
                            }
                        })
                    }
                }
            }
            else if (parsedData.type === 'select') {
                const roomId = parsedData.roomId;
                const chatId = parsedData.chatId;
                const shape=parsedData.shape;
                if(chatId!=undefined){
                    const Id=await prismaClient.chat.findFirst({
                        where:{
                            roomId:roomId,
                            message:{
                                contains:JSON.stringify(chatId)
                            }
                        }
                    }).catch(err=>console.error('Error in founding Id.'))
                    if(Id){
                        await prismaClient.chat.update({
                            where:{
                                id:Number(Id.id)
                            },
                            data:{
                                message:JSON.stringify(shape)
                            }
                        }).catch(err=>console.error('Error in updating chat'))
                        UserArr.forEach(user=>{
                            if(user.rooms.includes(String(roomId))){
                                user.ws.send(JSON.stringify({
                                    type:"select",
                                    chatId : chatId,
                                    roomId : roomId,
                                    shape : shape
                                }))
                            }
                        })
                    }
                }
            }
            else if(parsedData.type==='pan'){
                const roomId=parsedData.roomId;
                const existingShapes=parsedData.existingShapes;
                UserArr.forEach(user=>{
                    if(user.rooms.includes(String(roomId))){
                        user.ws.send(JSON.stringify({
                            type:"pan",
                            existingShapes : existingShapes   
                        }))
                    }
                })
            }
            else if(parsedData.type==='updatePan'){
                const roomId=parsedData.roomId;
                const shapes=parsedData.shapes;
                for(let i=0;i<shapes.length;i++){ 
                    const shape = shapes[i];
                    const existingRecord = await prismaClient.chat.findFirst({
                        where: { 
                            roomId: roomId,
                            message: { contains: `"chatId":"${shape.chatId}"` } 
                        }
                    });
            
                    if (existingRecord) {
                        console.log(existingRecord);
                        await prismaClient.chat.update({
                            where: { id: existingRecord.id }, 
                            data: { message: JSON.stringify(shape) }
                        });
            
                    } else {
                        console.log(`Shape with chatId ${shape.chatId} not found in DB`);
                    }
                }
                UserArr.forEach(user=>{
                    if(user.rooms.includes(String(roomId))){
                        user.ws.send(JSON.stringify({
                            type:"updatePan",
                        }))
                    }
                })
            }
        }
        catch(e){
            console.error("Error handling message:", e);
            ws.send(JSON.stringify({ error: "Invalid request format" }));
        }
        
    })
});