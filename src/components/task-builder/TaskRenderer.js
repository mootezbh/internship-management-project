'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Video, 
  ExternalLink, 
  Download, 
  Code, 
  CheckCircle,
  Circle,
  Play,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TaskRenderer({ task, onComplete, isCompleted = false, userProgress = {} }) {
  const [completedBlocks, setCompletedBlocks] = useState(userProgress.completedBlocks || []);

  const handleBlockComplete = (blockId) => {
    if (!completedBlocks.includes(blockId)) {
      const newCompleted = [...completedBlocks, blockId];
      setCompletedBlocks(newCompleted);
      
      // Check if all required blocks are completed
      const requiredBlocks = task.content?.filter(block => block.required) || [];
      const allRequiredCompleted = requiredBlocks.every(block => 
        newCompleted.includes(block.id)
      );
      
      if (allRequiredCompleted && onComplete) {
        onComplete(task.id, { completedBlocks: newCompleted });
      }
    }
  };

  const ContentBlock = ({ content }) => {
    const isBlockCompleted = completedBlocks.includes(content.id);
    
    const renderContent = () => {
      switch (content.type) {
        case 'TEXT':
          return (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-slate-700 dark:text-slate-300">{content.content}</p>
            </div>
          );

        case 'TEXTAREA':
          return (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {content.content}
              </div>
            </div>
          );

        case 'VIDEO':
          return (
            <div className="space-y-3">
              {content.url && (
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  {(() => {
                    // Extract YouTube video ID from various URL formats
                    const getYouTubeVideoId = (url) => {
                      const patterns = [
                        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
                        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
                        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
                        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
                        /(?:youtube\.com\/.*[?&]v=)([a-zA-Z0-9_-]{11})/
                      ];
                      
                      for (const pattern of patterns) {
                        const match = url.match(pattern);
                        if (match && match[1]) return match[1];
                      }
                      return null;
                    };
                    
                    const youtubeVideoId = getYouTubeVideoId(content.url);
                    
                    if (youtubeVideoId) {
                      // Render YouTube embed
                      return (
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          title={content.title}
                        />
                      );
                    } else {
                      // Non-YouTube video or general video link
                      return (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Play className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <Button asChild variant="outline">
                              <a 
                                href={content.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2"
                              >
                                <Video className="h-4 w-4" />
                                <span>Watch Video</span>
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
              {content.content && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {content.content}
                </p>
              )}
            </div>
          );

        case 'FILE':
          return (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
              <Download className="h-8 w-8 text-slate-400 mx-auto mb-3" />
              <div className="space-y-3">
                {content.content && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {content.content}
                  </p>
                )}
                {content.url && (
                  <div className="space-y-2">
                    {(() => {
                      const fileExtension = content.url.split('.').pop()?.toLowerCase();
                      const fileName = content.url.split('/').pop() || 'Download File';
                      
                      if (fileExtension === 'pdf') {
                        return (
                          <div className="space-y-2">
                            <Button asChild variant="outline" className="w-full">
                              <a 
                                href={content.url} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center space-x-2"
                              >
                                <FileText className="h-4 w-4" />
                                <span>View PDF</span>
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button asChild variant="ghost" size="sm">
                              <a 
                                href={content.url} 
                                download
                                className="flex items-center justify-center space-x-2"
                              >
                                <Download className="h-4 w-4" />
                                <span>Download PDF</span>
                              </a>
                            </Button>
                          </div>
                        );
                      } else {
                        return (
                          <Button asChild variant="outline">
                            <a 
                              href={content.url} 
                              download
                              className="flex items-center space-x-2"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download {fileName}</span>
                            </a>
                          </Button>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            </div>
          );

        case 'URL':
          return (
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                    {content.title}
                  </h4>
                  {content.content && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {content.content}
                    </p>
                  )}
                </div>
                {content.url && (
                  <Button asChild variant="outline" size="sm">
                    <a 
                      href={content.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2"
                    >
                      <span>Visit</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          );

        case 'IMAGE':
          return (
            <div className="text-center">
              {content.url ? (
                <div className="relative max-w-full mx-auto">
                  <Image 
                    src={content.url} 
                    alt={content.title}
                    width={800}
                    height={600}
                    className="max-w-full h-auto rounded-lg shadow-sm mx-auto"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
              ) : (
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8">
                  <p className="text-slate-500 dark:text-slate-400">No image available</p>
                </div>
              )}
              {content.content && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                  {content.content}
                </p>
              )}
            </div>
          );

        case 'CODE':
          return (
            <div className="space-y-3">
              {content.content && (
                <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-slate-100">
                    <code>{content.content}</code>
                  </pre>
                </div>
              )}
            </div>
          );

        default:
          return (
            <div className="text-slate-500 dark:text-slate-400">
              Unsupported content type: {content.type}
            </div>
          );
      }
    };

    return (
      <Card className={`mb-4 transition-all duration-200 ${
        isBlockCompleted 
          ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
          : 'border-slate-200 dark:border-slate-700'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBlockComplete(content.id)}
                className={`p-1 ${
                  isBlockCompleted 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-slate-400'
                }`}
              >
                {isBlockCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </Button>
              <div>
                <CardTitle className="text-lg">{content.title}</CardTitle>
                {content.required && (
                  <Badge variant="secondary" className="mt-1">
                    Required
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    );
  };

  const requiredBlocks = task.content?.filter(block => block.required) || [];
  const completedRequiredBlocks = requiredBlocks.filter(block => 
    completedBlocks.includes(block.id)
  );
  const progress = requiredBlocks.length > 0 
    ? (completedRequiredBlocks.length / requiredBlocks.length) * 100 
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Task Header */}
      <Card className="mb-6 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-slate-900 dark:text-white">
                {task.title}
              </CardTitle>
              {task.description && (
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  {task.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                Progress
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {Math.round(progress)}%
              </div>
              {isCompleted && (
                <Badge variant="default" className="mt-2 bg-green-600">
                  Completed
                </Badge>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          {requiredBlocks.length > 0 && (
            <div className="mt-4">
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {completedRequiredBlocks.length} of {requiredBlocks.length} required items completed
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Task Content */}
      <div className="space-y-4">
        {task.content && task.content.length > 0 ? (
          task.content
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((content) => (
              <ContentBlock key={content.id} content={content} />
            ))
        ) : (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="py-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                No content available for this task.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
