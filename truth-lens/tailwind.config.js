/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": "#1754cf",
                "primary-hover": "#1342a6",
                "accent-green": "#00ff94",
                "verified": "#00ff9d",
                "background-light": "#f6f6f8",
                "background-dark": "#0b1221", // Default to Gallery theme
                "surface-dark": "#162032", // Default to Gallery theme
                "camera-bg": "#0a0f1c", // Specific for Camera page
                "camera-surface": "#111722", // Specific for Camera page
                "border-dark": "#243047",
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"],
                "mono": ["JetBrains Mono", "monospace"],
            },
            borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px" },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.00) 100%)',
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
