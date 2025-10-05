import React from 'react';

const Badge = ({ children, className = '', style = {} }) => {
  return (
    <span
      className={`event-badge ${className}`}
      style={{ padding: '6px 12px', borderRadius: 9999, fontWeight: 700, display: 'inline-block', ...style }}
    >
      {children}
    </span>
  );
};

export default Badge;
