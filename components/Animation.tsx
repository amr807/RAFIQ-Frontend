/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "./ui/Textarea"

interface AnimatedFormFieldProps {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  multiline?: boolean
  rows?: number
  disabled?: boolean
  placeholder?: string
  type?: string
}

const AnimatedFormField = ({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  disabled = false,
  placeholder = "",
  type = "text",
}: AnimatedFormFieldProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  useEffect(() => {
    setHasValue(value.length > 0)
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      <Label
        htmlFor={label.toLowerCase().replace(/\s+/g, "-")}
        className="text-sm font-medium transition-all duration-200"
      >
        {label}
      </Label>
      
      <motion.div
        animate={{
          scale: isFocused ? 1.01 : 1,
          borderColor: isFocused ? "var(--primary)" : "transparent",
        }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        {multiline ? (
          <Textarea
            id={label.toLowerCase().replace(/\s+/g, "-")}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={rows}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full resize-none transition-all duration-200 ${
              isFocused ? "border-primary shadow-sm" : ""
            } ${disabled ? "bg-muted/50" : ""}`}
          />
        ) : (
          <Input
            id={label.toLowerCase().replace(/\s+/g, "-")}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full transition-all duration-200 ${
              isFocused ? "border-primary shadow-sm" : ""
            } ${disabled ? "bg-muted/50" : ""}`}
          />
        )}
        
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-primary"
          />
        )}
      </motion.div>
    </motion.div>
  )
}

export default AnimatedFormField
