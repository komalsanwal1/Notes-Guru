"use client";

import { useState, useMemo, useEffect } from "react";
import PageContainer from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, Wand2, MessageSquare, Edit, FileType2, Brain, HelpCircle } from "lucide-react";
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
    setProcessedText("");
    setInitialProcessingDone(false);

    try {
      const input: ProcessTextInput = { text: inputText, mode, format };
      const result: ProcessTextOutput = await processText(input);
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
    if (initialProcessingDone && processedText.trim()) {
      let modeDescription = "";
      if (mode === 'simplify') modeDescription = "simplification";
      else if (mode === 'summarize') modeDescription = "summary";
      else if (mode === 'generate_qa') modeDescription = "Q&A generation";

      return [
        createChatMessage("system", `This is the initial ${modeDescription}. You can ask me to refine it further (e.g., 'make it shorter', 'explain the first bullet point', 'add more questions').`),
        createChatMessage("assistant", processedText)
      ];
    }
    return [createChatMessage("system", "Perform an initial text processing first.")];
  }, [initialProcessingDone, processedText, mode, refinementChatKey]);

  const studyChatInitialMessages = useMemo(() => {
    return initialProcessingDone && processedText.trim()
      ? [createChatMessage("system", "You can ask follow-up questions about the processed text below. I can use my general knowledge if needed.")]
      : [createChatMessage("system", "Process some text first to enable follow-up questions.")];
  }, [initialProcessingDone, processedText, refinementChatKey]);
  
  const handleDownloadPdf = async () => {
    if (!processedText) {
      toast({ variant: "destructive", title: "Error", description: "No processed text to download." });
      return;
    }

    setIsGeneratingPdf(true);
    toast({ title: "Generating PDF...", description: "Please wait a moment." });

    try {
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.width = '700px'; // A4-like width for better layouting
      tempElement.style.padding = '20px';
      tempElement.style.fontFamily = 'Inter, sans-serif'; // Match app font
      tempElement.innerHTML = `<div style="font-size: 12pt; line-height: 1.5; color: #333; background-color: #fff; white-space: pre-wrap;">${processedText.replace(/\n/g, '<br />')}</div>`;
      document.body.appendChild(tempElement);

      const canvas = await html2canvas(tempElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff', // Ensure canvas has white background
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
      
      const margin = 40; // pt
      const contentWidth = pdfWidth - 2 * margin;
      
      const imgReportedWidth = canvas.width / 2; // Adjust for scale
      const imgReportedHeight = canvas.height / 2; // Adjust for scale
      
      const ratio = imgReportedWidth / imgReportedHeight;
      let imgDisplayWidth = contentWidth;
      let imgDisplayHeight = imgDisplayWidth / ratio;

      // If image height is still too large for one page, we might need to split it or scale it down further.
      // For simplicity, we'll scale to fit a single page height if it overflows.
      if (imgDisplayHeight > pdfHeight - 2 * margin) {
        imgDisplayHeight = pdfHeight - 2 * margin;
        imgDisplayWidth = imgDisplayHeight * ratio;
      }
      
      const x = margin + (contentWidth - imgDisplayWidth) / 2; // Center horizontally
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
      title="Process & Study Text"
      description="Simplify complex information, summarize key points, generate Q&A, and more. Refine with AI and ask follow-up questions."
    >
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Brain className="mr-2 h-6 w-6 text-primary" />Input & Process</CardTitle>
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
                  <Label htmlFor="generate-qa-mode">Generate Q&A</Label>
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
            <TabsTrigger value="result">Processed Text & Refine</TabsTrigger>
            <TabsTrigger value="chat" disabled={!initialProcessingDone || !processedText.trim()}>Study Chat (AI Enhanced)</TabsTrigger>
          </TabsList>
          <TabsContent value="result">
            <Card className="shadow-lg">
              <CardHeader>
                 <CardTitle className="font-headline flex items-center"><Edit className="mr-2 h-6 w-6 text-primary" />Refine Processed Text</CardTitle>
                 <CardDescription>
                    {initialProcessingDone && processedText.trim() ? "Chat with the AI to refine the text." : "Process some text first to enable refinement."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {initialProcessingDone && processedText.trim() ? (
                  <>
                   <ChatInterface<ProcessTextInput, ProcessTextOutput>
                    instanceKey={`refine-${refinementChatKey}`}
                    aiFlow={processText}
                    initialMessages={refinementChatInitialMessages}
                    transformInput={(userInput, history) => {
                      let prevProcessed = processedText; 
                      for (let i = history.length - 1; i >= 0; i--) {
                        if (history[i].role === 'assistant') {
                          prevProcessed = history[i].content;
                          break;
                        }
                      }
                      return {
                        text: inputText,
                        mode,
                        format,
                        previousProcessedText: prevProcessed,
                        refinementInstruction: userInput,
                      };
                    }}
                    transformOutput={(aiResponse) => aiResponse.processedText}
                    onNewAiMessageContent={(newText) => {
                      setProcessedText(newText); // Update the main processedText state for PDF download and study chat
                    }}
                    chatContainerClassName="h-[calc(440px-120px)]" 
                    inputPlaceholder="e.g., 'make it shorter', 'add more detail'"
                  />
                  <div className="p-4 border-t flex gap-2 justify-end">
                    <Button onClick={handleDownloadPdf} disabled={!processedText || isLoading || isGeneratingPdf} variant="outline">
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
                    {initialProcessingDone && processedText.trim() ? "Ask questions about the processed text. AI will use general knowledge if needed." : "Process text first to enable this chat."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {initialProcessingDone && processedText.trim() ? (
                   <ChatInterface<StudyChatInput, StudyChatOutput>
                    instanceKey={`study-${refinementChatKey}-${processedText.length}`} // Ensure re-render if processedText changes
                    aiFlow={studyChat}
                    transformInput={(userInput) => ({
                      notes: processedText, // Use the latest processed text from state
                      question: userInput,
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

