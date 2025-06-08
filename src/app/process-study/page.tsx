
"use client";

import { useState, useMemo, useEffect } from "react";
import PageContainer from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, Wand2, MessageSquare, Edit, FileType2, Brain, Heading } from "lucide-react";
import { processText, type ProcessTextInput, type ProcessTextOutput } from "@/ai/flows/process-text-flow";
import { studyChat, type StudyChatInput, type StudyChatOutput } from "@/ai/flows/study-chat";
import ChatInterface, { createChatMessage } from "@/components/shared/chat-interface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ProcessingMode = "simplify" | "summarize" | "generate_qa";
type OutputFormat = "bullet_points" | "story_format";

export default function ProcessStudyPage() {
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<ProcessingMode>("simplify");
  const [format, setFormat] = useState<OutputFormat>("bullet_points");
  const [generatedHeading, setGeneratedHeading] = useState("");
  const [processedText, setProcessedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialProcessingDone, setInitialProcessingDone] = useState(false);
  const [refinementChatKey, setRefinementChatKey] = useState(0);
  const { toast } = useToast();

  const handleProcessText = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to process.");
      toast({ variant: "destructive", title: "Input Missing", description: "Please enter text to process." });
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedHeading("");
    setProcessedText("");
    setInitialProcessingDone(false);

    try {
      const input: ProcessTextInput = { text: inputText, mode, format };
      const result: ProcessTextOutput = await processText(input);
      setGeneratedHeading(result.generatedHeading);
      setProcessedText(result.processedText);
      setInitialProcessingDone(true);
      setRefinementChatKey(prev => prev + 1);
      const modeFriendlyName = mode === 'generate_qa' ? 'Q&A' : mode;
      toast({ title: "Success", description: `Successfully generated ${modeFriendlyName.replace("_", " ")} in ${format.replace("_", " ")} format.` });
    } catch (err) {
      console.error("Processing error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred during processing.";
      setError(message);
      toast({ variant: "destructive", title: "Processing Error", description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const refinementChatInitialMessages = useMemo(() => {
    if (initialProcessingDone && (generatedHeading.trim() || processedText.trim())) {
      let modeDescription = "";
      if (mode === 'simplify') modeDescription = "simplification";
      else if (mode === 'summarize') modeDescription = "summary";
      else if (mode === 'generate_qa') modeDescription = "Q&A generation";
      
      const fullContent = (generatedHeading ? `<strong>${generatedHeading}</strong>\n\n` : '') + processedText;

      return [
        createChatMessage("system", `This is the initial ${modeDescription}. The AI has generated a heading and the content below. You can ask me to refine it further (e.g., 'make the body shorter', 'explain the first bullet point', 'change the heading to...').`),
        createChatMessage("assistant", fullContent)
      ];
    }
    return [createChatMessage("system", "Perform an initial text processing first.")];
  }, [initialProcessingDone, processedText, generatedHeading, mode, refinementChatKey]);

  const studyChatInitialMessages = useMemo(() => {
    if (initialProcessingDone && (generatedHeading.trim() || processedText.trim())) {
       return [createChatMessage("system", "You can ask follow-up questions about the processed text below (including its heading). I can use my general knowledge if needed.")];
    }
    return [createChatMessage("system", "Process some text first to enable follow-up questions.")];
  }, [initialProcessingDone, processedText, generatedHeading, refinementChatKey]);
  
  const handleDownloadPdf = async () => {
    if (!processedText && !generatedHeading) {
      toast({ variant: "destructive", title: "Error", description: "No processed text or heading to download." });
      return;
    }

    setIsGeneratingPdf(true);
    toast({ title: "Generating PDF...", description: "Please wait a moment." });

    try {
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px'; // Off-screen
      tempElement.style.width = '700px'; 
      tempElement.style.padding = '20px';
      tempElement.style.fontFamily = 'Inter, sans-serif';
      tempElement.style.backgroundColor = '#ffffff'; // Ensure white background for canvas

      let pdfContentHtml = '';
      if (generatedHeading) {
        // Use dangerouslySetInnerHTML for heading to render <strong> tags
        const headingDiv = document.createElement('div');
        headingDiv.style.fontSize = '16pt';
        headingDiv.style.fontWeight = 'bold';
        headingDiv.style.marginBottom = '12pt';
        headingDiv.style.color = '#000'; // Ensure heading text is black
        headingDiv.innerHTML = generatedHeading;
        pdfContentHtml += headingDiv.outerHTML;
      }
      // Use dangerouslySetInnerHTML for processedText to render <strong> tags
      const bodyDiv = document.createElement('div');
      bodyDiv.innerHTML = processedText.replace(/\n/g, '<br />');
      pdfContentHtml += bodyDiv.outerHTML;
      
      tempElement.innerHTML = `<div style="font-size: 12pt; line-height: 1.5; color: #333; background-color: #fff; white-space: pre-wrap;">${pdfContentHtml}</div>`;
      document.body.appendChild(tempElement);

      const canvas = await html2canvas(tempElement, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(tempElement);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 40; 
      const contentWidth = pdfWidth - 2 * margin;
      
      const imgReportedWidth = canvas.width / 2; 
      const imgReportedHeight = canvas.height / 2; 
      
      const ratio = imgReportedWidth / imgReportedHeight;
      let imgDisplayWidth = contentWidth;
      let imgDisplayHeight = imgDisplayWidth / ratio;

      if (imgDisplayHeight > pdfHeight - 2 * margin) {
        imgDisplayHeight = pdfHeight - 2 * margin;
        imgDisplayWidth = imgDisplayHeight * ratio;
      }
      
      const x = margin + (contentWidth - imgDisplayWidth) / 2; 
      const y = margin;

      pdf.addImage(imgData, 'PNG', x, y, imgDisplayWidth, imgDisplayHeight);
      pdf.save(`${mode}_${format}.pdf`);
      toast({ title: "Downloaded", description: "Processed text downloaded as PDF." });
    } catch (e) {
      console.error("PDF generation error:", e);
      toast({ variant: "destructive", title: "PDF Error", description: "Could not generate PDF. See console for details." });
    } finally {
      setIsGeneratingPdf(false);
    }
  };


  return (
    <PageContainer
      title="Process &amp; Study Text"
      description="Simplify complex information, summarize key points, generate Q&A, and more. Refine with AI and ask follow-up questions."
    >
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Brain className="mr-2 h-6 w-6 text-primary" />Input &amp; Process</CardTitle>
            <CardDescription>Enter your text, choose a processing mode and format, then start.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="input-text" className="font-semibold">Your Text</Label>
              <Textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your text here..."
                rows={10}
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Processing Mode</Label>
              <RadioGroup
                value={mode}
                onValueChange={(value: string) => setMode(value as ProcessingMode)}
                className="flex flex-wrap gap-x-4 gap-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="simplify" id="simplify-mode" />
                  <Label htmlFor="simplify-mode">Simplify</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="summarize" id="summarize-mode" />
                  <Label htmlFor="summarize-mode">Summarize</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="generate_qa" id="generate-qa-mode" />
                  <Label htmlFor="generate-qa-mode">Generate Q&amp;A</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label className="font-semibold">Output Format</Label>
              <RadioGroup
                value={format}
                onValueChange={(value: string) => setFormat(value as OutputFormat)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bullet_points" id="bullet-points-format" />
                  <Label htmlFor="bullet-points-format">Bullet Points</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="story_format" id="story-format" />
                  <Label htmlFor="story-format">Story Format</Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={handleProcessText} disabled={isLoading || isGeneratingPdf} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Process Text
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
            <TabsTrigger value="result">Processed Text &amp; Refine</TabsTrigger>
            <TabsTrigger value="chat" disabled={!initialProcessingDone || (!processedText.trim() && !generatedHeading.trim())}>Study Chat (AI Enhanced)</TabsTrigger>
          </TabsList>
          <TabsContent value="result">
            <Card className="shadow-lg">
              <CardHeader>
                 <CardTitle className="font-headline flex items-center"><Edit className="mr-2 h-6 w-6 text-primary" />Refine Processed Text</CardTitle>
                 <CardDescription>
                    {initialProcessingDone && (processedText.trim() || generatedHeading.trim()) ? "Chat with the AI to refine the text and its heading." : "Process some text first to enable refinement."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {initialProcessingDone && (processedText.trim() || generatedHeading.trim()) ? (
                  <>
                   <ChatInterface<ProcessTextInput, ProcessTextOutput>
                    instanceKey={`refine-${refinementChatKey}`}
                    aiFlow={processText}
                    initialMessages={refinementChatInitialMessages}
                    transformInput={(userInput, history) => {
                      // Find the latest assistant message to get the previous state
                      let prevProcessed = processedText;
                      let prevHeading = generatedHeading;
                      for (let i = history.length - 1; i >= 0; i--) {
                        if (history[i].role === 'assistant') {
                          // This is a bit tricky because assistant content now includes heading
                          // We'll rely on the AI flow to parse its own previous output if needed,
                          // and send the current state from the page.
                          break; 
                        }
                      }
                      return {
                        text: inputText, // Original input text
                        mode,
                        format,
                        previousProcessedText: processedText, // Current processed text from state
                        previousHeading: generatedHeading, // Current heading from state
                        refinementInstruction: userInput,
                      };
                    }}
                    transformOutput={(aiResponse) => {
                       // The AI response content for the chat should include both heading and text
                       return (aiResponse.generatedHeading ? `<strong>${aiResponse.generatedHeading}</strong>\n\n` : '') + aiResponse.processedText;
                    }}
                    onNewAiMessageContent={(newCombinedContent, aiResponse) => {
                      setGeneratedHeading(aiResponse.generatedHeading); 
                      setProcessedText(aiResponse.processedText); 
                    }}
                    chatContainerClassName="h-[calc(440px-120px)]" 
                    inputPlaceholder="e.g., 'make body shorter', 'change heading'"
                  />
                  <div className="p-4 border-t flex gap-2 justify-end">
                    <Button onClick={handleDownloadPdf} disabled={(!processedText && !generatedHeading) || isLoading || isGeneratingPdf} variant="outline">
                      {isGeneratingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileType2 className="mr-2 h-4 w-4" />}
                      {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
                    </Button>
                  </div>
                  </>
                ) : (
                  <div className="h-[calc(500px-120px)] flex items-center justify-center text-muted-foreground p-4 text-center">
                    Please process some text using the panel on the left. The result will appear here for refinement.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="chat">
             <Card className="shadow-lg">
              <CardHeader>
                 <CardTitle className="font-headline flex items-center"><MessageSquare className="mr-2 h-6 w-6 text-primary" />AI Enhanced Study Chat</CardTitle>
                 <CardDescription>
                    {initialProcessingDone && (processedText.trim() || generatedHeading.trim()) ? "Ask questions about the processed text. AI will use general knowledge if needed." : "Process text first to enable this chat."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {initialProcessingDone && (processedText.trim() || generatedHeading.trim()) ? (
                   <ChatInterface<StudyChatInput, StudyChatOutput>
                    instanceKey={`study-${refinementChatKey}-${generatedHeading.length}-${processedText.length}`}
                    aiFlow={studyChat}
                    transformInput={(userInput, history) => ({
                      notes: (generatedHeading ? `<strong>${generatedHeading}</strong>\n\n` : '') + processedText, 
                      question: userInput,
                      chatHistory: history.filter(msg => msg.role === 'user' || msg.role === 'assistant')
                    })}
                    transformOutput={(aiResponse) => aiResponse.answer}
                    initialMessages={studyChatInitialMessages}
                    chatContainerClassName="h-[calc(500px-120px)]" 
                    inputPlaceholder="Ask a question about the text..."
                  />
                ) : (
                  <div className="h-[calc(500px-120px)] flex items-center justify-center text-muted-foreground p-4 text-center">
                    Please process some text first to use the AI enhanced study chat.
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

