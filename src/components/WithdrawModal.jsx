import React, { useState } from 'react';
import '../styles/PaymentModal.css';

const WithdrawModal = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Get current balance
  const currentBalance = parseFloat(localStorage.getItem('developer_balance') || '6169');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > currentBalance) {
      alert('Insufficient balance');
      return;
    }

    if (withdrawalMethod === 'mpesa' && !phoneNumber) {
      alert('Please enter your M-Pesa phone number');
      return;
    }

    if (withdrawalMethod === 'bank' && (!bankName || !accountNumber)) {
      alert('Please enter your bank details');
      return;
    }

    setLoading(true);

    // Simulate withdrawal processing
    setTimeout(() => {
      // Save transaction to localStorage
      const transactions = JSON.parse(localStorage.getItem('developer_transactions') || '[]');
      const newTransaction = {
        id: Date.now(),
        title: `Withdrawal to ${withdrawalMethod === 'mpesa' ? 'M-Pesa' : 'Bank'}`,
        date: new Date().toLocaleString('en-US', { 
          day: 'numeric', 
          month: 'long', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        category: 'Withdrawal',
        icon: '💸',
        amount: -parseFloat(amount),
        trend: 'down',
        categoryColor: '#ef4444',
        paymentMethod: withdrawalMethod === 'mpesa' 
          ? `M-Pesa (${phoneNumber})` 
          : `${bankName} (${accountNumber})`,
        status: 'Completed'
      };

      transactions.unshift(newTransaction);
      localStorage.setItem('developer_transactions', JSON.stringify(transactions));

      // Update balance
      localStorage.setItem('developer_balance', (currentBalance - parseFloat(amount)).toString());

      setLoading(false);
      onSuccess(`Successfully withdrawn KSH ${parseFloat(amount).toLocaleString()}`);
      onClose();
    }, 2000);
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>💸 Withdraw Earnings</h2>
          <button className="payment-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="payment-modal-form">
          <div className="withdraw-account-info">
            <h4>💰 Available Balance</h4>
            <p style={{ fontSize: '20px', fontWeight: '700', marginTop: '8px' }}>
              KSH {currentBalance.toLocaleString()}
            </p>
          </div>

          <div className="form-group">
            <label>Withdrawal Amount (KSH)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              max={currentBalance}
              step="0.01"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Withdrawal Method</label>
            <div className="payment-methods">
              <label className={`payment-method-option ${withdrawalMethod === 'mpesa' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="mpesa"
                  checked={withdrawalMethod === 'mpesa'}
                  onChange={(e) => setWithdrawalMethod(e.target.value)}
                />
                <span className="method-icon">📱</span>
                <span>M-Pesa</span>
              </label>

              <label className={`payment-method-option ${withdrawalMethod === 'bank' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="bank"
                  checked={withdrawalMethod === 'bank'}
                  onChange={(e) => setWithdrawalMethod(e.target.value)}
                />
                <span className="method-icon">🏦</span>
                <span>Bank Transfer</span>
              </label>
            </div>
          </div>

          {withdrawalMethod === 'mpesa' && (
            <div className="form-group">
              <label>M-Pesa Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0712345678"
                pattern="[0-9]{10}"
                required
                className="form-input"
              />
              <small>Funds will be sent to this number</small>
            </div>
          )}

          {withdrawalMethod === 'bank' && (
            <>
              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., Equity Bank"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  required
                  className="form-input"
                />
              </div>
              <small style={{ display: 'block', marginTop: '-12px', marginBottom: '20px', color: '#6b7280', fontSize: '12px' }}>
                Processing time: 1-3 business days
              </small>
            </>
          )}

          <div className="payment-summary">
            <div className="summary-row">
              <span>Withdrawal Amount</span>
              <span>KSH {amount ? parseFloat(amount).toLocaleString() : '0.00'}</span>
            </div>
            <div className="summary-row">
              <span>Transaction Fee</span>
              <span>KSH 0.00</span>
            </div>
            <div className="summary-row total">
              <span>You'll Receive</span>
              <span>KSH {amount ? parseFloat(amount).toLocaleString() : '0.00'}</span>
            </div>
          </div>

          <button type="submit" className="payment-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Withdraw Funds'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;
