// src/ai/flows/study-chat.ts
'use server';
/**
 * @fileOverview A study chat AI agent.
 * If notes are provided, it answers questions about them.
 * If no notes are provided, it acts as a general AI study assistant.
 * Maintains conversational context and focuses on study-related topics.
 *
 * - studyChat - A function that handles the study chat process.
 * - StudyChatInput - The input type for the studyChat function.
 * - StudyChatOutput - The return type for the studyChat function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const StudyChatInputSchema = z.object({
  notes: z.string().optional().describe('The notes to study. The AI will prioritize this information if relevant. If not provided, AI acts as a general study assistant.'),
  question: z.string().describe('The question to ask.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().describe('The previous conversation history (user questions and AI answers).')
});
export type StudyChatInput = z.infer<typeof StudyChatInputSchema>;

const StudyChatOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, based on notes (if provided and relevant) or general knowledge. All bold text in the answer MUST use HTML <strong> tags, not Markdown.'),
});
export type StudyChatOutput = z.infer<typeof StudyChatOutputSchema>;

export async function studyChat(input: StudyChatInput): Promise<StudyChatOutput> {
  return studyChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studyChatPrompt',
  input: {schema: StudyChatInputSchema},
  output: {schema: StudyChatOutputSchema},
  prompt: `You are a dedicated AI Study Assistant for students. Your primary goal is to help with academic questions and learning.
You MUST stick to educational topics. If a question is not related to studying, school subjects, academic concepts, or learning, politely state that you are designed for study-related assistance and cannot answer that type of question.
Maintain a friendly, encouraging, and supportive tone suitable for a student.
When using bold text for emphasis, you MUST use HTML <strong> tags (e.g., <strong>important</strong>). Absolutely DO NOT use Markdown (e.g., **important** or __important__).

{{#if notes}}
You have been provided with specific notes. Prioritize information from these notes if it's relevant to the current user's question.
If the notes do not contain the answer, or only partially cover it, use your general knowledge to provide a comprehensive and precise answer. Do not simply state that the information is not in the notes if you can answer it from general knowledge.

Notes:
{{{notes}}}
{{else}}
You are operating in general knowledge mode. Use your comprehensive knowledge base to answer study-related questions.
{{/if}}

{{#if formattedChatHistory}}
<strong>Conversation History (for context):</strong>
{{{formattedChatHistory}}}
---
{{/if}}

Current Question:
{{{question}}}

Please provide a clear, accurate, and helpful answer to the student's question. Ensure all bold text uses <strong> tags.`,
});

const studyChatFlow = ai.defineFlow(
  {
    name: 'studyChatFlow',
    inputSchema: StudyChatInputSchema,
    outputSchema: StudyChatOutputSchema,
  },
  async (input: StudyChatInput) => {
    const formattedHistory = input.chatHistory
      ?.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
      .join('\n');

    const promptInput = {
      ...input,
      formattedChatHistory: formattedHistory,
    };
    const {output} = await prompt(promptInput);
    return output!;
  }
);
