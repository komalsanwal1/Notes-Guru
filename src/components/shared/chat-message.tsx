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
  const isSystem = role === "system";

  // System messages might not need an avatar or special styling,
  // or they could have their own distinct style.
  // For now, let's make them a bit plainer.
  if (isSystem) {
    return (
      <div className="my-3 text-xs text-muted-foreground italic px-4 py-2 text-center">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    );
  }

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
        {/* Render HTML content for assistant messages, plain text for user messages */}
        {role === 'assistant' ? (
          <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        )}
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
