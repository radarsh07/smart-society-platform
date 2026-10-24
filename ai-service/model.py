from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# Sample training dataset for society maintenance complaints
TRAINING_DATA = [
    ("Water leakage in master bathroom ceiling", "Plumbing", "HIGH"),
    ("Main elevator stuck between 3rd and 4th floor", "Elevator", "URGENT"),
    ("Clubhouse lights not turning on", "Electrical", "MEDIUM"),
    ("Power outage in Block B corridor", "Electrical", "HIGH"),
    ("Low water pressure in kitchen tap", "Plumbing", "LOW"),
    ("Gym treadmill display screen broken", "Fitness Equipment", "LOW"),
    ("Swimming pool water looks cloudy and needs chlorine test", "Amenities", "MEDIUM"),
    ("Sparking sound from main circuit breaker box", "Electrical", "URGENT"),
    ("Seepage near balcony pillar", "Civil & Painting", "MEDIUM"),
    ("Intercom phone not ringing", "Telecom", "LOW"),
]

texts = [item[0] for item in TRAINING_DATA]
categories = [item[1] for item in TRAINING_DATA]
priorities = [item[2] for item in TRAINING_DATA]

category_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
    ('clf', LogisticRegression(max_iter=200))
])
category_pipeline.fit(texts, categories)

priority_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
    ('clf', LogisticRegression(max_iter=200))
])
priority_pipeline.fit(texts, priorities)

def classify_text(text: str):
    category_pred = category_pipeline.predict([text])[0]
    priority_pred = priority_pipeline.predict([text])[0]
    return {
        "category": category_pred,
        "priority": priority_pred
    }

def get_predictive_maintenance():
    return {
        "high_risk_area": "Water Tank Pump #2 & Elevator Motor B",
        "frequently_failing": "Plumbing & Electrical Circuit Breakers",
        "suggested_schedule": [
            "Weekly inspect water pressure valves and booster pumps.",
            "Bi-weekly check elevator door sensors and cable lubrication.",
            "Monthly test clubhouse HVAC filters and pool chlorination balance."
        ]
    }
