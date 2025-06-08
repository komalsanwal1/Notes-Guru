
"use client";

import { useMemo } from "react";
import PageContainer from "@/components/shared/page-container";
import ChatInterface, { createChatMessage } from "@/components/shared/chat-interface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { studyChat, type StudyChatInput, type StudyChatOutput } from "@/ai/flows/study-chat";
import { MessageSquare } from "lucide-react";

export default function StudyChatPage() {
  
  const chatInterfaceInitialMessages = useMemo(() => {
    return [createChatMessage("assistant", "Hi there! I'm your AI Study Assistant. Ask me anything to help you with your studies, understand concepts, or prepare for exams!")];
  }, []);

  return (
    <PageContainer
      title="General AI Study Chat"
      description="Your personal AI tutor. Ask questions on any academic subject, get explanations, and deepen your understanding."
    >
      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
           <Card className="shadow-lg">
              <CardHeader>
                 <CardTitle className="font-headline flex items-center"><MessageSquare className="mr-2 h-6 w-6 text-primary" />Chat with Your AI Study Assistant</CardTitle>
                 <CardDescription>
                    Ask any study-related questions. I'm here to help you learn and explore academic topics!
                 </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ChatInterface<StudyChatInput, StudyChatOutput>
                    aiFlow={studyChat}
                    transformInput={(userInput, history) => ({ 
                      question: userInput,
                      chatHistory: history.filter(msg => msg.role === 'user' || msg.role === 'assistant')
                      // No 'notes' field is passed, so the AI uses general knowledge.
                    })}
                    transformOutput={(aiResponse) => aiResponse.answer}
                    initialMessages={chatInterfaceInitialMessages}
                    chatContainerClassName="h-[calc(70vh-120px)] min-h-[400px]" 
                    inputPlaceholder="Ask about any academic topic..."
                />
              </CardContent>
            </Card>
        </div>
      </div>
    </PageContainer>
  );
}

