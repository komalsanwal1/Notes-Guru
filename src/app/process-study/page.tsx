
"use client";

import { useState, useMemo, useEffect } from "react";
import PageContainer from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, Wand2, MessageSquare, Edit, FileType2, Brain } from "lucide-react";
import { processText, type ProcessTextInput, type ProcessTextOutput } from "@/ai/flows/process-text-flow";
import { studyChat, type StudyChatInput, type StudyChatOutput } from "@/ai/flows/study-chat";
import ChatInterface, { createChatMessage } from "@/components/shared/chat-interface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ProcessingMode = "simplify" | "summarize";
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
      toast({ title: "Success", description: `Text ${mode}d into ${format.replace("_", " ")}.` });
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
      return [
        createChatMessage("system", `This is the initial ${mode === 'simplify' ? 'simplification' : 'summary'}. You can ask me to refine it further (e.g., 'make it shorter', 'explain the first bullet point').`),
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
      tempElement.style.width = '700px';
      tempElement.style.padding = '20px';
      tempElement.style.fontFamily = 'Inter, sans-serif';
      // Ensure the HTML content uses the same font styles as the display for consistency
      // The ChatMessage component uses whitespace-pre-wrap, so we should try to mimic that.
      // Directly setting innerHTML with processedText will render the <strong> tags.
      tempElement.innerHTML = `<div style="font-size: 14px; line-height: 1.6; color: #333; background-color: #fff; white-space: pre-wrap;">${processedText}</div>`;
      document.body.appendChild(tempElement);

      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: null, // Use transparent background for canvas, then fill in PDF
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
      const imgWidth = canvas.width / 2; // Adjust for scale
      const imgHeight = canvas.height / 2; // Adjust for scale
      
      const margin = 40; // pt
      const contentWidth = pdfWidth - 2 * margin;
      const contentHeight = pdfHeight - 2 * margin;

      const ratio = imgWidth / imgHeight;
      let newImgWidth = contentWidth;
      let newImgHeight = newImgWidth / ratio;

      if (newImgHeight > contentHeight) {
        newImgHeight = contentHeight;
        newImgWidth = newImgHeight * ratio;
      }
      
      const x = margin + (contentWidth - newImgWidth) / 2;
      const y = margin;

      pdf.setFillColor(255, 255, 255); // White background for the PDF page
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');

      pdf.addImage(imgData, 'PNG', x, y, newImgWidth, newImgHeight);
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
      description="Simplify complex information, summarize key points, or generate detailed notes. Refine with AI and ask follow-up questions."
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
                onValueChange={(value: ProcessingMode) => setMode(value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="simplify" id="simplify-mode" />
                  <Label htmlFor="simplify-mode">Simplify</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="summarize" id="summarize-mode" />
                  <Label htmlFor="summarize-mode">Summarize</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label className="font-semibold">Output Format</Label>
              <RadioGroup
                value={format}
                onValueChange={(value: OutputFormat) => setFormat(value)}
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
                      setProcessedText(newText);
                    }}
                    chatContainerClassName="h-[calc(440px-120px)]" 
                    inputPlaceholder="e.g., 'make it shorter', 'explain more'"
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
                    instanceKey={`study-${refinementChatKey}-${processedText.length}`}
                    aiFlow={studyChat}
                    transformInput={(userInput) => ({
                      notes: processedText, 
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
