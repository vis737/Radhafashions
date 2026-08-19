import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Users, Crown, Star, Award, Zap, 
    Gift, Edit3, ShieldAlert, ArrowUpRight,
    Search, X, Check, ArrowRightLeft, DollarSign,
    Info
} from 'lucide-react';
import { Order } from '../../types';

interface AdminMembershipTabProps {
    orders: Order[];
    onLogActivity: (action: string, details: string) => void;
    addToast: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

interface Member {
    id: string; // use email as ID
    name: string;
    email: string;
    points: number;
    joined: string;
    ltv: number;
    ordersCount: number;
    tierOverride?: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | null;
}

export default function AdminMembershipTab({ orders, onLogActivity, addToast }: AdminMembershipTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Member State
    const [members, setMembers] = useState<Member[]>(() => {
        const customerMap = new Map<string, Member>();
        
        // Add seed members
        customerMap.set('aloksharma@gmail.com', {
            id: 'aloksharma@gmail.com',
            name: 'Alok Sharma', 
            email: 'aloksharma@gmail.com', 
            points: 350, 
            joined: '2026-03-12', 
            ltv: 3500, 
            ordersCount: 3
        });
        customerMap.set('nisha.k@yahoo.com', {
            id: 'nisha.k@yahoo.com',
            name: 'Nisha Krishnan', 
            email: 'nisha.k@yahoo.com', 
            points: 1550, 
            joined: '2026-02-15', 
            ltv: 15500, 
            ordersCount: 12
        });
        customerMap.set('rohan.advani@hotmail.com', {
            id: 'rohan.advani@hotmail.com',
            name: 'Rohan Advani', 
            email: 'rohan.advani@hotmail.com', 
            points: 80, 
            joined: '2026-05-20', 
            ltv: 800, 
            ordersCount: 1
        });

        // Process orders
        if (orders && orders.length > 0) {
            orders.forEach(order => {
                const email = order.customerInfo?.email || order.accountEmail;
                const name = order.customerInfo?.name || order.accountName || 'Unknown Customer';
                if (!email) return;

                const amount = order.total || 0;
                const earnedPoints = Math.floor(amount / 100) * 10;
                const orderDate = order.date || new Date().toISOString().split('T')[0];

                if (customerMap.has(email)) {
                    const existing = customerMap.get(email)!;
                    existing.ltv += amount;
                    existing.ordersCount += 1;
                    existing.points += earnedPoints;
                    if (orderDate < existing.joined) {
                        existing.joined = orderDate;
                    }
                } else {
                    customerMap.set(email, {
                        id: email,
                        name,
                        email,
                        points: earnedPoints,
                        joined: orderDate,
                        ltv: amount,
                        ordersCount: 1,
                    });
                }
            });
        }

        return Array.from(customerMap.values()).sort((a, b) => b.points - a.points);
    });

    const [adjustPointsModal, setAdjustPointsModal] = useState<{isOpen: boolean, member: Member | null}>({ isOpen: false, member: null });
    const [adjustAmount, setAdjustAmount] = useState('');
    const [adjustReason, setAdjustReason] = useState('');

    const [tierOverrideModal, setTierOverrideModal] = useState<{isOpen: boolean, member: Member | null}>({ isOpen: false, member: null });
    const [selectedTierOverride, setSelectedTierOverride] = useState<'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Remove'>('Platinum');

    // Derived values
    const filteredMembers = useMemo(() => {
        return members.filter(m => 
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            m.email.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => b.points - a.points);
    }, [members, searchTerm]);

    const getTier = (points: number, override?: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | null) => {
        if (override) return override;
        if (points >= 1000) return 'Platinum';
        if (points >= 500) return 'Gold';
        if (points >= 100) return 'Silver';
        return 'Bronze';
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'Platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Gold': return 'bg-amber-100 text-amber-700 border-amber-300';
            case 'Silver': return 'bg-gray-100 text-gray-700 border-gray-300';
            case 'Bronze': return 'bg-orange-50 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const stats = useMemo(() => {
        let totalPoints = 0;
        let platinum = 0;
        let gold = 0;
        let silver = 0;
        let bronze = 0;

        members.forEach(m => {
            totalPoints += m.points;
            const tier = getTier(m.points, m.tierOverride);
            if (tier === 'Platinum') platinum++;
            else if (tier === 'Gold') gold++;
            else if (tier === 'Silver') silver++;
            else if (tier === 'Bronze') bronze++;
        });

        return { totalPoints, platinum, gold, silver, bronze, totalMembers: members.length };
    }, [members]);

    const handleAdjustPoints = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseInt(adjustAmount);
        if (isNaN(amt)) {
            addToast('Please enter a valid number', 'error');
            return;
        }
        if (!adjustPointsModal.member) return;

