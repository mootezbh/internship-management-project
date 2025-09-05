'use client';

import React, { useState, useEffect, useCallback } from 'react';
import NextImage from 'next/image';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Type, 
  AlignLeft, 
  Video, 
  Upload,
  Link, 
  Image, 
  FileText, 
  Plus, 
  Trash2, 
  Settings,
  Eye,
  GripVertical,
  Save,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Switch from '@/components/ui/switch';
import { toast } from 'sonner';
import { LoadingSpinner, ContentLoading } from '@/components/ui/loading-spinner';

// ContentEditor component - moved outside to prevent re-creation on every render
const ContentEditor = React.memo(({ 
  selectedContent, 
  onTitleChange, 
  onContentChange, 
  onUrlChange, 
  onRequiredChange 
}) => {
  if (!selectedContent) return null;

  return (
    <div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Content Properties</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={selectedContent.title || ''}
            onChange={onTitleChange}
            placeholder="Content title..."
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
          />
        </div>

        {(selectedContent.type === 'TEXT' || selectedContent.type === 'TEXTAREA' || selectedContent.type === 'CODE') && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {selectedContent.type === 'CODE' ? 'Code' : 'Content'}
            </label>
            <textarea
              value={selectedContent.content || ''}
              onChange={onContentChange}
              placeholder={
                selectedContent.type === 'CODE' 
                  ? 'Enter your code here...' 
                  : 'Enter your content here...'
              }
              rows={selectedContent.type === 'TEXTAREA' ? 6 : 4}
              className={`w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white ${
                selectedContent.type === 'CODE' ? 'font-mono' : ''
              }`}
            />
          </div>
        )}

        {(selectedContent.type === 'VIDEO' || selectedContent.type === 'URL' || selectedContent.type === 'FILE' || selectedContent.type === 'IMAGE') && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {selectedContent.type === 'VIDEO' ? 'Video URL' : 
               selectedContent.type === 'FILE' ? 'File URL' :
               selectedContent.type === 'IMAGE' ? 'Image URL' : 'URL'}
            </label>
            <input
              type="url"
              value={selectedContent.url || ''}
              onChange={onUrlChange}
              placeholder={
                selectedContent.type === 'VIDEO' ? 'https://youtube.com/watch?v=...' :
                selectedContent.type === 'FILE' ? 'https://example.com/file.pdf' :
                selectedContent.type === 'IMAGE' ? 'https://example.com/image.jpg' :
                'https://example.com'
              }
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="content-required"
            checked={selectedContent.required || false}
            onChange={(e) => onRequiredChange(e.target.checked)}
            className="text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
          />
          <label htmlFor="content-required" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
            Required for task completion
          </label>
        </div>
      </div>
    </div>
  );
});

ContentEditor.displayName = 'ContentEditor';

const CONTENT_TYPES = [
  { type: 'TEXT', label: 'Text Content', icon: Type, description: 'Add text instructions or descriptions' },
  { type: 'TEXTAREA', label: 'Long Text', icon: AlignLeft, description: 'Add detailed instructions or requirements' },
  { type: 'VIDEO', label: 'Video', icon: Video, description: 'Embed video tutorials or explanations' },
  { type: 'FILE', label: 'File Attachment', icon: Upload, description: 'Attach files, documents, or resources' },
  { type: 'URL', label: 'Website Link', icon: Link, description: 'Link to external resources or references' },
  { type: 'IMAGE', label: 'Image', icon: Image, description: 'Add images, diagrams, or screenshots' },
  { type: 'CODE', label: 'Code Block', icon: FileText, description: 'Add code examples or snippets' },
];

