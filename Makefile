



build:
	@npx @cloudflare/next-on-pages

dev:
	@npx wrangler pages dev .vercel/output/static

run:
	@make build && make dev

