import pdfplumber
from .gazette_analyzer import analyze_gazette


def analyze_pdf_file(pdf_path: str) -> dict:
    full_text = ""

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"

    if not full_text.strip():
        raise ValueError("No text extracted from PDF")

    df, detected_class, subject_container = analyze_gazette(full_text)

    if df.empty:
        return {
            "class": detected_class,
            "total_students": 0,
            "toppers": [],
            "subjects": []
        }

    # Top 3 students
    toppers = (
        df.sort_values("SGPA", ascending=False)
          .head(3)
          .to_dict(orient="records")
    )

    # Subject-wise stats
    subjects = []
    for key, stats in subject_container.items():
        appeared = stats["appeared"]
        passed = stats["passed"]
        failed = appeared - passed
        percent = round((passed / appeared) * 100, 2) if appeared else 0

        subjects.append({
            "subject": key,
            "appeared": appeared,
            "passed": passed,
            "failed": failed,
            "pass_percentage": percent
        })

    return {
        "class": detected_class,
        "total_students": len(df),
        "toppers": toppers,
        "subjects": subjects
    }
