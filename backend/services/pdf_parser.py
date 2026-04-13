"""
services/pdf_parser.py
Extracts plain text from a PDF using PyMuPDF (fitz).
"""
import fitz  # PyMuPDF


def extract_text_from_pdf(file_path: str) -> str:
    """
    Opens a PDF and returns all text as a single string.
    Args:
        file_path: Absolute path to the PDF file.
    Returns:
        Extracted text string.
    """
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
        doc.close()
    except Exception as e:
        print(f"[PDF Parser] Error: {e}")
    return text.strip()
