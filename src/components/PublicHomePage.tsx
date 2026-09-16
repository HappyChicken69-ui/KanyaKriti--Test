import React, { useState } from 'react';
import {
  Mic,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Compass,
  Award,
  ChevronRight,
  Zap,
  Globe,
  ChevronDown,
  XCircle,
  Star,
  Bike,
  Volume2,
  Heart,
  Palette,
} from 'lucide-react';
import { Listing, ArtisanProfile } from '../types.ts';
import { AuthViewMode } from './AuthModal.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { ARTISAN_VOICE_QUOTES } from '../data/languages.ts';
import { LotusLogo } from './LotusLogo.tsx';

interface PublicHomePageProps {
  listings: Listing[];
  artisans: ArtisanProfile[];
  onOpenVoiceModal: () => void;
  onExploreArtisans: () => void;
  onOpenAuthModal: (mode?: AuthViewMode) => void;
  onOpenDemoTour: () => void;
  onSwitchToPersona: (role: 'artisan' | 'buyer' | 'runner') => void;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  listings,
  artisans,
  onOpenVoiceModal,
  onExploreArtisans,
  onOpenAuthModal,
  onOpenDemoTour,
  onSwitchToPersona,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const { selectedLanguageCode, setLanguageCode, supportedLanguages } = useLanguage();
  const activeQuote = ARTISAN_VOICE_QUOTES[selectedLanguageCode] || ARTISAN_VOICE_QUOTES.en;

