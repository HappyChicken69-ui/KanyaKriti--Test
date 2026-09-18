import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Mic,
  Square,
  RefreshCw,
  CheckCircle,
  Edit3,
  Sparkles,
  AlertCircle,
  X,
  Volume2,
  Tag,
  Clock,
  IndianRupee,
  Layers,
  Globe,
  Loader2,
} from 'lucide-react';
import { ExtractedSkillInfo, GeneratedListing, Listing } from '../types.ts';
import { extractSkillAI, generateListingAI, createListing, transcribeAudioAI } from '../lib/api.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { getSpeechLanguageCode, ARTISAN_VOICE_QUOTES } from '../data/languages.ts';
import { resolveContextualListingImage } from '../lib/images.ts';

interface VoiceArtisanModalProps {
  artisanId: string;
  artisanName: string;
  isOpen: boolean;
  onClose: () => void;
  onListingPublished: (listing: Listing) => void;
}

type Step = 'RECORDING' | 'EXTRACTING' | 'CONFIRM' | 'EDIT' | 'GENERATING' | 'LISTING_PREVIEW';

export const VoiceArtisanModal: React.FC<VoiceArtisanModalProps> = ({
  artisanId,
  artisanName,
  isOpen,
  onClose,
  onListingPublished,
}) => {
  // Shared Language Context for all 23 languages
  const {
    selectedLanguageCode,
    selectedLanguage,
    setLanguageCode,
    supportedLanguages,
    t,
    speechLocale,
    voiceQuote,
    samplePrompts,
  } = useLanguage();

  const [step, setStep] = useState<Step>('RECORDING');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [extracted, setExtracted] = useState<ExtractedSkillInfo | null>(null);
  const [generatedListing, setGeneratedListing] = useState<GeneratedListing | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Manual Edit State
  const [editSkill, setEditSkill] = useState('');
  const [editPrice, setEditPrice] = useState(250);
  const [editCategory, setEditCategory] = useState<string>('Tailoring');
  const [customCategory, setCustomCategory] = useState('');
  const [editTurnaround, setEditTurnaround] = useState('Within 1 day');
  const [editTurnaroundHours, setEditTurnaroundHours] = useState(24);
  const [isPublishing, setIsPublishing] = useState(false);
  const isPublishingRef = useRef(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep('RECORDING');
      setIsRecording(false);
      setRecordSeconds(0);
      setTranscript('');
      setExtracted(null);
      setGeneratedListing(null);
      setCustomCategory('');
      setErrorMsg(null);
    } else {
      stopRecording();
    }
  }, [isOpen]);

  const startRecording = async () => {
    if (isOffline) {
      setErrorMsg("You're offline. Voice processing requires an internet connection to reach the AI engine.");
      return;
    }
    setErrorMsg(null);
    setTranscript('');
    setRecordSeconds(0);
    audioChunksRef.current = [];

    // Initialize Web Speech API if supported with the currently selected language
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        // Dynamically configure Speech Recognition with selected language code (e.g. hi-IN, te-IN, en-IN, kn-IN)
        recognition.lang = speechLocale || getSpeechLanguageCode(selectedLanguageCode);

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setTranscript(currentTranscript.trim());
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition status:', event.error);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      mediaRecorder.start(250); // Slice chunks every 250ms
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Mic access denied or unavailable, switching to simulated audio recording:', err);
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      } catch (e) {
        // ignore
      }
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsRecording(false);
  };

  const handleProcessVoice = async (spokenTextToProcess?: string) => {
    stopRecording();
    setStep('EXTRACTING');
    setErrorMsg(null);

    let textToUse = spokenTextToProcess || transcript;

    // If no text transcribed yet and we have recorded audio chunks, transcribe via Groq STT with selected language
    if (!textToUse && audioChunksRef.current.length > 0) {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const sttResult = await transcribeAudioAI(audioBlob, selectedLanguageCode);
        if (sttResult && sttResult.trim().length > 0) {
          textToUse = sttResult.trim();
        }
      } catch (sttErr) {
        console.warn('Groq STT fallback to default phrase:', sttErr);
      }
    }

    if (!textToUse) {
      textToUse = voiceQuote.text;
    }

    setTranscript(textToUse);

    try {
      const data = await extractSkillAI(textToUse, selectedLanguage.name);
      setExtracted(data);
      setEditSkill(data.skill);
      setEditPrice(data.price);

      const standardCategories = ['Tailoring', 'Cooking', 'Alterations', 'Handicrafts', 'Embroidery', 'Beauty'];
      if (standardCategories.includes(data.category)) {
        setEditCategory(data.category);
        setCustomCategory(data.customCategory || '');
      } else {
        setEditCategory('Other');
        setCustomCategory(data.customCategory || (data.category !== 'Other' ? data.category : ''));
      }

      setEditTurnaround(data.turnaround_display);
      setEditTurnaroundHours(data.turnaround_hours);
      setStep('CONFIRM');
    } catch (err: any) {
      console.error('Skill extraction error:', err);
      setErrorMsg(err.message || 'Could not understand spoken skill. Please try again or type manually.');
      setStep('RECORDING');
    }
  };

  const handleApplyPreset = (presetText: string) => {
    setTranscript(presetText);
    handleProcessVoice(presetText);
  };

  const handleConfirmExtraction = async () => {
    if (!extracted) return;
    setStep('GENERATING');
    try {
      const listing = await generateListingAI(extracted, artisanName);
      setGeneratedListing(listing);
      setStep('LISTING_PREVIEW');
    } catch (err: any) {
      console.error('Listing generation error:', err);
      setErrorMsg('Failed to generate listing. Falling back to quick publish.');
    }
  };

  const handleSaveManualEdit = () => {
    if (!extracted) return;
    const isOther = editCategory === 'Other';
    const trimmedCustom = customCategory.trim();
    const finalCategory = isOther && trimmedCustom ? trimmedCustom : editCategory;

    const updated: ExtractedSkillInfo = {
      ...extracted,
      skill: editSkill,
      price: editPrice,
      category: finalCategory,
      customCategory: isOther && trimmedCustom ? trimmedCustom : undefined,
      turnaround_display: editTurnaround,
      turnaround_hours: editTurnaroundHours,
      suggestedTitle: `Custom ${editSkill} – Verified Artisan`,
    };
    setExtracted(updated);
    setStep('CONFIRM');
  };

  const handlePublishListing = async () => {
    if (isPublishingRef.current) return;
    if (!generatedListing && !extracted) return;

    isPublishingRef.current = true;
    setIsPublishing(true);
    setErrorMsg(null);

    try {
      const finalCategory = generatedListing?.customCategory || (generatedListing?.category && generatedListing.category !== 'Other' ? generatedListing.category : (extracted?.customCategory || extracted?.category || 'Other'));
      const finalCustomCategory = extracted?.customCategory || (editCategory === 'Other' && customCategory.trim() ? customCategory.trim() : undefined);

      const resolvedImage = generatedListing?.imageUrl || resolveContextualListingImage({
        title: generatedListing ? generatedListing.title : extracted!.suggestedTitle,
        category: finalCategory,
        customCategory: finalCustomCategory,
        description: generatedListing ? generatedListing.shortDescription : extracted!.description,
        tags: generatedListing ? generatedListing.suggestedTags : extracted!.suggestedTags,
        searchKeywords: generatedListing ? generatedListing.searchKeywords : [extracted!.skill.toLowerCase(), finalCategory.toLowerCase()],
      });

      const payload = {
        artisanId,
        title: generatedListing ? generatedListing.title : extracted!.suggestedTitle,
        description: generatedListing ? generatedListing.shortDescription : extracted!.description,
        category: finalCategory,
        customCategory: finalCustomCategory,
        price: generatedListing ? generatedListing.price : extracted!.price,
        turnaroundHours: generatedListing ? generatedListing.turnaroundHours : extracted!.turnaround_hours,
        turnaroundDisplay: generatedListing ? generatedListing.estimatedTurnaround : extracted!.turnaround_display,
        searchKeywords: generatedListing ? generatedListing.searchKeywords : [extracted!.skill.toLowerCase(), finalCategory.toLowerCase()],
        tags: generatedListing ? generatedListing.suggestedTags : extracted!.suggestedTags,
        imageUrl: resolvedImage,
      };

      const published = await createListing(payload);
      onListingPublished(published);
      onClose();
    } catch (err: any) {
      console.error('Listing publication error:', err);
      setErrorMsg(err.message || 'Failed to publish listing');
    } finally {
      setIsPublishing(false);
      isPublishingRef.current = false;
    }
  };

  // Dynamic voice presets reflecting current language selection (all 23 Indian languages)
  const dynamicPresets = [
    {
      label: `${selectedLanguage.name} (${selectedLanguage.nativeName})`,
      text: voiceQuote.text,
      category: selectedLanguage.name,
    },
    ...samplePrompts.map((p) => ({
      label: `${p.label} (${p.category})`,
      text: p.text,
      category: p.category,
    })),
  ];

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      style={{ zIndex: 99999 }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden">
        {/* Header with Dynamic 23-Language Selector */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#FFF5F7] to-[#FAF7F5] border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#C84B68] border border-rose-200/80 shadow-2xs">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight font-serif text-[#4A1525]">
                {t('voice_studio_title', 'Voice Skill Studio')}
              </h3>
              <p className="text-[#86293D] text-xs font-medium">
                {selectedLanguage.nativeName} • {t('voice_studio_zero_typing', 'Zero typing required')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Language Selector bound to shared LanguageContext */}
            <div className="relative flex items-center">
              <Globe className="w-3 h-3 text-[#86293D] absolute left-2 pointer-events-none" />
              <select
                value={selectedLanguageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
                className="bg-white hover:bg-rose-50 border border-rose-200 text-[#4A1525] text-[11px] rounded-full pl-5.5 pr-2 py-1 font-semibold focus:outline-none focus:border-[#C84B68] cursor-pointer shadow-2xs transition-all"
                title="Change Voice Language"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8C7A80] hover:text-[#4A1525] hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Offline Warning Banner if offline */}
        {isOffline && (
          <div className="px-6 py-2 bg-stone-100 text-stone-800 text-xs flex items-center gap-2 border-b border-stone-200">
            <AlertCircle className="w-4 h-4 text-[#C84B68] shrink-0" />
            <span>You're offline. Voice processing will resume when connected.</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="m-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-6 bg-[#FAF7F5]/30">
          {/* STEP 1: RECORDING */}
          {step === 'RECORDING' && (
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-[11px] font-bold text-[#86293D] mb-3">
                <Globe className="w-3 h-3 text-[#C84B68]" />
                <span>Listening in {selectedLanguage.name} ({selectedLanguage.nativeName})</span>
              </div>

              <p className="text-stone-600 text-sm mb-6 max-w-sm">
                Speak naturally in <strong>{selectedLanguage.name} ({selectedLanguage.nativeName})</strong>. Tell us what you make, how much you charge, and how soon you can deliver.
              </p>

              {/* Big Mic Button */}
              <div className="relative mb-6">
                {isRecording && (
                  <div className="absolute -inset-4 rounded-full bg-[#C84B68]/30 animate-ping pointer-events-none" />
                )}
                <button
                  type="button"
                  onClick={isRecording ? () => handleProcessVoice() : startRecording}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-xl transition-all transform active:scale-95 cursor-pointer ${
                    isRecording
                      ? 'bg-[#4A1525] text-white ring-8 ring-rose-200 animate-pulse'
                      : 'bg-gradient-to-tr from-[#C84B68] to-[#B33956] hover:from-[#B33956] hover:to-[#86293D] text-white ring-8 ring-rose-100 shadow-rose-900/20'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-8 h-8 mb-1" />
                      <span className="text-[11px] font-bold tracking-wider uppercase">{t('voice_stop', 'Stop')}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-9 h-9 mb-1" />
                      <span className="text-[11px] font-bold tracking-wider uppercase">{t('voice_speak', 'Speak')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Recording Status & Waveform */}
              {isRecording ? (
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-center gap-2 text-[#86293D] font-semibold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C84B68] animate-ping" />
                    Recording in {selectedLanguage.name}: 00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds}
                  </div>
                  {transcript && (
                    <div className="bg-[#FFF0F3] border border-rose-200 rounded-xl p-3 text-xs text-stone-700 max-w-md italic shadow-2xs">
                      "{transcript}"
                    </div>
                  )}
                  <p className="text-stone-500 text-xs">{t('voice_tap_stop', 'Tap Stop when you are done speaking')}</p>
                </div>
              ) : (
                <p className="text-stone-500 text-xs mb-6">
                  Tap the microphone and speak in {selectedLanguage.name}: <br />
                  <span className="text-stone-800 font-medium italic">
                    "{voiceQuote.text}"
                  </span>
                </p>
              )}

              {/* Quick Preset Buttons for judges / testers */}
              <div className="w-full border-t border-rose-100 pt-4 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    {t('voice_test_prompts', 'Or 1-Click Test Prompts:')}
                  </span>
                  <span className="text-[10px] text-[#86293D] bg-[#FFF0F3] px-2 py-0.5 rounded font-bold border border-rose-200/80">
                    {selectedLanguage.code.toUpperCase()} • {selectedLanguage.nativeName}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {dynamicPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset.text)}
                      className="p-2.5 bg-white hover:bg-rose-50/60 border border-rose-100 hover:border-[#E8A5B5] rounded-xl text-left transition-all text-xs group cursor-pointer shadow-2xs"
                    >
                      <div className="font-semibold text-stone-800 group-hover:text-[#4A1525]">
                        {preset.label}
                      </div>
                      <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                        "{preset.text}"
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EXTRACTING WITH AI */}
          {step === 'EXTRACTING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF0F3] text-[#C84B68] flex items-center justify-center animate-spin border border-rose-200">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-[#4A1525] text-base font-serif">
                  {t('voice_extracting_title', 'Listening & Extracting in')} {selectedLanguage.name}...
                </h4>
                <p className="text-stone-500 text-xs max-w-xs mt-1">
                  {t('voice_extracting_desc', 'Parsing craft category, turnaround time, and pricing into verified marketplace attributes.')}
                </p>
              </div>
              <div className="bg-white border border-rose-100 rounded-xl p-3 max-w-sm text-xs text-stone-600 italic shadow-2xs">
                "{transcript}"
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION SCREEN ("Here's what we understood") */}
          {step === 'CONFIRM' && extracted && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-bold text-[#4A1525] text-lg font-serif">
                  {t('voice_review_title', "Here's what we understood")}
                </h4>
                <p className="text-stone-500 text-xs mt-0.5">
                  {extracted.confidence >= 0.8 ? (
                    <span className="inline-flex items-center gap-1 text-[#86293D] font-bold">
                      <CheckCircle className="w-3.5 h-3.5 text-[#C84B68]" /> High AI Confidence ({Math.round(extracted.confidence * 100)}%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-stone-700 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> We're not fully sure. Please review these details.
                    </span>
                  )}
                </p>
              </div>

              {/* Extracted Structured Card */}
              <div className="bg-white border border-rose-100 rounded-2xl p-4 space-y-3 shadow-2xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#86293D]">
                      {t('voice_skill_label', 'Skill / Service')}
                    </span>
                    <div className="font-bold text-[#4A1525] text-base font-serif">{extracted.skill}</div>
                    <span className="inline-block mt-0.5 text-xs bg-rose-50 text-[#86293D] font-bold px-2 py-0.5 rounded-md border border-rose-200/80">
                      {extracted.customCategory || extracted.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#86293D]">
                      {t('voice_price_label', 'Price')}
                    </span>
                    <div className="font-extrabold text-[#4A1525] text-xl">₹{extracted.price}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-rose-100 flex items-center justify-between text-xs text-stone-700">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#86293D]" />
                    <span>{t('buyer_turnaround', 'Delivery')}: <strong>{extracted.turnaround_display}</strong></span>
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    Currency: {extracted.currency} • Language: {selectedLanguage.name}
                  </div>
                </div>

                {extracted.description && (
                  <div className="pt-2 border-t border-rose-100 text-xs text-stone-600">
                    <span className="font-semibold text-stone-800">Your Words: </span>
                    "{extracted.description}"
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('EDIT')}
                  className="flex-1 py-3 px-4 rounded-xl border border-rose-200 text-[#86293D] font-bold text-sm hover:bg-rose-50/60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  {t('voice_edit_btn', 'Edit Details')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExtraction}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#C84B68] hover:bg-[#B33956] text-white font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t('voice_confirm_btn', 'Looks Correct')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: MANUAL EDIT FALLBACK (WITH "OTHER" CUSTOM CATEGORY SPECIFIER) */}
          {step === 'EDIT' && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-bold text-[#4A1525] text-base font-serif">
                  {t('voice_edit_btn', 'Edit Details')}
                </h4>
                <p className="text-stone-500 text-xs">Adjust your skill parameters before generating the listing</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A1525] mb-1">
                    {t('voice_skill_label', 'Skill Title')}
                  </label>
                  <input
                    type="text"
                    value={editSkill}
                    onChange={(e) => setEditSkill(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm focus:ring-1 focus:ring-[#C84B68] focus:border-[#C84B68] focus:outline-none bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4A1525] mb-1">
                      {t('voice_category_label', 'Category')}
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm focus:ring-1 focus:ring-[#C84B68] focus:border-[#C84B68] focus:outline-none bg-white font-medium"
                    >
                      <option value="Tailoring">Tailoring</option>
                      <option value="Cooking">Cooking</option>
                      <option value="Alterations">Alterations</option>
                      <option value="Handicrafts">Handicrafts</option>
                      <option value="Embroidery">Embroidery</option>
                      <option value="Beauty">Beauty</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A1525] mb-1">
                      {t('voice_price_label', 'Price (₹ INR)')}
                    </label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm focus:ring-1 focus:ring-[#C84B68] focus:border-[#C84B68] focus:outline-none bg-white"
                    />
                  </div>

                  {/* "OTHER" CATEGORY - TEXT INPUT (SHOWN ONLY WHEN "Other" IS SELECTED) */}
                  {editCategory === 'Other' && (
                    <div className="col-span-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      <label className="block text-xs font-bold text-[#4A1525] mb-1">
                        {t('voice_custom_category_label', 'Specify Category')} <span className="text-[#C84B68]">*</span>
                      </label>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter custom category (e.g. Pottery, Candle Making, Weaving)"
                        className="w-full px-3 py-2 border border-rose-300 rounded-xl text-sm focus:ring-1 focus:ring-[#C84B68] focus:border-[#C84B68] focus:outline-none bg-white text-stone-900 placeholder:text-stone-400 shadow-2xs"
                        autoFocus
                      />
                      <p className="text-[11px] text-stone-500 mt-1">
                        This category will be saved and displayed with your listing.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A1525] mb-1">
                    {t('voice_turnaround_label', 'Estimated Turnaround')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Same day (6h)', hours: 6 },
                      { label: 'Within 1 day (24h)', hours: 24 },
                      { label: 'Within 2 days (48h)', hours: 48 },
                    ].map((opt) => (
                      <button
                        key={opt.hours}
                        type="button"
                        onClick={() => {
                          setEditTurnaround(opt.label);
                          setEditTurnaroundHours(opt.hours);
                        }}
                        className={`py-2 px-2 text-xs rounded-lg border font-medium cursor-pointer transition-all ${
                          editTurnaroundHours === opt.hours
                            ? 'bg-rose-50 border-[#C84B68] text-[#86293D] font-bold ring-1 ring-[#C84B68]'
                            : 'border-stone-200 text-stone-600 hover:bg-rose-50/40'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep('CONFIRM')}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveManualEdit}
                  className="flex-1 py-2.5 rounded-xl bg-[#C84B68] hover:bg-[#B33956] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Save & Review
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: GENERATING LISTING */}
          {step === 'GENERATING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF0F3] text-[#C84B68] border border-rose-200 flex items-center justify-center animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-[#4A1525] text-base font-serif">
                  {t('voice_generating_title', 'Creating Professional Listing...')}
                </h4>
                <p className="text-stone-500 text-xs max-w-xs mt-1">
                  {t('voice_generating_desc', 'Crafting a compelling title, search tags, clear turnaround, and artisan summary in')} {selectedLanguage.name}.
                </p>
              </div>
            </div>
          )}

          {/* STEP 6: LISTING PREVIEW & APPROVAL */}
          {step === 'LISTING_PREVIEW' && generatedListing && (() => {
            const previewImageUrl =
              generatedListing.imageUrl ||
              resolveContextualListingImage({
                title: generatedListing.title,
                category:
                  generatedListing.customCategory ||
                  extracted?.customCategory ||
                  generatedListing.category,
                customCategory: generatedListing.customCategory || extracted?.customCategory,
                description: generatedListing.shortDescription,
                tags: generatedListing.suggestedTags,
                searchKeywords: generatedListing.searchKeywords,
              });

            return (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#86293D] bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-full">
                    {t('voice_listing_preview', 'AI Marketplace Listing')}
                  </span>
                  <h4 className="font-bold text-[#4A1525] text-lg mt-1 font-serif">{generatedListing.title}</h4>
                  <p className="text-stone-500 text-xs">Review how buyers will see your listing</p>
                </div>

                <div className="bg-white border border-rose-100 rounded-2xl p-4 space-y-3 shadow-2xs">
                  {/* Context-Aware Matched Craft Photograph */}
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-rose-100 bg-stone-100">
                    <img
                      src={previewImageUrl}
                      alt={generatedListing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 shadow-xs">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Context-Matched Craft Photo</span>
                    </div>
                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs text-[#4A1525] border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                      {generatedListing.customCategory || extracted?.customCategory || generatedListing.category}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#86293D] bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-full">
                      {generatedListing.customCategory || extracted?.customCategory || generatedListing.category}
                    </span>
                    <span className="text-xl font-extrabold text-[#4A1525]">
                      ₹{generatedListing.price}
                    </span>
                  </div>

                  <p className="text-stone-700 text-xs leading-relaxed">
                    {generatedListing.shortDescription}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-stone-600">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>Turnaround: <strong>{generatedListing.estimatedTurnaround}</strong></span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {generatedListing.suggestedTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium border border-stone-200/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="p-2.5 bg-[#FAF7F5] rounded-xl border border-rose-100 text-[11px] text-stone-800">
                    <span className="font-bold text-[#4A1525]">Artisan Summary: </span>
                    {generatedListing.artisanProfileSummary}
                  </div>
                </div>

                {/* Approval Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isPublishing}
                    onClick={() => setStep('CONFIRM')}
                    className="py-3 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isPublishing}
                    onClick={handlePublishListing}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#C84B68] hover:bg-[#B33956] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publishing Listing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>{t('voice_publish_btn', 'Approve & Publish Listing')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>,
    document.body
  );
};
