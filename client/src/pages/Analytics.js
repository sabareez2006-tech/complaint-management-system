import { useEffect, useState, useRef } from "react";
import API from "../services/api";

// Animated counter hook
function useCountUp(target, duration = 1200) {
    const [count, setCount] = useState(0);
    const startTime = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        if (target === 0 || target === null || target === undefined) {
            setCount(0);
            return;
        }

        startTime.current = null;
        const animate = (timestamp) => {
            if (!startTime.current) startTime.current = timestamp;
            const progress = Math.min((timestamp - startTime.current) / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration]);

    return count;
}

function StatCard({ icon, value, label, colorClass }) {
    const animatedValue = useCountUp(value);
    return (
        <div className={`stat-card ${colorClass}`}>
            <div className="stat-card-icon">{icon}</div>
            <div className="stat-card-value">{animatedValue}</div>
            <div className="stat-card-label">{label}</div>
        </div>
    );
}

function Analytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await API.get("/complaints/analytics");
            setAnalytics(res.data);
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="spinner"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>Analytics unavailable</h3>
                <p>Failed to load analytics data. Please try again later.</p>
            </div>
        );
    }

    const { total, byStatus, byCategory, byPriority, avgResolutionHours } = analytics;
    const pending = byStatus?.pending || 0;
    const inProgress = byStatus?.in_progress || 0;
    const resolved = byStatus?.resolved || 0;
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;

    const maxCategoryCount = byCategory?.length > 0
        ? Math.max(...byCategory.map((c) => c.count))
        : 1;

    return (
        <div className="analytics-container">
            <h2 className="analytics-title">
                <span className="analytics-icon">📊</span> Analytics Dashboard
            </h2>

            {/* Summary Cards */}
            <div className="stat-cards">
                <StatCard icon="📋" value={total} label="Total Complaints" colorClass="stat-total" />
                <StatCard icon="⏳" value={pending} label="Pending" colorClass="stat-pending" />
                <StatCard icon="🔄" value={inProgress} label="In Progress" colorClass="stat-progress" />
                <StatCard icon="✅" value={resolved} label="Resolved" colorClass="stat-resolved" />
            </div>

            {/* Resolution & Time Row */}
            <div className="analytics-row">
                <div className="analytics-card">
                    <h3>Resolution Rate</h3>
                    <div className="donut-container">
                        <svg viewBox="0 0 36 36" className="donut-chart">
                            <path
                                className="donut-ring"
                                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="3"
                            />
                            <path
                                className="donut-segment"
                                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="url(#donutGradient)"
                                strokeWidth="3"
                                strokeDasharray={`${resolutionRate}, ${100 - resolutionRate}`}
                                strokeLinecap="round"
                                style={{ transition: "stroke-dasharray 1.5s ease" }}
                            />
                            <defs>
                                <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#34d399" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="donut-center">{resolutionRate}%</div>
                    </div>
                </div>

                <div className="analytics-card">
                    <h3>Avg. Resolution Time</h3>
                    <div className="big-metric">
                        <span className="metric-value">
                            {avgResolutionHours ? `${avgResolutionHours}h` : "N/A"}
                        </span>
                        <span className="metric-desc">
                            {avgResolutionHours ? "average hours to resolve" : "No resolved complaints yet"}
                        </span>
                    </div>
                </div>

                <div className="analytics-card">
                    <h3>Priority Breakdown</h3>
                    <div className="priority-list">
                        {["high", "medium", "low"].map((p) => {
                            const count = byPriority?.[p] || 0;
                            const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
                            return (
                                <div className="priority-row" key={p}>
                                    <span className={`priority-dot priority-${p}`}></span>
                                    <span className="priority-label">{p}</span>
                                    <div className="priority-bar-track">
                                        <div
                                            className={`priority-bar-fill priority-bar-${p}`}
                                            style={{ width: `${pct}%` }}
                                        ></div>
                                    </div>
                                    <span className="priority-count">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="analytics-card full-width">
                <h3>Complaints by Category</h3>
                <div className="category-bars">
                    {byCategory && byCategory.length > 0 ? (
                        byCategory.map((cat, idx) => (
                            <div className="category-bar-row" key={idx}>
                                <div className="category-name">{cat.category}</div>
                                <div className="category-bar-track">
                                    <div
                                        className="category-bar-fill"
                                        style={{
                                            width: `${(cat.count / maxCategoryCount) * 100}%`,
                                            animationDelay: `${idx * 0.1}s`,
                                        }}
                                    ></div>
                                </div>
                                <div className="category-count">{cat.count}</div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state small">
                            <p>No category data available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Distribution Bar */}
            <div className="analytics-card full-width">
                <h3>Status Distribution</h3>
                {total > 0 ? (
                    <div className="status-bar-container">
                        <div className="status-bar">
                            {pending > 0 && (
                                <div
                                    className="status-bar-segment status-bar-pending"
                                    style={{ width: `${(pending / total) * 100}%` }}
                                    title={`Pending: ${pending}`}
                                >
                                    {pending}
                                </div>
                            )}
                            {inProgress > 0 && (
                                <div
                                    className="status-bar-segment status-bar-in-progress"
                                    style={{ width: `${(inProgress / total) * 100}%` }}
                                    title={`In Progress: ${inProgress}`}
                                >
                                    {inProgress}
                                </div>
                            )}
                            {resolved > 0 && (
                                <div
                                    className="status-bar-segment status-bar-resolved"
                                    style={{ width: `${(resolved / total) * 100}%` }}
                                    title={`Resolved: ${resolved}`}
                                >
                                    {resolved}
                                </div>
                            )}
                        </div>
                        <div className="status-bar-legend">
                            <span className="legend-item">
                                <span className="legend-dot" style={{ background: "#fde047" }}></span> Pending ({pending})
                            </span>
                            <span className="legend-item">
                                <span className="legend-dot" style={{ background: "#60a5fa" }}></span> In Progress ({inProgress})
                            </span>
                            <span className="legend-item">
                                <span className="legend-dot" style={{ background: "#34d399" }}></span> Resolved ({resolved})
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state small">
                        <p>No complaints yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Analytics;
