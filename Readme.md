# FraudGuard AI: Hybrid Fraud Detection System

A full-stack, end-to-end fraud monitoring dashboard that combines **Machine Learning (XGBoost)** with **Heuristic Risk Logic** to detect credit card anomalies in real-time.

##  Key Features
* **Full-Stack Auth**: Secure JWT-based authentication with password complexity validation.
* **Hybrid ML Logic**: Combines statistical model predictions with rule-based safety overrides for high-risk online orders.
* **Explainable AI (XAI)**: Dynamically identifies the top 3 risk factors for every transaction (e.g., "Price Ratio", "Home Distance").
* **Real-time Analytics**: Interactive dashboard showing transaction history and data distribution.

##  Tech Stack
* **Backend**: FastAPI, PostgreSQL, SQLAlchemy (ORM), Alembic (Migrations).
* **Machine Learning**: Python, Scikit-learn, Joblib, Pandas.
* **Frontend**: React.js, Tailwind CSS, Lucide Icons, Recharts.

## ⚙️ Installation & Setup
1. **Clone the Repo**: `git clone <your-repo-url>`
2. **Backend Setup**:
   - `pip install -r requirements.txt`
   - `alembic upgrade head`
   - `uvicorn main:app --reload`
3. **Frontend Setup**:
   - `cd frontend && npm install`
   - `npm start`