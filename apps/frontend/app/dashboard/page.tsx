"use client"
import { GroupIcon } from "@/icons/grp"
import { LogoutIcon } from "@/icons/logout"
import { PlusIcon } from "@/icons/plus"
import {useRouter} from "next/navigation"
import { useEffect, useState,useRef } from "react"
import axios, {AxiosError} from "axios"
import { TrashIcon } from "@/icons/bin"
import { CopyIcon } from "@/icons/copy"
import { CancelIcon } from "@/icons/cancel"
import dynamic from "next/dynamic";
import { ToastContainer, toast } from 'react-toastify';
import { CheckIcon } from "@/icons/check"
import dotenv from 'dotenv';
dotenv.config();
import { BACKEND_URL } from "@/config";

const ClipLoader = dynamic(() => import("react-spinners").then((mod) => mod.ClipLoader), {
  ssr: false,
});

interface RoomType {
    adminId : string,
    createdAt : string,
    id : number | string,
    slug : string
}

export default function DashBoard(){

    // let rooms : RoomType[]=[]; 
    const [rooms,setRooms]=useState<RoomType[]>([]);
    const router=useRouter();
    const slug=useRef<HTMLInputElement>(null);
    const roomId=useRef<HTMLInputElement>(null);
    const [showCreate,setShowCreate]=useState(false);
    const [showJoin,setShowJoin]=useState(false);
    const [loaded,setLoaded]=useState(false);
    const [updated,setUpdated]=useState(false);
    const [logout,setLogout]=useState(false);
    const [remove,setRemove]=useState(-1); 
    const [spinner,setSpinner]=useState(false);
    const [width, setWidth] = useState(window.innerWidth);
    

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        
        window.addEventListener("resize", handleResize);
        
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(()=>{
        document.body.style.cursor='default';
        async function getRooms(){
            try{
                const token=localStorage.getItem('token');
                if(!token){
                    router.push('/signin')
                    return
                }
                const response=await axios.get(`${BACKEND_URL}/rooms`, {
                    headers: {
                        Authorization: token
                    }
                })
                setRooms(Object.values(response.data.rooms.rooms));
                setLoaded(true);
            }
            catch(e){
                console.log('error while fetching rooms : '+e);
            }
        }
        getRooms();
    },[showCreate,showJoin,updated]);

    async function createRoom(){
        const loadingToast=toast.loading('Creating Room',{
            position: "top-center",
            theme:"dark",
            autoClose:false
        }) 
        setSpinner(true);
        try{
            const token=localStorage.getItem('token');
            const response=await axios.post(`${BACKEND_URL}/room`, {
                roomName : slug.current?.value
            },
            {
                headers: {
                    Authorization: token
                }
            })
            toast.dismiss(loadingToast);

            console.log(response);
            setShowCreate(false);
            toast.success('Room created successfully!', {
                position: "top-center",
                autoClose: 3000,
                theme:"dark"
            })
        }catch(e){
            toast.dismiss(loadingToast);

            if (axios.isAxiosError(e)) {
                if(e.message=='Request failed with status code 403'){
                    toast.error('room with the same name already exists.', {
                        position: "top-center",
                        autoClose: 3000,
                        theme:"dark"
                    })
                }
                else if(e.message=='Request failed with status code 404'){
                    toast.error('room must have some name.', {
                        position: "top-center",
                        autoClose: 3000,
                        theme:"dark"
                    })
                }
                else if(e.message=='Request failed with status code 401'){
                    toast.error('Unknown server error, unable to create room.', {
                        position: "top-center",
                        autoClose: 3000,
                        theme:"dark"
                    })
                }
                console.log(e.message);
                console.log('error while creating room : '+e);
                }
        }
        setSpinner(false);
    }

    async function JoinRoom(){
        const loadingToast=toast.loading('Joining Room',{
            position: "top-center",
            theme:"dark",
            autoClose:false
        }) 
        setSpinner(true);
        try{
            const token=localStorage.getItem('token');
            const id=roomId.current?.value
            
            const response=await axios.get(`${BACKEND_URL}/room/${id}`,{
                headers: {
                    Authorization: token
                }
            })
            toast.dismiss(loadingToast);

            console.log(response);
            const existingRooms=rooms;
            existingRooms.push(response.data.room);
            setRooms(existingRooms);
            setShowJoin(false);
            toast.success('Room joined successfully!', {
                position: "top-center",
                autoClose: 3000,
                theme:"dark"
            })
        }catch(e){
            toast.dismiss(loadingToast);
            if (axios.isAxiosError(e)) {
                setSpinner(false);
                if(e.response?.status==404){
                    toast.error('unable to find room.', {
                        position: "top-center",
                        autoClose: 3000,
                        theme:"dark"
                    })
                }
                else if(e.response?.status==403){
                    toast.error('unable to join room.', {
                        position: "top-center",
                        autoClose: 3000,
                        theme:"dark"
                    })
                }
            }
            console.log('error while joining room : '+e);
        }
        setSpinner(false);
    }

    async function deleteRoom(){
        const loadingToast=toast.loading('Deleting Room',{
            position: "top-center",
            theme:"dark",
            autoClose:false
        }) 
        setSpinner(true);
        try{
            if(remove==-1) return;
            const token=localStorage.getItem('token');
            const response=await axios.delete(`${BACKEND_URL}/room/${remove}`, {
                headers: {
                    Authorization: token
                }
            })
            toast.dismiss(loadingToast);

            setUpdated(!updated); 
            setRemove(-1);  
            console.log(response);
            toast.success('Room removed successfully!', {
                position: "top-center",
                autoClose: 3000,
                theme:"dark"
            })
        }catch(e){
            toast.dismiss(loadingToast);
            if (axios.isAxiosError(e)) {
                if(e.message=='Request failed with status code 404'){
                    toast.error('unable to find room.', {
                        position: "top-center",
                        autoClose: 3000,
                        theme:"dark"
                    })
                }
                else {
                    toast.error('server error, unable to delete room.', {
                        position: "top-center",
                        autoClose: 3000,
                        theme:"dark"
                    })
                }
            }
            console.log('error while deleting room : '+e);
        }
        setSpinner(false);
    }


    function signOut(){
        const loadingToast=toast.loading('Logging Out.',{
            position: "top-center",
            theme:"dark",
            autoClose:false
        }) 
        setSpinner(true);
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        router.push('/');
        setSpinner(false);
        toast.dismiss(loadingToast);
    }

    return <div className={`relative min-h-screen bg-zinc-900 w-full duration-500 transition-all `}>
        <ToastContainer />

        <div className="fixed top-20 -left-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-700" />

        <div className={`z-50 w-full top-0 left-0 fixed bg-zinc-900  flex justify-between items-center py-3 ${width>=900 && 'px-24'} ${width<900 && width>=764 && 'px-12'} ${width<764 && width>=540 && 'px-6'} ${width<540 && 'px-3'} border-b-2 border-zinc-700 ${showCreate || showJoin || logout || remove!=-1 ? "pointer-events-none blur-sm" : ""} `}>
            <div>
                <img src="logo.png" alt="logo" className='h-6'/>
            </div>
            <div className="flex gap-8">
                
                <div
                 onClick={()=>setLogout(true)}
                 className={`rounded-3xl tracking-wider ${width<=540 && 'text-sm'} duration-500 transition-all bg-zinc-700 text-zinc-100 gap-2 font-semibold flex items-center font-sans  px-4 py-1 hover:cursor-pointer hover:bg-zinc-800 `}>
                    <LogoutIcon color="#ffffff"/>
                    Logout
                </div>
            </div>
            
        </div>

        <div className={`${width<=820 ? 'px-8' : 'px-24'} py-16 w-full flex gap-2 ${showCreate || showJoin || logout || remove!=-1 ? "pointer-events-none blur-sm" : ""} `}>

            <div className={`flex gap-1 flex-col w-2/3 ${width<1320 && 'w-full'} mt-5 h-auto text-3xl text-zinc-400 `}> 

                        {width<1320 && <div className={` ${width>=1320 && 'right-24'} p-5   ${width<768 ? 'flex flex-col p-0' : 'flex justify-between'} pb-10 border-b border-zinc-700 h-auto flex-1 gap-5 `}>
                            <div onClick={()=>{setShowCreate(true)}} className={` ${width<768 ? 'w-full' : 'w-1/2'}  flex flex-col gap-2 h-auto bg-zinc-700/20 backdrop-blur-sm rounded-md pt-2 p-5 shadow-lg shadow-zinc-500/10 hover:border-zinc-400 hover:cursor-pointer border border-zinc-700/50`}>
                                <div className="rounded-full w-fit p-1 ">
                                    <PlusIcon/>
                                </div>
                                <div className="flex flex-col justify-start gap-2 pl-2">
                                    <div  className={`font-semibold ${width>768 ? 'text-2xl' : 'text-xl'} font-sans text-zinc-100`}>Create Room</div>
                                    <p className={`font-normal text-zinc-400 ${width<768 ? 'text-sm tracking-wider' : 'text-lg'} font-sans`}>Start a new collaborative drawing session</p> 
                                </div>
                            </div>

                            <div onClick={()=>setShowJoin(true)} className={` ${width<768 ? 'w-full' : 'w-1/2'}  flex flex-col gap-2 h-auto bg-zinc-700/20 backdrop-blur-sm rounded-md pt-2  p-5 shadow-lg shadow-zinc-500/10 hover:border-zinc-400 hover:cursor-pointer border border-zinc-700/50`}>
                                <div className="rounded-full w-fit p-2 ">
                                        <GroupIcon size={"38"}/>
                                </div>
                                <div className="flex flex-col justify-start gap-2 pl-2">
                                    <div className={`font-semibold ${width>768 ? 'text-2xl' : 'text-xl'} font-sans text-zinc-100`}>Join Room</div> 
                                    <p className={`font-normal text-zinc-400 ${width<768 ? 'text-sm tracking-wider' : 'text-lg'} font-sans`}>Enter a room code to collaborate</p>
                                </div>
                            </div>
                        </div>}

                <div className="p-3 font-semibold text-2xl font-sans text-zinc-100">Your Rooms</div>

                {loaded ?
                    <div className="flex flex-col gap-5">
                        {rooms.length==0
                        ?
                            <div className="flex justify-center items-center text-xl text-zinc-200 w-full h-24 bg-zinc-700/10 backdrop-blur-sm rounded-md shadow-lg shadow-zinc-500/10 border border-zinc-700/50">No active room yet</div>
                        :
                            rooms.map((room,idx)=><Room key={idx} id={room.id} slug={room.slug} updated={updated} setUpdated={setUpdated} createdAt={room.createdAt} remove={remove} setRemove={setRemove}/>)
                        }
                    </div>
                    :
                    <div className="flex justify-center items-center text-xl text-zinc-200 w-full h-24 bg-zinc-700/10 backdrop-blur-sm rounded-md shadow-lg shadow-zinc-500/10 border border-zinc-700/50 ">
                        <ClipLoader  color="#94a3b8" size={40} />
                    </div>
                }
                
            </div>

            {width>=1320 && <div className={`fixed right-24 p-5 pr-0 flex flex-col h-[600px] flex-1 gap-5 `}>
                <div onClick={()=>{setShowCreate(true)}} className="flex flex-col gap-2 h-auto bg-zinc-700/20 backdrop-blur-sm rounded-md pt-2 p-5 shadow-lg shadow-zinc-500/10 hover:border-zinc-400 hover:cursor-pointer border border-zinc-700/50">
                    <div className="rounded-full w-fit p-1 ">
                        <PlusIcon/>
                    </div>
                    <div className="flex flex-col justify-start gap-2 pl-2">
                        <div  className="font-semibold text-2xl font-sans text-zinc-100">Create Room</div>
                        <p className='font-normal text-zinc-400 text-lg font-sans'>Start a new collaborative drawing session</p> 
                    </div>
                </div>

                <div onClick={()=>setShowJoin(true)} className="flex flex-col gap-2 h-auto bg-zinc-700/20 backdrop-blur-sm rounded-md pt-2  p-5 shadow-lg shadow-zinc-500/10 hover:border-zinc-400 hover:cursor-pointer border border-zinc-700/50 ">
                    <div className="rounded-full w-fit p-2 ">
                            <GroupIcon size={"38"}/>
                    </div>
                    <div className="flex flex-col justify-start gap-2 pl-2">
                        <div className="font-semibold text-2xl font-sans text-zinc-100">Join Room</div> 
                        <p className='font-normal text-zinc-400 text-lg font-sans'>Enter a room code to collaborate</p>
                    </div>
                </div>
            </div>}
        </div>

        {logout && 
            <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${width<912 ? 'w-[85%]' : 'w-1/3'} flex flex-col p-3 gap-2 h-auto bg-zinc-800 rounded-md  shadow-lg shadow-zinc-500/10 border border-zinc-700/50`}>
                <div className="flex w-full justify-between gap-10 items-center border-b border-b-zinc-400 pb-1">
                    <p className="font-semibold text-xl font-sans tracking-wider text-zinc-100">Confirm Logout</p>
                    <div onClick={()=>setLogout(false)} className="cursor-pointer hover:bg-zinc-700 rounded-full "><CancelIcon/></div>
                </div>
                <p className="font-normal text-wrap text-sm font-sans tracking-wider text-zinc-300">Are you sure you want to logout? You will need to sign in again to access your rooms.</p>

                {spinner ?
                    <div className="self-center"><ClipLoader  color="#94a3b8" size={25} /></div>
                        :
                    <div className="flex justify-end gap-2">
                        <div onClick={()=>setLogout(false)} className="bg-zinc-100 w-fit text-sm font-semibold font-sans text-zinc-900 hover:bg-zinc-300 tracking-wide rounded py-1 px-3 flex  justify-center items-center  hover:cursor-pointer">Cancel</div>
                        <div onClick={signOut} className="bg-zinc-900 w-fit text-sm font-semibold font-sans text-zinc-200  tracking-wide rounded py-1 px-3 flex  justify-center items-center hover:bg-red-500  hover:cursor-pointer">logout</div>
                    </div>
                }
                
            </div>
        }

        { remove!=-1 && 
            <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${width<912 ? 'w-[85%]' : 'w-1/3'} flex flex-col p-3 gap-2 h-auto bg-zinc-800 rounded-md  shadow-lg shadow-zinc-500/10 border border-zinc-700/50`}>
                    <div className="flex w-full justify-between gap-10 items-center border-b border-b-zinc-400 pb-1">
                        <p className="font-semibold text-xl font-sans tracking-wider text-zinc-100">Confirm Removal</p>
                        <div onClick={()=>setRemove(-1)} className="cursor-pointer hover:bg-zinc-700 rounded-full "><CancelIcon/></div>
                    </div>
                    <div className="font-normal text-wrap text-sm font-sans flex tracking-wider gap-1 text-zinc-300">
                        <p>{`Are you sure you want to remove the room with Id : ${remove} ?`}</p> 
                    </div>


                    {spinner ?
                        <div className="self-center"><ClipLoader  color="#94a3b8" size={25} /></div>
                        :
                        <div className="flex justify-end gap-2">
                            <div onClick={()=>setRemove(-1)} className="bg-zinc-100 w-fit text-sm font-semibold font-sans text-zinc-900 hover:bg-zinc-300 tracking-wide rounded py-1 px-3 flex  justify-center items-center  hover:cursor-pointer">Cancel</div>
                            <div onClick={deleteRoom} className="bg-zinc-900 w-fit text-sm font-semibold font-sans text-zinc-200  tracking-wide rounded py-1 px-3 flex  justify-center items-center hover:bg-red-500  hover:cursor-pointer">Remove</div>
                        </div>
                    }
            </div>
        }

        {showCreate && 
            <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${width<912 ? 'w-[85%]' : 'w-80'} flex flex-col p-3 gap-3 h-auto bg-zinc-800 rounded-md border border-zinc-700/50`}>
                <div className="flex w-full justify-between ">
                    <p className="font-semibold text-xl font-sans tracking-wider text-zinc-100">Room Name</p>
                    <div onClick={()=>setShowCreate(false)} className="cursor-pointer hover:bg-zinc-700 rounded-full "><CancelIcon/></div>
                </div>
                <input ref={slug} type="text" placeholder="Enter room name" className="p-2 bg-zinc-700 rounded placeholder:tracking-wide tracking-wider"></input>
                
                {spinner ?
                    <div className="self-center"><ClipLoader  color="#94a3b8" size={25} /></div>
                    :
                    <div onClick={createRoom} className="bg-zinc-100 w-fit self-end px-3 text-sm font-semibold font-sans text-zinc-900  tracking-wide rounded py-1 flex  justify-center items-center hover:bg-zinc-300 hover:cursor-pointer">Create Room</div>
                }
            </div>
        }

        {showJoin &&
            <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${width<912 ? 'w-[85%]' : 'w-80'} flex flex-col p-3 gap-3 h-auto bg-zinc-800 rounded-md border border-zinc-700/50`}>
                <div className="flex w-full justify-between ">
                    <p className="font-semibold text-xl font-sans tracking-wider text-zinc-100">Room Id</p>
                    <div onClick={()=>setShowJoin(false)} className="cursor-pointer hover:bg-zinc-700 rounded-full "><CancelIcon/></div>
                </div>
                <input ref={roomId} type="text" placeholder="Enter room Id" className="p-2 bg-zinc-700 rounded placeholder:tracking-wide tracking-wider"></input>
                
                {spinner ?
                    <div className="self-center"><ClipLoader  color="#94a3b8" size={25} /></div>
                    :
                    <div onClick={JoinRoom} className="bg-zinc-100 w-fit self-end px-3 text-sm font-semibold font-sans text-zinc-900  tracking-wide rounded py-1 flex  justify-center items-center hover:bg-zinc-300 hover:cursor-pointer">Join Room</div>
                }
            </div>
        }

    </div>
}

