'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function FormRenderer({ fields = [], onSubmit, initialValues = {} }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (fieldId, value) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: null }));
    }
  };

  const handleFileUpload = async (fieldId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'application');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        handleInputChange(fieldId, url);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error('File upload failed');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    fields.forEach(field => {
      if (field.required && (!values[field.id] || values[field.id] === '')) {
        newErrors[field.id] = 'This field is required';
      }
      
      // Email validation
      if (field.type === 'EMAIL' && values[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(values[field.id])) {
          newErrors[field.id] = 'Please enter a valid email address';
        }
      }
      
      // URL validation
      if (field.type === 'URL' && values[field.id]) {
        try {
          new URL(values[field.id]);
        } catch {
          newErrors[field.id] = 'Please enter a valid URL';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit?.(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field) => {
    const value = values[field.id] || '';
    const error = errors[field.id];
    const hasError = !!error;

    const inputClassName = `w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-slate-700 dark:text-white ${
      hasError ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-slate-600'
    }`;

    switch (field.type) {
      case 'TEXT':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={inputClassName}
          />
        );

      case 'TEXTAREA':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={inputClassName}
          />
        );

      case 'SELECT':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={inputClassName}
          >
            <option value="">Select an option...</option>
            {field.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'MULTISELECT':
        return (
          <div className="space-y-2">
            {field.options.map((option, index) => {
              const selectedValues = Array.isArray(value) ? value : [];
              const isSelected = selectedValues.includes(option);
              
              return (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const newValues = isSelected
                        ? selectedValues.filter(v => v !== option)
                        : [...selectedValues, option];
                      handleInputChange(field.id, newValues);
                    }}
                    className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{option}</span>
                </label>
              );
            })}
          </div>
        );

      case 'RADIO':
        return (
          <div className="space-y-2">
            {field.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'CHECKBOX':
        return (
          <div className="space-y-2">
            {field.options.map((option, index) => {
              const selectedValues = Array.isArray(value) ? value : [];
              const isSelected = selectedValues.includes(option);
              
              return (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const newValues = isSelected
                        ? selectedValues.filter(v => v !== option)
                        : [...selectedValues, option];
                      handleInputChange(field.id, newValues);
                    }}
                    className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{option}</span>
                </label>
              );
            })}
          </div>
        );

      case 'NUMBER':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={inputClassName}
          />
        );

      case 'EMAIL':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={inputClassName}
          />
        );

      case 'URL':
        return (
          <input
            type="url"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={inputClassName}
          />
        );

      case 'DATE':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={inputClassName}
          />
        );

      case 'FILE':
        return (
          <div>
            {value ? (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
                <span className="text-sm text-green-700 dark:text-green-300">File uploaded successfully</span>
                <button
                  type="button"
                  onClick={() => handleInputChange(field.id, '')}
                  className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className={`cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 dark:border-slate-600 ${
                hasError ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-slate-600'
              }`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-slate-400 dark:text-slate-500" />
                  <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(field.id, file);
                    }
                  }}
                />
              </label>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={inputClassName}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {field.helpText && (
            <p className="text-sm text-slate-600 dark:text-slate-400">{field.helpText}</p>
          )}
          
          {renderField(field)}
          
          {errors[field.id] && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors[field.id]}</p>
          )}
        </div>
      ))}
      
      {fields.length > 0 && (
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-3 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      )}
    </form>
  );
}
