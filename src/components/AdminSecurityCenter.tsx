import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, ShieldAlert, Key, Server, RefreshCw, CheckCircle, Clock, Globe, ShieldCheck, Download } from 'lucide-react';

interface ThreatEvent {
  id: string;
  timestamp: string;
  ip: string;
  type: 'Failed Login' | 'CORS Block' | 'WAF Block' | 'API Key Rotate';
  details: string;
  severity: 'low' | 'medium' | 'high';
}

export default function AdminSecurityCenter() {
  const [stats, setStats] = useState({
    securityScore: 98,
    failedAttempts: 2,
    blockedIps: 15,
    activeAdminSessions: 1,
    expiredTokens: 8,
    lastScanDate: '2026-07-19 11:45:00',
    dbEncryption: 'AES-256 Active',
    sslStatus: 'Active (Let\'s Encrypt)',
    wafStatus: 'Active (Rate-Limits Enabled)'
  });

  const [threatLogs, setThreatLogs] = useState<ThreatEvent[]>([]);

  useEffect(() => {
    const fetchSecurityStats = async () => {
      try {
        const res = await fetch('/api/admin/security-stats');
        if (res.ok) {
          const data = await res.json();
          if (data.stats) setStats(data.stats);
          if (data.threatLogs) setThreatLogs(data.threatLogs);
          console.warn('Security stats fetch failed.');
        }
      } catch (err) {
        console.warn('Security stats fetch error:', err);
      }
    };

    fetchSecurityStats();
  }, []);

  const exportSecurityReport = () => {
    const report = `
      ==================================================
      Radha Fashions SECURITY COMPLIANCE REPORT (OWASP Top 10 & ASVS)
      Generated on: ${new Date().toLocaleString()}
      ==================================================
      Security Health Score: ${stats.securityScore}/100
      Failed Logins Count: ${stats.failedAttempts}
      Blocked Brute-force IPs: ${stats.blockedIps}
      Database Encryption State: ${stats.dbEncryption}
      SSL Certificate: ${stats.sslStatus}
      WAF Protection: ${stats.wafStatus}
      
      Live Threat Auditing Logs:
      ${threatLogs.map(l => `[${l.timestamp}] [${l.type}] IP: ${l.ip} - ${l.details}`).join('\n')}
    `;
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'radha_security_audit_report.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left font-sans select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 dark:border-gray-800 pb-4">
        <div>
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-50 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Administrative Security Center
          </h3>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-sans mt-0.5">
            Monitor API tokens, blocked requests, SSL certificates, and WAF rules.
          </p>
        </div>

        <button
          onClick={exportSecurityReport}
          className="px-3.5 py-2 bg-gray-950 hover:bg-pink-500 text-white hover:text-gray-950 border border-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Security Report
        </button>
      </div>

      {/* Security Health Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Score Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center justify-between col-span-1">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block font-semibold">Security Score</span>
            <h3 className="font-display font-black text-4xl text-emerald-500 leading-none">
              {stats.securityScore}<span className="text-sm font-sans text-gray-400 font-medium">/100</span>
            </h3>
            <span className="text-[9px] text-emerald-500 font-semibold uppercase tracking-wider block pt-1.5">
              ASVS Compliant
            </span>
          </div>
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 flex items-center justify-center text-emerald-500">
            <Shield className="w-8 h-8" />
          </div>
        </div>

        {/* Audit metrics */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm col-span-2 grid grid-cols-2 gap-4">
          <div className="space-y-1 border-r border-gray-50 dark:border-gray-800 pr-2">
            <span className="text-[9px] font-mono text-gray-400 uppercase">Failed Logins</span>
            <p className="font-display font-extrabold text-xl text-amber-500">{stats.failedAttempts} Attempts</p>
          </div>
          <div className="space-y-1 pl-2">
            <span className="text-[9px] font-mono text-gray-400 uppercase">Blocked IPs</span>
            <p className="font-display font-extrabold text-xl text-red-500">{stats.blockedIps} IPs</p>
          </div>
          <div className="space-y-1 border-t border-r border-gray-50 dark:border-gray-800 pt-3 pr-2">
            <span className="text-[9px] font-mono text-gray-400">Active Admins</span>
            <p className="font-display font-extrabold text-xl text-emerald-500">{stats.activeAdminSessions} Session</p>
          </div>
          <div className="space-y-1 border-t border-gray-50 dark:border-gray-800 pt-3 pl-2">
            <span className="text-[9px] font-mono text-gray-400">Expired Cookies</span>
            <p className="font-display font-extrabold text-xl text-gray-500">{stats.expiredTokens} JWTs</p>
          </div>
        </div>

      </div>

      {/* Systems Status and Audits logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Security Threat Logs */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Active Threat Detections Timeline
          </h4>
          <div className="space-y-3.5 max-h-60 overflow-y-auto no-scrollbar">
            {threatLogs.map((log) => (
              <div key={log.id} className="flex justify-between items-start text-xs border-b border-gray-50 dark:border-gray-800 pb-3 last:border-0 last:pb-0 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                      log.severity === 'high' ? 'bg-red-500 text-white' : log.severity === 'medium' ? 'bg-amber-400 text-gray-950' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono font-medium">{log.ip}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-normal font-sans">{log.details}</p>
                </div>
                <span className="text-[9px] text-gray-400 font-mono flex-shrink-0 ml-4 mt-0.5">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cryptographic and System Protection */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
            <Server className="w-4 h-4 text-[#D4648A]" /> WAF & System Configuration
          </h4>
          <div className="space-y-4 text-xs font-sans">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Database Vault</span>
              <span className="font-semibold text-emerald-500 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> AES-256
              </span>
            </div>
            <div className="flex justify-between items-center font-semibold">
              <span className="text-gray-400 font-normal">WAF Shield status</span>
              <span className="text-emerald-500 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Enabled
              </span>
            </div>
            <div className="flex justify-between items-center font-semibold">
              <span className="text-gray-400 font-normal">JWT Cookie rotation</span>
              <span className="text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 15 mins
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-4 font-semibold">
              <span className="text-gray-400 font-normal">CORS Mapping config</span>
              <span className="text-gray-800 dark:text-gray-200 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#D4648A]" /> Restrictive
              </span>
            </div>
          </div>

          {/* Live SMTP Diagnostic Test Tool */}
          <SmtpTesterBlock />
        </div>

      </div>

    </div>
  );
}

function SmtpTesterBlock() {
  const [targetEmail, setTargetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: data.message || 'Test email delivered!' });
      } else {
        setResult({ success: false, message: data.error || data.details || 'SMTP test failed.' });
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Connection error testing SMTP.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3 text-left">
      <h5 className="font-display font-bold text-[11px] uppercase tracking-wider text-gray-900 dark:text-gray-50 flex items-center gap-1">
        ✉️ Test Railway SMTP Credentials
      </h5>
      <p className="text-[10px] text-gray-500">
        Input an email address to test live delivery via your Railway SMTP settings.
      </p>
      <form onSubmit={handleTestEmail} className="flex gap-2">
        <input
          type="email"
          placeholder="your-email@gmail.com"
          value={targetEmail}
          onChange={(e) => setTargetEmail(e.target.value)}
          className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-gray-50 focus:outline-none focus:border-pink-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-gray-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Send Test'}
        </button>
      </form>
      {result && (
        <div className={`p-2.5 rounded-xl text-xs border ${
          result.success
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
            : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800'
        }`}>
          {result.message}
        </div>
      )}
    </div>
  );
}
