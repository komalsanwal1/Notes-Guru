import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="py-12 md:py-20 lg:py-28 text-center">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Unlock Your Notes with <span className="text-primary">NoteGuru</span>
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            Seamlessly extract, simplify, summarize, and chat with your notes using the power of AI. Transform your study and note-taking experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="font-semibold">
              <Link href="/simplify">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-semibold">
              <Link href="/study-chat">
                Try Study Chat
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
