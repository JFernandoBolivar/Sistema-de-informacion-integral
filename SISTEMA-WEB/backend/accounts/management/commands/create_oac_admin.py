from django.core.management.base import BaseCommand
from django.core.exceptions import ValidationError
from accounts.models import User
import re

class Command(BaseCommand):
    help = 'Creates an admin user for the OAC department'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, required=True, help='Username for the admin user')
        parser.add_argument('--email', type=str, required=True, help='Email address for the admin user')
        parser.add_argument('--cedula', type=str, required=True, help='Cédula (8-10 digits) for the admin user')
        parser.add_argument('--password', type=str, required=True, help='Password for the admin user')
        parser.add_argument('--first_name', type=str, help='First name for the admin user')
        parser.add_argument('--last_name', type=str, help='Last name for the admin user')
        parser.add_argument('--phone', type=str, help='Phone number for the admin user')

    def validate_cedula(self, cedula):
        # Remove any non-digit characters
        digits_only = ''.join(filter(str.isdigit, cedula))
        if len(digits_only) < 8 or len(digits_only) > 10:
            raise ValidationError('Cédula must be between 8 and 10 digits')
        return digits_only

    def handle(self, *args, **options):
        try:
            # Validate cédula
            cedula = self.validate_cedula(options['cedula'])
            
            # Check if user with this cédula or username already exists
            if User.objects.filter(cedula=cedula).exists():
                self.stdout.write(self.style.ERROR(f'User with cédula {cedula} already exists'))
                return
            
            if User.objects.filter(username=options['username']).exists():
                self.stdout.write(self.style.ERROR(f'User with username {options["username"]} already exists'))
                return
            
            # Create the user
            user = User.objects.create_user(
                username=options['username'],
                email=options['email'],
                cedula=cedula,
                password=options['password'],
                first_name=options.get('first_name', ''),
                last_name=options.get('last_name', ''),
                phone=options.get('phone', ''),
                status='admin',
                department='oac'
            )
            
            # Save the user
            user.save()
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created OAC admin user: {options["username"]}')
            )
            
        except ValidationError as e:
            self.stdout.write(self.style.ERROR(str(e)))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating user: {str(e)}'))

