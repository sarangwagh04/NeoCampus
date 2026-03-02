from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from chatbot.utils.similarity import similarity_search
# from chatbot.services.gemini import generate_answer #for reduce runservertime
from rest_framework.permissions import IsAuthenticated
from chatbot.models import Chunk
from chatbot.serializers import (
    ChatbotAskSerializer,
    CollegeUpdateSerializer,
)



class ChatbotAskView(APIView):
    """
    POST /api/chatbot/ask/
    """

    def post(self, request):
        serializer = ChatbotAskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        question = serializer.validated_data["question"]
        context = serializer.validated_data.get("context")
        top_k = serializer.validated_data["top_k"]

        # ✅ If context is provided → do similarity search
        if context:
            chunks = similarity_search(
                query=question,
                top_k=top_k,
                context=context,
            )
            chunk_texts = [chunk.content for chunk in chunks]
        else:
            # ✅ "Other" selected → skip retrieval
            chunks = []
            chunk_texts = []


        # ===================== NEW SECTION =====================
        # Switch Gemini mode if College Update selected
        # ========================================================

        if context == "COLLEGE_UPDATE":
            answer = generate_answer(
                question,
                chunk_texts,
                mode="update",   # 🔥 special prompt
            )
        else:
            answer = generate_answer(
                question,
                chunk_texts,
                mode="academic",
            )

        return Response(
            {
                "question": question,
                "answer": answer,
                "sources": [
                    {
                        "document": chunk.document.file_id if chunk.document else None,
                        "chunk_index": chunk.chunk_index,
                        "context": chunk.context,
                    }
                    for chunk in chunks
                ],
            },
            status=status.HTTP_200_OK,
        )
    

# ===================== NEW VIEW =====================
# Staff can post college updates
# ====================================================

class CollegeUpdatePostView(APIView):
    """
    POST /api/chatbot/post-update/
    Only staff should access this (add role check if needed)
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):

        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"detail": "Only staff members can post college updates."},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        last_chunk = Chunk.objects.filter(
            document__isnull=True,
            context="COLLEGE_UPDATE"
        ).order_by("-chunk_index").first()

        next_index = last_chunk.chunk_index + 1 if last_chunk else 1

        serializer = CollegeUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        content = serializer.validated_data["content"]

        # Create chunk with special context
        chunk = Chunk.objects.create(
            document=None,  # Manual entry
            chunk_index=next_index,  # Single update entry
            content=content,
            context="COLLEGE_UPDATE",  # IMPORTANT
        )

        return Response(
            {
                "message": "College update posted successfully.",
                "chunk_id": chunk.id,
            },
            status=status.HTTP_201_CREATED,
        )