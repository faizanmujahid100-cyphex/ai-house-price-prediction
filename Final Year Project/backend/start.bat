@echo off
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting Flask backend on http://localhost:7860
python app.py
