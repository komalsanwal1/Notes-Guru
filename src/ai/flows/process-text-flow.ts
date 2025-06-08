'use server';
/**
 * @fileOverview Processes text by simplifying, summarizing, or generating Q&A, with options for different formats
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
  mode: z.enum(['simplify', 'summarize', 'generate_qa']).describe('The processing mode: simplify, summarize, or generate Q&A.'),
  format: z.enum(['bullet_points', 'story_format']).describe('The desired output format (bullet_points or story_format).'),
  previousProcessedText: z.string().optional().describe('The previously processed text, if this is a refinement step.'),
  refinementInstruction: z.string().optional().describe('The user instruction for refining the text (e.g., "make it shorter", "explain the first point").')
});
export type ProcessTextInput = z.infer<typeof ProcessTextInputSchema>;

const ProcessTextOutputSchema = z.object({
  processedText: z.string().describe('The processed (simplified, summarized, Q&A) or refined text in the specified format.'),
});
export type ProcessTextOutput = z.infer<typeof ProcessTextOutputSchema>;

export async function processText(input: ProcessTextInput): Promise<ProcessTextOutput> {
  return processTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processTextPrompt',
  input: {schema: ProcessTextInputSchema},
  output: {schema: ProcessTextOutputSchema},
  prompt: `You are an AI expert in text processing and study material generation.
When you generate text that requires emphasis or bolding, you MUST use HTML <strong> tags (e.g., <strong>This is important</strong>). Do NOT use Markdown like **important**.

{{#if refinementInstruction}}
You are refining a previously processed text.
The original text (for context, if needed) was:
{{{text}}}

The previous processed text (which was {{mode_verb}} into {{format_description}}) was:
{{{previousProcessedText}}}

The user's refinement instruction is:
{{{refinementInstruction}}}

Please provide the new, refined text, keeping the same format ({{format_description}}).
{{{commonInstructions}}}
{{else}}
Please process the following text based on the user's request.
Text: {{{text}}}

The user wants to {{mode_prompt_action}} this text into <strong>{{{format_description}}}</strong>.

{{#if is_simplify_bullet_points}}
  Instructions: Generate comprehensive and informative bullet points. Each bullet point should be well-explained and detailed. Sub-bullets can be used for further detail. Ensure the notes are comprehensive and informative.
{{/if}}
{{#if is_simplify_story_format}}
  Instructions: Create an engaging narrative that explains the core concepts from the text clearly and thoroughly. Ensure the story is engaging and explains the core concepts clearly.
{{/if}}
{{#if is_summarize_bullet_points}}
  Instructions: Generate comprehensive and informative summary bullet points. Each bullet point should be well-explained and detailed. Sub-bullets can be used for further detail if it helps clarity and depth. The summary should be a thorough representation of the original notes.
{{/if}}
{{#if is_summarize_story_format}}
  Instructions: Create an engaging narrative that accurately captures the key information and concepts from the notes. The story should be detailed enough to be informative while remaining coherent and easy to follow.
{{/if}}
{{#if is_generate_qa_bullet_points}}
  Instructions: Generate question and answer pairs based on the text. Format each as a bullet point starting with <strong>Question:</strong> followed by the question, and on a new line within the same bullet, <strong>Answer:</strong> followed by the answer. Ensure the questions cover key concepts and the answers are accurate and derived from the text.
{{/if}}
{{#if is_generate_qa_story_format}}
  Instructions: Create an engaging narrative that includes questions about the core concepts from the text and provides their answers within the story. Clearly distinguish questions and answers.
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
    let mode_verb = '';
    let mode_prompt_action = '';
    switch (input.mode) {
      case 'simplify':
        mode_verb = 'simplified';
        mode_prompt_action = '<strong>simplify</strong>';
        break;
      case 'summarize':
        mode_verb = 'summarized';
        mode_prompt_action = '<strong>summarize</strong>';
        break;
      case 'generate_qa':
        mode_verb = 'processed for Q&A';
        mode_prompt_action = '<strong>generate Q&A from</strong>';
        break;
      default:
        mode_verb = 'processed';
        mode_prompt_action = '<strong>process</strong>';
    }

    const promptInput = {
      ...input,
      mode_verb,
      mode_prompt_action,
      format_description: input.format === 'bullet_points' ? 'bullet points' : 'a story format',
      is_simplify_bullet_points: input.mode === 'simplify' && input.format === 'bullet_points',
      is_simplify_story_format: input.mode === 'simplify' && input.format === 'story_format',
      is_summarize_bullet_points: input.mode === 'summarize' && input.format === 'bullet_points',
      is_summarize_story_format: input.mode === 'summarize' && input.format === 'story_format',
      is_generate_qa_bullet_points: input.mode === 'generate_qa' && input.format === 'bullet_points',
      is_generate_qa_story_format: input.mode === 'generate_qa' && input.format === 'story_format',
      commonInstructions: "Ensure clarity, accuracy, and appropriate detail. Remember to use <strong> tags for any bold text.",
    };
    const {output} = await prompt(promptInput);
    return output!;
  }
);

