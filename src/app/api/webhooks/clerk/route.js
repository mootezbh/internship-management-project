import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { PrismaClient } from '@prisma/client'
import { createClerkClient } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

// Create Clerk client with explicit configuration
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Error occurred -- no svix headers')
    return new Response('Error occurred -- no svix headers', { status: 400 })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', { status: 400 })
  }

  // Get the ID and type
  const { id } = evt.data
  const eventType = evt.type

  console.log(`Webhook: ${eventType} for user ${id}`)

  switch (eventType) {
    case 'user.created':
      try {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data
        
        // Create user in our database
        await prisma.user.create({
          data: {
            clerkId: id,
            email: email_addresses[0].email_address,
            firstName: first_name || '',
            lastName: last_name || '',
            profileImage: image_url || '',
          },
        })
        
      } catch (error) {
        console.error('Error creating user in database:', error)
        // Don't return error as user might already exist
      }
      break

    case 'user.updated':
      try {
        const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data
        
        // Update user in our database
        const updateData = {
          email: email_addresses[0].email_address,
          firstName: first_name || '',
          lastName: last_name || '',
          profileImage: image_url || '',
        }

        // Add completed onboarding if it exists in metadata
        if (public_metadata?.onboardingCompleted) {
          updateData.hasCompletedOnboarding = public_metadata.onboardingCompleted === true
        }

        await prisma.user.upsert({
          where: { clerkId: id },
          update: updateData,
          create: {
            clerkId: id,
            ...updateData,
          },
        })
        
      } catch (error) {
        console.error('Webhook user.updated error:', error)
        // Don't return error as user might not exist in our DB yet
      }
      break

    case 'user.deleted':
      try {
        const { id } = evt.data
        
        // Delete user from our database
        await prisma.user.delete({
          where: { clerkId: id },
        })
        
      } catch (error) {
        console.error('Error deleting user from database:', error)
        // Don't return error as user might not exist in our DB
      }
      break

    default:
      console.log(`Unhandled event type: ${eventType}`)
  }

  return new Response('', { status: 200 })
}