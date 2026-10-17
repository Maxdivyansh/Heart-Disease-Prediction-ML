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

- GitHub: [YOUR-USERNAME](https://github.com/YOUR-USERNAME)

## 📄 License

If you choose to release this project under the MIT License, include a `LICENSE` file containing the appropriate MIT License text and your copyright details.
