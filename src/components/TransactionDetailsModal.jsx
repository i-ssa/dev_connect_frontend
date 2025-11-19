import React from 'react';
import '../styles/PaymentModal.css';

const TransactionDetailsModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    const sign = amount > 0 ? '+' : '-';
    return `${sign}KSH ${absAmount.toLocaleString()}`;
  };

  return (
    <div className="payment-modal-overlay transaction-details-modal" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>📄 Transaction Details</h2>
          <button className="payment-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="payment-modal-form">
          <div className={`transaction-amount-large ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
            {formatAmount(transaction.amount)}
          </div>

          <div className="transaction-detail-row">
            <span className="transaction-detail-label">Transaction ID</span>
            <span className="transaction-detail-value">#{transaction.id}</span>
          </div>

          <div className="transaction-detail-row">
            <span className="transaction-detail-label">Title</span>
            <span className="transaction-detail-value">{transaction.title}</span>
          </div>

          <div className="transaction-detail-row">
            <span className="transaction-detail-label">Category</span>
            <span className="transaction-detail-value">
              <span 
                className="category-dot" 
                style={{ 
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: transaction.categoryColor || '#fbbf24',
                  marginRight: '6px'
                }}
              ></span>
              {transaction.category}
            </span>
          </div>

          <div className="transaction-detail-row">
            <span className="transaction-detail-label">Date & Time</span>
            <span className="transaction-detail-value">{transaction.date}</span>
          </div>

          {transaction.paymentMethod && (
            <div className="transaction-detail-row">
              <span className="transaction-detail-label">Payment Method</span>
              <span className="transaction-detail-value">{transaction.paymentMethod}</span>
            </div>
          )}

          <div className="transaction-detail-row">
            <span className="transaction-detail-label">Status</span>
            <span className="transaction-detail-value">
              <span className={`status-badge ${(transaction.status || 'completed').toLowerCase()}`}>
                {transaction.status || 'Completed'}
              </span>
            </span>
          </div>

          {transaction.projectId && (
            <div className="transaction-detail-row">
              <span className="transaction-detail-label">Project</span>
              <span className="transaction-detail-value">Project #{transaction.projectId}</span>
            </div>
          )}

          <div className="transaction-detail-row">
            <span className="transaction-detail-label">Type</span>
            <span className="transaction-detail-value">
              {transaction.amount > 0 ? '↗ Income' : '↙ Expense'}
            </span>
          </div>

          <button 
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
