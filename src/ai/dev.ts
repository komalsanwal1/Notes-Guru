
import { config } from 'dotenv';
config();

import '@/ai/flows/extract-text-from-image.ts';
import '@/ai/flows/process-text-flow.ts'; // Updated
import '@/ai/flows/study-chat.ts';

// The following flows are now effectively replaced by process-text-flow.ts
// and their files will be emptied.
// import '@/ai/flows/simplify-with-ai.ts';
// import '@/ai/flows/summarize-notes.ts';
