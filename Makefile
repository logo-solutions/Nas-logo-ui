.PHONY: startup shutdown status logs dev build help health

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
BLUE := \033[0;34m
NC := \033[0m

DOCKER_COMPOSE := docker-compose
COLIMA_NAME := colima

help:
	@echo "$(BLUE)=== NAS-Logo-UI Startup Commands ===$(NC)"
	@echo ""
	@echo "$(GREEN)make startup$(NC)       Start Colima + all services (Caddy, Gateway, UI, npm dev)"
	@echo "$(GREEN)make dev$(NC)           Start npm dev server only (containers must be running)"
	@echo "$(GREEN)make build$(NC)         Build production containers"
	@echo "$(GREEN)make status$(NC)        Show status of all services"
	@echo "$(GREEN)make logs$(NC)          Stream logs from all services"
	@echo "$(GREEN)make health$(NC)        Health check all services"
	@echo "$(GREEN)make shutdown$(NC)      Stop all services and Colima"
	@echo ""

startup: check-colima docker-up npm-dev health
	@echo "$(GREEN)✅ NAS-Logo-UI stack is running!$(NC)"
	@echo ""
	@echo "$(YELLOW)Access points:$(NC)"
	@echo "  • Frontend (dev):    http://localhost:5173"
	@echo "  • Frontend (HTTPS):  https://nas.logo-solutions.fr (add to /etc/hosts: 127.0.0.1)"
	@echo "  • Gateway API:       http://localhost:8000"
	@echo "  • Caddy admin:       http://localhost:2019"
	@echo ""
	@echo "$(YELLOW)Services:$(NC)"
	@echo "  • Caddy:             $(shell docker ps --filter "name=nas-logo-caddy" --format "{{.Status}}" 2>/dev/null || echo "STOPPED")"
	@echo "  • Gateway:           $(shell docker ps --filter "name=nas-logo-gateway" --format "{{.Status}}" 2>/dev/null || echo "STOPPED")"
	@echo "  • UI (container):    $(shell docker ps --filter "name=nas-logo-ui" --format "{{.Status}}" 2>/dev/null || echo "STOPPED")"
	@echo ""

check-colima:
	@echo "$(BLUE)→ Checking Colima...$(NC)"
	@if ! colima status > /dev/null 2>&1; then \
		echo "$(YELLOW)Starting Colima...$(NC)"; \
		colima start --memory 8 --cpu 4 2>/dev/null || colima start; \
		sleep 3; \
	fi
	@echo "$(GREEN)✓ Colima is running$(NC)"

docker-up: check-colima
	@echo "$(BLUE)→ Starting Docker containers...$(NC)"
	@$(DOCKER_COMPOSE) up -d --build
	@echo "$(BLUE)→ Waiting for services to be ready...$(NC)"
	@sleep 5
	@echo "$(GREEN)✓ Docker containers started$(NC)"

npm-dev:
	@echo "$(BLUE)→ Starting npm dev server (npm run dev)...$(NC)"
	@echo "$(YELLOW)  Vite will be available at http://localhost:5173$(NC)"
	@npm run dev &

dev:
	@echo "$(BLUE)→ Starting npm dev server...$(NC)"
	@npm run dev

build:
	@echo "$(BLUE)→ Building production containers...$(NC)"
	@$(DOCKER_COMPOSE) build
	@echo "$(GREEN)✓ Build complete$(NC)"

status:
	@echo "$(BLUE)=== Service Status ===$(NC)"
	@echo ""
	@docker ps --filter "name=nas-logo" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "$(BLUE)Colima:$(NC)"
	@colima status 2>/dev/null || echo "$(RED)Colima not running$(NC)"

logs:
	@$(DOCKER_COMPOSE) logs -f

health:
	@echo "$(BLUE)→ Health checking services...$(NC)"
	@echo ""

	@echo "$(YELLOW)Caddy (port 80/443):$(NC)"
	@curl -s -I http://localhost:80/ | head -1 && echo "$(GREEN)✓ OK$(NC)" || echo "$(RED)✗ FAILED$(NC)"

	@echo "$(YELLOW)Gateway (port 8000):$(NC)"
	@curl -s http://localhost:8000/health | jq . 2>/dev/null && echo "$(GREEN)✓ OK$(NC)" || echo "$(RED)✗ FAILED$(NC)"

	@echo "$(YELLOW)UI (port 8088):$(NC)"
	@curl -s -I http://localhost:8088/ | head -1 && echo "$(GREEN)✓ OK$(NC)" || echo "$(RED)✗ FAILED$(NC)"

	@echo "$(YELLOW)npm dev server (port 5173):$(NC)"
	@curl -s -I http://localhost:5173/ | head -1 && echo "$(GREEN)✓ OK$(NC)" || echo "$(RED)✗ FAILED$(NC)"

	@echo ""

shutdown:
	@echo "$(YELLOW)→ Stopping services...$(NC)"
	@$(DOCKER_COMPOSE) down
	@pkill -f "npm run dev" 2>/dev/null || true
	@echo "$(GREEN)✓ Services stopped$(NC)"
	@echo ""
	@echo "$(YELLOW)Colima will keep running. Stop it with: colima stop$(NC)"

clean: shutdown
	@echo "$(YELLOW)→ Cleaning volumes...$(NC)"
	@$(DOCKER_COMPOSE) down -v
	@rm -rf dist/ node_modules/
	@echo "$(GREEN)✓ Clean complete$(NC)"

restart: shutdown docker-up npm-dev
	@echo "$(GREEN)✓ Restart complete$(NC)"
