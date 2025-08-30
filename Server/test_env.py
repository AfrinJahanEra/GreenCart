import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("Testing Environment Variables:")
print("=" * 40)
print(f"ORACLE_USER: '{os.getenv('ORACLE_USER')}'")
print(f"ORACLE_PASSWORD: '{os.getenv('ORACLE_PASSWORD')}'")
print(f"ORACLE_HOST: '{os.getenv('ORACLE_HOST')}'")
print(f"ORACLE_PORT: '{os.getenv('ORACLE_PORT')}'")
print(f"ORACLE_NAME: '{os.getenv('ORACLE_NAME')}'")
print("=" * 40)

# Test Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'greencart.settings')
import django
django.setup()

from django.conf import settings
db_config = settings.DATABASES['default']

print("Django Database Configuration:")
print("=" * 40)
print(f"ENGINE: {db_config['ENGINE']}")
print(f"NAME: {db_config['NAME']}")
print(f"USER: {db_config['USER']}")
print(f"PASSWORD: {db_config['PASSWORD']}")
print(f"HOST: {db_config['HOST']}")
print(f"PORT: {db_config['PORT']}")