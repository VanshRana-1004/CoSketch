"use client"
import { CloudIcon } from '@/icons/cloud';
import { GroupIcon } from '@/icons/grp';
import { LightIcon } from '@/icons/lighting';
import { LinkedInIcon } from '@/icons/linkedin';
import { Pencil } from '@/icons/pencilicon';
import { ShareIcon } from '@/icons/share';
import { ToolIcon } from '@/icons/tool';
import { XIcon } from '@/icons/x';
import React from 'react';
import { useEffect,useState } from 'react';
import gsap from "gsap";
import ScrollToPlugin from "gsap/ScrollToPlugin";
import { useRouter } from 'next/navigation';
import { GithubIcon } from '@/icons/github';

gsap.registerPlugin(ScrollToPlugin);

export default function Landing() {

  useEffect(() => {
    document.querySelectorAll("a").forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (!href || href.startsWith("http")) return;
        e.preventDefault();
        if (href) {
          const target = document.querySelector(href); // Get the section element
          if (target) {
            gsap.to(window, { duration: 1, scrollTo: { y: target, autoKill: false } });
          }
        }
      });
    });
  }, []);

  const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        
        window.addEventListener("resize", handleResize);
        
        return () => window.removeEventListener("resize", handleResize);
    }, []);

  const router=useRouter();

  const imgArr=[
    {
      id:1,
      src:'tools.png',
      alt:'tools'
    },
    {
      id:2,
      src:'collab.png',
      alt:'collaboration'
    },
    {
      id:3,
      src:'dash.png',
      alt:'dashboard'
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(()=>{
    const intervalId=setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imgArr.length);
      }, 4000);
    return ()=>{
      clearInterval(intervalId);
    }  
  },[])

  return (
    <div className="min-h-screen bg-zinc-900 relative overflow-hidden">
      
      <div className="fixed top-20 -left-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="fixed top-60 left-96 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-700" />     
      <div className={`${width>=1280 && 'px-28 '} ${width<1280 && width>=912 && 'px-20 '} ${width<912 && width>=768 && 'px-12 '} ${width<768 && 'px-4 '} py-4 border-b-2 border-zinc-700 flex justify-between  items-center w-full relative`}>
        <div>
          <img src="logo.png" alt="logo" className='h-6'/>
        </div>
        <div className={`flex gap-16 ${width<912 && 'gap-4 '}  text-zinc-100 font-semibold font-sans `}>
          {width>=768 && 
          <a href="#features" className='p-1 px-4 rounded-2xl hover:bg-zinc-700 hover:cursor-pointer tracking-wider'>Features</a>
          }
          {width>=768 && 
          <div className='p-1 px-4 rounded-2xl hover:bg-zinc-700 hover:cursor-pointer tracking-wider'>Github</div>
          }
          <div onClick={()=>{
            router.push('/signin')
          }} className={`p-1 px-4 ${width<540 && 'px-2'} rounded-2xl hover:bg-zinc-700 hover:cursor-pointer tracking-wider ${width<540 && 'text-xs'}`}>Login</div>
          <div onClick={()=>{
            router.push('/signup')
          }} className={`p-1 px-4 ${width<540 && 'px-2'} rounded-2xl hover:cursor-pointer tracking-wider bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-zinc-100 duration-500 transition-all  hover:-translate-y-1 ${width<540 && 'text-xs'}`}>Try now</div>

        </div>
      </div>

      <div className={`flex p-28 py-16 pb-12 ${width<768 && 'py-8 pb-0'} ${width<1280 && 'px-8'} ${width<=1024 && 'px-8  justify-center'} relative`}>
          <div className="bg-none p-8">
            <div className="flex items-center justify-between gap-8">
              <div className="flex-1">
                <h1 className={`text-zinc-100 ${width>=768 ? 'text-8xl' : 'text-6xl'} font-medium tracking-tight mb-6`}>
                Collaborate, draw, and <br/>
                <p className={`w-fit h-fit px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl s-shape`}>
                  Learn!
                </p>
                </h1>
                <p className={`text-zinc-300 text-xl font-sans  tracking-wide`}>
                  Brainstorm, sketch, and collaborate seamlessly.
                </p>
              </div>
               
               {width>=1024 && <div className={`relative flex-1 perspective-[1000px] `}>
                <div 
                  className={`w-full ${width<1280 && 'h-[350px]'} h-[400px] rounded-lg overflow-hidden shadow-2xl transform-style-3d rotate-y-[-25deg] rotate-x-[15deg] hover:rotate-y-[-15deg] transition-transform duration-500`}
                  style={{
                    transformStyle: `preserve-3d`,
                  }}
                >
                
                  <img src="img.png"
                    alt="Abstract technology visualization"
                    className="w-full h-[400px]"/>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none"/>
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4/5 h-[20px] bg-black/50 blur-xl rounded-full"/>
              </div> }
            </div>
            </div>                  
      </div>

      <div className={`py-24 ${width<768 && 'py-8'} relative`}>
        <div className={` bg-zinc-800 ${width>=1280 && 'h-[620px] w-[75%]'} ${width<1280 && width>=912 && 'h-[480px] w-[90%]'} ${width<912 && width>=768 && 'h-[375px] w-[90%]'} ${width<768 && width>=512 && 'h-[280px] w-[90%]'} ${width<512 && 'h-[220px] w-[90%]'} mx-auto backdrop-blur-sm rounded-xl  overflow-hidden group `}>
          {imgArr.map((image, index) => (
            <img
              key={image.id}
              src={image.src}
              alt={image.alt}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {/* Dots Navigation */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {imgArr.map((_, index) => (
              <span
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-black scale-125" : "bg-gray-400"
                }`}
              ></span>
            ))}
          </div>   
        </div>        
      </div>            

      <div id="features" className={`w-full pt-4 p-12 ${width<=943 && 'pt-20 px-0'}  flex flex-col justify-center items-center relative`}>
          <div className={`justify-center text-4xl font-medium font-sans text-zinc-100 ${width<540 && 'text-2xl font-semibold'}`}>
              Robust Features
          </div>        
          <div className={`w-full gap-24 p-16 ${width>=1320 && 'grid grid-cols-3'} ${width<1320 && width>=943 && 'grid grid-cols-2'}   ${width<943 && 'flex flex-col gap-6 px-6'}  h-auto  `}>
               <Box heading='Real-time Collaboration' msg='Work together with your team in real-time, seeing changes as they happen.' Icon={1}/>
               <Box heading='Team Workspaces' msg='Create and manage multiple workspaces for different teams and projects.' Icon={2}/>
               <Box heading='Cloud Storage' msg='Automatically save and sync your drawings across all devices.' Icon={3}/>
               <Box heading='Lightning Fast' msg='Optimized performance for smooth drawing and collaboration experience.' Icon={4}/>
               <Box heading='Smart Drawing Tools' msg='Powerful yet intuitive tools that adapt to your creative workflow.' Icon={5}/>   
               <Box heading='Custom Styles' msg='Personalize your drawings with custom colors, fonts, and styles.' Icon={6}/>
          </div>
      </div>

      <div className={`flex flex-col py-16 ${width<540 && 'py-8'} w-full border-b-2 border-zinc-700 justify-center items-center h-auto gap-6 relative`}>
        <div className={`text-4xl font-medium ${width<540 && 'text-xl font-semibold'}  font-sans text-center text-zinc-100`}>Ready to start creating?</div>
        <div className={`text-zinc-400 text-xl ${width<540 && 'text-base'} px-3 font-sans text-wrap text-center`}>Join thousands of teams who trust DrawFlow for their visual collaboration needs.</div>
        <div onClick={()=>{
          router.push('/signup')
        }} className='w-fit px-5 py-3 rounded-full bg-zinc-700 text-lg text-zinc-200 hover:cursor-pointer shadow  hover:bg-zinc-800 hover:shadow-zinc-600 transition-all duration-300'>Get Started for Free</div>
      </div>            
      
        <div className={`flex justify-between items-center  w-full p-16 px-32 ${width<1280 && width>=912 && 'px-16'} ${width<912 && width>540 && 'px-8'} ${width<=540 && 'px-2 flex-col gap-6 '} h-auto relative`}>
          <div >
            <img src="logo.png" alt="" className={`h-10 ${width<400 && 'h-8'}`} />
          </div>
          <div className={`text-zinc-100 ${width>768 && 'text-end'}  text-3xl ${width<=768 && 'text-xl w-full text-center'} font-semibold font-sans`}>
            Collaborate. Create. Together.
          </div>
        </div>

        <div className={`flex w-full px-24 ${width<1280 && width>=912 && 'px-12'} ${width<912 && width>=540 && 'px-6'} && ${width<=540 && 'px-2 flex-col justify-center items-center gap-5'} h-auto justify-end items-center relative`}>
          <div className='flex gap-5 w-auto items-center'>
            <a href="https://www.linkedin.com/in/vansh-rana-a8b528261/" target="_blank" className=' hover:cursor-pointer hover:bg-zinc-800 rounded-xl p-2'><LinkedInIcon/></a>
            <a href="https://x.com/Rana2K5" target="_blank" className=' hover:cursor-pointer hover:bg-zinc-800 rounded-xl p-2'><XIcon/></a>        
            <a href="https://github.com/VanshRana-1004" target="_blank" className=' hover:cursor-pointer hover:bg-zinc-800 rounded-xl p-2'><GithubIcon/></a>        
          </div>
        </div>
                    
        <div className={`flex w-full py-16 px-24 ${width<768 && 'px-4'} h-auto justify-center text-zinc-400 relative`}>
          © 2025 CoSketch. All Rights Reserved.         
        </div>
    </div>
  );
}

interface params{
  heading : string,
  msg : string,
  Icon : number
}

function Box(props : params){
  
  const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        
        window.addEventListener("resize", handleResize);
        
        return () => window.removeEventListener("resize", handleResize);
    }, []);

  return (
    <div className={`flex flex-col gap-5 h-auto bg-zinc-800/80 backdrop-blur-sm rounded-md px-10 p-5 pb-8 ${width<768 && 'px-5'} shadow-lg shadow-zinc-500/10 duration-500 transition-all hover:-translate-y-5 hover:cursor-default border border-zinc-700/50`}>
      {props.Icon==1 && <ShareIcon/>}
      {props.Icon==2 && <GroupIcon size={"32"}/>}
      {props.Icon==3 && <CloudIcon/>}
      {props.Icon==4 && <LightIcon/>}
      {props.Icon==5 && <ToolIcon/>}
      {props.Icon==6 && <Pencil/>}
      <h1 className="font-semibold text-2xl font-sans text-zinc-100">{props.heading}</h1>
      <p className='font-normal text-zinc-400 text-lg font-sans'>{props.msg}</p>
    </div>
  );
}