import { Link } from 'react-router-dom';
import {
  Brain,
  Bot,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Award,
  TrendingUp,
  Sparkles,
  LayoutDashboard,
  FileQuestion,
} from 'lucide-react';

const features = [
  { icon: TrendingUp, title: 'Competency Gap Analysis', desc: 'AI-powered assessment to identify your skill gaps and learning needs' },
  { icon: Bot, title: 'Personalized Recommendations', desc: 'Get course suggestions tailored to your learning profile and goals' },
  { icon: BookOpen, title: 'National Training Integration', desc: 'Seamless access to government training resources and certifications' },
  { icon: FileQuestion, title: 'AI-Generated Quizzes', desc: 'Auto-generated MCQs from your learning materials for better retention' },
  { icon: MessageSquare, title: 'AI Chatbot Assistant', desc: '24/7 support for your learning queries and guidance' },
  { icon: LayoutDashboard, title: 'Analytics Dashboard', desc: 'Track progress, quiz scores, and competency growth in real-time' },
];

const stats = [
  { value: '5,000+', label: 'Active Learners' },
  { value: '200+', label: 'Courses Available' },
  { value: '95%', label: 'Success Rate' },
  { value: '24/7', label: 'AI Support' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute right-10 bottom-10 h-96 w-96 rounded-full bg-cyan-400 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                <span>AI-Powered Learning Platform</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                AI-Powered Learning for India's Official Statistical System
              </h1>
              <p className="mb-8 text-lg text-blue-100 lg:text-xl">
                Identify competency gaps, receive personalized training recommendations, and
                strengthen your skills with AI-generated assessments.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="rounded-xl bg-white px-8 py-3.5 font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Get Started
                </Link>
                <Link
                  to="/about"
                  className="rounded-xl border-2 border-white/30 px-8 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-400/20 blur-3xl" />
                <Brain className="relative h-48 w-48 lg:h-64 lg:w-64 text-cyan-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Platform Features
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 transition group-hover:bg-blue-100">
                  <feature.icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="mb-1 text-4xl font-bold lg:text-5xl">{stat.value}</p>
                <p className="text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Transform Your Skills?</h2>
          <p className="mb-8 text-lg text-blue-100">
            Join thousands of statistical professionals advancing their careers
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/signup"
              className="rounded-xl bg-white px-8 py-3.5 font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5"
            >
              Get Started Today
            </Link>
            <Link
              to="/contact"
              className="rounded-xl border-2 border-white/30 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
