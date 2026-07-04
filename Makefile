.PHONY: install generate migrate deploy studio lint format docker docker-down

install:
	pnpm install

generate:
	pnpm exec prisma generate

migrate:
	pnpm exec prisma migrate dev

deploy:
	pnpm exec prisma migrate deploy

studio:
	pnpm exec prisma studio


docker:
	docker compose up --build

docker-down:
	docker compose down