
"use client";

import { useState, type ChangeEvent, useEffect, useRef } from "react";
import Image from "next/image";
import PageContainer from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, UploadCloud, ScanText, Sparkles, FileType2, Brain } from "lucide-react";
import { extractTextFromImage, type ExtractTextFromImageInput, type ExtractTextFromImageOutput } from "@/ai/flows/extract-text-from-image";
import { processText, type ProcessTextInput, type ProcessTextOutput } from "@/ai/flows/process-text-flow";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function OcrPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState(""); 
  const [editableText, setEditableText] = useState(""); 
  
  const [isLoadingOcr, setIsLoadingOcr] = useState(false);
  const [isLoadingAiProcessing, setIsLoadingAiProcessing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const [generatedNotesHeading, setGeneratedNotesHeading] = useState("");
  const [generatedNotesBody, setGeneratedNotesBody] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setEditableText(extractedText);
    // Clear previous advanced notes when new OCR text is extracted
    setGeneratedNotesHeading("");
    setGeneratedNotesBody("");
  }, [extractedText]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
      setExtractedText(""); 
      setEditableText(""); 
      setGeneratedNotesHeading("");
      setGeneratedNotesBody("");
    }
  };

  const handleExtractText = async () => {
    if (!selectedFile || !previewUrl) {
      setError("Please select an image file.");
      return;
    }
    setIsLoadingOcr(true);
    setError(null);
    setExtractedText("");
    setEditableText("");
    setGeneratedNotesHeading("");
    setGeneratedNotesBody("");

    try {
      const input: ExtractTextFromImageInput = { photoDataUri: previewUrl };
      const result: ExtractTextFromImageOutput = await extractTextFromImage(input);
      setExtractedText(result.extractedText); 
      toast({ title: "Success", description: "Text extracted from image." });
    } catch (err) {
      console.error("OCR error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred during OCR.";
      setError(message);
      toast({ variant: "destructive", title: "OCR Error", description: message });
    } finally {
      setIsLoadingOcr(false);
    }
  };
  
  const handleGenerateAdvancedNotes = async () => {
    if (!editableText.trim()) {
      setError("No text to process. Please extract text from an image first or type some text.");
      toast({ variant: "destructive", title: "Input Missing", description: "No text available to generate notes from." });
      return;
    }
    setIsLoadingAiProcessing(true);
    setError(null);
    setGeneratedNotesHeading("");
    setGeneratedNotesBody("");
    
    try {
      const input: ProcessTextInput = { 
        text: editableText,
        mode: "simplify", 
        format: "bullet_points",
        // No refinementInstruction or previousProcessedText needed for this initial generation from OCR.
        // The prompt for simplify + bullet_points is already geared towards detailed output.
      };
      const result: ProcessTextOutput = await processText(input);
      setGeneratedNotesHeading(result.generatedHeading);
      setGeneratedNotesBody(result.processedText);
      toast({ title: "Success", description: "Advanced study notes generated." });
    } catch (err) {
      console.error("AI note generation error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred during AI note generation.";
      setError(message);
      toast({ variant: "destructive", title: "AI Processing Error", description: message });
    } finally {
      setIsLoadingAiProcessing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!generatedNotesBody && !generatedNotesHeading) {
      toast({ variant: "destructive", title: "Error", description: "No generated notes to download." });
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
      tempElement.style.backgroundColor = '#ffffff';

      let pdfContentHtml = '';
      if (generatedNotesHeading) {
        const headingDiv = document.createElement('div');
        headingDiv.style.fontSize = '16pt';
        headingDiv.style.fontWeight = 'bold';
        headingDiv.style.marginBottom = '12pt';
        headingDiv.style.color = '#000';
        headingDiv.innerHTML = generatedNotesHeading; // Renders <strong>
        pdfContentHtml += headingDiv.outerHTML;
      }
      if (generatedNotesBody) {
        const bodyDiv = document.createElement('div');
        bodyDiv.innerHTML = generatedNotesBody.replace(/\n/g, '<br />'); // Renders <strong> and newlines
        pdfContentHtml += bodyDiv.outerHTML;
      }
      
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
      pdf.save(`advanced_study_notes.pdf`);
      toast({ title: "Downloaded", description: "Advanced study notes downloaded as PDF." });
    } catch (e) {
      console.error("PDF generation error:", e);
      toast({ variant: "destructive", title: "PDF Error", description: "Could not generate PDF. See console for details." });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <PageContainer
      title="OCR & Advanced Note Generation"
      description="Extract text from handwritten notes, then let AI generate detailed study material for you."
    >
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><UploadCloud className="mr-2 h-6 w-6 text-primary" />1. Upload & Extract</CardTitle>
            <CardDescription>Select an image of your notes to extract the text.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="font-semibold">Upload Image</Label>
              <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            {previewUrl && (
              <div className="border rounded-md overflow-hidden">
                 <Image
                    src={previewUrl}
                    alt="Preview of uploaded note"
                    width={600}
                    height={400}
                    className="object-contain w-full h-auto max-h-[300px]"
                    data-ai-hint="handwritten notes"
                  />
              </div>
            )}

            <Button onClick={handleExtractText} disabled={!selectedFile || isLoadingOcr || isLoadingAiProcessing} className="w-full">
              {isLoadingOcr ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ScanText className="mr-2 h-4 w-4" />
              )}
              Extract Text from Image
            </Button>
            {error && !isLoadingOcr && !isLoadingAiProcessing && ( 
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Brain className="mr-2 h-6 w-6 text-primary" />2. Review & Generate Advanced Notes</CardTitle>
            <CardDescription>Edit the extracted text if needed, then generate detailed study notes with AI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="editable-text" className="font-semibold">Extracted Text (Editable)</Label>
            <Textarea
              id="editable-text"
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              placeholder="Extracted text will appear here. You can edit it before generating notes."
              rows={8}
              className="min-h-[150px]"
              disabled={isLoadingAiProcessing || isLoadingOcr}
            />
            <Button onClick={handleGenerateAdvancedNotes} disabled={isLoadingAiProcessing || isLoadingOcr || !editableText.trim()} className="w-full">
              {isLoadingAiProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Advanced Study Notes
            </Button>

            { (generatedNotesHeading || generatedNotesBody) && !isLoadingAiProcessing && (
              <Card className="mt-6 bg-accent/50">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-primary" /> AI-Generated Study Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {generatedNotesHeading && (
                    <div className="text-lg font-semibold" dangerouslySetInnerHTML={{ __html: generatedNotesHeading }} />
                  )}
                  {generatedNotesBody && (
                    <div className="text-sm prose max-w-none prose-sm" dangerouslySetInnerHTML={{ __html: generatedNotesBody.replace(/\n/g, '<br />') }} />
                  )}
                   <Button onClick={handleDownloadPdf} disabled={isGeneratingPdf || isLoadingAiProcessing} variant="outline" className="w-full mt-4">
                      {isGeneratingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileType2 className="mr-2 h-4 w-4" />}
                      {isGeneratingPdf ? 'Generating PDF...' : 'Download Notes as PDF'}
                    </Button>
                </CardContent>
              </Card>
            )}
            
            {error && (isLoadingAiProcessing || (!isLoadingOcr && error)) && (
              <Alert variant="destructive" className="mt-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Processing Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

    