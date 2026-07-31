from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import DocumentSession
from .serializers import DocumentSessionSerializer
from GeneratedSection.services import polish_section_answers
from Sections.models import Section
from Answers.models import Answer  
from GeneratedDocument.models import GeneratedDocument
from GeneratedSection.models import GeneratedSection 

class DocumentSessionViewSet(viewsets.ModelViewSet):
    queryset = DocumentSession.objects.all()
    serializer_class = DocumentSessionSerializer

    @action(detail=True, methods=['get'])
    def next_section(self, request, pk=None):
        session = self.get_object()

        def get_all_questions_for_section(section):
            questions = list(section.questions.filter(is_required=True))
            for sub in section.subsections.all():
                questions += get_all_questions_for_section(sub)
            return questions

        top_level_sections = Section.objects.filter(
            document_type__name=session.document_type,
            parent=None
        ).order_by('order')

        for section in top_level_sections:
            all_questions = get_all_questions_for_section(section)
            answered_ids = Answer.objects.filter(
                session=session, question__in=all_questions
            ).values_list('question_id', flat=True)
            unanswered = [q for q in all_questions if q.id not in answered_ids]

            if unanswered:
                return Response({
                    "section": {"number": section.number, "name": section.name},
                    "questions": [
                        {"id": str(q.id), "text": q.text, "is_required": q.is_required}
                        for q in unanswered
                    ]
                })
            else:
                # This section is fully answered — trigger background polishing for it,
                # unless it's already been polished (avoids re-polishing on every call).
                already_ready = GeneratedSection.objects.filter(
                    session=session, section=section, status='ready'
                ).exists()
                if not already_ready:
                    polish_section_answers(session, section)

        session.status = "answers_complete"
        session.save()
        return Response({"message": "All sections complete.", "status": session.status})

    @action(detail=True, methods=['post'])
    def repolish_section(self, request, pk=None):
        session = self.get_object()
        section_id = request.query_params.get('section')
        if not section_id:
            return Response({"error": "section query param is required"}, status=400)

        try:
            section = Section.objects.get(id=section_id, document_type__name=session.document_type)
        except Section.DoesNotExist:
            return Response({"error": "section not found for this session's document type"}, status=404)

        gs = polish_section_answers(session, section)
        return Response({"id": str(gs.id), "section": str(section.id), "status": gs.status})

    @action(detail=True, methods=['post', 'delete'])
    def diagram(self, request, pk=None):
        session = self.get_object()
        section_id = request.data.get('section') if request.method == 'POST' else request.query_params.get('section')
        if not section_id:
            return Response({"error": "section is required"}, status=400)

        try:
            section = Section.objects.get(id=section_id, document_type__name=session.document_type)
        except Section.DoesNotExist:
            return Response({"error": "section not found for this session's document type"}, status=404)

        data_url = '' if request.method == 'DELETE' else request.data.get('data_url', '')
        file_name = '' if request.method == 'DELETE' else request.data.get('file_name', '')
        gs, _ = GeneratedSection.objects.update_or_create(
            session=session, section=section,
            defaults={'diagram_data_url': data_url, 'diagram_file_name': file_name},
        )
        return Response({"section": str(section.id), "diagram_file_name": gs.diagram_file_name})

    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        session = self.get_object()
        selected_ids = request.data.get('selected_section_ids')

        def get_ordered_ready_sections(section):
            result = []
            if selected_ids is None or str(section.id) in selected_ids:
                gs = GeneratedSection.objects.filter(session=session, section=section, status='ready').first()
                if gs:
                    result.append(gs)
            for sub in section.subsections.all().order_by('order'):
                result += get_ordered_ready_sections(sub)
            return result

        top_level_sections = Section.objects.filter(
            document_type__name=session.document_type,
            parent=None
        ).order_by('order')

        all_ready_sections = []
        for section in top_level_sections:
            all_ready_sections += get_ordered_ready_sections(section)

        if not all_ready_sections:
            return Response({"message": "No polished sections available yet."}, status=400)

        parts = []
        for gs in all_ready_sections:
            parts.append(gs.content)
            if gs.diagram_data_url:
                parts.append(f"![{gs.diagram_file_name}]({gs.diagram_data_url})")
        combined_markdown = "\n\n".join(parts)

        doc, _ = GeneratedDocument.objects.update_or_create(
            session=session,
            defaults={"content": combined_markdown, "status": "ready"}
        )

        return Response({
            "id": str(doc.id),
            "status": doc.status,
            "content": doc.content
        })