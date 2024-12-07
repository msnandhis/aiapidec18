import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 border-t border-gray-700">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">About AI API Kit</h3>
            <p className="text-gray-400 text-sm">
            AIAPIKit.com is a directory that lists AI model APIs for developers. Explore a wide range of tools for tasks like image generation, text analysis, and more. Curated by developers, for developers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Contact</h3>
            <p className="text-gray-400 text-sm mb-2">
              Have questions or suggestions?
            </p>
            <Link 
              to="/contact"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              Get in touch →
            </Link>
            <div className="mt-4">
              <a 
                href="mailto:support@aiapikit.com"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                support@aiapikit.com
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-400 text-sm">
            © {currentYear} AI API Kit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
