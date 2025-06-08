
import HeroSection from '@/components/features/hero-section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Brain, ScanText, MessageSquare, UploadCloud, Cpu, FileText, Clock, Lightbulb, TrendingUp, Settings2, Star, Mail, Github, Linkedin, Twitter } from 'lucide-react';

const features = [
  {
    title: "Process & Study Text",
    description: "Simplify complex text, generate concise summaries, or get detailed notes. Refine with AI chat and ask follow-up questions using broader AI knowledge.",
    href: "/process-study",
    icon: <Brain className="w-8 h-8 text-primary" />
  },
  {
    title: "OCR & Advanced Note Generation",
    description: "Extract text from handwritten notes, then let AI generate detailed study material for you.",
    href: "/ocr",
    icon: <ScanText className="w-8 h-8 text-primary" /> 
  },
  {
    title: "General Study Chat",
    description: "Chat with an AI study assistant about any academic topic. Get help with your homework, understand concepts, and prepare for exams.",
    href: "/study-chat",
    icon: <MessageSquare className="w-8 h-8 text-primary" />
  }
];

const howItWorksSteps = [
  {
    title: "Upload or Input",
    description: "Easily upload images of handwritten notes for OCR, or paste typed text directly into our processor.",
    icon: <UploadCloud className="w-10 h-10 text-primary mb-4" />,
  },
  {
    title: "AI-Powered Processing",
    description: "Our intelligent algorithms extract, simplify, summarize, or generate Q&A based on your chosen mode.",
    icon: <Cpu className="w-10 h-10 text-primary mb-4" />,
  },
  {
    title: "Study, Refine & Download",
    description: "Review your enhanced notes, refine them with AI chat, and download PDFs for offline study.",
    icon: <FileText className="w-10 h-10 text-primary mb-4" />,
  }
];

const benefits = [
  {
    title: "Save Precious Time",
    description: "Condense hours of note-taking and revision into minutes of focused, AI-enhanced study material.",
    icon: <Clock className="w-8 h-8 text-accent-foreground" />
  },
  {
    title: "Deepen Understanding",
    description: "Grasp complex topics effortlessly with AI-powered explanations, simplifications, and summaries.",
    icon: <Lightbulb className="w-8 h-8 text-accent-foreground" />
  },
  {
    title: "Boost Your Grades",
    description: "Better notes lead to better understanding, which translates to improved academic performance.",
    icon: <TrendingUp className="w-8 h-8 text-accent-foreground" />
  },
  {
    title: "Versatile Study Tools",
    description: "From OCR for handwritten notes to advanced text processing, get everything you need in one platform.",
    icon: <Settings2 className="w-8 h-8 text-accent-foreground" />
  }
];

const testimonials = [
  {
    quote: "NoteGuru has revolutionized how I study. The OCR is a lifesaver for my messy handwriting, and the AI summaries are spot on!",
    name: "Alex P.",
    role: "University Student"
  },
  {
    quote: "I used to spend hours deciphering my notes. Now, with NoteGuru, I get clear, detailed study guides in minutes. My grades have actually improved!",
    name: "Sarah K.",
    role: "High School Senior"
  },
  {
    quote: "The AI chat feature is incredible for clarifying doubts. It's like having a personal tutor available 24/7.",
    name: "Mike B.",
    role: "Lifelong Learner"
  }
];

const contactMethods = [
  {
    name: "Email",
    icon: <Mail className="w-6 h-6 text-primary" />,
    value: "contact@noteguru.com",
    href: "mailto:contact@noteguru.com"
  },
  {
    name: "Twitter",
    icon: <Twitter className="w-6 h-6 text-primary" />,
    value: "@NoteGuruApp",
    href: "#" // Replace with actual Twitter link
  },
  {
    name: "LinkedIn",
    icon: <Linkedin className="w-6 h-6 text-primary" />,
    value: "NoteGuru",
    href: "#" // Replace with actual LinkedIn link
  },
  {
    name: "GitHub",
    icon: <Github className="w-6 h-6 text-primary" />,
    value: "NoteGuruOrg",
    href: "#" // Replace with actual GitHub link
  }
];

export default function HomePage() {
  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      <HeroSection />

      {/* Features Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold font-headline text-center mb-4">Your All-In-One AI Study Partner</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            NoteGuru offers a suite of powerful tools designed to help you learn smarter, not harder. Explore what you can achieve:
          </p>
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="items-center text-center">
                  {feature.icon}
                  <CardTitle className="font-headline text-2xl mt-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col text-center">
                  <CardDescription className="mb-6">{feature.description}</CardDescription>
                  <Button asChild variant="outline" className="mt-auto w-full sm:w-auto">
                    <Link href={feature.href}>
                      Try {feature.title.split(' ')[0]}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold font-headline text-center mb-4">Get Started in 3 Simple Steps</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Transforming your notes into powerful study assets is quick and easy with NoteGuru.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => (
              <Card key={step.title} className="text-center shadow-lg">
                <CardHeader>
                  <div className="flex justify-center mb-2">
                    {step.icon}
                  </div>
                  <CardTitle className="font-headline text-xl">{index + 1}. {step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why NoteGuru? / Benefits Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex justify-center">
            <div className="w-full lg:w-2/3 text-center lg:text-left">
              <h2 className="text-3xl font-bold font-headline mb-6 text-center">Unlock Your Full Study Potential</h2>
              <p className="text-lg text-muted-foreground mb-8 text-center">
                NoteGuru isn't just another note-taking app. It's a comprehensive AI-powered learning assistant designed to help you excel academically and beyond.
              </p>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex items-center gap-4">
                    <div className="flex-shrink-0 bg-primary text-primary-foreground p-3 rounded-full">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold font-headline mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold font-headline text-center mb-12">Loved by Students Like You</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                <CardContent className="pt-6">
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="italic mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm opacity-80">{testimonial.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold font-headline text-center mb-4">Get in Touch</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Have questions, feedback, or just want to say hello? Reach out to us through any of these channels.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method) => (
              <a 
                key={method.name} 
                href={method.href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group"
              >
                <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                  <CardHeader className="items-center">
                    {method.icon}
                    <CardTitle className="font-headline text-xl mt-2 group-hover:text-primary transition-colors">
                      {method.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground break-all">{method.value}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 text-center">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">Ready to Elevate Your Studies?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Stop struggling with disorganized notes and information overload. Start learning smarter, faster, and more effectively with NoteGuru today!
          </p>
          <Button asChild size="lg" className="font-semibold text-lg px-8 py-6">
            <Link href="/process-study">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
