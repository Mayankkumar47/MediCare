import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle, AlertCircle, Calendar, ArrowRight, Loader2 } from 'lucide-react';

import API_BASE from "../api.js";

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [status, setStatus] = useState('verifying'); // verifying, confirmed, likely_confirmed, error
  const [errorMessage, setErrorMessage] = useState('');
  const [appointment, setAppointment] = useState(null);

  // PayPal returns: ?token=ORDER_ID&PayerID=PAYER_ID
  // Stripe returns: ?session_id=cs_XXXX
  // Mock returns:   ?session_id=mock_session_XXXX
  const paypalToken = searchParams.get('token');
  const stripeSessionId = searchParams.get('session_id');
  // Prefer PayPal token over Stripe session_id; ignore old PAYPAL_ORDER_ID placeholder
  const sessionId = paypalToken || (stripeSessionId === 'PAYPAL_ORDER_ID' ? null : stripeSessionId);

  const isService = location.pathname.includes('service-appointment');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('Missing payment session. Please check your appointments page.');
      return;
    }

    const confirmPayment = async () => {
      try {
        const endpoint = isService 
          ? `${API_BASE}/api/service-appointments/confirm-payment`
          : `${API_BASE}/api/appointments/confirm-payment`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId })
        });

        const json = await response.json().catch(() => null);

        if (!response.ok) {
          // 404 = appointment already confirmed or session not found → still show soft success
          if (response.status === 404) {
            setStatus('likely_confirmed');
          } else {
            throw new Error(json?.message || `Verification failed (${response.status})`);
          }
          return;
        }

        setStatus('confirmed');
        setAppointment(json?.appointment || json?.data || null);
      } catch (err) {
        console.error("Payment confirmation error:", err);
        setStatus('error');
        setErrorMessage(err.message || 'Failed to verify online transaction.');
      }
    };

    confirmPayment();
  }, [sessionId, isService]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0fdf4, #ffffff, #ecfdf5)', padding: '48px 16px', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', boxShadow: '0 25px 50px rgba(0,0,0,0.12)', border: '1px solid #d1fae5', borderRadius: '24px', padding: '32px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>

        {/* Verification Loader */}
        {status === 'verifying' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
            <div style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }}>
              <Loader2 size={64} style={{ color: '#059669' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#064e3b', marginBottom: '8px' }}>Verifying Payment</h2>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Please wait while we secure your booking details from the gateway...</p>
          </div>
        )}

        {/* Confirmed Success */}
        {status === 'confirmed' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeInUp 0.5s ease-out' }}>
            <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '50%', border: '2px solid #d1fae5', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
              <CheckCircle size={64} style={{ color: '#059669' }} />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#064e3b', marginBottom: '8px' }}>Booking Confirmed!</h2>
            <p style={{ color: '#065f46', fontWeight: 600, marginBottom: '24px' }}>Thank you. Your payment was captured successfully.</p>

            {appointment && (
              <div style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', textAlign: 'left', marginBottom: '24px', fontSize: '13px' }}>
                <h3 style={{ fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>Booking Overview</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#475569' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>Patient:</span>
                    <span style={{ fontWeight: 600 }}>{appointment.patientName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>{isService ? 'Service:' : 'Doctor:'}</span>
                    <span style={{ fontWeight: 600 }}>{isService ? appointment.serviceName : appointment.doctorName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>Scheduled:</span>
                    <span style={{ fontWeight: 600 }}>
                      {appointment.date} {appointment.time || `${appointment.hour}:${String(appointment.minute || 0).padStart(2, '0')} ${appointment.ampm || ''}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>Status:</span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>Paid & Confirmed</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <Link to="/appointments" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', borderRadius: '999px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                Go to Appointments <ArrowRight size={16} />
              </Link>
              <Link to="/" style={{ color: '#059669', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>Return to Home</Link>
            </div>
          </div>
        )}

        {/* Likely confirmed - soft success for already-captured or 404 */}
        {status === 'likely_confirmed' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeInUp 0.5s ease-out' }}>
            <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '50%', border: '2px solid #d1fae5', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
              <CheckCircle size={64} style={{ color: '#34d399' }} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#064e3b', marginBottom: '8px' }}>Payment Received!</h2>
            <p style={{ color: '#475569', fontSize: '13px', marginBottom: '24px' }}>Your payment was processed. Your appointment may already be confirmed — check your appointments page for details.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <Link to="/appointments" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', borderRadius: '999px', fontWeight: 700, textDecoration: 'none' }}>
                View My Appointments <ArrowRight size={16} />
              </Link>
              <Link to="/" style={{ color: '#059669', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>Return to Home</Link>
            </div>
          </div>
        )}

        {/* Error Panel - softer amber instead of red */}
        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeInUp 0.5s ease-out' }}>
            <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '50%', border: '2px solid #fde68a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
              <AlertCircle size={64} style={{ color: '#d97706' }} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#78350f', marginBottom: '8px' }}>Verification Issue</h2>
            <p style={{ color: '#475569', fontSize: '13px', marginBottom: '6px' }}>{errorMessage || 'Could not verify payment transaction status.'}</p>
            <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '24px' }}>If you completed the payment, your booking was likely recorded. Please check your appointments.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <Link to="/appointments" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#059669', color: '#fff', borderRadius: '999px', fontWeight: 700, textDecoration: 'none' }}>
                Check My Appointments <ArrowRight size={16} />
              </Link>
              <Link to="/contact" style={{ color: '#6b7280', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>Contact Support</Link>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default CheckoutSuccessPage;
