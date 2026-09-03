import { Target, Eye, Check, Cpu, Languages, TrendingUp, ShieldCheck, Brain, Network, Sparkles, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const techCards = [
  { icon: Cpu, title: 'Machine Learning', desc: 'Adaptive learning algorithms' },
  { icon: Languages, title: 'Natural Language Processing', desc: 'Intelligent content generation' },
  { icon: TrendingUp, title: 'Predictive Analytics', desc: 'Competency forecasting' },
  { icon: ShieldCheck, title: 'Secure Infrastructure', desc: 'Government-grade security' },
];

const platformCapabilities = [
  { icon: Brain, title: 'AI-Powered Assessment', desc: 'Advanced algorithms analyze your skills, identify gaps, and create personalized learning paths tailored to your professional needs.' },
  { icon: Network, title: 'National Training Integration', desc: 'Seamless connectivity with national learning platforms ensures access to certified courses and recognized credentials.' },
  { icon: Sparkles, title: 'Smart Quiz Generation', desc: 'Upload your study materials and watch as AI generates relevant quizzes and MCQs to reinforce your learning automatically.' },
  { icon: MessageSquare, title: '24/7 AI Assistant', desc: 'Get instant answers to your questions, course recommendations, and learning support anytime, anywhere.' },
];

const impactStats = [
  { value: '5,000+', label: 'Active Learners' },
  { value: '200+', label: 'Courses Available' },
  { value: '3,500+', label: 'Certificates Issued' },
  { value: '95%', label: 'Completion Rate' },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-4 text-3xl font-bold sm:text-5xl">About Saamrthya AI</h1>
          <p className="text-lg text-blue-100 sm:text-xl">
            Transforming India's Official Statistical System through AI-powered capacity building
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <Target className="mx-auto mb-4 h-12 w-12 text-blue-600" />
              <h2 className="mb-3 text-2xl font-bold text-gray-900">Our Mission</h2>
              <p className="leading-relaxed text-gray-600">
                To empower statistical professionals across India with cutting-edge AI-driven learning
                solutions that identify competency gaps and provide personalized training pathways for
                enhanced statistical capacity building.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <Eye className="mx-auto mb-4 h-12 w-12 text-blue-600" />
              <h2 className="mb-3 text-2xl font-bold text-gray-900">Our Vision</h2>
              <p className="leading-relaxed text-gray-600">
                To become the premier AI-enabled learning ecosystem for India's Official Statistical
                System, fostering excellence in data-driven decision making and statistical literacy
                nationwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Revolutionizing Statistical Education</h2>
              <p className="mb-6 leading-relaxed text-gray-600">
                Saamrthya AI represents a quantum leap in capacity building for India's
                Official Statistical System. Leveraging advanced artificial intelligence and seamless
                integration with the national training ecosystem, we provide:
              </p>
              <ul className="space-y-3">
                {[
                  'AI-powered competency gap analysis',
                  'Personalized learning recommendations',
                  'Auto-generated quizzes and MCQs from study materials',
                  'Integration with national training frameworks',
                  'Real-time progress tracking and analytics',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <Cpu className="h-32 w-32 text-blue-600 opacity-80" />
            </div>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex justify-center lg:order-2">
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-blue-100">
                <span className="text-5xl font-bold text-blue-600">5000+</span>
              </div>
            </div>
            <div className="lg:order-1">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Who We Serve</h2>
              <ul className="space-y-3">
                {[
                  'Statistical officers and analysts',
                  'Census operations personnel',
                  'Survey methodologists',
                  'Data scientists in government',
                  'Planning and economics professionals',
                  "All members of India's Official Statistical System",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Platform Capabilities</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {platformCapabilities.map((cap) => (
              <div key={cap.title} className="rounded-2xl bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <cap.icon className="mx-auto mb-4 h-10 w-10 text-blue-600" />
                <h3 className="mb-2 text-lg font-bold text-gray-900">{cap.title}</h3>
                <p className="text-sm text-gray-600">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-blue-600 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold">Our Impact</h2>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {impactStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="mb-1 text-4xl font-bold lg:text-5xl">{stat.value}</p>
                <p className="text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Powered by Advanced Technology</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {techCards.map((tech) => (
              <div key={tech.title} className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <tech.icon className="mx-auto mb-3 h-10 w-10 text-blue-600" />
                <h4 className="mb-1 font-bold text-gray-900">{tech.title}</h4>
                <p className="text-sm text-gray-600">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-4 text-3xl font-bold">Ready to Transform Your Skills?</h2>
          <p className="mb-8 text-lg text-blue-100">Join thousands of statistical professionals advancing their careers</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="rounded-xl bg-white px-8 py-3.5 font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5">
              Get Started Today
            </Link>
            <Link to="/contact" className="rounded-xl border-2 border-white/30 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
