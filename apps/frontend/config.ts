import dotenv from "dotenv";
dotenv.config();
export const BACKEND_URL=process.env.NEXT_PUBLIC_HTTP_BACKEND_URL;
export const WS_URL=process.env.NEXT_PUBLIC_WS_BACKEND_URL;