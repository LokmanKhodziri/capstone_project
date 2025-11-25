import React, { useEffect, useMemo, useState } from "react";
import expenseService from "../services/expense.service";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const YearlyReport = () => {
  const [yearlyData, setYearlyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const catRes = await expenseService.getCategories();
      const cats = catRes.data || [];
      setCategories(["All", ...cats.filter(Boolean)]);

      // Fetch available years for the filter (respecting current category)
      // initial category is 'All' so pass null to fetch all years
      const yearlyRes = await expenseService.getYearlyExpenseSummary(
        null,
        true
      );
      const ydata = yearlyRes.data || [];
      // sort years descending so newest appears first
      setYearlyData(ydata);
      const years = ydata.map((d) => d.year).sort((a, b) => b - a);
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
      console.error("Failed to load initial data", err);
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
      const catParam = category && category !== "All" ? category : null;
      // We need a new service method for this, let's assume getMonthlyExpenseSummaryForYear
      const res = await expenseService.getMonthlyExpenseSummary(
        year,
        catParam,
        true
      );
      const raw = res.data || [];

      // Normalize to 12 months (1..12) so the chart always shows all months
      const monthsMap = new Map(raw.map((m) => [m.month, m.totalAmount]));
      const normalized = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalAmount: monthsMap.get(i + 1) || 0,
      }));
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
        const catParam =
          selectedCategory && selectedCategory !== "All"
            ? selectedCategory
            : null;
        const res = await expenseService.getYearlyExpenseSummary(
          catParam,
          true
        );
        const ydata = res.data || [];
        if (!mounted) return;
        // sort descending
        const years = ydata.map((d) => d.year).sort((a, b) => b - a);
        setYearlyData(ydata);
        setAvailableYears(years);

        // If the currently selected year is not in the new list, pick the latest available
        if (years.length > 0 && !years.includes(selectedYear)) {
          setSelectedYear(Math.max(...years));
        }
        // if no years found, clear selectedYear so UI shows empty state
        if (years.length === 0) setSelectedYear(null);
      } catch (err) {
        console.error("Failed to refresh yearly data for category", err);
      }
    };

    refreshYearlyForCategory();
    return () => {
      mounted = false;
    };
  }, [selectedCategory, selectedYear]);

  const totalForYear = useMemo(
    () => monthlyData.reduce((s, d) => s + (d.totalAmount || 0), 0),
    [monthlyData]
  );
  const averagePerMonth = useMemo(
    () => (monthlyData.length ? totalForYear / monthlyData.length : 0),
    [monthlyData, totalForYear]
  );
  const hasAnyData = monthlyData.some((m) => (m.totalAmount || 0) > 0);

  const selectedYearSummary = yearlyData.find((d) => d.year === selectedYear);
  const previousYearSummary = yearlyData.find(
    (d) => d.year === selectedYear - 1
  );
  const yoyChange =
    selectedYearSummary &&
    previousYearSummary &&
    previousYearSummary.totalAmount
      ? ((selectedYearSummary.totalAmount - previousYearSummary.totalAmount) /
          previousYearSummary.totalAmount) *
        100
      : null;
  const comparisonYearLabel = selectedYear ? selectedYear - 1 : "previous year";

  const bestMonthEntry = monthlyData.reduce(
    (best, entry) =>
      entry.totalAmount > (best?.totalAmount || 0) ? entry : best,
    null
  );
  const worstMonthEntry = monthlyData.reduce(
    (worst, entry) =>
      entry.totalAmount < (worst?.totalAmount ?? Infinity) ? entry : worst,
    null
  );
  const hasWorstMonthData =
    typeof worstMonthEntry?.totalAmount === "number" &&
    Number.isFinite(worstMonthEntry.totalAmount);

  const lastQuarter = monthlyData.slice(-3);
  const lastQuarterAvg = lastQuarter.length
    ? lastQuarter.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0) /
      lastQuarter.length
    : 0;
  const momentum = averagePerMonth
    ? ((lastQuarterAvg - averagePerMonth) / averagePerMonth) * 100
    : 0;

  const cumulativeSeries = useMemo(() => {
    const acc = [];
    monthlyData.reduce((sum, entry, index) => {
      const next = sum + (entry.totalAmount || 0);
      acc[index] = next;
      return next;
    }, 0);
    return acc;
  }, [monthlyData]);

  const highlightIndex = bestMonthEntry ? bestMonthEntry.month - 1 : -1;
  const barColors = monthlyData.map((entry, idx) =>
    idx === highlightIndex
      ? "rgba(111, 66, 193, 0.85)"
      : "rgba(54, 162, 235, 0.65)"
  );

  const chartData = useMemo(
    () => ({
      labels: monthlyData.map((d) => MONTH_NAMES[d.month - 1] || `M${d.month}`),
      datasets: [
        {
          type: "bar",
          label:
            `Spending in ${selectedYear ?? "—"}` +
            (selectedCategory !== "All" ? ` • ${selectedCategory}` : ""),
          data: monthlyData.map((d) => d.totalAmount),
          backgroundColor: barColors,
          borderRadius: 6,
          barPercentage: 0.65,
        },
        {
          type: "line",
          label: "Cumulative total",
          data: cumulativeSeries,
          borderColor: "#ff6384",
          backgroundColor: "rgba(255, 99, 132, 0.1)",
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
          yAxisID: "y",
        },
        {
          type: "line",
          label: "Monthly average",
          data: monthlyData.map(() => averagePerMonth),
          borderColor: "#20c997",
          borderDash: [6, 6],
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.2,
          yAxisID: "y",
        },
      ],
    }),
    [
      monthlyData,
      selectedYear,
      selectedCategory,
      barColors,
      cumulativeSeries,
      averagePerMonth,
    ]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
        title: {
          display: true,
          text: selectedYear
            ? `Monthly spending insight • ${selectedYear}${
                selectedCategory !== "All" ? ` • ${selectedCategory}` : ""
              }`
            : "Monthly spending insight",
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              if (
                context.dataset.type === "line" &&
                context.dataset.label === "Monthly average"
              ) {
                return `${context.dataset.label}: RM ${averagePerMonth.toFixed(
                  2
                )}`;
              }
              return `${context.dataset.label}: RM ${(
                context.parsed.y ?? context.parsed
              ).toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `RM ${value}`,
          },
        },
      },
    }),
    [selectedYear, selectedCategory, averagePerMonth]
  );

  const handleYearChange = (e) => {
    const value = e.target.value;
    setSelectedYear(value ? parseInt(value, 10) : null);
  };

  const insights = [
    {
      label: "Peak month",
      value: bestMonthEntry
        ? `${
            MONTH_NAMES[bestMonthEntry.month - 1]
          } • RM ${bestMonthEntry.totalAmount.toFixed(2)}`
        : "—",
    },
    {
      label: "Most frugal month",
      value: hasWorstMonthData
        ? `${
            MONTH_NAMES[worstMonthEntry.month - 1]
          } • RM ${worstMonthEntry.totalAmount.toFixed(2)}`
        : "—",
    },
    {
      label: "Momentum (last 3 months)",
      value: `${momentum >= 0 ? "+" : ""}${momentum.toFixed(1)}%`,
    },
    {
      label: "Category focus",
      value: selectedCategory === "All" ? "All categories" : selectedCategory,
    },
  ];

  return (
    <div className="container-fluid yearly-report-page py-4">
      <div className="yearly-report-hero mb-4">
        <div>
          <p className="hero-eyebrow">Spending pulse</p>
          <h2 className="hero-title">Yearly Report</h2>
          <p className="hero-subtitle">
            Track how your spending evolves across the year and spot trends
            instantly.
          </p>
        </div>
        <div className="hero-meta">
          <span className="hero-chip">{selectedYear ?? "Select a year"}</span>
          <span
            className={`hero-badge ${
              yoyChange && yoyChange < 0 ? "badge-positive" : "badge-negative"
            }`}>
            {yoyChange === null
              ? "YoY change unavailable"
              : `${yoyChange >= 0 ? "+" : ""}${yoyChange.toFixed(
                  1
                )}% vs ${comparisonYearLabel}`}
          </span>
          <span className="hero-chip secondary">
            {selectedCategory === "All" ? "All categories" : selectedCategory}
          </span>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card yearly-filter-card h-100">
            <div className="card-body">
              <div className="row g-3 align-items-end mb-4">
                <div className="col-md-4">
                  <label className="form-label filter-label">
                    Year{" "}
                    <small className="text-muted">
                      ({availableYears.length} options)
                    </small>
                  </label>
                  <select
                    className="form-select filter-input"
                    value={selectedYear ?? ""}
                    onChange={handleYearChange}
                    disabled={availableYears.length === 0}>
                    {availableYears.length === 0 ? (
                      <option value="">No years available</option>
                    ) : (
                      availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label filter-label">Category</label>
                  <select
                    className="form-select filter-input"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    disabled={categories.length === 0}>
                    {categories.length === 0 ? (
                      <option value="">Loading...</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="col-md-4">
                  <div className="stat-bubble">
                    <span className="stat-label">Total spending</span>
                    <span className="stat-value">
                      RM {totalForYear.toFixed(2)}
                    </span>
                    <span className="stat-caption">
                      Avg/month RM {averagePerMonth.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="yearly-summary-grid mb-4">
                <div className="yearly-summary-card">
                  <span className="summary-label">Peak month</span>
                  <strong className="summary-value">
                    {bestMonthEntry
                      ? `${MONTH_NAMES[bestMonthEntry.month - 1]}`
                      : "—"}
                  </strong>
                  <span className="summary-caption">
                    {bestMonthEntry
                      ? `RM ${bestMonthEntry.totalAmount.toFixed(2)}`
                      : "No data"}
                  </span>
                </div>
                <div className="yearly-summary-card">
                  <span className="summary-label">Most frugal</span>
                  <strong className="summary-value">
                    {hasWorstMonthData
                      ? `${MONTH_NAMES[worstMonthEntry.month - 1]}`
                      : "—"}
                  </strong>
                  <span className="summary-caption">
                    {hasWorstMonthData
                      ? `RM ${worstMonthEntry.totalAmount.toFixed(2)}`
                      : "No data"}
                  </span>
                </div>
                <div className="yearly-summary-card">
                  <span className="summary-label">Momentum (last 3m)</span>
                  <strong
                    className={`summary-value ${
                      momentum >= 0 ? "text-danger" : "text-success"
                    }`}>
                    {momentum >= 0 ? "+" : ""}
                    {momentum.toFixed(1)}%
                  </strong>
                  <span className="summary-caption">vs yearly average</span>
                </div>
                <div className="yearly-summary-card">
                  <span className="summary-label">YoY change</span>
                  <strong
                    className={`summary-value ${
                      yoyChange !== null && yoyChange < 0
                        ? "text-success"
                        : "text-danger"
                    }`}>
                    {yoyChange === null
                      ? "—"
                      : `${yoyChange >= 0 ? "+" : ""}${yoyChange.toFixed(1)}%`}
                  </strong>
                  <span className="summary-caption">
                    Compared to {comparisonYearLabel}
                  </span>
                </div>
              </div>

              <div className="yearly-chart-wrapper">
                {loading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Crunching numbers...</div>
                  </div>
                ) : selectedYear && hasAnyData ? (
                  <Bar data={chartData} options={options} />
                ) : (
                  <div className="empty-state p-4 text-center">
                    <h4>No data available</h4>
                    <p className="mb-0">
                      We could not find expenses for the selected filters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card yearly-insights-card">
            <div className="card-body">
              <h5 className="insight-title">Monthly insights</h5>
              <p className="insight-subtitle">
                Quick highlights extracted from this year&apos;s spending
                pattern.
              </p>
              <ul className="insight-list">
                {insights.map((item) => (
                  <li key={item.label} className="insight-item">
                    <span className="insight-label">{item.label}</span>
                    <strong className="insight-value">{item.value}</strong>
                  </li>
                ))}
              </ul>
              <div className="mini-divider"></div>
              <div className="insight-footnote">
                Data refreshes automatically whenever you adjust the filters.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyReport;
