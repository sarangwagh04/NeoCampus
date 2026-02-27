import pdfplumber
import pandas as pd
import re
from collections import defaultdict

DEBUG = False  # Set to True for debugging output

# ---------- Detect Class ----------
def detect_class(text):
    text = text.upper()
    if "FIRST YEAR" in text or "F.E." in text:
        return "FE"
    elif "SECOND YEAR" in text or "S.E." in text:
        return "SE"
    elif "THIRD YEAR" in text or "T.E." in text:
        return "TE"
    elif "FINAL YEAR" in text or "B.E." in text or "FINAL" in text:
        return "BE"
    else:
        return "UNKNOWN"

# ---------- Build Subject Mapping ----------
def build_subject_mapping(full_text):
    code_to_name = {}
    lines = full_text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line or 'Semester :' in line or 'Page :' in line:
            i += 1
            continue
        match = re.match(r'^([A-Z]{2,4}[0-9]{3}[-A-Z0-9_]{0,5})$', line)
        if match:
            code = match.group(1)
            i += 1
            if i < len(lines):
                name_line = lines[i].strip()
                name = name_line.title()
                if len(name) > 5 and not re.match(r'^(Sub|Min|Max|CCE|ESE|TW|INT|PJ|CRD|ERN|GRD|GP|CP|---)$', name):
                    code_to_name[code] = name
        i += 1
    if DEBUG:
        print(f"Header mapping: {len(code_to_name)} codes (sample: {list(code_to_name.items())[:3]})")
    return code_to_name

# ---------- Extract Student Name ----------
def extract_name_from_line(line):
    patterns = [
        r'NAME\s*[:\s]*([A-Z][A-Za-z\s]+?)(?=\s+MOTHER|\s+Mother|\s+PRN|\s+CLG|\s+SEAT\s+NO\.|$)'
    ]
    for pat in patterns:
        match = re.search(pat, line, re.IGNORECASE)
        if match:
            name = re.sub(r'[^A-Z\s]', '', match.group(1).strip().upper())
            words = name.split()
            if len(words) >= 2 and len(name) > 8:
                return name.title()
    return None

# ---------- Extract SGPA ----------
def extract_sgpa_from_line(line):
    match = re.search(r'SGPA \s*[:\-]?\s*(\d+\.\d{1,2})', line, re.IGNORECASE)
    if match:
        return float(match.group(1))
    return None

