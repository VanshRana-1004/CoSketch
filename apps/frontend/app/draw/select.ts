import { Shape } from "./game";

export function selectedShape(socket : WebSocket,existingShapes : Shape[],ctx : CanvasRenderingContext2D,x : number,y : number) : string{
    let deleteChat : string;
    for(let i=0;i<existingShapes.length;i++){
        const shape=existingShapes[i];
        let left = -1, right = -1, top = -1, bottom = -1;
        if (shape?.type === 'rectangle') {
            left = shape.startX;
            right = shape.startX + shape.width;
            top = shape.startY;
            bottom = shape.startY + shape.height;
        } 
        else if (shape?.type === 'circle') {
            const radiusX = Math.abs(shape.width / 2);
            const radiusY = Math.abs(shape.height / 2);
            const centerX = shape.startX + (shape.width < 0 ? -radiusX : radiusX);
            const centerY = shape.startY + (shape.height < 0 ? -radiusY : radiusY);
            left = centerX - radiusX;
            right = centerX + radiusX;
            top = centerY - radiusY;
            bottom = centerY + radiusY;
        } 
        else if (shape?.type === 'diamond') {
            left = shape.startX;
            right = shape.startX + shape.width;
            top = shape.startY;
            bottom = shape.startY + shape.height;
        } 
        else if (shape?.type === 'line') {
            const endX = shape.startX + shape.width;
            const endY = shape.startY + shape.height;
            left = Math.min(shape.startX, endX)-10;
            right = Math.max(shape.startX, endX)+10;
            top = Math.min(shape.startY, endY)-10;
            bottom = Math.max(shape.startY, endY)+10;
        } 
        else if(shape?.type === 'arrow' ){
            const endX = shape.startX + shape.width;
            const endY = shape.startY + shape.height;

            const headLength = 20;
            const angle = Math.atan2(endY - shape.startY, endX - shape.startX);
            const HeadX1 = endX - headLength * Math.cos(angle - Math.PI / 6);
            const HeadY1 = endY - headLength * Math.sin(angle - Math.PI / 6);
            const HeadX2 = endX - headLength * Math.cos(angle + Math.PI / 6);
            const HeadY2 = endY - headLength * Math.sin(angle + Math.PI / 6);

            left = Math.min(shape.startX, endX, HeadX1, HeadX2);
            right = Math.max(shape.startX, endX, HeadX1, HeadX2);
            top = Math.min(shape.startY, endY, HeadY1, HeadY2);
            bottom = Math.max(shape.startY, endY, HeadY1, HeadY2);
        }
        else if (shape?.type === 'pencil' && shape?.points?.length) {
            left = Math.min(...shape.points.map(p => p.x));
            right = Math.max(...shape.points.map(p => p.x));
            top = Math.min(...shape.points.map(p => p.y));
            bottom = Math.max(...shape.points.map(p => p.y));
        }
        else if (shape?.type==='text' && shape.text){
            const textWidth = ctx.measureText(shape.text).width;
            const textHeight = 30; 
            
            left = shape.startX;
            right = shape.startX + textWidth;
            top = shape.startY - textHeight; 
            bottom = shape.startY + textHeight;
        }
        if (x >= left && x <= right && y >= top && y <= bottom) {
            return shape.chatId;
        }
    }
    return '';
}