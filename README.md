
# NoteGuru - AI-Powered Study Assistant

**Simplify, summarize, understand, and chat with your notes using the power of AI. NoteGuru is designed to transform your study and note-taking experience, making learning smarter and more efficient.**



## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Project Structure Highlights](#project-structure-highlights)
- [AI Features with Genkit](#ai-features-with-genkit)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

NoteGuru is a Next.js web application built to help students and learners manage and understand their study materials more effectively. It leverages Generative AI (via Genkit) to offer powerful text processing capabilities, including OCR for handwritten notes, text simplification, summarization, Q&A generation, and an interactive study chat assistant.

The application is designed with a clean, modern, and responsive user interface using ShadCN UI components and Tailwind CSS.

## Key Features

-   **📝 Process & Study Text:**
    -   Simplify complex text into easy-to-understand language.
    -   Summarize lengthy notes into concise bullet points or story format.
    -   Generate Question & Answer pairs from your study material.
    -   Refine AI-generated content through an interactive chat interface.
    -   Engage in a study chat about the processed text, with AI leveraging general knowledge for broader context.
    -   Download processed notes as PDF.
-   **📷 OCR & Advanced Note Generation:**
    -   Upload images of handwritten notes.
    -   Extract text accurately using AI-powered Optical Character Recognition (OCR).
    -   Edit the extracted text.
    -   Generate detailed, AI-enhanced study notes from the extracted text.
    -   Download generated advanced notes as PDF.
-   **💬 General Study Chat:**
    -   Interact with an AI study assistant for any academic topic.
    -   Get help with homework, understand complex concepts, and prepare for exams.
    -   Maintains conversational context.
-   **🎨 Modern & Responsive UI:**
    -   Built with ShadCN UI and Tailwind CSS for a polished user experience.
    -   Dark/Light mode theme toggle.
-   **📄 Dedicated Contact Page:**
    -   Clear ways to get in touch or find support.

## Technology Stack

-   **Frontend:**
    -   Next.js (App Router)
    -   React
    -   TypeScript
-   **UI Components & Styling:**
    -   ShadCN UI
    -   Tailwind CSS
    -   Lucide React (Icons)
-   **Generative AI:**
    -   Genkit (with Google AI/Gemini models)
-   **Development Tools:**
    -   ESLint, Prettier (via Next.js defaults)
    -   Firebase Studio (Development Environment)
-   **Deployment:**
    -   Firebase App Hosting (configured via `apphosting.yaml`)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   Node.js (v18 or later recommended)
-   npm or yarn

### Installation

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <your-repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root of your project by copying `.env`:
    ```bash
    cp .env .env.local
    ```
    You will need to add your Google AI API key to this file for Genkit to function:
    ```
    GOOGLE_API_KEY=your_google_ai_api_key_here
    ```
    Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Available Scripts

In the project directory, you can run the following scripts:

-   `npm run dev`
    Runs the Next.js app in development mode with Turbopack. Open [http://localhost:9002](http://localhost:9002) to view it in the browser.
    The Genkit flows will be available via the Next.js server.

-   `npm run genkit:dev`
    Starts the Genkit development server locally (useful for testing flows independently, though in this setup, flows are primarily accessed via the Next.js app).
    Flows can be inspected at `http://localhost:4000` (or the port Genkit starts on).

-   `npm run genkit:watch`
    Starts the Genkit development server with file watching.

-   `npm run build`
    Builds the application for production to the `.next` folder.

-   `npm run start`
    Starts a Next.js production server.

-   `npm run lint`
    Runs ESLint to identify and fix problems in your code.

-   `npm run typecheck`
    Runs the TypeScript compiler to check for type errors.

## Project Structure Highlights

```
.
├── public/                 # Static assets
├── src/
│   ├── ai/                 # Genkit AI flows and configuration
│   │   ├── flows/          # Specific AI flow implementations
│   │   │   ├── extract-text-from-image.ts
│   │   │   ├── process-text-flow.ts
│   │   │   └── study-chat.ts
│   │   ├── dev.ts          # Genkit development server entry point
│   │   └── genkit.ts       # Genkit global AI instance configuration
│   ├── app/                # Next.js App Router: pages, layouts, components
│   │   ├── (page-routes)/
│   │   │   └── page.tsx    # Page components
│   │   ├── globals.css     # Global styles and ShadCN theme variables
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Shared React components
│   │   ├── features/       # Feature-specific components (e.g., HeroSection)
│   │   ├── layout/         # Layout components (Header, Footer, ThemeProvider)
│   │   ├── shared/         # General reusable components (Logo, PageContainer, ChatInterface)
│   │   └── ui/             # ShadCN UI components (Button, Card, etc.)
│   ├── hooks/              # Custom React hooks (e.g., useToast, useMobile)
│   └── lib/                # Utility functions and constants
│       ├── constants.ts
│       └── utils.ts
├── .env                    # Environment variable template
├── .gitignore              # Files and folders ignored by Git
├── apphosting.yaml         # Firebase App Hosting configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## AI Features with Genkit

This application utilizes Genkit to power its AI functionalities. Key flows include:

-   **`extract-text-from-image.ts`**: Handles OCR. Takes an image data URI and returns extracted text.
-   **`process-text-flow.ts`**: A versatile flow for simplifying, summarizing, or generating Q&A from input text. It supports different output formats (bullet points, story) and allows for iterative refinement based on user feedback. It also generates a heading for the processed content.
-   **`study-chat.ts`**: Powers the interactive study chat. It can answer questions based on provided notes or use its general knowledge. It maintains conversation history for context.

These flows are typically invoked from the frontend components in `src/app/`. The global Genkit AI instance is configured in `src/ai/genkit.ts` using the Google AI plugin.

## Deployment

This project is configured for deployment on Firebase App Hosting. The `apphosting.yaml` file contains the basic configuration. Firebase App Hosting will typically build and deploy the Next.js application based on this file and `package.json`.

## Contributing

Contributions are welcome! If you have suggestions for improvements or find any issues, please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License - see the `LICENSE` file for details (if one is added).

---

Happy Studying with NoteGuru!
