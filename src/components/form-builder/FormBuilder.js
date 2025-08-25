'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Type, 
  AlignLeft, 
  List, 
  CheckSquare, 
  Radio, 
  Hash, 
  Mail, 
  Link, 
  Calendar, 
  Upload,
  Plus,
  Trash2,
  Settings,
  Eye,
  GripVertical
} from 'lucide-react';

const FIELD_TYPES = [
  { type: 'TEXT', label: 'Text Input', icon: Type },
  { type: 'TEXTAREA', label: 'Text Area', icon: AlignLeft },
  { type: 'SELECT', label: 'Dropdown', icon: List },
  { type: 'MULTISELECT', label: 'Multi Select', icon: List },
  { type: 'RADIO', label: 'Radio Buttons', icon: Radio },
  { type: 'CHECKBOX', label: 'Checkboxes', icon: CheckSquare },
  { type: 'NUMBER', label: 'Number', icon: Hash },
  { type: 'EMAIL', label: 'Email', icon: Mail },
  { type: 'URL', label: 'URL', icon: Link },
  { type: 'DATE', label: 'Date', icon: Calendar },
  { type: 'FILE', label: 'File Upload', icon: Upload },
];

export default function FormBuilder({ initialFields = [], onSave }) {
  const [fields, setFields] = useState(initialFields);
  const [selectedField, setSelectedField] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFields(items.map((item, index) => ({ ...item, order: index })));
  };

  const addField = (fieldType) => {
    const newField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      label: `New ${FIELD_TYPES.find(f => f.type === fieldType)?.label || 'Field'}`,
      placeholder: '',
      helpText: '',
      required: false,
      options: fieldType === 'SELECT' || fieldType === 'MULTISELECT' || fieldType === 'RADIO' || fieldType === 'CHECKBOX' ? ['Option 1'] : [],
      order: fields.length,
    };
    setFields([...fields, newField]);
    setSelectedField(newField);
  };

  const updateField = (fieldId, updates) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };

  const removeField = (fieldId) => {
    setFields(fields.filter(field => field.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const addOption = (fieldId) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const newOptions = [...field.options, `Option ${field.options.length + 1}`];
      updateField(fieldId, { options: newOptions });
    }
  };

  const updateOption = (fieldId, optionIndex, value) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeOption = (fieldId, optionIndex) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options.length > 1) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex);
      updateField(fieldId, { options: newOptions });
    }
  };

  const renderFieldPreview = (field) => {
    const Icon = FIELD_TYPES.find(f => f.type === field.type)?.icon || Type;
    
    switch (field.type) {
      case 'TEXT':
      case 'EMAIL':
      case 'URL':
      case 'NUMBER':
        return (
          <input
            type={field.type === 'NUMBER' ? 'number' : field.type === 'EMAIL' ? 'email' : field.type === 'URL' ? 'url' : 'text'}
            placeholder={field.placeholder}
            disabled
            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 dark:text-white"
          />
        );
      case 'TEXTAREA':
        return (
          <textarea
            placeholder={field.placeholder}
            disabled
            rows={3}
            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 dark:text-white"
          />
        );
      case 'SELECT':
        return (
          <select disabled className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 dark:text-white">
            <option>Select an option...</option>
            {field.options.map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        );
      case 'MULTISELECT':
        return (
          <select disabled multiple className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 dark:text-white" size={Math.min(field.options.length + 1, 4)}>
            {field.options.map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        );
      case 'RADIO':
        return (
          <div className="space-y-2">
            {field.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input type="radio" name={field.id} disabled className="text-blue-600 dark:text-blue-400" />
                <span className="text-gray-900 dark:text-white">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'CHECKBOX':
        return (
          <div className="space-y-2">
            {field.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input type="checkbox" disabled className="text-blue-600 dark:text-blue-400" />
                <span className="text-gray-900 dark:text-white">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'DATE':
        return (
          <input
            type="date"
            disabled
            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 dark:text-white"
          />
        );
      case 'FILE':
        return (
          <div className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-md text-center bg-gray-50 dark:bg-slate-700">
            <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-slate-500" />
            <p className="text-gray-500 dark:text-slate-400">Click to upload or drag and drop</p>
          </div>
        );
      default:
        return (
          <input
            type="text"
            placeholder={field.placeholder}
            disabled
            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 dark:text-white"
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      {/* Sidebar - Field Types */}
      <div className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Form Elements</h3>
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`p-2 rounded-md transition-colors ${
              isPreviewMode ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2">
          {FIELD_TYPES.map((fieldType) => {
            const Icon = fieldType.icon;
            return (
              <button
                key={fieldType.type}
                onClick={() => addField(fieldType.type)}
                disabled={isPreviewMode}
                className="w-full flex items-center space-x-3 p-3 text-left text-sm border border-gray-200 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-900 dark:text-white"
              >
                <Icon className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                <span>{fieldType.label}</span>
              </button>
            );
          })}
        </div>

        {!isPreviewMode && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => onSave?.(fields)}
              className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Save Form
            </button>
          </div>
        )}
      </div>

      {/* Main Content - Form Builder */}
      <div className="flex-1 flex">
        {/* Form Canvas */}
        <div className="flex-1 p-6 overflow-auto bg-white dark:bg-slate-900">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              {isPreviewMode ? 'Form Preview' : 'Form Builder'}
            </h2>
            
            {fields.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                <Plus className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600 mb-4" />
                <p>Add form elements from the sidebar to get started</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="form-fields" isDropDisabled={isPreviewMode}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {fields.map((field, index) => (
                        <Draggable
                          key={field.id}
                          draggableId={field.id}
                          index={index}
                          isDragDisabled={isPreviewMode}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-white dark:bg-slate-800 border rounded-lg p-4 ${
                                snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                              } ${
                                selectedField?.id === field.id && !isPreviewMode
                                  ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
                                  : 'border-gray-200 dark:border-slate-600'
                              }`}
                              onClick={() => !isPreviewMode && setSelectedField(field)}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  {!isPreviewMode && (
                                    <div
                                      {...provided.dragHandleProps}
                                      className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 cursor-grab"
                                    >
                                      <GripVertical className="w-4 h-4" />
                                    </div>
                                  )}
                                  <label className="font-medium text-gray-900 dark:text-white">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </label>
                                </div>
                                {!isPreviewMode && (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedField(field);
                                      }}
                                      className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                                    >
                                      <Settings className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeField(field.id);
                                      }}
                                      className="text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {field.helpText && (
                                <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{field.helpText}</p>
                              )}
                              
                              {renderFieldPreview(field)}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>

        {/* Right Sidebar - Field Properties */}
        {selectedField && !isPreviewMode && (
          <div className="w-80 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 p-4 overflow-auto">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Field Properties</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={selectedField.label}
                  onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={selectedField.placeholder}
                  onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Help Text
                </label>
                <textarea
                  value={selectedField.helpText}
                  onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })}
                  rows={2}
                  className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedField.required}
                  onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                  className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700"
                />
                <label htmlFor="required" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Required field
                </label>
              </div>

              {/* Options for select, radio, checkbox fields */}
              {['SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX'].includes(selectedField.type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    {selectedField.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(selectedField.id, index, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                        />
                        <button
                          onClick={() => removeOption(selectedField.id, index)}
                          disabled={selectedField.options.length <= 1}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(selectedField.id)}
                      className="w-full p-2 border border-dashed border-gray-300 dark:border-slate-600 rounded-md text-gray-600 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-500 hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      Add Option
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
