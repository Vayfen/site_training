@echo off
echo ========================================
echo RunAI - Installation pour Windows
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Python n'est pas installe!
    echo Telechargez Python sur https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Node.js n'est pas installe!
    echo Telechargez Node.js sur https://nodejs.org/
    pause
    exit /b 1
)

echo [1/6] Verification d'Ollama...
ollama --version >nul 2>&1
if errorlevel 1 (
    echo AVERTISSEMENT: Ollama n'est pas installe!
    echo Telechargez Ollama sur https://ollama.ai/download
    echo L'installation continuera, mais l'IA locale ne fonctionnera pas sans Ollama.
    pause
) else (
    echo Ollama detecte! Telechargement du modele...
    ollama pull llama3.2:3b
)

echo [2/6] Installation du backend Python...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
cd ..

echo [3/6] Installation du frontend...
cd frontend
call npm install
cd ..

echo [4/6] Creation du fichier de configuration...
if not exist .env (
    copy .env.example .env
    echo Fichier .env cree! Vous pouvez le modifier si necessaire.
)

echo [5/6] Initialisation de la base de donnees...
cd backend
call venv\Scripts\activate
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine); print('Base de donnees initialisee!')"
cd ..

echo [6/6] Creation des raccourcis...
echo @echo off > start-runai.bat
echo echo Demarrage de RunAI... >> start-runai.bat
echo start "RunAI Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8000" >> start-runai.bat
echo timeout /t 3 /nobreak ^> nul >> start-runai.bat
echo start "RunAI Frontend" cmd /k "cd frontend && npm run dev" >> start-runai.bat
echo timeout /t 3 /nobreak ^> nul >> start-runai.bat
echo start http://localhost:5173 >> start-runai.bat

echo.
echo ========================================
echo Installation terminee!
echo ========================================
echo.
echo Pour demarrer RunAI, double-cliquez sur: start-runai.bat
echo Ou executez manuellement:
echo   Backend:  cd backend ^&^& venv\Scripts\activate ^&^& uvicorn app.main:app --reload
echo   Frontend: cd frontend ^&^& npm run dev
echo.
echo L'application sera accessible sur: http://localhost:5173
echo.
pause
