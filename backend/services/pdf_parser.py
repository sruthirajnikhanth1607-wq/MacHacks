import fitz


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract plain text from a PDF payload using PyMuPDF."""
    with fitz.open(stream=pdf_bytes, filetype="pdf") as document:
        pages = [page.get_text("text") for page in document]

    return "\n".join(pages).strip()
