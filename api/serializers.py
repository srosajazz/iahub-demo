from rest_framework import serializers
from .models import DueItem, Message, ActionItem, Donor


class DueItemSerializer(serializers.ModelSerializer):
    dueAt = serializers.DateTimeField(source='due_at')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = DueItem
        fields = ['id', 'title', 'owner', 'dueAt', 'status', 'notes', 'createdAt']
        read_only_fields = ['id', 'createdAt']


class MessageSerializer(serializers.ModelSerializer):
    toTeam = serializers.CharField(source='to_team')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'toTeam', 'subject', 'body', 'createdAt']
        read_only_fields = ['id', 'createdAt']


class ActionItemSerializer(serializers.ModelSerializer):
    isDone = serializers.IntegerField(source='is_done')

    class Meta:
        model = ActionItem
        fields = ['id', 'title', 'why', 'owner', 'horizon', 'impact', 'metric', 'isDone']


class DonorSerializer(serializers.ModelSerializer):
    totalGiven = serializers.DecimalField(source='total_given', max_digits=12, decimal_places=2)
    lastGiftDate = serializers.DateTimeField(source='last_gift_date')
    lastGiftAmount = serializers.DecimalField(source='last_gift_amount', max_digits=12, decimal_places=2)
    imageUrl = serializers.CharField(source='image_url', allow_null=True, required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Donor
        fields = ['id', 'name', 'type', 'organization', 'totalGiven', 'lastGiftDate', 
                  'lastGiftAmount', 'email', 'phone', 'city', 'state', 'imageUrl', 'createdAt']
        read_only_fields = ['id', 'createdAt']
