import React, { useState, useEffect } from 'react';
import { EmailLog, NotificationPreferences } from '../types';
import { api } from '../services/api';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Settings, 
  Plus, 
  Search, 
  Clock, 
  AlertCircle, 
  Sparkles,
  Inbox,
  Filter
} from 'lucide-react';

interface EmailGatewayModuleProps {
  logs: EmailLog[];
  preferences: NotificationPreferences;
  onRefresh: () => void;
  id?: string;
}

export const EmailGatewayModule: React.FC<EmailGatewayModuleProps> = ({
  logs,
  preferences,
  onRefresh,
  id = "email-gateway-module"
}) => {
  const [activeTab, setActiveTab] = useState<'OUTBOX' | 'COMPOSE' | 'TRIGGERS'>('OUTBOX');
  const [prefs, setPrefs] = useState<NotificationPreferences>(preferences);
  
  // Compose Form State
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailMessage, setMailMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DELIVERED' | 'MANUAL'>('ALL');

  useEffect(() => {
    setPrefs(preferences);
  }, [preferences]);

  const handleTogglePref = async (key: keyof NotificationPreferences) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      await api.updatePreferences(updated);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyTemplate = (subj: string, msg: string) => {
    setMailSubject(subj);
    setMailMessage(msg);
  };

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !mailMessage) return;
    setIsSending(true);
    setSendFeedback(null);
    try {
      const res = await api.sendDirectEmail(
        recipientEmail, 
        mailMessage, 
        mailSubject || 'Campus Notice', 
        'Admin Communication',
        recipientName || undefined
      );

      if (res.status === 'FAILED' || res.error) {
        throw new Error(res.error || res.response_details?.error || 'Email delivery failed. Please verify the recipient address.');
      }

      setSendFeedback({
        type: 'success',
        message: `Mail delivered to ${recipientEmail}! (Please check Spam/Junk or All Mail if not visible in Primary inbox).`
      });

      onRefresh();
      setTimeout(() => {
        setRecipientEmail('');
        setRecipientName('');
        setMailSubject('');
        setMailMessage('');
        setSendFeedback(null);
        setActiveTab('OUTBOX');
      }, 1500);
    } catch (err: any) {
      setSendFeedback({
        type: 'error',
        message: `Error sending mail: ${err.message}`
      });
    } finally {
      setIsSending(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesQuery = 
      (log.recipient_email && log.recipient_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.recipient_name && log.recipient_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.subject && log.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.message && log.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.trigger_event && log.trigger_event.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;

    if (statusFilter === 'DELIVERED') return log.status === 'DELIVERED' || log.status === 'SENT';
    if (statusFilter === 'MANUAL') return log.trigger_event.toLowerCase().includes('manual') || log.trigger_event.toLowerCase().includes('admin');
    return true;
  });

  return (
    <div id={id} className="space-y-6">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2B2020] tracking-tight">
            Campus Mails
          </h1>
          <p className="text-sm text-[#756565] mt-1 font-sans">
            Official communications, automated event dispatch, and sent mail outbox.
          </p>
        </div>

        {/* Clean Navigation & Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#FFF8EC]/90 p-1 rounded-xl border border-[#6B1E2B]/15 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('OUTBOX')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'OUTBOX' ? 'bg-[#6B1E2B] text-white shadow-sm' : 'text-[#756565] hover:text-[#2B2020]'
              }`}
            >
              Outbox ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('COMPOSE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'COMPOSE' ? 'bg-[#6B1E2B] text-white shadow-sm' : 'text-[#756565] hover:text-[#2B2020]'
              }`}
            >
              Compose Mail
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('TRIGGERS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'TRIGGERS' ? 'bg-[#6B1E2B] text-white shadow-sm' : 'text-[#756565] hover:text-[#2B2020]'
              }`}
            >
              Routing Triggers
            </button>
          </div>

          {activeTab === 'OUTBOX' && (
            <button
              type="button"
              onClick={() => setActiveTab('COMPOSE')}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#6B1E2B] hover:bg-[#42121C] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Mail</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: OUTBOX & SENT HISTORY                                   */}
      {/* ============================================================== */}
      {activeTab === 'OUTBOX' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#756565] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search outbox by recipient, subject, or message..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/20 text-sm text-[#2B2020] placeholder:text-[#9A8989] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono shadow-sm transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#756565] uppercase font-bold mr-1">Filter:</span>
              {[
                { id: 'ALL', label: `All (${logs.length})` },
                { id: 'DELIVERED', label: 'Delivered' },
                { id: 'MANUAL', label: 'Manual' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    statusFilter === f.id
                      ? 'bg-[#6B1E2B] text-white shadow-xs'
                      : 'bg-[#FFF8EC]/90 text-[#756565] hover:text-[#2B2020] border border-[#6B1E2B]/15 hover:bg-[#F3EBDD]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Outbox Cards List */}
          <div className="rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] overflow-hidden">
            <div className="p-4 border-b border-[#6B1E2B]/10 flex items-center justify-between bg-[#FFF8EC]/90">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#6B1E2B]" />
                <h2 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                  Dispatched Mails Log ({filteredLogs.length} Messages)
                </h2>
              </div>
              <span className="text-xs font-mono text-[#756565]">
                Auto-refreshed
              </span>
            </div>

            <div className="divide-y divide-[#6B1E2B]/10">
              {filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-[#756565] font-mono text-sm space-y-3">
                  <Inbox className="w-8 h-8 text-[#6B1E2B]/40 mx-auto" />
                  <p>No dispatched mails found matching your criteria.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('COMPOSE')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#6B1E2B] text-white hover:bg-[#42121C] cursor-pointer transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Compose New Mail</span>
                  </button>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="p-4.5 hover:bg-[#F3EBDD]/40 transition-colors space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#6B1E2B]">
                          {log.recipient_email || log.recipient_phone}
                        </span>
                        {log.recipient_name && (
                          <span className="text-xs font-medium text-[#756565]">
                            ({log.recipient_name})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#756565] bg-[#F3EBDD] px-2.5 py-0.5 rounded border border-[#6B1E2B]/15">
                          {log.trigger_event}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                          log.status === 'DELIVERED' || log.status === 'SENT'
                            ? 'text-[#3D6B46] bg-[#5F8F68]/15 border-[#5F8F68]/30'
                            : 'text-[#6B1E2B] bg-[#6B1E2B]/10 border-[#6B1E2B]/20'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </div>

                    {log.subject && (
                      <div className="text-xs font-bold text-[#2B2020]">
                        Subject: {log.subject}
                      </div>
                    )}

                    <p className="text-xs font-mono text-[#2B2020] bg-[#F3EBDD]/60 p-3 rounded-xl border border-[#6B1E2B]/10 leading-relaxed whitespace-pre-line">
                      {log.message}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#756565] pt-0.5">
                      <span>Template: <strong className="text-[#2B2020]">{log.template_id || 'DEVORA_STANDARD'}</strong></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#756565]" />
                        {new Date(log.created_at).toLocaleString([], { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: COMPOSE MAIL FORM                                       */}
      {/* ============================================================== */}
      {activeTab === 'COMPOSE' && (
        <div className="max-w-2xl mx-auto">
          <div className="p-6 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#6B1E2B]/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6B1E2B]/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#6B1E2B]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#2B2020]">
                    Compose Campus Mail
                  </h2>
                  <p className="text-xs text-[#756565] font-mono">
                    Direct dispatch to students, parents, or staff members
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('OUTBOX')}
                className="text-xs font-mono text-[#756565] hover:text-[#2B2020] cursor-pointer"
              >
                Back to Outbox
              </button>
            </div>

            {/* Quick Templates */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1.5">
                Quick Template Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: 'Campus Inspection',
                    subj: 'DEVORA ALERT: Science Lab Inspection',
                    msg: 'Science Lab inspection is scheduled for 2:00 PM today. Please confirm equipment check readiness.'
                  },
                  {
                    label: 'Faculty Notice',
                    subj: 'DEVORA NOTICE: Mandatory Faculty Meeting',
                    msg: 'All department heads and faculty members are requested to join the general assembly at 3:30 PM in Hall A.'
                  },
                  {
                    label: 'Parental Attendance Alert',
                    subj: 'DEVORA ACADEMIC ALERT: Attendance Warning',
                    msg: 'This is an operational notification regarding student attendance. Please review the portal for attendance records.'
                  }
                ].map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl.subj, tpl.msg)}
                    className="text-xs font-mono px-3 py-1 rounded-lg bg-[#F3EBDD] hover:bg-[#E8DDCA] border border-[#6B1E2B]/15 text-[#2B2020] transition-colors cursor-pointer"
                  >
                    + {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSendMail} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="e.g. rajesh.k@devora.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                    Recipient Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                  Mail Subject *
                </label>
                <input
                  type="text"
                  required
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  placeholder="Campus Notice Subject"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                  Mail Content Body *
                </label>
                <textarea
                  rows={4}
                  required
                  value={mailMessage}
                  onChange={(e) => setMailMessage(e.target.value)}
                  placeholder="Write official campus announcement or notification..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]"
                />
              </div>

              {sendFeedback && (
                <div className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                  sendFeedback.type === 'success'
                    ? 'bg-[#5F8F68]/15 border border-[#5F8F68]/30 text-[#3D6B46]'
                    : 'bg-[#B94A55]/15 border border-[#B94A55]/30 text-[#B94A55]'
                }`}>
                  {sendFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{sendFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#6B1E2B]/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('OUTBOX')}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-[#756565] hover:text-[#2B2020] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#6B1E2B] hover:bg-[#42121C] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Sending Mail...' : 'Send Campus Mail'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: AUTOMATED ROUTING TRIGGERS                              */}
      {/* ============================================================== */}
      {activeTab === 'TRIGGERS' && (
        <div className="max-w-2xl mx-auto">
          <div className="p-6 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] space-y-5">
            <div className="flex items-center justify-between border-b border-[#6B1E2B]/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6B1E2B]/10 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-[#6B1E2B]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#2B2020]">
                    Automated Mail Triggers
                  </h2>
                  <p className="text-xs text-[#756565] font-mono">
                    System rules for automated dispatch on campus lifecycle events
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { 
                  key: 'email_leave_updates', 
                  altKey: 'sms_leave_updates',
                  label: 'Leave Approvals & Rejections', 
                  desc: 'Dispatches automated mail to applicant when administrative status is decided' 
                },
                { 
                  key: 'email_maintenance_urgent', 
                  altKey: 'sms_maintenance_urgent',
                  label: 'Urgent Maintenance Assignments', 
                  desc: 'Sends detailed dispatch notification to assigned campus maintenance technician' 
                },
                { 
                  key: 'email_emergency_alerts', 
                  altKey: 'sms_emergency_alerts',
                  label: 'Emergency Campus Broadcasts', 
                  desc: 'Dispatches high-priority bulletin emails to campus groups and parents' 
                },
                { 
                  key: 'email_attendance_low', 
                  altKey: 'sms_attendance_low',
                  label: 'Low Attendance Parental Alerts', 
                  desc: 'Alerts guardians when student cumulative attendance falls below threshold (75%)' 
                },
                { 
                  key: 'email_request_resolved', 
                  altKey: 'sms_request_resolved',
                  label: 'Request Resolution Confirmation', 
                  desc: 'Notifies requester upon campus issue or ticket resolution' 
                }
              ].map(({ key, altKey, label, desc }) => {
                const isEnabled = prefs[key as keyof NotificationPreferences] ?? prefs[altKey as keyof NotificationPreferences] ?? true;
                return (
                  <div key={key} className="flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-[#F3EBDD]/60 transition-colors border border-transparent hover:border-[#6B1E2B]/10">
                    <div>
                      <div className="text-xs font-bold text-[#2B2020]">{label}</div>
                      <div className="text-[11px] text-[#756565] mt-0.5 leading-relaxed">{desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePref(key as keyof NotificationPreferences)}
                      className={`w-11 h-6 rounded-full transition-all relative cursor-pointer shrink-0 mt-0.5 p-0.5 border ${
                        isEnabled
                          ? 'bg-[#6B1E2B] border-[#6B1E2B]'
                          : 'bg-[#E8DDCA] border-[#6B1E2B]/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full transition-transform transform ${
                          isEnabled
                            ? 'translate-x-5 bg-white shadow-sm'
                            : 'translate-x-0 bg-[#756565]'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SMSGatewayModule = EmailGatewayModule;
