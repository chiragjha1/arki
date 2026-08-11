import sys
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set up path to import backend modules
sys.path.append("g:/arki")

from backend.main import app
from backend.database import Base, get_db

# Create a local test SQLite database for unit tests so we don't touch the Postgres DB
TEST_DATABASE_URL = "sqlite:///./test_arki.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestArkiAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)

    def test_01_auth_flow(self):
        # 1. Sign up a new user
        response = self.client.post(
            "/api/auth/signup",
            json={"email": "test_user@arki.ai", "password": "password123"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["email"], "test_user@arki.ai")

        # 2. Login user
        response = self.client.post(
            "/api/auth/login",
            json={"email": "test_user@arki.ai", "password": "password123"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access_token", response.json())
        self.token = response.json()["access_token"]
        
        # Save token for subsequent tests
        TestArkiAPI.token = self.token

    def test_02_capture_crud(self):
        headers = {"Authorization": f"Bearer {TestArkiAPI.token}"}

        # 1. Create a Capture (saves raw immediately as pending)
        response = self.client.post(
            "/api/captures",
            json={"raw_text": "Just read about how spaced repetition improves long term memory consolidation by strengthening neural pathways.", "source": "Cognitive Science Journal"},
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["ai_status"], "pending")
        self.assertEqual(data["source"], "Cognitive Science Journal")
        capture_id = data["id"]
        
        # 2. Verify list shows capture
        response = self.client.get("/api/captures", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(any(c["id"] == capture_id for c in response.json()))

        # 3. Soft Delete capture
        response = self.client.delete(f"/api/captures/{capture_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        
        # 4. Verify list does not show capture anymore (soft deleted)
        response = self.client.get("/api/captures", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(any(c["id"] == capture_id for c in response.json()))
        
        # 5. Verify trash shows the capture
        response = self.client.get("/api/trash", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(any(c["id"] == capture_id for c in response.json()))

        # 6. Restore capture
        response = self.client.post(f"/api/captures/{capture_id}/restore", headers=headers)
        self.assertEqual(response.status_code, 200)

        # 7. Verify list shows capture again
        response = self.client.get("/api/captures", headers=headers)
        self.assertTrue(any(c["id"] == capture_id for c in response.json()))

        # 8. Permanent delete
        response = self.client.delete(f"/api/captures/{capture_id}/permanent", headers=headers)
        self.assertEqual(response.status_code, 200)

        # 9. Verify list is empty
        response = self.client.get("/api/captures", headers=headers)
        self.assertFalse(any(c["id"] == capture_id for c in response.json()))

if __name__ == "__main__":
    unittest.main()
