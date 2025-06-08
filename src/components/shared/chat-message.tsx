import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";

export interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: Date;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex items-start gap-3 my-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <Bot className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "p-3 rounded-lg max-w-[70%] shadow",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card text-card-foreground"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
      {isUser && (
         <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
