from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import DueItem, Message, ActionItem, Donor
import uuid


class Command(BaseCommand):
    help = 'Seed the database with demo data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        now = timezone.now()
        
        due_items_data = [
            {
                'id': str(uuid.uuid4()),
                'title': 'Q1 Gift Processing Deadline',
                'owner': 'Advancement Services',
                'due_at': now + timedelta(days=14),
                'status': 'Open',
                'notes': 'Process all Q1 gifts and generate acknowledgment letters',
            },
            {
                'id': str(uuid.uuid4()),
                'title': 'Giving Day Campaign Launch',
                'owner': 'Annual Giving',
                'due_at': now + timedelta(days=45),
                'status': 'Open',
                'notes': 'Launch Giving Day 2026 campaign materials and communications',
            },
            {
                'id': str(uuid.uuid4()),
                'title': 'Board Report Preparation',
                'owner': 'VP Office',
                'due_at': now + timedelta(days=7),
                'status': 'Open',
                'notes': 'Prepare quarterly advancement report for Board of Trustees',
            },
        ]
        
        for item_data in due_items_data:
            DueItem.objects.update_or_create(
                title=item_data['title'],
                defaults=item_data
            )
        
        action_items_data = [
            {
                'id': 'action_1',
                'title': 'Standardize donor record definitions',
                'why': 'Inconsistent constituent definitions lead to inaccurate reporting',
                'owner': 'Advancement Services',
                'horizon': 'Q1',
                'impact': 'High',
                'metric': '100% of records classified by standard taxonomy',
            },
            {
                'id': 'action_2',
                'title': 'Improve contactability scores',
                'why': 'Email and phone outreach campaigns have low success rates',
                'owner': 'Annual Giving',
                'horizon': 'Q2',
                'impact': 'High',
                'metric': '80% of alumni with verified contact info',
            },
            {
                'id': 'action_3',
                'title': 'Build capacity scoring model',
                'why': 'Major gift officers need data-driven prospect prioritization',
                'owner': 'Research',
                'horizon': 'Q2',
                'impact': 'Medium',
                'metric': 'Capacity scores for top 500 prospects',
            },
            {
                'id': 'action_4',
                'title': 'Deduplicate constituent records',
                'why': 'Duplicate records cause donor confusion and data integrity issues',
                'owner': 'Advancement Services',
                'horizon': 'Q1',
                'impact': 'High',
                'metric': 'Reduce duplicates by 95%',
            },
        ]
        
        for item_data in action_items_data:
            ActionItem.objects.update_or_create(
                id=item_data['id'],
                defaults=item_data
            )
        
        donors_data = [
            {
                'name': 'Catherine M. Sterling',
                'type': 'Individual',
                'organization': None,
                'total_given': 2500000.00,
                'last_gift_date': now - timedelta(days=45),
                'last_gift_amount': 500000.00,
                'email': 'c.sterling@example.com',
                'phone': '(617) 555-0101',
                'city': 'Boston',
                'state': 'MA',
            },
            {
                'name': 'The Morrison Family Foundation',
                'type': 'Foundation',
                'organization': 'Morrison Family Foundation',
                'total_given': 1750000.00,
                'last_gift_date': now - timedelta(days=90),
                'last_gift_amount': 250000.00,
                'email': 'grants@morrisonfoundation.org',
                'phone': '(212) 555-0202',
                'city': 'New York',
                'state': 'NY',
            },
            {
                'name': 'TechCorp Industries',
                'type': 'Corporation',
                'organization': 'TechCorp Industries',
                'total_given': 850000.00,
                'last_gift_date': now - timedelta(days=30),
                'last_gift_amount': 100000.00,
                'email': 'philanthropy@techcorp.com',
                'phone': '(415) 555-0303',
                'city': 'San Francisco',
                'state': 'CA',
            },
            {
                'name': 'Dr. James L. Hartley',
                'type': 'Individual',
                'organization': None,
                'total_given': 525000.00,
                'last_gift_date': now - timedelta(days=120),
                'last_gift_amount': 75000.00,
                'email': 'jhartley@university.edu',
                'phone': '(617) 555-0404',
                'city': 'Cambridge',
                'state': 'MA',
            },
            {
                'name': 'The Arts Education Trust',
                'type': 'Foundation',
                'organization': 'Arts Education Trust',
                'total_given': 1200000.00,
                'last_gift_date': now - timedelta(days=60),
                'last_gift_amount': 200000.00,
                'email': 'info@artseducationtrust.org',
                'phone': '(310) 555-0505',
                'city': 'Los Angeles',
                'state': 'CA',
            },
        ]
        
        for donor_data in donors_data:
            donor_data['id'] = str(uuid.uuid4())
            Donor.objects.update_or_create(
                name=donor_data['name'],
                defaults=donor_data
            )
        
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
