'use client';

import Layout from '@/components/Layout';
import MetaTags from '@/components/MetaTags';
import Breadcrumb, { pageBreadcrumbs } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted');
  };

  return (
    <>
      <MetaTags
        title="Contact DocFlowEngine - Get Support & Send Feedback | PDF to Word Converter"
        description="Contact DocFlowEngine for support, feedback, or questions about our PDF to Word converter. We're here to help with any document conversion needs."
        keywords="contact DocFlowEngine, PDF converter support, document conversion help, customer service, feedback"
        ogType="website"
      />
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Breadcrumb items={pageBreadcrumbs.contact} className="mb-8" />
          <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Contact Us</CardTitle>
            <CardDescription>
              Have questions, feedback, or need support? We&apos;d love to hear from you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your message..." rows={5} />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
          </div>
        </div>
      </Layout>
    </>
  );
} 