from fastapi import FastAPI
from pydantic import BaseModel
from model import classify_text, get_predictive_maintenance

app = FastAPI(
    title="SSASM Intelligent AI Service",
    description="Zero external API AI microservice for complaint classification and predictive maintenance."
)

class ComplaintInput(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"status": "ONLINE", "service": "SSASM Python FastAPI AI Module"}

@app.post("/predict-complaint")
def predict_complaint(input_data: ComplaintInput):
    result = classify_text(input_data.text)
    return result

@app.get("/predictive-maintenance")
def predictive_maintenance():
    return get_predictive_maintenance()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
