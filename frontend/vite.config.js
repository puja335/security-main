import react from "@vitejs/plugin-react"
import fs from "fs"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync("./server.key"), // Path to your key file
      cert: fs.readFileSync("./server.crt"), // Path to your certificate file
    },
    port: 3000, // Optional: Specify the port for HTTPS
  },
})
