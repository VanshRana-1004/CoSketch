import { Request,Response,NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const jwtSecret=process.env.JWT_SECRET as string;

declare module 'express-serve-static-core' {
    interface Request {
        userId?: string;
    }
}

export function middleware(req : Request,res : Response,next : NextFunction){
    const token=req.headers['authorization'] ?? "";
    const decoded=jwt.verify(token,jwtSecret as string) ;
    if(typeof decoded == "string"){
        return;
    }
    if(decoded.userId){
        req.userId=decoded.userId
        next();
    }
    else{
        res.status(403).json({
            message : "unauthorized"
        })
    }
}