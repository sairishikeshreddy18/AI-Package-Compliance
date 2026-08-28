import pytesseract
from PIL import Image
import io


def extract_text(image_bytes: bytes) -> str:
    """
    Extract text from a package image using Tesseract OCR.
    """

    image = Image.open(io.BytesIO(image_bytes))

    text = pytesseract.image_to_string(image)

    return text.strip()
