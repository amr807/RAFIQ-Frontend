'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import toast from "react-hot-toast"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {

  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false);

  const [forms, setForms] = useState({
    email: "",
    password: "",
  });
  async function load (): Promise<void>
  {  toast.error(
   "No Internet connection ",
 ); }

  const [error, setError] = useState("");
  const [errort, setErrort] = useState(true);
  async function handleSubmit (e: React.FormEvent)  {
       e.preventDefault();
       setIsLoading(true);  
       setErrort(false);
  
       if (forms.password !== "" && forms.email !== "") {
   
   const result=      await signIn("credentials", {
           
           email: forms.email,
           password: forms.password,
       redirect: false,
       callbackUrl: '/login' 
       });
   console.log(result)
       if (result?.status == 401 ) {   
   console.log("no login")
           setErrort(false);
           setIsLoading(false)
           setError("Sorry, your username or password is incorrect. Or you may need to create an account.");
         }
         if (result?.status==200) {
          localStorage.setItem('accessTokenExpiry', String(Date.now() + 15 * 60 * 1000)); 


          router.push("/");

 }
         else {
      
          console.log("Username or password is empty");
          setIsLoading(false);
          setErrort(true);
       await load()  
       
        
        }
   
       } }
  

  return (

<CardContent>
  <>
<div className='pr-25'>
  <h1 className="text-3xl font-bold ">Sign in</h1>
     </div> <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={forms.email}
              onChange={(e) => {
                setErrort(true);
                setForms({ ...forms, email: e.target.value });
              }}
              required
            />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={forms.password}
              onChange={(e) => {
                setErrort(true);
                setForms({ ...forms, password: e.target.value });}}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
        </div>
      {errort && (
            <p className="text-red-500 text-s italic">{error}</p>
          )}
        <Button type="submit" className="w-full">
        {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            'Login'
          )}        </Button>
                     <div className="text-center mt-4">
            <Link href="/forgetpassword" className="text-sm text-blue-500 hover:text-blue-800 font-bold">
              Forgot password?
            </Link>
          </div>
          <div className="text-center mt-2">
            <Link href="/signup" className="text-sm text-blue-500 hover:text-blue-800 font-bold">
              Create An Account
            </Link>
          </div>


      </form>
      </>
    </CardContent>
  )
}

