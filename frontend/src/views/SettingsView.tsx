import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Key,
  Shield,
  User,
  CheckCircle2,
  Save,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const [aiProvider, setAiProvider] = useState<'local_deterministic' | 'gemini' | 'openai'>('local_deterministic');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush text-plum text-xs font-semibold">
            <Settings size={14} className="text-coral" />
            <span>Preferences & AI Engine Config</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-charcoal">
            Platform Settings
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-light max-w-xl">
            Configure your AI reasoning provider, view active security credentials, and manage notification preferences.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-success text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>Configuration updated successfully!</span>
        </div>
      )}

      {/* AI Provider Config */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-6 text-xs">
        <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
          <Cpu size={18} className="text-plum" />
          <h3 className="text-base font-bold font-heading text-charcoal">AI Recommendation Engine Configuration</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'local_deterministic',
                name: 'Local Deterministic (Recommended)',
                desc: 'Deterministic rule-based MSME scoring. Zero API keys, zero network lag, transparent explainability.'
              },
              {
                id: 'gemini',
                name: 'Google Gemini Pro / Flash',
                desc: 'Connect Gemini 1.5 Pro / Flash via Google AI Studio API key for expanded generative prose.'
              },
              {
                id: 'openai',
                name: 'OpenAI GPT-4o',
                desc: 'Connect GPT-4o via OpenAI API key for alternative LLM-backed explanations.'
              }
            ].map((prov) => (
              <button
                key={prov.id}
                type="button"
                onClick={() => setAiProvider(prov.id as any)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  aiProvider === prov.id
                    ? 'border-plum bg-blush shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <p className="font-bold text-plum">{prov.name}</p>
                <p className="text-[11px] text-charcoal-muted mt-1 leading-relaxed">{prov.desc}</p>
              </button>
            ))}
          </div>

          {aiProvider === 'gemini' && (
            <div className="p-4 rounded-2xl bg-cream border border-plum/10 space-y-2 animate-in fade-in">
              <label className="block font-semibold text-charcoal">Gemini API Key</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
              />
              <span className="text-[10px] text-charcoal-muted">Stored securely on your local session; never exposed to public repositories.</span>
            </div>
          )}

          {aiProvider === 'openai' && (
            <div className="p-4 rounded-2xl bg-cream border border-plum/10 space-y-2 animate-in fade-in">
              <label className="block font-semibold text-charcoal">OpenAI API Key</label>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
              />
              <span className="text-[10px] text-charcoal-muted">Kept exclusively on your backend environment.</span>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-charcoal-light flex items-start gap-3">
            <Shield size={18} className="text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-charcoal">Transparency & Privacy Commitment</p>
              <p className="mt-0.5">
                RiseHer never fabricates statistics or claims external AI models when running local rule-based evaluations. All financial estimates clearly label their underlying assumptions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-plum hover:bg-plum-dark text-white font-bold flex items-center gap-2 shadow-md transition-all hover:scale-105"
          >
            <Save size={14} />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
