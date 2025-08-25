"use client";

import React from 'react';

const Switch = ({ 
  checked = false, 
  onCheckedChange, 
  disabled = false,
  className = "",
  id,
  ...props 
}) => {
  const handleChange = (e) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <label 
      className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      htmlFor={id}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div 
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
          ${checked 
            ? 'bg-blue-600 dark:bg-blue-500' 
            : 'bg-gray-200 dark:bg-gray-700'
          }
          ${disabled ? '' : 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900'}
          ${className}
        `}
      >
        <div 
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </div>
    </label>
  );
};

export default Switch;
