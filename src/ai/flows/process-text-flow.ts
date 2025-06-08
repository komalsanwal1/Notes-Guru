
'use server';
/**
 * @fileOverview Processes text by simplifying or summarizing it, with options for different formats
 * and iterative refinement. Uses HTML <strong> tags for bolding.
 *
 * - processText - A function that handles the text processing and refinement.
 * - ProcessTextInput - The input type for the processText function.
 * - ProcessTextOutput - The return type for the processText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessTextInputSchema = z.object({
  text: z.string().describe('The text to be processed.'),
  mode: z.enum(['simplify', 'summarize']).describe('The processing mode: simplify or summarize.'),
  format: z.enum(['bullet_points', 'story_format']).describe('The desired output format (bullet_points or story_format).'),
  previousProcessedText: z.string().optional().describe('The previously processed text, if this is a refinement step.'),
  refinementInstruction: z.string().optional().describe('The user instruction for refining the text (e.g., "make it shorter", "explain the first point").')
});
export type ProcessTextInput = z.infer<typeof ProcessTextInputSchema>;

const ProcessTextOutputSchema = z.object({
  processedText: z.string().describe('The processed (simplified or summarized) or refined text in the specified format.'),
});
export type ProcessTextOutput = z.infer<typeof ProcessTextOutputSchema>;

export async function processText(input: ProcessTextInput): Promise<ProcessTextOutput> {
  return processTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processTextPrompt',
  input: {schema: ProcessTextInputSchema},
  output: {schema: ProcessTextOutputSchema},
  prompt: `You are an AI expert in text processing.
When you generate text that requires emphasis or bolding, you MUST use HTML <strong> tags (e.g., <strong>This is important</strong>). Do NOT use Markdown like **important**.

{{#if refinementInstruction}}
You are refining a previously processed text.
The original text (for context, if needed) was:
{{{text}}}

The previous processed text (which was {{mode}}d into {{format_description}}) was:
{{{previousProcessedText}}}

The user's refinement instruction is:
{{{refinementInstruction}}}

Please provide the new, refined text, keeping the same format ({{format_description}}).
{{{commonInstructions}}}
{{else}}
Please process the following text based on the user's request.
Text: {{{text}}}

The user wants to <strong>{{mode}}</strong> this text into <strong>{{{format_description}}}</strong>.

{{#if is_simplify_bullet_points}}
  Instructions: Generate comprehensive and informative bullet points. Each bullet point should be well-explained and detailed. Sub-bullets can be used for further detail. Ensure the notes are comprehensive and informative.
{{/if}}
{{#if is_simplify_story_format}}
  Instructions: Create an engaging narrative that explains the core concepts from the text clearly and thoroughly. Ensure the story is engaging and explains the core concepts clearly.
{{/if}}
{{#if is_summarize_bullet_points}}
  Instructions: Generate comprehensive and informative bullet points. Each bullet point should be well-explained and detailed. Sub-bullets can be used for further detail if it helps clarity and depth. The summary should be a thorough representation of the original notes.
{{/if}}
{{#if is_summarize_story_format}}
  Instructions: Create an engaging narrative that accurately captures the key information and concepts from the notes. The story should be detailed enough to be informative while remaining coherent and easy to follow.
{{/if}}

{{{commonInstructions}}}
Output the processed text.
{{/if}}`,
});

const processTextFlow = ai.defineFlow(
  {
    name: 'processTextFlow',
    inputSchema: ProcessTextInputSchema,
    outputSchema: ProcessTextOutputSchema,
  },
  async (input: ProcessTextInput) => {
    const promptInput = {
      ...input,
      format_description: input.format === 'bullet_points' ? 'bullet points' : 'a story format',
      is_simplify_bullet_points: input.mode === 'simplify' && input.format === 'bullet_points',
      is_simplify_story_format: input.mode === 'simplify' && input.format === 'story_format',
      is_summarize_bullet_points: input.mode === 'summarize' && input.format === 'bullet_points',
      is_summarize_story_format: input.mode === 'summarize' && input.format === 'story_format',
      commonInstructions: "Ensure clarity, accuracy, and appropriate detail. Remember to use <strong> tags for any bold text.",
    };
    const {output} = await prompt(promptInput);
    return output!;
  }
);
