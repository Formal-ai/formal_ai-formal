# Makefile for Formal.AI

.PHONY: help dev build preview lint test clean

help:
	@echo "Usage:"
	@echo "  make dev      - Start development server"
	@echo "  make build    - Build production application"
	@echo "  make preview  - Preview production build locally"
	@echo "  make lint     - Run linter"
	@echo "  make test     - Run tests"
	@echo "  make clean    - Remove build artifacts"

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

lint:
	npm run lint

test:
	npm run test

clean:
	rm -rf dist
	rm -rf .vite
