import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Clock,
  Sparkles,
  Filter,
  GraduationCap,
  Award,
  Check
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { LearningResource } from '../types';

export const LearningView: React.FC = () => {
  const { profile } = useAuth();
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Financial Literacy',
    'Digital Marketing',
    'Compliance & Legal',
    'Operations & Logistics',
    'Agriculture Innovation'
  ];

  useEffect(() => {
    loadResources();
  }, [profile]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await api.getLearningResources();
      setResources(data);
    } catch (err) {
      console.error('Failed to load learning resources', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (resId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    try {
      await api.updateResourceStatus(resId, nextStatus);
      setResources(resources.map(r => r.id === resId ? { ...r, status: nextStatus as any } : r));
    } catch (err) {
      console.error('Failed to update resource status', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-plum border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-plum">Matching Certified Learning Modules...</p>
        </div>
      </div>
    );
  }

  const filteredResources = selectedCategory === 'All'
    ? resources
    : resources.filter(r => r.category === selectedCategory);

  const completedCount = resources.filter(r => r.status === 'completed').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush text-plum text-xs font-semibold">
            <BookOpen size={14} className="text-coral" />
            <span>Curated Skill Building & Certifications</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-charcoal">
            Learning & Resource Development
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-light max-w-2xl">
            Verified, government and institutional learning modules personalized to bridge your specific domain and operational skill gaps.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-cream border border-plum/10 text-center shrink-0">
          <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Training Progress</span>
          <span className="text-xl font-extrabold text-plum font-heading block mt-0.5">
            {completedCount} / {resources.length} Modules
          </span>
          <span className="text-[10px] text-success font-medium">Free Access • Official Portals</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter size={16} className="text-plum shrink-0" />
        <div className="flex gap-2 text-xs">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c
                  ? 'bg-plum text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-charcoal-muted hover:border-plum/40'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => {
          const isDone = res.status === 'completed';
          return (
            <div
              key={res.id}
              className={`bg-white rounded-3xl p-6 border transition-all card-shadow flex flex-col justify-between space-y-4 ${
                isDone ? 'border-emerald-200' : 'border-plum/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-empowerment-purple px-2 py-0.5 rounded-full bg-purple-50">
                    {res.category}
                  </span>
                  <span className="text-[10px] text-charcoal-muted bg-gray-100 px-2 py-0.5 rounded">
                    {res.difficulty}
                  </span>
                </div>

                <h3 className="text-sm font-bold font-heading text-charcoal mt-1">
                  {res.title}
                </h3>

                <p className="text-xs text-charcoal-light mt-2 leading-relaxed">
                  {res.description}
                </p>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-charcoal-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{res.estimated_duration}</span>
                  </span>
                  <span className="font-medium text-charcoal truncate max-w-[140px]">
                    {res.source_name}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleStatus(res.id, res.status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isDone
                      ? 'bg-emerald-50 text-success border border-emerald-200'
                      : 'border border-gray-200 text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  <CheckCircle2 size={14} className={isDone ? 'text-success' : 'text-gray-300'} />
                  <span>{isDone ? 'Completed' : 'Mark Complete'}</span>
                </button>

                <a
                  href={res.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                >
                  <span>Open Course</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
