from rest_framework.routers import DefaultRouter
from .views import DocumentSessionViewSet

router = DefaultRouter()
router.register('document-sessions', DocumentSessionViewSet)
urlpatterns = router.urls