from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    PaymentLinkViewSet, PaymentSettingsViewSet,
    WaitListViewSet,
    EventViewSet,
    verify_token,
    TicketViewSet,
    TicketTransferViewSet
)


router = DefaultRouter()
router.register(r'payment-settings', PaymentSettingsViewSet, basename='payment-settings')
router.register(r'payment-links', PaymentLinkViewSet, basename='payment-links')
router.register(r'waitlist', WaitListViewSet, basename='waitlist')
router.register(r'events', EventViewSet)
router.register(r'tickets', TicketViewSet)
router.register(r'transfers', TicketTransferViewSet, basename='transfer')




urlpatterns = [
    path('api/', include(router.urls)),
#     path('api/privy/token/', PrivyTokenView.as_view(), name='token-access'),
    path('<slug:slug>/', EventViewSet.as_view({'get': 'retrieve'}), name='event-short-url'),
    path('api/events/<slug:slug>/register/', 
         EventViewSet.as_view({'post': 'register'}), 
         name='event-register'),
#     path('api/verify-token/', views.VerifyTokenView.as_view(), name='verify_token'),
#     path('api/auth/verify/', views.verify_privy_token, name='verify_privy_token'),
    path('api/auth/verify', verify_token, name='verify-token'),

    path('api/tickets/<uuid:ticket_id>/transfer/', 
         TicketViewSet.as_view({'post': 'transfer'}), 
         name='ticket-transfer'),
    path('api/transfers/<uuid:transfer_key>/accept/', 
         TicketTransferViewSet.as_view({'post': 'accept'}), 
         name='accept-transfer'),
]