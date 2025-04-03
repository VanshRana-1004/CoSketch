"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick : VoidFunction,
  className : string
}

export const Button = ({ children,className,onClick }: ButtonProps) => {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};
