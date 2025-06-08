// src/ai/flows/study-chat.ts
'use server';
/**
 * @fileOverview A study chat AI agent that answers questions about provided notes.
 *
 * - studyChat - A function that handles the study chat process.
 * - StudyChatInput - The input type for the studyChat function.
 * - StudyChatOutput - The return type for the studyChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudyChatInputSchema = z.object({
  notes: z.string().describe('The notes to study.'),
  question: z.string().describe('The question to ask about the notes.'),
});
export type StudyChatInput = z.infer<typeof StudyChatInputSchema>;

const StudyChatOutputSchema = z.object({
  answer: z.string().describe('The answer to the question based on the notes.'),
});
export type StudyChatOutput = z.infer<typeof StudyChatOutputSchema>;

export async function studyChat(input: StudyChatInput): Promise<StudyChatOutput> {
  return studyChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studyChatPrompt',
  input: {schema: StudyChatInputSchema},
  output: {schema: StudyChatOutputSchema},
  prompt: `You are a study assistant. Answer the question based on the notes provided. Be concise and helpful.\n\nNotes: {{{notes}}}\n\nQuestion: {{{question}}}`,
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
