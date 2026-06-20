from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from django.db.models.functions import TruncDate

from .models import User, EmployerProfile, CandidateProfile
from jobs.models import JobOffer, Application

class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_employers = EmployerProfile.objects.count()
        total_candidates = CandidateProfile.objects.count()
        total_offers = JobOffer.objects.count()
        total_applications = Application.objects.count()

        # Users registered per day in the last 7 days
        seven_days_ago = timezone.now() - timedelta(days=7)
        registrations_by_day = User.objects.filter(date_joined__gte=seven_days_ago) \
            .annotate(date=TruncDate('date_joined')) \
            .values('date') \
            .annotate(count=Count('id')) \
            .order_by('date')

        # Format chart data
        chart_data = []
        for reg in registrations_by_day:
            chart_data.append({
                "date": reg["date"].strftime("%d/%m") if reg["date"] else "",
                "inscrits": reg["count"]
            })

        # Last 5 users
        recent_users_qs = User.objects.order_by('-date_joined')[:5]
        recent_users = []
        for u in recent_users_qs:
            role = 'admin' if u.is_staff else ('employer' if hasattr(u, 'employer_profile') else 'candidate')
            recent_users.append({
                "id": str(u.id),
                "nom": f"{u.first_name} {u.last_name}".strip() or u.username,
                "role": role,
                "email": u.email,
                "statut": "Actif" if u.is_active else "Inactif",
                "date": u.date_joined.strftime("%d %b %Y"),
                "avatar": u.username[0].upper() if u.username else "U"
            })

        return Response({
            "total_employers": total_employers,
            "total_candidates": total_candidates,
            "total_offers": total_offers,
            "total_applications": total_applications,
            "chart_data": chart_data,
            "recent_users": recent_users
        })


class AdminMailingView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        from django.core.mail import send_mail
        from django.conf import settings as django_settings

        audience = request.data.get('audience', 'all')  # 'all', 'candidates', 'employers'
        subject = request.data.get('subject', '')
        content = request.data.get('content', '')

        search_user = request.data.get('searchUser', '').strip()

        if not subject or not content:
            return Response({'error': 'Sujet et contenu sont requis.'}, status=400)

        # Get recipients based on audience
        if audience == 'candidates':
            users = User.objects.filter(role='candidate', is_active=True)
        elif audience == 'employers':
            users = User.objects.filter(role='employer', is_active=True)
        elif audience == 'specific' and search_user:
            from django.db.models import Q
            users = User.objects.filter(
                Q(email__icontains=search_user) | 
                Q(username__icontains=search_user) | 
                Q(first_name__icontains=search_user) | 
                Q(last_name__icontains=search_user),
                is_active=True
            ).distinct()
        else:
            users = User.objects.filter(is_active=True)

        users_to_mail = [u for u in users if u.email]
        count = len(users_to_mail)

        print(f"\n{'='*60}")
        print(f"MAILING CAMPAIGN — Audience: {audience} — Recipients: {count}")
        print(f"Subject: {subject}")
        print(f"Content preview: {content[:200]}")
        print(f"{'='*60}\n")

        # Send bulk emails individually to parse dynamic variables
        success_count = 0
        for u in users_to_mail:
            try:
                # Resolve dynamic variables
                personalized_content = content
                
                nom_complet = f"{u.first_name} {u.last_name}".strip() or u.username
                phone = ""
                ville = ""
                quartier = ""
                entreprise = ""
                titre_profil = ""
                generated_pwd = ""
                
                if hasattr(u, 'candidate_profile'):
                    phone = u.candidate_profile.phone or ""
                    quartier = u.candidate_profile.neighborhood or ""
                    titre_profil = u.candidate_profile.profile_type or ""
                    generated_pwd = getattr(u.candidate_profile, 'generated_password', '')
                elif hasattr(u, 'employer_profile'):
                    phone = u.employer_profile.phone or ""
                    ville = u.employer_profile.city or ""
                    quartier = u.employer_profile.neighborhood or ""
                    entreprise = u.employer_profile.company_name or ""
                    
                personalized_content = personalized_content.replace('{{nom}}', nom_complet)
                personalized_content = personalized_content.replace('{{prenom}}', u.first_name)
                personalized_content = personalized_content.replace('{{nom_famille}}', u.last_name)
                personalized_content = personalized_content.replace('{{username}}', u.username)
                personalized_content = personalized_content.replace('{{email}}', u.email)
                personalized_content = personalized_content.replace('{{password}}', generated_pwd or '******')
                personalized_content = personalized_content.replace('{{telephone}}', phone)
                personalized_content = personalized_content.replace('{{ville}}', ville)
                personalized_content = personalized_content.replace('{{quartier}}', quartier)
                personalized_content = personalized_content.replace('{{entreprise}}', entreprise)
                personalized_content = personalized_content.replace('{{titre_profil}}', titre_profil)

                send_mail(
                    subject=subject,
                    message=personalized_content, # Here we could use html_message=personalized_content if we want to send HTML
                    from_email=django_settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[u.email],
                    fail_silently=False,
                    html_message=personalized_content if '<' in personalized_content and '>' in personalized_content else None
                )
                success_count += 1
            except Exception as e:
                print(f"Erreur lors de l'envoi de l'email à {u.email}: {str(e)}")

        return Response({'message': f'Campagne envoyée à {success_count} destinataires.', 'count': success_count})

    def get(self, request):
        """Get audience counts"""
        return Response({
            'all': User.objects.filter(is_active=True).count(),
            'candidates': User.objects.filter(role='candidate', is_active=True).count(),
            'employers': User.objects.filter(role='employer', is_active=True).count(),
        })


