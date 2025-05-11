/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4937ce',
                secondary: '#f0f2f5',
                light: '#ffffff',
                dark: '#213547',
                accent: '#1877f2',
                muted: '#65676b',
                separator: '#e4e6eb'
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: 'none',
                        code: {
                            backgroundColor: '#f0f0f0',
                            padding: '0.2em 0.4em',
                            borderRadius: '3px',
                            fontWeight: '400'
                        },
                        'code::before': {
                            content: 'none'
                        },
                        'code::after': {
                            content: 'none'
                        },
                        pre: {
                            backgroundColor: '#282c34',
                            color: '#abb2bf',
                            borderRadius: '0.375rem',
                            padding: '1rem'
                        }
                    }
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}