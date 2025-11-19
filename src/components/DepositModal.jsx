import React, { useState } from 'react';
import '../styles/PaymentModal.css';

const DepositModal = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (paymentMethod === 'mpesa' && !phoneNumber) {
      alert('Please enter your M-Pesa phone number');
      return;
    }

    if (paymentMethod === 'card' && !cardNumber) {
      alert('Please enter your card number');
      return;
    }

    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      // Save transaction to localStorage
      const transactions = JSON.parse(localStorage.getItem('client_transactions') || '[]');
      const newTransaction = {
        id: Date.now(),
        title: `Deposit via ${paymentMethod === 'mpesa' ? 'M-Pesa' : 'Card'}`,
        date: new Date().toLocaleString('en-US', { 
          day: 'numeric', 
          month: 'long', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        category: 'Deposit',
        icon: '💰',
        amount: parseFloat(amount),
        trend: 'up',
        categoryColor: '#10b981',
        paymentMethod: paymentMethod === 'mpesa' ? `M-Pesa (${phoneNumber})` : `Card (****${cardNumber.slice(-4)})`,
        status: 'Completed'
      };

      transactions.unshift(newTransaction);
      localStorage.setItem('client_transactions', JSON.stringify(transactions));

      // Update balance
      const currentBalance = parseFloat(localStorage.getItem('client_balance') || '0');
      localStorage.setItem('client_balance', (currentBalance + parseFloat(amount)).toString());

      setLoading(false);
      onSuccess(`Successfully deposited KSH ${parseFloat(amount).toLocaleString()}`);
      onClose();
    }, 2000);
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>💰 Deposit Funds</h2>
          <button className="payment-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="payment-modal-form">
          <div className="form-group">
            <label>Amount (KSH)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              step="0.01"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <div className="payment-methods">
              <label className={`payment-method-option ${paymentMethod === 'mpesa' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="mpesa"
                  checked={paymentMethod === 'mpesa'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="method-icon">📱</span>
                <span>M-Pesa</span>
              </label>

              <label className={`payment-method-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="method-icon">💳</span>
                <span>Card</span>
              </label>
            </div>
          </div>

          {paymentMethod === 'mpesa' && (
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
              <small>You will receive an STK push to complete payment</small>
            </div>
          )}

          {paymentMethod === 'card' && (
            <>
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  pattern="[0-9]{16}"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    pattern="[0-9]{2}/[0-9]{2}"
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    pattern="[0-9]{3,4}"
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </>
          )}

          <div className="payment-summary">
            <div className="summary-row">
              <span>Amount</span>
              <span>KSH {amount ? parseFloat(amount).toLocaleString() : '0.00'}</span>
            </div>
            <div className="summary-row">
              <span>Processing Fee</span>
              <span>KSH 0.00</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>KSH {amount ? parseFloat(amount).toLocaleString() : '0.00'}</span>
            </div>
          </div>

          <button type="submit" className="payment-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Deposit Funds'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DepositModal;
