
'use server';

/**
 * @fileOverview Simplifies complex text using AI into bullet points or a story format,
 * and allows for iterative refinement of the simplified text.
 *
 * - simplifyText - A function that handles the text simplification and refinement process.
 * - SimplifyTextInput - The input type for the simplifyText function.
 * - SimplifyTextOutput - The return type for the simplifyText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimplifyTextInputSchema = z.object({
  text: z.string().describe('The complex text to be simplified, or the original complex text if refining.'),
  format: z
    .enum(['bullet points', 'story format'])
    .describe('The desired output format.'),
  previousSimplifiedText: z.string().optional().describe('The previously simplified text, if this is a refinement step.'),
  refinementInstruction: z.string().optional().describe('The user instruction for refining the text (e.g., "make it shorter", "explain the first point").')
});
export type SimplifyTextInput = z.infer<typeof SimplifyTextInputSchema>;

const SimplifyTextOutputSchema = z.object({
  simplifiedText: z.string().describe('The simplified or refined text in the specified format.'),
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
When using bold text for emphasis, use HTML <strong> tags (e.g., <strong>important</strong>) instead of Markdown (e.g., **important**).

{{#if refinementInstruction}}
You are refining a previously simplified text.
The original complex text (for context, if needed) was:
{{{text}}}

The previous simplified text (in {{{format}}} format) was:
{{{previousSimplifiedText}}}

The user's refinement instruction is:
{{{refinementInstruction}}}

Please provide the new, refined simplified text, keeping the {{{format}}} format.
{{else}}
Please simplify the following text into the format requested by the user.
Text: {{{text}}}
Format: {{{format}}}
Output the simplified text.
{{/if}}`,
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
