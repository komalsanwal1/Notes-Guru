"use client";

import { useState } from "react";
import PageContainer from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, FileText, Download, FileType2 } from "lucide-react";
import { summarizeNotes, type SummarizeNotesInput, type SummarizeNotesOutput } from "@/ai/flows/summarize-notes";
import { useToast } from "@/hooks/use-toast";

type SummarizationFormat = "bullet points" | "story";

export default function SummarizePage() {
  const [notesToSummarize, setNotesToSummarize] = useState("");
  const [format, setFormat] = useState<SummarizationFormat>("bullet points");
  const [summarizedNotes, setSummarizedNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!notesToSummarize.trim()) {
      setError("Please enter some notes to summarize.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummarizedNotes("");

    try {
      const input: SummarizeNotesInput = { notes: notesToSummarize, format };
      const result: SummarizeNotesOutput = await summarizeNotes(input);
      setSummarizedNotes(result.summary);
      toast({ title: "Success", description: result.progress });
    } catch (err) {
      console.error("Summarization error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred during summarization.";
      setError(message);
      toast({ variant: "destructive", title: "Error", description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!summarizedNotes) {
      toast({ variant: "destructive", title: "Error", description: "No summary to download." });
      return;
    }
    const blob = new Blob([summarizedNotes], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summarized_notes.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Summary downloaded as Markdown." });
  };
  
  const handleDownloadPdf = () => {
    toast({ title: "Coming Soon", description: "PDF download functionality is under development." });
  }

  return (
    <PageContainer
      title="AI Note Summarization"
      description="Transform your rough notes into clear summaries or detailed, rectified notes."
    >
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><FileText className="mr-2 h-6 w-6 text-primary" />Summarize Your Notes</CardTitle>
            <CardDescription>Input your notes and select the desired summary format.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="notes-to-summarize" className="font-semibold">Your Notes</Label>
              <Textarea
                id="notes-to-summarize"
                value={notesToSummarize}
                onChange={(e) => setNotesToSummarize(e.target.value)}
                placeholder="Paste your notes here..."
                rows={10}
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Summary Format</Label>
              <RadioGroup
                value={format}
                onValueChange={(value: SummarizationFormat) => setFormat(value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bullet points" id="bullet-points-summary" />
                  <Label htmlFor="bullet-points-summary">Bullet Points</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="story" id="story-summary" />
                  <Label htmlFor="story-summary">Story Format</Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={handleSummarize} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Summarize Notes
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

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Generated Summary</CardTitle>
            <CardDescription>Your summarized notes will appear here. You can download them once generated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summarizedNotes ? (
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap p-4 border rounded-md bg-muted/50 min-h-[200px]">
                {summarizedNotes}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-10">Your summary will appear here.</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button onClick={handleDownloadMarkdown} disabled={!summarizedNotes || isLoading} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Markdown
              </Button>
              <Button onClick={handleDownloadPdf} disabled={!summarizedNotes || isLoading} variant="outline">
                <FileType2 className="mr-2 h-4 w-4" />
                Download PDF (Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
