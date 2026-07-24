import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { CMSConfig } from '../../types';

export interface AdminSettingsTabProps {
  cms: CMSConfig;
  onUpdateCMS: (cms: CMSConfig) => void;
  onLogActivity: (action: string, details: string) => void;
  addToast: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function AdminSettingsTab({ cms, onUpdateCMS, onLogActivity, addToast }: AdminSettingsTabProps) {
  const [localCms, setLocalCms] = useState<CMSConfig>(cms);
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  const handleUpdate = (field: keyof CMSConfig, value: any) => {
    setLocalCms(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSection = (sectionName: string, fieldsToSave: Array<keyof CMSConfig>) => {
    onUpdateCMS(localCms);
    onLogActivity('UPDATE_SETTINGS', `Updated settings section: ${sectionName}`);
    addToast(`${sectionName} saved successfully`, 'success');
  };

  const SectionLabel = ({ title }: { title: string }) => (
    <h3 className="font-mono text-[9px] text-[#C5A021] uppercase tracking-widest border-b border-slate-200 pb-1.5 mb-4">
      {title}
    </h3>
  );

  const SaveButton = ({ onClick, label }: { onClick: () => void, label: string }) => (
    <button
      onClick={onClick}
      className="mt-4 flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-[#0f172a] text-[#C5A021] rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
    >
      <Save className="w-4 h-4 mr-2" />
      Save {label}
    </button>
  );

  return (
    <div className="space-y-8 p-6 text-slate-800">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-serif text-[#0f172a] font-bold tracking-tight">Platform Configuration</h2>
      </div>

      {/* Section 1: MAINTENANCE MODE */}
      <div className={`p-6 rounded-xl border transition-colors ${localCms.maintenanceMode ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${localCms.maintenanceMode ? 'text-amber-600' : 'text-slate-400'}`} />
              Maintenance Mode
            </h3>
            <p className="text-sm mt-1 text-slate-600">
              {localCms.maintenanceMode 
                ? 'Storefront is currently in maintenance mode. Visitors will see a maintenance page.'
                : 'Storefront is currently active and accessible to all visitors.'}
            </p>
          </div>
          <button
            onClick={() => handleUpdate('maintenanceMode', !localCms.maintenanceMode)}
            className={`relative inline-flex h-10 w-16 items-center rounded-full transition-colors ${
              localCms.maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${
                localCms.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className="mt-4 flex justify-end">
          <SaveButton 
            onClick={() => handleSaveSection('Maintenance Mode', ['maintenanceMode'])} 
            label="Maintenance Settings" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Section 2: STORE BRANDING */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <SectionLabel title="Store Branding" />
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Store Name (Headline)</label>
              <input type="text" value={localCms.headline || ''} onChange={e => handleUpdate('headline', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Subheadline</label>
              <input type="text" value={localCms.subheadline || ''} onChange={e => handleUpdate('subheadline', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Logo URL</label>
              <input type="text" value={localCms.logoUrl || ''} onChange={e => handleUpdate('logoUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">About Text</label>
              <textarea value={localCms.aboutText || ''} onChange={e => handleUpdate('aboutText', e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
          </div>
          <SaveButton onClick={() => handleSaveSection('Store Branding', ['headline', 'subheadline', 'logoUrl', 'aboutText'])} label="Branding" />
        </div>

        {/* Section 3: CONTACT INFORMATION */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <SectionLabel title="Contact & Socials" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input type="email" value={localCms.contactEmail || ''} onChange={e => handleUpdate('contactEmail', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
              <input type="text" value={localCms.contactPhone || ''} onChange={e => handleUpdate('contactPhone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Address</label>
              <input type="text" value={localCms.contactAddress || ''} onChange={e => handleUpdate('contactAddress', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">WhatsApp</label>
              <input type="text" value={localCms.whatsappNumber || ''} onChange={e => handleUpdate('whatsappNumber', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Instagram</label>
              <input type="text" value={localCms.instagramLink || ''} onChange={e => handleUpdate('instagramLink', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Facebook</label>
              <input type="text" value={localCms.facebookLink || ''} onChange={e => handleUpdate('facebookLink', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Twitter</label>
              <input type="text" value={localCms.twitterLink || ''} onChange={e => handleUpdate('twitterLink', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
          </div>
          <SaveButton onClick={() => handleSaveSection('Contact Information', ['contactEmail', 'contactPhone', 'contactAddress', 'whatsappNumber', 'instagramLink', 'facebookLink', 'twitterLink'])} label="Contact Info" />
        </div>

        {/* Section 4: EMAIL/SMTP CONFIGURATION */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm xl:col-span-2">
          <SectionLabel title="Email & SMTP Configuration" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">SMTP Host</label>
              <input type="text" value={localCms.smtpHost || ''} onChange={e => handleUpdate('smtpHost', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">SMTP Port</label>
              <input type="text" value={localCms.smtpPort || ''} onChange={e => handleUpdate('smtpPort', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">SMTP User</label>
              <input type="text" value={localCms.smtpUser || ''} onChange={e => handleUpdate('smtpUser', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">SMTP Password</label>
              <div className="relative">
                <input type={showSmtpPass ? 'text' : 'password'} value={localCms.smtpPass || ''} onChange={e => handleUpdate('smtpPass', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded pl-3 pr-10 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
                <button onClick={() => setShowSmtpPass(!showSmtpPass)} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400">
                  {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold mb-2">Order Confirmation Email</h4>
              <input type="text" placeholder="Subject" value={localCms.emailOrderSubject || ''} onChange={e => handleUpdate('emailOrderSubject', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm mb-2 outline-none focus:ring-2 focus:ring-[#C5A021]" />
              <textarea placeholder="Body Template" rows={4} value={localCms.emailOrderBody || ''} onChange={e => handleUpdate('emailOrderBody', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C5A021]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Dispatch Notification Email</h4>
              <input type="text" placeholder="Subject" value={localCms.emailDispatchSubject || ''} onChange={e => handleUpdate('emailDispatchSubject', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm mb-2 outline-none focus:ring-2 focus:ring-[#C5A021]" />
              <textarea placeholder="Body Template" rows={4} value={localCms.emailDispatchBody || ''} onChange={e => handleUpdate('emailDispatchBody', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C5A021]" />
            </div>
          </div>
          <SaveButton onClick={() => handleSaveSection('Email Config', ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'emailOrderSubject', 'emailOrderBody', 'emailDispatchSubject', 'emailDispatchBody'])} label="Email Settings" />
        </div>

        {/* Section 5: SHIPPING & FEES */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <SectionLabel title="Shipping & Fees" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Shipping Flat Charge (Rs.)</label>
              <input type="number" value={localCms.shippingCharges || 0} onChange={e => handleUpdate('shippingCharges', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Min Cart for Free Delivery</label>
              <input type="number" value={localCms.deliveryCharges || 0} onChange={e => handleUpdate('deliveryCharges', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Return Window (Days)</label>
              <input type="number" value={localCms.returnWindowDays || 7} onChange={e => handleUpdate('returnWindowDays', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Max Cart Qty per Item</label>
              <input type="number" value={localCms.maxCartQty || 10} onChange={e => handleUpdate('maxCartQty', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
          </div>
          <SaveButton onClick={() => handleSaveSection('Shipping Config', ['shippingCharges', 'deliveryCharges', 'returnWindowDays', 'maxCartQty'])} label="Shipping Rules" />
        </div>

        {/* Section 7: FEATURE TOGGLES */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <SectionLabel title="Feature Toggles" />
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'AI Toy Concierge', field: 'aiConciergeEnabled' as keyof CMSConfig },
              { label: 'Loyalty Rewards', field: 'rewardsEnabled' as keyof CMSConfig },
              { label: 'Cash on Delivery', field: 'codEnabled' as keyof CMSConfig },
              { label: 'UPI QR Payment', field: 'upiEnabled' as keyof CMSConfig },
            ].map((toggle) => (
              <div key={toggle.field} className="flex flex-col p-3 border rounded-lg bg-slate-50">
                <span className="text-sm font-semibold mb-2">{toggle.label}</span>
                <button
                  onClick={() => handleUpdate(toggle.field, !localCms[toggle.field])}
                  className={`w-full py-1.5 rounded text-xs font-bold transition-colors ${
                    localCms[toggle.field] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {localCms[toggle.field] ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            ))}
          </div>
          <SaveButton onClick={() => handleSaveSection('Feature Toggles', ['aiConciergeEnabled', 'rewardsEnabled', 'codEnabled', 'upiEnabled'])} label="Toggles" />
        </div>

        {/* Section 8: PAYMENT CONFIGURATION */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm xl:col-span-2">
          <SectionLabel title="Payment Configuration" />
          <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded mb-4 border border-emerald-200">
            PayU secure online payments are active through server-side hash generation. COD and UPI transfer remain available as backup modes.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">UPI ID (e.g., meriseshop@upi)</label>
              <input type="text" value={localCms.upiId || 'meriseshop@upi'} onChange={e => handleUpdate('upiId', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">UPI QR Image URL</label>
              <input type="text" value={localCms.upiQrUrl || ''} onChange={e => handleUpdate('upiQrUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
          </div>
          <SaveButton onClick={() => handleSaveSection('Payment Config', ['upiId', 'upiQrUrl'])} label="Payment Info" />
        </div>

        {/* Section 6: LEGAL DOCUMENTS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm xl:col-span-2">
          <SectionLabel title="Legal Documents" />
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Privacy Policy</label>
              <textarea value={localCms.privacyPolicy || ''} onChange={e => handleUpdate('privacyPolicy', e.target.value)} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Terms & Conditions</label>
              <textarea value={localCms.termsConditions || ''} onChange={e => handleUpdate('termsConditions', e.target.value)} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Return & Refund Policy</label>
              <textarea value={localCms.returnPolicy || ''} onChange={e => handleUpdate('returnPolicy', e.target.value)} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A021] outline-none" />
            </div>
          </div>
          <SaveButton onClick={() => handleSaveSection('Legal Documents', ['privacyPolicy', 'termsConditions', 'returnPolicy'])} label="Legal Docs" />
        </div>

      </div>
    </div>
  );
}
