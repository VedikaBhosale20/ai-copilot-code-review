from flask import Flask, request, jsonify
from flask_cors import CORS
from services.ollama_service import OllamaService
from utils.response_parser import parse_ollama_response

app = Flask(__name__)
CORS(app)
ollama_service = OllamaService()

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "AI Copilot Backend is running!"})

@app.route("/analyze", methods=["POST"])
def analyze_code():
    data = request.get_json()
    code_snippet = data.get("code")

    if not code_snippet:
        return jsonify({"error": "No code provided"}), 400

    raw_suggestions = ollama_service.analyze_code(code_snippet)
    parsed_suggestions = parse_ollama_response(raw_suggestions)

    return jsonify({"suggestions": parsed_suggestions})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
