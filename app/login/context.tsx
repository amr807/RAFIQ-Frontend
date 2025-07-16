"use client";
import { Card } from "@/components/ui/card"
import Login from '../components/loginform'

export default function SignInPage() {

  

  return (
    <>
      <head>
        <title>Login</title>
      </head>
    <div className="min-h-screen flex flex-col relative">
  
      <div className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-xl">
          <Card className="w-full overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm">
            <div className="md:flex">
              <div className="md:w-2/6 bg-primary/90 p-8 pt-3 text-primary-foreground flex items-center justify-center">
                <h1 className="text-3xl font-bold">Welcome Back!</h1>
              </div>
              <div className="md:w-4/6 p-8">
                <Login />
              </div>
            </div>
          </Card>
        </div>
      </div>

    </div></>
  )
}

