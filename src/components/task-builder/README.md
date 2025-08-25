# Task Builder Documentation

## Overview
The Task Builder is a drag-and-drop interface that allows administrators to create rich, interactive tasks for learning paths. It supports various content types including text, videos, files, URLs, images, and code blocks.

## Features

### Content Types Available:
- **Text Content**: Simple text instructions or descriptions
- **Long Text**: Detailed instructions or requirements with multiline support
- **Video**: Embed video tutorials or explanations (supports YouTube and other video URLs)
- **File Attachment**: Attach files, documents, or resources for download
- **Website Link**: Link to external resources or references
- **Image**: Add images, diagrams, or screenshots
- **Code Block**: Add code examples or snippets with syntax highlighting

### Key Features:
- **Drag & Drop Interface**: Reorder content blocks easily
- **Live Preview**: See how the task will look to students
- **Required Blocks**: Mark content blocks as required for task completion
- **Rich Content**: Mix different content types in a single task
- **Progress Tracking**: Automatic progress tracking based on required blocks

## Usage

### Creating a New Task:
1. Navigate to Admin → Learning Paths → [Select Path] → Manage Tasks
2. Click "Create with Builder" button
3. Fill in task information (title, description, order)
4. Add content blocks from the palette on the left
5. Configure each content block using the editor on the right
6. Save the task

### Editing an Existing Task:
1. From the tasks list, click "Edit" on a builder task or "Upgrade" on a legacy task
2. Modify task information and content blocks as needed
3. Save changes

### Content Block Configuration:
Each content block can be configured with:
- **Title**: Display name for the content block
- **Content/URL**: The actual content or resource link
- **Required**: Whether students must complete this block to finish the task

## API Integration

### Task Data Structure:
```json
{
  "title": "Task Title",
  "description": "Task Description", 
  "content": "[{\"id\":\"content_1\",\"type\":\"TEXT\",\"title\":\"Introduction\",\"content\":\"Welcome...\"}]",
  "contentType": "BUILDER",
  "order": 1,
  "required": true
}
```

### Content Block Structure:
```json
{
  "id": "content_1234567890",
  "type": "TEXT|TEXTAREA|VIDEO|FILE|URL|IMAGE|CODE",
  "title": "Content Title",
  "content": "Text content for text/textarea/code types",
  "url": "URL for video/file/url/image types", 
  "required": false,
  "order": 0
}
```

## Student Experience

Students will see tasks rendered with:
- Progress tracking based on required blocks
- Interactive content (videos, links, downloads)
- Checkable completion for each block
- Rich formatting and syntax highlighting for code

## Technical Notes

### Dependencies:
- `@hello-pangea/dnd` for drag and drop functionality
- Custom Switch component for toggles
- Existing UI components (Button, Card, Input, etc.)

### File Structure:
```
src/components/task-builder/
├── TaskBuilder.js     # Admin interface for creating/editing tasks
└── TaskRenderer.js    # Student interface for viewing/completing tasks

src/app/admin/learning-paths/[id]/tasks/
├── create/page.js     # Create new task page
└── [taskId]/edit/page.js  # Edit existing task page
```

### API Endpoints:
- `POST /api/admin/learning-paths/[id]/tasks` - Create task
- `PUT /api/admin/learning-paths/[id]/tasks/[taskId]` - Update task  
- `DELETE /api/admin/learning-paths/[id]/tasks/[taskId]` - Delete task

## Migration from Legacy Tasks

Legacy tasks (TEXT/VIDEO content types) are automatically converted when opened in the builder:
- Text tasks → Single TEXT content block
- Video tasks → Single VIDEO content block with URL
- All content preserved during conversion