# ---------- Extract Subject ----------
def extract_subject_from_line(line, code_to_name, detected_class):
    line = re.sub(r'\s+', ' ', line.strip())
    if line.startswith(('---', 'P ', '* ')):
        return None, None, None, 0, 0, 0  # Skip marks/garbage

    code, subject_name, head, grade, crd, gp, cp = None, None, 'TH', None, 0, 0, 0

    if detected_class == 'FE':
        end_pattern = r'(\d{2,3}( FFF)?)\s+(\d)\s+(\d)\s+([A-Z\+]+|F)\s+(\d+)\s+(\d+)$'
        end_match = re.search(end_pattern, line)
        if end_match:
            total = end_match.group(1)
            crd = int(end_match.group(3))
            ern = int(end_match.group(4))
            grade = end_match.group(5)
            gp = int(end_match.group(6))
            cp = int(end_match.group(7))
            front = line[:end_match.start()].strip()
            parts = re.split(r'\s+', front)
            code = parts[0]
            if not re.match(r'^[A-Z]{3}-[0-9]{3}[-A-Z0-9_]*$', code):
                return None, None, None, 0, 0, 0
            subject_name = code_to_name.get(code, re.sub(r'-', ' ', code).title())
    else:
        # Updated parsing for TE and similar (non-FE) formats
        parts = re.split(r'\s+', line.strip())
        if len(parts) < 9:
            return None, None, None, 0, 0, 0
        # Validate end fields (ORD P&R CP GP Grd Crd Tot%)
        if not (parts[-1] in ['---', 'ORD']):
            return None, None, None, 0, 0, 0
        if not (parts[-2] == '---'):
            return None, None, None, 0, 0, 0
        tot_str = parts[-7]
        crd_str = parts[-6]
        grade = parts[-5]
        gp_str = parts[-4]
        cp_str = parts[-3]
        if not re.match(r'^\d+$', cp_str) or not re.match(r'^\d+$', gp_str) or not re.match(r'^\d+$', crd_str):
            return None, None, None, 0, 0, 0
        if not re.match(r'^[A-Z]+(?:\+)?|F|AC|IC$', grade):
            return None, None, None, 0, 0, 0
        crd = int(crd_str)
        if not (0 < crd <= 6):
            return None, None, None, 0, 0, 0
        if not (re.match(r'^\d{2,3}$', tot_str) or tot_str in ['FF', 'AB', 'IC', 'AC']):
            return None, None, None, 0, 0, 0
        # Code
        code = parts[0] if re.match(r'^\d{6}[A-Z0-9]?$', parts[0]) else None
        if not code:
            return None, None, None, 0, 0, 0
        # Dynamically collect subject name until marks start
        subject_parts = []
        i = 1
        while i < len(parts) - 7:
            part = parts[i]
            if re.match(r'^\*?$', part) or re.match(r'^[A-Z0-9]+/\d{3}$', part) or part == '---':
                break
            subject_parts.append(part)
            i += 1
        subject_name = ' '.join(subject_parts).strip().title()
        if len(subject_name) < 5:
            return None, None, None, 0, 0, 0
        gp = int(gp_str)
        cp = int(cp_str)

    # Filter garbage
    if subject_name is None or (subject_name.startswith(('---', 'P ', '* ')) or len(subject_name) < 5 or re.match(r'^[P* \-\d]+$', subject_name)):
        return None, None, None, 0, 0, 0

    if not grade or crd == 0:
        return None, None, None, 0, 0, 0

    # Head determination
    name_upper = subject_name.upper()
    code_upper = code.upper() if code else ''
    if detected_class != 'FE':
        if re.search(r'/070', line):
            head = 'TH'
        elif re.search(r'\d{2}/025|\d{2}/050', line):
            head = 'PR'
        elif re.search(r'\d{2}/100', line) and not re.search(r'/030|/070', line):
            head = 'OR'
        else:
            head = 'TW'
        if 'INTERNSHIP' in name_upper or 'MOOC' in name_upper or 'ENVIRONMENTAL' in name_upper or 'SEMINAR' in name_upper or 'LEARN NEW SKILLS' in name_upper:
            head = ''
    else:
        if '_TW' in code_upper or 'TW' in name_upper or 'LABORATORY' in name_upper or 'PRACTICE' in name_upper:
            head = 'TW'
        elif '_PR' in code_upper or 'PRACTICAL' in name_upper:
            head = 'PR'
        elif '_OR' in code_upper or 'ORAL' in name_upper:
            head = 'OR'

    is_pass = grade not in ['F', 'FF', 'FFF', 'IC', 'AB']

    if DEBUG:
        print(f"  Parsed: {subject_name} ({head}) - Grade: {grade}, Crd: {crd}, CP: {cp}")

    return subject_name, head, is_pass, crd, gp, cp

