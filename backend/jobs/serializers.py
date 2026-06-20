from rest_framework import serializers
from .models import Sector, Neighborhood, JobOffer, Application
from users.serializers import EmployerProfileSerializer, CandidateProfileSerializer

class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = ('id', 'name')

class NeighborhoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Neighborhood
        fields = ('id', 'name', 'city')

class JobOfferSerializer(serializers.ModelSerializer):
    employer = EmployerProfileSerializer(read_only=True)
    sector = SectorSerializer(read_only=True)
    neighborhood = NeighborhoodSerializer(read_only=True)
    
    sector_name = serializers.CharField(write_only=True, required=False)
    neighborhood_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = JobOffer
        fields = ('id', 'title', 'employer', 'neighborhood', 'sector', 'description', 
                  'start_date', 'duration', 'end_date', 'budget', 'is_urgent', 'contact_whatsapp', 
                  'contact_phone', 'is_ad', 'ad_url', 'ad_image_url', 'created_at', 'updated_at', 'is_active',
                  'sector_name', 'neighborhood_name')

    def create(self, validated_data):
        sector_name = validated_data.pop('sector_name', None)
        neighborhood_name = validated_data.pop('neighborhood_name', None)
        
        if sector_name:
            sector, _ = Sector.objects.get_or_create(name=sector_name)
            validated_data['sector'] = sector
            
        if neighborhood_name:
            neighborhood, _ = Neighborhood.objects.get_or_create(name=neighborhood_name)
            validated_data['neighborhood'] = neighborhood
            
        return super().create(validated_data)

class ApplicationSerializer(serializers.ModelSerializer):
    candidate = CandidateProfileSerializer(read_only=True)
    job_offer = JobOfferSerializer(read_only=True)
    job_offer_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = Application
        fields = ('id', 'candidate', 'job_offer', 'job_offer_id', 'status', 'is_reviewed', 'match_score', 'created_at', 'updated_at')

    def create(self, validated_data):
        job_offer_id = validated_data.pop('job_offer_id')
        job_offer = JobOffer.objects.get(id=job_offer_id)
        validated_data['job_offer'] = job_offer
        return super().create(validated_data)
