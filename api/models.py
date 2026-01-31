import uuid
from django.db import models


class DueItem(models.Model):
    id = models.CharField(max_length=255, primary_key=True, default=uuid.uuid4)
    title = models.TextField()
    owner = models.TextField()
    due_at = models.DateTimeField()
    status = models.CharField(max_length=20, default='Open')
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'due_items'
        ordering = ['due_at']


class Message(models.Model):
    id = models.CharField(max_length=255, primary_key=True, default=uuid.uuid4)
    to_team = models.TextField()
    subject = models.TextField()
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['-created_at']


class ActionItem(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    title = models.TextField()
    why = models.TextField()
    owner = models.TextField()
    horizon = models.CharField(max_length=20)
    impact = models.CharField(max_length=10)
    metric = models.TextField()
    is_done = models.IntegerField(default=0)

    class Meta:
        db_table = 'action_items'


class Donor(models.Model):
    id = models.CharField(max_length=255, primary_key=True, default=uuid.uuid4)
    name = models.TextField()
    type = models.CharField(max_length=20)
    organization = models.TextField(null=True, blank=True)
    total_given = models.DecimalField(max_digits=12, decimal_places=2)
    last_gift_date = models.DateTimeField()
    last_gift_amount = models.DecimalField(max_digits=12, decimal_places=2)
    email = models.TextField(null=True, blank=True)
    phone = models.TextField(null=True, blank=True)
    city = models.TextField(null=True, blank=True)
    state = models.TextField(null=True, blank=True)
    image_url = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'donors'
        ordering = ['-total_given']
