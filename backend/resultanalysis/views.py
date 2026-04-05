import os
import tempfile

from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework import status

from .services import analyze_pdf_file
from .serializers import (
    ResultAnalysisUploadSerializer,
    ResultAnalysisSerializer,
)


class ResultAnalysisAPIView(GenericAPIView):
    """
    POST /api/result-analysis/analyze/
    Upload PDF and get result analysis
    """

    serializer_class = ResultAnalysisUploadSerializer   # 🔥 THIS IS THE KEY
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]   # temporary for testing

    def post(self, request):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        pdf = serializer.validated_data["file"]

        # Save PDF to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            for chunk in pdf.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        try:
            result = analyze_pdf_file(tmp_path)

            response_serializer = ResultAnalysisSerializer({
                "class_name": result["class"],
                "total_students": result["total_students"],
                "toppers": result["toppers"],
                "subjects": result["subjects"],
            })

            return Response(
                response_serializer.data,
                status=status.HTTP_200_OK
            )

        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)



from rest_framework.decorators import api_view
from django.http import HttpResponse
from rest_framework.response import Response

from .ai_processor import (
    pdf_first_page_to_image,
    extract_csv_from_image,
    csv_to_excel_file
)


@api_view(["POST"])
def ai_tryout_analysis(request):
    pdf_file = request.FILES.get("file")

    if not pdf_file:
        return Response({"error": "No file uploaded"}, status=400)

    try:
        pdf_bytes = pdf_file.read()

        # Step 1
        image_bytes = pdf_first_page_to_image(pdf_bytes)

        # Step 2
        csv_text = extract_csv_from_image(image_bytes)

        # Step 3
        excel_file = csv_to_excel_file(csv_text)

        response = HttpResponse(
            excel_file,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = (
            'attachment; filename="AI_Result_Analysis.xlsx"'
        )

        return response

    except Exception as e:
        return Response({"error": str(e)}, status=500)
    





#============================================
# AI FULL PROCESSOR VIEW
#============================================

from .ai_full_processor import process_pdf_with_gemini


@api_view(["POST"])
def ai_extract_analysis(request):

    pdf_file = request.FILES.get("file")
    column_names = request.data.get("column_names", "")


    if not pdf_file:
        return Response(
            {"error": "No file uploaded"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:

        pdf_bytes = pdf_file.read()
        result = process_pdf_with_gemini(pdf_bytes, column_names)

        return Response(
            {
                "columns": result["columns"],
                "rows": result["rows"],
                "total_rows": result["total_rows"],
                "processed_pages": result["processed_pages"],
                "warning": result["warning"],
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:

        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )