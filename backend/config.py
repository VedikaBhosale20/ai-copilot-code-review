import os
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env file

class Config:
    OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost")
    OLLAMA_PORT = os.getenv("OLLAMA_PORT", "11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama2")
