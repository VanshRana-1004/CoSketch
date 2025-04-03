interface params{
    placeholder : string,
    type : string,
    className: string,
    reference : React.RefObject<HTMLInputElement | null>
}
export function Input(props : params){
    return <input ref={props.reference} type={props.type} placeholder={props.placeholder} className={props.className}/>
}