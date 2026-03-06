import requests

print("Fetching demo users...")
r = requests.get('http://localhost:8000/api/auth/demo-users')
users = r.json()
print(f"Found {len(users)} users.")
for u in users:
    print(f"- {u['full_name']} (Company: {u['company_id']}, Role: {u['role']})")
