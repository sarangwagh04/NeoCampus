import os
import csv
from io import BytesIO
from pdf2image import convert_from_bytes
from PIL import Image

import google.generativeai as genai

# ============================================
# CONFIG
# ============================================

POPLER_PATH = r"C:\poppler-25.12.0\Library\bin"
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not configured")

genai.configure(api_key=GEMINI_API_KEY)

MODEL = genai.GenerativeModel("gemini-2.5-flash")


# ============================================
# 🔁 NEW: SAFETY LIMIT FOR TESTING
# Only process first 2 pages to protect free tier
# ============================================

MAX_TEST_PAGES = 37


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
- Add the gpa as column, if value not present add "-" as value.
-Add TH/OR/TW/PR in front of subject name if present double name 
{column_instruction}

Seat No,Student Name,Sem No,Subject Code,Subject Name,SGPA,CGPA,ESE,TOTAL,TW,PR,OR,TUT,Tot%,Crd,Grd,GP,CP,P&R ORD
T1001,John Doe,5,318241,"SW ENGI. & PROJECT MANAG.",6.78,45,23,68,-,-,-,-,85,03,A,08,24,-

Return ONLY CSV.
"""


def extract_csv_from_image(image_bytes: BytesIO, page_number, column_names=None):  # 🔁 MODIFIED: added page_number and column_names

    column_instruction = ""

    if column_names:
        column_instruction = f'-extract these columns "{column_names}" only. If column is missing then include it in the CSV with "-" as value.'

    # 🔁 NEW: construct final prompt
    prompt = BASE_PROMPT.replace("{column_instruction}", column_instruction)
    # print(f"\n[AI] Constructed prompt for page {page_number}:\n{prompt}\n")  #print prompt for debugging
    print(f"[AI] Sending page {page_number} to Gemini...")  # 🔁 NEW

    image_bytes.seek(0)

    pil_image = Image.open(image_bytes)

    response = MODEL.generate_content([prompt, pil_image])

    csv_text = response.text.strip()

    # remove markdown if Gemini adds
    if csv_text.startswith("```"):
        csv_text = csv_text.split("```")[1]

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

    return {
        "columns": header,
        "rows": rows,
        "total_rows": len(rows),
        "processed_pages": processed_pages,
        "warning": warning,
    }
