/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Signbuttons = () => {
  const { data: session } = useSession();
const router=useRouter()
  console.log(session?.user);
const [style,setStyle]=useState(false)
const [showMiniNav, setShowMiniNav] = useState(false)

  const toggleMiniNav = () => {
    setShowMiniNav(!showMiniNav)
  }
  if (session && session.user) {


    return (
      <>
  <div className="mt-4 relative">
          <Button variant="ghost" size="icon" onClick={toggleMiniNav} className="rounded-full">
            <User className="h-6 w-6" />
          </Button>
          {showMiniNav && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
              <button
              onMouseUp={()=>router.prefetch("/login")}
                onClick={() =>{ 
                  localStorage.clear()
                  signOut({callbackUrl: "/login"})}}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
     
      </>
    );
  }

  return (
    <>
    
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
    </>
  );
};

export default Signbuttons;