# ---------- Analyze Gazette ----------
def analyze_gazette(full_text):
    code_to_name = build_subject_mapping(full_text)
    lines = [line.strip() for line in full_text.split('\n') if line.strip()]
    student_data = []
    subject_container = defaultdict(lambda: {'appeared': 0, 'passed': 0})
    current_name = None
    current_block = []
    detected_class = detect_class(full_text)
    seen_names = set()

    if DEBUG:
        print("\n=== SAMPLE LINES (for verification) ===")
        sample_start = max(0, len(lines)//4)
        for i, line in enumerate(lines[sample_start:sample_start+20]):
            print(f"~{sample_start+i+1}: {line[:100]}...")
        print("=== END SAMPLE ===\n")

    i = 0
    while i < len(lines):
        line = lines[i]

        name = extract_name_from_line(line)
        if name and name not in seen_names:
            seen_names.add(name)
            if current_name and len(current_block) >= 3:
                sum_crd = sum(c[3] for c in current_block)
                sum_cp = sum(c[5] for c in current_block)
                sgpa = round(sum_cp / sum_crd, 2) if sum_crd > 0 else 0
                student_data.append([current_name, sgpa])
                for sub_name, head, is_pass, _, _, _ in current_block:
                    key = f"{sub_name} ({head})"
                    subject_container[key]['appeared'] += 1
                    if is_pass:
                        subject_container[key]['passed'] += 1
            current_name = name
            current_block = []
            i += 1
            continue

        sgpa_explicit = extract_sgpa_from_line(line)
        if sgpa_explicit is not None and current_name:
            sgpa = sgpa_explicit
            student_data.append([current_name, sgpa])
            for sub_name, head, is_pass, _, _, _ in current_block:
                key = f"{sub_name} ({head})"
                subject_container[key]['appeared'] += 1
                if is_pass:
                    subject_container[key]['passed'] += 1
            current_block = []
            current_name = None
            i += 1
            continue

        if current_name and len(current_block) < 40:
            sub_name, head, is_pass, crd, gp, cp = extract_subject_from_line(line, code_to_name, detected_class)
            if sub_name and crd > 0:
                current_block.append((sub_name, head, is_pass, crd, gp, cp))
        i += 1

    # Last block
    if current_name and len(current_block) >= 3:
        sum_crd = sum(c[3] for c in current_block)
        sum_cp = sum(c[5] for c in current_block)
        sgpa = round(sum_cp / sum_crd, 2) if sum_crd > 0 else 0
        student_data.append([current_name, sgpa])
        for sub_name, head, is_pass, _, _, _ in current_block:
            key = f"{sub_name} ({head})"
            subject_container[key]['appeared'] += 1
            if is_pass:
                subject_container[key]['passed'] += 1

    df = pd.DataFrame(student_data, columns=["Name", "SGPA"])
    if not df.empty:
        df['SGPA'] = pd.to_numeric(df['SGPA'], errors='coerce').fillna(df['SGPA'].mean())

    df = df.drop_duplicates(subset=['Name']).reset_index(drop=True)

    return df, detected_class, subject_container

# ---------- Print Top Students ----------
def print_top_students(df, top_n=3):
    print(f"\n**Top {top_n} Students (by SGPA):**")
    top = df.sort_values(by="SGPA", ascending=False).head(top_n)
    for i, (_, row) in enumerate(top.iterrows(), start=1):
        print(f"{i}. {row['Name']} - SGPA: {row['SGPA']:.2f}")

# ---------- Print Subject-Wise Performance ----------
def print_subject_performance(df, subject_container):
    print("\n**Subject-Wise Performance:**")
    print("{:<3} {:<35} {:<8} {:<8} {:<6} {:<6} {:<8}".format(
        "Sr.", "Subject Name", "TH/PR", "Appeared", "Failed", "Passed", "% Passing"))
    print("-" * 80)

    total_students = len(df)
    sorted_items = sorted(subject_container.items(), key=lambda x: x[1]['appeared'], reverse=True)
    sr = 1
    for key, stats in sorted_items:
        appeared = stats['appeared']
        if appeared < 3 or appeared > total_students * 1.1:
            continue
        subject_name, head_str = key.rsplit(" (", 1) if " (" in key else (key, "TH")
        head = head_str.rstrip(")") if " (" in key else head_str
        passed = stats['passed']
        failed = appeared - passed
        percent = round((passed / appeared) * 100, 2) if appeared > 0 else 0
        print("{:<3} {:<35} {:<8} {:<8} {:<6} {:<6} {:<8.2f}".format(
            sr, subject_name[:34], head, appeared, failed, passed, percent))
        sr += 1
    if sr == 1:
        print("No valid subjects found (all skipped as garbage).")

# ---------- MAIN ----------
if __name__ == "__main__":
    input_pdf = "infe.pdf"  # Change to "infe.pdf" for the other gazette

    try:
        with pdfplumber.open(input_pdf) as pdf:
            full_text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    full_text += page_text + "\n"
            if not full_text:
                print("❌ No text extracted from PDF.")
                exit()

        df, detected_class, subject_container = analyze_gazette(full_text)

        if df.empty:
            print("❌ No students found.")
            exit()

        print(f"Class: {detected_class}")
        print(f"Total Students: {len(df)}")

        print_top_students(df)

        print_subject_performance(df, subject_container)

    except FileNotFoundError:
        print(f"❌ PDF file '{input_pdf}' not found.")
    except Exception as e:
        print(f"❌ Error: {str(e)}")