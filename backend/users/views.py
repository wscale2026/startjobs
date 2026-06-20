from rest_framework import viewsets, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status as drf_status
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .models import User, EmployerProfile, CandidateProfile, Skill, Language, Experience
import math

def haversine(lat1, lon1, lat2, lon2):
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None: return float('inf')
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        from .models import SiteSettings
        s = SiteSettings.get_settings()
        
        is_admin = self.user.is_staff or self.user.is_superuser or self.user.role in ['admin', 'super_admin']
        
        if s.maintenance_mode and not is_admin:
            raise PermissionDenied("La plateforme est actuellement en maintenance.")
            
        if s.require_email_verification and not self.user.is_email_verified and not is_admin:
            raise PermissionDenied("Veuillez vérifier votre adresse email pour vous connecter.")
            
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

from .serializers import (
    UserSerializer, EmployerProfileSerializer, CandidateProfileSerializer,
    SkillSerializer, LanguageSerializer, ExperienceSerializer, RegisterSerializer, UserMeSerializer
)

class UserProfileView(APIView):
    """Universal endpoint: given a user ID, return the right profile (candidate or employer)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, user_id, *args, **kwargs):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'Utilisateur introuvable.'}, status=drf_status.HTTP_404_NOT_FOUND)

        if hasattr(user, 'candidate_profile'):
            serializer = CandidateProfileSerializer(user.candidate_profile, context={'request': request})
            return Response({'profile_type': 'candidate', 'data': serializer.data})
        elif hasattr(user, 'employer_profile'):
            serializer = EmployerProfileSerializer(user.employer_profile, context={'request': request})
            return Response({'profile_type': 'employer', 'data': serializer.data})
        else:
            return Response({'detail': 'Profil utilisateur non trouvé.'}, status=drf_status.HTTP_404_NOT_FOUND)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        from .models import SiteSettings
        s = SiteSettings.get_settings()
        if not s.allow_registrations:
            # Allow admins to be created by other admins even if registrations are closed
            # However, RegisterView is for public registration usually. 
            # If an admin is creating a user, they should use a separate authenticated endpoint.
            # But since we use RegisterView for both, let's check if the requester is an admin.
            if not request.user.is_authenticated or not request.user.is_staff:
                return Response({'detail': 'Les inscriptions sont temporairement désactivées.'}, status=drf_status.HTTP_403_FORBIDDEN)
        
        response = super().create(request, *args, **kwargs)
        
        if s.require_email_verification:
            user = User.objects.get(username=response.data.get('username'))
            send_verification_email(user, s)
                
        return response
def send_verification_email(user, site_settings):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    # Generate and store token in DB — immune to last_login / password changes
    token = user.generate_verification_token()
    frontend_base = settings.FRONTEND_URL.rstrip('/') if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:5173'
    verify_url = f"{frontend_base}/verify-email/{uid}/{token}"
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                background-color: #f4f7f6;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                overflow: hidden;
            }}
            .header {{
                background-color: #0b1120;
                padding: 40px 20px;
                text-align: center;
            }}
            .content {{
                padding: 40px 40px;
                color: #333333;
                line-height: 1.6;
            }}
            .content h2 {{
                color: #0b1120;
                font-size: 22px;
                margin-top: 0;
                font-weight: 700;
            }}
            .button-container {{
                text-align: center;
                margin: 40px 0;
            }}
            .button {{
                background-color: #2563eb;
                color: #ffffff !important;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                display: inline-block;
                transition: background-color 0.2s;
            }}
            .footer {{
                background-color: #f8f9fa;
                padding: 24px;
                text-align: center;
                color: #888888;
                font-size: 13px;
                border-top: 1px solid #eeeeee;
            }}
            .logo-text {{
                font-size: 32px;
                font-weight: 900;
                color: white;
                text-decoration: none;
                letter-spacing: -0.5px;
            }}
            .accent {{
                color: #3b82f6;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-text">Start<span class="accent">Jobs</span></div>
            </div>
            <div class="content">
                <h2>Bienvenue, {user.first_name or user.username} !</h2>
                <p>Merci d'avoir rejoint <strong>{site_settings.site_name}</strong>. Pour finaliser la création de votre compte et accéder à toutes nos offres et fonctionnalités, veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous :</p>
                
                <div class="button-container">
                    <a href="{verify_url}" class="button">Vérifier mon e-mail</a>
                </div>
                
                <p style="font-size: 14px; color: #666;">Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant directement dans votre navigateur :</p>
                <p style="word-break: break-all; color: #2563eb; font-size: 14px; background: #f0fdf4; padding: 12px; border-radius: 6px;">{verify_url}</p>
                
                <p style="margin-top: 30px;">À très bientôt sur {site_settings.site_name} !</p>
            </div>
            <div class="footer">
                <p>Vous n'avez pas créé de compte ? Vous pouvez ignorer cet e-mail en toute sécurité.</p>
                <p>&copy; 2024 {site_settings.site_name}. Tous droits réservés.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        send_mail(
            subject=f"Vérifiez votre adresse email - {site_settings.site_name}",
            message=f"Bonjour {user.first_name or user.username},\n\nMerci de vous être inscrit sur {site_settings.site_name}.\n\nVeuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email:\n{verify_url}\n\nL'équipe {site_settings.site_name}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
            html_message=html_message
        )
    except Exception as e:
        pass # If mail fails, we still return the user. The user can request another one later if needed.

class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token, *args, **kwargs):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'detail': 'Lien de vérification invalide.'}, status=drf_status.HTTP_400_BAD_REQUEST)

        if user.is_email_verified:
            return Response({'detail': 'Ce compte est déjà vérifié.'}, status=drf_status.HTTP_200_OK)

        if not user.check_verification_token(token):
            return Response({'detail': 'Le lien de vérification a expiré. Veuillez en demander un nouveau.'}, status=drf_status.HTTP_400_BAD_REQUEST)

        user.is_email_verified = True
        user.email_verification_token = None  # Invalidate token after use
        user.email_token_created_at = None
        user.save(update_fields=['is_email_verified', 'email_verification_token', 'email_token_created_at'])
        return Response({'detail': 'Adresse email vérifiée avec succès.'}, status=drf_status.HTTP_200_OK)

class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        uidb64 = request.data.get('uid')
        identifier = request.data.get('identifier')
        
        if not uidb64 and not identifier:
            return Response({'detail': 'UID ou identifiant manquant.'}, status=drf_status.HTTP_400_BAD_REQUEST)
        
        user = None
        if uidb64:
            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                pass
        elif identifier:
            from django.db.models import Q
            user = User.objects.filter(Q(username=identifier) | Q(email=identifier)).first()
            
        if not user:
            return Response({'detail': 'Utilisateur introuvable.'}, status=drf_status.HTTP_404_NOT_FOUND)
        
        if user.is_email_verified:
            return Response({'detail': 'Ce compte est déjà vérifié.'}, status=drf_status.HTTP_400_BAD_REQUEST)
            
        from .models import SiteSettings
        s = SiteSettings.get_settings()
        
        send_verification_email(user, s)
        
        return Response({'detail': 'Un nouveau lien de vérification a été envoyé à votre adresse email.'}, status=drf_status.HTTP_200_OK)

class UserMeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserMeSerializer

    def get_object(self):
        return self.request.user

from .permissions import IsOwnerOrAdmin

from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_contacts(request):
    query = request.GET.get('search', '').lower()
    users = User.objects.exclude(username='admin').exclude(id=request.user.id)
    if query:
        users = users.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(username__icontains=query)
        )
    
    results = []
    # limit to 50 for performance
    for u in users[:50]:
        pic = None
        if hasattr(u, 'candidate_profile') and u.candidate_profile.photo:
            pic = request.build_absolute_uri(u.candidate_profile.photo.url)
        elif hasattr(u, 'employer_profile') and u.employer_profile.logo:
            pic = request.build_absolute_uri(u.employer_profile.logo.url)

        results.append({
            'id': u.id,
            'username': u.username,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'role': u.role,
            'profile_pic': pic,
        })
    return Response(results)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        # Ne pas renvoyer le superadmin racine 'admin' pour des raisons de sécurité et d'UI
        return User.objects.exclude(username='admin')

class EmployerProfileViewSet(viewsets.ModelViewSet):
    queryset = EmployerProfile.objects.all()
    serializer_class = EmployerProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]
    lookup_field = 'user__id'

class CandidateProfileViewSet(viewsets.ModelViewSet):
    queryset = CandidateProfile.objects.all()
    serializer_class = CandidateProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]
    lookup_field = 'user__id'

    def get_queryset(self):
        queryset = CandidateProfile.objects.all()
        # Filtrage géographique pour les employeurs
        if self.request.user.is_authenticated and hasattr(self.request.user, 'employer_profile'):
            emp = self.request.user.employer_profile
            if emp.latitude and emp.longitude:
                filtered_ids = []
                for cand in queryset:
                    if cand.latitude and cand.longitude:
                        max_dist = cand.distance_max or 10.0
                        dist = haversine(emp.latitude, emp.longitude, cand.latitude, cand.longitude)
                        if dist <= max_dist:
                            filtered_ids.append(cand.id)
                    else:
                        # Fallback basé sur le quartier
                        if cand.neighborhood and emp.neighborhood and cand.neighborhood.lower() == emp.neighborhood.lower():
                            filtered_ids.append(cand.id)
                queryset = queryset.filter(id__in=filtered_ids)
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment profile_views only when a different user views the profile
        if not request.user.is_authenticated or request.user != instance.user:
            CandidateProfile.objects.filter(pk=instance.pk).update(
                profile_views=instance.profile_views + 1
            )
            instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        import json
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Handle Many-to-Many fields
        skills_data = request.data.getlist('skills') if hasattr(request.data, 'getlist') else request.data.get('skills', [])
        if not isinstance(skills_data, list):
            skills_data = [skills_data]
        if skills_data:
            instance.skills.clear()
            for s_name in skills_data:
                if s_name:
                    skill_obj, _ = Skill.objects.get_or_create(name=s_name.strip())
                    instance.skills.add(skill_obj)

        languages_data = request.data.getlist('languages') if hasattr(request.data, 'getlist') else request.data.get('languages', [])
        if not isinstance(languages_data, list):
            languages_data = [languages_data]
        if languages_data:
            instance.languages.clear()
            for l_name in languages_data:
                if l_name:
                    lang_obj, _ = Language.objects.get_or_create(name=l_name.strip())
                    instance.languages.add(lang_obj)

        experiences_data = request.data.getlist('experiences') if hasattr(request.data, 'getlist') else request.data.get('experiences', [])
        if not isinstance(experiences_data, list):
            experiences_data = [experiences_data]
        if experiences_data:
            instance.experiences.all().delete()
            for exp_str in experiences_data:
                if exp_str:
                    try:
                        exp = json.loads(exp_str) if isinstance(exp_str, str) else exp_str
                        Experience.objects.create(
                            candidate=instance,
                            title=exp.get('titre', ''),
                            employer_name=exp.get('employeur', ''),
                            date=exp.get('annee', ''),
                            exp_type='declared'
                        )
                    except Exception:
                        pass

        instance.refresh_from_db()
        return Response(self.get_serializer(instance).data)

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]

class LanguageViewSet(viewsets.ModelViewSet):
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer
    permission_classes = [permissions.AllowAny]

class ExperienceViewSet(viewsets.ModelViewSet):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [permissions.AllowAny]

class PublicSettingsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from .models import SiteSettings
        s = SiteSettings.get_settings()
        return Response({
            'site_name': s.site_name,
            'logo': request.build_absolute_uri(s.logo.url) if s.logo else None,
            'allow_registrations': s.allow_registrations,
            'maintenance_mode': s.maintenance_mode,
            'require_email_verification': s.require_email_verification,
            'seo_title': s.seo_title,
            'seo_description': s.seo_description,
        })
