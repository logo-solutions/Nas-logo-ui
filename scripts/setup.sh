#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== NAS-Logo-UI Setup ===${NC}\n"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}→ Creating .env from .env.example${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env created${NC}"
    echo -e "${YELLOW}  ⚠️  Edit .env with your actual values (JWT_SECRET, API_KEYS, etc)${NC}\n"
fi

# Check Node.js
echo -e "${BLUE}→ Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
echo -e "${BLUE}→ Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Check Docker/Colima
echo -e "${BLUE}→ Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found. Please install Colima or Docker Desktop${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

# Check docker-compose
echo -e "${BLUE}→ Checking docker-compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  docker-compose not found. Using 'docker compose'${NC}"
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi
echo -e "${GREEN}✓ Using: $COMPOSE_CMD${NC}"

# Install npm dependencies
echo -e "\n${BLUE}→ Installing npm dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Check if Colima is running
echo -e "\n${BLUE}→ Checking Colima status...${NC}"
if ! colima status > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Colima not running${NC}"
    read -p "Start Colima now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        colima start --memory 8 --cpu 4
        sleep 3
    fi
else
    echo -e "${GREEN}✓ Colima is running${NC}"
fi

# Build Docker images
echo -e "\n${BLUE}→ Building Docker images...${NC}"
$COMPOSE_CMD build
echo -e "${GREEN}✓ Docker images built${NC}"

# Final summary
echo -e "\n${GREEN}=== Setup Complete ===${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Edit .env with your actual secrets and API keys"
echo "  2. Run: ${GREEN}make startup${NC}"
echo ""
echo -e "${YELLOW}To start development:${NC}"
echo "  ${GREEN}make startup${NC}     # Starts all services"
echo "  ${GREEN}make logs${NC}        # View logs"
echo "  ${GREEN}make health${NC}      # Health check"
echo "  ${GREEN}make shutdown${NC}    # Stop services"
echo ""
