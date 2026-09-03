import { useState, type FormEvent } from 'react';
import { MapPin, Mail, Phone, Clock, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const subjects = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'course', label: 'Course Related' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Other' },
];

const faqs = [
  { q: 'How do I enroll in a course?', a: 'Simply create an account, browse our course catalog, and click "Enroll Now" on your desired course. The AI will also recommend courses based on your profile.' },
  { q: 'Is the platform free to use?', a: 'Yes, the Saamrthya AI platform is provided free of charge to all members of India\'s Official Statistical System.' },
  { q: 'How does the AI assessment work?', a: 'Our AI analyzes your profile, course completions, and quiz performances to identify competency gaps and recommend personalized learning paths.' },
  { q: 'Can I download course certificates?', a: 'Yes, upon successful completion of a course, you can download your certificate from your profile page.' },
];

export default function Contact() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', department: '', subject: '', message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.from('contact_messages').insert({
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone || null,
      department: form.department || null,
      subject: form.subject,
      message: form.message,
    });

    if (error) {
      setError('Failed to send message. Please try again.');
    } else {
      setSuccess(true);
      setForm({ firstName: '', lastName: '', email: '', phone: '', department: '', subject: '', message: '' });
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-4 text-3xl font-bold sm:text-5xl">Get in Touch</h1>
          <p className="text-lg text-blue-100">We're here to help you with your learning journey</p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            {/* Form */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Send Us a Message</h2>

              {success && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" /> Thank you for contacting us! We will get back to you soon.
                </div>
              )}
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="First Name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} required />
                  <Input label="Last Name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} required />
                </div>
                <Input label="Email Address" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                <Input label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91 98765 43210" />
                <Input label="Department/Organization" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Subject</label>
                  <select
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-lg border-2 border-gray-200 py-2.5 px-4 outline-none transition focus:border-blue-600"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Message</label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us how we can help you..."
                    className="w-full rounded-lg border-2 border-gray-200 py-2.5 px-4 outline-none transition focus:border-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Contact Information</h2>
                <InfoCard icon={MapPin} title="Address" lines={['Ministry of Statistics and Programme Implementation', 'Sardar Patel Bhawan, Sansad Marg', 'New Delhi - 110001, India']} />
                <InfoCard icon={Mail} title="Email" lines={['info@saamrthya.ai', 'support@saamrthya.ai']} />
                <InfoCard icon={Phone} title="Phone" lines={['General: +91 11 1234 5678', 'Support: +91 11 8765 4321']} />
                <InfoCard icon={Clock} title="Working Hours" lines={['Mon - Fri: 9:00 AM - 6:00 PM', 'Saturday: 9:00 AM - 1:00 PM', 'Sunday: Closed']} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl bg-white p-6 shadow-sm">
                <h4 className="mb-2 font-bold text-gray-900">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border-2 border-gray-200 py-2.5 px-4 outline-none transition focus:border-blue-600"
      />
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  lines,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  lines: string[];
}) {
  return (
    <div className="mb-4 flex gap-3 rounded-xl bg-gray-50 p-4">
      <Icon className="h-8 w-8 flex-shrink-0 text-blue-600" />
      <div>
        <h4 className="mb-1 font-semibold text-gray-900">{title}</h4>
        {lines.map((line) => (
          <p key={line} className="text-sm leading-relaxed text-gray-600">{line}</p>
        ))}
      </div>
    </div>
  );
}
