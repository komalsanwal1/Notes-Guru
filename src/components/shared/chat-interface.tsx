"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage, { type ChatMessageProps } from "./chat-message";
import ChatInput from "./chat-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface ChatInterfaceProps<TInput, TOutput> {
  aiFlow: (input: TInput) => Promise<TOutput>;
  transformInput: (userInput: string, history: ChatMessageProps[]) => TInput;
  transformOutput: (aiResponse: TOutput) => string;
  initialMessages?: ChatMessageProps[];
  chatContainerClassName?: string;
  inputPlaceholder?: string;
}

function ChatInterface<TInput, TOutput>({
  aiFlow,
  transformInput,
  transformOutput,
  initialMessages = [],
  chatContainerClassName = "h-[500px]",
  inputPlaceholder,
}: ChatInterfaceProps<TInput, TOutput>) {
  const [messages, setMessages] = useState<ChatMessageProps[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (userInput: string) => {
    setIsLoading(true);
    setError(null);
    const userMessage: ChatMessageProps = { role: "user", content: userInput, createdAt: new Date() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      const flowInput = transformInput(userInput, newMessages);
      const aiResponse = await aiFlow(flowInput);
      const assistantMessageContent = transformOutput(aiResponse);
      const assistantMessage: ChatMessageProps = {
        role: "assistant",
        content: assistantMessageContent,
        createdAt: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (err) {
      console.error("AI flow error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "system", content: `Error: ${errorMessage}`, createdAt: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col w-full shadow-lg">
      <CardContent className="p-0 flex-grow flex flex-col">
        <ScrollArea className={cn("flex-grow p-4", chatContainerClassName)} ref={scrollAreaRef}>
          {messages.map((msg, index) => (
            <ChatMessage key={index} {...msg} />
          ))}
          {error && (
            <Alert variant="destructive" className="my-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </ScrollArea>
        <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} placeholder={inputPlaceholder} />
      </CardContent>
    </Card>
  );
}

export default ChatInterface;

// Utility function to create a ChatMessage (can be moved to utils if needed)
export const createChatMessage = (role: ChatMessageProps['role'], content: string): ChatMessageProps => ({
  role,
  content,
  createdAt: new Date(),
});
