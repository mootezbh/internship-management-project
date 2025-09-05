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

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  const addField = (fieldType) => {
    const newField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      label: `New ${FIELD_TYPES.find(f => f.type === fieldType)?.label || 'Field'}`,
      placeholder: '',
      helpText: '',
      required: false,
      options: fieldType === 'SELECT' || fieldType === 'MULTISELECT' || fieldType === 'RADIO' || fieldType === 'CHECKBOX' ? ['Option 1', 'Option 2'] : [],
      order: fields.length
    };
    
    setFields(prev => [...prev, newField]);
    setSelectedField(newField);
  };

  const removeField = (fieldId) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const updateField = (fieldId, updates) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
    if (selectedField?.id === fieldId) {
      setSelectedField(prev => ({ ...prev, ...updates }));
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedFields = Array.from(fields);
    const [removed] = reorderedFields.splice(result.source.index, 1);
    reorderedFields.splice(result.destination.index, 0, removed);

    // Update order
    const updatedFields = reorderedFields.map((field, index) => ({
      ...field,
      order: index
    }));

    setFields(updatedFields);
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
            className="w-full p-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white text-base focus:border-blue-500 transition-colors"
          />
        );
      case 'TEXTAREA':
        return (
          <textarea
            placeholder={field.placeholder}
            disabled
            rows={4}
            className="w-full p-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white text-base focus:border-blue-500 transition-colors resize-none"
          />
        );
      case 'SELECT':
        return (
          <select disabled className="w-full p-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white text-base focus:border-blue-500 transition-colors">
            <option>Select an option...</option>
            {field.options.map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        );
      case 'MULTISELECT':
        return (
          <select multiple disabled className="w-full p-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white text-base focus:border-blue-500 transition-colors" size={Math.min(field.options.length, 4)}>
            {field.options.map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        );
      case 'RADIO':
        return (
          <div className="space-y-2">
            {field.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <input type="radio" disabled className="text-blue-600" />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'CHECKBOX':
        return (
          <div className="space-y-2">
            {field.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <input type="checkbox" disabled className="text-blue-600 rounded" />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'DATE':
        return (
          <input
            type="date"
            disabled
            className="w-full p-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white text-base focus:border-blue-500 transition-colors"
          />
        );
      case 'FILE':
        return (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center bg-slate-50 dark:bg-slate-700">
            <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Click to upload or drag and drop</p>
          </div>
        );
      default:
        return (
          <input
            type="text"
            placeholder={field.placeholder}
            disabled
            className="w-full p-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white text-base focus:border-blue-500 transition-colors"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isPreviewMode ? 'Form Preview' : 'Form Builder'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {isPreviewMode ? 'Preview how your form will look to users' : 'Drag and drop elements to build your form'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isPreviewMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Eye className="w-4 h-4 mr-2 inline" />
              {isPreviewMode ? 'Exit Preview' : 'Preview'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Field Types */}
        <div className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6 h-[calc(100vh-88px)] overflow-y-auto">
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Form Elements</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Click to add elements to your form
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {FIELD_TYPES.map((fieldType) => {
              const Icon = fieldType.icon;
              return (
                <button
                  key={fieldType.type}
                  onClick={() => addField(fieldType.type)}
                  disabled={isPreviewMode}
                  className="flex items-center space-x-3 p-4 text-left border-2 border-slate-200 dark:border-slate-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-slate-900 dark:text-white group"
                >
                  <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50 transition-colors">
                    <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium">{fieldType.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {fieldType.type === 'TEXT' && 'Single line text input'}
                      {fieldType.type === 'TEXTAREA' && 'Multi-line text area'}
                      {fieldType.type === 'SELECT' && 'Dropdown selection'}
                      {fieldType.type === 'MULTISELECT' && 'Multiple choice dropdown'}
                      {fieldType.type === 'RADIO' && 'Single choice from options'}
                      {fieldType.type === 'CHECKBOX' && 'Multiple checkboxes'}
                      {fieldType.type === 'NUMBER' && 'Numeric input field'}
                      {fieldType.type === 'EMAIL' && 'Email address input'}
                      {fieldType.type === 'URL' && 'Website URL input'}
                      {fieldType.type === 'DATE' && 'Date picker'}
                      {fieldType.type === 'FILE' && 'File upload control'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content - Form Builder */}
        <div className="flex-1 flex">
          {/* Form Canvas */}
          <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-900 h-[calc(100vh-88px)] overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {fields.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-12">
                    <Plus className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500 mb-6" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Start building your form
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                      Add form elements from the sidebar to create your application form. Drag and drop to reorder them.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                        <Type className="w-4 h-4 mr-2" />
                        Add elements
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                        <GripVertical className="w-4 h-4 mr-2" />
                        Drag to reorder
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure properties
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="form-fields" isDropDisabled={isPreviewMode}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-6 p-6 rounded-xl transition-all duration-200 ${
                          snapshot.isDraggingOver 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600' 
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {fields
                          .sort((a, b) => a.order - b.order)
                          .map((field, index) => (
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
                                  className={`p-6 border rounded-xl transition-all duration-200 cursor-pointer ${
                                    snapshot.isDragging 
                                      ? 'shadow-2xl bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-600 rotate-2' 
                                      : selectedField?.id === field.id && !isPreviewMode
                                        ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'
                                  }`}
                                  onClick={() => !isPreviewMode && setSelectedField(field)}
                                >
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                      {!isPreviewMode && (
                                        <div
                                          {...provided.dragHandleProps}
                                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-grab active:cursor-grabbing"
                                        >
                                          <GripVertical className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                                        </div>
                                      )}
                                      <div>
                                        <label className="font-semibold text-slate-900 dark:text-white text-base">
                                          {field.label}
                                          {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        <div className="flex items-center mt-1">
                                          <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                                            {FIELD_TYPES.find(f => f.type === field.type)?.label || field.type}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    {!isPreviewMode && (
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedField(field);
                                          }}
                                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                          <Settings className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeField(field.id);
                                          }}
                                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {field.helpText && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                                      {field.helpText}
                                    </p>
                                  )}
                                  
                                  <div className="mt-4">
                                    {renderFieldPreview(field)}
                                  </div>
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
            <div className="w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-6 h-[calc(100vh-88px)] overflow-y-auto">
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Field Properties</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Configure the selected form field
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    {FIELD_TYPES.find(f => f.type === selectedField.type)?.icon && (
                      React.createElement(FIELD_TYPES.find(f => f.type === selectedField.type).icon, {
                        className: "w-5 h-5 text-slate-600 dark:text-slate-400"
                      })
                    )}
                    <span className="font-medium text-slate-900 dark:text-white">
                      {FIELD_TYPES.find(f => f.type === selectedField.type)?.label || selectedField.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Field ID: {selectedField.id}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Field Label *
                  </label>
                  <input
                    type="text"
                    value={selectedField.label}
                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                    placeholder="Enter field label..."
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={selectedField.placeholder || ''}
                    onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                    placeholder="Enter placeholder text..."
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Help Text
                  </label>
                  <textarea
                    value={selectedField.helpText || ''}
                    onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })}
                    placeholder="Additional instructions or help text..."
                    rows={3}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="field-required"
                    checked={selectedField.required || false}
                    onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="field-required" className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Required field
                  </label>
                </div>

                {(selectedField.type === 'SELECT' || 
                  selectedField.type === 'MULTISELECT' || 
                  selectedField.type === 'RADIO' || 
                  selectedField.type === 'CHECKBOX') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Options
                    </label>
                    <div className="space-y-2">
                      {selectedField.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(selectedField.id, index, e.target.value)}
                            className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                          />
                          <button
                            onClick={() => removeOption(selectedField.id, index)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(selectedField.id)}
                        className="w-full p-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
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
    </div>
  );
}
