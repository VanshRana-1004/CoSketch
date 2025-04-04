import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import { middleware } from "./middleware";
import { CreateRoomSchema, CreateUserSchema,SigninSchema } from "@repo/common/types";
import { prismaClient } from "@repo/postgress-db/client";
import bcrypt from "bcrypt";

const jwtSecret=process.env.JWT_SECRET as string;
const app=express();
app.use(express.json());
app.use(cors());

app.post('/signup',async (req,res)=>{
    const parseData=CreateUserSchema.safeParse(req.body);
    if(parseData.success){
        try{
            const email=parseData.data.email;
            const password=parseData.data.password;
            const name=parseData.data.name; 
            const hashedPassword=await bcrypt.hash(password,5);
            // check if user already exists
            const response=await prismaClient.user.findFirst({
                where : {
                    email 
                }
            })
            if(response!=null){
                res.status(403).json({
                    error : 'user with the same email id already exists.'
                })
                return
            }
            // if no user with same email exists, create a new user
            await prismaClient.user.create({
                data: {
                    email:email,
                    password:hashedPassword,
                    name:name
                }
            })
            res.status(200).json({
                message : 'user signed up successfully!'
            })
        }
        catch(e){
            res.status(404).json({
                error  : 'unknown error while signing up.',
            })
        }
    }
    else{
        res.status(401).json({
            error : 'Incorrect format',
        })
    }
})

app.post('/signin',async (req,res)=>{
    console.log('Sign In request');
    const parseData=SigninSchema.safeParse(req.body);
    if(parseData.success){
        const email=parseData.data.email;
        const password=parseData.data.password;

        try{
            // search for the user in database on the basis of email
            const response=await prismaClient.user.findFirst({
                where :{
                    email
                }
            })
            console.log(response);
            // if user not found
            if(response==null){
                console.log('No user found with the given email')
                res.status(403).json({
                    message : 'No user found with the given email.'
                })
                return
            }
            const hashedPassword=response.password;
            const isValidPassword=await bcrypt.compare(password,hashedPassword);
            // if password not matched
            if(!isValidPassword){
                console.log('Wrong Password');
                res.status(405).json({
                    message : 'Wrong Password'
                })
                return
            }

            const userId=response.id;
            // get the ID from db and return token
            const token=jwt.sign({
                userId
            },jwtSecret as string);
            res.status(200).json({
                token : token,
                message : 'User signed in successfully!'
            })
        }
        catch(e){
            console.log('unable to create a token : '+e)
            res.status(402).json({
                error : e,
                message : 'unable to create a token'
            })
        }
    }
    else{
        res.status(401).json({
            message : 'Incorrect format',
        })        
    }
})

app.get("/chat/:roomId",async (req,res)=>{
    try{
        const roomId=Number(req.params.roomId);
        console.log(roomId);
        const message=await prismaClient.chat.findMany({
            where :{
                roomId : roomId
            }
        })
        res.status(200).json({
            message 
        })
    }
    catch(e){
        res.status(403).json({
            error : e
        })
    }
})

app.get("/room/:id",middleware,async (req,res)=>{
    try{
        const adminId=req.userId;
        const id=req.params.id ;
        const room=await prismaClient.room.findUnique({
            where :{
                id : Number(id)
            }
        })
        if(room){
            await prismaClient.user.update({
                where: { id: adminId }, // Find user by ID
                data: {
                    rooms: {
                        connect: { id: room.id } // Connect user to room
                    }
                }
            });
            res.status(200).json({
                room
            })
        }
        else{
            res.status(404).json({
                error : 'unable to find room'
            })
        }
    }catch(e){
        res.status(403).json({
            error : e
        })
    }
    
})

app.post("/room",middleware,async (req,res)=>{
    const parseData=CreateRoomSchema.safeParse(req.body);
    console.log('create room request')
    if(parseData.success){
        try{
            const userId=req?.userId || '';
            const checkRoom=await prismaClient.room.findFirst({
                where : {
                    slug : parseData.data.roomName
                }
            })
            if(checkRoom!=null){
                res.status(403).json({
                    message : 'room with the same name already exists.'
                })
                return;
            }
            const room=await prismaClient.room.create({
                data : {
                    slug : parseData.data.roomName,
                    adminId : userId,
                    users: {
                        connect: [{ id: userId }]
                    }
                }
            })
            res.status(200).json({
                roomId : room.id
            })
        }
        catch(e){
            res.status(401).json({
                message : 'unknown server error',
                error : e
            })
        }
    }
    else{
        res.status(404).json({
            message : "room must have some name."
        })
        return;
    }
    
})

app.get('/rooms',middleware,async (req,res)=>{
    console.log('rooms request')
    try{
        const adminId=req.userId;
        const rooms = await prismaClient.user.findUnique({
            where: { id: adminId },
            select: { rooms: true },
        })
        res.status(200).json({
            rooms
        })
    }
    catch(e){
        res.status(403).json({
            message : 'unable to fetch rooms',
            error : e
        })
    }
})

app.delete('/room/:id',middleware,async (req,res)=>{
    try{
        const adminId=req.userId;
        const id=req.params.id ;
        const room=await prismaClient.room.findUnique({
            where :{
                id : Number(id)
            }
        })
        if(room){
            await prismaClient.user.update({
                where: { id: adminId },
                data: {
                    rooms: {
                        disconnect: { id: room.id } // Remove the relation
                    }
                }
            });

            res.status(200).json({ message: "User removed from the room", room });
        } 
        else {
            res.status(404).json({ message: "Room not found" });
        }
    }catch(e){
        res.status(500).json({
            error : e,
            message : 'unable to delete room'
        })
    }
})

app.get('/room/participants/:id',middleware,async (req,res)=>{
    try {
        const id = Number(req.params.id);
        const room = await prismaClient.room.findUnique({
            where: { id: id },
            include: {
                users: {
                    select: {
                        name: true
                    }
                }
            }
        });
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }
        res.status(200).json({
            roomId: room.id,
            participants: room.users, // List of users in the room
        });
        return;
    } catch (e) {
        res.status(500).json({ 
            message : 'unable to find the participants',
            error : e
        });
        return;
    }
})

app.listen(3001); 