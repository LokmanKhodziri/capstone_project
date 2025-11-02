import React, { useEffect, useState } from 'react';
import expenseService from '../services/expense.service';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const YearlyReport = () => {
    const [yearlyData, setYearlyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            // Fetch categories
            const catRes = await expenseService.getCategories();
            const cats = catRes.data || [];
            setCategories(['All', ...cats.filter(Boolean)]);

            // Fetch available years for the filter (respecting current category)
            // initial category is 'All' so pass null to fetch all years
            const yearlyRes = await expenseService.getYearlyExpenseSummary(null, true);
            const ydata = yearlyRes.data || [];
            // sort years descending so newest appears first
            setYearlyData(ydata);
            const years = ydata.map(d => d.year).sort((a, b) => b - a);
            setAvailableYears(years);

            // Set current year if available, otherwise the latest year
            const currentYear = new Date().getFullYear();
            if (years.includes(currentYear)) {
                setSelectedYear(currentYear);
            } else if (years.length > 0) {
                setSelectedYear(Math.max(...years));
            } else {
                setSelectedYear(null);
            }

        } catch (err) {
            console.error('Failed to load initial data', err);
        } finally {
            setLoading(false);
        }
    };

    const loadMonthlyData = async (year, category) => {
        if (!year) {
            setMonthlyData([]);
            return;
        }
        setLoading(true);
        try {
            const catParam = category && category !== 'All' ? category : null;
            // We need a new service method for this, let's assume getMonthlyExpenseSummaryForYear
            const res = await expenseService.getMonthlyExpenseSummary(year, catParam, true);
            const raw = res.data || [];

            // Normalize to 12 months (1..12) so the chart always shows all months
            const monthsMap = new Map(raw.map(m => [m.month, m.totalAmount]));
            const normalized = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, totalAmount: monthsMap.get(i + 1) || 0 }));
            setMonthlyData(normalized);
        } catch (err) {
            console.error(`Failed to load monthly data for ${year}`, err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    // When year or category changes, reload monthly data
    useEffect(() => {
        loadMonthlyData(selectedYear, selectedCategory);
    }, [selectedYear, selectedCategory]);

    // When category changes, refresh the available years (yearly summary)
    useEffect(() => {
        let mounted = true;
        const refreshYearlyForCategory = async () => {
            try {
                const catParam = selectedCategory && selectedCategory !== 'All' ? selectedCategory : null;
                const res = await expenseService.getYearlyExpenseSummary(catParam, true);
                const ydata = res.data || [];
                if (!mounted) return;
                // sort descending
                const years = ydata.map(d => d.year).sort((a, b) => b - a);
                setYearlyData(ydata);
                setAvailableYears(years);

                // If the currently selected year is not in the new list, pick the latest available
                if (years.length > 0 && !years.includes(selectedYear)) {
                    setSelectedYear(Math.max(...years));
                }
                // if no years found, clear selectedYear so UI shows empty state
                if (years.length === 0) setSelectedYear(null);
            } catch (err) {
                console.error('Failed to refresh yearly data for category', err);
            }
        };

        refreshYearlyForCategory();
        return () => { mounted = false; };
    }, [selectedCategory, selectedYear]);

    const totalForYear = monthlyData.reduce((s, d) => s + (d.totalAmount || 0), 0);
    const averagePerMonth = monthlyData.length ? totalForYear / monthlyData.length : 0;
    const hasAnyData = monthlyData.some(m => (m.totalAmount || 0) > 0);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const chartData = {
        labels: monthlyData.map(d => monthNames[d.month - 1] || `M${d.month}`),
        datasets: [
            {
                label: `Total Spending in ${selectedYear ?? '—'}` + (selectedCategory !== 'All' ? ` for ${selectedCategory}` : ''),
                data: monthlyData.map(d => d.totalAmount),
                backgroundColor: '#36A2EB'
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true }, title: { display: true, text: `Monthly Spending for ${selectedYear ?? '—'}` } }
    };

    return (
        <div className="container mt-4 yearly-report-page">
            <div className="d-flex justify-content-between align-items-center mb-3 yearly-report-header">
                <h2 className="h4">Yearly Report</h2>
            </div>

            <div className="card mb-4 yearly-report-card">
                <div className="card-body">
                    <div className="row mb-3 yearly-controls align-items-end">
                        <div className="col-md-3">
                            <label className="form-label filter-label">Year <small className="text-muted">({yearlyData.length} available)</small></label>
                            <select
                                className="form-select filter-input"
                                value={selectedYear ?? ''}
                                onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
                                disabled={availableYears.length === 0}
                            >
                                {availableYears.length === 0 ? (
                                    <option value="">No years available</option>
                                ) : (
                                    availableYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label filter-label">Category</label>
                            <select
                                className="form-select filter-input"
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                disabled={categories.length === 0}
                            >
                                {categories.length === 0 ? (
                                    <option value="">Loading...</option>
                                ) : (
                                    categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="col-md-5 d-flex justify-content-end yearly-stats">
                            <div className="summary-card p-3 text-end">
                                <div className="summary-title">Total Spending</div>
                                <div className="summary-amount">RM {totalForYear.toFixed(2)}</div>
                                <div className="summary-period">Avg/month: RM {averagePerMonth.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="yearly-chart-container" style={{ height: '420px' }}>
                        {loading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <div className="loading-text">Loading report...</div>
                            </div>
                        ) : (selectedYear && hasAnyData) ? (
                            <Bar data={chartData} options={options} />
                        ) : (
                            <div className="empty-state p-4 text-center">
                                <h4>No data available</h4>
                                <p className="mb-0">No expenses found for the selected year and category.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YearlyReport;
