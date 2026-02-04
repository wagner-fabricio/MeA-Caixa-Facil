import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { generateAlerts } from '@/lib/alerts/alert-engine'

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const businessId = searchParams.get('businessId')

        if (!businessId) {
            return NextResponse.json({ error: 'businessId é obrigatório' }, { status: 400 })
        }

        // Verify business ownership
        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                ownerId: user.id,
            },
        })

        if (!business) {
            return NextResponse.json({ error: 'Negócio não encontrado' }, { status: 404 })
        }

        // Get existing alerts
        const existingAlerts = await prisma.alert.findMany({
            where: {
                businessId,
                isRead: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json({ alerts: existingAlerts })
    } catch (error) {
        console.error('Alert fetch error:', error)
        return NextResponse.json(
            { error: 'Erro ao buscar alertas' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { businessId } = await req.json()

        // Verify business ownership
        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                ownerId: user.id,
            },
        })

        if (!business) {
            return NextResponse.json({ error: 'Negócio não encontrado' }, { status: 404 })
        }

        // Get last 30 days of transactions
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const transactions = await prisma.transaction.findMany({
            where: {
                businessId,
                date: {
                    gte: thirtyDaysAgo,
                },
            },
            orderBy: {
                date: 'desc',
            },
        })

        // Generate alerts
        const newAlerts = generateAlerts(transactions as any)

        // Save new alerts (avoid duplicates)
        const savedAlerts = []
        for (const alert of newAlerts) {
            // Check if similar alert exists in last 24 hours
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)

            const existing = await prisma.alert.findFirst({
                where: {
                    businessId,
                    type: alert.type,
                    createdAt: {
                        gte: yesterday,
                    },
                },
            })

            if (!existing) {
                const saved = await prisma.alert.create({
                    data: {
                        type: alert.type,
                        message: alert.message,
                        severity: alert.severity,
                        businessId,
                    },
                })
                savedAlerts.push(saved)
            }
        }

        return NextResponse.json({ alerts: savedAlerts })
    } catch (error) {
        console.error('Alert generation error:', error)
        return NextResponse.json(
            { error: 'Erro ao gerar alertas' },
            { status: 500 }
        )
    }
}

export async function PUT(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { alertId } = await req.json()

        const alert = await prisma.alert.findUnique({
            where: { id: alertId },
            include: { business: true },
        })

        if (!alert || alert.business.ownerId !== user.id) {
            return NextResponse.json({ error: 'Alerta não encontrado' }, { status: 404 })
        }

        const updated = await prisma.alert.update({
            where: { id: alertId },
            data: { isRead: true },
        })

        return NextResponse.json({ alert: updated })
    } catch (error) {
        console.error('Alert update error:', error)
        return NextResponse.json(
            { error: 'Erro ao atualizar alerta' },
            { status: 500 }
        )
    }
}
