import { defineConfig } from "vite";

// The widget imports "chemlab-style" as a bare specifier that TypeScript
// resolves via tsconfig `baseUrl` to the local chemlab-style.ts. Vite doesn't
// read baseUrl for bare imports, so alias it here for the dev server.
export default defineConfig({
	resolve: {
		alias: {
			"chemlab-style": "/chemlab-style.ts",
		},
	},
	// The widget is written with Lit decorators (@customElement, @property, ...).
	// esbuild's default "esnext" target leaves them untransformed (the browser
	// chokes on "@"), and its TC39 standard-decorator lowering is incompatible
	// with Lit here (_$changeProperty errors). esbuild's legacy-decorator
	// transform is solid, and Lit 3 supports legacy decorators when class fields
	// are assigned (useDefineForClassFields: false) — so run the dev transform in
	// that mode.
	esbuild: {
		target: "es2022",
		tsconfigRaw: {
			compilerOptions: {
				experimentalDecorators: true,
				useDefineForClassFields: false,
			},
		},
	},
	optimizeDeps: {
		esbuildOptions: { target: "es2022" },
	},
});
