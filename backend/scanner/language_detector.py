EXTENSION_MAP = {
    ".py": "python",
    ".js": "javascript",
    ".ts": "typescript",
    ".java": "java",
    ".go": "go",
    ".rb": "ruby",
    ".php": "php",
    ".c": "c",
    ".cpp": "cpp",
    ".rs": "rust",
}

def detect_from_extension(filename: str) -> str:
    for ext, lang in EXTENSION_MAP.items():
        if filename.endswith(ext):
            return lang
    return "auto"

def get_file_extension(language: str) -> str:
    reverse = {v: k for k, v in EXTENSION_MAP.items()}
    return reverse.get(language, ".txt")