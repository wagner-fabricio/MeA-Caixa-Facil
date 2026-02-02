import { withAuth } from 'next-auth/middleware'

export default withAuth({
    pages: {
        signIn: '/login',
    },
})

export const config = {
    matcher: ['/dashboard/:path*', '/api/transactions/:path*', '/api/businesses/:path*', '/api/categories/:path*', '/api/alerts/:path*'],
}
