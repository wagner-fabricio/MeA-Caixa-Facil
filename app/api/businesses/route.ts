import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const businesses = await prisma.business.findMany({
            where: {
                ownerId: session.user.id,
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
