import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    text_parts = []

    for page in doc:
        text = page.get_text()
        if text.strip():
            text_parts.append(text)

    return "\n".join(text_parts)


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50):
    words = text.split()
    chunks = []

    start = 0
    index = 1

    while start < len(words):
        end = start + chunk_size
        chunk_words = words[start:end]
        chunks.append((index, " ".join(chunk_words)))
        index += 1
        start = end - overlap

    return chunks


def generate_chunks_from_pdf(pdf_path: str):
    text = extract_text_from_pdf(pdf_path)
    return chunk_text(text)