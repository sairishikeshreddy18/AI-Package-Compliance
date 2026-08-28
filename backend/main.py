from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from services.ocr import extract_text
from ai.extractor import extract_product_data
from compliance.engine import check_compliance


app = FastAPI(
    title="AI Package Compliance API",
    description="Backend API for package compliance checking",
    version="1.0.0",
)


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

    # Step 1: OCR
    ocr_text = extract_text(image_bytes)

    # Step 2: Extract product information
    product_data = extract_product_data(ocr_text)

    # Step 3: Check compliance
    compliance_result = check_compliance(product_data)

    # Return complete result
    return {
        "success": True,
        "filename": file.filename,
        "ocr_text": ocr_text,
        "product_data": product_data,
        "compliance": compliance_result,
    }
