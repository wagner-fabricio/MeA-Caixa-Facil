import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const businesses = await prisma.business.findMany({
            where: {
                ownerId: user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json({ businesses })
    } catch (error) {
        console.error('Business fetch error:', error)
        return NextResponse.json(
            { error: 'Erro ao buscar negócios' },
            { status: 500 }
        )
    }
}
