import os
import csv
from io import BytesIO, StringIO
from pdf2image import convert_from_bytes
from PIL import Image
from openpyxl import Workbook
import google.generativeai as genai


POPLER_PATH = r"C:\poppler-25.12.0\Library\bin"
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "API Key Not Found, Contact Admin"
    )


def pdf_first_page_to_image(pdf_bytes: bytes):
    images = convert_from_bytes(
        pdf_bytes,
        dpi=350,
        first_page=1,
        last_page=1,
        poppler_path=POPLER_PATH
    )

    img = images[0].convert("L")
    img.save("debug_page.png")

    img_bytes = BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    return img_bytes


def extract_csv_from_image(image_bytes: BytesIO):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = prompt = """
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

Output format example:

Seat No,Student Name,Sem No,Subject Code,Subject Name,ISE,ESE,TOTAL,TW,PR,OR,TUT,Tot%,Crd,Grd,GP,CP,P&R ORD
T1001,John Doe,5,318241,"SW ENGI. & PROJECT MANAG.",45,23,68,-,-,-,-,85,03,A,08,24,-

Return ONLY CSV.
"""

    image_bytes.seek(0)
    pil_image = Image.open(image_bytes)

    response = model.generate_content([prompt, pil_image])
    csv_text = response.text.strip()

    if csv_text.startswith("```"):
        csv_text = csv_text.split("```")[1]

    print("RAW GEMINI RESPONSE:")
    print(csv_text)

    # ------------------------------
    # Token Usage Logging
    # ------------------------------
    usage = response.usage_metadata

    if usage:
        prompt_tokens = usage.prompt_token_count
        output_tokens = usage.candidates_token_count
        total_tokens = usage.total_token_count

        # Gemini 2.5 Flash approximate pricing (update if pricing changes)
        INPUT_PRICE_PER_1M = 0.35   # USD
        OUTPUT_PRICE_PER_1M = 0.70  # USD

        input_cost = (prompt_tokens / 1_000_000) * INPUT_PRICE_PER_1M
        output_cost = (output_tokens / 1_000_000) * OUTPUT_PRICE_PER_1M
        total_cost_usd = input_cost + output_cost
        total_cost_inr = total_cost_usd * 83  # approx conversion

        print("\n📊 TOKEN USAGE")
        print(f"Prompt Tokens : {prompt_tokens}")
        print(f"Output Tokens : {output_tokens}")
        print(f"Total Tokens  : {total_tokens}")
        print(f"Estimated Cost: ${total_cost_usd:.6f} (~₹{total_cost_inr:.2f})")


    return csv_text


def csv_to_excel_file(csv_text: str):
    from io import StringIO
    import csv
    from openpyxl import Workbook

    csv_io = StringIO(csv_text)
    reader = list(csv.reader(csv_io))

    if not reader:
        raise ValueError("Empty CSV returned from AI")

    header = reader[0]
    header_len = len(header)

    cleaned_rows = [header]

    for i, row in enumerate(reader[1:], start=2):

        # If row has more columns → merge extras into last column
        if len(row) > header_len:
            row = row[:header_len-1] + [
                ",".join(row[header_len-1:])
            ]

        # If row has fewer columns → pad with "-"
        elif len(row) < header_len:
            row = row + ["-"] * (header_len - len(row))

        cleaned_rows.append(row)

    wb = Workbook()
    ws = wb.active
    ws.title = "AI Extracted Data"

    for row in cleaned_rows:
        ws.append(row)

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return output