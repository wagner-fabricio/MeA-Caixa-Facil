import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const restoreSchema = z.object({
    type: z.enum(['income', 'expense']),
    amount: z.number(),
    description: z.string(),
    category: z.string(),
    method: z.string().optional(),
    businessId: z.string(),
    date: z.string().optional(),
})

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await req.json()
        const { type, amount, description, category, method, businessId, date } = restoreSchema.parse(body)

        // Verify ownership
        const business = await prisma.business.findFirst({ where: { id: businessId, ownerId: user.id } })
        if (!business) {
            return NextResponse.json({ error: 'Negócio não encontrado' }, { status: 404 })
        }

        const created = await prisma.transaction.create({
            data: {
                type,
                amount,
                description,
                category,
                method: method ?? 'manual',
                businessId,
                date: date ? new Date(date) : undefined,
            },
        })

        // Update category usage count
        await prisma.category.upsert({
            where: {
                businessId_name_type: {
                    businessId,
                    name: category,
                    type,
                },
            },
            update: {
                usageCount: { increment: 1 },
            },
            create: {
                name: category,
                type,
                businessId,
                usageCount: 1,
            },
        })

        return NextResponse.json({ transaction: created })
    } catch (error) {
        console.error('Transaction restore error:', error)
        return NextResponse.json({ error: 'Erro ao restaurar transação' }, { status: 500 })
    }
}
