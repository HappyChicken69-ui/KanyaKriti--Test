import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Compass,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Mic,
  Sparkles,
  ShoppingBag,
  Bike,
  Award,
  ArrowRight,
} from 'lucide-react';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep: (stepIndex: number) => void;
}

const TOUR_STEPS = [
  {
    title: '1. Voice-First Skill Studio',
    subtitle: 'Zero Typing Required',
    icon: Mic,
    color: 'amber',
    description:
      'Women artisans speak naturally in Hindi, Hinglish, or English. KanyaKriti uses Gemini 3.8 to extract skill title, price, category, and turnaround hours without complex forms.',
    actionText: 'Try "Speak Your Skill" button',
  },
  {
    title: '2. AI Extraction & Shoppable Listing',
    subtitle: 'Human-in-the-Loop Confirmation',
    icon: Sparkles,
    color: 'amber',
    description:
      'The platform shows "Here\'s what we understood" with an explicit confidence score and manual adjustment fallback. Once confirmed, Gemini crafts a high-converting, grounded marketplace listing.',
    actionText: 'Review and publish the listing',
  },
  {
    title: '3. Hyperlocal Matching Engine',
    subtitle: 'Transparent Multi-Factor Scoring',
    icon: ShoppingBag,
    color: 'blue',
    description:
      'Switch to Buyer mode (Priya Sharma). Search natural language prompts like "blouse alteration tomorrow". The engine ranks artisans via: 40% Skill + 35% Distance + 15% Rating + 10% Budget fit.',
    actionText: 'Explore match cards and Leaflet map',
  },
  {
    title: '4. Order State Machine & Live Delivery',
    subtitle: 'Track Runner on Map',
    icon: Bike,
    color: 'emerald',
    description:
      'Switch to Runner mode (Ramesh Kumar). Accept the ready order, initiate delivery, and watch simulated real-time GPS movement toward the customer destination on OpenStreetMap.',
    actionText: 'Accept and complete delivery',
  },
  {
    title: '5. First ₹1,000 Milestone',
    subtitle: 'The North Star Metric',
    icon: Award,
    color: 'purple',
    description:
      'Once delivered, the artisan receives 95% of the fee (5% platform commission). Track the North Star Metric bar towards the first ₹1,000 earnings, triggering celebratory confetti!',
    actionText: 'Inspect Maker Earnings Dashboard',
  },
];

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  isOpen,
  onClose,
  onJumpToStep,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentIdx];
  const IconComponent = step.icon;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      style={{ zIndex: 99999 }}
    >
      <div className="relative w-full max-w-lg bg-white border border-rose-100 rounded-3xl shadow-2xl text-stone-800 overflow-hidden">
        {/* Header bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#FFF9F6] via-white to-[#FFF5F7] border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FFF0F3] text-[#86293D] border border-rose-200/80 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#4A1525] font-serif">Interactive 3-Minute Demo Walkthrough</h3>
              <p className="text-stone-500 text-xs">Step-by-step judge and reviewer guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-[#4A1525] hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Body */}
        <div className="p-6 bg-[#FAF7F5]/40">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF0F3] border border-rose-200/80 text-[#C84B68] flex items-center justify-center shrink-0 shadow-2xs">
              <IconComponent className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#86293D] font-bold">
                Step {currentIdx + 1} of {TOUR_STEPS.length}
              </div>
              <h4 className="text-lg font-bold text-[#4A1525] font-serif">{step.title}</h4>
              <p className="text-stone-500 text-xs font-medium">{step.subtitle}</p>
            </div>
          </div>

          <p className="text-stone-700 text-sm leading-relaxed mb-6 bg-white p-4 rounded-2xl border border-rose-100/90 shadow-2xs">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === currentIdx ? 'w-8 bg-[#C84B68]' : 'w-2 bg-rose-200 hover:bg-rose-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-rose-100">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl text-stone-500 hover:text-[#4A1525] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              type="button"
              onClick={() => {
                onJumpToStep(currentIdx);
                if (currentIdx < TOUR_STEPS.length - 1) {
                  setCurrentIdx((i) => i + 1);
                } else {
                  onClose();
                }
              }}
              className="flex items-center gap-2 bg-[#C84B68] hover:bg-[#B33956] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <span>{currentIdx === TOUR_STEPS.length - 1 ? 'Start Exploring' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