        setMembers(prev => prev.map(m => {
            if (m.id === adjustPointsModal.member!.id) {
                return { ...m, points: Math.max(0, m.points + amt) };
            }
            return m;
        }));

        const actionText = amt >= 0 ? `Added ${amt} points` : `Deducted ${Math.abs(amt)} points`;
        onLogActivity('POINTS_ADJUSTMENT', `${actionText} for ${adjustPointsModal.member.email}. Reason: ${adjustReason || 'None'}`);
        addToast(`Points successfully adjusted for ${adjustPointsModal.member.name}`, 'success');
        
        setAdjustPointsModal({ isOpen: false, member: null });
        setAdjustAmount('');
        setAdjustReason('');
    };

    const handleTierOverride = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tierOverrideModal.member) return;

        const newOverride = selectedTierOverride === 'Remove' ? null : selectedTierOverride;

        setMembers(prev => prev.map(m => {
            if (m.id === tierOverrideModal.member!.id) {
                return { ...m, tierOverride: newOverride };
            }
            return m;
        }));

        const actionText = newOverride ? `Manually upgraded/downgraded to ${newOverride}` : `Removed tier override`;
        onLogActivity('TIER_OVERRIDE', `${actionText} for ${tierOverrideModal.member.email}.`);
        addToast(`Tier override updated for ${tierOverrideModal.member.name}`, 'success');
        
        setTierOverrideModal({ isOpen: false, member: null });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Gift className="w-7 h-7 text-[#D4AF37]" />
                        Privilege Club Loyalty Roster
                    </h2>
                    <p className="text-gray-400 dark:text-gray-500 mt-1">Manage Radha Fashions memberships, points, and tiers.</p>
                </div>
            </div>

            {/* Point Rules Info */}
            <div className="bg-[#0B1B3D] text-white p-4 rounded-xl border border-[#D4AF37]/30 flex items-start gap-4">
                <div className="p-2 bg-[#D4AF37]/20 rounded-lg">
                    <Info className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                    <h4 className="font-semibold text-[#D4AF37]">Loyalty Program Rules</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        Members earn <strong className="text-white">10 points</strong> per <strong className="text-white">Rs.100</strong> spent. 
                        Points can be redeemed at <strong className="text-white">1 point = Rs.1 off</strong>.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div whileHover={{ y: -2 }} className="bg-white p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Total Members</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalMembers}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
                    </div>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} className="bg-white p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Platinum Members</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.platinum}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Crown className="w-5 h-5" /></div>
                    </div>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} className="bg-white p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Gold Members</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.gold}</h3>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Star className="w-5 h-5" /></div>
                    </div>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} className="bg-white p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Total Points Issued</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPoints.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Gift className="w-5 h-5" /></div>
                    </div>
                </motion.div>
            </div>

            {/* Tier Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 text-white shadow-md relative overflow-hidden">
                    <Crown className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
                    <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-purple-200" />
                        <h4 className="font-bold">Platinum Tier</h4>
                    </div>
                    <div className="flex justify-between items-end">
                        <p className="text-sm text-purple-100">1000+ points</p>
                        <p className="text-2xl font-bold">{stats.platinum}</p>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-4 text-white shadow-md relative overflow-hidden">
                    <Star className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
                    <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-amber-100" />
                        <h4 className="font-bold">Gold Tier</h4>
                    </div>
                    <div className="flex justify-between items-end">
                        <p className="text-sm text-amber-100">500+ points</p>
                        <p className="text-2xl font-bold">{stats.gold}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl p-4 text-white shadow-md relative overflow-hidden">
                    <Award className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                        <h4 className="font-bold">Silver Tier</h4>
                    </div>
                    <div className="flex justify-between items-end">
                        <p className="text-sm text-gray-900 dark:text-gray-100">100+ points</p>
                        <p className="text-2xl font-bold">{stats.silver}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-4 text-white shadow-md relative overflow-hidden">
                    <Zap className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-orange-100" />
                        <h4 className="font-bold">Bronze Tier</h4>
                    </div>
                    <div className="flex justify-between items-end">
                        <p className="text-sm text-orange-100">&lt; 100 points</p>
                        <p className="text-2xl font-bold">{stats.bronze}</p>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-950">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1B3D]/20 text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Member</th>
                                <th className="px-6 py-4">Tier</th>
                                <th className="px-6 py-4">Reward Points</th>
                                <th className="px-6 py-4">LTV Spent</th>
                                <th className="px-6 py-4">Orders</th>
                                <th className="px-6 py-4">Join Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map(member => {
                                    const tier = getTier(member.points, member.tierOverride);
                                    
                                    return (
                                        <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-950/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-bold">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{member.name}</div>
                                                        <div className="text-xs text-gray-400 dark:text-gray-500">{member.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getTierColor(tier)}`}>
                                                        {tier}
                                                    </span>
                                                    {member.tierOverride && (
                                                        <span className="text-xs text-[#0B1B3D] bg-[#0B1B3D]/10 px-1.5 py-0.5 rounded flex items-center gap-1" title="Manually Overridden">
                                                            <ShieldAlert className="w-3 h-3" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-medium text-[#D4AF37]">
                                                {member.points.toLocaleString()} pts
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-700">
                                                Rs. {member.ltv.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {member.ordersCount}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {member.joined}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => setAdjustPointsModal({ isOpen: true, member })}
                                                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-md transition-colors tooltip-trigger relative"
                                                        title="Adjust Points"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedTierOverride(member.tierOverride || getTier(member.points) as any);
                                                            setTierOverrideModal({ isOpen: true, member });
                                                        }}
                                                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-[#0B1B3D] hover:bg-[#0B1B3D]/10 rounded-md transition-colors tooltip-trigger relative"
                                                        title="Upgrade/Downgrade Tier"
                                                    >
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                                        No members found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Adjust Points Modal */}
            <AnimatePresence>
                {adjustPointsModal.isOpen && adjustPointsModal.member && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 dark:bg-gray-950">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <Gift className="w-4 h-4 text-[#D4AF37]" />
                                    Adjust Reward Points
                                </h3>
                                <button
                                    onClick={() => setAdjustPointsModal({ isOpen: false, member: null })}
                                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-600 rounded-md"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 border-b border-gray-100 bg-amber-50 text-amber-800 text-sm flex gap-3">
                                <Info className="w-5 h-5 shrink-0 text-amber-600" />
                                <div>
                                    <p className="font-medium">{adjustPointsModal.member.name}</p>
                                    <p className="opacity-90">Current Points: {adjustPointsModal.member.points}</p>
                                </div>
                            </div>
                            <form onSubmit={handleAdjustPoints} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Adjustment Amount (Use +/-)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ArrowRightLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            value={adjustAmount}
                                            onChange={(e) => setAdjustAmount(e.target.value)}
                                            placeholder="e.g. 500 or -200"
                                            className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#0B1B3D] focus:border-[#0B1B3D] sm:text-sm"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        New Balance: {adjustPointsModal.member.points + (parseInt(adjustAmount) || 0)} pts
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reason (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={adjustReason}
                                        onChange={(e) => setAdjustReason(e.target.value)}
                                        placeholder="e.g. Customer support resolution"
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#0B1B3D] focus:border-[#0B1B3D] sm:text-sm"
                                    />
                                </div>
                                
                                <div className="pt-2 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setAdjustPointsModal({ isOpen: false, member: null })}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-950"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-[#0B1B3D] rounded-lg hover:bg-[#152a5c]"
                                    >
                                        Apply Adjustment
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Tier Override Modal */}
            <AnimatePresence>
                {tierOverrideModal.isOpen && tierOverrideModal.member && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 dark:bg-gray-950">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-[#0B1B3D]" />
                                    Manual Tier Override
                                </h3>
                                <button
                                    onClick={() => setTierOverrideModal({ isOpen: false, member: null })}
                                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-600 rounded-md"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 border-b border-gray-100 bg-gray-50 dark:bg-gray-950 text-gray-700 text-sm flex gap-3">
                                <Info className="w-5 h-5 shrink-0 text-gray-500 dark:text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900">{tierOverrideModal.member.name}</p>
                                    <p className="opacity-90">Calculated Tier: {getTier(tierOverrideModal.member.points)} ({tierOverrideModal.member.points} pts)</p>
                                </div>
                            </div>
                            <form onSubmit={handleTierOverride} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select New Tier
                                    </label>
                                    <select
                                        value={selectedTierOverride}
                                        onChange={(e) => setSelectedTierOverride(e.target.value as any)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#0B1B3D] focus:border-[#0B1B3D] sm:text-sm"
                                    >
                                        <option value="Remove">-- Remove Override (Auto-calculate) --</option>
                                        <option value="Platinum">Platinum</option>
                                        <option value="Gold">Gold</option>
                                        <option value="Silver">Silver</option>
                                        <option value="Bronze">Bronze</option>
                                    </select>
                                </div>
                                
                                <div className="pt-2 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTierOverrideModal({ isOpen: false, member: null })}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-950"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-[#0B1B3D] rounded-lg hover:bg-[#152a5c]"
                                    >
                                        Save Override
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
