from rest_framework import viewsets
from .models import GeneratedDocument
from .serializers import GeneratedDocumentSerializer
from django.core.files.base import ContentFile
from rest_framework.decorators import action
from rest_framework.response import Response
from ExportArtifact.models import ExportArtifact
from ExportArtifact.services import convert_to_html, convert_to_pdf, convert_to_docx, compute_hash

class GeneratedDocumentViewSet(viewsets.ModelViewSet):
    queryset = GeneratedDocument.objects.all()
    serializer_class = GeneratedDocumentSerializer

    @action(detail=True, methods=['post'])
    def export(self, request, pk=None):
        document = self.get_object()
        fmt = request.query_params.get('format')

        if fmt not in ('html', 'pdf', 'docx'):
            return Response({"error": "format must be one of html, pdf, docx"}, status=400)

        current_hash = compute_hash(document.content)

        existing = ExportArtifact.objects.filter(document=document, format=fmt).first()
        if existing and existing.content_hash == current_hash and existing.status == 'ready':
            return Response({"id": str(existing.id), "file": existing.file.url, "status": "ready", "reused": True})

        if fmt == 'html':
            output_bytes = convert_to_html(document.content).encode()
            filename = f"{document.id}.html"
        elif fmt == 'pdf':
            output_bytes = convert_to_pdf(document.content)
            filename = f"{document.id}.pdf"
        else:
            output_bytes = convert_to_docx(document.content)
            filename = f"{document.id}.docx"

        artifact, _ = ExportArtifact.objects.update_or_create(
            document=document, format=fmt,
            defaults={"content_hash": current_hash, "status": "ready"}
        )
        artifact.file.save(filename, ContentFile(output_bytes), save=True)

        return Response({"id": str(artifact.id), "file": artifact.file.url, "status": "ready", "reused": False})