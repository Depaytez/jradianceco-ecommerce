import type { Config } from 'tailwindcss';

export const config: Config = {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
        './src/lib/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                radiance: {
                    goldColor: "#D4AF37", // Main brand color (Buttons, Icons, Branding accents)
                    cocoaColor: "#3D2B1F", // Luxury contrast color (Headlines, Borders, and Footers)
                    creamBackgroundColor: "#FFFDF5", // Warm Background color 
                    amberAccentColor: "#FFBF00", // Accent/Hover color for highlights and links
                    charcoalTextColor: "#1A1A1A", // Primary text color for readability
                },
            },
            backgroundImage: {
                'glow-gradient': 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, rgba(255,253,245,1) 100%)',
            },
        },
    },
    plugins: [],
};