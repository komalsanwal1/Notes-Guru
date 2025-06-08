'use server';

/**
 * @fileOverview Simplifies complex text using AI into bullet points or a story format.
 *
 * - simplifyText - A function that handles the text simplification process.
 * - SimplifyTextInput - The input type for the simplifyText function.
 * - SimplifyTextOutput - The return type for the simplifyText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimplifyTextInputSchema = z.object({
  text: z.string().describe('The complex text to be simplified.'),
  format: z
    .enum(['bullet points', 'story format'])
    .describe('The desired output format.'),
});
export type SimplifyTextInput = z.infer<typeof SimplifyTextInputSchema>;

const SimplifyTextOutputSchema = z.object({
  simplifiedText: z.string().describe('The simplified text in the specified format.'),
});
export type SimplifyTextOutput = z.infer<typeof SimplifyTextOutputSchema>;

export async function simplifyText(input: SimplifyTextInput): Promise<SimplifyTextOutput> {
  return simplifyTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simplifyTextPrompt',
  input: {schema: SimplifyTextInputSchema},
  output: {schema: SimplifyTextOutputSchema},
  prompt: `You are an AI expert in simplifying complex texts.

  Please simplify the following text into the format requested by the user.
  When using bold text for emphasis, use HTML <strong> tags (e.g., <strong>important</strong>) instead of Markdown (e.g., **important**).

  Text: {{{text}}}

  Format: {{{format}}}

  Output the simplified text.`,
});

const simplifyTextFlow = ai.defineFlow(
  {
    name: 'simplifyTextFlow',
    inputSchema: SimplifyTextInputSchema,
    outputSchema: SimplifyTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
