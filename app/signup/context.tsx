"use client";
import { Card } from "@/components/ui/card"
import Signup from "../components/Signupform";

export default function SignUpPage() {

  

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-xl">
          <Card className="w-full overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm">
            <div className="md:flex">
              <div className="md:w-2/5 bg-primary/90 p-8 pt-3 text-primary-foreground flex items-center justify-center">
                <h1 className="text-3xl font-bold">Create Account.</h1>
               </div>
              <div className="md:w-3/5 p-8">
                <Signup />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

