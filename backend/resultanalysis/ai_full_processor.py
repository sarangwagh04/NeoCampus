import os
import csv
from io import BytesIO
from pdf2image import convert_from_bytes
from PIL import Image

import google.generativeai as genai

# ============================================
# CONFIG
# ============================================

# Define BASE_DIR as the Neocampus root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set POPLER_PATH dynamically pointing to Neocampus/poppler-25.12.0/Library/bin
POPLER_PATH = os.path.join(BASE_DIR, "poppler-25.12.0", "Library", "bin")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not configured")

genai.configure(api_key=GEMINI_API_KEY)

MODEL = genai.GenerativeModel("gemini-2.5-flash")


# ============================================
# 🔁 NEW: SAFETY LIMIT FOR TESTING
# Only process first 1 pages to protect free tier
# ============================================

MAX_TEST_PAGES = 1


# ============================================
# Convert full PDF to images
# ============================================

def pdf_to_images(pdf_bytes: bytes):

    print("\n[AI] Starting PDF → Image conversion...")  # 🔁 NEW

    images = convert_from_bytes(
        pdf_bytes,
        dpi=350,
        poppler_path=POPLER_PATH
    )

    print(f"[AI] Total pages detected: {len(images)}")  # 🔁 NEW

    # 🔁 NEW: Limit pages to first 2 while testing
    images = images[:MAX_TEST_PAGES]

    print(f"[AI] Processing only first {len(images)} pages (testing limit)")  # 🔁 NEW

    output_images = []

    for idx, img in enumerate(images, start=1):

        img = img.convert("L")

        img_bytes = BytesIO()
        img.save(img_bytes, format="PNG")
        img_bytes.seek(0)

        output_images.append(img_bytes)

        print(f"[AI] Page {idx} converted to image successfully")  # 🔁 NEW

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

    # 🔁 NEW: construct final prompt
    prompt = BASE_PROMPT.replace("{column_instruction}", column_names)
    # print(f"\n[AI] Constructed prompt for page {page_number}:\n{prompt}\n")  #print prompt for debugging
    print(f"[AI] Sending page {page_number} to Gemini...")  # 🔁 NEW

    image_bytes.seek(0)

    pil_image = Image.open(image_bytes)

    response = MODEL.generate_content([prompt, pil_image])

    csv_text = response.text.strip()

    # remove markdown if Gemini adds
    if "```" in csv_text:
        csv_text = csv_text.replace("```csv", "").replace("```", "").strip()

    print(f"[AI] CSV received from Gemini for page {page_number}")  # 🔁 NEW

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

    # skip header from next pages
    return existing_rows + reader[1:]


# ============================================
# MAIN PIPELINE
# ============================================

def process_pdf_with_gemini(pdf_bytes: bytes, column_names=None):

    print("\n[AI] Starting Gemini extraction pipeline...")  # 🔁 NEW

    images = pdf_to_images(pdf_bytes)

    merged_rows = []

    processed_pages = 0

    warning = None

    for index, image_bytes in enumerate(images):

        page_number = index + 1  # 🔁 NEW

        try:

            csv_text = extract_csv_from_image(image_bytes, page_number, column_names)  # 🔁 MODIFIED

            merged_rows = merge_csv(merged_rows, csv_text)

            processed_pages += 1

            print(f"[AI] Page {page_number} CSV appended successfully")  # 🔁 NEW

        except Exception as e:

            error_message = str(e).lower()

            print(f"[AI] ERROR on page {page_number}: {e}")  # 🔁 NEW

            # ============================================
            # CREDIT LIMIT / QUOTA HANDLING
            # ============================================

            if (
                "quota" in error_message
                or "limit" in error_message
                or "resource exhausted" in error_message
                or "429" in error_message
            ):

                warning = "Gemini API quota limit reached. Partial data returned."

                print("[AI] Gemini quota reached. Stopping further processing.")  # 🔁 NEW

                break

            # other errors should still raise
            raise e

    if not merged_rows:
        raise ValueError("No data extracted from PDF")

    print(f"[AI] Total processed pages: {processed_pages}")  # 🔁 NEW
    print(f"[AI] Total rows extracted: {len(merged_rows)-1}")  # 🔁 NEW

    #Print extracted CSV preview in terminal
    print("\n[AI] Extracted CSV Preview:\n")

    for row in merged_rows[:10]:  # print first 10 rows
        print(row)

    header = merged_rows[0]

    # ============================================
    # UNIQUE COLUMN DETECTION
    # ============================================

    unique_columns = list(dict.fromkeys(header))
    total_columns = len(unique_columns)

    print("\n[AI] Unique Columns Detected:")
    for col in unique_columns:
        print(f" - {col}")

    print(f"\n[AI] Total Columns Detected: {total_columns}")

    # ============================================
    # ROW PROCESSING
    # ============================================


    rows = []

    for r in merged_rows[1:]:

        row_dict = {}

        for i, col in enumerate(header):

            if i < len(r):
                row_dict[col] = r[i]
            else:
                row_dict[col] = "-"

        rows.append(row_dict)

    # ============================================
    # DEBUGGING: PRINT STRUCTURED PREVIEW
    # ============================================
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
