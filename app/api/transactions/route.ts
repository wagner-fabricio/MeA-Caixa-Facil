import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseTransaction, validateTransaction } from '@/lib/nlp/transaction-parser'
import { z } from 'zod'

const createTransactionSchema = z.object({
    input: z.string().min(1),
    businessId: z.string(),
    method: z.enum(['manual', 'voice']).default('manual'),
})

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await req.json()
        const { input, businessId, method } = createTransactionSchema.parse(body)

        // Verify business ownership
        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                ownerId: session.user.id,
            },
        })

        if (!business) {
            return NextResponse.json({ error: 'Negócio não encontrado' }, { status: 404 })
        }

        // Parse the input
        const parsed = parseTransaction(input)
        if (!validateTransaction(parsed)) {
            return NextResponse.json(
                { error: 'Não foi possível interpretar a transação. Tente incluir o valor.' },
                { status: 400 }
            )
        }

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                type: parsed!.type,
                amount: parsed!.amount,
                description: parsed!.description,
                category: parsed!.category,
                method,
                businessId,
            },
        })

        // Update category usage count
        await prisma.category.upsert({
            where: {
                businessId_name_type: {
                    businessId,
                    name: parsed!.category,
                    type: parsed!.type,
                },
            },
            update: {
                usageCount: { increment: 1 },
            },
            create: {
                name: parsed!.category,
                type: parsed!.type,
                businessId,
                usageCount: 1,
            },
        })

        return NextResponse.json({ transaction, parsed })
    } catch (error) {
        console.error('Transaction creation error:', error)
        return NextResponse.json(
            { error: 'Erro ao criar transação' },
            { status: 500 }
        )
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const businessId = searchParams.get('businessId')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        if (!businessId) {
            return NextResponse.json({ error: 'businessId é obrigatório' }, { status: 400 })
        }

        // Verify business ownership
        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                ownerId: session.user.id,
            },
        })

        if (!business) {
            return NextResponse.json({ error: 'Negócio não encontrado' }, { status: 404 })
        }

        const transactions = await prisma.transaction.findMany({
            where: {
                businessId,
                ...(startDate && endDate
                    ? {
                        date: {
                            gte: new Date(startDate),
                            lte: new Date(endDate),
                        },
                    }
                    : {}),
            },
            orderBy: {
                date: 'desc',
            },
        })

        return NextResponse.json({ transactions })
    } catch (error) {
        console.error('Transaction fetch error:', error)
        return NextResponse.json(
            { error: 'Erro ao buscar transações' },
            { status: 500 }
        )
    }
}
