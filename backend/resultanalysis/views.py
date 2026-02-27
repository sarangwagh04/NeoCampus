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
