## 🚀 Live Demo

🌐 **Live Website:** https://heart-disease-prediction-ml-v95d.onrender.com

💻 **GitHub Repository:** https://github.com/Maxdivyansh/Heart-Disease-Prediction-ML

Try the live application to explore the Heart Disease Prediction machine learning project.

⚠️ **Disclaimer:** This project is intended for educational and demonstration purposes only. It is not a clinically validated diagnostic tool and must not be used to diagnose heart disease or make medical decisions.

<<<<<<< HEAD
# Heart Disease Prediction Web App

A small Flask web app that serves a heart-disease prediction form and sends the
values to your trained scikit-learn pipeline (`StandardScaler` + `LogisticRegression`).

> Educational demonstration only. This tool is not a medical diagnosis.

## Project structure

```
HeartDiseaseWebApp/
├── app.py                     Flask backend (GET /, POST /predict)
├── requirements.txt           Python dependencies
├── heart_disease_model.pkl    YOUR trained model (you add this file, see step 1)
├── README.md
└── templates/
    └── index.html             Complete frontend (HTML + CSS + JavaScript in one file)
```

## Setup on Windows (VS Code)

1. **Add your model.** Copy `heart_disease_model.pkl` into this folder, next to `app.py`.
   Your notebook saved it at `C:\Users\maxdi\heart_disease_model.pkl`.
2. **Open the folder in VS Code:** File → Open Folder → `HeartDiseaseWebApp`.
3. **Open a terminal** with `` Ctrl+` `` and create a virtual environment:
   ```
   py -m venv venv
   ```
4. **Activate it:**
   ```
   venv\Scripts\Activate.ps1
   ```
   If PowerShell blocks the script, run this once, then activate again:
   ```
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
5. **Install dependencies:**
   ```
   pip install -r requirements.txt
   ```
   Tip: `scikit-learn` should match the version you trained with. Check it in your
   notebook environment with `pip show scikit-learn` and pin it in `requirements.txt`
   (for example `scikit-learn==1.5.2`), otherwise loading the model may warn or fail.
6. **Select the interpreter:** `Ctrl+Shift+P` → "Python: Select Interpreter" → pick the one in `venv`.
7. **Run:**
   ```
   python app.py
   ```
8. Open http://127.0.0.1:5000 in your browser.

## How it works

- The page sends raw, readable values as JSON to `POST /predict`
  (for example `"Sex": "Male"`, `"ChestPainType": "ASY"`).
- `app.py` validates them and builds the 15 model features in this exact order:
  `Age, RestingBP, Cholesterol, FastingBS, MaxHR, Oldpeak, Sex_M, ChestPainType_ATA,
  ChestPainType_NAP, ChestPainType_TA, RestingECG_Normal, RestingECG_ST,
  ExerciseAngina_Y, ST_Slope_Flat, ST_Slope_Up`
- Reference (all-zero) categories, matching `pd.get_dummies(drop_first=True)` in the
  notebook: Female, ASY, LVH, No, Down.
- Scaling happens inside the saved pipeline, so no scaling is done in the backend.
- On startup the app checks that the model's feature names and order match. If they
  do not, `/predict` returns a 503 error instead of a wrong answer.

## Test the API directly (PowerShell)

```powershell
$body = @{
  Age=54; RestingBP=130; Cholesterol=240; FastingBS=0; MaxHR=150; Oldpeak=1.5
  Sex="Male"; ChestPainType="ASY"; RestingECG="Normal"; ExerciseAngina="No"; ST_Slope="Flat"
} | ConvertTo-Json
Invoke-RestMethod -Uri http://127.0.0.1:5000/predict -Method Post -ContentType "application/json" -Body $body
```

Expected: JSON with `prediction` (0 or 1), `probability`, `probability_class_1`, and a disclaimer.

Invalid input returns HTTP 400 with an `error` message.

## Notes

- Input ranges are set in `NUMERIC_RULES` in `app.py` and in the script inside
  `templates/index.html`. Keep the two in sync.
- `debug=True` in `app.py` is for local development only.
- Predictions come only from your trained model. The app never invents results.
=======
# ❤️ Heart Disease Prediction using Machine Learning

A machine learning web application that estimates the likelihood of heart disease based on selected health-related input features. Built with Python, Scikit-learn, Flask, HTML, CSS, and JavaScript.

## 🌟 Overview

This project combines a trained Logistic Regression model with a web interface to demonstrate how machine learning can be used for a heart-disease prediction task.

Users can enter relevant health parameters through a web form and receive a model-generated prediction.

## ✨ Features

- 🤖 Machine learning using Logistic Regression
- 📊 Data preprocessing and feature scaling
- 🌐 Flask-powered web application
- 🎨 Professional, responsive medical-themed interface
- 📝 Input validation and prediction feedback
- 🔄 Form reset functionality

## 🛠️ Tech Stack

- **Language:** Python
- **Machine Learning:** Scikit-learn
- **Data Processing:** Pandas
- **Model Serialization:** Joblib
- **Backend:** Flask
- **Frontend:** HTML, CSS, JavaScript
- **Development Tools:** Jupyter Notebook and Visual Studio Code

## 📁 Project Structure

```text
HeartDiseaseWebApp/
├── app.py
├── heart_disease_model.pkl
├── requirements.txt
├── README.md
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/heart-disease-prediction-ml.git
```

### 2. Open the project folder

```bash
cd heart-disease-prediction-ml
```

### 3. Create a virtual environment (recommended)

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Run the application

```bash
python app.py
```

Open this address in your browser:

```text
http://127.0.0.1:5000
```

## 🧠 Machine Learning Workflow

1. Load and inspect the dataset.
2. Handle missing or invalid values.
3. Prepare the features and target variable.
4. Split the data into training and testing sets.
5. Scale the features and train a Logistic Regression model.
6. Evaluate the model using classification metrics.
7. Save the trained pipeline using Joblib.
8. Load the model into Flask and generate predictions through the web interface.

## 📈 Model Evaluation

The reported test-set results from the development notebook are:

| Metric | Score |
|---|---:|
| Accuracy | 89.13% |
| Precision | 89.42% |
| Recall | 91.18% |
| F1-score | 90.29% |

These values reflect the particular test split used during development. They do not establish clinical accuracy or guarantee performance on new populations.

## ⚠️ Disclaimer

This project is intended for educational and demonstration purposes only. It is not a clinically validated medical device and must not be used to diagnose, rule out, or make treatment decisions about heart disease. Consult a qualified healthcare professional for medical concerns.

## 👨‍💻 Author

**YOUR NAME**

- GitHub: [YOUR-USERNAME](https://github.com/Maxdivyansh)

## 📄 License

If you choose to release this project under the MIT License, include a `LICENSE` file containing the appropriate MIT License text and your copyright details.
>>>>>>> eb6e36465826394eaf6131d69819868a47c22548