interface params{
    createdAt : string,
    id : number | string,
    slug : string,
    updated : boolean,
    setUpdated : (updated : boolean)=>void
    remove : number ,
    setRemove : (remove : number )=>void
}
function Room(props : params){

    const router=useRouter();
    const [people,setPeople]=useState(false); 
    const [width, setWidth] = useState(window.innerWidth);
    const [check,setCheck]=useState(false);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        
        window.addEventListener("resize", handleResize);
        
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    async function openCanvas(){
        const loadingToast=toast.loading('Entering Room Canvas.',{
            position: "top-center",
            theme:"dark",
            autoClose:false
        }) 
        router.push('/canvas/'+props.id);
        toast.dismiss(loadingToast)
    }

    async function copyToClipboard(){
        try {
            await navigator.clipboard.writeText(props.id as string);
            console.log("Copied to clipboard:", props.id);
            setCheck(true);
            setTimeout(()=>{
                setCheck(false);
            },2000)
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    }

    const [participants,setParticipants]=useState<{ name: string }[]>([{ name: 'you' }]);

    useEffect(()=>{
        async function showPeople(){
            try{
                const token=localStorage.getItem('token');
                if(!token){
                    router.push('/signin')
                    return
                }
                const response=await axios.get(`${BACKEND_URL}/room/participants/${props.id}`, {
                    headers: {
                        Authorization: token
                    }
                })
                setParticipants(Object.values(response.data.participants));
            }
            catch(e){
                console.log('error while fetching rooms : '+e);
            }
        }
        showPeople();
    },[])

    const names = participants.map(user => user.name || "Unknown");
    const curDate=props.createdAt.toString(); 
    const date = curDate.split('T')[0];
    return <div onClick={openCanvas} className={`relative overflow-visible  ${width<768 ? 'flex flex-col gap-2 p-4' : 'flex p-2 '} text-3xl text-zinc-400 w-full h-22 px-5 bg-zinc-700/10 border border-zinc-700/50 rounded hover:bg-zinc-700/30 `}>
        

        <div className={`flex flex-col ${width<768 ? 'w-full gap-2' : 'w-2/3'}`}>
            <p className="text-xl text-zinc-100 tracking-wider">{props.slug}</p>
            <div className={`${width<768 ? 'flex flex-col gap-0' : 'flex gap-10 '} items-baseline`}>
                <p className="text-base text-zinc-400 tracking-wider">{`created at : `+date}</p>
                <div className="flex gap-2 items-center">
                    <p className="text-base text-zinc-400 tracking-wider">{'roomId : '+props.id}</p>
                    <div onClick={(e)=>{
                        e.stopPropagation();
                        copyToClipboard();
                    }} className="cursor-pointer  hover:bg-zinc-900 p-1 rounded">{check ? <CheckIcon/> : <CopyIcon/>}</div>
                </div> 
            </div>
        </div>
        <div className="flex flex-1 justify-end gap-4 items-center">
            {people && 
                    <div className="absolute bg-zinc-800 border border-zinc-700/50 -translate-x-20 translate-y-10 rounded flex flex-col h-auto p-2 gap-1">
                        {names.map((person,idx)=><div className="text-xs text-zinc-200 font-sans tracking-widest" key={idx}>{person}</div>)}
                    </div>
            }
            <div onClick={(e)=>{
                e.stopPropagation();
                setPeople(!people);
            }} className="cursor-pointer hover:bg-zinc-900 gap-1 p-1 rounded flex items-center ">
                    <GroupIcon size={"24"}/>
                    <p className="text-sm text-zinc-200">{participants.length}</p>
            </div>
            
            <p onClick={openCanvas} className="text-sm text-zinc-100 tracking-wider cursor-pointer px-2 hover:bg-zinc-900 p-1 rounded">join</p>
            <div onClick={(e)=>{
                e.stopPropagation();
                props.setRemove(props.id as number);
            }} className="cursor-pointer hover:bg-red-500 p-1 rounded"><TrashIcon color={"#ffffff"}/></div>
        </div>
    </div>
}