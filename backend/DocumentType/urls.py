from rest_framework.routers import DefaultRouter
from .views import DocumentTypeViewSet

router = DefaultRouter()
router.register('document-types', DocumentTypeViewSet, basename='documenttype')
urlpatterns = router.urls