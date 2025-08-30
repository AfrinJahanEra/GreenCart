#!/usr/bin/env python3

import os
import sys
import django
from pathlib import Path

# Add the parent directory to the Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'greencart.settings')
django.setup()

from django.db import connection
import hashlib

def add_delivery_agents():
    """Add sample delivery agents to the database"""
    
    delivery_agents = [
        {
            'username': 'delivery1',
            'email': 'delivery1@example.com',
            'password': '1234',
            'first_name': 'John',
            'last_name': 'Delivery',
            'phone': '1234567890',
            'address': '123 Delivery St',
        },
        {
            'username': 'delivery2', 
            'email': 'delivery2@example.com',
            'password': '1234',
            'first_name': 'Jane',
            'last_name': 'Courier',
            'phone': '2345678901',
            'address': '456 Courier Ave',
        },
        {
            'username': 'delivery3',
            'email': 'delivery3@example.com', 
            'password': '1234',
            'first_name': 'Mike',
            'last_name': 'Express',
            'phone': '3456789012',
            'address': '789 Express Blvd',
        },
    ]
    
    secret_key = 'DELIVERY_SECRET_789'
    role_name = 'delivery_agent'
    
    with connection.cursor() as cursor:
        for agent in delivery_agents:
            try:
                # Hash password
                password_hash = hashlib.sha256(agent['password'].encode()).hexdigest()
                
                print(f"Adding delivery agent: {agent['username']}")
                
                # Call signup_user procedure
                cursor.callproc('signup_user', [
                    agent['username'],
                    agent['email'], 
                    password_hash,
                    agent['first_name'],
                    agent['last_name'],
                    agent['phone'],
                    agent['address'],
                    role_name,
                    secret_key
                ])
                
                print(f"✅ Successfully added delivery agent: {agent['username']}")
                
            except Exception as e:
                error_str = str(e)
                if 'already exists' in error_str.lower():
                    print(f"⚠️  Delivery agent {agent['username']} already exists, skipping...")
                else:
                    print(f"❌ Failed to add delivery agent {agent['username']}: {error_str}")
    
    # Verify the delivery agents were created
    print("\n=== Verifying Delivery Agents ===")
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                u.user_id,
                u.username,
                u.email,
                u.first_name || ' ' || u.last_name AS full_name,
                da.agent_id,
                da.vehicle_type,
                da.is_active
            FROM users u
            JOIN user_roles ur ON u.user_id = ur.user_id
            JOIN roles r ON ur.role_id = r.role_id
            JOIN delivery_agents da ON u.user_id = da.user_id
            WHERE r.role_name = 'delivery_agent'
            ORDER BY u.username
        """)
        
        agents = cursor.fetchall()
        if agents:
            print(f"Found {len(agents)} delivery agents:")
            for agent in agents:
                user_id, username, email, full_name, agent_id, vehicle_type, is_active = agent
                status = "Active" if is_active == 1 else "Inactive"
                print(f"  - {username} ({full_name}) | Agent ID: {agent_id} | {status}")
        else:
            print("No delivery agents found!")

if __name__ == '__main__':
    print("Adding sample delivery agents to database...")
    add_delivery_agents()
    print("Done!")