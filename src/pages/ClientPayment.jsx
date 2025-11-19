import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DepositModal from '../components/DepositModal';
import TransactionDetailsModal from '../components/TransactionDetailsModal';
import Toast from '../components/Toast';
import '../styles/Sidebar.css';
import '../styles/Payment.css';

const ClientPayment = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activityData, setActivityData] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [toast, setToast] = useState(null);

  // Placeholder data with proper structure
  const placeholderTransactions = [
    {
      id: 1,
      title: "Netflix Standard Plan",
      date: "25 April at 09:30 am",
      category: "Online Shopping",
      icon: "📦",
      amount: -132,
      trend: "down",
      categoryColor: "#fbbf24"
    },
    {
      id: 2,
      title: "Game Stream",
      date: "25 April at 14:40 pm",
      category: "Entertainment",
      icon: "🎮",
      amount: 986,
      trend: "up",
      categoryColor: "#8b5cf6"
    },
    {
      id: 3,
      title: "Health Pharmacy",
      date: "25 April at 16:30 pm",
      category: "Health Care",
      icon: "💊",
      amount: -620,
      trend: "down",
      categoryColor: "#10b981"
    }
  ];

  // Updated placeholder activity data (12 months - January to December)
  const placeholderActivity = [1500, 1800, 2200, 2800, 4500, 3200, 2900, 3100, 3800, 4200, 3900, 4100];

  useEffect(() => {
    fetchPaymentData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPaymentData();
      setLastRefresh(Date.now());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [lastRefresh]);

  const fetchPaymentData = async () => {
    const currentUserId = localStorage.getItem('userId');
    
    // Load transactions from localStorage if available
    const savedTransactions = JSON.parse(localStorage.getItem('client_transactions') || '[]');
    const savedBalance = parseFloat(localStorage.getItem('client_balance') || '6169');
    
    if (savedTransactions.length > 0) {
      setTransactions(savedTransactions);
      setBalance(savedBalance);
      // Calculate total spent from transactions
      const spent = savedTransactions.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0);
      setTotalSpent(spent);
      setActivityData(placeholderActivity);
      return;
    }
    
    if (!currentUserId) {
      // Set placeholder data when not authenticated
      setTotalSpent(4567278);
      setBalance(6169.00);
      setActivityData(placeholderActivity);
      return;
    }

    setUserId(currentUserId);

    try {
      const response = await fetch(`/api/client/payments/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.transactions && data.transactions.length > 0) {
          setTransactions(data.transactions);
          setTotalSpent(data.totalSpent || 0);
          setBalance(data.balance || 0);
          
          // Set activity data from API (array of 12 months)
          setActivityData(data.activityData || placeholderActivity);
        }
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
      // Fallback to placeholder on error
      setTotalSpent(4567278);
      setBalance(6169.00);
      setActivityData(placeholderActivity);
    }
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchPaymentData();
    setLastRefresh(Date.now());
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleDepositSuccess = (message) => {
    showToast(message, 'success');
    fetchPaymentData();
  };

  // Generate dynamic SVG path from activity data
  const generateChartPath = (data) => {
    if (!data || data.length === 0) return "M 0,150 L 600,150";
    
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    
    const width = 600;
    const height = 200;
    const padding = 20;
    const step = width / (data.length - 1);
    
    // Normalize data points to fit in chart
    const points = data.map((value, index) => {
      const x = index * step;
      const normalized = ((value - minValue) / range);
      const y = height - padding - (normalized * (height - 2 * padding));
      return { x, y };
    });
    
    // Create smooth bezier curve path
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      
      path += ` Q ${controlX},${current.y} ${next.x},${next.y}`;
    }
    
    return path;
  };

  // Generate filled area path
  const generateFillPath = (data) => {
    const linePath = generateChartPath(data);
    return `${linePath} L 600,200 L 0,200 Z`;
  };

  // Filter and search logic
  const displayTransactions = transactions.length > 0 ? transactions : placeholderTransactions;
  const displayActivity = activityData.length > 0 ? activityData : placeholderActivity;
  
  const filteredTransactions = displayTransactions.filter(transaction => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'income') return matchesSearch && transaction.amount > 0;
    if (filterType === 'expenses') return matchesSearch && transaction.amount < 0;
    
    return matchesSearch;
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    const sign = amount > 0 ? '+' : '-';
    return `${sign}$${absAmount}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="payment-dashboard-figma">
      <div className="payment-container-figma">
        {/* Top Header with Search */}
        <div className="top-header-figma">
          <div className="search-bar-figma">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search a transaction" 
              className="search-input"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="header-right-figma">
            <button 
              onClick={() => setShowDepositModal(true)}
              className="notification-btn-figma" 
              aria-label="Deposit Funds"
              style={{ 
                marginRight: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              💰 Deposit
            </button>
            <button 
              onClick={handleManualRefresh} 
              className="notification-btn-figma" 
              aria-label="Refresh"
              style={{ marginRight: '10px' }}
            >
              🔄
            </button>
            <button className="notification-btn-figma" aria-label="Notifications">
              🔔
              <span className="notification-badge">1</span>
            </button>
            <div className="profile-avatar-figma">
              <img 
                src="https://i.pravatar.cc/80" 
                alt="Profile" 
                className="avatar-img"
              />
            </div>
          </div>
        </div>

        {/* Stats and Activity Section */}
        <div className="stats-activity-section">
          <div className="stats-column">
            <div className="stat-card">
              <div className="stat-icon-circle cyan">
                <span className="stat-arrow">↗</span>
              </div>
              <div className="stat-info">
                <div className="stat-label">Total spent this year</div>
                <div className="stat-value">KSH {formatCurrency(totalSpent)}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-circle mint">
                <span className="stat-arrow">↗</span>
              </div>
              <div className="stat-info">
                <div className="stat-label">Balance</div>
                <div className="stat-value">ksh.{formatCurrency(balance)}</div>
              </div>
            </div>
          </div>

          <div className="activity-column">
            <div className="activity-card">
              <div className="activity-header">
                <h3>Activity</h3>
                <span className="activity-period">This year</span>
              </div>
              <div className="chart-container">
                <svg className="activity-chart" viewBox="0 0 600 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                    </linearGradient>
                    <filter id="shadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(59, 130, 246, 0.3)"/>
                    </filter>
                  </defs>
                  {/* DYNAMIC Chart curve - updates with real data */}
                  <path
                    d={generateChartPath(displayActivity)}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#shadow)"
                  />
                  {/* DYNAMIC Fill area */}
                  <path
                    d={generateFillPath(displayActivity)}
                    fill="url(#chartGradient)"
                  />
                </svg>
              </div>
              <div className="chart-months">
                <span>JAN</span>
                <span>FEB</span>
                <span>MAR</span>
                <span>APR</span>
                <span>MAY</span>
                <span>JUN</span>
                <span>JUL</span>
                <span>AUG</span>
                <span>SEP</span>
                <span>OCT</span>
                <span>NOV</span>
                <span className="active-month">DEC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="transaction-section-figma">
          <div className="transaction-header-figma">
            <h2>Transaction History</h2>
            <select 
              className="transaction-filter"
              value={filterType}
              onChange={handleFilterChange}
            >
              <option value="all">All transactions</option>
              <option value="income">Income</option>
              <option value="expenses">Expenses</option>
            </select>
          </div>

          <div className="transaction-list-figma">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(transaction => (
                <div 
                  key={transaction.id} 
                  className="transaction-item-figma"
                  onClick={() => setSelectedTransaction(transaction)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="transaction-left">
                    <div className="transaction-icon-figma">
                      {transaction.icon}
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-name">{transaction.title}</div>
                      <div className="transaction-date">{transaction.date}</div>
                    </div>
                  </div>
                  
                  <div className="transaction-right">
                    <div className="transaction-category-figma">
                      <span 
                        className="category-dot" 
                        style={{ background: transaction.categoryColor || '#fbbf24' }}
                      ></span>
                      {transaction.category}
                    </div>
                    <div className="transaction-trend">
                      <svg width="70" height="28" viewBox="0 0 70 28">
                        {transaction.trend === 'up' ? (
                          <path
                            d="M 0,24 Q 17,20 35,12 T 70,4"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        ) : (
                          <path
                            d="M 0,4 Q 17,8 35,16 T 70,24"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        )}
                      </svg>
                    </div>
                    <div className={`transaction-amount-figma ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                      {formatAmount(transaction.amount)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                No transactions found
              </div>
            )}
          </div>
        </div>
      </div>

      {showDepositModal && (
        <DepositModal 
          onClose={() => setShowDepositModal(false)}
          onSuccess={handleDepositSuccess}
        />
      )}

      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ClientPayment;