import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, IdCard, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { departments } from '@/data/courses';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (!agree) {
      setError('Please agree to the Terms & Conditions');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const deptLabel = departments.find((d) => d.value === department)?.label ?? department;
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        department: deptLabel,
        designation,
      });
    }

    setLoading(false);
    navigate('/login');
  };

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
        <div className="order-2 flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 p-10 text-white md:order-1">
          <BarChartIcon />
          <h3 className="mb-2 text-2xl font-bold">Build Your Competencies</h3>
          <p className="text-center text-blue-100">
            Get personalized learning paths powered by AI to excel in statistical analysis.
          </p>
        </div>

        <div className="order-1 p-10 md:order-2">
          <h2 className="mb-1 text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="mb-6 text-gray-600">Join us and start your learning journey</p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField icon={User} label="Full Name" value={fullName} onChange={setFullName} placeholder="Enter your full name" />
            <FormField icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="Enter your email" />

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Department</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-600"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <FormField icon={IdCard} label="Designation" value={designation} onChange={setDesignation} placeholder="Your designation" />
            <FormField icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="Create a password" />
            <FormField icon={Lock} label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm your password" />

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
              <span>I agree to the Terms &amp; Conditions</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function FormField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border-2 border-gray-200 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-600"
        />
      </div>
    </div>
  );
}

function BarChartIcon() {
  return (
    <svg className="mb-6 h-24 w-24 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 13.125 4.5 13.125 6 11.625C7.5 10.125 7.5 6.375 9 6.375C10.5 6.375 10.5 16.875 12 16.875C13.5 16.875 13.5 9.375 15 9.375C16.5 9.375 16.5 13.125 18 13.125C19.5 13.125 19.5 10.875 21 10.875" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V5M5 5L3 7M5 5L7 7" />
    </svg>
  );
}
