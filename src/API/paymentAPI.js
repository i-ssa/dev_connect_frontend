/**
 * Payment API wrapper
 * Frontend client for initiating MPESA STK push via backend endpoint
 * Backend must expose: POST /api/payments/mpesa/stk
 */

import { API_BASE_URL } from '../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/payments`;

/**
 * Initiate an MPESA STK Push
 * @param {{phone: string, amount: number, accountReference?: string, transactionDesc?: string}} payload
 * @returns {Promise<Object>} backend response
 */
export const initiateMpesaStk = async (payload) => {
  try {
    const response = await fetch(`${BASE_URL}/mpesa/stk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type');
    let data = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      throw new Error(data?.message || `STK initiation failed (${response.status})`);
    }

    return data;
  } catch (err) {
    console.error('initiateMpesaStk error:', err);
    throw err;
  }
};

export default { initiateMpesaStk };
