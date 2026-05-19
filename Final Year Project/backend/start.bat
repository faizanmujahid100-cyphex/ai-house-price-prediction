@echo off
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting Flask backend on http://localhost:5000
python app.py
