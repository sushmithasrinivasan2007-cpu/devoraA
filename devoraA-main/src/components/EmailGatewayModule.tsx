import React, { useState, useEffect } from 'react';
import { SMSLog as EmailLog, NotificationPreferences } from '../types';
import { api } from '../services/api';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Server
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
  const [prefs, setPrefs] = useState<NotificationPreferences>(preferences);
  const [smtpStatus, setSmtpStatus] = useState<{ configured: boolean; connected: boolean; message: string } | null>(null);
  const [isCheckingSmtp, setIsCheckingSmtp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DELIVERED' | 'SENT' | 'FAILED'>('ALL');

  const checkSmtp = async () => {
    setIsCheckingSmtp(true);
    try {
      const status = await api.getSMTPStatus();
      setSmtpStatus(status);
    } catch (err: any) {
      setSmtpStatus({
        configured: false,
        connected: false,
        message: err.message || 'Failed to query Mail status'
      });
    } finally {
      setIsCheckingSmtp(false);
    }
  };

  useEffect(() => {
    checkSmtp();
  }, []);

  const handleTogglePref = async (key: keyof NotificationPreferences) => {
    const updated = {
      ...prefs,
      [key]: !prefs[key]
    };
    setPrefs(updated);
    try {
      await api.updatePreferences(updated);
      onRefresh();
    } catch (err) {
      console.error(err);
      setPrefs(prefs);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      (log.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      log.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'DELIVERED' && (log.status === 'DELIVERED' || log.status === 'SENT')) ||
      log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div id={id} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2B2020] tracking-tight flex flex-wrap items-center gap-2.5">
            <span>Mails</span>
            <span className="text-xs font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2.5 py-0.5 rounded-full border border-[#6B1E2B]/20">
              Mails Engine
            </span>
          </h1>
          <p className="text-sm text-[#756565] mt-1 font-sans">
            Real-time automated mail dispatch monitor for campus leaves, urgent maintenance routing, and broadcast notices.
          </p>
        </div>

        <button
          onClick={checkSmtp}
          disabled={isCheckingSmtp}
          className="flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-full border transition-all cursor-pointer font-semibold shadow-sm bg-white/70 hover:bg-white text-[#2B2020] border-[#6B1E2B]/20"
        >
          <Server className={`w-3.5 h-3.5 ${isCheckingSmtp ? 'animate-spin text-[#6B1E2B]' : 'text-[#3D6B46]'}`} />
          <span>
            {smtpStatus?.connected ? 'Mail Server: Connected' : 'Mail Service: Active'}
          </span>
          <RefreshCw className={`w-3 h-3 text-[#756565] ${isCheckingSmtp ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Email Routing Triggers */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#6B1E2B]/10 pb-3">
              <Settings className="w-4 h-4 text-[#6B1E2B]" />
              <h2 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                Email Routing Triggers
              </h2>
            </div>

            <div className="space-y-2.5">
              {[
                { 
                  key: 'email_leave_updates', 
                  altKey: 'sms_leave_updates',
                  label: 'Leave Approvals & Rejections', 
                  desc: 'Dispatches automated email to applicant when status updates' 
                },
                { 
                  key: 'email_maintenance_urgent', 
                  altKey: 'sms_maintenance_urgent',
                  label: 'Urgent Maintenance Assignments', 
                  desc: 'Sends detailed dispatch notification to assigned technician' 
                },
                { 
                  key: 'email_emergency_alerts', 
                  altKey: 'sms_emergency_alerts',
                  label: 'Emergency Campus Broadcasts', 
                  desc: 'Dispatches high-priority bulletin emails to campus groups' 
                },
                { 
                  key: 'email_attendance_low', 
                  altKey: 'sms_attendance_low',
                  label: 'Low Attendance Alerts', 
                  desc: 'Alerts registered contacts when student attendance falls below 80%' 
                },
                { 
                  key: 'email_request_resolved', 
                  altKey: 'sms_request_resolved',
                  label: 'Request Resolution Confirmation', 
                  desc: 'Notifies requester upon campus issue resolution' 
                }
              ].map(({ key, altKey, label, desc }) => {
                const isEnabled = prefs[key as keyof NotificationPreferences] ?? prefs[altKey as keyof NotificationPreferences] ?? true;
                return (
                  <div key={key} className="flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-[#F3EBDD]/60 transition-colors">
                    <div>
                      <div className="text-xs font-bold text-[#2B2020]">{label}</div>
                      <div className="text-[11px] text-[#756565] mt-0.5">{desc}</div>
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

        {/* Right Col: Mail Delivery Audit Log Table */}
        <div className="lg:col-span-2 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#6B1E2B]/10 flex items-center justify-between bg-[#FFF8EC]/90">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#6B1E2B]" />
              <h2 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                Mail Delivery Audit Log ({logs.length} Events)
              </h2>
            </div>
            <span className="text-xs font-mono text-[#756565] font-medium">
              Auto-synced
            </span>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-3 border-b border-[#6B1E2B]/10 bg-[#F3EBDD]/30 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#756565]" />
              <input
                type="text"
                placeholder="Search mail logs by recipient, subject, or message content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/70 border border-[#6B1E2B]/15 text-xs font-mono text-[#2B2020] focus:outline-none focus:border-[#6B1E2B]"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#756565]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs font-mono bg-white/70 border border-[#6B1E2B]/15 rounded-xl px-2.5 py-1.5 text-[#2B2020] focus:outline-none focus:border-[#6B1E2B]"
              >
                <option value="ALL">All Status</option>
                <option value="DELIVERED">Delivered / Sent</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#6B1E2B]/10 bg-[#F3EBDD]/60 text-[11px] font-mono font-bold text-[#756565] uppercase">
                  <th className="p-3">Event / Subject</th>
                  <th className="p-3">Recipient Email</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Dispatched Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6B1E2B]/5 text-xs font-mono">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-[#756565]">
                      No mail dispatch events match your current filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F3EBDD]/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-[#2B2020] text-xs">{log.subject}</div>
                        <div className="text-[11px] text-[#756565] mt-0.5 line-clamp-1">{log.message}</div>
                        <div className="text-[10px] text-[#6B1E2B] font-semibold uppercase mt-0.5">{log.trigger_event}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-[#2B2020] font-medium">{log.recipient_email}</div>
                        {log.recipient_name && (
                          <div className="text-[11px] text-[#756565]">{log.recipient_name}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          log.status === 'DELIVERED' || log.status === 'SENT'
                            ? 'bg-[#5F8F68]/15 text-[#3D6B46] border border-[#5F8F68]/30'
                            : log.status === 'FAILED'
                            ? 'bg-[#B94A55]/15 text-[#B94A55] border border-[#B94A55]/30'
                            : 'bg-[#B08A2E]/15 text-[#8A6715] border border-[#B08A2E]/30'
                        }`}>
                          {log.status === 'DELIVERED' || log.status === 'SENT' ? (
                            <CheckCircle2 className="w-3 h-3 text-[#3D6B46]" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-[#B94A55]" />
                          )}
                          <span>{log.status === 'SENT' ? 'DELIVERED' : log.status}</span>
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-[#756565] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        <span className="block text-[10px] text-[#9A8989]">
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
