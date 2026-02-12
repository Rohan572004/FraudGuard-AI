import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import os

# 1. Load your actual data from the root
df = pd.read_csv("card_transdata.csv")

# 2. Split features and target
X = df.drop('fraud', axis=1)
y = df['fraud']

# 3. Train the model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=100, max_depth=10, n_jobs=-1)
model.fit(X_train, y_train)

# 4. Ensure the ml_models folder exists before saving
os.makedirs("app/ml_models", exist_ok=True)

# 5. Save the trained intelligence
joblib.dump(model, "app/ml_models/fraud_model.joblib")
print("Success: Model trained on real data and saved to app/ml_models/!")