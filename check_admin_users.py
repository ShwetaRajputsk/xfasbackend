#!/usr/bin/env python3
"""
Script to check all admin users in the database
This helps identify what credentials exist in your deployed database
"""

import asyncio
import os
import sys
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.user import UserRole

# Load environment variables
load_dotenv()

async def list_all_admin_users():
    """List all admin users in the database"""
    
    try:
        # Database connection
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'xfas_logistics')
        
        print(f"🔗 Connecting to MongoDB...")
        print(f"📊 Database: {db_name}")
        print(f"🔗 URL: {mongo_url[:50]}..." if len(mongo_url) > 50 else f"🔗 URL: {mongo_url}")
        print()
        
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Database connection successful!\n")
        
        # Find all users with admin roles
        admin_roles = [
            UserRole.SUPER_ADMIN.value,
            UserRole.ADMIN.value,
            UserRole.MANAGER.value,
            'SUPER_ADMIN',
            'ADMIN',
            'MANAGER',
            'super_admin',
            'admin',
            'manager'
        ]
        
        # Query for admin users
        admin_users = await db.users.find({
            "$or": [
                {"role": {"$in": admin_roles}},
                {"email": {"$regex": "admin", "$options": "i"}}
            ]
        }).to_list(length=100)
        
        if not admin_users:
            print("❌ No admin users found in the database!")
            print("\n💡 You need to create an admin user.")
            print("   Run: python setup_admin_user.py")
            return
        
        print(f"👑 Found {len(admin_users)} admin user(s):\n")
        print("=" * 80)
        
        for idx, user in enumerate(admin_users, 1):
            print(f"\n👤 Admin User #{idx}")
            print("-" * 80)
            print(f"📧 Email: {user.get('email', 'N/A')}")
            print(f"👤 Name: {user.get('first_name', '')} {user.get('last_name', '')}")
            print(f"🏷️  Role: {user.get('role', 'USER')}")
            print(f"👤 Type: {user.get('user_type', 'INDIVIDUAL')}")
            print(f"✅ Active: {user.get('is_active', False)}")
            print(f"🔐 Verified: {user.get('is_verified', False)}")
            print(f"📧 Email Verified: {user.get('is_email_verified', False)}")
            print(f"📱 Phone Verified: {user.get('is_phone_verified', False)}")
            print(f"📱 Phone: {user.get('phone', 'N/A')}")
            print(f"🆔 User ID: {user.get('id', 'N/A')}")
            print(f"📅 Created: {user.get('created_at', 'N/A')}")
            
            # Check if password hash exists
            has_password = bool(user.get('password_hash'))
            print(f"🔐 Has Password: {'Yes' if has_password else 'No'}")
            
            if has_password:
                password_hash = user.get('password_hash', '')
                print(f"🔐 Password Hash: {password_hash[:20]}..." if len(password_hash) > 20 else f"🔐 Password Hash: {password_hash}")
        
        print("\n" + "=" * 80)
        print("\n💡 Common Admin Credentials to Try:")
        print("   1. Email: admin@xfas.in | Password: XFasAdmin@2024")
        print("   2. Email: admin@xfas.com | Password: XFasAdmin@2024")
        print("   3. Email: admin@xfas.in | Password: admin123")
        print("   4. Email: admin@xfas.in | Password: Admin@123")
        print("   5. Check the emails above and try common passwords")
        
        # Also check for any users with admin-like emails
        print("\n📋 All Users with 'admin' in email:")
        all_admin_emails = await db.users.find({
            "email": {"$regex": "admin", "$options": "i"}
        }).to_list(length=50)
        
        if all_admin_emails:
            for user in all_admin_emails:
                print(f"   - {user.get('email')} (Role: {user.get('role', 'USER')})")
        else:
            print("   None found")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Main function"""
    print("🔍 XFas Logistics - Admin User Checker")
    print("=" * 80)
    print()
    
    success = await list_all_admin_users()
    
    if success:
        print("\n" + "=" * 80)
        print("✅ Check complete!")
        print("=" * 80)
        print("\n💡 If you can't find the right credentials:")
        print("   1. Try the common credentials listed above")
        print("   2. Reset password: python setup_admin_user.py")
        print("   3. Create new admin: python create_admin.py")
    else:
        print("\n❌ Failed to check admin users")
        print("Please check your MongoDB connection and try again.")

if __name__ == "__main__":
    asyncio.run(main())


