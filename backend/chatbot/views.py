from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from chatbot.serializers import ChatbotAskSerializer
# from chatbot.utils.similarity import similarity_search
# from chatbot.services.gemini import generate_answer


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


        # 2️⃣ Generate Gemini answer
        answer = generate_answer(question, chunk_texts)

        return Response(
            {
                "question": question,
                "answer": answer,
                "sources": [
                    {
                        "document": chunk.document.file_id,
                        "chunk_index": chunk.chunk_index,
                        "context": chunk.context,
                    }
                    for chunk in chunks
                ],
            },
            status=status.HTTP_200_OK,
        )