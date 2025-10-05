import React from 'react';

const Input = ({ className = '', ...rest }) => {
  return (
    <input className={`form-control ui-input ${className}`} {...rest} />
  );
};

export default Input;
