from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from django.db.models.functions import TruncDate

from .models import User, EmployerProfile, CandidateProfile
from jobs.models import JobOffer, Application, Sector

class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_employers = EmployerProfile.objects.count()
        total_candidates = CandidateProfile.objects.count()
        total_offers = JobOffer.objects.count()
        total_applications = Application.objects.count()
        
        pending_kyc_requests = EmployerProfile.objects.filter(kyc_status='pending').count()
        pending_badge_requests = EmployerProfile.objects.filter(verification_requested=True, verified=False).count()

        # Users registered per day in the last 7 days
        seven_days_ago = timezone.now() - timedelta(days=7)
        registrations_by_day = User.objects.filter(date_joined__gte=seven_days_ago) \
            .annotate(date=TruncDate('date_joined')) \
            .values('date') \
            .annotate(count=Count('id')) \
            .order_by('date')

        # Format chart data
        chart_data = []
        for i in range(6, -1, -1):
            day_date = (timezone.now() - timedelta(days=i)).date()
            day_count = next((item['count'] for item in registrations_by_day if item['date'] == day_date), 0)
            chart_data.append({
                "date": day_date.strftime("%d/%m"),
                "inscrits": day_count
            })

        # Offers posted per day in the last 7 days
        offers_by_day_qs = JobOffer.objects.filter(created_at__gte=seven_days_ago) \
            .annotate(date=TruncDate('created_at')) \
            .values('date') \
            .annotate(count=Count('id')) \
            .order_by('date')
            
        offers_by_day = []
        for i in range(6, -1, -1):
            day_date = (timezone.now() - timedelta(days=i)).date()
            day_count = next((item['count'] for item in offers_by_day_qs if item['date'] == day_date), 0)
            offers_by_day.append({
                "name": day_date.strftime("%d/%m"),
                "offres": day_count
            })

        # Sectors Data (Offers by Sector)
        sectors_qs = JobOffer.objects.values('sector__name').annotate(value=Count('id')).order_by('-value')[:6]
        sectors_data = []
        for s in sectors_qs:
            name = s['sector__name'] or "Non spécifié"
            sectors_data.append({"name": name, "value": s['value']})

        # Radar Data (Demand vs Supply by Sector)
        top_sectors = Sector.objects.annotate(offer_count=Count('job_offers')).order_by('-offer_count')[:6]
        radar_data = []
        for sector in top_sectors:
            offers_count = sector.offer_count
            applications_count = Application.objects.filter(job_offer__sector=sector).count()
            full_mark = max(offers_count, applications_count, 10) + 10
            radar_data.append({
                "subject": sector.name[:12] + ".." if len(sector.name) > 12 else sector.name,
                "A": applications_count,
                "B": offers_count,
                "fullMark": full_mark
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
            "pending_kyc_requests": pending_kyc_requests,
            "pending_badge_requests": pending_badge_requests,
            "chart_data": chart_data,
            "offers_by_day": offers_by_day,
            "sectors_data": sectors_data,
            "radar_data": radar_data,
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
            'notify_admins_on_registration': s.notify_admins_on_registration,
            'notify_admins_on_employer_registration': s.notify_admins_on_employer_registration,
            'suspend_employer_features': s.suspend_employer_features,
            'show_empty_offers_countdown': s.show_empty_offers_countdown,
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
        if 'notify_admins_on_registration' in data:
            s.notify_admins_on_registration = str(data['notify_admins_on_registration']).lower() == 'true'
        if 'notify_admins_on_employer_registration' in data:
            s.notify_admins_on_employer_registration = str(data['notify_admins_on_employer_registration']).lower() == 'true'
        if 'suspend_employer_features' in data:
            s.suspend_employer_features = str(data['suspend_employer_features']).lower() == 'true'
        if 'show_empty_offers_countdown' in data:
            s.show_empty_offers_countdown = str(data['show_empty_offers_countdown']).lower() == 'true'
            
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
            if 'bio' in profile_data:
                profile.bio = profile_data['bio']
            if 'profile_type' in profile_data:
                profile.profile_type = profile_data['profile_type']
            # Handle ville / quartier as neighborhood
            v = profile_data.get('ville', '')
            q = profile_data.get('quartier', '')
            if v and q:
                profile.neighborhood = f"{v} - {q}"
            elif v or q:
                profile.neighborhood = v or q
            elif 'neighborhood' in profile_data:
                profile.neighborhood = profile_data['neighborhood']
                
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
            
            old_kyc_status = profile.kyc_status
            old_verified = profile.verified
            
            if 'verified' in profile_data:
                profile.verified = profile_data['verified']
            if 'verification_requested' in profile_data:
                profile.verification_requested = profile_data['verification_requested']
            if 'kyc_status' in profile_data:
                profile.kyc_status = profile_data['kyc_status']
            if 'kyc_rejection_reason' in profile_data:
                profile.kyc_rejection_reason = profile_data['kyc_rejection_reason']
            profile.save()
            
            if not old_verified and profile.verified:
                import threading
                from django.core.mail import send_mail
                from django.conf import settings
                from users.models import SiteSettings, User
                from interactions.models import Conversation, Message
                
                s = SiteSettings.get_settings()
                
                def send_badge_email():
                    try:
                        frontend_base = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
                        html_message = f"""
                        <!DOCTYPE html>
                        <html>
                        <body style="font-family: Arial, sans-serif; background:#f4f7f6; margin:0; padding:0;">
                            <div style="max-width:560px; margin:30px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.07);">
                                <div style="background:#1d4ed8; padding:28px 30px; text-align:center;">
                                    <h2 style="color:#fff; margin:0; font-size:20px;">🏆 Félicitations ! Badge "Vérifié" obtenu</h2>
                                </div>
                                <div style="padding:30px 34px; color:#333;">
                                    <p style="font-size:16px; margin-top:0;">Bonjour <strong>{user.first_name or user.username}</strong>,</p>
                                    <p style="font-size:15px; line-height:1.6;">L'équipe {s.site_name} a le plaisir de vous informer que votre profil employeur a obtenu le badge officiel <strong>"Employeur Vérifié"</strong>.</p>
                                    
                                    <div style="background:#eff6ff; border-left:4px solid #1d4ed8; border-radius:6px; padding:16px 20px; margin:20px 0;">
                                        <p style="margin:0 0 10px 0; font-weight:bold;">Ce que cela signifie pour vous :</p>
                                        <ul style="margin:0; padding-left:16px; line-height:1.9;">
                                            <li>Un badge bleu distinctif apparaît désormais sur toutes vos offres d'emploi.</li>
                                            <li>Une visibilité accrue de vos annonces auprès des candidats.</li>
                                            <li>Un gage de confiance et de sérieux qui booste considérablement votre attractivité.</li>
                                        </ul>
                                    </div>
                                    
                                    <div style="text-align:center; margin:30px 0 10px 0;">
                                        <a href="{frontend_base}/employer/dashboard" style="background:#1d4ed8; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600; display:inline-block;">
                                            Voir mon profil
                                        </a>
                                    </div>
                                    <p style="font-size:14px; color:#64748b; margin-top:20px;">Merci de votre confiance et d'excellents recrutements !</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """
                        send_mail(
                            subject=f"🏆 Votre profil a obtenu le badge Vérifié sur {s.site_name}",
                            message=f"Bonjour {user.first_name or user.username},\n\nFélicitations ! Votre profil employeur a obtenu le badge officiel 'Employeur Vérifié'.\n\nCe badge de confiance renforcera l'attractivité de vos offres d'emploi auprès des candidats.\n\nL'équipe {s.site_name}",
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[user.email],
                            fail_silently=True,
                            html_message=html_message
                        )
                    except Exception as e:
                        print(f"Error sending verified badge email to {user.email}: {e}")
                
                threading.Thread(target=send_badge_email).start()
                
                def create_badge_internal_message():
                    try:
                        superadmin = User.objects.filter(is_superuser=True).first()
                        if superadmin:
                            conv = Conversation.objects.filter(participants=user).filter(participants=superadmin).first()
                            if not conv:
                                conv = Conversation.objects.create()
                                conv.participants.add(user, superadmin)
                            
                            instructions = (
                                f"Félicitations {user.first_name or user.username} ! 🏆\n\n"
                                f"L'administration de {s.site_name} vous a accordé le badge officiel 'Employeur Vérifié'.\n"
                                "Ce badge bleu apparaîtra désormais sur toutes vos annonces et sur votre profil, rassurant ainsi les candidats sur le sérieux de votre entreprise.\n\n"
                                "Cela augmentera considérablement le nombre de candidatures pertinentes sur vos offres.\n"
                                "Merci pour votre confiance !"
                            )
                            
                            Message.objects.create(
                                conversation=conv,
                                sender=superadmin,
                                text=instructions
                            )
                    except Exception as e:
                        print(f"Error creating internal message: {e}")
                
                threading.Thread(target=create_badge_internal_message).start()
            
            if old_kyc_status != 'approved' and profile.kyc_status == 'approved':
                import threading
                from django.core.mail import send_mail
                from django.conf import settings
                from users.models import SiteSettings, User
                from interactions.models import Conversation, Message
                
                s = SiteSettings.get_settings()
                
                # Send email in background
                def send_approval_email():
                    try:
                        frontend_base = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
                    
                        html_message = f"""
                        <!DOCTYPE html>
                        <html>
                        <body style="font-family: Arial, sans-serif; background:#f4f7f6; margin:0; padding:0;">
                            <div style="max-width:560px; margin:30px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.07);">
                                <div style="background:#10b981; padding:28px 30px; text-align:center;">
                                    <h2 style="color:#fff; margin:0; font-size:20px;">🎉 Identité Vérifiée avec Succès</h2>
                                </div>
                                <div style="padding:30px 34px; color:#333;">
                                    <p style="font-size:16px; margin-top:0;">Bonjour <strong>{user.first_name or user.username}</strong>,</p>
                                    <p style="font-size:15px; line-height:1.6;">Excellente nouvelle ! Les documents d'identité de votre entreprise ont été <strong>approuvés</strong> par l'équipe {s.site_name}.</p>
                                    
                                    <div style="background:#f8fafc; border-left:4px solid #10b981; border-radius:6px; padding:16px 20px; margin:20px 0;">
                                        <p style="margin:0 0 10px 0; font-weight:bold;">Toutes vos fonctionnalités sont débloquées :</p>
                                        <ul style="margin:0; padding-left:16px; line-height:1.9;">
                                            <li>Publication d'offres d'emploi en illimité</li>
                                            <li>Recherche approfondie de profils candidats</li>
                                            <li>Messagerie interne pour échanger en direct</li>
                                            <li>Obtention du badge "Employeur Vérifié"</li>
                                        </ul>
                                    </div>
                                    
                                    <div style="text-align:center; margin:30px 0 10px 0;">
                                        <a href="{frontend_base}/employer/dashboard" style="background:#10b981; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600; display:inline-block;">
                                            Accéder à mon espace
                                        </a>
                                    </div>
                                    <p style="font-size:14px; color:#64748b; margin-top:20px;">L'équipe {s.site_name} vous souhaite d'excellents recrutements !</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """
                        send_mail(
                            subject=f"Votre identité a été vérifiée sur {s.site_name} 🎉",
                            message=f"Bonjour {user.first_name or user.username},\n\nExcellente nouvelle ! Votre vérification d'identité (KYC) a été approuvée par l'équipe {s.site_name}.\n\nVous avez désormais accès à l'ensemble des fonctionnalités de la plateforme (publication d'offres d'emploi, messagerie, etc.).\n\nL'équipe {s.site_name}",
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[user.email],
                            fail_silently=True,
                            html_message=html_message
                        )
                    except Exception as e:
                        print(f"Error sending KYC approval email to {user.email}: {e}")
                
                threading.Thread(target=send_approval_email).start()
                
                # Send internal message in background too (just in case it's slow, though DB operations are fast)
                def create_internal_message():
                    try:
                        superadmin = User.objects.filter(is_superuser=True).first()
                        if superadmin:
                            conv = Conversation.objects.filter(participants=user).filter(participants=superadmin).first()
                            if not conv:
                                conv = Conversation.objects.create()
                                conv.participants.add(user, superadmin)
                            
                            instructions = (
                                f"Félicitations {user.first_name or user.username} ! 🎉\n\n"
                                f"Vos documents d'identité ont été validés avec succès par l'équipe {s.site_name}.\n"
                                "Toutes les fonctionnalités de votre compte employeur sont maintenant débloquées.\n\n"
                                "Voici quelques conseils pour bien démarrer :\n"
                                "1. Assurez-vous que les informations de votre entreprise sont complètes dans votre profil.\n"
                                "2. Cliquez sur 'Publier une annonce' pour créer votre première offre d'emploi.\n"
                                "3. Consultez la liste des candidats et trouvez les meilleurs profils de votre quartier.\n"
                                "4. Discutez directement avec les candidats via cette messagerie intégrée.\n\n"
                                "Nous vous souhaitons d'excellents recrutements !"
                            )
                            
                            Message.objects.create(
                                conversation=conv,
                                sender=superadmin,
                                text=instructions
                            )
                    except Exception as e:
                        print(f"Error creating internal message: {e}")
                
                threading.Thread(target=create_internal_message).start()
                
            elif old_kyc_status != 'rejected' and profile.kyc_status == 'rejected':
                import threading
                from django.core.mail import send_mail
                from django.conf import settings
                from users.models import SiteSettings
                
                def send_rejection_email():
                    try:
                        s = SiteSettings.get_settings()
                        reason = profile.kyc_rejection_reason or "Document illisible ou non conforme."
                        frontend_base = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
                    
                        html_message = f"""
                        <!DOCTYPE html>
                        <html>
                        <body style="font-family: Arial, sans-serif; background:#f4f7f6; margin:0; padding:0;">
                            <div style="max-width:560px; margin:30px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.07);">
                                <div style="background:#ef4444; padding:28px 30px; text-align:center;">
                                    <h2 style="color:#fff; margin:0; font-size:20px;">⚠️ Vérification Rejetée</h2>
                                </div>
                                <div style="padding:30px 34px; color:#333;">
                                    <p style="font-size:16px; margin-top:0;">Bonjour <strong>{user.first_name or user.username}</strong>,</p>
                                    <p style="font-size:15px; line-height:1.6;">Nous avons examiné les documents d'identité que vous avez soumis sur {s.site_name}. Malheureusement, <strong>votre demande n'a pas pu être validée</strong>.</p>
                                    
                                    <div style="background:#fef2f2; border-left:4px solid #ef4444; border-radius:6px; padding:16px 20px; margin:20px 0;">
                                        <p style="margin:0 0 8px 0; color:#b91c1c; font-weight:bold; font-size:14px; text-transform:uppercase;">Motif du rejet :</p>
                                        <p style="margin:0; color:#7f1d1d; font-size:15px;">{reason}</p>
                                    </div>
                                    
                                    <p style="font-size:15px; line-height:1.6;">Pour débloquer vos accès, nous vous invitons à vous connecter à votre compte et à soumettre de nouveaux documents (assurez-vous qu'ils soient lisibles, valides, et correspondent aux informations saisies).</p>
                                    
                                    <div style="text-align:center; margin:30px 0 10px 0;">
                                        <a href="{frontend_base}/employer/dashboard" style="background:#ef4444; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600; display:inline-block;">
                                            Soumettre de nouveaux documents
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                        """
                        
                        send_mail(
                            subject=f"Vérification d'identité rejetée sur {s.site_name}",
                            message=f"Bonjour {user.first_name or user.username},\n\nNous avons examiné les documents d'identité que vous avez soumis sur {s.site_name}.\n\nMalheureusement, votre demande a été rejetée pour le motif suivant :\n{reason}\n\nNous vous invitons à vous connecter à votre compte et à soumettre de nouveaux documents conformes pour pouvoir débloquer toutes les fonctionnalités de votre espace employeur.\n\nL'équipe {s.site_name}",
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[user.email],
                            fail_silently=True,
                            html_message=html_message
                        )
                    except Exception as e:
                        print(f"Error sending KYC rejection email to {user.email}: {e}")
                    
                threading.Thread(target=send_rejection_email).start()

        return Response({'message': 'Utilisateur mis à jour avec succès.'})
