/*
 * Heart Disease Prediction - frontend logic
 *
 * Validates the form, builds a JSON request, POSTs it to the Flask
 * endpoint /predict, and displays whatever the backend returns.
 * This file never computes or simulates a prediction.
 *
 * Expected JSON response from /predict (any of these shapes works):
 *   { "prediction": 0 | 1, "probability": 0.87, "label": "optional text", "message": "optional text" }
 * Errors:  { "error": "reason" } with a non-2xx status code.
 */
(function () {
  "use strict";

  var PREDICT_URL = "/predict";
  var REQUEST_TIMEOUT_MS = 15000;

  // Numeric field rules. Adjust the ranges to match your training data if needed.
  var NUMERIC_RULES = {
    Age:         { label: "Age",                    min: 1,   max: 120, integer: true,  unit: "years" },
    RestingBP:   { label: "Resting blood pressure", min: 50,  max: 250, integer: true,  unit: "mm Hg" },
    Cholesterol: { label: "Cholesterol",            min: 50,  max: 700, integer: true,  unit: "mg/dl" },
    MaxHR:       { label: "Maximum heart rate",     min: 40,  max: 250, integer: true,  unit: "bpm" },
    Oldpeak:     { label: "ST depression",          min: -3,  max: 7,   integer: false, unit: "" }
  };

  // Dropdown fields and their allowed values (must match your model's categories).
  var CHOICE_RULES = {
    Sex:            { label: "Sex",                        allowed: ["Female", "Male"] },
    ChestPainType:  { label: "Chest pain type",            allowed: ["ASY", "ATA", "NAP", "TA"] },
    RestingECG:     { label: "Resting ECG result",         allowed: ["LVH", "Normal", "ST"] },
    ExerciseAngina: { label: "Exercise-induced angina",    allowed: ["No", "Yes"] },
    ST_Slope:       { label: "ST segment slope",           allowed: ["Down", "Flat", "Up"] },
    FastingBS:      { label: "Fasting blood sugar",        allowed: ["0", "1"] }
  };

  var FIELD_ORDER = [
    "Age", "Sex",
    "RestingBP", "Cholesterol", "MaxHR", "Oldpeak", "RestingECG", "ST_Slope",
    "FastingBS", "ChestPainType", "ExerciseAngina"
  ];

  var form = document.getElementById("prediction-form");
  var predictBtn = document.getElementById("predict-btn");
  var btnLabel = predictBtn.querySelector(".btn-label");
  var resetBtn = document.getElementById("reset-btn");
  var errorSummary = document.getElementById("error-summary");
  var panel = document.getElementById("result-panel");
  var heading = document.getElementById("result-heading");
  var text = document.getElementById("result-text");
  var meta = document.getElementById("result-meta");

  /* ---------- Validation ---------- */

  function setFieldError(name, message) {
    var input = document.getElementById(name);
    var err = document.getElementById("err-" + name);
    if (message) {
      input.setAttribute("aria-invalid", "true");
      err.textContent = message;
    } else {
      input.removeAttribute("aria-invalid");
      err.textContent = "";
    }
  }

  function validateField(name) {
    var input = document.getElementById(name);
    var raw = input.value.trim();
    var message = "";

    if (NUMERIC_RULES[name]) {
      var rule = NUMERIC_RULES[name];
      if (raw === "") {
        message = rule.label + " is required.";
      } else {
        var num = Number(raw);
        if (!isFinite(num)) {
          message = "Enter a valid number.";
        } else if (rule.integer && !Number.isInteger(num)) {
          message = rule.label + " must be a whole number.";
        } else if (num < rule.min || num > rule.max) {
          message = rule.label + " must be between " + rule.min + " and " + rule.max +
                    (rule.unit ? " " + rule.unit : "") + ".";
        }
      }
    } else if (CHOICE_RULES[name]) {
      var choice = CHOICE_RULES[name];
      if (raw === "") {
        message = "Please select " + choice.label.toLowerCase() + ".";
      } else if (choice.allowed.indexOf(raw) === -1) {
        message = "Please choose one of the listed options.";
      }
    }

    setFieldError(name, message);
    return message;
  }

  function validateForm() {
    var problems = [];
    FIELD_ORDER.forEach(function (name) {
      var msg = validateField(name);
      if (msg) problems.push({ name: name, message: msg });
    });
    return problems;
  }

  function showErrorSummary(problems) {
    if (!problems.length) {
      errorSummary.hidden = true;
      errorSummary.textContent = "";
      return;
    }
    errorSummary.textContent =
      "Please fix " + problems.length + (problems.length === 1 ? " field" : " fields") +
      " before predicting.";
    errorSummary.hidden = false;
  }

  /* ---------- Request payload ---------- */

  // Raw, human-readable values only. One-hot encoding must happen in Flask.
  function buildPayload() {
    var payload = {};
    Object.keys(NUMERIC_RULES).forEach(function (name) {
      payload[name] = Number(document.getElementById(name).value);
    });
    payload.FastingBS = Number(document.getElementById("FastingBS").value);
    ["Sex", "ChestPainType", "RestingECG", "ExerciseAngina", "ST_Slope"].forEach(function (name) {
      payload[name] = document.getElementById(name).value;
    });
    return payload;
  }

  /* ---------- Result panel ---------- */

  function setResult(state, title, body, metaText) {
    panel.setAttribute("data-state", state);
    heading.textContent = title;
    text.textContent = body;
    if (metaText) {
      meta.textContent = metaText;
      meta.hidden = false;
    } else {
      meta.textContent = "";
      meta.hidden = true;
    }
  }

  function setLoading(isLoading) {
    predictBtn.disabled = isLoading;
    predictBtn.classList.toggle("is-loading", isLoading);
    predictBtn.setAttribute("aria-busy", isLoading ? "true" : "false");
    btnLabel.textContent = isLoading ? "Predicting…" : "Predict";
    if (isLoading) {
      setResult("loading", "Analyzing…", "Sending your values to the prediction service.");
    }
  }

  function formatProbability(p) {
    var n = Number(p);
    if (!isFinite(n)) return "";
    if (n >= 0 && n <= 1) n = n * 100;
    return "Model confidence: " + n.toFixed(1) + "%";
  }

  // Renders only what the backend returned. Nothing is invented here.
  function renderBackendResult(data) {
    var hasPrediction = data && (data.prediction === 0 || data.prediction === 1 ||
                                 data.prediction === "0" || data.prediction === "1");
    var customLabel = data && typeof data.label === "string" ? data.label : "";
    var customMessage = data && typeof data.message === "string" ? data.message : "";
    var probText = data && data.probability !== undefined && data.probability !== null
      ? formatProbability(data.probability) : "";

    if (!hasPrediction && !customLabel && !customMessage) {
      setResult(
        "error",
        "Unexpected response",
        "The server replied, but the response did not contain a prediction. Check the /predict endpoint output."
      );
      return;
    }

    var positive = String(data.prediction) === "1";
    var title = customLabel ||
      (hasPrediction
        ? (positive ? "Higher risk indicated" : "Lower risk indicated")
        : "Result received");
    var body = customMessage ||
      "This is the model's output for the values you entered. It is for educational purposes only and is not a diagnosis.";

    setResult(positive ? "alert" : "success", title, body, probText);
  }

  /* ---------- Submit ---------- */

  function fetchWithTimeout(url, options, ms) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, ms);
    options.signal = controller.signal;
    return fetch(url, options).finally(function () { clearTimeout(timer); });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var problems = validateForm();
    showErrorSummary(problems);
    if (problems.length) {
      setResult("idle", "No prediction yet", "Please correct the highlighted fields and try again.");
      document.getElementById(problems[0].name).focus();
      return;
    }

    var payload = buildPayload();
    setLoading(true);

    fetchWithTimeout(PREDICT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    }, REQUEST_TIMEOUT_MS)
      .then(function (response) {
        var type = response.headers.get("content-type") || "";
        var isJson = type.indexOf("application/json") !== -1;

        if (response.status === 404 || response.status === 405 || (response.ok && !isJson)) {
          var notConnected = new Error("not-connected");
          notConnected.code = "NOT_CONNECTED";
          throw notConnected;
        }

        return (isJson ? response.json() : Promise.resolve({})).then(function (data) {
          if (!response.ok) {
            var serverError = new Error((data && data.error) || "The server could not process the request.");
            serverError.code = "SERVER_ERROR";
            throw serverError;
          }
          return data;
        });
      })
      .then(renderBackendResult)
      .catch(function (err) {
        if (err && err.code === "NOT_CONNECTED") {
          setResult(
            "error",
            "Prediction not available",
            "The prediction backend is not connected yet. Start the Flask app with a working /predict endpoint and try again."
          );
        } else if (err && err.code === "SERVER_ERROR") {
          setResult("error", "Prediction failed", err.message);
        } else if (err && err.name === "AbortError") {
          setResult("error", "Request timed out", "The prediction service took too long to respond. Please try again.");
        } else {
          setResult(
            "error",
            "Prediction not available",
            "Could not reach the prediction service. Make sure the Flask server is running and /predict is available."
          );
        }
      })
      .finally(function () {
        setLoading(false);
      });
  });

  /* ---------- Live validation & reset ---------- */

  FIELD_ORDER.forEach(function (name) {
    var input = document.getElementById(name);
    // Validate on blur; once a field shows an error, re-check as the user fixes it.
    input.addEventListener("blur", function () {
      if (input.value !== "" || input.hasAttribute("aria-invalid")) validateField(name);
    });
    var evt = input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(evt, function () {
      if (input.hasAttribute("aria-invalid")) validateField(name);
    });
  });

  resetBtn.addEventListener("click", function () {
    FIELD_ORDER.forEach(function (name) { setFieldError(name, ""); });
    showErrorSummary([]);
    setResult("idle", "No prediction yet", "Complete the form and press Predict to see the model's output here.");
  });
})();
