import React from 'react';
import { MainLayout } from '../../shared/layouts/MainLayout';

export function AboutPage() {
  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 
                       bg-clip-text text-transparent">
            About AI API Kit
          </h1>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-lg text-gray-300 leading-relaxed">
            AI API Kit is your comprehensive directory for discovering and exploring AI and development resources. 
            Our platform helps developers find the right tools and APIs to build amazing applications.
          </p>

          <h2 className="text-2xl font-semibold text-gray-100 mt-8">Our Mission</h2>
          <p className="text-gray-300">
            Our mission is to simplify the process of finding and integrating AI and development tools 
            by providing a curated list of high-quality resources. We believe in empowering developers 
            with the best tools and resources to build innovative solutions.
          </p>

          <h2 className="text-2xl font-semibold text-gray-100 mt-8">What We Offer</h2>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Curated collection of AI and development tools</li>
            <li>Detailed information about each resource</li>
            <li>Easy-to-use interface for discovering new tools</li>
            <li>Regular updates with new resources</li>
            <li>Community-driven recommendations</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-100 mt-8">Contact Us</h2>
          <p className="text-gray-300">
            Have questions or suggestions? We'd love to hear from you! Reach out to us at{' '}
            <a 
              href="mailto:support@aiapikit.com" 
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              support@aiapikit.com
            </a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
