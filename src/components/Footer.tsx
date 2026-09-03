import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold mb-3">
              <GraduationCap className="h-7 w-7 text-blue-400" />
              <span>Saamrthya AI</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Empowering India's Official Statistical System through AI-driven capacity building.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses" className="text-gray-400 hover:text-white transition">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Contact Info</h3>
            <p className="flex items-center gap-2 text-gray-400 mb-1">
              <Mail className="h-4 w-4" /> info@saamrthya.ai
            </p>
            <p className="flex items-center gap-2 text-gray-400">
              <Phone className="h-4 w-4" /> +91 11 1234 5678
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
          &copy; 2024 Saamrthya AI Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
