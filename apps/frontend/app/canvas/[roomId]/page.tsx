import RoomCanvas from "@/components/roomcanvas";

export type paramsType = Promise<{ roomId: string }>;
 
 export default async function CanvasPage(props: { params: paramsType }){
   const { roomId } = await props.params;

   return (
     <div>
       <RoomCanvas roomId={roomId} />
     </div>
   );
 }