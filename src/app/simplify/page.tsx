"use client";

import { useState } from "react";
import PageContainer from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, Wand2, MessageSquare } from "lucide-react";
import { simplifyText, type SimplifyTextInput, type SimplifyTextOutput } from "@/ai/flows/simplify-with-ai";
import { studyChat, type StudyChatInput, type StudyChatOutput } from "@/ai/flows/study-chat";
import ChatInterface, { createChatMessage, type ChatMessageProps } from "@/components/shared/chat-interface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SimplificationFormat = "bullet points" | "story format";

export default function SimplifyPage() {
  const [textToSimplify, setTextToSimplify] = useState("");
  const [format, setFormat] = useState<SimplificationFormat>("bullet points");
  const [simplifiedText, setSimplifiedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimplify = async () => {
    if (!textToSimplify.trim()) {
      setError("Please enter some text to simplify.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSimplifiedText("");

    try {
      const input: SimplifyTextInput = { text: textToSimplify, format };
      const result: SimplifyTextOutput = await simplifyText(input);
      setSimplifiedText(result.simplifiedText);
    } catch (err) {
      console.error("Simplification error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred during simplification.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const initialChatMessages = simplifiedText 
    ? [createChatMessage("system", "You can ask follow-up questions about the simplified text below.")] 
    : [createChatMessage("system", "Simplify text first to enable follow-up questions.")];

  return (
    <PageContainer
      title="AI Text Simplification"
      description="Make complex text easy to understand. Choose to simplify into bullet points or a story."
    >
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Wand2 className="mr-2 h-6 w-6 text-primary" />Simplify Your Text</CardTitle>
            <CardDescription>Enter the text you want to simplify and choose your desired output format.</CardDescription>
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
            <TabsTrigger value="result">Simplified Result</TabsTrigger>
            <TabsTrigger value="chat" disabled={!simplifiedText}>Follow-up Chat</TabsTrigger>
          </TabsList>
          <TabsContent value="result">
            <Card className="shadow-lg min-h-[400px]">
              <CardHeader>
                <CardTitle className="font-headline">Simplified Output</CardTitle>
              </CardHeader>
              <CardContent>
                {simplifiedText ? (
                  <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap p-4 border rounded-md bg-muted/50 min-h-[200px]">
                    {simplifiedText}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Your simplified text will appear here.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="chat">
             <Card className="shadow-lg">
              <CardHeader>
                 <CardTitle className="font-headline flex items-center"><MessageSquare className="mr-2 h-6 w-6 text-primary" />Ask About Simplified Text</CardTitle>
                 <CardDescription>
                    {simplifiedText ? "Ask follow-up questions about the text simplified above." : "Simplify text first to enable the chat."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {simplifiedText ? (
                   <ChatInterface<StudyChatInput, StudyChatOutput>
                    aiFlow={studyChat}
                    transformInput={(userInput) => ({
                      notes: simplifiedText, // Context is the simplified text
                      question: userInput,
                    })}
                    transformOutput={(aiResponse) => aiResponse.answer}
                    initialMessages={initialChatMessages}
                    chatContainerClassName="h-[calc(500px-120px)]" // Adjust height based on card header/footer
                    inputPlaceholder="Ask a follow-up question..."
                  />
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Please simplify some text first to use the chat feature.
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
