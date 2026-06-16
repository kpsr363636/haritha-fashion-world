.PHONY: dev-up verify backend frontend

dev-up:
	./scripts/dev-up.sh

verify:
	./scripts/verify-backend.sh

backend:
	./scripts/run-backend.sh

frontend:
	cd frontend && npm run dev

build:
	./scripts/verify-backend.sh
	cd frontend && npm run build
