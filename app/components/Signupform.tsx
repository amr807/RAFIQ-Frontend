/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast, { Toaster } from "react-hot-toast"
import { useRouter } from 'next/navigation'

export default function Signup() {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [isshowSucess, setIsSucess] = useState(false);

  const [forms, setForms] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });

  async function load(): Promise<void> {
    toast.error("No Internet connection");
  }

  const [error, setError] = useState("");
  const [errort, setErrort] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrort(true);

    console.log(process.env.Base_URL)
    function validatePassword(password: string) {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(password);
    }
    if (forms.password !== "" && forms.firstName !== "" && forms.lastName !== "") {
 
      if (!validatePassword(forms.password)) {
        setErrort(false);

        setError("Password must be at least 8 characters long, include an uppercase letter and a number.");
        setIsLoading(false);
      }
  
      const result = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/signup`, {
        method: "POST",
        body: JSON.stringify({
          email: forms.email,
          firstname: forms.firstName,
          lastname: forms.lastName,
          password: forms.password
        }),
        headers: { "Content-Type": "application/json" }
      });


      if (result?.status == 401) {
        console.log("no login")
        setErrort(false);
        setIsLoading(false)
        setError("Sorry, your information is incorrect. Please check your details.");
      }
if(result?.status==500){ 
  await load()
  setIsLoading(false)
  setErrort(true);
}

      
      if (result?.status == 201) {
        setIsLoading(false)
        toast.success("You have been signed up successfully. Please check your inbox to verify your account.")
      }
      else {
        console.log("Some fields are empty or invalid");
        setIsLoading(false);
        setErrort(false);
      }
    }
  }

  return (
    <>
      <Toaster />
      <CardContent>
        <>
          <div className='pr-25'>
            <h1 className="text-3xl font-bold ">Sign up</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                value={forms.firstName}
                onChange={(e) => {
                  setErrort(true);
                  setForms({ ...forms, firstName: e.target.value });
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                value={forms.lastName}
                onChange={(e) => {
                  setErrort(true);
                  setForms({ ...forms, lastName: e.target.value });
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
                    setForms({ ...forms, password: e.target.value });
                  }}
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
            {!errort && (
              <p className="text-red-500 text-sm italic">{error}</p>
            )}
            <Button type="submit" className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing Up...
                </>
              ) : (
                'Signup'
              )}
            </Button>
          </form>
        </>
      </CardContent>
    </>
  )
}