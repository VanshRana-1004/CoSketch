"use client";
import { CancelIcon } from "@/icons/cancel";
import { CloseEyeIcon } from "@/icons/closeeye";
import { OpenEyeIcon } from "@/icons/openeye";
import axios from "axios";
import React, { useRef, useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ToastContainer, toast } from 'react-toastify';
import dotenv from "dotenv";
dotenv.config();
import { BACKEND_URL } from "@/config";

const ClipLoader = dynamic(() => import("react-spinners").then((mod) => mod.ClipLoader), {
  ssr: false,
});

interface params{
    isSignin : boolean
}
export function AuthPage(props : params){
    console.log(BACKEND_URL);
    const nameRef=useRef<HTMLInputElement>(null);
    const emailRef=useRef<HTMLInputElement>(null);
    const passwordRef=useRef<HTMLInputElement>(null);
    const [type,setType]=useState('password');
    const router=useRouter();
    const [spinner,setSpinner]=useState(false);
    const [width, setWidth] = useState(0);
    
    useEffect(() => {
        setWidth(window.innerWidth);
        
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    async function send(){
        setSpinner(true);
        
        if(props.isSignin){
            try{
                const response=await axios.post(`${BACKEND_URL}/signin`,{
                    email:emailRef.current?.value,
                    password:passwordRef.current?.value
                })
                console.log(response);
                localStorage.setItem('token',response.data.token);
                router.push('/dashboard')
                toast.success('signed in successfully!', {
                    position: "top-center",
                    autoClose: 3000,
                    theme:"dark"
                })
            }
            catch(e){
                if (axios.isAxiosError(e)) {
                    if(e.status==500){
                        toast.error('Server crashed.', {
                            position: "top-center",
                            autoClose: 3000,
                            theme:"dark"
                        })
                    }
                    if(e.message=='Request failed with status code 401'){
                        toast.error('Incorrect format.', {
                            position: "top-center",
                            autoClose: 3000,
                            theme:"dark"
                        })
                    }
                    else if(e.message=='Request failed with status code 402'){ 
                        toast.error('server error please try again later.', {
                            position: "top-center",
                            autoClose: 3000,
                            theme:"dark"
                        })
                    }  
                    else if(e.message=='Request failed with status code 403'){
                        toast.error('user not found.', {
                            position: "top-center",
                            autoClose: 3000,
                            theme:"dark"
                        })
                    }
                    else if(e.message=='Request failed with status code 405'){
                        toast.error('Wrong password', {
                            position: "top-center",
                            autoClose: 3000,
                            theme:"dark"
                        })
                    }
                    else if(e.message=='Request failed with status code 404'){
                        toast.error('Unknown Server Error.', {
                            position: "top-center",
                            autoClose: 3000,
                            theme:"dark"
                        })
                    }
                    console.log('error : '+e.message);
                }
            }
        }
        else{
            try{
                const response=await axios.post(`${BACKEND_URL}/signup`,{
                    email:emailRef.current?.value,
                    password:passwordRef.current?.value,
                    name:nameRef.current?.value
                })
                console.log(response);
                if(nameRef.current) localStorage.setItem('name',nameRef.current?.value);
                router.push('/signin')
                toast.success('signed up successfully!', {
                    position: "top-center",
                    autoClose: 3000,
                    theme:'dark'
                })
            }
            catch(e){
                if (axios.isAxiosError(e)) {
                    if(e.message=='Request failed with status code 401'){
                        toast.error('Incorrect format.', {
                            position: "top-center",
                            autoClose: 3000,
                            theme:"dark"
                        })
                    }
                    else if(e.message=='Request failed with status code 403'){ 
                        toast.error('user with the same email id already exists.', {
                            position: "top-center",
                            autoClose: 3000,
                            theme:"dark"
                        })
                    }  
                    else if(e.message=='Request failed with status code 404'){
                        toast.error('Unknown server error please try again later.', {
                            position: "top-center",
                            autoClose: 3000,
                            theme:"dark"
                        })
                    }
                    console.log('error : '+e.message);  
                    console.log('error : '+e.message);
                }
            }
        }
        setSpinner(false);
    }
    
    return <div className="flex w-screen h-screen justify-center items-center bg-zinc-900">
        <ToastContainer />
        <div className="fixed top-20 -left-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="fixed top-60 left-96 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-700" />
        
        <div className={`p-5 gap-5 flex flex-col w-[400px] ${width<540 && 'w-[85%] p-3'} h-auto bg-zinc-800/80 backdrop-blur-2xl rounded-md shadow-lg shadow-zinc-500/10 border border-zinc-700/50`}>
            <div className="w-full flex justify-between items-center">
                <div className={`flex flex-col gap-2 font-semibold text-3xl ${width<540 && 'text-xl'}  font-sans text-zinc-100`}>
                    {props.isSignin?'Sign in to your account':'Create your account'}
                    <p className={`font-normal text-zinc-400 text-sm tracking-wider font-sans ${width<540 && 'tracking-normal'}`}>{props.isSignin?'Sign in to sketch ideas together on CoSketch.':'Sign up to start using CoSketch.'}</p>
                </div>
                <div onClick={()=>{
                    router.push('/')
                }} className="hover:cursor-pointer hover:bg-zinc-700 rounded-full"><CancelIcon/></div>
            </div>
            <div className="flex flex-col p-2 gap-3">
                {!props.isSignin &&
                <div className="flex flex-col gap-2">
                    <div className={`font-semibold text-xl ${width<540 && 'text-sm'} font-sans tracking-wider text-zinc-100 `}>Name</div>
                    <input ref={nameRef} className="p-2 bg-zinc-700 rounded placeholder:tracking-wide tracking-wide" type="text" placeholder="Enter your name"/>
                </div>
                }
                <div className="flex flex-col gap-2">
                    <div className={`font-semibold text-xl font-sans tracking-wider text-zinc-100 ${width<540 && 'text-sm'}`}>Email</div>
                    <input ref={emailRef} className="p-2 bg-zinc-700 rounded placeholder:tracking-wide tracking-wide" type="text" placeholder="Enter your email-id"/>
                </div>
                <div className="flex flex-col gap-2">
                    <div className={`font-semibold text-xl font-sans tracking-wider text-zinc-100 ${width<540 && 'text-sm'}`}>Password</div>
                    <div className="flex p-2 bg-zinc-700 rounded justify-between focus:ring-1 focus:outline-white group focus-within:ring-1 focus-within:ring-white">
                        <input ref={passwordRef} className="bg-zinc-700 w-full rounded placeholder:tracking-wide tracking-wide focus:ring-0 focus:outline-none" type={type} placeholder={`${props.isSignin?'Enter your password':'Create your password'}`}/>
                        <div className="hover:bg-zinc-800 hover:cursor-pointer rounded-full " onClick={()=>{
                            if(type=='password') setType('type')
                            else setType('password')
                        }}>{type=='password'?<OpenEyeIcon/>:<CloseEyeIcon/>}</div>    
                    </div>
                </div>
                    <div onClick={send} className="mt-3 bg-zinc-900 w-full text-md font-semibold font-sans text-zinc-200  tracking-wider rounded py-2 h-12 flex  justify-center items-center border border-zinc-900 hover:border-zinc-400 hover:cursor-pointer">
                    {spinner ?
                        <div className="self-center"><ClipLoader  color="#94a3b8" size={25} /></div>
                        :
                        <div>{props.isSignin?'Sign in':'Sign up'}</div>
                    }
                    </div>
            </div>
            <div className="w-full flex justify-center items-center">
                {props.isSignin?
                <div className="flex gap-2">
                    <p className="font-normal text-zinc-400 font-sans tracking-wide">Create an account? </p>
                    <p onClick={()=>{
                        router.push('/signup')
                    }} className="text-blue-500 border-b border-b-transparent hover:border-b-blue-500 hover:cursor-pointer">Sign up</p>
                </div>
                :
                <div className="flex gap-2">
                    <p className="font-normal text-zinc-400 font-sans tracking-wide">Already have an account? </p> 
                    <p onClick={()=>{
                        router.push('/signin')
                    }} className="text-blue-500 border-b border-b-transparent hover:border-b-blue-500 hover:cursor-pointer">Sign in</p>
                </div>
                }
            </div>
        </div>
    </div>
}