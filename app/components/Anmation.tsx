import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";

interface AnimatedFormFieldProps {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}

const AnimatedFormField: React.FC<AnimatedFormFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  disabled = false,
  multiline = false,
  rows = 3
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-2"
    >
      <label className="text-sm font-medium">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full"
          rows={rows}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full"
        />
      )}
    </motion.div>
  );
};

export default AnimatedFormField;
