import React from 'react';

const Card = ({ children, className = '', style = {} }) => {
  return (
    <div className={`card ${className}`} style={{ borderRadius: 12, ...style }}>
      {children}
    </div>
  );
};

export default Card;