  const faqs = [
    {
      q: 'Does an artisan need to know English or how to type?',
      a: 'Not at all. KanyaKriti is built 100% voice-first. An artisan taps the microphone and speaks in her natural mother tongue across 23 regional Indian languages. AI transcribes her audio, extracts her craft, prices it fairly, and creates a shoppable listing in seconds.',
    },
    {
      q: 'Why the ₹1,000 Milestone? Is there really zero platform fee?',
      a: 'Yes. Earning the first ₹1,000 from home is the psychological and financial breakthrough that transforms a homemaker into an independent micro-entrepreneur. To celebrate this milestone, KanyaKriti charges 0% commission on every single rupee until she reaches ₹1,000.',
    },
    {
      q: 'How does hyperlocal pickup and delivery work?',
      a: 'When a neighbor orders an alteration, handicraft, or meal within 3-5 km, a neighborhood runner on an electric two-wheeler is assigned. They pick up the item directly from the artisan’s doorstep and hand-deliver it to the buyer with live GPS tracking in under 60 minutes.',
    },
    {
      q: 'How do artisans receive their earnings?',
      a: 'Earnings are transferred directly and instantly to the artisan’s UPI ID or bank account. There are no 30-day payout holds or hidden payment processor deductions.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* ============================================================ */}
      {/* SECTION 1: HERO (MATCHING REFERENCE DESIGN) */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#FFF5F7]/90 via-[#FAF7F5] to-[#FAF7F5] border border-rose-100/90 p-6 sm:p-10 lg:p-14 shadow-sm">
        {/* Soft decorative background glow elements */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[32rem] h-[32rem] rounded-full bg-rose-200/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-amber-100/30 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto space-y-10">
          {/* Top row: 2-column layout (Text + Artwork) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Mission Badge with Lotus */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDF0F3] border border-[#F3CCD4] text-[#86293D] text-xs font-semibold shadow-2xs">
                <LotusLogo className="w-4 h-4 text-[#C84B68]" />
                <span>Voice-First AI • Hyperlocal Women Micro-Entrepreneurs</span>
              </div>

              {/* Editorial Serif Main Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#4A1525] leading-[1.12]">
                Your Skill. Your Voice. <br />
                <span className="text-[#86293D]">Your Local Market.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#6E555B] font-normal leading-relaxed max-w-xl">
                Empowering neighborhood women makers, home cooks, and tailors to turn their talents
                into financial independence — starting with their very first ₹1,000, zero typing,
                and 100% voice-first in their mother tongue.
              </p>

              {/* Dual Primary & Secondary CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                {/* Primary CTA - Rose Filled Pill */}
                <button
                  type="button"
                  onClick={onOpenVoiceModal}
                  className="px-6 py-3.5 rounded-full bg-[#C84B68] hover:bg-[#B33956] text-white font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                >
                  <Mic className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                  <span>Try Voice Onboarding</span>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full text-white font-medium">
                    Speak 30s
                  </span>
                </button>

                {/* Secondary CTA - Ivory/White with Rose Border */}
                <button
                  type="button"
                  onClick={onExploreArtisans}
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-rose-50/80 text-[#86293D] font-bold text-sm border border-[#E8A5B5] shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#C84B68]" />
                  <span>Explore Local Makers Nearby</span>
                </button>
              </div>
            </div>

            {/* Right Artwork Column - Indian Artisan Woman with Lotus Aesthetic */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <div className="relative w-full max-w-sm sm:max-w-md aspect-square rounded-3xl overflow-hidden border border-rose-100 shadow-sm bg-gradient-to-tr from-rose-50 via-white to-rose-100/60 p-2">
                <img
                  src="/src/assets/images/artisan_woman_lotus_1789572617750.jpg"
                  alt="Indian artisan woman draped in elegant rose saree with blooming lotus flowers"
                  className="w-full h-full object-cover rounded-2xl"
                />
                {/* Subtle corner badge */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-rose-100 shadow-xs flex items-center gap-1.5 text-[11px] font-semibold text-[#86293D]">
                  <Sparkles className="w-3 h-3 text-[#C84B68]" />
                  <span>Empowering 100+ Local Makers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Centered Voice / Artisan Prompt Card (Exactly Matching Reference) */}
          <div className="pt-2 max-w-3xl mx-auto">
            <div className="bg-white/95 rounded-3xl border border-rose-100/90 shadow-sm p-5 sm:p-6 text-left space-y-4">
              {/* Header Row: Voice Icon + Title on Left, Language Dropdown on Right */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center text-[#C84B68] shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#4A1525]">
                    Hear Real Artisan Voice Prompts:
                  </h3>
                </div>

                {/* 23-Language Selector Dropdown */}
                <div className="relative inline-flex items-center">
                  <label htmlFor="artisan-voice-language-select" className="sr-only">
                    Select Mother Tongue Language
                  </label>
                  <Globe className="w-3.5 h-3.5 text-[#C84B68] absolute left-3 pointer-events-none" />
                  <select
                    id="artisan-voice-language-select"
                    value={selectedLanguageCode}
                    onChange={(e) => setLanguageCode(e.target.value)}
                    aria-label="Select Mother Tongue Language (22 Scheduled Indian Languages + English)"
                    className="w-full sm:w-auto bg-[#FAF7F5] hover:bg-rose-50/50 text-[#4A1525] text-xs font-semibold pl-8 pr-8 py-1.5 rounded-full border border-rose-200/80 hover:border-rose-300 focus:border-[#C84B68] focus:outline-none focus:ring-1 focus:ring-[#C84B68]/30 appearance-none cursor-pointer transition-colors shadow-2xs"
                  >
                    {supportedLanguages.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-white text-stone-800 py-1">
                        {lang.name} — {lang.nativeName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Voice Quote in Italic */}
              <div className="text-xs sm:text-sm text-stone-700 italic leading-relaxed font-serif">
                {activeQuote.text}
              </div>

              {/* Translation Text */}
              <div className="text-[11px] text-[#86293D] font-medium">
                Translation: {activeQuote.translation}
              </div>

              {/* Footer Row: Artisan Name on Left, AI Transcribed Status on Right */}
              <div className="pt-2 border-t border-rose-50 flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">{activeQuote.author}</span>
                <span className="text-[#C84B68] font-semibold flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C84B68]" />
                  <span>AI Transcribed</span>
                </span>
              </div>
            </div>
          </div>

          {/* 4 Feature Statistics Cards (Evenly Aligned Row) */}
          <div className="pt-2 grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {/* 1. 0% Fee */}
            <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-[#C84B68]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-serif text-[#4A1525]">0% Fee</div>
                <div className="text-xs font-semibold text-stone-700 mt-0.5">On First ₹1,000</div>
                <div className="text-[10px] text-stone-500">100% kept by maker</div>
              </div>
            </div>

            {/* 2. < 60 Mins */}
            <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-[#C84B68]">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-serif text-[#4A1525]">&lt; 60 Mins</div>
                <div className="text-xs font-semibold text-stone-700 mt-0.5">Hyperlocal Delivery</div>
                <div className="text-[10px] text-stone-500">Electric runner pickup</div>
              </div>
            </div>

            {/* 3. Voice-Only */}
            <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-[#C84B68]">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-serif text-[#4A1525]">Voice-Only</div>
                <div className="text-xs font-semibold text-stone-700 mt-0.5">No Typing Required</div>
                <div className="text-[10px] text-stone-500">23 regional languages</div>
              </div>
            </div>

            {/* 4. Verified */}
            <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-[#C84B68]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold font-serif text-[#4A1525]">Verified</div>
                <div className="text-xs font-semibold text-stone-700 mt-0.5">Neighborhood Trust</div>
                <div className="text-[10px] text-stone-500">Direct doorstep UPI</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2: THE DIGITAL DIVIDE COMPARISON */}
      {/* ============================================================ */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-[#86293D]">
            The Digital Divide
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#4A1525] font-serif">
            Talent is everywhere. Digital access is not.
          </h2>
          <p className="text-sm text-[#6E555B]">
            India has millions of remarkably talented women creating at home, but legacy platforms were not built for them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Legacy E-commerce Pitfalls */}
          <div className="bg-white border border-rose-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full space-y-4 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold mb-3">
                <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Traditional E-Commerce & Aggregators</span>
              </div>
              <h3 className="text-lg font-bold text-[#4A1525] font-serif mb-4">
                Why home makers stay excluded:
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-stone-600">
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Complex English forms:</strong> Demanding GST certificates, catalog spreadsheets, and desktop portals.
                  </span>
                </li>
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Predatory 25%–40% cuts:</strong> Taking large slices of every item, leaving almost nothing for the artisan.
                  </span>
                </li>
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Delayed 30-day payouts:</strong> Locking up working capital she needs to buy thread, fabric, or groceries.
                  </span>
                </li>
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Distance blindness:</strong> Shipping across states instead of serving the neighbor 800 meters away.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* The KanyaKriti Voice Solution */}
          <div className="bg-[#FFF8FA] border border-rose-200/90 rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full space-y-4 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-[#86293D] text-xs font-bold mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C84B68] shrink-0" />
                <span>The KanyaKriti Voice-First Model</span>
              </div>
              <h3 className="text-lg font-bold text-[#4A1525] font-serif mb-4">
                How we remove every digital obstacle:
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-[#4A1525]">
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C84B68] shrink-0 mt-0.5" />
                  <span>
                    <strong>Speak 30 seconds:</strong> In Hindi, Kannada, Tamil, or any tongue. AI builds the listing instantly.
                  </span>
                </li>
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C84B68] shrink-0 mt-0.5" />
                  <span>
                    <strong>0% fee on first ₹1,000:</strong> 100% of the value stays in her purse to build confidence and financial dignity.
                  </span>
                </li>
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C84B68] shrink-0 mt-0.5" />
                  <span>
                    <strong>Instant UPI payouts:</strong> Money reaches her bank account immediately upon neighborhood delivery.
                  </span>
                </li>
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C84B68] shrink-0 mt-0.5" />
                  <span>
                    <strong>Hyperlocal 3-5 km matching:</strong> Neighbors support neighbors with doorstep runner pickup and delivery.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3: HOW IT WORKS (VOICE-TO-COMMERCE PIPELINE) */}
      {/* ============================================================ */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 text-stone-800 border border-rose-100 shadow-sm space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-[#86293D]">
            Voice-to-Commerce Pipeline
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#4A1525]">
            From 30 seconds of speech to doorstep earnings
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Watch how spoken voice turns into a verified hyperlocal order in 5 automated steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Step 1 */}
          <div className="bg-[#FAF7F5] border border-rose-100 rounded-2xl p-5 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-[#86293D] font-mono font-bold text-xs flex items-center justify-center">
              01
            </div>
            <div className="text-sm font-bold text-[#4A1525] flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-[#C84B68]" />
              <span>Voice Note</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              She speaks freely for 30s about her tailoring, cooking, or embroidery skills in her mother tongue.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FAF7F5] border border-rose-100 rounded-2xl p-5 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-[#86293D] font-mono font-bold text-xs flex items-center justify-center">
              02
            </div>
            <div className="text-sm font-bold text-[#4A1525] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#C84B68]" />
              <span>AI Extract</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Whisper & AI structure her listing: title, categories, pricing, and turnaround time.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#FAF7F5] border border-rose-100 rounded-2xl p-5 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-[#86293D] font-mono font-bold text-xs flex items-center justify-center">
              03
            </div>
            <div className="text-sm font-bold text-[#4A1525] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C84B68]" />
              <span>Local Discovery</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Buyers in her neighborhood (within 3–5 km) discover her live listing on the Leaflet map.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-[#FAF7F5] border border-rose-100 rounded-2xl p-5 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-[#86293D] font-mono font-bold text-xs flex items-center justify-center">
              04
            </div>
            <div className="text-sm font-bold text-[#4A1525] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#C84B68]" />
              <span>Runner Pickup</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Neighborhood runner picks up the garment or meal and delivers it directly to the customer.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-[#FAF7F5] border border-rose-100 rounded-2xl p-5 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-[#86293D] font-mono font-bold text-xs flex items-center justify-center">
              05
            </div>
            <div className="text-sm font-bold text-[#4A1525] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#C84B68]" />
              <span>Instant UPI</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Payment settles directly to her bank account, marching closer to the celebratory ₹1,000 milestone.
            </p>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onOpenDemoTour}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF3F0] hover:bg-rose-100/70 text-[#86293D] text-xs font-bold border border-rose-200 cursor-pointer transition-all shadow-2xs"
          >
            <Compass className="w-4 h-4 text-[#C84B68]" />
            <span>Watch the 3-Minute Guided Interactive Walkthrough</span>
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4: WOMEN EMPOWERMENT & IMPACT STORIES */}
      {/* ============================================================ */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-[#86293D]">
            Unlocking the Invisible Economy
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#4A1525] font-serif">
            Real Stories, Real Financial Independence
          </h2>
          <p className="text-sm text-[#6E555B]">
            Meet the neighborhood craftswomen and homemakers thriving on KanyaKriti.
          </p>
        </div>

        {/* 4 Maker Spotlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sunita */}
          <div className="bg-white border border-rose-100 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                  alt="Sunita Devi"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover border border-rose-200 shadow-2xs"
                />
                <div>
                  <h4 className="font-bold text-[#4A1525] font-serif text-sm">Sunita Devi</h4>
                  <p className="text-[11px] text-[#86293D] font-semibold">Master Tailor & Alterations</p>
                  <p className="text-[10px] text-stone-400">Sector 4, Local Neighborhood</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed italic">
                “I stitched blouses for 8 years for walk-in relatives. With KanyaKriti, I spoke 30 seconds into my phone and got 3 alteration orders the same day.”
              </p>
            </div>
            <div className="pt-3 border-t border-rose-50 flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#86293D]">₹950 Earned</span>
              <span className="text-stone-500 font-medium flex items-center gap-1">
                <span>38 Reviews</span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-0.5 text-[#4A1525] font-bold">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 4.9
                </span>
              </span>
            </div>
          </div>

          {/* Meenakshi */}
          <div className="bg-white border border-rose-100 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt="Meenakshi Sundaram"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover border border-rose-200 shadow-2xs"
                />
                <div>
                  <h4 className="font-bold text-[#4A1525] font-serif text-sm">Meenakshi S.</h4>
                  <p className="text-[11px] text-[#86293D] font-semibold">Home Kitchen & Tiffins</p>
                  <p className="text-[10px] text-stone-400">East Block, Neighborhood Kitchen</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed italic">
                “Cooking was always seen as household duty. Now, tech workers subscribe to my daily dal makhani and hot phulkas right from home.”
              </p>
            </div>
            <div className="pt-3 border-t border-rose-50 flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#86293D]">₹1,420 Earned</span>
              <span className="text-stone-500 font-medium flex items-center gap-1">
                <span>52 Orders</span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-0.5 text-[#4A1525] font-bold">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 5.0
                </span>
              </span>
            </div>
          </div>

          {/* Fatima */}
          <div className="bg-white border border-rose-100 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
                  alt="Fatima Bi"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover border border-rose-200 shadow-2xs"
                />
                <div>
                  <h4 className="font-bold text-[#4A1525] font-serif text-sm">Fatima Bi</h4>
                  <p className="text-[11px] text-[#86293D] font-semibold">Aari & Zari Embroidery</p>
                  <p className="text-[10px] text-stone-400">Market Lane, Traditional Hub</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed italic">
                “I never touched a computer. Speaking in Urdu was all it took. Brides from 3 km away now send me their bridal dupattas for gold zari borders.”
              </p>
            </div>
            <div className="pt-3 border-t border-rose-50 flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#86293D]">₹2,800 Earned</span>
              <span className="text-stone-500 font-medium flex items-center gap-1">
                <span>19 Orders</span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-0.5 text-[#4A1525] font-bold">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 4.9
                </span>
              </span>
            </div>
          </div>

          {/* Rekha */}
          <div className="bg-white border border-rose-100 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80"
                  alt="Rekha Sharma"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover border border-rose-200 shadow-2xs"
                />
                <div>
                  <h4 className="font-bold text-[#4A1525] font-serif text-sm">Rekha Sharma</h4>
                  <p className="text-[11px] text-[#86293D] font-semibold">Handmade Macrame & Decor</p>
                  <p className="text-[10px] text-stone-400">Green Avenue, Craft Quarter</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed italic">
                “KanyaKriti unlocked my confidence. Reaching my first ₹1,000 milestone proved to my family that my art has real commercial value.”
              </p>
            </div>
            <div className="pt-3 border-t border-rose-50 flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#86293D]">₹1,150 Earned</span>
              <span className="text-stone-500 font-medium flex items-center gap-1">
                <span>14 Orders</span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-0.5 text-[#4A1525] font-bold">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 4.8
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Aggregated Impact Numbers */}
        <div className="bg-white border border-rose-100 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-rose-100">
            <div className="pt-3 md:pt-0">
              <div className="text-3xl font-black text-[#4A1525] font-serif">100+</div>
              <div className="text-xs font-semibold text-stone-700 mt-1">Neighborhood Makers</div>
              <div className="text-[10px] text-stone-400">Active across local neighborhoods</div>
            </div>
            <div className="pt-3 md:pt-0">
              <div className="text-3xl font-black text-[#86293D] font-serif">₹4.8L+</div>
              <div className="text-xs font-semibold text-stone-700 mt-1">Earned by Women</div>
              <div className="text-[10px] text-stone-400">Directly into their UPI accounts</div>
            </div>
            <div className="pt-3 md:pt-0">
              <div className="text-3xl font-black text-[#4A1525] font-serif">94%</div>
              <div className="text-xs font-semibold text-stone-700 mt-1">Repeat Customer Rate</div>
              <div className="text-[10px] text-stone-400">Hyperlocal community loyalty</div>
            </div>
            <div className="pt-3 md:pt-0">
              <div className="text-3xl font-black text-[#C84B68] font-serif">0%</div>
              <div className="text-xs font-semibold text-stone-700 mt-1">First ₹1,000 Take-Rate</div>
              <div className="text-[10px] text-stone-400">Zero commission milestone pledge</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5: FIRST ₹1,000 MILESTONE PLEDGE */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-br from-[#581825] via-[#4A1525] to-[#3B0F1A] border border-[#722233] rounded-3xl p-6 sm:p-10 text-white space-y-6 shadow-md">
        <div className="max-w-3xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-rose-200 text-xs font-bold">
            <Award className="w-4 h-4 text-rose-300" />
            <span>The ₹1,000 Milestone Pledge</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold font-serif text-white">
            Why the first ₹1,000 transforms everything
          </h2>

          <p className="text-xs sm:text-sm text-rose-100/80 leading-relaxed max-w-2xl mx-auto">
            In micro-enterprise research across India, the first ₹1,000 represents the crucial tipping point between an informal hobby and a recognized business. Once a maker earns her first ₹1,000 with her own hands, household respect, digital confidence, and reinvestment take flight.
          </p>
        </div>

        {/* Visual Progress Bar Widget */}
        <div className="max-w-xl mx-auto bg-black/30 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-rose-100">Sunita Devi’s Milestone Progress</span>
            <span className="text-amber-300 font-mono">₹950 / ₹1,000 (95%)</span>
          </div>

          <div className="w-full h-3.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/20">
            <div
              className="h-full bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300 rounded-full transition-all duration-1000 shadow-md"
              style={{ width: '95%' }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-rose-200">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Just ₹50 remaining to achieve milestone!</span>
            </span>
            <span className="text-white font-bold bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
              0% Fee Applied
            </span>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => onSwitchToPersona('artisan')}
              className="px-5 py-2.5 rounded-full bg-[#C84B68] hover:bg-[#B33956] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>View Sunita Devi’s Live Maker Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6: FOR ARTISANS & FOR BUYERS (ALIGNED CARDS) */}
      {/* ============================================================ */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-[#86293D]">
            Two-Sided Community
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#4A1525] font-serif">
            Built for neighborhood makers and mindful buyers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* For Artisans */}
          <div className="bg-white border border-rose-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full shadow-2xs hover:shadow-sm transition-shadow">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-[#C84B68] flex items-center justify-center shrink-0">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#86293D] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 inline-block">
                    Artisans & Makers
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#4A1525] font-serif mt-1">
                    For Women Artisans & Makers
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mb-6 min-h-[2.75rem]">
                Start earning from home in 3 minutes with zero upfront costs and voice-first technology.
              </p>
              <ul className="space-y-4 text-xs sm:text-sm text-stone-700">
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C84B68] shrink-0 mt-0.5" />
                  <span>
                    <strong>Voice-first storefront:</strong> Speak your skills naturally in your mother tongue.
                  </span>
                </li>
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C84B68] shrink-0 mt-0.5" />
                  <span>
                    <strong>Hyperlocal doorstep orders:</strong> No packing boxes or shipping labels; local runners pick up.
                  </span>
                </li>
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C84B68] shrink-0 mt-0.5" />
                  <span>
                    <strong>100% earnings retained:</strong> Keep every single rupee up to your first ₹1,000 milestone.
                  </span>
                </li>
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C84B68] shrink-0 mt-0.5" />
                  <span>
                    <strong>Instant UPI payouts:</strong> Direct into your own bank account upon order completion.
                  </span>
                </li>
              </ul>
            </div>
            <div className="pt-8 mt-auto">
              <button
                type="button"
                onClick={() => onOpenAuthModal('artisan-login')}
                className="w-full h-12 py-3.5 rounded-full bg-[#C84B68] hover:bg-[#B33956] text-white font-bold text-xs cursor-pointer transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Join as Artisan / Maker</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* For Buyers */}
          <div className="bg-white border border-rose-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full shadow-2xs hover:shadow-sm transition-shadow">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-[#86293D] flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#86293D] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 inline-block">
                    Neighborhood Buyers
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#4A1525] font-serif mt-1">
                    For Neighborhood Buyers
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mb-6 min-h-[2.75rem]">
                Discover authentic craftswomen and home chefs right in your local neighborhood pincode.
              </p>
              <ul className="space-y-4 text-xs sm:text-sm text-stone-700">
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#86293D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Same-day alterations & repairs:</strong> Blouse, kurti, and suit alterations picked up from your door.
                  </span>
                </li>
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#86293D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Pure homestyle cooking:</strong> Clean, authentic tiffins cooked in neighborhood home kitchens.
                  </span>
                </li>
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#86293D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Sub-60 minute delivery:</strong> Local electric two-wheeler runners bring goods swiftly.
                  </span>
                </li>
                <li className="grid grid-cols-[1.25rem_1fr] items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#86293D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Direct community impact:</strong> 100% of your spend directly supports a local woman’s household.
                  </span>
                </li>
              </ul>
            </div>
            <div className="pt-8 mt-auto">
              <button
                type="button"
                onClick={() => onOpenAuthModal('buyer-login')}
                className="w-full h-12 py-3.5 rounded-full bg-[#86293D] hover:bg-[#722233] text-white font-bold text-xs cursor-pointer transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Browse & Order Nearby</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7: INTERACTIVE DEMO SANDBOX PREVIEW */}
      {/* ============================================================ */}
      <section className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-10 text-stone-800 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#86293D] border border-rose-200 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#C84B68]" />
              <span>Interactive Evaluation Sandbox</span>
            </div>
            <h3 className="text-2xl font-bold font-serif text-[#4A1525]">
              Test the full end-to-end workflow in Demo Mode
            </h3>
            <p className="text-xs text-stone-600 max-w-xl">
              Switch between personas in real-time to experience the entire loop: Voice Onboarding → Hyperlocal Discovery → Order Placement → Runner Pickup → ₹1,000 Milestone Celebration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onSwitchToPersona('artisan')}
              className="px-4 py-2 rounded-full bg-[#C84B68] hover:bg-[#B33956] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Artisan (Sunita)
            </button>
            <button
              type="button"
              onClick={() => onSwitchToPersona('buyer')}
              className="px-4 py-2 rounded-full bg-[#86293D] hover:bg-[#722233] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Buyer (Priya)
            </button>
            <button
              type="button"
              onClick={() => onSwitchToPersona('runner')}
              className="px-4 py-2 rounded-full bg-[#4A1525] hover:bg-[#3B0F1A] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Runner (Ramesh)
            </button>
            <button
              type="button"
              onClick={onOpenDemoTour}
              className="px-4 py-2 rounded-full bg-white hover:bg-rose-50 text-[#86293D] text-xs font-bold border border-rose-300 cursor-pointer shadow-2xs"
            >
              3-Min Tour
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8: FREQUENTLY ASKED QUESTIONS */}
      {/* ============================================================ */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-[#86293D]">
            Common Questions
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#4A1525] font-serif">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-rose-100 rounded-2xl overflow-hidden transition-colors shadow-2xs"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-[#4A1525] text-sm cursor-pointer hover:bg-rose-50/40"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-stone-400 transition-transform ${
                    activeFaq === idx ? 'rotate-90 text-[#C84B68]' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-4 text-xs text-stone-600 leading-relaxed border-t border-rose-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 9: FINAL COMMUNITY CTA */}
      {/* ============================================================ */}
      <section className="rounded-3xl bg-gradient-to-br from-[#581825] via-[#6B1D2F] to-[#4A1525] border border-rose-900/40 p-8 sm:p-14 text-center text-white space-y-6 shadow-xl">
        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 text-rose-200 flex items-center justify-center mx-auto shadow-md">
          <Mic className="w-7 h-7" />
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-bold font-serif text-white">
            Every woman has a skill the neighborhood needs.
          </h2>
          <p className="text-rose-100/90 text-xs sm:text-sm leading-relaxed">
            No paperwork. No forms. No barriers. Just 30 seconds of your voice to open your storefront today.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onOpenVoiceModal}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#C84B68] hover:bg-[#B33956] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Mic className="w-4 h-4 text-white" />
            <span>Speak Your Skills (Voice Onboard)</span>
          </button>
          <button
            type="button"
            onClick={onExploreArtisans}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-rose-50 text-[#86293D] font-bold text-sm border border-rose-200 cursor-pointer shadow-sm"
          >
            Explore Neighborhood Marketplace
          </button>
        </div>
      </section>
    </div>
  );
};
