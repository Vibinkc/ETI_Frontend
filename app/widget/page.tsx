"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/lib/api";
import {
  MessageSquare,
  FileText,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Target,
  Bell,
  BarChart3,
  Table,
  Upload,
  Shield,
  Clock,
  Layout,
  MessageCircle,
  TrendingUp,
  Globe,
  Smartphone,
  Play,
  Star,
  Award,
  Lock,
  Headphones,
  Heart
} from "lucide-react";

/**
 * Drop-in replacement for Math.random(), backed by the Web Crypto API.
 *
 * The values here only position decorative particles and time animations, so
 * predictability is harmless - but a scanner cannot tell a cosmetic use from a
 * security-relevant one, and neither can the next person to copy this code.
 * The return range is identical, [0, 1), so every expression that consumes it
 * keeps the same distribution and the page looks exactly as before.
 *
 * Only called from inside an effect, so `crypto` is always the browser's.
 */
function secureRandom(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] / 2 ** 32;
}

export default function WidgetPage() {
  const [isClient, setIsClient] = useState(false);
  const [lightningData, setLightningData] = useState<Array<{ duration: number, delay: number }>>([]);
  const [particleData, setParticleData] = useState<Array<{ left: number, top: number, color: string, duration: number, delay: number }>>([]);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isAboutUsVisible, setIsAboutUsVisible] = useState(false);
  const [isProgramsVisible, setIsProgramsVisible] = useState(false);
  const [isCareersVisible, setIsCareersVisible] = useState(false);
  const [isVeteransVisible, setIsVeteransVisible] = useState(false);
  const [isCTAVisible, setIsCTAVisible] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only flag: must stay in an effect so SSR renders the non-random markup and hydration matches
    setIsClient(true);

    // Generate lightning bolt data
    const lightning = Array.from({ length: 6 }, (_, i) => ({
      duration: 3 + secureRandom() * 2,
      delay: i * 0.8,
    }));
    setLightningData(lightning);

    // Generate particle data
    const particles = Array.from({ length: 30 }, (_, i) => ({
      left: secureRandom() * 100,
      top: secureRandom() * 100,
      color: i % 3 === 0 ? '#002c5c' : i % 3 === 1 ? '#81c341' : '#002c5c',
      duration: 10 + secureRandom() * 20,
      delay: secureRandom() * 5,
    }));
    setParticleData(particles);

    // Enable scrolling for this page
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.height = 'auto';

    // Load the bot widget script
    const script = document.createElement("script");
    script.src = `${API_ENDPOINTS.base}/api/bot/widget.js`;
    script.async = true;
    document.body.appendChild(script);

    // Intersection Observer for all sections
    const sections = [
      { id: 'hero-section', setter: setIsHeroVisible },
      { id: 'about-us-section', setter: setIsAboutUsVisible },
      { id: 'programs-section', setter: setIsProgramsVisible },
      { id: 'careers-section', setter: setIsCareersVisible },
      { id: 'veterans-section', setter: setIsVeteransVisible },
      { id: 'cta-section', setter: setIsCTAVisible },
    ];

    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id, setter }) => {
      const section = document.getElementById(id);
      if (section) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setter(true);
              }
            });
          },
          { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        observer.observe(section);
        observers.push(observer);
      }
    });

    // Hero section should be visible immediately
    setIsHeroVisible(true);

    return () => {
      // Cleanup observers
      observers.forEach((observer) => {
        observer.disconnect();
      });
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      // Reset overflow styles
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ overflow: 'visible' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/eti_logo.png" alt="ETI" className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#002c5c] to-[#81c341] bg-clip-text text-transparent">
                ETI
              </span>
            </div>
            <div className="flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <a href="#about" className="text-gray-700 hover:text-[#002c5c] font-medium transition-colors">ABOUT ETI</a>
              <a href="#apply" className="text-gray-700 hover:text-[#002c5c] font-medium transition-colors">APPLY TO ETI</a>
              <a href="#pre-apprenticeship" className="text-gray-700 hover:text-[#002c5c] font-medium transition-colors">PRE-APPRENTICESHIP</a>
              <a href="#contact" className="text-gray-700 hover:text-[#002c5c] font-medium transition-colors">CONTACT</a>
            </div>
            <div className="flex items-center">
              <a href="#members" className="px-4 py-2 bg-gradient-to-r from-[#002c5c] to-[#81c341] text-white rounded-lg font-medium hover:shadow-lg transition-all">
                MEMBERS
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero-section" className="pt-32 pb-20 px-6 bg-gradient-to-b from-gray-50 via-white to-white relative overflow-hidden">
        {/* ETI Electrical-Themed Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Electrical Circuit Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.04]">
            <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="circuitGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1.5" fill="#002c5c" opacity="0.6">
                    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <line x1="20" y1="0" x2="20" y2="40" stroke="#002c5c" strokeWidth="0.5" opacity="0.3" />
                  <line x1="0" y1="20" x2="40" y2="20" stroke="#002c5c" strokeWidth="0.5" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#circuitGrid)" className="animate-circuit-grid" />
            </svg>
          </div>

          {/* Electrical Current Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="currentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#002c5c" stopOpacity="0.8">
                  <animate attributeName="stop-opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="#81c341" stopOpacity="0.8">
                  <animate attributeName="stop-opacity" values="0.3;1;0.3" dur="3s" begin="1s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#002c5c" stopOpacity="0.8">
                  <animate attributeName="stop-opacity" values="0.3;1;0.3" dur="3s" begin="2s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            </defs>

            {/* Horizontal Power Lines */}
            <line x1="0" y1="200" x2="1200" y2="200" stroke="url(#currentGradient)" strokeWidth="2" strokeDasharray="20,10">
              <animate attributeName="stroke-dashoffset" values="0;30" dur="2s" repeatCount="indefinite" />
            </line>
            <line x1="0" y1="400" x2="1200" y2="400" stroke="url(#currentGradient)" strokeWidth="2" strokeDasharray="20,10">
              <animate attributeName="stroke-dashoffset" values="0;30" dur="2s" begin="1s" repeatCount="indefinite" />
            </line>
            <line x1="0" y1="600" x2="1200" y2="600" stroke="url(#currentGradient)" strokeWidth="2" strokeDasharray="20,10">
              <animate attributeName="stroke-dashoffset" values="0;30" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </line>

            {/* Vertical Connection Lines */}
            <line x1="200" y1="0" x2="200" y2="800" stroke="url(#currentGradient)" strokeWidth="1.5" strokeDasharray="15,15" opacity="0.6">
              <animate attributeName="stroke-dashoffset" values="0;30" dur="3s" repeatCount="indefinite" />
            </line>
            <line x1="600" y1="0" x2="600" y2="800" stroke="url(#currentGradient)" strokeWidth="1.5" strokeDasharray="15,15" opacity="0.6">
              <animate attributeName="stroke-dashoffset" values="0;30" dur="3s" begin="1s" repeatCount="indefinite" />
            </line>
            <line x1="1000" y1="0" x2="1000" y2="800" stroke="url(#currentGradient)" strokeWidth="1.5" strokeDasharray="15,15" opacity="0.6">
              <animate attributeName="stroke-dashoffset" values="0;30" dur="3s" begin="2s" repeatCount="indefinite" />
            </line>
          </svg>

          {/* Lightning Bolt Effects */}
          {isClient && (
            <div className="absolute inset-0 opacity-5">
              {lightningData.map((data, i) => (
                <svg
                  key={i}
                  className="absolute"
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${20 + Math.sin(i) * 20}%`,
                    width: '60px',
                    height: '100px',
                    animation: `lightning-flash ${data.duration}s ease-in-out ${data.delay}s infinite`,
                  }}
                  viewBox="0 0 24 40"
                >
                  <path
                    d="M12 0 L8 15 L12 12 L16 25 L12 20 L8 40"
                    stroke={i % 2 === 0 ? '#002c5c' : '#81c341'}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ))}
            </div>
          )}

          {/* Electrical Energy Waves */}
          <div className="absolute bottom-0 left-0 w-full h-32 opacity-8">
            <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path
                d="M0,80 Q150,40 300,80 T600,80 T900,80 T1200,80 L1200,120 L0,120 Z"
                fill="#002c5c"
                className="animate-energy-wave"
              />
              <path
                d="M0,90 Q150,50 300,90 T600,90 T900,90 T1200,90 L1200,120 L0,120 Z"
                fill="#81c341"
                className="animate-energy-wave animation-delay-1000"
              />
            </svg>
          </div>

          {/* Rotating Electrical Symbols */}
          <div className="absolute top-1/4 right-1/4 opacity-5">
            <Zap className="w-32 h-32 text-[#002c5c] animate-spin-slow" />
          </div>
          <div className="absolute bottom-1/4 left-1/4 opacity-5">
            <Zap className="w-40 h-40 text-[#81c341] animate-spin-slow animation-delay-2000" style={{ animationDirection: 'reverse' }} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`transition-all duration-1000 ${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className={`text-6xl font-bold mb-6 bg-gradient-to-r from-[#002c5c] to-[#81c341] bg-clip-text text-transparent transition-all duration-1000 delay-200 ${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                Welcome to Electrical Training Institute (ETI)
              </h1>
              <p className={`text-2xl text-gray-600 mb-8 transition-all duration-1000 delay-400 ${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                Your gateway to a brighter future in the electrical and telecommunications industries. Our program is designed to equip aspiring professionals with the skills, knowledge, and hands-on experience needed to excel in high-demand technical careers.
              </p>
              <div className={`flex gap-4 transition-all duration-1000 delay-600 ${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002c5c] text-lg transition-all"
                />
                <button className="px-8 py-4 bg-gradient-to-r from-[#002c5c] to-[#81c341] text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center gap-2 transform hover:scale-105 animate-pulse-slow">
                  Start Learning Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Animated Right Side Section - Advanced Animation */}
            <div className={`relative h-96 overflow-hidden transition-all duration-1000 delay-800 ${isHeroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
              {/* Animated Background Particles */}
              {isClient && (
                <div className="absolute inset-0">
                  {particleData.slice(0, 20).map((particle, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        left: `${particle.left}%`,
                        top: `${particle.top}%`,
                        backgroundColor: particle.color,
                        opacity: 0.3,
                        animation: `particle-float ${particle.duration}s ease-in-out infinite`,
                        animationDelay: `${particle.delay}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Main Center Icon with Advanced Effects */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center z-10 relative">
                  {/* Pulsing Rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute w-48 h-48 border-2 border-[#002c5c]/30 rounded-full animate-ping-ring"></div>
                    <div className="absolute w-56 h-56 border-2 border-[#81c341]/30 rounded-full animate-ping-ring animation-delay-1000"></div>
                  </div>

                  <div className="relative mb-4">
                    {/* Rotating Electrical Symbol with Glow */}
                    <div className="relative w-40 h-40 mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#002c5c] to-[#81c341] rounded-full blur-xl opacity-50 animate-pulse-glow"></div>
                      <Zap className="w-40 h-40 text-[#002c5c] opacity-90 relative z-10 animate-zap-pulse" />
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20">
                        <Sparkles className="w-10 h-10 text-[#81c341] animate-spin-slow" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 font-semibold text-xl relative z-10 animate-fade-in-up">Electrical Training</p>
                  <p className="text-gray-600 text-base mt-2 relative z-10 animate-fade-in-up animation-delay-200">Skills • Knowledge • Experience</p>
                </div>
              </div>

              {/* Orbiting Icons with Complex Paths - Well Separated Radii */}
              {/* Skills Icon - Orbiting at 70px radius (inner) */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-16 h-16 animate-orbit-70">
                  <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-[#002c5c]/30 to-[#002c5c]/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border border-[#002c5c]/20">
                    <Target className="w-8 h-8 text-[#002c5c] animate-scale-pulse" />
                  </div>
                </div>
              </div>

              {/* Knowledge Icon - Orbiting at 100px radius, reverse */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-16 h-16 animate-orbit-100-reverse animation-delay-1000">
                  <div className="absolute top-0 left-0 w-14 h-14 bg-gradient-to-br from-[#81c341]/30 to-[#81c341]/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border border-[#81c341]/20">
                    <BookOpen className="w-7 h-7 text-[#81c341] animate-scale-pulse animation-delay-500" />
                  </div>
                </div>
              </div>

              {/* Experience Icon - Orbiting at 130px radius */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-16 h-16 animate-orbit-130 animation-delay-2000">
                  <div className="absolute top-0 left-0 w-14 h-14 bg-gradient-to-br from-[#002c5c]/30 to-[#002c5c]/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border border-[#002c5c]/20">
                    <Zap className="w-7 h-7 text-[#002c5c] animate-scale-pulse animation-delay-1000" />
                  </div>
                </div>
              </div>

              {/* Career Growth Icon - Orbiting at 160px radius (outer), reverse */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-16 h-16 animate-orbit-160-reverse animation-delay-3000">
                  <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-[#81c341]/30 to-[#81c341]/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border border-[#81c341]/20">
                    <TrendingUp className="w-8 h-8 text-[#81c341] animate-scale-pulse animation-delay-1500" />
                  </div>
                </div>
              </div>

              {/* Technical Skills - Corner Position */}
              <div className="absolute top-12 left-12 w-14 h-14 bg-gradient-to-br from-[#002c5c]/25 to-[#002c5c]/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border border-[#002c5c]/20 animate-float-advanced">
                <BarChart3 className="w-7 h-7 text-[#002c5c]" />
              </div>

              {/* Professional Growth - Corner Position */}
              <div className="absolute bottom-12 right-12 w-14 h-14 bg-gradient-to-br from-[#81c341]/25 to-[#81c341]/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border border-[#81c341]/20 animate-float-advanced animation-delay-1500">
                <Award className="w-7 h-7 text-[#81c341]" />
              </div>

              {/* Animated Circuit Network */}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 400">
                <defs>
                  <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#002c5c" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#81c341" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#002c5c" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <path
                  d="M 50 200 Q 100 150, 150 200 T 250 200 T 350 200"
                  stroke="url(#circuitGradient)"
                  strokeWidth="2"
                  fill="none"
                  className="animate-draw-line"
                />
                <path
                  d="M 200 50 Q 200 100, 200 150 T 200 250 T 200 350"
                  stroke="url(#circuitGradient)"
                  strokeWidth="2"
                  fill="none"
                  className="animate-draw-line animation-delay-1000"
                />
                <circle cx="200" cy="200" r="80" fill="none" stroke="url(#circuitGradient)" strokeWidth="1" className="animate-draw-line animation-delay-2000" />
              </svg>

              {/* Dynamic Glow Elements */}
              <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-[#002c5c]/15 rounded-full blur-3xl animate-pulse-glow"></div>
              <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-[#81c341]/15 rounded-full blur-3xl animate-pulse-glow animation-delay-2000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us-section" className="py-20 px-6 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className={`inline-block px-6 py-2 bg-gradient-to-r from-[#002c5c]/10 to-[#81c341]/10 rounded-full mb-6 transition-all duration-1000 ${isAboutUsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              <span className="text-sm font-semibold text-[#002c5c]">ABOUT US</span>
            </div>
            <h2 className={`text-5xl font-bold mb-6 bg-gradient-to-r from-[#002c5c] to-[#81c341] bg-clip-text text-transparent transition-all duration-1000 delay-200 ${isAboutUsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              Welcome to Electrical Training Institute
            </h2>
            <p className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-400 ${isAboutUsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              Your gateway to a brighter future in the electrical and telecommunications industries
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column - Main Description */}
            <div className="space-y-6">
              <div className={`bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:border-[#81c341]/30 ${isAboutUsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'} transition-all duration-1000 delay-600`}>
                {/* Animated Border Glow on Hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#002c5c]/0 via-[#81c341]/10 to-[#002c5c]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Animated Icons in Text */}
                <div className="relative z-10">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    <span className="inline-flex items-center gap-1">
                      <Zap className="w-4 h-4 text-[#002c5c] inline-block animate-scale-pulse" />
                      Electrical Training Institute (ETI)
                    </span> is committed to delivering top-tier education through comprehensive training programs that blend theoretical instruction with real-world application. We partner with industry leaders, including the <span className="font-semibold text-[#002c5c]">International Brotherhood of Electrical Workers (IBEW)</span> and the <span className="font-semibold text-[#81c341]">National Electrical Contractors Association (NECA)</span>, to ensure our curriculum is aligned with the latest industry standards and technological advancements.
                  </p>
                </div>
              </div>

              <div className={`bg-gradient-to-br from-[#002c5c] to-[#81c341] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300 ${isAboutUsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'} transition-all duration-1000 delay-800`}>
                {/* Animated Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                {/* Pulsing Rings */}
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse-glow"></div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse-glow animation-delay-2000"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center animate-scale-pulse group-hover:scale-110 transition-transform duration-300">
                      <Target className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold group-hover:scale-105 transition-transform duration-300 inline-block">Our Mission Statement</h3>
                  </div>
                  <p className="text-white/95 leading-relaxed mb-4 animate-fade-in-up animation-delay-200">
                    The <span className="font-semibold">Electrical Training Institute (ETI)</span> of San Diego and Imperial Counties, in alliance with the <span className="font-semibold">International Brotherhood of Electrical Workers (IBEW) Local Union 569</span> and the <span className="font-semibold">National Electrical Contractors Association (NECA)</span> of San Diego, provides a professional cutting-edge team of Industry-leading electrical workers through innovative training in emerging technologies.
                  </p>
                  <p className="text-white/95 leading-relaxed animate-fade-in-up animation-delay-400">
                    The Electrical Training Institute strives to develop a higher standard of living for all members of the community as we progress toward a better place for everyone to work and live.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Why Choose ETI */}
            <div>
              <h3 className={`text-3xl font-bold mb-8 text-gray-900 transition-all duration-1000 delay-600 ${isAboutUsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>Why Choose Electrical Training Institute?</h3>
              <div className="space-y-6">
                <div className={`bg-white rounded-xl p-6 border-l-4 border-[#81c341] shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 ${isAboutUsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'} transition-all duration-1000 delay-800`}>
                  {/* Animated Border Glow */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#81c341] to-[#81c341]/50 group-hover:w-2 transition-all duration-300"></div>
                  {/* Animated Background on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#81c341]/0 to-[#81c341]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 bg-[#81c341]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-[#81c341]/20 group-hover:rotate-6 transition-all duration-300">
                      <Users className="w-6 h-6 text-[#81c341] group-hover:animate-scale-pulse" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-[#81c341] transition-colors duration-300">Expert Instructors</h4>
                      <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Learn from seasoned professionals with years of industry experience.</p>
                    </div>
                  </div>
                </div>

                <div className={`bg-white rounded-xl p-6 border-l-4 border-[#002c5c] shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 ${isAboutUsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'} transition-all duration-1000 delay-1000`}>
                  {/* Animated Border Glow */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#002c5c] to-[#002c5c]/50 group-hover:w-2 transition-all duration-300"></div>
                  {/* Animated Background on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#002c5c]/0 to-[#002c5c]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 bg-[#002c5c]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-[#002c5c]/20 group-hover:rotate-6 transition-all duration-300">
                      <Zap className="w-6 h-6 text-[#002c5c] group-hover:animate-zap-pulse" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-[#002c5c] transition-colors duration-300">Hands-On Training</h4>
                      <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Gain practical experience through on-the-job training opportunities and take classes in our state-of-the-art facility.</p>
                    </div>
                  </div>
                </div>

                <div className={`bg-white rounded-xl p-6 border-l-4 border-[#81c341] shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 ${isAboutUsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'} transition-all duration-1000 delay-1200`}>
                  {/* Animated Border Glow */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#81c341] to-[#81c341]/50 group-hover:w-2 transition-all duration-300"></div>
                  {/* Animated Background on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#81c341]/0 to-[#81c341]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 bg-[#81c341]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-[#81c341]/20 group-hover:rotate-6 transition-all duration-300">
                      <Award className="w-6 h-6 text-[#81c341] group-hover:animate-scale-pulse" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-[#81c341] transition-colors duration-300">Industry Recognition</h4>
                      <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Our programs are recognized and respected by leading industry associations and employers.</p>
                    </div>
                  </div>
                </div>

                <div className={`bg-white rounded-xl p-6 border-l-4 border-[#002c5c] shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 ${isAboutUsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'} transition-all duration-1000 delay-1400`}>
                  {/* Animated Border Glow */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#002c5c] to-[#002c5c]/50 group-hover:w-2 transition-all duration-300"></div>
                  {/* Animated Background on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#002c5c]/0 to-[#002c5c]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 bg-[#002c5c]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-[#002c5c]/20 group-hover:rotate-6 transition-all duration-300">
                      <Shield className="w-6 h-6 text-[#002c5c] group-hover:animate-scale-pulse" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-[#002c5c] transition-colors duration-300">Accreditation</h4>
                      <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Approved by California Division of Apprenticeship Standards and the Department of Labor Office of Apprenticeship.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className={`bg-gradient-to-r from-[#002c5c]/5 via-[#81c341]/5 to-[#002c5c]/5 rounded-2xl p-8 border border-gray-200 text-center relative overflow-hidden hover:border-[#81c341]/30 transition-all duration-300 ${isAboutUsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'} transition-all duration-1000 delay-1600`}>
            <div className="relative z-10">
              <p className={`text-xl text-gray-700 mb-6 transition-all duration-1000 delay-200 ${isAboutUsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                At <span className="font-semibold text-[#002c5c]">Electrical Training Institute</span>, we believe in the power of education to transform lives. Whether you&apos;re just starting out or looking to enhance your current skills, we&apos;re here to support your journey every step of the way.
              </p>
              <button className={`px-8 py-4 bg-gradient-to-r from-[#002c5c] to-[#81c341] text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all transform hover:scale-105 relative overflow-hidden group ${isAboutUsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-400`}>
                <span className="relative z-10 flex items-center gap-2">
                  Join us and take the first step toward a rewarding and impactful career
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Programs Section */}
      <section id="programs-section" className="py-20 px-6 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-[#002c5c]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#81c341]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className={`inline-block px-6 py-2 bg-gradient-to-r from-[#002c5c]/10 to-[#81c341]/10 rounded-full mb-6 transition-all duration-1000 ${isProgramsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              <span className="text-sm font-semibold text-[#002c5c]">OUR PROGRAMS</span>
            </div>
            <h2 className={`text-5xl font-bold mb-6 bg-gradient-to-r from-[#002c5c] to-[#81c341] bg-clip-text text-transparent transition-all duration-1000 delay-200 ${isProgramsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              Specialized Training Programs
            </h2>
            <p className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-400 ${isProgramsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              We offer a range of specialized programs tailored to meet the needs of today&apos;s rapidly evolving job market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Program 1 - Inside Wireman */}
            <div className={`group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#002c5c] transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 ${isProgramsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'} transition-all duration-1000 delay-600`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#002c5c]/10 to-transparent rounded-bl-full"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#002c5c] to-[#002c5c]/80 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-[#002c5c] transition-colors">
                  Inside Wireman (Electrical) Apprenticeship
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Comprehensive training in electrical systems installation, maintenance, and troubleshooting. Learn commercial and industrial wiring, motor controls, and fire alarm systems. Graduates are well-prepared for roles as Inside Wiremen, Residential Wiremen, and more.
                </p>
                <div className="flex items-center text-[#002c5c] font-semibold group-hover:gap-3 transition-all">
                  <span>Learn More</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Program 2 - Intelligent Transportation Systems */}
            <div className={`group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#81c341] transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 ${isProgramsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'} transition-all duration-1000 delay-800`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#81c341]/10 to-transparent rounded-bl-full"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#81c341] to-[#81c341]/80 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-[#81c341] transition-colors">
                  Intelligent Transportation Systems Apprenticeship
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  This scope of work covers street lighting, traffic signals, and intelligent freeway systems. The majority of conduit and wire is installed underground, requiring digging, boring, removal of street surface and restoration of street surface.
                </p>
                <div className="flex items-center text-[#81c341] font-semibold group-hover:gap-3 transition-all">
                  <span>Learn More</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Program 3 - Sound and Telecommunications */}
            <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#002c5c] transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#002c5c]/10 to-transparent rounded-bl-full"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#002c5c] to-[#002c5c]/80 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-[#002c5c] transition-colors">
                  Sound and Telecommunications Apprenticeship
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Focused on low-voltage systems, including sound, data, and video installations. Ideal for those pursuing careers as Sound and Telecommunications Technicians.
                </p>
                <div className="flex items-center text-[#002c5c] font-semibold group-hover:gap-3 transition-all">
                  <span>Learn More</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Program 4 - Continuing Education */}
            <div className={`group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#81c341] transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 ${isProgramsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'} transition-all duration-1000 delay-1200`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#81c341]/10 to-transparent rounded-bl-full"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#81c341] to-[#81c341]/80 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-[#81c341] transition-colors">
                  Continuing Education
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  For professionals looking to advance their skills and stay current with industry trends and technologies. Includes electric vehicle infrastructure, smart building automation, and renewable energy systems.
                </p>
                <div className="flex items-center text-[#81c341] font-semibold group-hover:gap-3 transition-all">
                  <span>Learn More</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section id="careers-section" className="py-20 px-6 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-0 w-96 h-96 bg-[#002c5c]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <div className="absolute bottom-20 right-0 w-96 h-96 bg-[#81c341]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className={`inline-block px-6 py-2 bg-gradient-to-r from-[#002c5c]/10 to-[#81c341]/10 rounded-full mb-6 transition-all duration-1000 ${isCareersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              <span className="text-sm font-semibold text-[#002c5c]">CAREERS</span>
            </div>
            <h2 className={`text-5xl font-bold mb-6 bg-gradient-to-r from-[#002c5c] to-[#81c341] bg-clip-text text-transparent transition-all duration-1000 delay-200 ${isCareersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              Explore Your Career Path
            </h2>
            <p className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-400 ${isCareersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              Choose from our comprehensive apprenticeship programs designed to launch your career in the electrical and telecommunications industries
            </p>
          </div>

          {/* Inside Wireman */}
          <div className={`group bg-white rounded-3xl p-10 mb-10 border-2 border-gray-200 hover:border-[#002c5c] shadow-xl hover:shadow-2xl overflow-hidden relative transition-[opacity,transform,border-color,box-shadow] duration-1000 delay-600 hover:duration-300 ${isCareersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#002c5c]/10 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#002c5c] to-[#002c5c]/80 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Inside Wireman (Electrical) Apprenticeship Program</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      5 Years
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      8,000 Hours OJT
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gradient-to-br from-[#002c5c]/5 to-[#81c341]/5 rounded-xl p-6 border border-[#002c5c]/20">
                  <h4 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <Target className="w-6 h-6 text-[#002c5c]" />
                    Program Overview
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#81c341] mt-0.5 flex-shrink-0" />
                      <span><strong>Duration:</strong> 5 years</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#81c341] mt-0.5 flex-shrink-0" />
                      <span><strong>Accreditation:</strong> Approved by California Division of Apprenticeship Standards and Department of Labor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#81c341] mt-0.5 flex-shrink-0" />
                      <span><strong>Training:</strong> 8,000 hours OJT + 1,020 hours classroom</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-[#81c341]/5 to-[#002c5c]/5 rounded-xl p-6 border border-[#81c341]/20">
                  <h4 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-[#81c341]" />
                    On-the-Job Training
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#002c5c] mt-0.5 flex-shrink-0" />
                      <span>Work with Journeyman Wiremen, rotating annually</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#002c5c] mt-0.5 flex-shrink-0" />
                      <span>Electrical Training Institute handles contractor assignments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#002c5c] mt-0.5 flex-shrink-0" />
                      <span>Gain diverse experience across commercial, industrial, and residential projects</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#002c5c] to-[#81c341] rounded-2xl p-8 text-white mb-6">
                <h4 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <BookOpen className="w-7 h-7" />
                  Classroom Instruction
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <h5 className="font-bold mb-2">First 3 Years</h5>
                    <p className="text-white/90 text-sm">Attend classes twice a week (lecture and hands-on practice). Pass assessments to advance.</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <h5 className="font-bold mb-2">Last 2 Years</h5>
                    <p className="text-white/90 text-sm">Specialized courses: EVITP, CALCTP, ESAMTAC, and Project Supervision.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <h4 className="text-2xl font-bold mb-6 text-gray-900">Career Description</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#002c5c] rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h5 className="font-semibold mb-1 text-gray-900">Installing & Maintaining Electrical Systems</h5>
                        <p className="text-sm text-gray-600">Install lighting, receptacles, motors, fire alarms, and green technology systems.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#81c341] rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h5 className="font-semibold mb-1 text-gray-900">Conduit & Underground Systems</h5>
                        <p className="text-sm text-gray-600">Install conduit, raceway, and underground systems for electrical projects.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#002c5c] rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h5 className="font-semibold mb-1 text-gray-900">Planning & Project Management</h5>
                        <p className="text-sm text-gray-600">Establish temporary power, manage distribution, and design grounding systems.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#81c341] rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h5 className="font-semibold mb-1 text-gray-900">Troubleshooting & Repair</h5>
                        <p className="text-sm text-gray-600">Repair wiring and troubleshoot electrical systems for safe operation.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Intelligent Transportation Systems */}
          <div className={`group bg-white rounded-3xl p-10 mb-10 border-2 border-gray-200 hover:border-[#81c341] shadow-xl hover:shadow-2xl overflow-hidden relative transition-[opacity,transform,border-color,box-shadow] duration-1000 delay-800 hover:duration-300 ${isCareersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#81c341]/10 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#81c341] to-[#81c341]/80 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Intelligent Transportation Systems Apprenticeship Program</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      4 Years
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      6,400 Hours OJT
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gradient-to-br from-[#81c341]/5 to-[#002c5c]/5 rounded-xl p-6 border border-[#81c341]/20">
                  <h4 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <Target className="w-6 h-6 text-[#81c341]" />
                    Program Overview
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#81c341] mt-0.5 flex-shrink-0" />
                      <span><strong>Duration:</strong> 4 years</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#81c341] mt-0.5 flex-shrink-0" />
                      <span><strong>Training:</strong> 6,400 hours OJT + 802 hours classroom</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-[#002c5c]/5 to-[#81c341]/5 rounded-xl p-6 border border-[#002c5c]/20">
                  <h4 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <Users className="w-6 h-6 text-[#002c5c]" />
                    On-the-Job Training
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#002c5c] mt-0.5 flex-shrink-0" />
                      <span>Work with Journeyman Transportation Systems Electrician, rotating annually to gain diverse electrical skills</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#002c5c] mt-0.5 flex-shrink-0" />
                      <span>Electrical Training Institute handles contractor assignments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#002c5c] mt-0.5 flex-shrink-0" />
                      <span>Hands-on experience with traffic signals, street lighting, and intelligent freeway systems</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#81c341] to-[#002c5c] rounded-2xl p-8 text-white">
                <h4 className="text-2xl font-bold mb-6">Career Description</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <h5 className="font-bold mb-2">Project Layout & Planning</h5>
                    <p className="text-white/90 text-sm">Reading blueprints, municipal specifications, coordination with authorities.</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <h5 className="font-bold mb-2">Underground Installations</h5>
                    <p className="text-white/90 text-sm">Trenching, boring, pot holing, direct burial, conduit installation.</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <h5 className="font-bold mb-2">Special Systems</h5>
                    <p className="text-white/90 text-sm">Traffic detection, fiber optics, CCTV, photovoltaic, restoration.</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <h5 className="font-bold mb-2">Testing & Troubleshooting</h5>
                    <p className="text-white/90 text-sm">Circuit testing, continuity checks, fault identification, repairs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sound & Telecommunications */}
          <div className={`group bg-white rounded-3xl p-10 border-2 border-gray-200 hover:border-[#002c5c] shadow-xl hover:shadow-2xl overflow-hidden relative transition-[opacity,transform,border-color,box-shadow] duration-1000 delay-1000 hover:duration-300 ${isCareersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#002c5c]/10 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#002c5c] to-[#002c5c]/80 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Sound & Telecommunications Technician Apprenticeship Program</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      4 Years
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      6,400 Hours OJT
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gradient-to-br from-[#002c5c]/5 to-[#81c341]/5 rounded-xl p-6 border border-[#002c5c]/20">
                  <h4 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <Target className="w-6 h-6 text-[#002c5c]" />
                    Program Overview
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#81c341] mt-0.5 flex-shrink-0" />
                      <span><strong>Duration:</strong> 4 years</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#81c341] mt-0.5 flex-shrink-0" />
                      <span><strong>Training:</strong> 6,400 hours OJT + 800 hours classroom</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-[#81c341]/5 to-[#002c5c]/5 rounded-xl p-6 border border-[#81c341]/20">
                  <h4 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <Users className="w-6 h-6 text-[#81c341]" />
                    On-the-Job Training
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#81c341] mt-0.5 flex-shrink-0" />
                      <span>Work under journeyman sound electricians, rotating contractors annually</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#81c341] mt-0.5 flex-shrink-0" />
                      <span>Managed by the Electrical Training Institute</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#81c341] mt-0.5 flex-shrink-0" />
                      <span>Learn installation and maintenance of audio, video, and telecommunications systems</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#002c5c] to-[#81c341] rounded-2xl p-8 text-white">
                <h4 className="text-2xl font-bold mb-6">Career Description</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <h5 className="font-bold mb-2">Installation & Setup</h5>
                    <p className="text-white/90 text-sm">Audio/video systems, telecommunications, life safety systems, access control.</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <h5 className="font-bold mb-2">Maintenance & Troubleshooting</h5>
                    <p className="text-white/90 text-sm">System maintenance, diagnostics, calibration, performance optimization.</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <h5 className="font-bold mb-2">System Design & Integration</h5>
                    <p className="text-white/90 text-sm">Custom system design, integration, compliance with codes and standards.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Veterans Section */}
      <section id="veterans-section" className="py-20 px-6 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#002c5c]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#81c341]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className={`inline-block px-6 py-2 bg-gradient-to-r from-[#002c5c]/10 to-[#81c341]/10 rounded-full mb-6 transition-all duration-1000 ${isVeteransVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              <span className="text-sm font-semibold text-[#002c5c]">VETERANS</span>
            </div>
            <h2 className={`text-5xl font-bold mb-6 bg-gradient-to-r from-[#002c5c] to-[#81c341] bg-clip-text text-transparent transition-all duration-1000 delay-200 ${isVeteransVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              Military Experience Gives You A Head Start
            </h2>
            <p className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-400 ${isVeteransVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              Your military service has prepared you for success. Transition your skills into a rewarding career with ETI.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Left Column - Benefits */}
            <div className="space-y-6">
              <div className={`bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 transition-all duration-1000 delay-600 ${isVeteransVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#002c5c] to-[#002c5c]/80 rounded-xl flex items-center justify-center shadow-lg">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Why Veterans Excel</h3>
                </div>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  You&apos;ve already honed your technical skills. Why start your career from scratch when you leave the military? Use those skills to advance your career right now through the Electrical Training Institute of San Diego and Imperial Counties.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#002c5c]/5 to-transparent rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-[#81c341] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">V.A. Benefits Approved</h4>
                      <p className="text-gray-600 text-sm">Our programs are approved for V.A. benefits</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#81c341]/5 to-transparent rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-[#002c5c] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Guaranteed Interview</h4>
                      <p className="text-gray-600 text-sm">Honorably discharged applicants qualify regardless of aptitude test score</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#002c5c]/5 to-transparent rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-[#81c341] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Ideal Candidates</h4>
                      <p className="text-gray-600 text-sm">Military experience brings drive, commitment, and work ethic</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Application Requirements */}
            <div>
              <div className={`bg-gradient-to-br from-[#002c5c] to-[#81c341] rounded-2xl p-8 text-white shadow-xl transition-all duration-1000 delay-800 ${isVeteransVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Helmets To Hardhats</h3>
                </div>
                <p className="text-white/95 mb-6 text-lg">
                  Application Requirements For Inside Wireman and Telecommunications Programs
                </p>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-white mt-0.5 flex-shrink-0" />
                      <p className="text-white/95 text-sm">
                        Honorably discharged military veterans qualify for a guaranteed interview (must apply within five (5) years from the discharge date with your DD-214).
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-white mt-0.5 flex-shrink-0" />
                      <p className="text-white/95 text-sm">
                        Veteran applicants are still required to sit for an aptitude exam, but their results will not affect their eligibility for interview.
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-white mt-0.5 flex-shrink-0" />
                      <p className="text-white/95 text-sm">
                        Applicants who have served overseas and/or lived on base for a minimum of two (2) years prior to application will have any existing restriction waived.
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-white mt-0.5 flex-shrink-0" />
                      <p className="text-white/95 text-sm">
                        At time of application, please submit your DD-214 along with an officially-sealed high school transcript and all other required documents.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className={`bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg transition-all duration-1000 delay-1000 ${isVeteransVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-6">
                Please visit our career opportunities page to learn more about the different programs we offer and go to <strong>Helmets To Hardhats</strong> to register.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="px-8 py-4 bg-gradient-to-r from-[#002c5c] to-[#81c341] text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all transform hover:scale-105">
                  View Career Opportunities
                </button>
                <button className="px-8 py-4 bg-white border-2 border-[#002c5c] text-[#002c5c] rounded-lg font-semibold text-lg hover:bg-[#002c5c] hover:text-white transition-all transform hover:scale-105">
                  Visit Helmets To Hardhats
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta-section" className="py-20 px-6 bg-gradient-to-r from-[#002c5c] to-[#81c341]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-5xl font-bold text-white mb-6 transition-all duration-1000 delay-200 ${isCTAVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Your AI-powered learning companion
          </h2>
          <button className={`px-8 py-4 bg-white text-[#002c5c] rounded-lg font-semibold text-lg hover:shadow-2xl transition-all transform hover:scale-105 ${isCTAVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-400`}>
            APPLY NOW
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#002c5c] to-[#81c341] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 mb-12">
            <div>
              <h3 className="font-semibold mb-4">ETI Assistant</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li><a href="#" className="hover:underline">About</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li><a href="#" className="hover:underline">AI Chat</a></li>
                <li><a href="#" className="hover:underline">Document Upload</a></li>
                <li><a href="#" className="hover:underline">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li><a href="#" className="hover:underline">For Teams</a></li>
                <li><a href="#" className="hover:underline">For Enterprise</a></li>
                <li><a href="#" className="hover:underline">For Startups</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li><a href="#" className="hover:underline">Blog</a></li>
                <li><a href="#" className="hover:underline">Help Center</a></li>
                <li><a href="#" className="hover:underline">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li><a href="#" className="hover:underline">Documentation</a></li>
                <li><a href="#" className="hover:underline">API</a></li>
                <li><a href="#" className="hover:underline">Templates</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Integrations</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li><a href="#" className="hover:underline">Slack</a></li>
                <li><a href="#" className="hover:underline">Microsoft</a></li>
                <li><a href="#" className="hover:underline">Google</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Mobile Apps</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li><a href="#" className="hover:underline">iOS App</a></li>
                <li><a href="#" className="hover:underline">Android App</a></li>
                <li><a href="#" className="hover:underline">Desktop App</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <img src="/eti_logo.png" alt="ETI" className="w-8 h-8" />
              <span className="font-semibold">ETI Assistant</span>
            </div>
            <div className="flex gap-6 text-sm opacity-90">
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Terms</a>
              <a href="#" className="hover:underline">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

