// Summarizes notes into concise bullet points or a story format.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNotesInputSchema = z.object({
  notes: z.string().describe('The notes to summarize, either handwritten (OCR) or typed.'),
  format: z.enum(['bullet points', 'story']).default('bullet points').describe('The desired output format.'),
});

export type SummarizeNotesInput = z.infer<typeof SummarizeNotesInputSchema>;

const SummarizeNotesOutputSchema = z.object({
  summary: z.string().describe('The summarized notes in the specified format.'),
  progress: z.string().describe('Progress of the summarization task.')
});

export type SummarizeNotesOutput = z.infer<typeof SummarizeNotesOutputSchema>;

export async function summarizeNotes(input: SummarizeNotesInput): Promise<SummarizeNotesOutput> {
  return summarizeNotesFlow(input);
}

const summarizeNotesPrompt = ai.definePrompt({
  name: 'summarizeNotesPrompt',
  input: {
    schema: SummarizeNotesInputSchema,
  },
  output: {
    schema: SummarizeNotesOutputSchema,
  },
  prompt: `You are an expert note-taker and summarizer. Please summarize the following notes into a concise and clear format. 

Notes: {{{notes}}}

Desired Format: {{{format}}}

Summary:`,
});

const summarizeNotesFlow = ai.defineFlow(
  {
    name: 'summarizeNotesFlow',
    inputSchema: SummarizeNotesInputSchema,
    outputSchema: SummarizeNotesOutputSchema,
  },
  async input => {
    const {output} = await summarizeNotesPrompt(input);
    return {
      ...output!,
      progress: 'Notes summarized into the requested format.',
    };
  }
);
