'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, MessageCircle, Heart, Book, Users, Shield, Sparkles } from 'lucide-react';


export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/chat');
  };

  return (
    <div className="min-h-screen bg-white" dir="ltr" style={{ textAlign: 'left', direction: 'ltr' }}>


      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-100 mb-6">
              <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">The First & Smartest Christian GPT</span>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
            Al Hayat
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> GPT</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Experience AI conversations rooted in Christian wisdom and values.
            Get guidance, scripture insights, and spiritual support powered by advanced AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
            >
              Start Chatting
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="text-blue-600 hover:text-blue-700 px-8 py-4 font-semibold text-lg transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* Floating AI Chat Preview */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-600 font-medium">Al Hayat GPT</div>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl rounded-br-md max-w-xs">
                    &ldquo;What does the Bible say about finding peace in difficult times?&rdquo;
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-6 py-3 rounded-2xl rounded-bl-md max-w-md">
                    The Bible offers beautiful guidance on finding peace. In John 14:27, Jesus says &ldquo;Peace I leave with you; my peace I give you...&rdquo; Let me share some verses and practical ways to apply this wisdom to your situation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Faithful AI, Powerful Insights
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with Christian principles at its core, delivering wisdom that aligns with your faith.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Book className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Scripture-Based</h3>
              <p className="text-gray-600 leading-relaxed">
                Every response is grounded in biblical wisdom and Christian theology, providing authentic spiritual guidance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Compassionate</h3>
              <p className="text-gray-600 leading-relaxed">
                Designed with empathy and understanding, offering comfort and support in times of need.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Trustworthy</h3>
              <p className="text-gray-600 leading-relaxed">
                Built with integrity and respect for Christian values, ensuring reliable and faithful responses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Your Spiritual Companion
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you&rsquo;re seeking guidance, studying scripture, or need prayer support, Al Hayat GPT is here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="space-y-12">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Daily Devotions</h3>
                    <p className="text-gray-600">Get personalized daily scripture readings and reflections tailored to your spiritual journey.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Book className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Bible Study</h3>
                    <p className="text-gray-600">Explore deeper meanings in scripture with contextual explanations and cross-references.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Prayer Support</h3>
                    <p className="text-gray-600">Receive guidance on prayer, meditation, and connecting with God in meaningful ways.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Life Guidance</h3>
                    <p className="text-gray-600">Navigate life&rsquo;s challenges with wisdom rooted in Christian principles and biblical teachings.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <span className="font-semibold text-gray-900">Al Hayat GPT</span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  &ldquo;I understand you&rsquo;re going through a difficult time. Let me share what Psalm 23 teaches us about finding comfort in God&rsquo;s presence...&rdquo;
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Based on Psalm 23, Jeremiah 29:11, Romans 8:28</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SDK Integration Banner */}
      <section className="py-32 px-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200 mb-6">
              <MessageCircle className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Add to Your Website</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Integrate Al Hayat GPT into Your Website
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Share the power of Christian AI with your community. Add our widget to your website with just a few lines of code - no technical expertise required.
            </p>
            <button
              onClick={() => router.push('/instructions')}
              className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center mx-auto shadow-lg hover:shadow-xl"
            >
              Get Integration Guide
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Easy Integration</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Works with all platforms - WordPress, React, HTML, Angular. Just copy, paste, and customize.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">No API Keys Required</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Simple setup with no complex configuration. Auto-detects language and adjusts direction for multilingual sites.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Fully Customizable</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Adjust height, colors, and behavior to match your website&rsquo;s design. Works seamlessly with any theme.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Supported Platforms
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">WP</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">WordPress</h4>
                      <p className="text-sm text-gray-600">Add to posts, pages, or widgets with shortcodes</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">R</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">React &amp; Next.js</h4>
                      <p className="text-sm text-gray-600">Component-based integration with hooks</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-lg">H</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">HTML & Static Sites</h4>
                      <p className="text-sm text-gray-600">Simple script tag integration</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-lg">A</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Angular</h4>
                      <p className="text-sm text-gray-600">Angular component with TypeScript support</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 rounded-2xl p-6 text-left">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-400 text-sm ml-2">Integration Example</span>
                </div>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{`<div id="ahgpt-widget"></div>

<script>
window.AlHayatGPT.createWidget({
  containerId: 'ahgpt-widget',
  height: '600px',
  allowGuests: true,
  autoDetectLanguage: true
});
</script>`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Islamic Debates Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-100 to-orange-100 rounded-full border border-red-200 mb-6">
              <Shield className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-800">Equipped for Apologetics</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Expert in Islamic Debates & Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Al Hayat GPT is uniquely equipped with extensive knowledge to engage in Islamic debates and answer challenging questions about Islam from a Christian perspective. Our AI provides well-researched, biblically-grounded responses to help you understand and respond to Islamic teachings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Book className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Theological Comparisons</h3>
                    <p className="text-gray-600">Compare Islamic and Christian teachings with detailed biblical references and historical context.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Apologetic Responses</h3>
                    <p className="text-gray-600">Get well-researched answers to common Islamic objections to Christianity and the Gospel.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Evangelism Support</h3>
                    <p className="text-gray-600">Learn effective approaches to share the Gospel with Muslims and address their concerns with love and truth.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="space-y-6">
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl rounded-br-md max-w-sm">
                    &ldquo;How do we respond to Muslims who say the Bible has been corrupted?&rdquo;
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-6 py-3 rounded-2xl rounded-bl-md">
                    <p className="mb-2">This is a common claim that requires careful examination. The manuscript evidence strongly supports the Bible&rsquo;s preservation:</p>
                    <p className="text-sm text-gray-600">✓ Over 5,800 Greek New Testament manuscripts<br />✓ Archaeological confirmations<br />✓ Early church fathers&rsquo; quotes<br />✓ Multiple independent textual traditions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-32 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Have questions about Al Hayat GPT? Need support or want to share feedback? We&rsquo;d love to hear from you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/contact')}
              className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              Contact Us
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Begin Your Journey Today
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of believers who trust Al Hayat GPT for spiritual guidance, biblical insights, and faithful conversation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="group bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              Start Chatting Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-12 text-blue-200 text-sm">
            Free to use • No registration required • Faithful AI responses
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-lg font-bold">AI</span>
          </div>
          <p className="text-gray-400 mb-4">Al Hayat GPT - The First & Smartest Christian GPT</p>
          <p className="text-gray-500 text-sm">
            Built with ❤️ for the Christian community
          </p>
        </div>
      </footer>
    </div>
  );
}
