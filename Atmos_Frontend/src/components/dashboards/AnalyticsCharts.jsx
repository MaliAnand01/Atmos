import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import ClayCard from "../ClayCard";

// Mock Data Generators for Analytics
const generateMockSalesData = () => {
    return Array.from({ length: 12 }, (_, i) => ({
        month: String(i + 1).padStart(2, '0'),
        sales: Math.floor(Math.random() * 50) + 10,
    }));
};

const generateMockTrafficData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(m => ({
        month: m,
        organic: Math.floor(Math.random() * 15000) + 5000,
        paid: Math.floor(Math.random() * 10000) + 2000,
    }));
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-clay-surface border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
                <p className="text-xs font-bold mb-2 text-text-secondary">{label}</p>
                {payload.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm font-bold">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-white">{p.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsCharts() {
    const [isMounted, setIsMounted] = useState(false);
    const salesData = generateMockSalesData();
    const trafficData = generateMockTrafficData();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="h-[400px] w-full bg-clay-surface rounded-3xl animate-pulse" />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* Sales Performance Chart */}
            <ClayCard className="p-6 border border-white/5 bg-clay-surface h-[380px] flex flex-col relative overflow-hidden group">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-chill-blue/5 rounded-full blur-[80px] -z-10 group-hover:bg-chill-blue/10 transition-colors duration-1000" />
                
                <div className="flex justify-between items-start mb-6 z-10">
                    <div>
                        <h3 className="font-display font-bold text-white mb-2">Sales Performance</h3>
                        <div className="flex items-end gap-6">
                            <div>
                                <p className="text-2xl font-bold flex items-center gap-2">
                                    $28,441 <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">↑ 3.3%</span>
                                </p>
                                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">Weekly Sales</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold flex items-center gap-2 opacity-80">
                                    $4,063 <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">↑ 3.3%</span>
                                </p>
                                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">Daily Sales</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 w-full min-h-[220px] z-10">
                    <ResponsiveContainer width="100%" height="100%" debounce={100}>
                        <BarChart data={salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 10 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                            <Bar 
                                dataKey="sales" 
                                fill="#00f0ff" 
                                radius={[4, 4, 4, 4]} 
                                barSize={16}
                                animationBegin={0}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </ClayCard>

            {/* Traffic Source Chart */}
            <ClayCard className="p-6 border border-white/5 bg-clay-surface h-[380px] flex flex-col relative overflow-hidden group">
                 {/* Decorative glow */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-chill-blue/5 rounded-full blur-[80px] -z-10 group-hover:bg-chill-blue/10 transition-colors duration-1000" />
                 
                <div className="flex justify-between items-start mb-6 z-10">
                    <div>
                        <h3 className="font-display font-bold text-white mb-2">Traffic Source</h3>
                        <div>
                            <p className="text-2xl font-bold">231,856</p>
                            <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">Sessions</p>
                        </div>
                    </div>
                    <div className="flex gap-4 text-xs font-bold text-text-secondary">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-chill-blue shadow-[0_0_8px_rgba(0,240,255,0.8)]" /> Organic</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/20" /> Paid Ads</span>
                    </div>
                </div>

                <div className="flex-1 w-full min-h-[220px] z-10">
                    <ResponsiveContainer width="100%" height="100%" debounce={100}>
                        <LineChart data={trafficData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 10 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="organic" stroke="#00f0ff" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00f0ff', strokeWidth: 0 }} animationDuration={2000} />
                            <Line type="monotone" dataKey="paid" stroke="#ffffff30" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#ffffff', strokeWidth: 0 }} animationDuration={2000} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </ClayCard>
        </div>
    );
}
