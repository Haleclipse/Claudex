import esbuild from "esbuild";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};


/**
 * 在构建完成后，将 SDK 的 CLI 文件复制到 dist/
 * 这样运行时可通过显式 path 调用，避免 import.meta.url 在打包后失效。
 * @type {import('esbuild').Plugin}
 */
const copyClaudeCliPlugin = {
    name: 'copy-claude-cli',
    setup(build) {
        const require = createRequire(import.meta.url);
        build.onEnd(async () => {
            try {
                const pkgDir = path.dirname(require.resolve('@anthropic-ai/claude-code/cli.js'));
                const outDir = path.resolve(process.cwd(), 'dist');
                await fs.mkdir(outDir, { recursive: true });

                // copy cli.js
                const cliSrc = path.join(pkgDir, 'cli.js');
                const cliDst = path.join(outDir, 'claude-cli.js');
                await fs.copyFile(cliSrc, cliDst);
                console.log(`[build] Copied Claude CLI -> ${path.relative(process.cwd(), cliDst)}`);

                // copy yoga.wasm (required by CLI at runtime)
                const wasmSrc = path.join(pkgDir, 'yoga.wasm');
                try {
                    await fs.copyFile(wasmSrc, path.join(outDir, 'yoga.wasm'));
                    console.log(`[build] Copied yoga.wasm`);
                } catch (e) {
                    console.warn('[build] yoga.wasm not found, SDK may fail at runtime');
                }

                // copy vendor directory if exists (CLI may read assets/configs)
                const vendorSrc = path.join(pkgDir, 'vendor');
                try {
                    const st = await fs.stat(vendorSrc);
                    if (st.isDirectory()) {
                        const vendorDst = path.join(outDir, 'vendor');
                        await copyDir(vendorSrc, vendorDst);
                        console.log('[build] Copied vendor/ directory');
                    }
                } catch {}
            } catch (err) {
                console.warn('[build] copy-claude-cli failed:', err?.message || err);
            }
        });
    },
};

async function copyDir(src, dst) {
    await fs.mkdir(dst, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const ent of entries) {
        const s = path.join(src, ent.name);
        const d = path.join(dst, ent.name);
        if (ent.isDirectory()) {
            await copyDir(s, d);
        } else if (ent.isFile()) {
            await fs.copyFile(s, d);
        }
    }
}

async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
	    outfile: 'dist/extension.cjs',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			/* add to the end of plugins array */
			esbuildProblemMatcherPlugin,
			copyClaudeCliPlugin,
		],
	});
	if (watch) {
		await ctx.watch();
	} else {
		await ctx.rebuild();
		await ctx.dispose();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
