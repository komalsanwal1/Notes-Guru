
"use client";

import PageContainer from '@/components/shared/page-container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail, Twitter, Linkedin, Github } from 'lucide-react';
import Link from 'next/link';

const contactMethods = [
  {
    name: "Email",
    icon: <Mail className="w-8 h-8 text-primary" />,
    value: "contact@noteguru.com",
    href: "mailto:contact@noteguru.com"
  },
  {
    name: "Twitter",
    icon: <Twitter className="w-8 h-8 text-primary" />,
    value: "@NoteGuruApp",
    href: "#" // Replace with actual Twitter link
  },
  {
    name: "LinkedIn",
    icon: <Linkedin className="w-8 h-8 text-primary" />,
    value: "NoteGuru",
    href: "#" // Replace with actual LinkedIn link
  },
  {
    name: "GitHub",
    icon: <Github className="w-8 h-8 text-primary" />,
    value: "NoteGuruOrg",
    href: "#" // Replace with actual GitHub link
  }
];

export default function ContactPage() {
  return (
    <PageContainer
      title="Get in Touch"
      description="Have questions, feedback, or just want to say hello? Reach out to us through any of these channels."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
        {contactMethods.map((method) => (
          <a
            key={method.name}
            href={method.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
              <CardHeader className="items-center">
                {method.icon}
                <CardTitle className="font-headline text-xl mt-4 group-hover:text-primary transition-colors">
                  {method.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center justify-center">
                <p className="text-muted-foreground break-all">{method.value}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </PageContainer>
  );
}
