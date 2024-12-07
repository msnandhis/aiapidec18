import React from 'react';
import { MainLayout } from '../../shared/layouts/MainLayout';

export function PrivacyPage() {
  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 
                       bg-clip-text text-transparent">
            Privacy Policy
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-lg text-gray-300">
            At AI API Kit, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, and protect your personal information.
          </p>

          <h2 className="text-2xl font-semibold text-gray-100 mt-8">Information We Collect</h2>
          <p className="text-gray-300">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Name and email address when you contact us</li>
            <li>Information about APIs you submit to our directory</li>
            <li>Usage data and analytics to improve our service</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-100 mt-8">How We Use Your Information</h2>
          <p className="text-gray-300">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Provide and maintain our services</li>
            <li>Respond to your inquiries and requests</li>
            <li>Improve our website and user experience</li>
            <li>Send important updates about our service</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-100 mt-8">Data Security</h2>
          <p className="text-gray-300">
            We implement appropriate security measures to protect your personal information.
            However, no method of transmission over the internet is 100% secure.
          </p>

          <h2 className="text-2xl font-semibold text-gray-100 mt-8">Contact Us</h2>
          <p className="text-gray-300">
            If you have any questions about our Privacy Policy, please contact us at{' '}
            <a 
              href="mailto:support@aiapikit.com"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              support@aiapikit.com
            </a>
          </p>

          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
