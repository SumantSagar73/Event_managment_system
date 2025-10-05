import React from 'react';

/**
 * Button component
 * Props:
 * - variant: 'primary' | 'outline' | 'ghost' (default: 'primary')
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - icon: ReactNode (optional) - an icon node, placed before label
 * - children: label or nodes
 * - ...rest: forwarded to button
 */
export default function Button({ variant = 'primary', size = 'md', icon, children, className = '', ...rest }) {
  const base = 'btn';
  const v = variant === 'primary' ? 'btn-primary' : variant === 'outline' ? 'btn-outline' : 'btn-ghost';
  const s = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const iconClass = icon ? 'btn-icon' : '';

  return (
    <button className={[base, v, s, iconClass, className].filter(Boolean).join(' ')} {...rest}>
      {icon ? <span className="btn-icon-inner">{icon}</span> : null}
      {children}
    </button>
  );
}
