/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dailog"
import { Lock, Check, Eye, EyeOff, RefreshCw, Copy } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

interface PinSectionProps {
  pin: string
  onPinChange: (newPin: string) => Promise<void>
}

const PinSection = ({ pin, onPinChange }: PinSectionProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCurrentPin, setShowCurrentPin] = useState(false)
  const [showNewPin, setShowNewPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: session } = useSession()
  const { toast } = useToast()
  const copyToClipboard = () => {
    navigator.clipboard.writeText(pin)
    setCopied(true)
 

    setTimeout(() => setCopied(false), 2000)
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPin.length < 5) {
      setError("PIN must be at least 5 digits long")
      return
    }

    if (!/^\d+$/.test(newPin)) {
      setError("PIN must contain only numbers")
      return
    }

    if (newPin !== confirmPin) {
      setError("PINs do not match")
      return
    }

    try {
      setIsLoading(true)
      await onPinChange(newPin)
      setError("")
      setIsOpen(false)
      toast({
        title: "Success",
        description: "Your PIN has been updated successfully",
        variant: "success",
      })
    } catch (error) {
      setError("Failed to update PIN")
      toast({
        title: "Error",
        description: "Failed to update PIN. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateRandomPin = () => {
    const randomPin = Math.floor(1000 + Math.random() * 900000).toString()
    setNewPin(randomPin)
    setConfirmPin(randomPin)
    toast({
      title: "Random PIN Generated",
      description: "A new 4-digit PIN has been generated for you",
      variant: "default",
    })
  }

  const handlePinInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 6)
    setter(value)
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-xl border border-primary/10"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/90">Current Employee Access PIN</p>
            <div className="relative mt-1">
              <Input
                value={pin}
                type={showCurrentPin ? "text" : "password"}
                className="w-[120px] h-9 text-left font-mono tracking-wider bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 transition-all duration-300"
                readOnly
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9 hover:bg-primary/10 transition-colors"
                onClick={() => setShowCurrentPin(!showCurrentPin)}
              >
                {showCurrentPin ? (
                  <EyeOff className="h-4 w-4 text-primary" />
                ) : (
                  <Eye className="h-4 w-4 text-primary" />
                )}
                <span className="sr-only">{showCurrentPin ? "Hide PIN" : "Show PIN"}</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="flex">
          <Button
            size="sm"
            variant="ghost"
            className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-r-none border-r-0"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-[#50d71e] " />
                <span className="text-[#50d71e] text-xs">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-l-none"
              >
                <Lock className="h-4 w-4" />
                Change PIN
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Change Employee Access PIN
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-3">
                  <label htmlFor="current-pin" className="text-sm font-medium text-foreground/90">
                    Current PIN
                  </label>
                  <div className="relative">
                    <Input
                      id="current-pin"
                      type={showCurrentPin ? "text" : "password"}
                      value={pin}
                      readOnly
                      className="pr-10 font-mono tracking-wider bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 transition-all duration-300"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10 hover:bg-primary/10 transition-colors"
                      onClick={() => setShowCurrentPin(!showCurrentPin)}
                    >
                      {showCurrentPin ? (
                        <EyeOff className="h-4 w-4 text-primary" />
                      ) : (
                        <Eye className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="new-pin" className="text-sm font-medium text-foreground/90">
                      New PIN
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-xs hover:bg-primary/10 hover:text-primary transition-all duration-300"
                      onClick={generateRandomPin}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Generate PIN
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="new-pin"
                      type={showNewPin ? "text" : "password"}
                      value={newPin}
                      onChange={(e) => handlePinInput(e, setNewPin)}
                      placeholder="Enter new PIN"
                      autoComplete="new-password"
                      className="pr-10 font-mono tracking-wider bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 transition-all duration-300"
                      maxLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10 hover:bg-primary/10 transition-colors"
                      onClick={() => setShowNewPin(!showNewPin)}
                    >
                      {showNewPin ? (
                        <EyeOff className="h-4 w-4 text-primary" />
                      ) : (
                        <Eye className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="confirm-pin" className="text-sm font-medium text-foreground/90">
                    Confirm New PIN
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm-pin"
                      type={showConfirmPin ? "text" : "password"}
                      value={confirmPin}
                      onChange={(e) => handlePinInput(e, setConfirmPin)}
                      placeholder="Confirm new PIN"
                      autoComplete="new-password"
                      className="pr-10 font-mono tracking-wider bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 transition-all duration-300"
                      maxLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10 hover:bg-primary/10 transition-colors"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                    >
                      {showConfirmPin ? (
                        <EyeOff className="h-4 w-4 text-primary" />
                      ) : (
                        <Eye className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false)
                      setNewPin("")
                      setConfirmPin("")
                      setError(null)
                    }}
                    className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="gap-2 bg-primary hover:bg-primary/90 transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Update PIN
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>
      <p className="text-xs text-muted-foreground px-1">
        This PIN allows employees to create accounts under your management. Share it securely with new team members.
      </p>
    </div>
  )
}

export default PinSection
