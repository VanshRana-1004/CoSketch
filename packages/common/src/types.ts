import {z} from "zod";

export const CreateUserSchema=z.object({
    email:z.string().min(3),
    password:z.string().min(8),
    name:z.string().min(3)
})

export const SigninSchema=z.object({
    email:z.string().min(3),
    password:z.string().min(8),
})

export const CreateRoomSchema=z.object({
    roomName : z.string().min(3)
})