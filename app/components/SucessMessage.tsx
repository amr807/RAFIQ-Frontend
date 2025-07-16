import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SuccessMessageProps {
  message: string
}

export default function SuccessMessage({ message }: SuccessMessageProps) {
  const [timeLeft, setTimeLeft] = useState(2)

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  return (
    <AnimatePresence>
      {timeLeft > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg z-50"
        >
          <p className="font-semibold">{message}</p>
          <p className="text-sm">Redirecting in {timeLeft} seconds...</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