class AdminSettingsView(APIView):
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        from .models import SiteSettings
        s = SiteSettings.get_settings()
        return Response({
            'site_name': s.site_name,
            'contact_email': s.contact_email,
            'maintenance_mode': s.maintenance_mode,
            'allow_registrations': s.allow_registrations,
            'require_email_verification': s.require_email_verification,
            'seo_title': s.seo_title,
            'seo_description': s.seo_description,
            'logo': request.build_absolute_uri(s.logo.url) if s.logo else None,
        })

    def put(self, request):
        from .models import SiteSettings
        s = SiteSettings.get_settings()
        data = request.data
        s.site_name = data.get('site_name', s.site_name)
        s.contact_email = data.get('contact_email', s.contact_email)
        
        # Convert string booleans if using FormData
        if 'maintenance_mode' in data:
            s.maintenance_mode = str(data['maintenance_mode']).lower() == 'true'
        if 'allow_registrations' in data:
            s.allow_registrations = str(data['allow_registrations']).lower() == 'true'
        if 'require_email_verification' in data:
            s.require_email_verification = str(data['require_email_verification']).lower() == 'true'
            
        if 'logo' in request.FILES:
            s.logo = request.FILES['logo']
            
        s.save()
        return Response({'message': 'Paramètres sauvegardés avec succès.', 'logo': request.build_absolute_uri(s.logo.url) if s.logo else None})

class AdminSendCredentialsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings as django_settings
        from django.template.loader import render_to_string
        from django.utils.html import strip_tags
        from users.models import User

        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'ID utilisateur requis.'}, status=400)
            
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable.'}, status=404)
            
        # Get generated password from candidate or admin profile
        password = None
        if hasattr(user, 'candidate_profile') and user.candidate_profile.generated_password:
            password = user.candidate_profile.generated_password
        elif hasattr(user, 'admin_profile') and user.admin_profile.generated_password:
            password = user.admin_profile.generated_password
        
        if not password:
            return Response({'error': 'Mot de passe généré introuvable pour cet utilisateur.'}, status=400)
            
        subject = "Vos identifiants d'accès à StartJobs"
        
        is_admin = user.role in ['admin', 'super_admin', 'moderator']
        
        if is_admin:
            role_display = "Administrateur"
            if user.role == 'super_admin':
                role_display = "Super Administrateur"
            elif user.role == 'moderator':
                role_display = "Modérateur"
                
            intro_text = f"Votre accès <strong>{role_display}</strong> a été créé ou réinitialisé avec succès par l'administration. Voici vos identifiants pour vous connecter au back-office :"
            login_field = f"<p style='margin: 0 0 10px 0;'><strong>Adresse E-mail :</strong> {user.email}</p>"
        else:
            intro_text = "Votre compte candidat a été créé avec succès par l'administration. Voici vos identifiants pour vous connecter à la plateforme :"
            login_field = f"<p style='margin: 0 0 10px 0;'><strong>Nom d'utilisateur :</strong> {user.username}</p>"
        
        # Create HTML content manually since we might not have templates setup
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #4F46E5;">Bienvenue sur StartJobs</h1>
                </div>
                <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p>Bonjour <strong>{user.first_name or user.username}</strong>,</p>
                    <p>{intro_text}</p>
                    <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #4F46E5; margin: 20px 0;">
                        {login_field}
                        <p style="margin: 0;"><strong>Mot de passe :</strong> {password}</p>
                    </div>
                    <p style="color: #DC2626; font-size: 0.9em;"><em>Note : Nous vous recommandons de modifier votre mot de passe dès votre première connexion.</em></p>
                </div>
                <p>À très bientôt sur StartJobs !</p>
                <p style="font-size: 0.8em; color: #6B7280; text-align: center; margin-top: 30px;">
                    Ceci est un message automatique, merci de ne pas y répondre.
                </p>
            </body>
        </html>
        """
        
        text_content = strip_tags(html_content)

        try:
            msg = EmailMultiAlternatives(
                subject,
                text_content,
                django_settings.DEFAULT_FROM_EMAIL,
                [user.email]
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send(fail_silently=False)
            return Response({'message': 'Identifiants envoyés par email avec succès.'})
        except Exception as e:
            return Response({'error': f"Erreur lors de l'envoi de l'email: {str(e)}"}, status=500)

class AdminUpdateUserView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, user_id):
        from users.models import User
        from django.contrib.auth.hashers import make_password
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable.'}, status=404)

        data = request.data
        
        # Update User fields
        if 'email' in data:
            user.email = data['email']
        if 'username' in data:
            user.username = data['username']
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'password' in data and data['password']:
            user.password = make_password(data['password'])
            
        user.save()

        # Update Profile fields if it's a candidate
        if hasattr(user, 'candidate_profile') and 'profile' in data:
            profile_data = data['profile']
            profile = user.candidate_profile
            
            if 'phone' in profile_data:
                profile.phone = profile_data['phone']
            if 'generated_password' in profile_data:
                profile.generated_password = profile_data['generated_password']
            if 'ville' in profile_data or 'quartier' in profile_data:
                v = profile_data.get('ville', '')
                q = profile_data.get('quartier', '')
                if v and q:
                    profile.neighborhood = f"{v} - {q}"
                elif v or q:
                    profile.neighborhood = v or q
                
            profile.save()

        # Update Profile fields if it's an admin
        if hasattr(user, 'admin_profile') and 'profile' in data:
            profile_data = data['profile']
            profile = user.admin_profile
            if 'phone' in profile_data:
                profile.phone = profile_data['phone']
            if 'generated_password' in profile_data:
                profile.generated_password = profile_data['generated_password']
            profile.save()

        # Update Profile fields if it's an employer
        if hasattr(user, 'employer_profile') and 'profile' in data:
            profile_data = data['profile']
            profile = user.employer_profile
            if 'verified' in profile_data:
                profile.verified = profile_data['verified']
            if 'verification_requested' in profile_data:
                profile.verification_requested = profile_data['verification_requested']
            profile.save()

        return Response({'message': 'Utilisateur mis à jour avec succès.'})
