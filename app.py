"""
Heart Disease Prediction - Flask backend

Serves the existing frontend and exposes POST /predict, which converts
user-friendly form values into the 15 one-hot encoded features the saved
scikit-learn pipeline (StandardScaler + LogisticRegression) was trained on.

Educational demonstration only. Output is not a medical diagnosis.
"""
import math
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, render_template, request

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "heart_disease_model.pkl"

DISCLAIMER = "Educational demonstration only. This tool is not a medical diagnosis."

# Exact feature order the model was trained with.
FEATURE_COLUMNS = [
    "Age", "RestingBP", "Cholesterol", "FastingBS", "MaxHR", "Oldpeak",
    "Sex_M",
    "ChestPainType_ATA", "ChestPainType_NAP", "ChestPainType_TA",
    "RestingECG_Normal", "RestingECG_ST",
    "ExerciseAngina_Y",
    "ST_Slope_Flat", "ST_Slope_Up",
]

# Reference (dropped) categories, inferred from the 15 columns above.
# A category with no column of its own is the baseline, where every dummy = 0:
#   Sex            -> Female   (only Sex_M exists)
#   ChestPainType  -> ASY      (ATA, NAP, TA exist)
#   RestingECG     -> LVH      (Normal, ST exist)
#   ExerciseAngina -> No       (only ExerciseAngina_Y exists)
#   ST_Slope       -> Down     (Flat, Up exist)

# Numeric rules: (label, min, max, must_be_whole_number). Keep in sync with script.js.
NUMERIC_RULES = {
    "Age":         ("Age", 1, 120, True),
    "RestingBP":   ("RestingBP", 50, 250, True),
    "Cholesterol": ("Cholesterol", 50, 700, True),
    "MaxHR":       ("MaxHR", 40, 250, True),
    "Oldpeak":     ("Oldpeak", -3.0, 7.0, False),
}

# Allowed values sent by the frontend for each categorical field.
CATEGORY_RULES = {
    "Sex":            {"Female", "Male"},
    "ChestPainType":  {"ASY", "ATA", "NAP", "TA"},
    "RestingECG":     {"LVH", "Normal", "ST"},
    "ExerciseAngina": {"No", "Yes"},
    "ST_Slope":       {"Down", "Flat", "Up"},
}

app = Flask(__name__)


# --------------------------------------------------------------------------
# Model loading and verification
# --------------------------------------------------------------------------
def load_model():
    """Load the saved pipeline and check it matches the expected 15 features."""
    try:
        loaded = joblib.load(MODEL_PATH)
    except Exception as exc:  # missing file, version mismatch, corrupt pickle
        return None, f"Could not load {MODEL_PATH.name}: {exc}"

    if not (hasattr(loaded, "predict") and hasattr(loaded, "predict_proba")):
        return None, "Loaded object is not a classifier with predict/predict_proba."

    n_features = getattr(loaded, "n_features_in_", None)
    if n_features is not None and n_features != len(FEATURE_COLUMNS):
        return None, (f"Model expects {n_features} features but this app builds "
                      f"{len(FEATURE_COLUMNS)}.")

    names = getattr(loaded, "feature_names_in_", None)
    if names is not None:
        if list(names) != FEATURE_COLUMNS:
            return None, ("Model feature names/order do not match this app. "
                          f"Model: {list(names)}")
    else:
        app.logger.warning(
            "Model has no feature_names_in_ (trained on a NumPy array). "
            "Column order cannot be verified automatically; double-check it."
        )

    classes = {int(c) for c in getattr(loaded, "classes_", [])}
    if classes != {0, 1}:
        return None, f"Model classes are {sorted(classes)}, expected [0, 1]."

    return loaded, None


model, model_error = load_model()
if model_error:
    app.logger.error(model_error)


# --------------------------------------------------------------------------
# Validation and feature building
# --------------------------------------------------------------------------
def parse_number(value):
    """Return a finite float from a number or numeric string, else None."""
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        number = float(value)
    elif isinstance(value, str) and value.strip() != "":
        try:
            number = float(value.strip())
        except ValueError:
            return None
    else:
        return None
    return number if math.isfinite(number) else None


