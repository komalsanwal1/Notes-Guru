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
  prompt: `You are an expert note-taker and summarizer. Your goal is to transform the given notes into the desired format, ensuring clarity, accuracy, and appropriate detail.
When using bold text for emphasis, use HTML <strong> tags (e.g., <strong>important</strong>) instead of Markdown (e.g., **important**).

Notes:
{{{notes}}}

Desired Format: {{{format}}}

Instructions for output:
- If the format is "bullet points", generate comprehensive and informative notes. Each bullet point should be well-explained and detailed. Sub-bullets can be used for further detail if it helps clarity and depth. The summary should be a thorough representation of the original notes.
- If the format is "story", create an engaging narrative that accurately captures the key information and concepts from the notes. The story should be detailed enough to be informative while remaining coherent and easy to follow.

Please provide the summary in the requested format.

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

