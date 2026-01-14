import React from 'react';

const PRICING_TIERS = [
  { label: 'BASE WASH', price: '$3.00', subtitle: '40 min cycle', color: '#3b82f6', highlight: true },
  { label: '+15 MIN', price: '+$0.75', subtitle: null, color: '#f59e0b', highlight: false },
  { label: '+30 MIN', price: '+$1.50', subtitle: null, color: '#f59e0b', highlight: false },
  { label: '+1 HOUR', price: '+$3.00', subtitle: null, color: '#f59e0b', highlight: false },
  { label: '+2 HOURS', price: '+$8.00', subtitle: null, color: '#f59e0b', highlight: false },
  { label: 'OVERSTAY', price: '$0.10', subtitle: 'per minute', color: '#ef4444', highlight: true },
];

const PricingDisplay = () => {
  return (
    <div style={{
      marginTop: '24px',
      padding: '20px',
      background: 'linear-gradient(90deg, #1a1a1a 0%, #111 100%)',
      borderRadius: '12px',
      border: '2px solid #222',
    }}>
      {/* Section Label */}
      <div style={{
        fontFamily: '"Courier New", monospace',
        fontSize: '10px',
        color: '#666',
        letterSpacing: '1px',
        marginBottom: '16px',
      }}>
        PRICING STRUCTURE
      </div>

      {/* Pricing Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '16px',
        fontFamily: '"Courier New", monospace',
      }}>
        {PRICING_TIERS.map((tier, index) => (
          <PricingCard key={index} {...tier} />
        ))}
      </div>
    </div>
  );
};

const PricingCard = ({ label, price, subtitle, color, highlight }) => (
  <div style={{
    padding: '16px',
    background: '#0a0a0a',
    borderRadius: '8px',
    border: highlight ? `2px solid ${color}` : '1px solid #333',
  }}>
    <div style={{ color: color, fontSize: '10px', marginBottom: '4px' }}>
      {label}
    </div>
    <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
      {price}
    </div>
    {subtitle && (
      <div style={{ color: '#666', fontSize: '10px' }}>
        {subtitle}
      </div>
    )}
  </div>
);

export default PricingDisplay;