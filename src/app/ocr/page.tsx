"use client";

import { useState, type ChangeEvent, useEffect } from "react";
import Image from "next/image";
import PageContainer from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, UploadCloud, ScanText, Sparkles } from "lucide-react";
import { extractTextFromImage, type ExtractTextFromImageInput, type ExtractTextFromImageOutput } from "@/ai/flows/extract-text-from-image";
import { simplifyText, type SimplifyTextInput, type SimplifyTextOutput } from "@/ai/flows/simplify-with-ai";
import { useToast } from "@/hooks/use-toast";

export default function OcrPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [editableText, setEditableText] = useState("");
  const [isLoadingOcr, setIsLoadingOcr] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setEditableText(extractedText);
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
  
  const handleAiAction = async (action: "clean" | "revise" | "shorten") => {
    if (!editableText.trim()) {
      setError("No text to process.");
      return;
    }
    setIsLoadingAi(true);
    setError(null);

    let promptText = "";
    if (action === "clean") promptText = "Clean up any OCR errors and improve readability of the following text, maintaining original meaning and style:\n\n";
    if (action === "revise") promptText = "Revise the following text for clarity, conciseness, and improved grammar, while preserving the core message:\n\n";
    if (action === "shorten") promptText = "Shorten the following text significantly, creating a concise summary or key bullet points:\n\n";
    
    try {
      const input: SimplifyTextInput = { 
        text: promptText + editableText, 
        format: "bullet points" // Default, can be changed or made configurable
      };
      const result: SimplifyTextOutput = await simplifyText(input);
      setEditableText(result.simplifiedText);
      toast({ title: "Success", description: `Text ${action}ed successfully.` });
    } catch (err) {
      console.error(`AI ${action} error:`, err);
      const message = err instanceof Error ? err.message : `An unexpected error occurred during AI ${action}.`;
      setError(message);
      toast({ variant: "destructive", title: `AI ${action} Error`, description: message });
    } finally {
      setIsLoadingAi(false);
    }
  };


  return (
    <PageContainer
      title="OCR for Handwritten Notes"
      description="Upload an image of your handwritten notes to extract text. Then, edit and refine it with AI."
    >
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><UploadCloud className="mr-2 h-6 w-6 text-primary" />Upload & Extract</CardTitle>
            <CardDescription>Select an image file and extract the text from it.</CardDescription>
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

            <Button onClick={handleExtractText} disabled={!selectedFile || isLoadingOcr} className="w-full">
              {isLoadingOcr ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ScanText className="mr-2 h-4 w-4" />
              )}
              Extract Text
            </Button>
            {error && !isLoadingOcr && ( // Only show general error if not OCR loading error
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
            <CardTitle className="font-headline flex items-center"><Sparkles className="mr-2 h-6 w-6 text-primary" />Edit & Refine Text</CardTitle>
            <CardDescription>View the extracted text below. You can edit it directly or use AI tools to refine it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              placeholder="Extracted text will appear here. You can edit it directly."
              rows={12}
              className="min-h-[250px]"
              disabled={isLoadingAi}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleAiAction("clean")} disabled={isLoadingAi || !editableText.trim()} variant="outline">
                {isLoadingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Clean
              </Button>
              <Button onClick={() => handleAiAction("revise")} disabled={isLoadingAi || !editableText.trim()} variant="outline">
                 {isLoadingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Revise
              </Button>
              <Button onClick={() => handleAiAction("shorten")} disabled={isLoadingAi || !editableText.trim()} variant="outline">
                 {isLoadingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Shorten
              </Button>
            </div>
            {error && isLoadingAi && ( // Only show AI specific error if AI loading error
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>AI Processing Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
