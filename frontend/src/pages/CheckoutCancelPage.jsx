import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const CheckoutCancelPage = () => {
  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff7ed, #ffffff, #fef3c7)',
      padding: '48px 16px', fontFamily: 'Georgia, serif'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.1)', border: '1px solid #fde68a',
        borderRadius: '24px', padding: '40px 32px', maxWidth: '420px', width: '100%', textAlign: 'center'
      }}>
        <div style={{
          background: '#fff7ed', padding: '16px', borderRadius: '50%',
          border: '2px solid #fed7aa', display: 'inline-block', marginBottom: '24px'
        }}>
          <XCircle size={64} style={{ color: '#f97316' }} />
        </div>

        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#7c2d12', marginBottom: '10px' }}>
          Payment Cancelled
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '28px', lineHeight: 1.6 }}>
          You cancelled the payment. No charge has been made. You can try again anytime.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link
            to="/doctors"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '13px', background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#fff', borderRadius: '999px', fontWeight: 700,
              textDecoration: 'none', boxShadow: '0 4px 14px rgba(249,115,22,0.3)'
            }}
          >
            <ArrowLeft size={16} /> Try Again - Book a Doctor
          </Link>
          <Link
            to="/services"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '13px', background: '#f1f5f9', color: '#334155',
              borderRadius: '999px', fontWeight: 600, textDecoration: 'none', fontSize: '14px'
            }}
          >
            Book a Lab Service Instead
          </Link>
          <Link to="/" style={{ color: '#9ca3af', fontSize: '13px', textDecoration: 'none', marginTop: '4px' }}>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancelPage;
