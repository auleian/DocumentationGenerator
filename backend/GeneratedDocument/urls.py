from rest_framework.routers import DefaultRouter
from .views import GeneratedDocumentViewSet

router = DefaultRouter()
router.register('generated-documents', GeneratedDocumentViewSet, basename='generateddocument')
urlpatterns = router.urls