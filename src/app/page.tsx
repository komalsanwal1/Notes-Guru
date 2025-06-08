
import HeroSection from '@/components/features/hero-section';
import PageContainer from '@/components/shared/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Brain } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const features = [
  {
    title: "Process & Study Text",
    description: "Simplify complex text, generate concise summaries, or get detailed notes. Refine with AI chat and ask follow-up questions using broader AI knowledge.",
    href: "/process-study",
    icon: <Brain className="w-6 h-6 text-primary" />
  },
  {
    title: "OCR for Handwritten Notes",
    description: "Convert handwritten notes from images into editable digital text. Clean, revise, and shorten with AI assistance.",
    href: "/ocr",
    icon: <CheckCircle2 className="w-6 h-6 text-primary" />
  },
  {
    title: "General Study Chat",
    description: "Engage in contextual conversations about any study materials you provide. Get answers and insights from our AI study assistant.",
    href: "/study-chat",
    icon: <CheckCircle2 className="w-6 h-6 text-primary" />
  }
];


export default function HomePage() {
  return (
    <div className="space-y-12">
      <HeroSection />
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold font-headline text-center mb-12">Discover NoteGuru's Features</h2>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    {feature.icon}
                    <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-end">
                  <Button asChild variant="outline" className="mt-auto w-full sm:w-auto">
                    <Link href={feature.href}>
                      Try {feature.title}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
