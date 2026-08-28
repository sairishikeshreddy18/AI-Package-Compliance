from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Legal Metrology Compliance API",
    description="Backend API for package compliance checking",
    version="1.0.0",
)


# Allow the React frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Legal Metrology Compliance API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/scan")
async def scan_package(file: UploadFile = File(...)):

    contents = await file.read()

    return {
        "success": True,
        "filename": file.filename,
        "content_type": file.content_type,
        "file_size": len(contents),
        "message": "Image received successfully",
    }
