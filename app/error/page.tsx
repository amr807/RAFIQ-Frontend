"use client";

import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";


export default function Error(){

  return (
    <div>
      <h1>This verification is expired. Please submit a new verification.</h1>


      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () =>{
            redirect("/signup")
          }
        }
      >
        Try again
      </Button>
    </div>
  );
}
