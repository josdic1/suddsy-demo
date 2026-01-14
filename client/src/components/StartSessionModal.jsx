import React, { useState } from 'react';

// ===================
// PRICING LOGIC
// ===================
const BASE_PRICE = 3.00;
const PRE_AUTH_HOLD = 10.00;

const BUFFER_OPTIONS = [
  { minutes: 0, label: 'No Buffer' },
  { minutes: 15, label: '15 min' },
  { minutes: 30, label: '30 min' },
  { minutes: 60, label: '1 hour' },
  { minutes: 120, label: '2 hours' },
];

// Calculate buffer price based on tier structure
const calculateBufferPrice = (minutes) => {
  let total = 0;
  if (minutes >= 15) total += 0.75;   // First 15 min
  if (minutes >= 30) total += 1.50;   // Next 15 min (30 total)
  if (minutes >= 60) total += 3.00;   // Next 30 min (1 hr total)
  if (minutes >= 120) total += 8.00;  // Next 60 min (2 hr total)
  return total;
};

// ===================
// MAIN COMPONENT
// ===================
const StartSessionModal = ({ machine, onClose, onStartSession }) => {
  const [bufferSelection, setBufferSelection] = useState(0);

  const bufferPrice = calculateBufferPrice(bufferSelection);
  const totalPrice = BASE_PRICE + bufferPrice;

  const handleStart = () => {
    onStartSession(machine.id, bufferSelection, totalPrice);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
          border: '3px solid #3b82f6',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 0 60px rgba(59, 130, 246, 0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <h3 style={{
          margin: '0 0 24px',
          fontFamily: '"Courier New", monospace',
          fontSize: '18px',
          color: '#fff',
        }}>
          START {machine.type.toUpperCase()} #{machine.id}
        </h3>

        {/* Buffer Selection */}
        <BufferSelector
          options={BUFFER_OPTIONS}
          selected={bufferSelection}
          onSelect={setBufferSelection}
        />

        {/* Price Summary */}
        <PriceSummary
          basePrice={BASE_PRICE}
          bufferMinutes={bufferSelection}
          bufferPrice={bufferPrice}
          totalPrice={totalPrice}
        />

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={cancelButtonStyle}>
            CANCEL
          </button>
          <button onClick={handleStart} style={startButtonStyle}>
            START WASH →
          </button>
        </div>

        {/* Pre-auth Notice */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#111',
          borderRadius: '6px',
          fontFamily: '"Courier New", monospace',
          fontSize: '10px',
          color: '#666',
          textAlign: 'center',
        }}>
          💳 A ${PRE_AUTH_HOLD.toFixed(2)} hold will be placed on your card for potential overstay fees
        </div>
      </div>
    </div>
  );
};

// ===================
// SUB-COMPONENTS
// ===================
const BufferSelector = ({ options, selected, onSelect }) => (
  <div style={{ marginBottom: '24px' }}>
    <div style={{
      fontFamily: '"Courier New", monospace',
      fontSize: '10px',
      color: '#666',
      marginBottom: '12px',
    }}>
      SELECT BUFFER TIME
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {options.map(option => (
        <BufferOption
          key={option.minutes}
          option={option}
          isSelected={selected === option.minutes}
          onSelect={() => onSelect(option.minutes)}
        />
      ))}
    </div>
  </div>
);

const BufferOption = ({ option, isSelected, onSelect }) => {
  const price = calculateBufferPrice(option.minutes);
  
  return (
    <button
      onClick={onSelect}
      style={{
        background: isSelected
          ? 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
          : '#111',
        border: `2px solid ${isSelected ? '#3b82f6' : '#333'}`,
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#fff',
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
      }}
    >
      <span>{option.label}</span>
      <span style={{ color: option.minutes === 0 ? '#22c55e' : '#f59e0b' }}>
        {option.minutes === 0 ? 'FREE' : `+$${price.toFixed(2)}`}
      </span>
    </button>
  );
};

const PriceSummary = ({ basePrice, bufferMinutes, bufferPrice, totalPrice }) => (
  <div style={{
    background: '#000',
    border: '2px solid #333',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
  }}>
    {/* Base price line */}
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: '"Courier New", monospace',
      marginBottom: '8px',
    }}>
      <span style={{ color: '#888' }}>Base Wash (40 min)</span>
      <span>${basePrice.toFixed(2)}</span>
    </div>

    {/* Buffer price line (if applicable) */}
    {bufferMinutes > 0 && (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: '"Courier New", monospace',
        marginBottom: '8px',
      }}>
        <span style={{ color: '#888' }}>Buffer ({bufferMinutes} min)</span>
        <span style={{ color: '#f59e0b' }}>+${bufferPrice.toFixed(2)}</span>
      </div>
    )}

    {/* Total line */}
    <div style={{
      borderTop: '2px solid #333',
      paddingTop: '8px',
      marginTop: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: '"Courier New", monospace',
      fontWeight: 'bold',
      fontSize: '18px',
    }}>
      <span>TOTAL</span>
      <span style={{ color: '#22c55e' }}>${totalPrice.toFixed(2)}</span>
    </div>
  </div>
);

// ===================
// BUTTON STYLES
// ===================
const cancelButtonStyle = {
  flex: 1,
  background: '#333',
  border: 'none',
  borderRadius: '8px',
  padding: '14px',
  color: '#fff',
  fontFamily: '"Courier New", monospace',
  fontSize: '14px',
  cursor: 'pointer',
};

const startButtonStyle = {
  flex: 2,
  background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
  border: 'none',
  borderRadius: '8px',
  padding: '14px',
  color: '#000',
  fontFamily: '"Courier New", monospace',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

export default StartSessionModal;