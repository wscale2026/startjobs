from rest_framework import viewsets, permissions
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from .models import Sector, Neighborhood, JobOffer, Application
from .serializers import SectorSerializer, NeighborhoodSerializer, JobOfferSerializer, ApplicationSerializer
from users.permissions import IsOwnerOrAdmin
import math

def haversine(lat1, lon1, lat2, lon2):
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None: return float('inf')
    R = 6371  # Rayon de la terre en km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c


class SectorViewSet(viewsets.ModelViewSet):
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer
    permission_classes = [AllowAny]

class NeighborhoodViewSet(viewsets.ModelViewSet):
    queryset = Neighborhood.objects.all()
    serializer_class = NeighborhoodSerializer
    permission_classes = [AllowAny]

class JobOfferViewSet(viewsets.ModelViewSet):
    queryset = JobOffer.objects.all().order_by('-created_at')
    serializer_class = JobOfferSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]

    def get_queryset(self):
        queryset = JobOffer.objects.all().order_by('-created_at')
        my_offers = self.request.query_params.get('my_offers')
        is_ad = self.request.query_params.get('is_ad')
        
        if is_ad == 'true':
            queryset = queryset.filter(is_ad=True)
        elif is_ad == 'false':
            queryset = queryset.filter(is_ad=False)
            
        if my_offers == 'true' and self.request.user.is_authenticated:
            if hasattr(self.request.user, 'employer_profile'):
                queryset = queryset.filter(employer=self.request.user.employer_profile)
                
        # Filtrage par géolocalisation pour les candidats
        if self.request.user.is_authenticated and hasattr(self.request.user, 'candidate_profile'):
            cand = self.request.user.candidate_profile
            if cand.latitude and cand.longitude:
                max_dist = cand.distance_max or 10.0
                filtered_ids = []
                for offer in queryset:
                    if offer.employer and offer.employer.latitude and offer.employer.longitude:
                        dist = haversine(cand.latitude, cand.longitude, offer.employer.latitude, offer.employer.longitude)
                        if dist <= max_dist:
                            filtered_ids.append(offer.id)
                    else:
                        # Fallback si l'employeur n'a pas de coordonnées mais est dans le même quartier
                        if offer.employer and offer.employer.neighborhood and cand.neighborhood and offer.employer.neighborhood.lower() == cand.neighborhood.lower():
                            filtered_ids.append(offer.id)
                
                queryset = queryset.filter(id__in=filtered_ids)

        return queryset

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        # Auto-assign employer to logged-in user
        if hasattr(self.request.user, 'employer_profile'):
            profile = self.request.user.employer_profile
            if profile.kyc_status != 'approved':
                raise PermissionDenied("Votre profil doit être vérifié (KYC approuvé) pour publier une offre.")
            serializer.save(employer=profile)
        else:
            serializer.save()

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all().order_by('-created_at')
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]

    def get_queryset(self):
        from django.utils import timezone
        
        # Auto-complete expired accepted applications
        now = timezone.now()
        Application.objects.filter(
            status='accepted',
            job_offer__end_date__lt=now
        ).update(status='completed')
        
        queryset = Application.objects.select_related(
            'candidate', 
            'candidate__user', 
            'job_offer', 
            'job_offer__employer'
        ).order_by('-created_at')
        if not self.request.user.is_authenticated:
            return queryset.none()
            
        if hasattr(self.request.user, 'employer_profile'):
            queryset = queryset.filter(job_offer__employer=self.request.user.employer_profile)
        elif hasattr(self.request.user, 'candidate_profile'):
            queryset = queryset.filter(candidate=self.request.user.candidate_profile)
            
        return queryset

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'candidate_profile'):
            candidate = self.request.user.candidate_profile
            job_offer = serializer.validated_data.get('job_offer')
            
            score = 0
            if job_offer and candidate:
                skills = [skill.name.lower() for skill in candidate.skills.all()]
                
                # Check sector
                if job_offer.sector and job_offer.sector.name.lower() in skills:
                    score += 40
                elif job_offer.sector and candidate.profile_type and job_offer.sector.name.lower() in candidate.profile_type.lower():
                    score += 40
                
                # Check description/title for skills
                text_to_search = f"{job_offer.title} {job_offer.description}".lower() if job_offer.description else job_offer.title.lower()
                matched_skills = [skill for skill in skills if skill in text_to_search]
                score += len(matched_skills) * 20
                
                # Check neighborhood
                if job_offer.neighborhood and candidate.neighborhood and job_offer.neighborhood.name.lower() == candidate.neighborhood.lower():
                    score += 20
                    
                # Base score if score is 0 but they are a candidate
                if score == 0:
                    score = 15
                    
                score = min(score, 98)
                
            serializer.save(candidate=candidate, match_score=score)
        else:
            serializer.save()
