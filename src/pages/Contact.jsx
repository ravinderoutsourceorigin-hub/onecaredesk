import React, { useState } from 'react';
import { Building, Mail, Phone, MessageSquare, Loader2, AlertCircle, Menu } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import EmailService from '@/components/integrations/EmailService';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [formStatus, setFormStatus] = useState(null);

  const navigation = [
    { name: 'Home', href: 'Home' },
    { name: 'Features', href: 'Features' },
    { name: 'About', href: 'About' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({ type: 'error', message: 'Please fill out all fields.' });
      return;
    }

    setIsSending(true);
    setFormStatus(null);

    const recipients = ['ravinder.gade@gmail.com', 'support@resourcedesk.cm'];
    const subject = `New Contact Form Submission from ${formData.name}`;
    const htmlContent = `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>New Contact Message from OneCareDesk Website</h2>
        <p><strong>From:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
        <hr>
        <h3>Message:</h3>
        <p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
          ${formData.message.replace(/\n/g, '<br>')}
        </p>
      </div>
    `;
    const textContent = `
      New Contact Message from OneCareDesk Website\n
      From: ${formData.name}\n
      Email: ${formData.email}\n
      Message:\n
      ${formData.message}
    `;

    try {
      const emailPromises = recipients.map(recipient => 
        EmailService.send({
          to: recipient,
          subject: subject,
          htmlContent: htmlContent,
          textContent: textContent,
        })
      );
      
      await Promise.all(emailPromises);

      setFormStatus({ type: 'success', message: 'Your message has been sent. We will get back to you shortly.' });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Contact form submission error:", error);
      setFormStatus({ type: 'error', message: 'Sorry, there was an error sending your message. Please try again later.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-200/60 sticky top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
          <div className="flex lg:flex-1">
            <Logo size="small" showSubtitle={false} linkTo="/" />
          </div>
          <div className="flex lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                >
                  <span className="sr-only">Open main menu</span>
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm">
                <div className="flex items-center justify-between">
                  <Logo size="small" showSubtitle={false} linkTo="/" />
                </div>
                <div className="mt-6 flow-root">
                  <div className="-my-6 divide-y divide-gray-500/10">
                    <div className="space-y-2 py-6">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={createPageUrl(item.href)}
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <div className="py-6 space-y-4">
                      <Link
                        to={createPageUrl('Auth')}
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        Log in
                      </Link>
                      <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all">
                        <Link to={createPageUrl('Auth')}>Start Free Trial</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link key={item.name} to={createPageUrl(item.href)} className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-700">
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-x-6">
            <Link
              to={createPageUrl('Auth')}
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-700"
            >
              Log in
            </Link>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all">
              <Link to={createPageUrl('Auth')}>Start Free Trial</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="isolate">
        <div className="relative bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
            <div className="relative px-6 pb-20 pt-24 sm:pt-32 lg:static lg:px-8 lg:py-48">
              <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
                <div className="absolute inset-y-0 left-0 -z-10 w-full overflow-hidden bg-gray-100 ring-1 ring-gray-900/10 lg:w-1/2">
                  <svg
                    className="absolute inset-0 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
                    aria-hidden="true"
                  >
                    <defs>
                      <pattern
                        id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
                        width={200}
                        height={200}
                        x="100%"
                        y={-1}
                        patternUnits="userSpaceOnUse"
                      >
                        <path d="M130 200V.5M.5 .5H200" fill="none" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" strokeWidth={0} fill="white" />
                    <rect width="100%" height="100%" strokeWidth={0} fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Get in touch</h2>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Whether you have a question about features, trials, or anything else, our team is ready to answer all your questions.
                </p>
                <dl className="mt-10 space-y-4 text-base leading-7 text-gray-600">
                  <div className="flex gap-x-4">
                    <dt className="flex-none">
                      <span className="sr-only">Address</span>
                      <Building className="h-7 w-6 text-gray-400" aria-hidden="true" />
                    </dt>
                    <dd>Five Greentree Centre, 525 NJ-73 Suite 104<br />Marlton, NJ 08053</dd>
                  </div>
                  <div className="flex gap-x-4">
                    <dt className="flex-none">
                      <span className="sr-only">Telephone</span>
                      <Phone className="h-7 w-6 text-gray-400" aria-hidden="true" />
                    </dt>
                    <dd>
                      <a className="hover:text-gray-900" href="tel:+1 (856) 555-0101">
                        +1 (856) 555-0101
                      </a>
                    </dd>
                  </div>
                  <div className="flex gap-x-4">
                    <dt className="flex-none">
                      <span className="sr-only">Email</span>
                      <Mail className="h-7 w-6 text-gray-400" aria-hidden="true" />
                    </dt>
                    <dd>
                      <a className="hover:text-gray-900" href="mailto:support@onecaredesk.com">
                        support@onecaredesk.com
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48">
              <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-semibold leading-6 text-gray-900">
                      Name
                    </label>
                    <div className="mt-2.5">
                      <Input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
                      Email
                    </label>
                    <div className="mt-2.5">
                      <Input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">
                      Message
                    </label>
                    <div className="mt-2.5">
                      <Textarea
                        name="message"
                        id="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                {formStatus && (
                  <Alert className={`mt-4 ${formStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}`} variant={formStatus.type === 'error' ? 'destructive' : undefined}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formStatus.message}</AlertDescription>
                  </Alert>
                )}
                <div className="mt-8 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send message'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}