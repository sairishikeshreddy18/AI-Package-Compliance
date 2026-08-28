from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from services.ocr import extract_text


app = FastAPI(
    title="AI Package Compliance API",
    description="Backend API for package compliance checking",
    version="1.0.0",
)


# Allow React frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AI Package Compliance API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.post("/scan")
async def scan(file: UploadFile = File(...)):

    # Read uploaded image
    image_bytes = await file.read()

    # Run OCR
    extracted_text = extract_text(image_bytes)

    return {
        "success": True,
        "filename": file.filename,
        "extracted_text": extracted_text,
    }
