from rest_framework import viewsets
from .models import Section
from .serializers import SectionSerializer

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class =SectionSerializer