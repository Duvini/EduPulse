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
        },
    },
    plugins: [],
}