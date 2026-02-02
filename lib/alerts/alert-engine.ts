/**
 * Alert Engine - Intelligent Alert Generation
 * Analyzes transaction patterns and generates actionable alerts
 */

interface Transaction {
    id: string
    type: 'income' | 'expense'
    amount: number
    date: string
    businessId: string
}

interface Alert {
    type: 'no_activity' | 'spending_spike' | 'negative_streak' | 'monthly_comparison'
    message: string
    severity: 'info' | 'warning' | 'critical'
}

/**
 * Check if there are no transactions today
 */
function checkNoActivity(transactions: Transaction[]): Alert | null {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayTransactions = transactions.filter(t => {
        const tDate = new Date(t.date)
        tDate.setHours(0, 0, 0, 0)
        return tDate.getTime() === today.getTime()
    })

    if (todayTransactions.length === 0) {
        const hour = new Date().getHours()
        if (hour >= 12) { // Only alert after noon
            return {
                type: 'no_activity',
                message: 'Hoje ainda não houve nenhuma entrada registrada',
                severity: 'info',
            }
        }
    }

    return null
}

/**
 * Check if spending increased significantly
 */
function checkSpendingSpike(transactions: Transaction[]): Alert | null {
    const now = new Date()

    // This week
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - 7)
    const thisWeekExpenses = transactions
        .filter(t => t.type === 'expense' && new Date(t.date) >= weekStart)
        .reduce((sum, t) => sum + t.amount, 0)

    // Last week
    const lastWeekStart = new Date(weekStart)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)
    const lastWeekExpenses = transactions
        .filter(t => {
            const tDate = new Date(t.date)
            return t.type === 'expense' && tDate >= lastWeekStart && tDate < weekStart
        })
        .reduce((sum, t) => sum + t.amount, 0)

    if (lastWeekExpenses > 0) {
        const increase = ((thisWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100

        if (increase > 30) {
            return {
                type: 'spending_spike',
                message: `Você gastou ${increase.toFixed(0)}% mais esta semana do que na anterior`,
                severity: increase > 50 ? 'warning' : 'info',
            }
        }
    }

    return null
}

/**
 * Check for consecutive days with negative balance
 */
function checkNegativeStreak(transactions: Transaction[]): Alert | null {
    const last7Days: { date: Date; balance: number }[] = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        const dayTransactions = transactions.filter(t => {
            const tDate = new Date(t.date)
            tDate.setHours(0, 0, 0, 0)
            return tDate.getTime() === date.getTime()
        })

        const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
        const expense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

        last7Days.push({ date, balance: income - expense })
    }

    // Count consecutive negative days
    let streak = 0
    for (let i = last7Days.length - 1; i >= 0; i--) {
        if (last7Days[i].balance < 0) {
            streak++
        } else {
            break
        }
    }

    if (streak >= 3) {
        return {
            type: 'negative_streak',
            message: `${streak} dias seguidos com saldo negativo`,
            severity: 'warning',
        }
    }

    return null
}

/**
 * Compare current month with previous month
 */
function checkMonthlyComparison(transactions: Transaction[]): Alert | null {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Only run this check after the 5th day of the month
    if (now.getDate() < 5) return null

    // This month
    const thisMonthIncome = transactions
        .filter(t => {
            const tDate = new Date(t.date)
            return t.type === 'income' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear
        })
        .reduce((sum, t) => sum + t.amount, 0)

    // Last month
    const lastMonth = new Date(now)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const lastMonthIncome = transactions
        .filter(t => {
            const tDate = new Date(t.date)
            return t.type === 'income' && tDate.getMonth() === lastMonth.getMonth() && tDate.getFullYear() === lastMonth.getFullYear()
        })
        .reduce((sum, t) => sum + t.amount, 0)

    if (lastMonthIncome > 0 && thisMonthIncome < lastMonthIncome * 0.7) {
        const decrease = ((lastMonthIncome - thisMonthIncome) / lastMonthIncome) * 100
        return {
            type: 'monthly_comparison',
            message: `Este mês você faturou ${decrease.toFixed(0)}% menos que o anterior`,
            severity: 'warning',
        }
    }

    return null
}

/**
 * Generate all alerts for a business
 */
export function generateAlerts(transactions: Transaction[]): Alert[] {
    const alerts: Alert[] = []

    const noActivity = checkNoActivity(transactions)
    if (noActivity) alerts.push(noActivity)

    const spendingSpike = checkSpendingSpike(transactions)
    if (spendingSpike) alerts.push(spendingSpike)

    const negativeStreak = checkNegativeStreak(transactions)
    if (negativeStreak) alerts.push(negativeStreak)

    const monthlyComparison = checkMonthlyComparison(transactions)
    if (monthlyComparison) alerts.push(monthlyComparison)

    return alerts
}
