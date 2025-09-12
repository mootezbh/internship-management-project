import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/admin/learning-paths/[id]/tasks - Add task to learning path
export async function POST(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

  if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    console.log('Received request body:', JSON.stringify(body, null, 2))
    
    const { title, description, content, contentType, deadlineOffset, order, responseRequirements } = body

    // Validate required fields
    if (!title || !description) {
      console.log('Validation failed - missing title or description:', { title, description })
      return NextResponse.json({ 
        error: 'Title and description are required',
        received: { title: !!title, description: !!description }
      }, { status: 400 })
    }

    // Validate learning path ID
    if (!params.id) {
      console.log('Missing learning path ID')
      return NextResponse.json({ error: 'Learning path ID is required' }, { status: 400 })
    }

    // Check if learning path exists
    const learningPath = await prisma.learningPath.findUnique({
      where: { id: params.id }
    })

    if (!learningPath) {
      console.log('Learning path not found:', params.id)
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 })
    }

    // Process content - handle both string and object/array content
    let processedContent = '';
    if (content) {
      if (typeof content === 'string') {
        processedContent = content;
      } else {
        // If content is an object or array (from task builder), stringify it
        processedContent = JSON.stringify(content);
      }
    }

    const taskData = {
      title: String(title).trim(),
      description: String(description).trim(),
      content: processedContent,
      responseRequirements: responseRequirements || [],
      deadlineOffset: parseInt(deadlineOffset) || 1,
      order: parseInt(order) || 1,
      learningPathId: params.id
    }
    
    console.log('Creating task with processed data:', JSON.stringify(taskData, null, 2))

    const task = await prisma.task.create({
      data: taskData
    })

    console.log('Task created successfully:', task.id)
    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Error creating task - Full error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error name:', error.name)
    console.error('Error code:', error.code)
    
    // Check for specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A task with this information already exists' },
        { status: 409 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid learning path reference' },
        { status: 400 }
      )
    }

    // Check for enum validation errors
    if (error.code === 'P2006' || error.message?.includes('Invalid enum value')) {
      return NextResponse.json(
        { error: 'Invalid content type provided' },
        { status: 400 }
      )
    }

    // Check for required field errors
    if (error.code === 'P2012' || error.message?.includes('Missing required')) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to create task', 
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        code: error.code || 'UNKNOWN',
        prismaCode: error.code,
        errorName: error.name
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
