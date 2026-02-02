import { build } from "esbuild";
import { execSync } from "child_process";

async function main() {
    // Build client (Vite)
    console.log("Building client...");
    execSync("npx vite build --outDir dist/public", { stdio: "inherit" });

    // Build server (esbuild)
    console.log("Building server...");
    await build({
        entryPoints: ["server/index.ts"],
        bundle: true,
        platform: "node",
        format: "cjs",
        outfile: "dist/index.cjs",
        external: ["better-sqlite3", "@node-rs/argon2"],
    });

    console.log("✅ Build complete");
}

main().catch((err) => {
    console.error("Build failed:", err);
    process.exit(1);
});
