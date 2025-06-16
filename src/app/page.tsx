import Link from 'next/link';
import { ArrowRight, CheckCircle, Users, BarChart3, Calendar, Zap, Shield, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100/[0.03] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-8">
              <Zap className="w-4 h-4 mr-2" />
              Trusted by 1000+ fitness professionals
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
              Transform Your
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Fitness Business
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              The all-in-one platform that empowers fitness coaches to manage clients, 
              create personalized programs, and scale their business like never before.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/auth/register"
                className="group inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 text-blue-200 text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                14-day free trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to 
              <span className="text-blue-600"> Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful, intuitive tools designed specifically for modern fitness professionals
              who want to deliver exceptional results and grow their business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Client Management"
              description="Organize client information, track progress, and maintain detailed profiles with comprehensive health and fitness data."
              features={["Contact management", "Progress tracking", "Health assessments", "Goal setting"]}
            />
            <FeatureCard
              icon={<Calendar className="w-8 h-8" />}
              title="Program Builder"
              description="Create personalized training programs with our intuitive drag-and-drop interface and extensive exercise library."
              features={["Custom workouts", "Exercise library", "Program templates", "Scheduling tools"]}
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Analytics & Reports"
              description="Track client progress, business metrics, and gain insights to optimize your coaching effectiveness."
              features={["Progress analytics", "Business insights", "Custom reports", "Performance metrics"]}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Built by Trainers,
                <span className="text-blue-600"> for Trainers</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We understand the challenges fitness professionals face. That&apos;s why we&apos;ve created a 
                platform that addresses real needs with practical solutions, helping you focus on 
                what you do best - transforming lives through fitness.
              </p>
              
              <div className="space-y-4">
                <BenefitItem text="Save 10+ hours per week on administrative tasks" />
                <BenefitItem text="Increase client retention by 40% with better engagement" />
                <BenefitItem text="Scale your business to serve 3x more clients effectively" />
                <BenefitItem text="Professional tools that make you look like the expert you are" />
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 shadow-lg mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Client Progress</h3>
                    <span className="text-green-600 text-sm font-medium">+15% this week</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-3/4"></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Today&apos;s Schedule</h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">9:00 AM - Sarah Johnson</span>
                    </div>
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">11:00 AM - Mike Chen</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="flex justify-center mb-6">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-6 h-6 text-yellow-400">⭐</div>
                ))}
              </div>
            </div>
            <blockquote className="text-2xl font-medium text-gray-900 mb-8 leading-relaxed">
              &quot;FitnessCoach has transformed how I manage my clients. I can now handle twice as many 
              clients while providing better service. The program builder is amazing!&quot;
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-semibold">JD</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Jessica Davis</div>
                <div className="text-gray-600">Certified Personal Trainer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your 
            <span className="block text-blue-200">Fitness Business?</span>
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of successful fitness professionals who trust FitnessCoach 
            to power their business growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="group inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-xl"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
            >
              Sign In Now
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">1000+</div>
              <div className="text-blue-200 text-sm">Active Trainers</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">50k+</div>
              <div className="text-blue-200 text-sm">Clients Managed</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">99.9%</div>
              <div className="text-blue-200 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">FC</span>
                </div>
                <span className="text-xl font-bold">FitnessCoach</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Empowering fitness professionals with the tools they need to build 
                successful, scalable coaching businesses.
              </p>
              <div className="flex items-center space-x-4">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm text-slate-400">SSL Secured</span>
                <Globe className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-400">Global Infrastructure</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="#api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#status" className="hover:text-white transition-colors">System Status</Link></li>
                <li><Link href="#community" className="hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 FitnessCoach. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#privacy" className="text-slate-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="#terms" className="text-slate-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ 
  icon, 
  title, 
  description, 
  features 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  features: string[];
}) {
  return (
    <div className="group bg-white rounded-2xl shadow-card p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Benefit Item Component
function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center">
      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
        <CheckCircle className="w-4 h-4 text-green-600" />
      </div>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}