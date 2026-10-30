import React, { useState, useEffect } from 'react';
import {
  Users,
  Star,
  Calendar,
  Clock,
  Video,
  Send,
  CheckCircle2,
  Filter,
  MessageSquare,
  Sparkles,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { MentorProfile, MentorshipRequest, Message, Conversation } from '../types';

export const MentorsView: React.FC = () => {
  const { user, profile } = useAuth();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [myRequests, setMyRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'directory' | 'requests' | 'chat'>('directory');

  // Booking Modal State
  const [bookingMentor, setBookingMentor] = useState<MentorProfile | null>(null);
  const [bookingSubject, setBookingSubject] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Direct Messaging State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const domains = [
    'All',
    'Fashion & Apparel',
    'Food & Bakery',
    'Agriculture & Agro-Processing',
    'Handicrafts & Artisanal',
    'Beauty & Wellness',
    'Technology & Digital Services'
  ];

  useEffect(() => {
    loadMentorsData();
  }, [selectedDomain, profile]);

  const loadMentorsData = async () => {
    setLoading(true);
    try {
      const [mData, rData, cData] = await Promise.all([
        api.getMentors(selectedDomain),
        api.getMyMentorshipRequests().catch(() => []),
        api.getConversations().catch(() => [])
      ]);
      setMentors(mData);
      setMyRequests(rData);
      setConversations(cData);
      if (cData.length > 0 && !activeConv) {
        setActiveConv(cData[0]);
      }
    } catch (err) {
      console.error('Failed to load mentors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeConv) {
      api.getMessages(activeConv.id)
        .then(setMessages)
        .catch(console.error);
    }
  }, [activeConv]);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMentor) return;

    setBookingLoading(true);
    try {
      await api.requestMentorship({
        mentor_id: bookingMentor.id,
        subject: bookingSubject || 'Strategic Consultation',
        domain: bookingMentor.business_domain,
        message: bookingMessage,
        preferred_slot: bookingSlot || bookingMentor.availability_schedule[0]
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setBookingMentor(null);
        setBookingSubject('');
        setBookingMessage('');
        loadMentorsData();
      }, 1500);
    } catch (err) {
      console.error('Booking failed', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !newMessageText.trim()) return;

    setSendingMsg(true);
    try {
      const msg = await api.sendMessage(activeConv.other_user_id, newMessageText);
      setMessages([...messages, msg]);
      setNewMessageText('');
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleStatusUpdate = async (reqId: number, status: string) => {
    try {
      await api.updateMentorshipStatus(reqId, status);
      setMyRequests(myRequests.map(r => r.id === reqId ? { ...r, status: status as any } : r));
    } catch (err) {
      console.error('Failed to update request status', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush text-plum text-xs font-semibold">
            <Users size={14} className="text-coral" />
            <span>Peer Entrepreneur & Mentor Network</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-charcoal">
            Entrepreneur Connect
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-light max-w-2xl">
            Directly learn from and consult with experienced women founders who have built sustainable businesses in your domain.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-cream p-1.5 rounded-2xl border border-plum/10 shrink-0">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'directory' ? 'bg-plum text-white shadow-sm' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Find Mentors
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all relative ${
              activeTab === 'requests' ? 'bg-plum text-white shadow-sm' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            My Sessions ({myRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'chat' ? 'bg-plum text-white shadow-sm' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Messages
          </button>
        </div>
      </div>

      {/* TAB 1: DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Domain Filter Pills */}
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

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {mentors.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow card-hover flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top card info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={m.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}
                      alt={m.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-plum/15 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=54245F&color=fff`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-charcoal font-heading truncate">{m.name}</h3>
                          {m.verification_status === 'verified' && (
                            <span title="RiseHer Verified Founder">
                              <ShieldCheck size={16} className="text-success shrink-0" />
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-success flex items-center gap-1">
                          <Sparkles size={12} />
                          <span>{m.match_score ? `${Math.round(m.match_score)}% Match` : '95% Match'}</span>
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-empowerment-purple">{m.business_name}</p>
                      <p className="text-[11px] text-charcoal-muted flex items-center gap-1 mt-0.5">
                        <MapPin size={11} />
                        <span>{m.location}</span>
                        <span>•</span>
                        <span>{m.years_experience} Yrs Experience</span>
                      </p>
                    </div>
                  </div>

                  {/* Business Description */}
                  <p className="text-xs text-charcoal-light mt-3 leading-relaxed">
                    {m.business_description}
                  </p>

                  {/* AI Matching Rationale: "Why this mentor is suitable for you" */}
                  <div className="mt-3 p-3 rounded-2xl bg-blush/40 border border-plum/10 text-xs">
                    <span className="font-bold text-plum block text-[11px] mb-0.5">Why this mentor is suitable for you:</span>
                    <p className="text-charcoal-light text-[11px]">{m.why_suitable_for_user || 'Direct domain peer with verified scaling track record in India.'}</p>
                  </div>

                  {/* Expertise Areas */}
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {m.expertise_areas.map((exp, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-cream border border-plum/10 text-charcoal font-medium">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-xs font-bold text-charcoal">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span>{m.rating}</span>
                    <span className="text-[10px] text-charcoal-muted font-normal">({m.reviews_count} reviews)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        api.sendMessage(m.user_id, `Hello ${m.name}! I would love to connect regarding my ${profile?.business_domain || 'business'} venture.`);
                        setActiveTab('chat');
                      }}
                      className="px-3 py-2 rounded-xl border border-plum/20 hover:bg-blush text-plum text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <MessageSquare size={13} />
                      <span>Message</span>
                    </button>
                    <button
                      onClick={() => setBookingMentor(m)}
                      className="px-4 py-2 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Calendar size={13} />
                      <span>Book Session</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY MENTORSHIP SESSIONS */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-4">
          <h3 className="text-lg font-bold font-heading text-charcoal">Consultation Sessions & Appointments</h3>
          
          {myRequests.length === 0 ? (
            <div className="text-center py-12 text-charcoal-muted text-xs">
              No sessions scheduled yet. Click "Book Session" on any mentor in the directory.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {myRequests.map((req) => (
                <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-charcoal">{req.subject}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        req.status === 'accepted' ? 'bg-emerald-50 text-success' :
                        req.status === 'completed' ? 'bg-purple-50 text-empowerment-purple' :
                        'bg-orange-50 text-coral-dark'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-charcoal-muted">
                      With: <span className="font-semibold text-charcoal">{req.mentor_name}</span> • Sector: {req.domain}
                    </p>
                    <p className="text-charcoal-light italic">"{req.message}"</p>
                    {req.preferred_slot && (
                      <p className="text-empowerment-purple font-medium flex items-center gap-1">
                        <Clock size={12} />
                        <span>Scheduled: {req.preferred_slot}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.meeting_link && req.status === 'accepted' && (
                      <a
                        href={req.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-success hover:bg-success-dark text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Video size={14} />
                        <span>Join Meeting Link</span>
                      </a>
                    )}
                    {user?.role === 'mentor' && req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(req.id, 'accepted')}
                          className="px-3 py-1.5 rounded-xl bg-success text-white font-bold"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(req.id, 'declined')}
                          className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 font-bold"
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DIRECT MESSAGING */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-plum/15 card-shadow overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
          {/* Conversation List (4 cols) */}
          <div className="md:col-span-4 border-r border-gray-100 p-4 space-y-2 bg-cream/40">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted block px-2">Conversations</span>
            <div className="space-y-1">
              {conversations.map((c) => {
                const isActive = activeConv?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConv(c)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                      isActive ? 'bg-white shadow-sm border border-plum/20' : 'hover:bg-white/80'
                    }`}
                  >
                    <img
                      src={c.other_user_avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80'}
                      alt={c.other_user_name}
                      className="w-10 h-10 rounded-full object-cover border border-plum/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-charcoal truncate">{c.other_user_name}</span>
                        {c.unread_count > 0 && (
                          <span className="w-2 h-2 rounded-full bg-coral" />
                        )}
                      </div>
                      <p className="text-charcoal-muted truncate text-[11px]">{c.last_message || 'Consultation chat'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Chat Area (8 cols) */}
          <div className="md:col-span-8 flex flex-col justify-between p-4 bg-white">
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeConv.other_user_avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80'}
                      alt={activeConv.other_user_name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-charcoal">{activeConv.other_user_name}</p>
                      <p className="text-[10px] text-success font-medium">Direct Mentor Messaging Active</p>
                    </div>
                  </div>
                </div>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3 max-h-[350px]">
                  {messages.map((m) => {
                    const isMe = m.sender_id === user?.id;
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isMe ? 'bg-plum text-white rounded-br-none' : 'bg-cream text-charcoal border border-plum/10 rounded-bl-none'
                        }`}>
                          <p>{m.content}</p>
                          <span className={`text-[9px] block text-right mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="pt-3 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder="Type your question or advice message..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-plum"
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg || !newMessageText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-charcoal-muted text-xs">
                Select a conversation or start a new message from the Mentor Directory.
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-plum/20 shadow-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold font-heading text-charcoal">
              Book Consultation Session with {bookingMentor.name}
            </h3>
            <p className="text-xs text-charcoal-muted">
              {bookingMentor.business_name} • {bookingMentor.business_domain}
            </p>

            {bookingSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-success text-center text-sm font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 size={18} />
                <span>Consultation request submitted successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Topic / Subject</label>
                  <input
                    type="text"
                    value={bookingSubject}
                    onChange={(e) => setBookingSubject(e.target.value)}
                    placeholder="e.g. Sourcing suppliers, pricing margin review"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Select Available Time Window</label>
                  <select
                    value={bookingSlot}
                    onChange={(e) => setBookingSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  >
                    {bookingMentor.availability_schedule.map((slot, i) => (
                      <option key={i} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Specific Questions / Context</label>
                  <textarea
                    value={bookingMessage}
                    onChange={(e) => setBookingMessage(e.target.value)}
                    rows={3}
                    placeholder="Share your current stage and what you hope to get guidance on..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingMentor(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-charcoal-muted hover:text-charcoal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="px-5 py-2 rounded-xl bg-plum hover:bg-plum-dark text-white font-bold"
                  >
                    {bookingLoading ? 'Submitting...' : 'Confirm Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
