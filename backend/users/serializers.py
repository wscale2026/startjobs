from rest_framework import serializers
from .models import User, EmployerProfile, CandidateProfile, Skill, Language, Experience
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    candidate_profile = serializers.SerializerMethodField()
    employer_profile = serializers.SerializerMethodField()
    admin_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_superuser', 'date_joined', 'last_login', 'candidate_profile', 'employer_profile', 'admin_profile')
        read_only_fields = ('id', 'date_joined', 'last_login')

    def get_candidate_profile(self, obj):
        if hasattr(obj, 'candidate_profile'):
            profile = obj.candidate_profile
            return {
                'phone': getattr(profile, 'phone', ''),
                'statut': 'Vérifié' if getattr(profile, 'verified', False) else 'Non vérifié',
                'offresTotal': getattr(profile, 'total_missions', 0),
                'generated_password': getattr(profile, 'generated_password', ''),
                'neighborhood': getattr(profile, 'neighborhood', ''),
                'date_of_birth': getattr(profile, 'date_of_birth', None),
                'highest_diploma': getattr(profile, 'highest_diploma', ''),
                'institution': getattr(profile, 'institution', ''),
                'graduation_year': getattr(profile, 'graduation_year', ''),
                'photo': self.context['request'].build_absolute_uri(profile.photo.url) if 'request' in self.context and getattr(profile, 'photo', None) and profile.photo.name else (profile.photo.url if getattr(profile, 'photo', None) and profile.photo.name else None),
                'bio': getattr(profile, 'bio', ''),
                'profile_type': getattr(profile, 'profile_type', ''),
                'score': getattr(profile, 'score', 0),
                'total_missions': getattr(profile, 'total_missions', 0),
                'is_available': getattr(profile, 'is_available', True),
                'has_license': getattr(profile, 'has_license', False),
                'profile_views': getattr(profile, 'profile_views', 0),
                'distance_max': getattr(profile, 'distance_max', 10),
                'skills': [{'id': s.id, 'name': s.name} for s in profile.skills.all()] if hasattr(profile, 'skills') else [],
                'languages': [{'id': l.id, 'name': l.name} for l in profile.languages.all()] if hasattr(profile, 'languages') else [],
                'experiences': [
                    {
                        'id': exp.id,
                        'title': exp.title,
                        'employer_name': exp.employer_name,
                        'date': exp.date,
                        'exp_type': exp.exp_type
                    } for exp in profile.experiences.all()
                ] if hasattr(profile, 'experiences') else []
            }
        return None

    def get_employer_profile(self, obj):
        if hasattr(obj, 'employer_profile'):
            return {
                'phone': obj.employer_profile.phone,
                'statut': 'Vérifié' if obj.employer_profile.verified else 'Non vérifié',
                'offresTotal': obj.employer_profile.job_offers.count() if hasattr(obj.employer_profile, 'job_offers') else 0,
                'neighborhood': getattr(obj.employer_profile, 'neighborhood', ''),
                'company_name': obj.employer_profile.company_name,
                'city': obj.employer_profile.city,
                'industry': obj.employer_profile.industry,
                'address': obj.employer_profile.address,
                'description': obj.employer_profile.description,
                'recruits_per_month': obj.employer_profile.recruits_per_month,
                'verification_requested': obj.employer_profile.verification_requested,
                'generated_password': getattr(obj.employer_profile, 'generated_password', ''),
                'logo': obj.employer_profile.logo.url if obj.employer_profile.logo else None,
                'kyc_status': getattr(obj.employer_profile, 'kyc_status', 'unverified'),
                'kyc_method': getattr(obj.employer_profile, 'kyc_method', ''),
                'kyc_selfie': obj.employer_profile.kyc_selfie.url if getattr(obj.employer_profile, 'kyc_selfie', None) else None,
                'kyc_cni_recto': obj.employer_profile.kyc_cni_recto.url if getattr(obj.employer_profile, 'kyc_cni_recto', None) else None,
                'kyc_cni_verso': obj.employer_profile.kyc_cni_verso.url if getattr(obj.employer_profile, 'kyc_cni_verso', None) else None,
                'kyc_passport_recepisse': obj.employer_profile.kyc_passport_recepisse.url if getattr(obj.employer_profile, 'kyc_passport_recepisse', None) else None,
                'kyc_attestation_fiscale': obj.employer_profile.kyc_attestation_fiscale.url if getattr(obj.employer_profile, 'kyc_attestation_fiscale', None) else None,
                'kyc_attestation_immatriculation': obj.employer_profile.kyc_attestation_immatriculation.url if getattr(obj.employer_profile, 'kyc_attestation_immatriculation', None) else None,
                'kyc_rejection_reason': getattr(obj.employer_profile, 'kyc_rejection_reason', ''),
                'employer_type': getattr(obj.employer_profile, 'employer_type', 'particulier'),
            }
        return None

    def get_admin_profile(self, obj):
        if hasattr(obj, 'admin_profile'):
            return {
                'phone': obj.admin_profile.phone,
                'statut': 'Actif' if obj.is_active else 'Inactif',
                'generated_password': obj.admin_profile.generated_password
            }
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    profile_data = serializers.JSONField(write_only=True, required=False)
    photo = serializers.ImageField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'first_name', 'last_name', 'profile_data', 'photo')
        read_only_fields = ('id',)

    def validate_email(self, value):
        """Ensure email is unique across all users."""
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un compte avec cette adresse email existe déjà.")
        return value

    from django.db import transaction
    
    @transaction.atomic
    def create(self, validated_data):
        photo = validated_data.pop('photo', None)
        profile_data = validated_data.pop('profile_data', {})
        if isinstance(profile_data, str):
            import json
            try:
                profile_data = json.loads(profile_data)
            except json.JSONDecodeError:
                profile_data = {}
                
        raw_password = validated_data.get('password', '')
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'candidate'),
            password=make_password(raw_password)
        )
        # Create corresponding profile or set admin status
        if user.role == 'employer':
            emp = EmployerProfile.objects.create(user=user, generated_password=raw_password)
            if photo:
                emp.logo = photo
            if profile_data:
                for k, v in profile_data.items():
                    if hasattr(emp, k):
                        setattr(emp, k, v)
                
                # Auto-add to Neighborhood model so it's available in Admin and other forms
                ville = profile_data.get('city', '')
                quartier = profile_data.get('neighborhood', '')
                if ville and quartier:
                    from jobs.models import Neighborhood
                    Neighborhood.objects.get_or_create(city=ville, name=quartier)
            
            emp.save()
        elif user.role == 'candidate':
            cand = CandidateProfile.objects.create(user=user, generated_password=raw_password)
            if photo:
                cand.photo = photo
                
            if profile_data:
                skills = profile_data.pop('skills', [])
                languages = profile_data.pop('languages', [])
                experiences = profile_data.pop('experiences', [])
                
                for k, v in profile_data.items():
                    if hasattr(cand, k):
                        setattr(cand, k, v)
                
                # Combine ville and quartier into neighborhood since CandidateProfile has no city field
                ville = profile_data.get('city', '') or profile_data.get('ville', '')
                quartier = profile_data.get('neighborhood', '') or profile_data.get('quartier', '')
                if ville and quartier:
                    cand.neighborhood = f"{ville} - {quartier}"
                    # Auto-add to Neighborhood model so it's available in Admin and other forms
                    from jobs.models import Neighborhood
                    Neighborhood.objects.get_or_create(city=ville, name=quartier)
                elif ville or quartier:
                    cand.neighborhood = ville or quartier
                    
            cand.save()
            
            if profile_data:
                # Handle ManyToMany
                for skill_name in skills:
                    sk, _ = Skill.objects.get_or_create(name=skill_name)
                    cand.skills.add(sk)
                for lang_name in languages:
                    lg, _ = Language.objects.get_or_create(name=lang_name)
                    cand.languages.add(lg)
                for exp in experiences:
                    Experience.objects.create(
                        candidate=cand,
                        title=exp.get('titre', ''),
                        employer_name=exp.get('employeur', ''),
                        date=exp.get('annee', ''),
                        exp_type='declared'
                    )
                    
        elif user.role in ['admin', 'super_admin', 'moderator']:
            user.is_staff = True
            if user.role == 'super_admin':
                user.is_superuser = True
            user.save()
            from .models import AdminProfile
            AdminProfile.objects.create(user=user, generated_password=raw_password)
            
        return user

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ('id', 'name')

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ('id', 'name')

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ('id', 'candidate', 'title', 'employer_name', 'date', 'exp_type', 'rating', 'comment')

class EmployerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    score = serializers.SerializerMethodField()

    class Meta:
        model = EmployerProfile
        fields = ('id', 'user', 'company_name', 'address', 'phone', 'verified', 'verification_requested', 'logo',
                  'industry', 'city', 'neighborhood', 'latitude', 'longitude', 'recruits_per_month', 'description', 'score', 'kyc_status', 'kyc_method', 'kyc_selfie', 'kyc_cni_recto', 'kyc_cni_verso', 'kyc_passport_recepisse', 'kyc_attestation_fiscale', 'kyc_attestation_immatriculation', 'employer_type', 'kyc_rejection_reason')

    def get_score(self, obj):
        from interactions.models import Review
        reviews = Review.objects.filter(reviewee=obj.user).values_list('rating', flat=True)
        if reviews:
            return round(sum(reviews) / len(reviews), 1)
        return 0.0

class CandidateProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)

    class Meta:
        model = CandidateProfile
        fields = ('id', 'user', 'bio', 'phone', 'neighborhood', 'latitude', 'longitude', 'distance_max', 'score', 'total_missions', 
                  'is_available', 'has_license', 'profile_views', 'profile_type', 'photo', 'skills', 'languages', 'experiences', 'generated_password', 'date_of_birth', 'highest_diploma', 'institution', 'graduation_year')

class UserMeSerializer(serializers.ModelSerializer):
    employer_profile = EmployerProfileSerializer(read_only=True)
    candidate_profile = CandidateProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'role', 'is_staff', 'is_superuser', 'employer_profile', 'candidate_profile')
        read_only_fields = ('id',)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            from django.contrib.auth.hashers import make_password
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)
