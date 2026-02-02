import random
import uuid
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Donor

class Command(BaseCommand):
    help = 'Populates the Donor table with fake data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating donors...')
        
        # Lists for random data generation
        names = ['John Doe', 'Jane Smith', 'Acme Corp', 'Global Foundation', 'Alice Johnson', 'Bob Williams', 'Charlie Brown']
        types = ['Individual', 'Corporation', 'Foundation']
        cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']
        states = ['NY', 'CA', 'IL', 'TX', 'AZ']
        
        donors_to_create = []
        for i in range(20):
            # Generate random data
            name = f"{random.choice(['Emily', 'Michael', 'Sarah', 'David', 'Jessica', 'James'])} {random.choice(['Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'])}"
            if random.random() > 0.7:
                name = f"{random.choice(['Tech', 'Health', 'Edu', 'Green'])} {random.choice(['Solutions', 'Systems', 'Global', 'Future'])}"
                d_type = random.choice(['Corporation', 'Foundation'])
                org = name
            else:
                d_type = 'Individual'
                org = ""

            donor = Donor(
                id=str(uuid.uuid4()),
                name=name,
                type=d_type,
                organization=org,
                total_given=Decimal(random.randint(1000, 1000000)),
                last_gift_date=timezone.now() - timezone.timedelta(days=random.randint(0, 365*2)),
                last_gift_amount=Decimal(random.randint(100, 50000)),
                email=f"donor{i}@example.com",
                phone=f"555-{random.randint(100,999)}-{random.randint(1000,9999)}",
                city=random.choice(cities),
                state=random.choice(states),
                image_url=f"https://i.pravatar.cc/150?u={uuid.uuid4()}" if d_type == 'Individual' else ""
            )
            donors_to_create.append(donor)
        
        Donor.objects.bulk_create(donors_to_create)
        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(donors_to_create)} donors'))
