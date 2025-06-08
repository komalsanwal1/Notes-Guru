
"use client";

import PageContainer from '@/components/shared/page-container';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Building } from 'lucide-react';
import Link from 'next/link';

const socialLinks = [
  { name: "Facebook", href: "#", icon: <Facebook className="w-6 h-6 text-primary group-hover:text-blue-600" /> },
  { name: "Twitter", href: "#", icon: <Twitter className="w-6 h-6 text-primary group-hover:text-sky-500" /> },
  { name: "Instagram", href: "#", icon: <Instagram className="w-6 h-6 text-primary group-hover:text-pink-500" /> },
  { name: "LinkedIn", href: "#", icon: <Linkedin className="w-6 h-6 text-primary group-hover:text-blue-700" /> },
  { name: "YouTube", href: "#", icon: <Youtube className="w-6 h-6 text-primary group-hover:text-red-600" /> },
];

export default function ContactPage() {
  return (
    <PageContainer
      title="We'd Love to Hear From You!"
      description="Reach out through any of the channels below. We aim to respond to emails within 24-48 business hours."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
        {/* General Inquiries Card */}
        <Card className="shadow-lg col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-primary" />
              <CardTitle className="font-headline text-xl">General Inquiries</CardTitle>
            </div>
            <CardDescription className="pt-2">
              For any questions, feedback, or support, please feel free to email us.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="mailto:support@notesguru.com"
              className="text-lg font-medium text-primary hover:underline break-all"
            >
              support@notesguru.com
            </a>
          </CardContent>
        </Card>

        {/* Phone Support Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Phone className="w-8 h-8 text-primary" />
              <CardTitle className="font-headline text-xl">Phone Support</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Available Mon-Fri, 9 AM - 6 PM IST. For urgent matters, you can call our support line.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="tel:+911234567890"
              className="text-lg font-medium text-primary hover:underline"
            >
              +91-123-456-7890
            </a>
          </CardContent>
        </Card>

        {/* Office Address Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8 text-primary" />
              <CardTitle className="font-headline text-xl">Our Office</CardTitle>
            </div>
             <CardDescription className="pt-2">
              NotesGuru Headquarters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <address className="not-italic text-muted-foreground space-y-1">
              <p>123 Study Street, Knowledge Park</p>
              <p>Bengaluru, Karnataka, India - 560001</p>
            </address>
            <Link 
              href="https://maps.google.com/?q=123 Study Street, Knowledge Park, Bengaluru, Karnataka, India - 560001"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary hover:underline mt-3 text-sm"
            >
              <MapPin className="w-4 h-4 mr-1" />
              View on Map
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Social Media Section */}
      <section className="py-12">
        <h2 className="text-2xl font-bold font-headline text-center mb-4">Connect With Us on Social Media</h2>
        <p className="text-muted-foreground text-center mb-8 max-w-xl mx-auto">
          Stay updated and engage with our community on your favorite platforms.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {socialLinks.map((social) => (
            <Link
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-4 rounded-lg hover:bg-accent transition-colors duration-200 w-28 text-center"
              aria-label={`Visit our ${social.name} page`}
            >
              {social.icon}
              <span className="mt-2 text-sm font-medium text-muted-foreground group-hover:text-primary">
                {social.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
