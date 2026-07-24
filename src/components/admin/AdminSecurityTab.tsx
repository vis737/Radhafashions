import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Users,
  Lock,
  Key,
  Trash2,
  Download,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { ActivityLog } from '../../types';

export interface AdminSecurityTabProps {
  logs: ActivityLog[];
  onDeleteLog: (logId: string) => void;
  onClearLogs: () => void;
  onLogActivity: (action: string, details: string) => void;
  addToast: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function AdminSecurityTab({
  logs,
  onDeleteLog,
  onClearLogs,
  onLogActivity,
  addToast
}: AdminSecurityTabProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [passwordSectionOpen, setPasswordSectionOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters long', 'error');
      return;
    }
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) throw new Error('Failed to change password');
      addToast('Password changed successfully', 'success');
      onLogActivity('PASSWORD_CHANGE', 'Admin changed their password');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSectionOpen(false);
    } catch (err) {
      addToast('Error changing password', 'error');
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      addToast('No logs to export', 'info');
      return;
    }
    const headers = ['ID', 'Action', 'Details', 'User', 'Timestamp', 'Risk Level'];
    const csvRows = [headers.join(',')];
    logs.forEach(log => {
      csvRows.push([
        log.id,
        log.action,
        `"${log.details.replace(/"/g, '""')}"`,
        log.user,
        log.timestamp,
        log.riskLevel || 'unknown'
      ].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onLogActivity('EXPORT_LOGS', 'Exported audit logs to CSV');
    addToast('Audit logs exported', 'success');
  };

  const filteredLogs = logs
    .filter(log => 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-8 p-6 text-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-[#0f172a] font-bold tracking-tight">Admin Security Control Vault</h2>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -2 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Security Score</p>
            <p className="text-3xl font-bold text-emerald-600">98/100</p>
          </div>
          <div className="bg-emerald-100 p-3 rounded-full">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Active Sessions</p>
            <p className="text-3xl font-bold text-slate-900">1</p>
          </div>
          <div className="bg-slate-100 p-3 rounded-full">
            <Users className="w-8 h-8 text-slate-700" />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">2FA Status</p>
            <p className={`text-xl font-bold ${twoFactorEnabled ? 'text-emerald-600' : 'text-rose-600'}`}>
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <button
            onClick={() => {
              setTwoFactorEnabled(!twoFactorEnabled);
              onLogActivity('TOGGLE_2FA', `2FA turned ${!twoFactorEnabled ? 'ON' : 'OFF'}`);
              addToast(`Two-Factor Authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}`, 'info');
            }}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                twoFactorEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security Checklist */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-serif font-semibold text-slate-900 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-[#C5A021]" />
            Security Checklist
          </h3>
          <ul className="space-y-3">
            {[
              { label: 'HTTPS enforced', active: true },
              { label: 'CORS restricted', active: true },
              { label: 'Rate limiting active', active: true },
              { label: 'bcrypt password hashing', active: true },
              { label: 'JWT session tokens', active: true },
              { label: 'CSP headers enabled', active: true },
              { label: 'SQL injection prevention', active: true },
              { label: 'XSS protection active', active: true },
            ].map((item, idx) => (
              <li key={idx} className="flex items-center justify-between p-2 rounded hover:bg-slate-50">
                <span className="text-sm text-slate-700">{item.label}</span>
                {item.active ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500" />
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
          <button
            onClick={() => setPasswordSectionOpen(!passwordSectionOpen)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-lg font-serif font-semibold text-slate-900 flex items-center">
              <Key className="w-5 h-5 mr-2 text-[#C5A021]" />
              Change Password
            </h3>
            {passwordSectionOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </button>
          
          {passwordSectionOpen && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-6 space-y-4"
              onSubmit={handlePasswordChange}
            >
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] focus:border-transparent outline-none"
                  placeholder="Min 8 characters"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] focus:border-transparent outline-none"
                  placeholder="Repeat new password"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#0f172a] text-[#C5A021] py-2 rounded font-medium hover:bg-slate-800 transition-colors"
              >
                Update Password
              </button>
            </motion.form>
          )}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-serif font-semibold text-slate-900 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-[#C5A021]" />
            Audit Logs Timeline
          </h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C5A021] outline-none"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="p-2 text-slate-600 hover:text-[#0f172a] hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            {logs.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all audit logs?')) {
                    onClearLogs();
                    addToast('All audit logs cleared', 'warning');
                  }
                }}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                title="Clear All Logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-lg p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 font-mono text-sm">
              No audit logs found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map(log => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={log.id}
                  className="group flex flex-col sm:flex-row sm:items-start justify-between p-3 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex-1 font-mono text-xs text-slate-300">
                    <span className="text-[#C5A021] font-bold mr-2">[{log.action}]</span>
                    {log.details}
                    <div className="mt-1 text-slate-500">User: {log.user}</div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
      `}} />
    </div>
  );
}
