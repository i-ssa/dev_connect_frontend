import React, { useState } from 'react';
import paymentAPI from '../API/paymentAPI';
import '../styles/Payment.css';

export default function MpesaPayment({ accountReference = 'DevConnect', transactionDesc = 'Payment' }) {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const normalizePhone = (p) => {
    // Accept numbers like 07XXXXXXXX or 2547XXXXXXXX
    const cleaned = p.replace(/[^0-9]/g, '');
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return '254' + cleaned.slice(1);
    }
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const normalized = normalizePhone(phone);
    if (!normalized || !amount) {
      setMessage({ type: 'error', text: 'Enter valid phone and amount' });
      return;
    }
    setLoading(true);
    try {
      const res = await paymentAPI.initiateMpesaStk({
        phone: normalized,
        amount: Number(amount),
        accountReference,
        transactionDesc,
      });
      setMessage({ type: 'success', text: res.message || 'STK push initiated. Check your phone.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to initiate STK push' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mpesa-payment">
      <h4>Pay with M-Pesa</h4>
      <form onSubmit={handleSubmit} className="mpesa-form">
        <label>
          Phone
          <input
            type="tel"
            placeholder="07xxxxxxxx or 2547xxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label>
          Amount (KES)
          <input
            type="number"
            min="1"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>

        <div className="mpesa-actions">
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Processing…' : 'Pay (STK)'}
          </button>
        </div>

        {message && (
          <div className={`mpesa-message ${message.type}`}>{message.text}</div>
        )}
      </form>
    </div>
  );
}