def validate_payload(data):
    """Return (clean_values, errors). errors maps field name -> message."""
    errors = {}
    clean = {}

    for field, (label, low, high, whole) in NUMERIC_RULES.items():
        if field not in data or data[field] in (None, ""):
            errors[field] = f"{label} is required."
            continue
        number = parse_number(data[field])
        if number is None:
            errors[field] = f"{label} must be a valid number."
        elif whole and number != int(number):
            errors[field] = f"{label} must be a whole number."
        elif not (low <= number <= high):
            errors[field] = f"{label} must be between {low} and {high}."
        else:
            clean[field] = int(number) if whole else number

    # FastingBS: binary 0 or 1
    if "FastingBS" not in data or data["FastingBS"] in (None, ""):
        errors["FastingBS"] = "FastingBS is required."
    else:
        number = parse_number(data["FastingBS"])
        if number not in (0.0, 1.0):
            errors["FastingBS"] = "FastingBS must be 0 or 1."
        else:
            clean["FastingBS"] = int(number)

    for field, allowed in CATEGORY_RULES.items():
        value = data.get(field)
        if value is None or value == "":
            errors[field] = f"{field} is required."
        elif not isinstance(value, str) or value not in allowed:
            errors[field] = f"{field} must be one of: {', '.join(sorted(allowed))}."
        else:
            clean[field] = value

    return clean, errors


def build_feature_row(v):
    """Convert validated user-friendly values into the 15 model features."""
    return {
        "Age": v["Age"],
        "RestingBP": v["RestingBP"],
        "Cholesterol": v["Cholesterol"],
        "FastingBS": v["FastingBS"],
        "MaxHR": v["MaxHR"],
        "Oldpeak": v["Oldpeak"],
        "Sex_M": int(v["Sex"] == "Male"),
        "ChestPainType_ATA": int(v["ChestPainType"] == "ATA"),
        "ChestPainType_NAP": int(v["ChestPainType"] == "NAP"),
        "ChestPainType_TA": int(v["ChestPainType"] == "TA"),
        "RestingECG_Normal": int(v["RestingECG"] == "Normal"),
        "RestingECG_ST": int(v["RestingECG"] == "ST"),
        "ExerciseAngina_Y": int(v["ExerciseAngina"] == "Yes"),
        "ST_Slope_Flat": int(v["ST_Slope"] == "Flat"),
        "ST_Slope_Up": int(v["ST_Slope"] == "Up"),
    }


# --------------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------------
@app.get("/")
def index():
    return render_template("index.html")


@app.post("/predict")
def predict():
    if model is None:
        return jsonify({
            "error": "The prediction model is not available on the server.",
            "disclaimer": DISCLAIMER,
        }), 503

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({
            "error": "Request body must be a JSON object (Content-Type: application/json).",
        }), 400

    clean, errors = validate_payload(data)
    if errors:
        return jsonify({
            "error": "Invalid input. " + " ".join(errors.values()),
            "errors": errors,
        }), 400

    try:
        row = build_feature_row(clean)
        features = pd.DataFrame([row], columns=FEATURE_COLUMNS)

        prediction = int(model.predict(features)[0])
        probabilities = model.predict_proba(features)[0]
        class_list = [int(c) for c in model.classes_]
        prob_class_1 = float(probabilities[class_list.index(1)])
        prob_predicted = float(probabilities[class_list.index(prediction)])
    except Exception:
        app.logger.exception("Prediction failed")
        return jsonify({"error": "Prediction failed on the server."}), 500

    return jsonify({
        "prediction": prediction,                       # 0 or 1 (model output)
        "probability": round(prob_predicted, 4),        # probability of the predicted class
        "probability_class_1": round(prob_class_1, 4),  # probability of class 1
        "disclaimer": DISCLAIMER,
    })


if __name__ == "__main__":
    # debug=True is for local development only.
    app.run(host="127.0.0.1", port=5000, debug=True)
