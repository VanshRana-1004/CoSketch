"use client";
import { useRef, useEffect, useState} from 'react';
import { Game } from '@/app/draw/game';
import { RectIcon } from '@/icons/rect';
import { CircleIcon } from '@/icons/circle';
import { DiamondIcon } from '@/icons/diamond';
import { ArrowIcon } from '@/icons/arrow';
import { PencilIcon } from '@/icons/pencil';
import { LineIcon } from '@/icons/line';
import { AlphaIcon } from '@/icons/alpha';
import { HandIcon } from '@/icons/hand';
import { EraserIcon } from '@/icons/eraser';
import { TrashIcon } from '@/icons/bin';
import { LogoutIcon } from '@/icons/logout';
import { PointerIcon } from '@/icons/pointer';
import { ThinIcon } from '@/icons/thinstroke';
import { MidIcon } from '@/icons/midstroke';
import { ThickIcon } from '@/icons/thickstroke';
import { DottedIcon } from '@/icons/dotted';
import { DashedIcon } from '@/icons/dashed';
import { useRouter } from 'next/navigation';

interface params{
    roomId : string
    socket : WebSocket
}

export function Canvas(props : params){
    const canvasRef=useRef<HTMLCanvasElement>(null);
    const [shape,setShape]=useState('select');
    const [width,setWidth]=useState(window.innerWidth);
    const [height,setHeight]=useState(window.innerHeight);   
    const eraseRef=useRef(false);
    const clicked=useRef(false);
    const [clear,setClear]=useState(false);
    const [game,setGame]=useState<Game>();
    const [type,setType]=useState('select');
    const [strokeColor,setStrokeColor]=useState('white');
    const [stColor,setStColor]=useState('white');
    const [stFill,setStFill]=useState('transparent');
    const [stWidth,setStWidth]=useState(1.5);
    const [stStyle,setStStyle]=useState('solid'); // dotted,dashed

    useEffect(() => {
        const handleResize = () => {
          setWidth(window.innerWidth);
          setHeight(window.innerHeight)  
        };
    
        window.addEventListener("resize", handleResize);
        
        return () => {
          window.removeEventListener("resize", handleResize);
        };
    }, []);

    document.addEventListener('keydown',(e:KeyboardEvent)=>{
        if(e.key=='0'){
            setType('pan');
            setShape('pan');
            eraseRef.current=false;
            clicked.current=false;   
        }
        else if(e.key=='1'){
            setType('select');
            setShape('select');
            eraseRef.current=false;
            clicked.current=false;
        }
        else if(e.key=='2'){
            setType('rectangle');
            setShape('rectangle');
            eraseRef.current=false;
            clicked.current=false;
        }
        else if(e.key=='3'){
            setType('circle');
            setShape('circle');
            eraseRef.current=false;
            clicked.current=false;
        }
        else if(e.key=='4'){
            setType('diamond');
            setShape('diamond');
            eraseRef.current=false;
            clicked.current=false;
        }
        else if(e.key=='5'){
            setType('arrow');
            setShape('arrow');
            eraseRef.current=false;
            clicked.current=false;
        }
        else if(e.key=='6'){
            setType('line');
            setShape('line');
            eraseRef.current=false;
            clicked.current=false;
        }
        else if(e.key=='7'){
            setType('pencil');
            setShape('pencil');
            eraseRef.current=false;
            clicked.current=false;
        }
        else if(e.key=='8'){
            setType('text');
            setShape('text');
            eraseRef.current=false;
            clicked.current=false;
        }
        else if(e.key=='9'){
            setType('eraser');
            setShape('eraser');
            eraseRef.current=true;
            clicked.current=false;
        } 
    })

    useEffect(()=>{
        game?.setTool(type);
    },[type,game]);

    useEffect(()=>{
        game?.setStrokeColor(strokeColor);
    },[strokeColor,game])

    useEffect(()=>{
        game?.setStrokeFill(stFill);
    },[stFill,game])

    useEffect(()=>{
        if(canvasRef.current && props.roomId){
            const canvas=canvasRef.current;
            const ctx=canvas.getContext('2d');
            if(!ctx) return;
            const obj=new Game(canvas,ctx,String(props.roomId),props.socket);
            setGame(obj);
            return ()=>{
                obj.destroy();
            }
        }
    },[canvasRef,clear]);

    useEffect(()=>{
        game?.setStrokeWidth(stWidth);
    },[stWidth,game]);

    useEffect(()=>{
       game?.setStyle(stStyle); 
    },[stStyle,game])

    const btnStyle=`px-1.5 py-1.5 rounded-md`; 
    const router=useRouter();
    const [msg,setMsg]=useState('');
    return <div className='bg-black px-auto'>
            <div className="absolute  items-center w-fit flex px-3 gap-3 p-1 mt-3 left-1/2 transform -translate-x-1/2 rounded-xl bg-zinc-800 ">
                <div className="flex pr-3 p-1 border-r-2 gap-3">
                    <button  onClick={()=>{
                        setType('pan');
                        setShape('pan');
                        eraseRef.current=false;
                        clicked.current=false;
                    }} onMouseEnter={()=>setMsg('panning')} onMouseLeave={()=>setMsg('')} className={`${btnStyle} ${shape=='pan'?'bg-blue-500':'bg-none'} ${shape!='pan' && 'hover:bg-zinc-500'}  `}><HandIcon/></button>
                    <button onClick={()=>{
                        setType('select');
                        setShape('select');
                        eraseRef.current=false;
                        clicked.current=false;
                    }} onMouseEnter={()=>setMsg('select a shape and move')} onMouseLeave={()=>setMsg('')}  className={`${btnStyle} ${shape=='select'?'bg-blue-500':'bg-none'} ${shape!='select' && 'hover:bg-zinc-500'} `}><PointerIcon/></button>
                    <button onClick={()=>{
                        setType('rectangle');
                        setShape('rectangle');
                        eraseRef.current=false;
                        clicked.current=false;
                    }} onMouseEnter={()=>setMsg('draw a rectangle')} onMouseLeave={()=>setMsg('')}  className={`${btnStyle} ${shape=='rectangle'?'bg-blue-500':'bg-none'} ${shape!='rectangle' && 'hover:bg-zinc-500'} `}><RectIcon/></button>
                    <button onClick={()=>{
                        setType('circle');
                        setShape('circle');
                        eraseRef.current=false;
                        clicked.current=false;
                    }} onMouseEnter={()=>setMsg('draw a circle')} onMouseLeave={()=>setMsg('')}  className={`${btnStyle} ${shape=='circle'?'bg-blue-500':'bg-none'} ${shape!='circle' && 'hover:bg-zinc-500'} `}><CircleIcon/></button>
                    <button onClick={()=>{
                        setType('diamond');
                        setShape('diamond');
                        eraseRef.current=false;
                        clicked.current=false;
                    }} onMouseEnter={()=>setMsg('draw a rhombus')} onMouseLeave={()=>setMsg('')}  className={`${btnStyle} ${shape=='diamond'?'bg-blue-500':'bg-none'} ${shape!='diamond' && 'hover:bg-zinc-500'} `}><DiamondIcon/></button>
                    <button onClick={()=>{
                        setType('arrow');
                        setShape('arrow');
                        eraseRef.current=false;
                        clicked.current=false;
                    }} onMouseEnter={()=>setMsg('draw an arrow')} onMouseLeave={()=>setMsg('')}  className={`${btnStyle} ${shape=='arrow'?'bg-blue-500':'bg-none'} ${shape!='arrow' && 'hover:bg-zinc-500'} `}><ArrowIcon/></button>
                    <button onClick={()=>{
                        setType('line');
                        setShape('line');
                        eraseRef.current=false;
                        clicked.current=false;
                    }} onMouseEnter={()=>setMsg('draw a line')} onMouseLeave={()=>setMsg('')}  className={`${btnStyle} ${shape=='line'?'bg-blue-500':'bg-none'} ${shape!='line' && 'hover:bg-zinc-500'} `}><LineIcon/></button>
                    <button onClick={()=>{
                        setType('pencil');
                        setShape('pencil');
                        eraseRef.current=false;
                        clicked.current=false;
                    }} onMouseEnter={()=>setMsg('free hand draw')} onMouseLeave={()=>setMsg('')}  className={`${btnStyle} ${shape=='pencil'?'bg-blue-500':'bg-none'} ${shape!='pencil' && 'hover:bg-zinc-500'} `}><PencilIcon/></button>
                    <button onClick={()=>{
                        setType('text');
                        setShape('text');
                        eraseRef.current=false;
                        clicked.current=false;
                    }} onMouseEnter={()=>setMsg('write something')} onMouseLeave={()=>setMsg('')}  className={`${btnStyle} ${shape=='text'?'bg-blue-500':'bg-none'} ${shape!='text' && 'hover:bg-zinc-500'} `}><AlphaIcon/></button>         
                    <button onClick={()=>{
                        setType('eraser');
                        setShape('eraser');
                        eraseRef.current=true;
                        clicked.current=false;
                    }} onMouseEnter={()=>setMsg('erase anything')} onMouseLeave={()=>setMsg('')}  className={`${btnStyle} ${shape=='eraser'?'bg-blue-500':'bg-none'} ${shape!='eraser' && 'hover:bg-zinc-500'} `}><EraserIcon/></button>
                </div>
                <button onClick={async ()=>{
                    props.socket.send(JSON.stringify({
                        type:'clear',
                        roomId:Number(props.roomId)
                    }))
                    setClear(!clear);
                    console.log('clear : '+props.roomId);
                }} className={`${btnStyle} bg-none hover:bg-red-500 py-1 h-fit`}><TrashIcon/></button>
                <button onClick={()=>{
                    router.push('/dashboard');
                }} 
                className={`${btnStyle} bg-none hover:bg-red-500 py-1 h-fit`}><LogoutIcon color="#ffffff"/> </button>
            </div>
            {msg!='' && <div className='absolute items-center w-fit px-3 py-0.5 top-20 bg-zinc-800 left-1/2 transform -translate-x-1/2 rounded-md  font-sans tracking-wide text-zinc-200 '>{msg}</div>}
        
            <div className="absolute top-1/4 w-fit h-auto flex py-5 px-3 gap-3 ml-3 rounded-xl bg-zinc-800 ">
                <div className='flex flex-col gap-5 w-full'>

                    <div>
                        <p className='text-sm mb-2 tracking-wide'>Stroke Color</p>
                        <div className='flex gap-2'>
                            <div className='flex gap-1 pr-2 border-r-2 '>
                            <div onClick={()=>{setStrokeColor('#f44336'),setStColor('red-500')}} className={`bg-red-500 rounded w-6 h-6  hover:cursor-pointer`}></div>
                            <div onClick={()=>{setStrokeColor('#4caf50'),setStColor('green-500')}} className={`bg-green-500 rounded w-6 h-6  hover:cursor-pointer`}></div>
                            <div onClick={()=>{setStrokeColor('#2196f3'),setStColor('blue-500')}} className={`bg-blue-500 rounded w-6 h-6  hover:cursor-pointer`}></div>
                            <div onClick={()=>{setStrokeColor('#fff500'),setStColor('yellow-500')}} className={`bg-yellow-500 rounded w-6 h-6  hover:cursor-pointer`}></div>
                            <div onClick={()=>{setStrokeColor('#ffffff'),setStColor('white')}} className={`bg-white rounded w-6 h-6  hover:cursor-pointer`}></div>
                            </div>
                            <div className={`bg-${stColor} rounded w-6 h-6`}/>
                        </div>
                    </div>                   

                    <div>
                        <p className='text-sm mb-2 tracking-wide'>Fill Color</p>
                        <div className='flex gap-2'>
                            <div className='flex gap-1 pr-2 border-r-2 '>
                            <div onClick={()=>setStFill('red-400')} className={`bg-red-400 rounded w-6 h-6 hover:cursor-pointer`}></div>
                            <div onClick={()=>setStFill('green-400')} className={`bg-green-400 rounded w-6 h-6 hover:cursor-pointer`}></div>
                            <div onClick={()=>setStFill('blue-400')} className={`bg-blue-400 rounded w-6 h-6 hover:cursor-pointer`}></div>
                            <div onClick={()=>setStFill('yellow-400')} className={`bg-yellow-400 rounded w-6 h-6 hover:cursor-pointer`}></div>
                            <div onClick={()=>setStFill('transparent')} className={`bg-[url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRw72PD4J_bRkmFTF5N8qxTpArZSydn_6s7MwmfzAqfkhQph7hYd_wvSGLuFTnIR1jrFfE&usqp=CAU')] rounded w-6 h-6 bg-cover bg-center hover:cursor-pointer`}></div>
                            </div>
                            <div className={`${stFill === 'transparent'? "bg-[url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRw72PD4J_bRkmFTF5N8qxTpArZSydn_6s7MwmfzAqfkhQph7hYd_wvSGLuFTnIR1jrFfE&usqp=CAU')] bg-cover bg-center": `bg-${stFill}`} rounded w-6 h-6`}/>
                        </div>
                    </div>

                    <div>
                        <p className='text-sm mb-2 tracking-wide'>Stroke Width</p>
                        <div className='flex justify-around'>
                            <div onClick={()=>{setStWidth(1.5)}} className={`px-2 rounded hover:cursor-pointer ${stWidth!=1.5 && 'hover:bg-zinc-500'} ${stWidth==1.5 && 'bg-blue-500'}`}><ThinIcon/></div>
                            <div onClick={()=>{setStWidth(3)}} className={`px-2 rounded hover:cursor-pointer ${stWidth!=3 && 'hover:bg-zinc-500'} ${stWidth==3 && 'bg-blue-500'}`}><MidIcon/></div>
                            <div onClick={()=>{setStWidth(5)}} className={`px-2 rounded hover:cursor-pointer ${stWidth!=5 && 'hover:bg-zinc-500'} ${stWidth==5 && 'bg-blue-500'}`}><ThickIcon/></div>
                        </div>
                    </div>

                    <div>
                        <p className='text-sm mb-2 tracking-wide'>Stroke Style</p>
                        <div className='flex justify-around'>
                            <div onClick={()=>{setStStyle('solid')}} className={`px-2 rounded hover:cursor-pointer ${stStyle!='solid' && 'hover:bg-zinc-500'} ${stStyle=='solid' && 'bg-blue-500'}`}><ThinIcon/></div>
                            <div onClick={()=>{setStStyle('dotted')}} className={`px-2 rounded hover:cursor-pointer ${stStyle!='dotted' && 'hover:bg-zinc-500'} ${stStyle=='dotted' && 'bg-blue-500'}`}><DottedIcon/></div>
                            <div onClick={()=>{setStStyle('dashed')}} className={`px-2 rounded hover:cursor-pointer ${stStyle!='dashed' && 'hover:bg-zinc-500'} ${stStyle=='dashed' && 'bg-blue-500'}`}><DashedIcon/></div>
                        </div>
                    </div>

                </div>
                
            </div>    
        <canvas ref={canvasRef} width={width} height={height}></canvas>      
    </div>

}