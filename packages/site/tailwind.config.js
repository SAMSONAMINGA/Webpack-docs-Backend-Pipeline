/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ---- Medieval Dark Knight design tokens ----
        charcoal: {
          950: "#0a0a0c",
          900: "#121215",
          800: "#1b1b20",
          700: "#26262d",
        },
        iron: {
          900: "#2b2d33",
          800: "#3a3d45",
          700: "#4c4f59",
          600: "#63666f",
        },
        silver: {
          400: "#9ea3ab",
          300: "#b8bcc4",
          200: "#d3d6db",
          100: "#e9eaed",
        },
        ember: {
          900: "#3b1400",
          700: "#8a3200",
          600: "#c74a00",
          500: "#ff8800",
          400: "#ffab4d",
        },
        wisp: {
          700: "#123a4d",
          500: "#2f7ba8",
          400: "#5fb3e0",
          300: "#a8dbf5",
        },
        parchment: {
          100: "#e9e1cc",
          200: "#dcd0af",
          300: "#c9b98d",
        },
        auth: {
          login: "#00cc66",
          signup: "#ff8800",
          logout: "#ff3333",
        },
      },
      fontFamily: {
        blackletter: ["'UnifrakturMaguntia'", "serif"],
        medieval: ["'Cinzel'", "serif"],
        body: ["'EB Garamond'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        "ember-glow": "0 0 24px 4px rgba(255, 136, 0, 0.45)",
        "wisp-glow": "0 0 24px 4px rgba(95, 179, 224, 0.45)",
        "iron-inset": "inset 0 2px 6px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "stone-texture":
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.03) 0%, transparent 40%), radial-gradient(circle at 80% 60%, rgba(0,0,0,0.35) 0%, transparent 45%)",
      },
      keyframes: {
        emberFloat: {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "10%": { opacity: "1" },
          "100%": { transform: "translateY(-140px) translateX(12px)", opacity: "0" },
        },
        wispDrift: {
          "0%": { transform: "translateY(0) scale(0.8)", opacity: "0" },
          "20%": { opacity: "0.8" },
          "100%": { transform: "translateY(-90px) scale(1.3)", opacity: "0" },
        },
        fogDrift: {
          "0%": { transform: "translateX(-4%)" },
          "50%": { transform: "translateX(4%)" },
          "100%": { transform: "translateX(-4%)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,136,0,0.0)" },
          "50%": { boxShadow: "0 0 18px 4px rgba(255,136,0,0.55)" },
        },
      },
      animation: {
        ember: "emberFloat 4.5s ease-in infinite",
        wisp: "wispDrift 3.2s ease-out infinite",
        fog: "fogDrift 18s ease-in-out infinite",
        "glow-pulse": "glowPulse 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
