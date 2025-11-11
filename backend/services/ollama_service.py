import requests
from config import Config

class OllamaService:
    def __init__(self):
        self.url = f"{Config.OLLAMA_HOST}:{Config.OLLAMA_PORT}/api/generate"
        self.model = Config.OLLAMA_MODEL

    def analyze_code(self, code_snippet: str):
        prompt = f"Review this code and suggest improvements, bug fixes, and best practices:\n{code_snippet}"

        payload = {
            "model": self.model,
            "prompt": prompt
        }

        try:
            response = requests.post(self.url, json=payload, stream=True)
            response.raise_for_status()

            raw_lines = []
            for line in response.iter_lines():
                if line:
                    raw_lines.append(line.decode("utf-8"))

            return "\n".join(raw_lines)

        except requests.exceptions.RequestException as e:
            return f"Error connecting to Ollama API: {str(e)}"