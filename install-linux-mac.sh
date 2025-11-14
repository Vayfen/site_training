#!/bin/bash

echo "========================================"
echo "RunAI - Installation pour Linux/Mac"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}ERREUR: Python 3 n'est pas installé!${NC}"
    echo "Installez Python avec:"
    echo "  Ubuntu/Debian: sudo apt install python3 python3-pip python3-venv"
    echo "  Fedora: sudo dnf install python3 python3-pip"
    echo "  Mac: brew install python3"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERREUR: Node.js n'est pas installé!${NC}"
    echo "Installez Node.js avec:"
    echo "  Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs"
    echo "  Fedora: sudo dnf install nodejs"
    echo "  Mac: brew install node"
    exit 1
fi

# Check for Ollama
echo "[1/6] Vérification d'Ollama..."
if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}AVERTISSEMENT: Ollama n'est pas installé!${NC}"
    echo "Téléchargez Ollama sur https://ollama.ai/download"
    echo "Ou installez avec: curl -fsSL https://ollama.ai/install.sh | sh"
    echo "L'installation continuera, mais l'IA locale ne fonctionnera pas sans Ollama."
    read -p "Appuyez sur Entrée pour continuer..."
else
    echo -e "${GREEN}Ollama détecté!${NC}"
    echo "Téléchargement du modèle (peut prendre quelques minutes)..."
    ollama pull llama3.2:3b
fi

# Install backend
echo "[2/6] Installation du backend Python..."
cd backend || exit
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

# Install frontend
echo "[3/6] Installation du frontend..."
cd frontend || exit
npm install
cd ..

# Create .env file
echo "[4/6] Création du fichier de configuration..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}Fichier .env créé!${NC} Vous pouvez le modifier si nécessaire."
fi

# Initialize database
echo "[5/6] Initialisation de la base de données..."
cd backend || exit
source venv/bin/activate
python3 -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine); print('Base de données initialisée!')"
cd ..

# Create start script
echo "[6/6] Création du script de démarrage..."
cat > start-runai.sh << 'EOF'
#!/bin/bash

echo "Démarrage de RunAI..."

# Start backend
cd backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "RunAI est en cours d'exécution!"
echo "========================================"
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter..."

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x start-runai.sh

echo ""
echo "========================================"
echo "Installation terminée!"
echo "========================================"
echo ""
echo "Pour démarrer RunAI, exécutez:"
echo "  ./start-runai.sh"
echo ""
echo "Ou démarrez manuellement:"
echo "  Backend:  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "L'application sera accessible sur: http://localhost:5173"
echo ""
