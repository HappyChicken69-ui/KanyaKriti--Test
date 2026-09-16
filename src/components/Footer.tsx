import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Compass,
  Mic,
  ShoppingBag,
  Bike,
  Shield,
  Database,
  Award,
} from 'lucide-react';
import { LotusLogo } from './LotusLogo.tsx';

interface FooterProps {
  onOpenVoiceModal?: () => void;
  onOpenDemoTour?: () => void;
  onSelectRole?: (role: 'artisan' | 'buyer' | 'runner' | 'admin') => void;
  onSelectTab?: (tab: 'home' | 'artisan' | 'buyer' | 'runner' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenVoiceModal,
  onOpenDemoTour,
  onSelectRole,
  onSelectTab,
}) => {
  return (
    <footer className="bg-[#FAF3F0] border-t border-rose-200/70 text-stone-600 text-xs">
      {/* Top Banner: Mission Highlight */}
      <div className="bg-[#FFF8FA] border-b border-rose-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <LotusLogo className="w-9 h-9 shrink-0" />
            <div>
              <div className="text-sm font-bold text-[#4A1525] font-serif tracking-tight">
                KanyaKriti • Women Empowerment Through Voice-First AI
              </div>
              <p className="text-[11px] text-stone-500">
                Unlocking the invisible home economy for neighborhood women makers.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {onOpenVoiceModal && (
              <button
                type="button"
                onClick={onOpenVoiceModal}
                className="px-4 py-2 rounded-full bg-[#C84B68] hover:bg-[#B33956] text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Mic className="w-3.5 h-3.5 text-white" />
                <span>Try Voice Onboarding</span>
              </button>
            )}
            {onOpenDemoTour && (
              <button
                type="button"
                onClick={onOpenDemoTour}
                className="px-4 py-2 rounded-full bg-white hover:bg-rose-50 text-[#86293D] border border-[#E8A5B5] font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Compass className="w-3.5 h-3.5 text-[#C84B68]" />
                <span>3-Min Demo Walkthrough</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Multi-Column Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1: Mission & Brand */}
          <div className="space-y-3">
            <div className="text-sm font-bold text-[#4A1525] font-serif">
              Our Mission
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              KanyaKriti is dedicated to bringing financial dignity and sustainable livelihood to neighborhood women artisans across urban India. Through voice-first AI in local mother tongues and zero-commission milestones, we turn household craft into real income.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] text-[#86293D] font-medium">
              <Award className="w-4 h-4 text-[#C84B68] shrink-0" />
              <span>0% Take-Rate on First ₹1,000 Milestone</span>
            </div>
          </div>

          {/* Col 2: Platform Views */}
          <div className="space-y-3">
            <div className="text-sm font-bold text-[#4A1525] font-serif">
              Platform
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab?.('home')}
                  className="hover:text-[#86293D] transition-colors cursor-pointer flex items-center gap-1.5 text-stone-600"
                >
                  <span>• Home & Mission Story</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectRole?.('artisan');
                    onSelectTab?.('artisan');
                  }}
                  className="hover:text-[#86293D] transition-colors cursor-pointer flex items-center gap-1.5 text-stone-600"
                >
                  <Sparkles className="w-3 h-3 text-[#C84B68]" />
                  <span>Artisan Storefront (Sunita Devi)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectRole?.('buyer');
                    onSelectTab?.('buyer');
                  }}
                  className="hover:text-[#86293D] transition-colors cursor-pointer flex items-center gap-1.5 text-stone-600"
                >
                  <ShoppingBag className="w-3 h-3 text-[#86293D]" />
                  <span>Buyer Discovery & Map (Priya)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectRole?.('runner');
                    onSelectTab?.('runner');
                  }}
                  className="hover:text-[#86293D] transition-colors cursor-pointer flex items-center gap-1.5 text-stone-600"
                >
                  <Bike className="w-3 h-3 text-[#4A1525]" />
                  <span>Runner Logistics View (Ramesh)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectRole?.('admin');
                    onSelectTab?.('admin');
                  }}
                  className="hover:text-[#86293D] transition-colors cursor-pointer flex items-center gap-1.5 text-stone-600"
                >
                  <Shield className="w-3 h-3 text-stone-600" />
                  <span>Platform Operations / Admin</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Women Empowerment Highlights */}
          <div className="space-y-3">
            <div className="text-sm font-bold text-[#4A1525] font-serif">
              Empowerment
            </div>
            <ul className="space-y-2 text-xs text-stone-600">
              <li className="flex items-start gap-1.5">
                <span className="text-[#C84B68] font-bold">•</span>
                <span><strong>Voice-First:</strong> Speak in Hindi, Kannada, Tamil, Marathi, Bengali, Telugu, English.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#C84B68] font-bold">•</span>
                <span><strong>Zero Paperwork:</strong> No GST or catalog spreadsheets needed.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#C84B68] font-bold">•</span>
                <span><strong>Hyperlocal Radius:</strong> Orders within 3–5 km to prevent shipping stress.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#C84B68] font-bold">•</span>
                <span><strong>Instant UPI:</strong> Payouts reach her own bank account without 30-day holds.</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Technology & Architecture */}
          <div className="space-y-3">
            <div className="text-sm font-bold text-[#4A1525] font-serif">
              Technology Stack
            </div>
            <ul className="space-y-2 text-xs text-stone-600">
              <li className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-[#C84B68]" />
                <span>MongoDB Atlas (Identity & Collections)</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#86293D]" />
                <span>AI Pipeline (Whisper-large-v3 & LLaMA 3.3)</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4A1525]" />
                <span>Node.js / Express Server-Side RBAC</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C84B68]" />
                <span>Server-Sent Events (SSE) Realtime</span>
              </li>
              <li className="text-[11px] text-stone-500 pt-1">
                Zero external proprietary BaaS dependencies. 100% MongoDB.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Identity Bar */}
      <div className="border-t border-rose-200/80 bg-[#FAF0ED] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
          <div className="flex items-center gap-2">
            <LotusLogo className="w-4 h-4 shrink-0" />
            <span className="font-semibold text-[#4A1525]">KanyaKriti</span>
            <span>— Your Skill. Your Voice. Your Local Market.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#86293D] font-medium">MongoDB Database Active</span>
            <span>•</span>
            <span>AI Multilingual (23 Languages)</span>
            <span>•</span>
            <span>Hyperlocal Commerce Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
