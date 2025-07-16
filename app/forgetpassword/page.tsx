'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'
import toast, { Toaster } from "react-hot-toast"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgotPassword() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isVerificationVisible, setIsVerificationVisible] = useState(false)
  const [timer, setTimer] = useState(60)
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", ""])

  // Timer countdown effect
  useEffect(() => {
    if (isVerificationVisible && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isVerificationVisible, timer])

  // Handle email submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    if (!email) {
      toast.error("Please enter your email address.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/forgetpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.status === 201) {
        toast.success("Password reset link sent to your email. Please check your inbox.")
        setIsVerificationVisible(true) // Show verification code input
        setTimer(60) // Reset timer to 60 seconds
      } else if (response.status === 404) {
        toast.error("Email not found. Please enter a valid email address.")
      } else {
        toast.error("An error occurred. Please try again later.")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle verification code input change
  const handleVerificationCodeChange = (index: number, value: string) => {
    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Auto-focus to the next input
    if (value && index < 4) {
      const nextInput = document.getElementById(`verification-input-${index + 1}`)
      if (nextInput) nextInput.focus()
    }

    // Auto-submit when all 5 digits are entered
    if (newCode.every((digit) => digit !== "") && index === 4) {
      handleVerificationSubmit()
    }
  }

  // Handle verification code submission
  const handleVerificationSubmit = async () => {
    const pinAouth = verificationCode.join("")
    if (pinAouth.length === 5) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, pinAouth:parseInt(pinAouth) }),
        })
        if (response.status == 201) {
   const {access_token}=    await response.json()

          toast.success("Verification successful! Redirecting...")
          
          router.push(`/reset-password/${access_token}`) // Redirect to login page
        } else if (response.status == 401) {
          toast.error("Invalid code. Please try again.")
        } else {
          toast.error("An error occurred. Please try again later.")
        }
      } catch (error) {
        console.error(error)
        toast.error("An error occurred. Please try again later.")
      }
    } else {
      toast.error("Please enter the full verification code.")
    }
  }

  // Handle resend code request
  const handleResendCode = () => {
    setTimer(60) // Reset timer
    handleSubmit(new Event("submit") as unknown as React.FormEvent) // Trigger email sending again
  }

  return (
    <>
      <Toaster />
      <CardContent>
        <div className="pr-25 mt-40">
          <h1 className="text-3xl font-bold mb-6">Forgot Password</h1>
        </div>
        {!isVerificationVisible ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-blue-500 hover:text-blue-800 font-bold">
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-center">We sent a verification code to <strong>{email}</strong>. Enter this code to continue.</p>
            <div className="flex justify-center space-x-2">
              {verificationCode.map((value, index) => (
                <Input
                  key={index}
                  id={`verification-input-${index}`}
                  type="text"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                  className="w-12 h-12 text-center"
                />
              ))}
            </div>
            <p className="text-center">Time remaining: {timer} seconds</p>
            <Button onClick={handleVerificationSubmit} className="w-full" disabled={isLoading}>
              Submit Verification Code
            </Button>
            {timer === 0 && (
              <Button onClick={handleResendCode} className="w-full text-red-500" variant="outline" disabled={isLoading}>
                Request a new code
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </>
  )
}