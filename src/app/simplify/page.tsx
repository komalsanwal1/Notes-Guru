
"use client";

import { useState, useMemo, useEffect } from "react";
import PageContainer from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, Wand2, MessageSquare, Edit } from "lucide-react";
import { simplifyText, type SimplifyTextInput, type SimplifyTextOutput } from "@/ai/flows/simplify-with-ai";
import { studyChat, type StudyChatInput, type StudyChatOutput } from "@/ai/flows/study-chat";
import ChatInterface, { createChatMessage, type ChatMessageProps } from "@/components/shared/chat-interface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SimplificationFormat = "bullet points" | "story format";

export default function SimplifyPage() {
  const [textToSimplify, setTextToSimplify] = useState("");
  const [format, setFormat] = useState<SimplificationFormat>("bullet points");
  const [simplifiedText, setSimplifiedText] = useState(""); // Holds the latest simplified/refined text
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialSimplificationDone, setInitialSimplificationDone] = useState(false);
  const [refinementChatKey, setRefinementChatKey] = useState(0); // Key to reset refinement chat

  const handleSimplify = async () => {
    if (!textToSimplify.trim()) {
      setError("Please enter some text to simplify.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSimplifiedText(""); // Clear previous
    setInitialSimplificationDone(false);

    try {
      const input: SimplifyTextInput = { text: textToSimplify, format };
      const result: SimplifyTextOutput = await simplifyText(input);
      setSimplifiedText(result.simplifiedText);
      setInitialSimplificationDone(true);
      setRefinementChatKey(prev => prev + 1); // Trigger re-render of refinement chat with new initial message
    } catch (err) {
      console.error("Simplification error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred during simplification.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const followUpChatInitialMessages = useMemo(() => {
    return initialSimplificationDone && simplifiedText
      ? [createChatMessage("system", "You can ask follow-up questions about the refined text below.")]
      : [createChatMessage("system", "Simplify text first to enable follow-up questions.")];
  }, [initialSimplificationDone, simplifiedText]);

  const refinementChatInitialMessages = useMemo(() => {
    if (initialSimplificationDone && simplifiedText) {
      return [
        createChatMessage("system", "This is the initial simplification. You can ask me to refine it further (e.g., 'make it shorter', 'explain the first bullet point')."),
        createChatMessage("assistant", simplifiedText)
      ];
    }
    return [createChatMessage("system", "Perform an initial simplification first.")];
  }, [initialSimplificationDone, simplifiedText]);


  return (
    <PageContainer
      title="AI Text Simplification"
      description="Make complex text easy to understand. Choose to simplify into bullet points or a story. Then, refine the result with AI chat."
    >
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Wand2 className="mr-2 h-6 w-6 text-primary" />Simplify Your Text</CardTitle>
            <CardDescription>Enter the text you want to simplify and choose your desired output format. This will be the starting point for refinement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="text-to-simplify" className="font-semibold">Text to Simplify</Label>
              <Textarea
                id="text-to-simplify"
                value={textToSimplify}
                onChange={(e) => setTextToSimplify(e.target.value)}
                placeholder="Paste your complex text here..."
                rows={10}
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Output Format</Label>
              <RadioGroup
                value={format}
                onValueChange={(value: SimplificationFormat) => setFormat(value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bullet points" id="bullet-points" />
                  <Label htmlFor="bullet-points">Bullet Points</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="story format" id="story-format" />
                  <Label htmlFor="story-format">Story Format</Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={handleSimplify} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Simplify Text
            </Button>

            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="result" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="result">Refine Simplified Text</TabsTrigger>
            <TabsTrigger value="chat" disabled={!initialSimplificationDone || !simplifiedText}>General Follow-up Chat</TabsTrigger>
          </TabsList>
          <TabsContent value="result">
            <Card className="shadow-lg">
              <CardHeader>
                 <CardTitle className="font-headline flex items-center"><Edit className="mr-2 h-6 w-6 text-primary" />Refine Simplification</CardTitle>
                 <CardDescription>
                    {initialSimplificationDone && simplifiedText ? "Chat with the AI to refine the simplified text." : "Perform an initial simplification to enable refinement."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {initialSimplificationDone && simplifiedText ? (
                   <ChatInterface<SimplifyTextInput, SimplifyTextOutput>
                    instanceKey={`refine-${refinementChatKey}`}
                    aiFlow={simplifyText}
                    initialMessages={refinementChatInitialMessages}
                    transformInput={(userInput, history) => {
                      let prevSimplified = simplifiedText; // Fallback
                      // Get the latest assistant message from history for refinement context
                      for (let i = history.length - 1; i >= 0; i--) {
                        if (history[i].role === 'assistant') {
                          prevSimplified = history[i].content;
                          break;
                        }
                      }
                      return {
                        text: textToSimplify, // Original complex text is the base
                        format,
                        previousSimplifiedText: prevSimplified,
                        refinementInstruction: userInput,
                      };
                    }}
                    transformOutput={(aiResponse) => aiResponse.simplifiedText}
                    onNewAiMessageContent={(newText) => {
                      setSimplifiedText(newText); // Update main state for follow-up chat
                    }}
                    chatContainerClassName="h-[calc(500px-120px)]" 
                    inputPlaceholder="e.g., 'make it shorter', 'explain more'"
                  />
                ) : (
                  <div className="h-[calc(500px-120px)] flex items-center justify-center text-muted-foreground p-4 text-center">
                    Please simplify some text first using the panel on the left. The initial result will appear here for refinement.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="chat">
             <Card className="shadow-lg">
              <CardHeader>
                 <CardTitle className="font-headline flex items-center"><MessageSquare className="mr-2 h-6 w-6 text-primary" />Ask About Final Text</CardTitle>
                 <CardDescription>
                    {initialSimplificationDone && simplifiedText ? "Ask general follow-up questions about the current refined text." : "Simplify and refine text first to enable this chat."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {initialSimplificationDone && simplifiedText ? (
                   <ChatInterface<StudyChatInput, StudyChatOutput>
                    instanceKey={`followup-${refinementChatKey}-${simplifiedText.length}`} // Re-key if simplifiedText changes significantly
                    aiFlow={studyChat}
                    transformInput={(userInput) => ({
                      notes: simplifiedText, // Context is the latest simplified/refined text
                      question: userInput,
                    })}
                    transformOutput={(aiResponse) => aiResponse.answer}
                    initialMessages={followUpChatInitialMessages}
                    chatContainerClassName="h-[calc(500px-120px)]" 
                    inputPlaceholder="Ask a follow-up question..."
                  />
                ) : (
                  <div className="h-[calc(500px-120px)] flex items-center justify-center text-muted-foreground p-4 text-center">
                    Please simplify and refine some text first to use the general follow-up chat feature.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
