from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from django.utils import timezone
import uuid
import secrets

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField('email address', unique=True)
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('super_admin', 'Super Admin'),
        ('moderator', 'Modérateur'),
        ('employer', 'Employeur'),
        ('candidate', 'Candidat'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='candidate')
    is_email_verified = models.BooleanField(default=False)
    # Stored verification token (immune to last_login changes)
    email_verification_token = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    email_token_created_at = models.DateTimeField(blank=True, null=True)

    TOKEN_EXPIRY_HOURS = 72  # Token valid for 72 hours

    def generate_verification_token(self):
        """Generate and store a new verification token. Returns the raw token."""
        token = secrets.token_urlsafe(32)
        self.email_verification_token = token
        self.email_token_created_at = timezone.now()
        self.save(update_fields=['email_verification_token', 'email_token_created_at'])
        return token

    def check_verification_token(self, token):
        """Returns True if token is valid and not expired."""
        if not self.email_verification_token or not self.email_token_created_at:
            return False
        if self.email_verification_token != token:
            return False
        expiry = self.email_token_created_at + timezone.timedelta(hours=self.TOKEN_EXPIRY_HOURS)
        return timezone.now() <= expiry

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"



class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    phone = models.CharField(max_length=20, blank=True, null=True)
    generated_password = models.CharField(max_length=128, blank=True, null=True, help_text="Temporary password generated for admin view")

    def __str__(self):
        return f"Admin Profile - {self.user.username}"


class EmployerProfile(models.Model):
    KYC_STATUS_CHOICES = (
        ('unverified', 'Non vérifié'),
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Rejeté'),
    )
    EMPLOYER_TYPE_CHOICES = (
        ('particulier', 'Particulier'),
        ('entreprise', 'Entreprise'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employer_profile')
    employer_type = models.CharField(max_length=20, choices=EMPLOYER_TYPE_CHOICES, default='particulier')
    company_name = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    verified = models.BooleanField(default=False)
    verification_requested = models.BooleanField(default=False)
    
    # KYC Fields
    kyc_status = models.CharField(max_length=20, choices=KYC_STATUS_CHOICES, default='unverified')
    kyc_method = models.CharField(max_length=20, blank=True, null=True, help_text="cni, recepisse, passport, or none for entreprise")
    kyc_selfie = models.FileField(upload_to='employers/kyc/selfies/', blank=True, null=True, validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])])
    kyc_cni_recto = models.FileField(upload_to='employers/kyc/cni/', blank=True, null=True, validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])])
    kyc_cni_verso = models.FileField(upload_to='employers/kyc/cni/', blank=True, null=True, validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])])
    kyc_passport_recepisse = models.FileField(upload_to='employers/kyc/passport/', blank=True, null=True, validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])])
    kyc_attestation_fiscale = models.FileField(upload_to='employers/kyc/entreprise/', blank=True, null=True, validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])])
    kyc_attestation_immatriculation = models.FileField(upload_to='employers/kyc/entreprise/', blank=True, null=True, validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])])
    kyc_rejection_reason = models.TextField(blank=True, null=True)
    
    generated_password = models.CharField(max_length=128, blank=True, null=True, help_text="Temporary password generated for admin view")
    logo = models.ImageField(upload_to='employers/logos/', blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    neighborhood = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    recruits_per_month = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.company_name or self.user.username


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Language(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class CandidateProfile(models.Model):
    PROFILE_TYPES = (
        ('Salarié', 'Salarié'),
        ('Freelance', 'Freelance'),
        ('Apprenti', 'Apprenti'),
        ('Elève', 'Elève'),
        ('Etudiant', 'Etudiant'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate_profile')
    bio = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    highest_diploma = models.CharField(max_length=100, blank=True, null=True)
    institution = models.CharField(max_length=255, blank=True, null=True)
    graduation_year = models.CharField(max_length=4, blank=True, null=True)
    neighborhood = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    distance_max = models.FloatField(default=10.0, help_text="Distance max en km")
    score = models.FloatField(default=0.0)
    generated_password = models.CharField(max_length=128, blank=True, null=True, help_text="Temporary password generated for admin view")
    total_missions = models.IntegerField(default=0)
    is_available = models.BooleanField(default=True)
    has_license = models.BooleanField(default=False)
    profile_views = models.IntegerField(default=0)
    profile_type = models.CharField(max_length=20, choices=PROFILE_TYPES, default='Freelance')
    photo = models.ImageField(upload_to='candidates/photos/', blank=True, null=True)
    
    skills = models.ManyToManyField(Skill, blank=True, related_name='candidates')
    languages = models.ManyToManyField(Language, blank=True, related_name='candidates')

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class Experience(models.Model):
    EXP_TYPES = (
        ('verified', 'Vérifiée'),
        ('declared', 'Déclarée'),
    )

    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='experiences')
    title = models.CharField(max_length=255)
    employer_name = models.CharField(max_length=255)
    date = models.CharField(max_length=100) # e.g. "Janvier 2024"
    exp_type = models.CharField(max_length=20, choices=EXP_TYPES, default='declared')
    rating = models.FloatField(blank=True, null=True)
    comment = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} at {self.employer_name}"


class SiteSettings(models.Model):
    """Singleton model for global platform settings."""
    site_name = models.CharField(max_length=100, default='StartJobs')
    contact_email = models.EmailField(default='support@startjobs.cm')
    maintenance_mode = models.BooleanField(default=False)
    allow_registrations = models.BooleanField(default=True)
    require_email_verification = models.BooleanField(default=True)
    notify_admins_on_registration = models.BooleanField(default=True)
    notify_admins_on_employer_registration = models.BooleanField(default=True)
    suspend_employer_features = models.BooleanField(default=False)
    show_empty_offers_countdown = models.BooleanField(default=True)
    seo_title = models.CharField(max_length=200, default='StartJobs - La plateforme des emplois pour jeunes')
    seo_description = models.TextField(default='Trouvez rapidement des petits boulots et des offres de stage au Cameroun.')
    logo = models.ImageField(upload_to='site/', blank=True, null=True)

    class Meta:
        verbose_name = 'Paramètres du Site'

    def __str__(self):
        return f'Paramètres de {self.site_name}'

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
