"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from users.views import UserViewSet, EmployerProfileViewSet, CandidateProfileViewSet, SkillViewSet, LanguageViewSet, ExperienceViewSet, RegisterView, UserMeView, UserProfileView, PublicSettingsView, CustomTokenObtainPairView, VerifyEmailView, ResendVerificationView, search_contacts
from users.password_views import PasswordResetRequestView, PasswordResetConfirmView
from users.admin_views import AdminDashboardView, AdminMailingView, AdminSettingsView, AdminSendCredentialsView, AdminUpdateUserView
from jobs.views import SectorViewSet, NeighborhoodViewSet, JobOfferViewSet, ApplicationViewSet
from interactions.views import ConversationViewSet, MessageViewSet, ReviewViewSet
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'employers', EmployerProfileViewSet)
router.register(r'candidates', CandidateProfileViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'languages', LanguageViewSet)
router.register(r'experiences', ExperienceViewSet)

router.register(r'sectors', SectorViewSet)
router.register(r'neighborhoods', NeighborhoodViewSet)
router.register(r'offers', JobOfferViewSet)
router.register(r'applications', ApplicationViewSet)

router.register(r'conversations', ConversationViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'reviews', ReviewViewSet)

# Customize Django admin interface
admin.site.site_header = "StartJobs Administration"
admin.site.site_title = "StartJobs Admin Portal"
admin.site.index_title = "Bienvenue sur l'administration de StartJobs"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/verify-email/<str:uidb64>/<str:token>/', VerifyEmailView.as_view(), name='verify_email'),
    path('api/resend-verification/', ResendVerificationView.as_view(), name='resend_verification'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/users/me/', UserMeView.as_view(), name='user_me'),
    path('api/search-contacts/', search_contacts, name='search_contacts'),
    path('api/users/profile/<str:user_id>/', UserProfileView.as_view(), name='user_profile'),
    path('api/password_reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('api/password_reset/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('api/admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('api/admin/mailing/', AdminMailingView.as_view(), name='admin_mailing'),
    path('api/admin/settings/', AdminSettingsView.as_view(), name='admin_settings'),
    path('api/admin/send-credentials/', AdminSendCredentialsView.as_view(), name='admin_send_credentials'),
    path('api/admin/update-user/<uuid:user_id>/', AdminUpdateUserView.as_view(), name='admin_update_user'),
    path('api/public-settings/', PublicSettingsView.as_view(), name='public_settings'),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
