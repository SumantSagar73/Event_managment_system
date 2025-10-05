import React from 'react';
import Button from '../Button';

const UiButton = ({ variant='primary', size='md', children, ...rest }) => {
  return (
    <Button variant={variant} size={size} {...rest}>
      {children}
    </Button>
  );
};

export default UiButton;
