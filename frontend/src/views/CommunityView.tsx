import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  ShieldCheck,
  Filter,
  User
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { CommunityPost } from '../types';

export const CommunityView: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('All');

  // New Post Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDomain, setNewDomain] = useState('Fashion & Apparel');
  const [newTags, setNewTags] = useState('Advice, GettingStarted');
  const [creating, setCreating] = useState(false);

  // Reply State
  const [replyPostId, setReplyPostId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const domains = [
    'All',
    'Fashion & Apparel',
    'Food & Bakery',
    'Agriculture & Agro-Processing',
    'Handicrafts & Artisanal',
    'Beauty & Wellness'
  ];

  useEffect(() => {
    loadPosts();
  }, [selectedDomain]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getCommunityPosts(selectedDomain);
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const res = await api.likeCommunityPost(postId);
      setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: res.likes_count } : p));
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setCreating(true);
    try {
      const created = await api.createCommunityPost({
        domain: newDomain,
        title: newTitle,
        content: newContent,
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setPosts([created, ...posts]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewContent('');
    } catch (err) {
      console.error('Failed to create post', err);
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async (postId: number) => {
    if (!replyContent.trim()) return;
    setSendingReply(true);
    try {
      const updated = await api.replyCommunityPost(postId, replyContent);
      setPosts(posts.map(p => p.id === postId ? updated : p));
      setReplyPostId(null);
      setReplyContent('');
    } catch (err) {
      console.error('Failed to reply', err);
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-plum border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-plum">Loading Community Discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush text-plum text-xs font-semibold">
            <MessageSquare size={14} className="text-coral" />
            <span>Peer Community & Domain Circles</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-charcoal">
            Community Discussions
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-light max-w-xl">
            Ask practical questions, share raw vendor experiences, and exchange peer wisdom with fellow women entrepreneurs across India.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-2xl bg-plum hover:bg-plum-dark text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105 shrink-0"
        >
          <Plus size={16} />
          <span>New Discussion</span>
        </button>
      </div>

      {/* Domain Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter size={16} className="text-plum shrink-0" />
        <div className="flex gap-2 text-xs">
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedDomain === d
                  ? 'bg-plum text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-charcoal-muted hover:border-plum/40'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow space-y-4"
          >
            {/* Author bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={p.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={p.author_name}
                  className="w-10 h-10 rounded-full object-cover border border-plum/20"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-charcoal">{p.author_name}</span>
                    {p.author_role === 'mentor' && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-50 text-empowerment-purple font-semibold flex items-center gap-0.5">
                        <ShieldCheck size={11} /> Mentor
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-charcoal-muted">
                    {new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {p.domain}
                  </span>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cream border border-plum/10 text-plum">
                {p.domain}
              </span>
            </div>

            {/* Post content */}
            <div className="space-y-1.5">
              <h3 className="text-base font-bold font-heading text-charcoal">{p.title}</h3>
              <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed whitespace-pre-line">
                {p.content}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {p.tags.map((tag, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-blush text-plum font-medium">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Interactions Bar */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(p.id)}
                  className="flex items-center gap-1 text-charcoal-muted hover:text-plum transition-colors font-medium"
                >
                  <ThumbsUp size={14} />
                  <span>{p.likes_count} Helpful</span>
                </button>

                <button
                  onClick={() => setReplyPostId(replyPostId === p.id ? null : p.id)}
                  className="flex items-center gap-1 text-charcoal-muted hover:text-empowerment-purple transition-colors font-medium"
                >
                  <MessageCircle size={14} />
                  <span>{p.replies.length} Replies</span>
                </button>
              </div>

              <button
                onClick={() => setReplyPostId(p.id)}
                className="text-xs font-semibold text-plum hover:underline"
              >
                Reply to Thread
              </button>
            </div>

            {/* Thread Replies */}
            {p.replies.length > 0 && (
              <div className="pt-2 pl-4 border-l-2 border-plum/20 space-y-2.5 bg-cream/30 p-3 rounded-2xl">
                {p.replies.map((r) => (
                  <div key={r.id} className="text-xs space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-charcoal">{r.author_name}</span>
                      {r.author_role === 'mentor' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 text-empowerment-purple font-bold">
                          Mentor
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">
                        {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-charcoal-light leading-relaxed">{r.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input Form */}
            {replyPostId === p.id && (
              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your constructive reply..."
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-plum"
                />
                <button
                  onClick={() => handleSendReply(p.id)}
                  disabled={sendingReply || !replyContent.trim()}
                  className="px-4 py-2 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Send size={12} />
                  <span>Post</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-plum/20 shadow-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold font-heading text-charcoal">Start a New Discussion</h3>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Domain</label>
                <select
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                >
                  {domains.filter(d => d !== 'All').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Topic Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sourcing cold-press oil expellers in North Karnataka"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-plum"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Content / Question</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Detail your question or share your learning..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. Suppliers, Packaging, Licensing"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-charcoal-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-plum hover:bg-plum-dark text-white font-bold"
                >
                  {creating ? 'Posting...' : 'Publish Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
