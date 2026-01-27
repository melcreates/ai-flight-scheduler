import fs from "fs";
import path from "path";

// tailwind.config.js content
const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
`;

// postcss.config.js content
const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

// Write files
fs.writeFileSync(path.join(process.cwd(), "tailwind.config.js"), tailwindConfig);
fs.writeFileSync(path.join(process.cwd(), "postcss.config.js"), postcssConfig);

console.log("✅ Tailwind config files created!");
