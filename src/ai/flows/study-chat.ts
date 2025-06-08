// src/ai/flows/study-chat.ts
'use server';
/**
 * @fileOverview A study chat AI agent that answers questions about provided notes or from general knowledge.
 *
 * - studyChat - A function that handles the study chat process.
 * - StudyChatInput - The input type for the studyChat function.
 * - StudyChatOutput - The return type for the studyChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudyChatInputSchema = z.object({
  notes: z.string().describe('The notes to study. The AI will prioritize this information if relevant.'),
  question: z.string().describe('The question to ask about the notes or for general knowledge.'),
});
export type StudyChatInput = z.infer<typeof StudyChatInputSchema>;

const StudyChatOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, based on the notes if relevant, or general knowledge.'),
});
export type StudyChatOutput = z.infer<typeof StudyChatOutputSchema>;

export async function studyChat(input: StudyChatInput): Promise<StudyChatOutput> {
  return studyChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studyChatPrompt',
  input: {schema: StudyChatInputSchema},
  output: {schema: StudyChatOutputSchema},
  prompt: `You are a helpful study assistant. Your goal is to answer the user's question accurately and concisely.
First, check if the provided 'Notes' section contains information relevant to the 'Question'. If it does, prioritize using that information in your answer.
If the 'Notes' do not contain the answer, or only partially cover it, use your general knowledge to provide a comprehensive and precise answer.
When using bold text for emphasis, use HTML <strong> tags (e.g., <strong>important</strong>) instead of Markdown (e.g., **important**).

Notes:
{{{notes}}}

Question:
{{{question}}}`,
});

const studyChatFlow = ai.defineFlow(
  {
    name: 'studyChatFlow',
    inputSchema: StudyChatInputSchema,
    outputSchema: StudyChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
