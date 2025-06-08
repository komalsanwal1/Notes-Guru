"use client";

import { useState } from "react";
import PageContainer from "@/components/shared/page-container";
import ChatInterface, { createChatMessage, type ChatMessageProps } from "@/components/shared/chat-interface";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { studyChat, type StudyChatInput, type StudyChatOutput } from "@/ai/flows/study-chat";
import { BookOpen, MessageSquare } from "lucide-react";

export default function StudyChatPage() {
  const [notesContext, setNotesContext] = useState("");
  const [isContextSet, setIsContextSet] = useState(false);
  
  const initialMessages: ChatMessageProps[] = [
    createChatMessage("system", "Welcome to Study Chat! Provide your notes below, then ask me anything about them.")
  ];

  const handleSetContext = () => {
    if (notesContext.trim()) {
      setIsContextSet(true);
      // Update initial message for chat if context is set
      initialMessages.splice(0, initialMessages.length, 
        createChatMessage("assistant", "Great! I have your notes. What would you like to ask?")
      );
    }
  };

  return (
    <PageContainer
      title="Study Chat"
      description="Deepen your understanding by chatting with an AI about your notes."
    >
      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><BookOpen className="mr-2 h-6 w-6 text-primary" />Your Study Notes</CardTitle>
            <CardDescription>
              {isContextSet 
                ? "Notes context is set. You can now ask questions in the chat."
                : "Paste your notes here to provide context for the chat."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="notes-context" className="font-semibold">Notes for Context</Label>
            <Textarea
              id="notes-context"
              value={notesContext}
              onChange={(e) => setNotesContext(e.target.value)}
              placeholder="Paste your study notes here..."
              rows={15}
              className="min-h-[300px]"
              disabled={isContextSet}
            />
            {!isContextSet && (
              <Button onClick={handleSetContext} disabled={!notesContext.trim()} className="w-full">
                Set Notes Context
              </Button>
            )}
            {isContextSet && (
               <Button onClick={() => setIsContextSet(false)} variant="outline" className="w-full">
                Change Notes
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
           <Card className="shadow-lg">
              <CardHeader>
                 <CardTitle className="font-headline flex items-center"><MessageSquare className="mr-2 h-6 w-6 text-primary" />Chat with AI</CardTitle>
                 <CardDescription>
                    {isContextSet 
                        ? "Ask questions based on the notes you provided." 
                        : "Please set your notes context first to start chatting."}
                 </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isContextSet ? (
                    <ChatInterface<StudyChatInput, StudyChatOutput>
                        aiFlow={studyChat}
                        transformInput={(userInput) => ({
                        notes: notesContext,
                        question: userInput,
                        })}
                        transformOutput={(aiResponse) => aiResponse.answer}
                        initialMessages={initialMessages}
                        chatContainerClassName="h-[calc(600px-120px)]" // Adjust as needed
                        inputPlaceholder="Ask a question about your notes..."
                    />
                ) : (
                    <div className="h-[500px] flex items-center justify-center text-muted-foreground p-4 text-center">
                        Please provide your notes on the left to begin your study session.
                    </div>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </PageContainer>
  );
}
