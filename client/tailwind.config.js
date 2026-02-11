/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bt: {
                    magenta: '#E6007E',
                    blue: '#0099FF',
                    dark: '#111827',
                    light: '#F3F4F6',
                }
            }
        },
    },
    plugins: [],
}
