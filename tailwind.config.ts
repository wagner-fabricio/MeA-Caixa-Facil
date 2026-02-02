import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    cyan: '#00D4FF',
                    navy: '#1E3A5F',
                    coral: '#FF6B6B',
                },
                semantic: {
                    income: '#10B981',
                    expense: '#EF4444',
                    neutral: '#6B7280',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            spacing: {
                'touch': '44px', // Minimum touch target size
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
        },
    },
    plugins: [],
} satisfies Config;
