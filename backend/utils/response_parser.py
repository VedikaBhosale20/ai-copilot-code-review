import json
import re

def parse_ollama_response(raw_response: str):
    """
    Parse Ollama's raw response into a clean list of suggestions.
    """
    try:
        lines = raw_response.split("\n")
        text_out = []
        for line in lines:
            if line.strip():
                try:
                    obj = json.loads(line)
                    if "response" in obj:
                        text_out.append(obj["response"])
                except json.JSONDecodeError:
                    text_out.append(line)

        # Join everything into one text block
        full_text = " ".join(text_out)  

        # Clean up unnecessary newlines and extra spaces
        full_text = re.sub(r"\s+", " ", full_text).strip()

        # Now split into suggestions based on bullets (*) or numbers (1., 2.)
        suggestions = re.split(r"(?:\d+\.\s*|\*\s*)", full_text)
        suggestions = [s.strip() for s in suggestions if s.strip()]

        return suggestions

    except Exception as e:
        return [f"Error parsing response: {str(e)}"]
