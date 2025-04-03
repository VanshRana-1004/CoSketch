import { getExistingShapes } from "./http";
import { eraser_Shape } from "./eraser";
import { selectedShape } from "./select";

export interface Shape {
    type: string;
    startX: number;
    startY: number;
    height: number;
    width: number;
    points?: { x: number, y: number }[];
    text?: string;
    strokeStyle: string;
    strokeFill : string;
    stStyle : string;
    strokeWidth : number;
    chatId : string;
}

export class Game{

    private ctx : CanvasRenderingContext2D;
    private canvas : HTMLCanvasElement;
    private socket : WebSocket;
    private roomId : number | string;
    private existingShapes : Shape[];
    private clicked : boolean;
    private strokeColor : string;
    private strokeFill : string;
    private strokeWidth : number;
    private stStyle : string;
    private startX : number;
    private startY : number;
    private type : string;
    private tempPath : {x: number, y: number}[];
    private text : string;
    private seletedShapeChatId : string;
    private offsetX : number;
    private offsetY : number;
    private initialX : number;
    private initialY : number;
    
    private panning : boolean;
    private dx : number;
    private dy : number;

    constructor(canvas : HTMLCanvasElement,ctx: CanvasRenderingContext2D, roomId :  | string, socket : WebSocket){
        this.ctx = ctx;
        this.canvas = canvas;
        this.strokeColor = '#ffffff';
        this.strokeFill="transparent";
        this.stStyle='solid';
        this.strokeWidth = 1.5;
        this.socket = socket;   
        this.ctx.lineWidth=2;
        this.roomId = roomId;
        this.existingShapes = [];
        this.startX=0;
        this.startY=0;
        this.type='select';
        this.clicked = false;
        this.tempPath=[];
        this.offsetX=-1;
        this.offsetY=-1;
        this.initialX=0;
        this.initialY=0;
        this.dx=0;
        this.dy=0;
        this.panning=false;
        this.text='';
        this.seletedShapeChatId='';
        this.init();
        this.initMouseHandlers();
        this.initHandlers();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    printText() {
        if(this.type==='text'){
            const input = document.getElementById('input') as HTMLInputElement;
            if(input){
                const text = input.value;
                if(text.length>0){
                    this.ctx.fillStyle=this.strokeColor;
                    this.ctx.font='30px Arial';
                    this.ctx.fillText(text,this.startX,this.startY+20);
                    const shape : Shape = {
                        type: 'text',
                        startX: this.startX,
                        startY: this.startY,
                        height: 0,
                        width: 0,
                        text : text,
                        chatId : Date.now().toString(),
                        strokeStyle: this.strokeColor,
                        strokeFill:this.strokeFill,
                        strokeWidth:this.strokeWidth,
                        stStyle:this.stStyle
                    }                         
                    this.existingShapes.push(shape);   
                    this.send(shape);   
                    this.clicked=false;         
                }
                document.body.removeChild(input);    
            }
        }
    }

    setTool(shape: string) {
        this.printText();
        this.type = shape;
        if(this.type=='select') document.body.style.cursor = "default";
        else if(this.type=='eraser') document.body.style.cursor="cell";
        else if(this.type=='pan') document.body.style.cursor = "grab";
        else document.body.style.cursor = "crosshair";
        this.seletedShapeChatId='';
        this.offsetX=-1;
        this.offsetY=-1;
    }

    setStrokeColor(strokeColor : string){
        this.printText();
        this.strokeColor=strokeColor;
        this.ctx.strokeStyle=this.strokeColor;
    }

    setStrokeFill(strokeFill : string){
        this.printText();
        if(strokeFill==='blue-400') this.strokeFill='#42A5F5';
        else if(strokeFill==='red-400') this.strokeFill='#EF5350';
        else if(strokeFill==='yellow-400') this.strokeFill='#FFEE58';
        else if(strokeFill==='green-400') this.strokeFill='#66BB6A';
        else this.strokeFill='transparent';
    }

    setStrokeWidth(stWidth : number){
        this.strokeWidth=stWidth
    }

    setStyle(stStyle : string){
        this.stStyle=stStyle;
    }

    async init(){
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers(){
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if(data.type==='chat'){
                const shape = data.message;
                const chatId = shape.chatId;
                if(this.existingShapes.find(x=>x.chatId===chatId)) return;
                this.existingShapes.push(shape);
                this.clearCanvas();
            }
            else if(data.type==='clear'){
                this.existingShapes=[];
                this.clearCanvas();
            }
            else if(data.type==='eraser'){
                const chatId = data.chatId;
                if(this.existingShapes.find(x=>x.chatId===chatId)) {
                    this.existingShapes = this.existingShapes.filter(x=>x.chatId!==chatId);
                }
                this.clearCanvas();
            }
            else if(data.type==='select'){
                const chatId = data.chatId;
                if(this.existingShapes.find(x=>x.chatId===chatId)){
                    const shape = data.shape;
                    const index = this.existingShapes.findIndex(x=>x.chatId===chatId);
                    this.existingShapes[index] = shape;
                    this.clearCanvas();
                } 
            }
            else if(data.type==='pan'){
                this.existingShapes = data.existingShapes;
                this.clearCanvas();
                this.socket.send(JSON.stringify({
                    type:'updatePan',
                    shapes : this.existingShapes,
                    roomId:Number(this.roomId) 
                }));
            }
            else if(data.type==='updatePan'){
                this.clearCanvas();
            }
        }
    }

    initMouseHandlers(){
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }

    putInput(){
        const input = document.createElement('input');
        let width = this.canvas.width-this.startX;
        input.type = 'text';
        input.style.position = 'absolute';
        input.style.left = this.startX + 'px';
        input.style.top = this.startY + 'px';
        input.style.color=this.strokeColor;
        input.style.background='none';
        input.style.outline = 'none';
        input.style.zIndex = '1000';
        input.style.fontFamily = 'Arial';
        input.style.fontSize = '30px'; 
        input.style.width=`${width}px`
        input.id='input';
        document.body.appendChild(input);
        input.focus();
    }

    mouseDownHandler = (e : MouseEvent) => {
        if(this.type==='pan'){
            document.body.style.cursor = "grabbing";
        }
        this.clicked = true;
        if(this.type==='text') this.printText();
        const rect=this.canvas.getBoundingClientRect();
        this.startX=e.clientX-rect.left;
        this.startY=e.clientY-rect.top;
        const x=this.startX;
        const y=this.startY;
        this.ctx.strokeStyle=this.strokeColor;
        this.ctx.lineWidth=this.strokeWidth;
        if(this.stStyle==='solid'){
            this.ctx.setLineDash([]);
        }
        else if(this.stStyle==='dotted'){
            this.ctx.setLineDash([2, 2]);
        }
        else if(this.stStyle==='dashed'){
            this.ctx.setLineDash([5, 5]);
        }
        this.ctx.beginPath();
        if(this.type==='pencil'){
            this.tempPath=[];
            this.ctx.lineWidth=this.strokeWidth
            this.ctx.beginPath();
            this.tempPath.push({x,y});
            this.ctx.moveTo(x,y);
        }
        else if(this.type==='pan'){
            this.panning=true;
            this.initialX=this.startX;
            this.initialY=this.startY;
            this.dx=0;
            this.dy=0;
        }
        else if(this.type==='select'){
            this.seletedShapeChatId=selectedShape(this.socket,this.existingShapes,this.ctx,x,y);
            const shape=this.existingShapes.find(x=>x.chatId===this.seletedShapeChatId);
            if(shape){
                let centerX = 0, centerY = 0;
                if (shape.type === 'rectangle' || shape.type === 'circle' || shape.type === 'diamond' || shape.type === 'arrow' || shape.type === 'line') {
                    centerX = shape.startX + shape.width / 2;
                    centerY = shape.startY + shape.height / 2;
                } 
                else if (shape.type === 'pencil' && shape.points) {
                    const left = Math.min(...shape.points.map((p) => p.x));
                    const right = Math.max(...shape.points.map((p) => p.x));
                    const top = Math.min(...shape.points.map((p) => p.y));
                    const bottom = Math.max(...shape.points.map((p) => p.y));
                    centerX = (left + right) / 2;
                    centerY = (top + bottom) / 2;
                } 
                else if (shape.type === 'text' && shape.text) {
                    const textWidth = this.ctx.measureText(shape.text).width;
                    const textHeight = 20;
                    centerX = shape.startX + textWidth / 2;
                    centerY = shape.startY - textHeight / 2;
                }
                this.offsetX=centerX;
                this.offsetY=centerY;
            }
        }
        else if(this.type==='text'){
            this.putInput();
            this.text='';   
            this.ctx.fillStyle=this.strokeColor;         
            document.addEventListener('keydown', this.keyDownHandler);
        }
    }

    mouseUpHandler = (e : MouseEvent) => {
        if(this.panning===true){
            console.log(this.dx + ' ' + this.dy);

            this.socket.send(JSON.stringify({
                type:'pan',
                roomId:Number(this.roomId),
                existingShapes:this.existingShapes
            }))
            if(this.type==='pan'){
                document.body.style.cursor = "grab";
            }
            this.panning=false;
        }
        else if(this.type==='select'){
            if(this.seletedShapeChatId!='' && this.offsetX!=-1 && this.offsetY!=-1){
                const shape=this.existingShapes.find(x=>x.chatId===this.seletedShapeChatId);
                if(shape){
                    this.socket.send(JSON.stringify({
                        type: 'select',
                        roomId: Number(this.roomId),
                        chatId: this.seletedShapeChatId,
                        shape:shape
                    }))
                    this.seletedShapeChatId='';
                    this.offsetX=-1;
                    this.offsetY=-1;        
                }       
            }            
        }
        this.clicked = false;
        const width=e.clientX-this.startX;
        const height=e.clientY-this.startY;
        const shape : Shape = {
            type: '',
            startX: this.startX,
            startY: this.startY,
            height: 0,
            width: 0,
            chatId : Date.now().toString(),
            strokeStyle: this.strokeColor,
            strokeFill : this.strokeFill,
            strokeWidth : this.strokeWidth,
            stStyle : this.stStyle
        }    
        this.startX = 0;
        this.startY = 0;
        if(this.type==='pencil'){
            shape.type='pencil';
            shape.points = this.tempPath;
            this.existingShapes.push(shape);
            this.send(shape);
        }
        else if(this.type==='rectangle'){
            shape.type='rectangle'; 
            shape.width = width;
            shape.height = height;
            this.existingShapes.push(shape);
            this.send(shape);
        }
        else if(this.type==='circle'){
            shape.type='circle';
            shape.width = width;
            shape.height = height;
            this.existingShapes.push(shape);
            this.send(shape);
        }
        else if(this.type==='diamond'){
            shape.type='diamond';
            shape.width = width;
            shape.height = height;
            this.existingShapes.push(shape);
            this.send(shape);
        }
        else if(this.type==='arrow'){
            shape.type='arrow';
            shape.width = width;
            shape.height = height;
            this.existingShapes.push(shape);
            this.send(shape);
        }
        else if(this.type==='line'){
            shape.type='line';
            shape.width = width;
            shape.height = height;
            this.existingShapes.push(shape);
            this.send(shape);
        }
    }

    mouseMoveHandler = (e : MouseEvent) => {
        if(this.clicked){
            if(this.panning==true){
                const deltaX=e.clientX-this.initialX;
                const deltaY=e.clientY-this.initialY;
                this.dx+=deltaX;
                this.dy+=deltaY;
                this.existingShapes.forEach(shape=>{
                    if(shape.type==='pencil' && shape.points){
                        shape.points = shape.points.map(point => ({
                            x: point.x + deltaX,
                            y: point.y + deltaY
                        }));
                    }
                    else{
                        shape.startX+=deltaX;
                        shape.startY+=deltaY;
                    }
                })
                this.clearCanvas();
                this.initialX=e.clientX;
                this.initialY=e.clientY;
            }
            else if(this.type==='pencil'){
                this.ctx.strokeStyle=this.strokeColor;
                this.ctx.lineWidth=this.strokeWidth;
                if(this.stStyle==='solid'){
                    this.ctx.setLineDash([]);
                }
                else if(this.stStyle==='dotted'){
                    this.ctx.setLineDash([2, 2]);
                }
                else if(this.stStyle==='dashed'){
                    this.ctx.setLineDash([5, 5]);
                }
                const curX = e.clientX-this.canvas.getBoundingClientRect().left;
                const curY = e.clientY-this.canvas.getBoundingClientRect().top;
                this.ctx.lineTo(curX,curY);
                this.ctx.stroke();
                this.tempPath.push({x:curX,y:curY});
            }
            else{
                const width=e.clientX-this.startX;
                const height=e.clientY-this.startY;
                this.clearCanvas();
                if(this.type==='rectangle'){
                    this.ctx.lineWidth=this.strokeWidth
                    this.ctx.fillStyle = this.strokeFill;
                    if(this.stStyle==='solid'){
                        this.ctx.setLineDash([]);
                    }
                    else if(this.stStyle==='dotted'){
                        this.ctx.setLineDash([2, 2]);
                    }
                    else if(this.stStyle==='dashed'){
                        this.ctx.setLineDash([5, 5]);
                    }
                    this.ctx.fillRect(this.startX, this.startY, width, height);

                    this.ctx.strokeStyle = this.strokeColor;  
                    this.ctx.strokeRect(this.startX, this.startY, width, height);
                }
                else if(this.type==='circle'){
                    this.ctx.strokeStyle = this.strokeColor; 
                    this.ctx.fillStyle = this.strokeFill;    
                    this.ctx.lineWidth=this.strokeWidth
                    if(this.stStyle==='solid'){
                        this.ctx.setLineDash([]);
                    }
                    else if(this.stStyle==='dotted'){
                        this.ctx.setLineDash([2, 2]);
                    }
                    else if(this.stStyle==='dashed'){
                        this.ctx.setLineDash([5, 5]);
                    }
                    const radiusX = Math.abs(width / 2);
                    const radiusY = Math.abs(height / 2);
                    const centerX = this.startX + (width < 0 ? -radiusX : radiusX);
                    const centerY = this.startY + (height < 0 ? -radiusY : radiusY);

                    this.ctx.beginPath();
                    this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI, true);
                    this.ctx.fill();   
                    this.ctx.stroke(); 

                }
                else if(this.type==='diamond'){
                    this.ctx.fillStyle=this.strokeFill;
                    this.ctx.strokeStyle=this.strokeColor;
                    this.ctx.lineWidth=this.strokeWidth
                    if(this.stStyle==='solid'){
                        this.ctx.setLineDash([]);
                    }
                    else if(this.stStyle==='dotted'){
                        this.ctx.setLineDash([2, 2]);
                    }
                    else if(this.stStyle==='dashed'){
                        this.ctx.setLineDash([5, 5]);
                    }
                    const leftX = this.startX;
                    const leftY = this.startY + height / 2;

                    const rightX = this.startX + width;
                    const rightY = this.startY + height / 2;

                    const topX = this.startX + width / 2;
                    const topY = this.startY;

                    const bottomX = this.startX + width / 2;
                    const bottomY = this.startY + height;

                    this.ctx.strokeStyle = "white";
                    this.ctx.beginPath();
                    this.ctx.moveTo(topX, topY);
                    this.ctx.lineTo(rightX, rightY);
                    this.ctx.lineTo(bottomX, bottomY);
                    this.ctx.lineTo(leftX, leftY);
                    this.ctx.closePath();
                    this.ctx.fill(); 
                    this.ctx.stroke();
                }
                else if(this.type==='arrow'){
                    const endX = this.startX + width;
                    const endY = this.startY + height;

                    const headLength = 20;
                    const angle = Math.atan2(endY - this.startY, endX - this.startX);

                    const HeadX1 = endX - headLength * Math.cos(angle - Math.PI / 6);
                    const HeadY1 = endY - headLength * Math.sin(angle - Math.PI / 6);

                    const HeadX2 = endX - headLength * Math.cos(angle + Math.PI / 6);
                    const HeadY2 = endY - headLength * Math.sin(angle + Math.PI / 6);

                    this.ctx.strokeStyle=this.strokeColor;
                    this.ctx.lineWidth=this.strokeWidth
                    if(this.stStyle==='solid'){
                        this.ctx.setLineDash([]);
                    }
                    else if(this.stStyle==='dotted'){
                        this.ctx.setLineDash([2, 2]);
                    }
                    else if(this.stStyle==='dashed'){
                        this.ctx.setLineDash([5, 5]);
                    }
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.startX, this.startY);
                    this.ctx.lineTo(endX, endY);
                    this.ctx.closePath();
                    this.ctx.stroke();

                    this.ctx.beginPath();
                    this.ctx.moveTo(HeadX1, HeadY1);
                    this.ctx.lineTo(endX, endY);
                    this.ctx.lineTo(HeadX2, HeadY2);
                    this.ctx.stroke();
                }
                else if(this.type==='line'){
                    this.ctx.strokeStyle=this.strokeColor;
                    this.ctx.lineWidth=this.strokeWidth
                    if(this.stStyle==='solid'){
                        this.ctx.setLineDash([]);
                    }
                    else if(this.stStyle==='dotted'){
                        this.ctx.setLineDash([2, 2]);
                    }
                    else if(this.stStyle==='dashed'){
                        this.ctx.setLineDash([5, 5]);
                    }
                    const endX = this.startX + width;
                    const endY = this.startY + height;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.startX, this.startY);
                    this.ctx.lineTo(endX, endY);
                    this.ctx.stroke();
                }
                else if(this.type==='eraser'){
                    let rect=this.canvas.getBoundingClientRect();
                    let x=e.clientX-rect.left;
                    let y=e.clientY-rect.top;
                    let shapeId : string[] = eraser_Shape(this.socket,this.existingShapes,this.ctx,x,y,this.roomId);
                    this.existingShapes = this.existingShapes.filter(x=>!shapeId.includes(x.chatId));
                    this.clearCanvas();
                }
                else if(this.type==='select'){
                    if(this.seletedShapeChatId!=='' && this.offsetX!=-1 && this.offsetY!=-1){
                        let rect=this.canvas.getBoundingClientRect();
                        let x=e.clientX-rect.left;
                        let y=e.clientY-rect.top;
                        const shape=this.existingShapes.find(x=>x.chatId===this.seletedShapeChatId);
                        if(shape){
                            const deltaX=x-this.offsetX;
                            const deltaY=y-this.offsetY;
                            if (shape.type === 'pencil' && shape.points) {
                                shape.points = shape.points.map(point => ({
                                    x: point.x + deltaX,
                                    y: point.y + deltaY
                                }));
                            } else {
                                shape.startX += deltaX;
                                shape.startY += deltaY;
                            }
                            this.offsetX=x;
                            this.offsetY=y;
                            this.clearCanvas();
                        }
                    }
                }
            }
        }
    }

    keyDownHandler = (e : KeyboardEvent) => {        
        if(e.key=='Enter'){
            const input = document.getElementById('input') as HTMLInputElement;
            if(input){
                const text = input.value;
                if(text.length>0){
                    this.ctx.fillStyle=this.strokeColor;
                    this.ctx.font='30px Arial';
                    this.ctx.fillText(text,this.startX,this.startY+20);
                    const shape : Shape = {
                        type: 'text',
                        startX: this.startX,
                        startY: this.startY,
                        height: 0,
                        width: 0,
                        text : text,
                        chatId : Date.now().toString(),
                        strokeStyle: this.strokeColor,
                        strokeFill:this.strokeFill,
                        strokeWidth:this.strokeWidth,
                        stStyle:this.stStyle
                    }                         
                    this.existingShapes.push(shape);   
                    this.send(shape);   
                    this.clicked=false;         
                }
                document.body.removeChild(input);    
            }
        }
        else this.text+=e.key;
    }

    send(shape : Shape){
        this.socket.send(JSON.stringify({
            type:'chat',
            roomId:Number(this.roomId),
            shape:shape
        }));
    }

    clearCanvas(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgb(0,0,0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for(let i=0;i<this.existingShapes.length;i++){
            const shape = this.existingShapes[i];
            this.ctx.strokeStyle = shape.strokeStyle;
            if(shape.type==='pencil'){
                this.ctx.lineWidth=shape.strokeWidth;
                if(shape.stStyle==='solid'){
                    this.ctx.setLineDash([]);
                }
                else if(shape.stStyle==='dotted'){
                    this.ctx.setLineDash([2, 2]);
                }
                else if(shape.stStyle==='dashed'){
                    this.ctx.setLineDash([5, 5]);
                }
                this.ctx.beginPath();
                if(shape.points){
                    this.ctx.moveTo(shape.points[0].x,shape.points[0].y);
                    for(let j=1;j<shape.points.length;j++){
                        this.ctx.lineTo(shape.points[j].x,shape.points[j].y);
                        this.ctx.stroke();
                    }
                }
            }
            else if(shape.type==='text'){
                this.ctx.fillStyle=shape.strokeStyle;
                this.ctx.font='30px Arial';
                if(shape.text) this.ctx.fillText(shape.text,shape.startX,shape.startY+20);
            }
            else if(shape.type==='rectangle'){            
                this.ctx.lineWidth=shape.strokeWidth;
                this.ctx.fillStyle = shape.strokeFill;
                if(shape.stStyle==='solid'){
                    this.ctx.setLineDash([]);
                }
                else if(shape.stStyle==='dotted'){
                    this.ctx.setLineDash([2, 2]);
                }
                else if(shape.stStyle==='dashed'){
                    this.ctx.setLineDash([5, 5]);
                }
                this.ctx.fillRect(shape.startX, shape.startY,shape.width, shape.height);
                this.ctx.strokeStyle = shape.strokeStyle;  
                this.ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
            }
            else if(shape.type==='circle'){       
                this.ctx.fillStyle = shape.strokeFill;   
                this.ctx.lineWidth=shape.strokeWidth;   
                if(shape.stStyle==='solid'){
                    this.ctx.setLineDash([]);
                }
                else if(shape.stStyle==='dotted'){
                    this.ctx.setLineDash([2, 2]);
                }
                else if(shape.stStyle==='dashed'){
                    this.ctx.setLineDash([5, 5]);
                }
                const radiusX = Math.abs(shape.width / 2);
                const radiusY = Math.abs(shape.height / 2);
                const centerX = shape.startX + (shape.width < 0 ? -radiusX : radiusX);
                const centerY = shape.startY + (shape.height < 0 ? -radiusY : radiusY);
                this.ctx.beginPath();
                this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI, true);
                this.ctx.fill(); 
                this.ctx.stroke();
            }
            else if(shape.type==='diamond'){
                this.ctx.fillStyle=shape.strokeFill;
                this.ctx.lineWidth=shape.strokeWidth;
                if(shape.stStyle==='solid'){
                    this.ctx.setLineDash([]);
                }
                else if(shape.stStyle==='dotted'){
                    this.ctx.setLineDash([2, 2]);
                }
                else if(shape.stStyle==='dashed'){
                    this.ctx.setLineDash([5, 5]);
                }
                const leftX = shape.startX;
                const leftY = shape.startY + shape.height / 2;

                const rightX = shape.startX + shape.width;
                const rightY = shape.startY + shape.height / 2;

                const topX = shape.startX + shape.width / 2;
                const topY = shape.startY;

                const bottomX = shape.startX + shape.width / 2;
                const bottomY = shape.startY + shape.height;

                this.ctx.beginPath();
                this.ctx.moveTo(topX, topY);
                this.ctx.lineTo(rightX, rightY);
                this.ctx.lineTo(bottomX, bottomY);
                this.ctx.lineTo(leftX, leftY);
                this.ctx.closePath();
                this.ctx.fill(); 
                this.ctx.stroke();
            }
            else if(shape.type==='arrow'){
                
                this.ctx.lineWidth=shape.strokeWidth;
                if(shape.stStyle==='solid'){
                    this.ctx.setLineDash([]);
                }
                else if(shape.stStyle==='dotted'){
                    this.ctx.setLineDash([2, 2]);
                }
                else if(shape.stStyle==='dashed'){
                    this.ctx.setLineDash([5, 5]);
                }
                const endX = shape.startX  + shape.width;
                const endY = shape.startY  + shape.height;

                const headLength = 20;
                const angle = Math.atan2(endY - (shape.startY), endX - (shape.startX ));

                const HeadX1 = endX - headLength * Math.cos(angle - Math.PI / 6);
                const HeadY1 = endY - headLength * Math.sin(angle - Math.PI / 6);

                const HeadX2 = endX - headLength * Math.cos(angle + Math.PI / 6);
                const HeadY2 = endY - headLength * Math.sin(angle + Math.PI / 6);

                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX, shape.startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.closePath();
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.moveTo(HeadX1, HeadY1);
                this.ctx.lineTo(endX, endY);
                this.ctx.lineTo(HeadX2, HeadY2);
                this.ctx.stroke();
            }
            else if(shape.type==='line'){
                const endX = shape.startX + shape.width ;
                const endY = shape.startY + shape.height ;
                if(shape.stStyle==='solid'){
                    this.ctx.setLineDash([]);
                }
                else if(shape.stStyle==='dotted'){
                    this.ctx.setLineDash([2, 2]);
                }
                else if(shape.stStyle==='dashed'){
                    this.ctx.setLineDash([5, 5]);
                }
                this.ctx.lineWidth=shape.strokeWidth;
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX , shape.startY );
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            }
        }
    }   
}