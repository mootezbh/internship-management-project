import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT /api/admin/learning-paths/[id]/tasks/[taskId] - Update task
export async function PUT(request, { params }) {
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
    const { title, description, content, contentType, deadlineOffset, order, responseRequirements } = body

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.taskId }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData = {
      title,
      description,
    }

    // Add optional fields if provided
    if (content !== undefined) {
      updateData.content = content
    }
    
    if (deadlineOffset !== undefined) {
      updateData.deadlineOffset = parseInt(deadlineOffset) || 1
    }
    
    if (order !== undefined) {
      updateData.order = parseInt(order) || 1
    }

    if (responseRequirements !== undefined) {
      updateData.responseRequirements = responseRequirements || []
    }

    const task = await prisma.task.update({
      where: { id: params.taskId },
      data: updateData
    })

    return NextResponse.json({ task }, { status: 200 })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/learning-paths/[id]/tasks/[taskId] - Delete task
export async function DELETE(request, { params }) {
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

    // Check if there are any submissions for this task
    const submissionCount = await prisma.submission.count({
      where: { taskId: params.taskId }
    })

    if (submissionCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete task that has submissions' },
        { status: 400 }
      )
    }

    await prisma.task.delete({
      where: { id: params.taskId }
    })

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 })
  } catch (error) {return NextResponse.json(
      { error: 'Failed to delete task', details: error.message },
      { status: 500 }
    )
  }
}
