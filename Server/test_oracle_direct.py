import oracledb
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_oracle_connection():
    print("Testing Direct Oracle Connection...")
    print("=" * 50)
    
    # Get credentials from .env file
    user = os.getenv('ORACLE_USER', 'system')
    password = os.getenv('ORACLE_PASSWORD', '123')
    host = os.getenv('ORACLE_HOST', 'localhost')
    port = os.getenv('ORACLE_PORT', '1521')
    service_name = os.getenv('ORACLE_NAME', 'xe')
    
    print(f"User: {user}")
    print(f"Password: {'*' * len(password)} (actual: {password})")
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"Service Name: {service_name}")
    print("-" * 50)
    
    try:
        # Try to initialize Oracle client (thick mode)
        try:
            oracledb.init_oracle_client()
            print("✓ Oracle thick client initialized")
        except Exception as e:
            print(f"⚠ Using thin mode: {e}")
        
        # Test different connection methods
        connection_strings = [
            f"{host}:{port}/{service_name}",
            f"{host}:{port}/XE",
            f"localhost:1521/xe",
            f"localhost:1521/XE"
        ]
        
        for dsn in connection_strings:
            print(f"\nTrying connection string: {dsn}")
            try:
                connection = oracledb.connect(
                    user=user,
                    password=password,
                    dsn=dsn
                )
                
                print("✓ SUCCESS: Connected to Oracle Database!")
                
                # Test a simple query
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 'Connection Test' FROM dual")
                    result = cursor.fetchone()
                    print(f"✓ Query result: {result[0]}")
                
                connection.close()
                print("✓ Connection closed successfully")
                return True
                
            except oracledb.DatabaseError as e:
                error_obj, = e.args
                print(f"✗ Failed with DSN {dsn}:")
                print(f"  Error Code: {error_obj.code}")
                print(f"  Error Message: {error_obj.message}")
                continue
                
    except Exception as e:
        print(f"✗ GENERAL ERROR: {e}")
        
    return False

if __name__ == "__main__":
    success = test_oracle_connection()
    if not success:
        print("\n" + "=" * 50)
        print("TROUBLESHOOTING TIPS:")
        print("1. Check if Oracle XE service is running:")
        print("   - Open Services (services.msc)")
        print("   - Look for 'OracleServiceXE' and ensure it's Started")
        print("\n2. Try common passwords:")
        print("   - oracle")
        print("   - password")
        print("   - admin")
        print("   - (your installation password)")
        print("\n3. Try SQL*Plus to test connection:")
        print("   sqlplus system/123@localhost:1521/xe")