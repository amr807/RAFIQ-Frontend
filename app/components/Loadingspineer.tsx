// components/LoadingState.tsx
"use client"; // Mark this as a Client Component

import {  useEffect } from "react";
import Loading from "./loading";
import { useSession } from "next-auth/react";

export default function Loadingspinner() {
  const {status}=useSession()
  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => {
    }, 1000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);
if (status==="loading"){
  return <Loading /> ;}
}