function TaskBuilder({ initialContent = [], onSave, taskData = {}, learningPathTitle, onBack, isEditMode = false, editTaskTitle }) {
  console.log('TaskBuilder props:', { learningPathTitle, onBack: !!onBack, isEditMode, editTaskTitle }); // Debug log
  const [content, setContent] = useState(initialContent);
  const [selectedContent, setSelectedContent] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [taskInfo, setTaskInfo] = useState({
    title: taskData.title || '',
    description: taskData.description || '',
    order: taskData.order || 1,
    required: taskData.required || false,
    ...taskData
  });

  // All hooks must be declared before any conditional returns
  const addContent = useCallback((contentType) => {
    const newContent = {
      id: `content_${Date.now()}`,
      type: contentType,
      title: `New ${CONTENT_TYPES.find(c => c.type === contentType)?.label || 'Content'}`,
      content: '',
      url: '',
      required: false,
      order: content.length,
    };
    setContent(prevContent => [...prevContent, newContent]);
    setSelectedContent(newContent);
  }, [content.length]);

  const updateContent = useCallback((contentId, updates) => {
    setContent(prevContent => 
      prevContent.map(item => 
        item.id === contentId ? { ...item, ...updates } : item
      )
    );
    
    setSelectedContent(prevSelected => 
      prevSelected?.id === contentId ? { ...prevSelected, ...updates } : prevSelected
    );
  }, []);

  const removeContent = useCallback((contentId) => {
    setContent(prevContent => prevContent.filter(item => item.id !== contentId));
    setSelectedContent(prevSelected => 
      prevSelected?.id === contentId ? null : prevSelected
    );
  }, []);

  const handleSave = useCallback(async () => {
    // Validate required fields
    if (!taskInfo.title || !taskInfo.description) {
      toast.error('Please fill in both title and description');
      return;
    }

    setIsSaving(true);
    try {
      const taskWithContent = {
        title: taskInfo.title || '',
        description: taskInfo.description || '',
        order: taskInfo.order || 1,
        deadlineOffset: taskInfo.deadlineOffset || 1,
        content: content || []
      };
      
      console.log('Sending task data:', taskWithContent); // Debug log
      await onSave(taskWithContent);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setIsSaving(false);
    }
  }, [taskInfo, content, onSave]);

  const handleTaskInfoChange = useCallback((field, value) => {
    setTaskInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  // Stable event handlers for ContentEditor
  const handleTitleChange = useCallback((e) => {
    const value = e.target.value;
    if (selectedContent) {
      updateContent(selectedContent.id, { title: value });
    }
  }, [selectedContent, updateContent]);

  const handleContentChange = useCallback((e) => {
    const value = e.target.value;
    if (selectedContent) {
      updateContent(selectedContent.id, { content: value });
    }
  }, [selectedContent, updateContent]);

  const handleUrlChange = useCallback((e) => {
    const value = e.target.value;
    if (selectedContent) {
      updateContent(selectedContent.id, { url: value });
    }
  }, [selectedContent, updateContent]);

  const handleRequiredChange = useCallback((checked) => {
    if (selectedContent) {
      updateContent(selectedContent.id, { required: checked });
    }
  }, [selectedContent, updateContent]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Early return after all hooks
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <ContentLoading title="Initializing Task Builder" subtitle="Setting up your workspace..." icon={Settings} />
      </div>
    );
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(content);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setContent(items.map((item, index) => ({ ...item, order: index })));
  };

  const ContentBlock = React.memo(({ item, index }) => {
    const ContentIcon = CONTENT_TYPES.find(t => t.type === item.type)?.icon || FileText;
    
    const handleEdit = () => {
      setSelectedContent(item);
    };

    const handleRemove = () => {
      removeContent(item.id);
    };

    const renderContentPreview = () => {
      switch (item.type) {
        case 'TEXT':
          return (
            <div className="text-sm text-slate-700 dark:text-slate-300">
              {item.content || 'No content yet...'}
            </div>
          );
        case 'TEXTAREA':
          return (
            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {item.content || 'No content yet...'}
            </div>
          );
        case 'VIDEO':
          return (
            <div className="text-sm text-slate-700 dark:text-slate-300">
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {item.url}
                </a>
              ) : (
                'No video URL set...'
              )}
            </div>
          );
        case 'URL':
          return (
            <div className="text-sm text-slate-700 dark:text-slate-300">
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {item.title || item.url}
                </a>
              ) : (
                'No URL set...'
              )}
            </div>
          );
        case 'FILE':
          return (
            <div className="text-sm text-slate-700 dark:text-slate-300">
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  📎 {item.title || 'Attached file'}
                </a>
              ) : (
                'No file attached...'
              )}
            </div>
          );
        case 'IMAGE':
          return (
            <div className="text-sm text-slate-700 dark:text-slate-300">
              {item.url ? (
                <div className="relative">
                  <NextImage 
                    src={item.url} 
                    alt={item.title} 
                    width={200}
                    height={128}
                    className="max-w-full h-auto max-h-32 rounded object-cover"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
              ) : (
                'No image set...'
              )}
            </div>
          );
        case 'CODE':
          return (
            <pre className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 p-2 rounded font-mono">
              {item.content || '// No code yet...'}
            </pre>
          );
        default:
          return null;
      }
    };
    
    return (
      <Draggable draggableId={item.id} index={index} isDragDisabled={isPreviewMode}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`bg-white dark:bg-slate-800 border rounded-lg p-4 ${
              snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
            } ${
              selectedContent?.id === item.id && !isPreviewMode
                ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
                : 'border-slate-200 dark:border-slate-600'
            }`}
            onClick={() => !isPreviewMode && setSelectedContent(item)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {!isPreviewMode && (
                  <div
                    {...provided.dragHandleProps}
                    className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>
                )}
                <ContentIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <label className="font-medium text-slate-900 dark:text-white">
                  {item.title}
                  {item.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </div>
              {!isPreviewMode && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedContent(item);
                    }}
                    className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeContent(item.id);
                    }}
                    className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {renderContentPreview()}
          </div>
        )}
      </Draggable>
    );
  });

  // Add display name for the ContentBlock component
  ContentBlock.displayName = 'ContentBlock';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header - Always show as overlay */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onBack ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isPreviewMode ? 'Task Preview' : (isEditMode ? `Edit Task: ${editTaskTitle}` : 'Task Builder')}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isPreviewMode ? 'Preview how your task will look to users' : 'Build interactive learning content with multimedia elements'}
              </p>
              {learningPathTitle && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Learning Path: {learningPathTitle}
                </p>
              )}
            </div>
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
            {onSave && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg transition-all duration-200"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Task
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex pt-20">
        {/* Sidebar - Content Types */}
        <div className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6 h-[calc(100vh-80px)] overflow-y-auto">
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">Content Elements</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Add multimedia content to your task
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {CONTENT_TYPES.map((contentType) => {
              const Icon = contentType.icon;
              return (
                <button
                  key={contentType.type}
                  onClick={() => addContent(contentType.type)}
                  disabled={isPreviewMode}
                  className="flex items-start space-x-3 p-4 text-left border-2 border-slate-200 dark:border-slate-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-slate-900 dark:text-white group"
                >
                  <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50 transition-colors flex-shrink-0">
                    <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{contentType.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {contentType.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Task Information Section */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="font-medium text-slate-900 dark:text-white mb-3">Task Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={taskInfo.title}
                  onChange={(e) => handleTaskInfoChange('title', e.target.value)}
                  placeholder="Task title..."
                  className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={taskInfo.description}
                  onChange={(e) => handleTaskInfoChange('description', e.target.value)}
                  placeholder="Task description..."
                  rows={2}
                  className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={taskInfo.order}
                    onChange={(e) => handleTaskInfoChange('order', parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Deadline (days)
                  </label>
                  <input
                    type="number"
                    value={taskInfo.deadlineOffset}
                    onChange={(e) => handleTaskInfoChange('deadlineOffset', parseInt(e.target.value) || 1)}
                    min="1"
                    placeholder="7"
                    className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {!isPreviewMode && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2 inline" />
                    {isEditMode ? 'Update Task' : 'Save Task'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Main Content - Task Builder */}
        <div className="flex-1 flex">
          {/* Task Canvas */}
          <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-900 h-[calc(100vh-80px)] overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {content.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-12">
                    <Plus className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500 mb-6" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Start building your task
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                      Add content elements from the sidebar to create engaging learning experiences. Mix text, videos, images, and interactive elements.
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                        <Video className="w-4 h-4 mr-2" />
                        Add videos
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                        <GripVertical className="w-4 h-4 mr-2" />
                        Drag to reorder
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                        <Image className="w-4 h-4 mr-2" />
                        Add images
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure content
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="task-content" isDropDisabled={isPreviewMode}>
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
                        {content
                          .sort((a, b) => a.order - b.order)
                          .map((item, index) => (
                            <ContentBlock key={item.id} item={item} index={index} />
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          </div>

          {/* Right Sidebar - Content Properties */}
          {selectedContent && !isPreviewMode && (
            <div className="w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-6 h-[calc(100vh-80px)] overflow-y-auto">
              <ContentEditor 
                selectedContent={selectedContent}
                onTitleChange={handleTitleChange}
                onContentChange={handleContentChange}
                onUrlChange={handleUrlChange}
                onRequiredChange={handleRequiredChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

TaskBuilder.displayName = 'TaskBuilder';

export default TaskBuilder;
