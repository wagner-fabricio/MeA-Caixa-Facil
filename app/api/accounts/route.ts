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

        // Get all accounts for this business
        const accounts = await prisma.bankAccount.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ accounts })
    } catch (error) {
        console.error('Error fetching accounts:', error)
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

        const { name, type, balance, businessId } = await request.json()

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

        // Create account
        const account = await prisma.bankAccount.create({
            data: {
                name,
                type: type || 'bank',
                balance: balance || 0,
                businessId,
            },
        })

        return NextResponse.json({ account }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating account:', error)
        
        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Account with this name already exists' }, { status: 409 })
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

        const { id, name, type, balance } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
        }

        // Verify user owns this account's business
        const account = await prisma.bankAccount.findFirst({
            where: { id },
            include: { business: true },
        })

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 })
        }

        if (account.business.ownerId !== user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
        }

        // Update account
        const updatedAccount = await prisma.bankAccount.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(type && { type }),
                ...(balance !== undefined && { balance }),
            },
        })

        return NextResponse.json({ account: updatedAccount })
    } catch (error: any) {
        console.error('Error updating account:', error)
        
        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Account with this name already exists' }, { status: 409 })
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
            return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
        }

        // Verify user owns this account's business
        const account = await prisma.bankAccount.findFirst({
            where: { id },
            include: { business: true },
        })

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 })
        }

        if (account.business.ownerId !== user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
        }

        // Delete account
        await prisma.bankAccount.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting account:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
