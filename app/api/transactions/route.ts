import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
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
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await req.json()
        const { input, businessId, method } = createTransactionSchema.parse(body)

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
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
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
                ownerId: user.id,
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

export async function PATCH(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await req.json()
        const patchSchema = z.object({
            id: z.string(),
            amount: z.number().optional(),
            description: z.string().optional(),
            category: z.string().optional(),
            type: z.enum(['income', 'expense']).optional(),
        })

        const { id, amount, description, category, type } = patchSchema.parse(body)

        const existing = await prisma.transaction.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
        }

        // Verify ownership
        const business = await prisma.business.findFirst({ where: { id: existing.businessId, ownerId: user.id } })
        if (!business) {
            return NextResponse.json({ error: 'Negócio não encontrado' }, { status: 404 })
        }

        // If category changed, decrement old and increment new
        if (category && category !== existing.category) {
            // decrement old
            await prisma.category.updateMany({
                where: {
                    businessId: existing.businessId,
                    name: existing.category,
                    type: existing.type,
                },
                data: {
                    usageCount: { decrement: 1 },
                },
            })

            // increment or create new
            await prisma.category.upsert({
                where: {
                    businessId_name_type: {
                        businessId: existing.businessId,
                        name: category,
                        type: type ?? existing.type,
                    },
                },
                update: { usageCount: { increment: 1 } },
                create: {
                    name: category,
                    type: type ?? existing.type,
                    businessId: existing.businessId,
                    usageCount: 1,
                },
            })
        }

        const updated = await prisma.transaction.update({
            where: { id },
            data: {
                ...(amount !== undefined ? { amount } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(category !== undefined ? { category } : {}),
                ...(type !== undefined ? { type } : {}),
            },
        })

        return NextResponse.json({ transaction: updated })
    } catch (error) {
        console.error('Transaction update error:', error)
        return NextResponse.json({ error: 'Erro ao atualizar transação' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await req.json()
        const delSchema = z.object({ id: z.string() })
        const { id } = delSchema.parse(body)

        const existing = await prisma.transaction.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
        }

        // Verify ownership
        const business = await prisma.business.findFirst({ where: { id: existing.businessId, ownerId: user.id } })
        if (!business) {
            return NextResponse.json({ error: 'Negócio não encontrado' }, { status: 404 })
        }

        // Decrement category usage
        await prisma.category.updateMany({
            where: {
                businessId: existing.businessId,
                name: existing.category,
                type: existing.type,
            },
            data: {
                usageCount: { decrement: 1 },
            },
        })

        await prisma.transaction.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Transaction delete error:', error)
        return NextResponse.json({ error: 'Erro ao deletar transação' }, { status: 500 })
    }
}
