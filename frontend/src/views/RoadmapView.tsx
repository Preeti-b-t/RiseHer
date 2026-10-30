import React, { useState, useEffect } from 'react';
import {
  Milestone,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  Trash2,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { RoadmapTask } from '../types';

export const RoadmapView: React.FC = () => {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('All');

  // Custom task modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTimeframe, setNewTimeframe] = useState('Week 1');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newEstDays, setNewEstDays] = useState(3);
  const [newDeadline, setNewDeadline] = useState('2026-11-15');

  useEffect(() => {
    loadRoadmap();
  }, [profile]);

  const loadRoadmap = async () => {
    setLoading(true);
    try {
      const data = await api.getRoadmapTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load roadmap', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      const updated = await api.toggleRoadmapTask(taskId);
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await api.createCustomTask({
        title: newTitle,
        description: newDesc,
        timeframe: newTimeframe,
        milestone_group: 'Execution',
        priority: newPriority,
        estimated_days: Number(newEstDays),
        deadline_date: newDeadline,
        dependencies: []
      });
      setTasks([...tasks, created]);
      setShowAddModal(false);
      setNewTitle('');
      setNewDesc('');
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-plum border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-plum">Generating Adaptive Milestone Roadmap...</p>
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.is_completed).length;
  const timeframes = ['All', ...new Set(tasks.map(t => t.timeframe))];

  const filteredTasks = selectedTimeframe === 'All'
    ? tasks
    : tasks.filter(t => t.timeframe === selectedTimeframe);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush text-plum text-xs font-semibold">
            <Milestone size={14} className="text-coral" />
            <span>Personalized Execution Timeline</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-charcoal">
            Business Action Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-light max-w-xl">
            Adaptive {profile?.business_model || 'Online'} launch schedule tailored to {profile?.business_domain || 'your domain'}. Complete tasks in sequence to maintain momentum.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-4 rounded-2xl bg-cream border border-plum/10 text-center">
            <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Roadmap Velocity</span>
            <span className="text-xl font-extrabold text-plum font-heading block mt-0.5">
              {completedCount} / {tasks.length} Completed
            </span>
            <div className="w-28 bg-gray-100 rounded-full h-1.5 mt-1.5 overflow-hidden mx-auto">
              <div
                className="bg-success h-full rounded-full transition-all"
                style={{ width: `${Math.round((completedCount / (tasks.length || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-3 rounded-2xl bg-plum hover:bg-plum-dark text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <Plus size={16} />
            <span>Add Custom Task</span>
          </button>
        </div>
      </div>

      {/* Timeframe Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-charcoal-muted uppercase tracking-wider pl-1 shrink-0">
          Timeline Phase:
        </span>
        <div className="flex gap-2 text-xs">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedTimeframe === tf
                  ? 'bg-plum text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-charcoal-muted hover:border-plum/40'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((t) => (
          <div
            key={t.id}
            className={`p-4 sm:p-5 rounded-3xl border transition-all card-shadow flex items-start justify-between gap-4 ${
              t.is_completed
                ? 'bg-white/60 border-gray-100 opacity-80'
                : 'bg-white border-plum/10 hover:border-plum/30'
            }`}
          >
            {/* Left Checkbox + Details */}
            <div className="flex items-start gap-4 flex-1">
              <button
                onClick={() => handleToggleTask(t.id)}
                className={`w-6 h-6 rounded-xl border mt-0.5 flex items-center justify-center transition-all shrink-0 ${
                  t.is_completed
                    ? 'bg-success border-success text-white'
                    : 'border-gray-300 hover:border-plum bg-white'
                }`}
                title={t.is_completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {t.is_completed && <Check size={14} />}
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-sm font-bold font-heading ${
                    t.is_completed ? 'line-through text-gray-400' : 'text-charcoal'
                  }`}>
                    {t.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-blush text-plum">
                    {t.timeframe}
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-gray-100 text-charcoal-muted">
                    {t.milestone_group}
                  </span>
                  {t.is_custom && (
                    <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-purple-50 text-empowerment-purple">
                      Custom
                    </span>
                  )}
                </div>

                <p className="text-xs text-charcoal-light leading-relaxed max-w-3xl">
                  {t.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-charcoal-muted pt-1">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>Est: {t.estimated_days} days</span>
                  </span>
                  {t.deadline_date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>Target: {t.deadline_date}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Priority & Delete button */}
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                t.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                t.priority === 'Medium' ? 'bg-orange-50 text-coral-dark border border-orange-100' :
                'bg-gray-100 text-gray-600'
              }`}>
                {t.priority} Priority
              </span>

              {t.is_custom && (
                <button
                  onClick={() => handleDeleteTask(t.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl border border-plum/20 shadow-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold font-heading text-charcoal">Add Custom Milestone Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Test fabric shrinkage in cold water"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-plum"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Description & Steps</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  placeholder="Specific actionable requirements..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Timeframe Phase</label>
                  <select
                    value={newTimeframe}
                    onChange={(e) => setNewTimeframe(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  >
                    <option value="Week 1">Week 1</option>
                    <option value="Week 2">Week 2</option>
                    <option value="Week 3">Week 3</option>
                    <option value="Week 4">Week 4</option>
                    <option value="Weeks 5-6">Weeks 5-6</option>
                    <option value="Month 2">Month 2</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Estimated Days</label>
                  <input
                    type="number"
                    value={newEstDays}
                    onChange={(e) => setNewEstDays(Number(e.target.value))}
                    min="1"
                    max="60"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-charcoal-muted hover:text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-plum hover:bg-plum-dark text-white font-bold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
