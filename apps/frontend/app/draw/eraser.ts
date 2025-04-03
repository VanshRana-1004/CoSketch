import { Shape } from "./game";

function isMouseOverLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    mouseX: number,
    mouseY: number
): boolean {
    const dx = endX - startX;
    const dy = endY - startY;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) return false;

    const t = ((mouseX - startX) * dx + (mouseY - startY) * dy) / lenSq;
    const clampedT = Math.max(0, Math.min(1, t));

    const closestX = startX + clampedT * dx;
    const closestY = startY + clampedT * dy;

    const distance = Math.sqrt((mouseX - closestX) ** 2 + (mouseY - closestY) ** 2);

    return distance <= 2;
}

function sendMsg(socket : WebSocket,roomId : number | string,deleteChat : string){
    socket.send(JSON.stringify({
        type:'eraser',
        roomId:Number(roomId),
        chatId:deleteChat
    }))
}

export function eraser_Shape(socket : WebSocket,existingShapes : Shape[],ctx : CanvasRenderingContext2D,x : number,y : number,roomId : number | string) : string[]{
    const deleteChat : string[]=[];
    for(let i=0;i<existingShapes.length;i++){
        const shape=existingShapes[i];
        if(shape.type==='rectangle'){
            if (x >= shape.startX && x <= shape.startX + shape.width && y >= shape.startY && y <= shape.startY + shape.height) {
                sendMsg(socket,roomId,shape.chatId);
                deleteChat.push(shape.chatId);
            }
        }
        else if(shape.type==='circle'){
            const radiusX = Math.abs(shape.width / 2);
            const radiusY = Math.abs(shape.height / 2);
            const centerX = shape.startX + (shape.width < 0 ? -radiusX : radiusX);
            const centerY = shape.startY + (shape.height < 0 ? -radiusY : radiusY);
            const normalizedX = (x - centerX) / radiusX;
            const normalizedY = (y - centerY) / radiusY;
            if((normalizedX ** 2 + normalizedY ** 2) <= 1){
                sendMsg(socket,roomId,shape.chatId);
                deleteChat.push(shape.chatId);
            }
        }
        else if(shape.type==='diamond'){
            const leftX = shape.startX;
            const leftY = shape.startY + shape.height / 2;

            const rightX = shape.startX + shape.width;
            const rightY = shape.startY + shape.height / 2;

            const topX = shape.startX + shape.width / 2;
            const topY = shape.startY;

            const bottomX = shape.startX + shape.width / 2;
            const bottomY = shape.startY + shape.height;   

            if( isMouseOverLine(topX,topY,rightX,rightY,x,y) ||
                isMouseOverLine(rightX,rightY,bottomX,bottomY,x,y) || 
                isMouseOverLine(bottomX,bottomY,leftX,leftY,x,y) || 
                isMouseOverLine(leftX,leftY,topX,topY,x,y) ){
                    sendMsg(socket,roomId,shape.chatId);
                    deleteChat.push(shape.chatId);
            }
        }
        else if(shape.type==='arrow'){
            const endX = shape.startX + shape.width;
            const endY = shape.startY + shape.height;

            const headLength = 20;
            const angle = Math.atan2(endY - shape.startY, endX - shape.startX);

            const HeadX1 = endX - headLength * Math.cos(angle - Math.PI / 6);
            const HeadY1 = endY - headLength * Math.sin(angle - Math.PI / 6);

            const HeadX2 = endX - headLength * Math.cos(angle + Math.PI / 6);
            const HeadY2 = endY - headLength * Math.sin(angle + Math.PI / 6);

            if( isMouseOverLine(shape.startX,shape.startY,endX,endY,x,y) ||
                isMouseOverLine(HeadX1,HeadY1,endX,endY,x,y) ||
                isMouseOverLine(HeadX2,HeadY2,endX,endY,x,y) ){
                    sendMsg(socket,roomId,shape.chatId);
                    deleteChat.push(shape.chatId);
            }
        }
        else if(shape.type==='pencil'){
            if(shape?.points){
                const points=shape.points;
                for(let j=0;j<points?.length-1;j++){
                    if(isMouseOverLine(points[j].x,points[j].y,points[j+1].x,points[j+1].y,x,y)){
                        sendMsg(socket,roomId,shape.chatId);
                        deleteChat.push(shape.chatId);
                    }    
                }
            }
        }
        else if(shape.type==='line'){
            const startX=shape.startX;
            const startY=shape.startY;
            const endX=startX+shape.width;
            const endY=startY+shape.height;
            if(isMouseOverLine(startX,startY,endX,endY,x,y)){
                sendMsg(socket,roomId,shape.chatId);
                deleteChat.push(shape.chatId);
            }
        }
        else if(shape?.type==='text'){
            if(!shape.text) continue;
            const textMetrics = ctx.measureText(shape.text);
            const textWidth = textMetrics.width;
            const textHeight = 20; 

            const startX = shape.startX;
            const startY = shape.startY - textHeight; 

            if( x >= startX &&
                x <= startX + textWidth &&
                y >= startY &&
                y <= startY + textHeight ){
                    sendMsg(socket,roomId,shape.chatId);
                    deleteChat.push(shape.chatId);
            }      
        }
    }
    
    return deleteChat;
}