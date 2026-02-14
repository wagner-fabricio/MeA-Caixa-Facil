import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get businessId from query params
        const { searchParams } = new URL(request.url)
        const businessId = searchParams.get('businessId')

        if (!businessId) {
            return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
        }

        // Verify user owns this business
        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                ownerId: user.id,
            },
        })

        if (!business) {
            return NextResponse.json({ error: 'Business not found or not authorized' }, { status: 403 })
        }

        // Get all categories for this business
        const categories = await prisma.category.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ categories })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name, type, color, businessId } = await request.json()

        if (!name || !businessId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Verify user owns this business
        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                ownerId: user.id,
            },
        })

        if (!business) {
            return NextResponse.json({ error: 'Business not found or not authorized' }, { status: 403 })
        }

        // Create category
        const category = await prisma.category.create({
            data: {
                name,
                type: type || 'expense',
                color: color || '#FF6B6B',
                businessId,
            },
        })

        return NextResponse.json({ category }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating category:', error)
        
        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 })
        }
        
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id, name, type, color } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
        }

        // Verify user owns this category's business
        const category = await prisma.category.findFirst({
            where: { id },
            include: { business: true },
        })

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        if (category.business.ownerId !== user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
        }

        // Update category
        const updatedCategory = await prisma.category.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(type && { type }),
                ...(color && { color }),
            },
        })

        return NextResponse.json({ category: updatedCategory })
    } catch (error: any) {
        console.error('Error updating category:', error)
        
        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 })
        }
        
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
        }

        // Verify user owns this category's business
        const category = await prisma.category.findFirst({
            where: { id },
            include: { business: true },
        })

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        if (category.business.ownerId !== user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
        }

        // Delete category
        await prisma.category.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting category:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
