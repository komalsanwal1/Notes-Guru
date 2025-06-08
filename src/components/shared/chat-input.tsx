"use client";

import { useState, type FormEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
}

const ChatInput = ({ onSubmit, isLoading, placeholder = "Type your message..." }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    await onSubmit(message.trim());
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end p-4 border-t bg-card sticky bottom-0">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        className="flex-grow resize-none min-h-[40px] max-h-[150px]"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        disabled={isLoading}
        aria-label="Chat message input"
      />
      <Button type="submit" disabled={isLoading || !message.trim()} size="icon" aria-label="Send message">
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default ChatInput;
