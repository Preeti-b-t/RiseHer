import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Sparkles, Building, Sprout, ShieldCheck, ChevronDown, Check } from 'lucide-react';

export const DemoSwitcher: React.FC = () => {
  const { user, switchPersona } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const personas = [
    {
      name: 'Priya Sharma',
      email: 'priya@riseher.org',
      role: 'Scenario 1: Online Boutique (Idea Stage)',
      badge: 'Idea Stage • Limited Budget ₹50k',
      domain: 'Fashion & Apparel',
      location: 'Bangalore Rural',
      icon: Sparkles,
      color: 'border-empowerment-purple bg-purple-50 text-empowerment-purple'
    },
    {
      name: 'Ananya Patel',
      email: 'ananya@riseher.org',
      role: 'Scenario 2: Small Bakery (Expansion)',
      badge: 'Early Business • ₹3 Lakhs Budget',
      domain: 'Food & Bakery',
      location: 'Mysore Urban',
      icon: Building,
      color: 'border-coral bg-orange-50 text-coral-dark'
    },
    {
      name: 'Sunita Devi',
      email: 'sunita@riseher.org',
      role: 'Scenario 3: Rural Organic Agro Collective',
      badge: 'Validation Stage • Rural Producer',
      domain: 'Agriculture & Agro',
      location: 'Belgaum Rural',
      icon: Sprout,
      color: 'border-success bg-emerald-50 text-success'
    },
    {
      name: 'Kavita Rao',
      email: 'kavita.mentor@riseher.org',
      role: 'Verified Mentor & E-commerce Founder',
      badge: '8+ Yrs Exp • 4.95 Rating',
      domain: 'Fashion & E-Commerce',
      location: 'Bangalore',
      icon: UserCheck,
      color: 'border-plum bg-purple-50 text-plum'
    },
    {
      name: 'Pooja Hegde',
      email: 'admin@riseher.org',
      role: 'Platform Administrator',
      badge: 'Verification & Governance',
      domain: 'Platform Admin',
      location: 'Karnataka',
      icon: ShieldCheck,
      color: 'border-charcoal bg-gray-50 text-charcoal'
    }
  ];

  const handleSelect = async (email: string) => {
    setLoadingEmail(email);
    try {
      await switchPersona(email);
      setIsOpen(false);
    } finally {
      setLoadingEmail(null);
    }
  };

  const currentPersona = personas.find(p => p.email === user?.email) || personas[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-plum/20 hover:border-plum text-xs font-medium text-plum shadow-sm transition-all"
        title="Quick-switch between Hackathon evaluation test personas"
      >
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="font-semibold text-charcoal">Demo Persona:</span>
        <span className="text-empowerment-purple font-medium truncate max-w-[120px] sm:max-w-none">
          {user?.full_name || 'Select Persona'}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-plum/15 z-50 p-3 card-shadow animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-gray-100 mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">Judge & Evaluator Persona Switcher</p>
              <p className="text-xs text-gray-500 mt-0.5">Test real-time workflow across stages, domains & roles</p>
            </div>

            <div className="space-y-1.5 max-h-[70vh] overflow-y-auto">
              {personas.map((p) => {
                const isSelected = user?.email === p.email;
                const Icon = p.icon;
                return (
                  <button
                    key={p.email}
                    onClick={() => handleSelect(p.email)}
                    disabled={loadingEmail !== null}
                    className={`w-full text-left p-2.5 rounded-xl transition-all border flex items-start gap-3 ${
                      isSelected
                        ? 'border-plum bg-blush/40 shadow-sm'
                        : 'border-gray-100 hover:border-plum/30 hover:bg-cream'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${p.color} shrink-0 mt-0.5`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-charcoal truncate">{p.name}</span>
                        {isSelected && <Check size={14} className="text-plum shrink-0" />}
                      </div>
                      <p className="text-xs text-empowerment-purple font-medium truncate">{p.role}</p>
                      <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                        <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-charcoal-muted">
                          {p.badge}
                        </span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-charcoal-muted">
                          {p.location}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
