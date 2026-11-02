import os
import csv
from io import BytesIO
from PIL import Image
from google import genai

# ============================================
# CONFIG
# ============================================

# Define BASE_DIR as the Neocampus root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
POPLER_PATH = os.path.join(BASE_DIR, "poppler-25.12.0", "Library", "bin")


def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY2")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not configured. Please set the GEMINI_API_KEY environment variable in Render.")
    return genai.Client(api_key=api_key)


# ============================================
# 🔁 NEW: SAFETY LIMIT FOR TESTING
# Only process first 1 pages to protect free tier
# ============================================

MAX_TEST_PAGES = 1


# ============================================
# Convert full PDF to images
# ============================================

def pdf_to_images(pdf_bytes: bytes):
    print("\n[AI] Starting PDF → Image conversion...")

    images = []
    try:
        import pypdfium2 as pdfium
        pdf = pdfium.PdfDocument(pdf_bytes)
        total_pages = len(pdf)
        print(f"[AI] Total pages detected via pypdfium2: {total_pages}")
        max_pages = min(total_pages, MAX_TEST_PAGES) if MAX_TEST_PAGES else total_pages
        for i in range(max_pages):
            page = pdf[i]
            img = page.render(scale=3).to_pil()
            images.append(img)
    except Exception as e:
        print(f"[AI] pypdfium2 fallback to pdf2image: {e}")
        from pdf2image import convert_from_bytes
        kwargs = {"dpi": 350}
        if os.path.exists(POPLER_PATH):
            kwargs["poppler_path"] = POPLER_PATH
        images = convert_from_bytes(pdf_bytes, **kwargs)
        print(f"[AI] Total pages detected via pdf2image: {len(images)}")
        if MAX_TEST_PAGES:
            images = images[:MAX_TEST_PAGES]

    print(f"[AI] Processing {len(images)} page(s)")

    output_images = []
    for idx, img in enumerate(images, start=1):
        img = img.convert("L")
        img_bytes = BytesIO()
        img.save(img_bytes, format="PNG")
        img_bytes.seek(0)
        output_images.append(img_bytes)
        print(f"[AI] Page {idx} converted to image successfully")

    return output_images


# ============================================
# Gemini Extraction
# ============================================

BASE_PROMPT = """
You are an academic result data extractor.

Extract all tabular data from the image and return ONLY CSV format.

STRICT RULES:
- Do NOT explain anything.
- Do NOT add markdown.
- Do NOT add code blocks.
- Output must start directly with the header row.
- Use comma (,) as separator.
- Every row must have the SAME number of columns.
- If a value contains a comma, wrap that value in double quotes.
- If value is missing, use "-".
- Do NOT skip rows.
- Add the GPA/CGPA as a column. If value not present add "-" as value.
- The SGPA/CGPA value MUST be repeated exactly the same on EVERY row (every subject entry) for the same student.
- Add TH/OR/TW/PR in front of subject name if present double name.

EXACT COLUMNS REQUIRED:
{column_instruction}

If a required column is not found in the image, include it anyway with "-" as the value.

Return ONLY CSV.
"""


def extract_csv_from_image(image_bytes: BytesIO, page_number, column_names):
    client = get_gemini_client()

    prompt = BASE_PROMPT.replace("{column_instruction}", column_names)
    print(f"[AI] Sending page {page_number} to Gemini...")

    image_bytes.seek(0)
    pil_image = Image.open(image_bytes)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[prompt, pil_image],
    )

    csv_text = (response.text or "").strip()

    if "```" in csv_text:
        csv_text = csv_text.replace("```csv", "").replace("```", "").strip()

    print(f"[AI] CSV received from Gemini for page {page_number}")
    return csv_text


# ============================================
# Merge CSV rows
# ============================================

def merge_csv(existing_rows, new_csv_text):
    reader = list(csv.reader(new_csv_text.splitlines()))

    if not reader:
        return existing_rows

    if not existing_rows:
        return reader

    return existing_rows + reader[1:]


# ============================================
# MAIN PIPELINE
# ============================================

def process_pdf_with_gemini(pdf_bytes: bytes, column_names=None):
    print("\n[AI] Starting Gemini extraction pipeline...")

    images = pdf_to_images(pdf_bytes)
    merged_rows = []
    processed_pages = 0
    warning = None

    for index, image_bytes in enumerate(images):
        page_number = index + 1

        try:
            csv_text = extract_csv_from_image(image_bytes, page_number, column_names)
            merged_rows = merge_csv(merged_rows, csv_text)
            processed_pages += 1
            print(f"[AI] Page {page_number} CSV appended successfully")
        except Exception as e:
            error_message = str(e).lower()
            print(f"[AI] ERROR on page {page_number}: {e}")

            if (
                "quota" in error_message
                or "limit" in error_message
                or "resource exhausted" in error_message
                or "429" in error_message
            ):
                warning = "Gemini API quota limit reached. Partial data returned."
                print("[AI] Gemini quota reached. Stopping further processing.")
                break

            raise e

    if not merged_rows:
        raise ValueError("No data extracted from PDF")

    print(f"[AI] Total processed pages: {processed_pages}")
    print(f"[AI] Total rows extracted: {len(merged_rows)-1}")

    print("\n[AI] Extracted CSV Preview:\n")
    for row in merged_rows[:10]:
        print(row)

    header = merged_rows[0]
    unique_columns = list(dict.fromkeys(header))
    total_columns = len(unique_columns)

    print("\n[AI] Unique Columns Detected:")
    for col in unique_columns:
        print(f" - {col}")

    print(f"\n[AI] Total Columns Detected: {total_columns}")

    rows = []
    for r in merged_rows[1:]:
        row_dict = {}
        for i, col in enumerate(header):
            if i < len(r):
                row_dict[col] = r[i]
            else:
                row_dict[col] = "-"
        rows.append(row_dict)

    print("\n[AI] Structured Extracted Rows Preview (First 5 Rows):")
    for idx, r_dict in enumerate(rows[:5], start=1):
        print(f"\nRow {idx}:")
        for key, val in r_dict.items():
            print(f"  {key}: {val}")
    print("-" * 40)

    return {
        "columns": header,
        "rows": rows,
        "total_rows": len(rows),
        "processed_pages": processed_pages,
        "warning": warning,
    }
