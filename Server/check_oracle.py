import os
import django
from django.conf import settings

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'greencart.settings')
django.setup()

from django.db import connection

def test_django_db_connection():
    print("Testing Django database connection...")
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM v$version")
            version = cursor.fetchone()
            print(f"✓ SUCCESS: Connected to Oracle {version[0]}")
            
            # Test if we can access user tables
            cursor.execute("""
                SELECT table_name FROM all_tables 
                WHERE owner = 'C##DBMS' AND rownum <= 5
            """)
            tables = cursor.fetchall()
            print(f"Found {len(tables)} tables in C##DBMS schema")
            for table in tables:
                print(f"  - {table[0]}")
                
        return True
        
    except Exception as e:
        print(f"✗ FAILED: {e}")
        return False

if __name__ == "__main__":
    test_django_db_connection()