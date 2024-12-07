import React from 'react';
import { MainLayout } from '../../shared/layouts/MainLayout';

export function TermsPage() {
  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 
                       bg-clip-text text-transparent">
            Terms of Service
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-lg text-gray-300">
            By using AI API Kit, you agree to these terms. Please read them carefully.
          </p>

          <h2 className="text-2xl font-semibold text-gray-100 mt-8">1. Acceptance of Terms</h2>
          <p className="text-gray-300">
            By accessing or using our website, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our service.
          </p>

          <h2 className="text-2xl font-semibold text-gray-100 mt-8">2. Use of Service</h2>
          <p className="text-gray-300">
            Our directory is provided for informational purposes. While we strive to maintain accurate
            and up-to-date information, we make no guarantees about the accuracy or reliability of
            the content.
          </p>

          <h2 className="text-2xl font-semibold text-gray-100 mt-8">3. User Submissions</h2>
          <p className="text-gray-300">
            When submitting APIs to our directory:
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>You must have the right to submit the information</li>
            <li>The information must be accurate and complete</li>
            <li>You grant us the right to display and share the information</li>
            <li>We reserve the right to modify or remove submissions</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-100 mt-8">4. Intellectual Property</h2>
          <p className="text-gray-300">
            The content, organization, and design of our website are protected by copyright and
            other intellectual property laws. You may not copy, modify, or distribute our content
            without permission.
          </p>

          <h2 className="text-2xl font-semibold text-gray-100 mt-8">5. Limitation of Liability</h2>
          <p className="text-gray-300">
            We are not responsible for any damages or losses resulting from your use of our service
            or any APIs listed in our directory. Use third-party services at your own risk.
          </p>

          <h2 className="text-2xl font-semibold text-gray-100 mt-8">6. Changes to Terms</h2>
          <p className="text-gray-300">
            We reserve the right to modify these terms at any time. We will notify users of any
            significant changes through our website or email.
          </p>

          <h2 className="text-2xl font-semibold text-gray-100 mt-8">Contact</h2>
          <p className="text-gray-300">
            If you have any questions about these Terms, please contact us at{' '}
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
