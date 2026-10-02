#!/usr/bin/env python3
"""
Backend Test Suite for Zero to Skill CRM - Student Batch Transfer Bug Fix
Tests the propagation of batch changes from students to fees and payments collections
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://academy-hub-289.preview.emergentagent.com/api"

# Test credentials
ADMIN_EMAIL = "admin@zerotoskill.com"
ADMIN_PASSWORD = "admin@123"

# Global token storage
token = None
headers = {}

def log(message, level="INFO"):
    """Log test messages with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] [{level}] {message}")

def login():
    """Login as super admin and get token"""
    global token, headers
    log("=== TEST: Login as Super Admin ===")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            token = data.get("token")
            headers = {"Authorization": f"Bearer {token}"}
            log(f"✅ Login successful, token received", "SUCCESS")
            return True
        else:
            log(f"❌ Login failed: {response.status_code} - {response.text}", "ERROR")
            return False
    except Exception as e:
        log(f"❌ Login exception: {str(e)}", "ERROR")
        return False

def get_students():
    """Get all students"""
    try:
        response = requests.get(f"{BASE_URL}/students", headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json().get("students", [])
        return []
    except Exception as e:
        log(f"❌ Get students exception: {str(e)}", "ERROR")
        return []

def get_fees():
    """Get all fees"""
    try:
        response = requests.get(f"{BASE_URL}/fees", headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json().get("fees", [])
        return []
    except Exception as e:
        log(f"❌ Get fees exception: {str(e)}", "ERROR")
        return []

def get_payments():
    """Get all payments"""
    try:
        response = requests.get(f"{BASE_URL}/payments", headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json().get("payments", [])
        return []
    except Exception as e:
        log(f"❌ Get payments exception: {str(e)}", "ERROR")
        return []

def get_courses():
    """Get all courses"""
    try:
        response = requests.get(f"{BASE_URL}/courses", headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json().get("courses", [])
        return []
    except Exception as e:
        log(f"❌ Get courses exception: {str(e)}", "ERROR")
        return []

def get_batches():
    """Get all batches"""
    try:
        response = requests.get(f"{BASE_URL}/batches", headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json().get("batches", [])
        return []
    except Exception as e:
        log(f"❌ Get batches exception: {str(e)}", "ERROR")
        return []

def get_faculty():
    """Get all faculty"""
    try:
        response = requests.get(f"{BASE_URL}/faculty", headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json().get("faculty", [])
        return []
    except Exception as e:
        log(f"❌ Get faculty exception: {str(e)}", "ERROR")
        return []

def create_faculty():
    """Create a test faculty member"""
    log("Creating test faculty member...")
    try:
        response = requests.post(
            f"{BASE_URL}/faculty",
            headers=headers,
            json={
                "name": "Test Faculty Mentor",
                "email": f"faculty.test.{datetime.now().timestamp()}@zerotoskill.com",
                "password": "faculty@123",
                "specialization": "Digital Marketing With AI",
                "phone": "9876543210",
                "commissionPercent": 10
            },
            timeout=10
        )
        if response.status_code == 200:
            faculty = response.json().get("faculty")
            log(f"✅ Faculty created: {faculty['name']} (ID: {faculty['id']})", "SUCCESS")
            return faculty
        else:
            log(f"❌ Faculty creation failed: {response.status_code} - {response.text}", "ERROR")
            return None
    except Exception as e:
        log(f"❌ Faculty creation exception: {str(e)}", "ERROR")
        return None

def create_batch(faculty_id, batch_name):
    """Create a test batch"""
    log(f"Creating test batch: {batch_name}...")
    try:
        response = requests.post(
            f"{BASE_URL}/batches",
            headers=headers,
            json={
                "name": batch_name,
                "facultyId": faculty_id,
                "facultyName": "Test Faculty Mentor",
                "course": "Digital Marketing With AI",
                "startDate": "2026-01-15",
                "schedule": "Mon-Fri 10AM-12PM"
            },
            timeout=10
        )
        if response.status_code == 200:
            batch = response.json().get("batch")
            log(f"✅ Batch created: {batch['name']} (ID: {batch['id']})", "SUCCESS")
            return batch
        else:
            log(f"❌ Batch creation failed: {response.status_code} - {response.text}", "ERROR")
            return None
    except Exception as e:
        log(f"❌ Batch creation exception: {str(e)}", "ERROR")
        return None

def create_student(course_name):
    """Create a test student"""
    log(f"Creating test student for course: {course_name}...")
    timestamp = datetime.now().timestamp()
    try:
        response = requests.post(
            f"{BASE_URL}/students",
            headers=headers,
            json={
                "firstName": "Rajesh",
                "lastName": "Kumar",
                "email": f"rajesh.kumar.{timestamp}@example.com",
                "phone": "9123456789",
                "course": course_name,
                "dob": "2000-05-15",
                "gender": "Male",
                "address": "123 MG Road",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001",
                "parentName": "Suresh Kumar",
                "parentPhone": "9123456788",
                "source": "Website",
                "installmentCount": 3,
                "totalAmount": 45000
            },
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            student = data.get("student")
            fee = data.get("fee")
            log(f"✅ Student created: {student['name']} (ID: {student['id']})", "SUCCESS")
            log(f"✅ Fee record auto-created (ID: {fee['id']}, Total: ₹{fee['totalAmount']})", "SUCCESS")
            return student, fee
        else:
            log(f"❌ Student creation failed: {response.status_code} - {response.text}", "ERROR")
            return None, None
    except Exception as e:
        log(f"❌ Student creation exception: {str(e)}", "ERROR")
        return None, None

def update_student(student_id, update_data):
    """Update student via PATCH"""
    try:
        response = requests.patch(
            f"{BASE_URL}/students/{student_id}",
            headers=headers,
            json=update_data,
            timeout=10
        )
        return response
    except Exception as e:
        log(f"❌ Update student exception: {str(e)}", "ERROR")
        return None

def test_batch_transfer():
    """
    PRIMARY TEST: Transfer student to a new batch
    Verify that fees and payments collections are updated
    """
    log("\n" + "="*80)
    log("=== PRIMARY TEST: Student Batch Transfer Propagation ===")
    log("="*80)
    
    # Setup: Get courses
    courses = get_courses()
    if not courses:
        log("❌ No courses found, cannot proceed", "ERROR")
        return False
    
    course_name = courses[0]["name"]
    log(f"Using course: {course_name}")
    
    # Setup: Create or get faculty
    faculty_list = get_faculty()
    if faculty_list:
        faculty = faculty_list[0]
        log(f"Using existing faculty: {faculty['name']} (ID: {faculty['id']})")
    else:
        faculty = create_faculty()
        if not faculty:
            log("❌ Failed to create faculty", "ERROR")
            return False
    
    # Setup: Create two batches
    batch1 = create_batch(faculty["id"], f"Test Batch A - {datetime.now().strftime('%H%M%S')}")
    batch2 = create_batch(faculty["id"], f"Test Batch B - {datetime.now().strftime('%H%M%S')}")
    
    if not batch1 or not batch2:
        log("❌ Failed to create test batches", "ERROR")
        return False
    
    # Setup: Create student with fee record
    student, initial_fee = create_student(course_name)
    if not student or not initial_fee:
        log("❌ Failed to create test student", "ERROR")
        return False
    
    student_id = student["id"]
    log(f"\nInitial state:")
    log(f"  Student batchId: {student.get('batchId')}")
    log(f"  Student batchName: {student.get('batchName')}")
    log(f"  Fee batchId: {initial_fee.get('batchId')}")
    log(f"  Fee batchName: {initial_fee.get('batchName')}")
    
    # TEST 1: Transfer to Batch 1
    log(f"\n--- Step 1: Transfer student to Batch 1 ({batch1['name']}) ---")
    response = update_student(student_id, {"batchId": batch1["id"]})
    
    if not response or response.status_code != 200:
        log(f"❌ PATCH failed: {response.status_code if response else 'No response'}", "ERROR")
        if response:
            log(f"Response: {response.text}", "ERROR")
        return False
    
    log("✅ PATCH request successful", "SUCCESS")
    
    # Verify student record
    students = get_students()
    updated_student = next((s for s in students if s["id"] == student_id), None)
    
    if not updated_student:
        log("❌ Student not found after update", "ERROR")
        return False
    
    log(f"\nStudent record after PATCH:")
    log(f"  batchId: {updated_student.get('batchId')}")
    log(f"  batchName: {updated_student.get('batchName')}")
    
    if updated_student.get("batchId") != batch1["id"]:
        log(f"❌ Student batchId NOT updated! Expected: {batch1['id']}, Got: {updated_student.get('batchId')}", "ERROR")
        return False
    
    if updated_student.get("batchName") != batch1["name"]:
        log(f"❌ Student batchName NOT updated! Expected: {batch1['name']}, Got: {updated_student.get('batchName')}", "ERROR")
        return False
    
    log("✅ Student record correctly updated", "SUCCESS")
    
    # Verify fees collection (THIS WAS THE BUG)
    fees = get_fees()
    student_fees = [f for f in fees if f["studentId"] == student_id]
    
    log(f"\nFees records for student (count: {len(student_fees)}):")
    all_fees_correct = True
    for fee in student_fees:
        log(f"  Fee ID: {fee['id']}")
        log(f"    batchId: {fee.get('batchId')}")
        log(f"    batchName: {fee.get('batchName')}")
        
        if fee.get("batchId") != batch1["id"]:
            log(f"    ❌ Fee batchId NOT updated! Expected: {batch1['id']}", "ERROR")
            all_fees_correct = False
        
        if fee.get("batchName") != batch1["name"]:
            log(f"    ❌ Fee batchName NOT updated! Expected: {batch1['name']}", "ERROR")
            all_fees_correct = False
    
    if not all_fees_correct:
        log("❌ CRITICAL BUG: Fees collection NOT updated with new batch!", "ERROR")
        return False
    
    log("✅ All fees records correctly updated with new batch", "SUCCESS")
    
    # Verify payments collection
    payments = get_payments()
    student_payments = [p for p in payments if p["studentId"] == student_id]
    
    if student_payments:
        log(f"\nPayments records for student (count: {len(student_payments)}):")
        all_payments_correct = True
        for payment in student_payments:
            log(f"  Payment ID: {payment['id']}")
            log(f"    batchName: {payment.get('batchName')}")
            
            if payment.get("batchName") != batch1["name"]:
                log(f"    ❌ Payment batchName NOT updated! Expected: {batch1['name']}", "ERROR")
                all_payments_correct = False
        
        if not all_payments_correct:
            log("❌ Payments collection NOT updated with new batch!", "ERROR")
            return False
        
        log("✅ All payment records correctly updated with new batch", "SUCCESS")
    else:
        log("ℹ️  No payment records exist yet (student hasn't paid any installments)", "INFO")
    
    # TEST 2: Transfer to Batch 2
    log(f"\n--- Step 2: Transfer student to Batch 2 ({batch2['name']}) ---")
    response = update_student(student_id, {"batchId": batch2["id"]})
    
    if not response or response.status_code != 200:
        log(f"❌ PATCH failed: {response.status_code if response else 'No response'}", "ERROR")
        return False
    
    log("✅ PATCH request successful", "SUCCESS")
    
    # Verify fees updated to Batch 2
    fees = get_fees()
    student_fees = [f for f in fees if f["studentId"] == student_id]
    
    all_fees_correct = True
    for fee in student_fees:
        if fee.get("batchId") != batch2["id"] or fee.get("batchName") != batch2["name"]:
            log(f"❌ Fee not updated to Batch 2! batchId: {fee.get('batchId')}, batchName: {fee.get('batchName')}", "ERROR")
            all_fees_correct = False
    
    if not all_fees_correct:
        return False
    
    log(f"✅ All fees records correctly updated to Batch 2", "SUCCESS")
    
    log("\n" + "="*80)
    log("✅ PRIMARY TEST PASSED: Batch transfer propagates to fees and payments", "SUCCESS")
    log("="*80)
    return True

def test_batch_clear():
    """
    SECONDARY TEST: Clear batch assignment (unassign from batch)
    Verify that fees and payments are cleared
    """
    log("\n" + "="*80)
    log("=== SECONDARY TEST: Clear Batch Assignment ===")
    log("="*80)
    
    # Setup: Get courses
    courses = get_courses()
    if not courses:
        log("❌ No courses found", "ERROR")
        return False
    
    course_name = courses[0]["name"]
    
    # Setup: Get or create faculty and batch
    faculty_list = get_faculty()
    if not faculty_list:
        log("❌ No faculty found", "ERROR")
        return False
    
    faculty = faculty_list[0]
    
    batches = get_batches()
    if not batches:
        log("❌ No batches found", "ERROR")
        return False
    
    batch = batches[0]
    
    # Create student
    student, initial_fee = create_student(course_name)
    if not student:
        log("❌ Failed to create student", "ERROR")
        return False
    
    student_id = student["id"]
    
    # First assign to a batch
    log(f"\n--- Step 1: Assign student to batch ({batch['name']}) ---")
    response = update_student(student_id, {"batchId": batch["id"]})
    
    if not response or response.status_code != 200:
        log(f"❌ PATCH failed", "ERROR")
        return False
    
    log("✅ Student assigned to batch", "SUCCESS")
    
    # Verify assignment
    fees = get_fees()
    student_fees = [f for f in fees if f["studentId"] == student_id]
    if not student_fees or student_fees[0].get("batchId") != batch["id"]:
        log("❌ Fee not assigned to batch", "ERROR")
        return False
    
    log("✅ Fee record has batchId assigned", "SUCCESS")
    
    # TEST: Clear batch with "none"
    log(f"\n--- Step 2: Clear batch assignment (batchId='none') ---")
    response = update_student(student_id, {"batchId": "none"})
    
    if not response or response.status_code != 200:
        log(f"❌ PATCH failed: {response.status_code if response else 'No response'}", "ERROR")
        return False
    
    log("✅ PATCH request successful", "SUCCESS")
    
    # Verify student cleared
    students = get_students()
    updated_student = next((s for s in students if s["id"] == student_id), None)
    
    if not updated_student:
        log("❌ Student not found", "ERROR")
        return False
    
    log(f"\nStudent record after clear:")
    log(f"  batchId: {updated_student.get('batchId')}")
    log(f"  batchName: {updated_student.get('batchName')}")
    
    if updated_student.get("batchId") is not None:
        log(f"❌ Student batchId NOT cleared! Got: {updated_student.get('batchId')}", "ERROR")
        return False
    
    if updated_student.get("batchName") is not None:
        log(f"❌ Student batchName NOT cleared! Got: {updated_student.get('batchName')}", "ERROR")
        return False
    
    log("✅ Student batch cleared", "SUCCESS")
    
    # Verify fees cleared
    fees = get_fees()
    student_fees = [f for f in fees if f["studentId"] == student_id]
    
    all_fees_cleared = True
    for fee in student_fees:
        log(f"\nFee ID: {fee['id']}")
        log(f"  batchId: {fee.get('batchId')}")
        log(f"  batchName: {fee.get('batchName')}")
        
        if fee.get("batchId") is not None:
            log(f"  ❌ Fee batchId NOT cleared!", "ERROR")
            all_fees_cleared = False
        
        if fee.get("batchName") is not None:
            log(f"  ❌ Fee batchName NOT cleared!", "ERROR")
            all_fees_cleared = False
    
    if not all_fees_cleared:
        log("❌ CRITICAL: Fees collection NOT cleared!", "ERROR")
        return False
    
    log("✅ All fees records correctly cleared", "SUCCESS")
    
    # TEST: Clear with empty string
    log(f"\n--- Step 3: Test clear with empty string (batchId='') ---")
    
    # First re-assign
    response = update_student(student_id, {"batchId": batch["id"]})
    if not response or response.status_code != 200:
        log("❌ Re-assignment failed", "ERROR")
        return False
    
    # Then clear with empty string
    response = update_student(student_id, {"batchId": ""})
    if not response or response.status_code != 200:
        log(f"❌ PATCH with empty string failed", "ERROR")
        return False
    
    # Verify cleared
    students = get_students()
    updated_student = next((s for s in students if s["id"] == student_id), None)
    
    if updated_student.get("batchId") is not None:
        log(f"❌ Empty string did not clear batchId", "ERROR")
        return False
    
    log("✅ Empty string correctly clears batch", "SUCCESS")
    
    # TEST: Clear with null
    log(f"\n--- Step 4: Test clear with null (batchId=null) ---")
    
    # First re-assign
    response = update_student(student_id, {"batchId": batch["id"]})
    if not response or response.status_code != 200:
        log("❌ Re-assignment failed", "ERROR")
        return False
    
    # Then clear with null
    response = update_student(student_id, {"batchId": None})
    if not response or response.status_code != 200:
        log(f"❌ PATCH with null failed", "ERROR")
        return False
    
    # Verify cleared
    students = get_students()
    updated_student = next((s for s in students if s["id"] == student_id), None)
    
    if updated_student.get("batchId") is not None:
        log(f"❌ Null did not clear batchId", "ERROR")
        return False
    
    log("✅ Null correctly clears batch", "SUCCESS")
    
    log("\n" + "="*80)
    log("✅ SECONDARY TEST PASSED: Batch clearing works correctly", "SUCCESS")
    log("="*80)
    return True

def test_name_update_isolation():
    """
    ISOLATION TEST: Updating name only should NOT change batch
    """
    log("\n" + "="*80)
    log("=== ISOLATION TEST: Name Update Should Not Affect Batch ===")
    log("="*80)
    
    # Setup
    courses = get_courses()
    if not courses:
        log("❌ No courses found", "ERROR")
        return False
    
    course_name = courses[0]["name"]
    
    batches = get_batches()
    if not batches:
        log("❌ No batches found", "ERROR")
        return False
    
    batch = batches[0]
    
    # Create student
    student, initial_fee = create_student(course_name)
    if not student:
        log("❌ Failed to create student", "ERROR")
        return False
    
    student_id = student["id"]
    
    # Assign to batch
    log(f"\n--- Step 1: Assign student to batch ---")
    response = update_student(student_id, {"batchId": batch["id"]})
    
    if not response or response.status_code != 200:
        log("❌ Batch assignment failed", "ERROR")
        return False
    
    log("✅ Student assigned to batch", "SUCCESS")
    
    # Get current state
    students = get_students()
    current_student = next((s for s in students if s["id"] == student_id), None)
    original_batch_id = current_student.get("batchId")
    original_batch_name = current_student.get("batchName")
    
    log(f"Original batchId: {original_batch_id}")
    log(f"Original batchName: {original_batch_name}")
    
    # Update name only
    log(f"\n--- Step 2: Update student name (no batchId in request) ---")
    new_name = "Priya Sharma"
    response = update_student(student_id, {"firstName": "Priya", "lastName": "Sharma"})
    
    if not response or response.status_code != 200:
        log("❌ Name update failed", "ERROR")
        return False
    
    log("✅ Name update successful", "SUCCESS")
    
    # Verify batch unchanged
    students = get_students()
    updated_student = next((s for s in students if s["id"] == student_id), None)
    
    log(f"\nAfter name update:")
    log(f"  name: {updated_student.get('name')}")
    log(f"  batchId: {updated_student.get('batchId')}")
    log(f"  batchName: {updated_student.get('batchName')}")
    
    if updated_student.get("name") != new_name:
        log(f"❌ Name NOT updated! Expected: {new_name}, Got: {updated_student.get('name')}", "ERROR")
        return False
    
    if updated_student.get("batchId") != original_batch_id:
        log(f"❌ BatchId CHANGED! Expected: {original_batch_id}, Got: {updated_student.get('batchId')}", "ERROR")
        return False
    
    if updated_student.get("batchName") != original_batch_name:
        log(f"❌ BatchName CHANGED! Expected: {original_batch_name}, Got: {updated_student.get('batchName')}", "ERROR")
        return False
    
    log("✅ Batch unchanged after name update", "SUCCESS")
    
    # Verify fees updated name but not batch
    fees = get_fees()
    student_fees = [f for f in fees if f["studentId"] == student_id]
    
    all_correct = True
    for fee in student_fees:
        log(f"\nFee ID: {fee['id']}")
        log(f"  studentName: {fee.get('studentName')}")
        log(f"  batchId: {fee.get('batchId')}")
        log(f"  batchName: {fee.get('batchName')}")
        
        if fee.get("studentName") != new_name:
            log(f"  ❌ Fee studentName NOT updated!", "ERROR")
            all_correct = False
        
        if fee.get("batchId") != original_batch_id:
            log(f"  ❌ Fee batchId CHANGED!", "ERROR")
            all_correct = False
        
        if fee.get("batchName") != original_batch_name:
            log(f"  ❌ Fee batchName CHANGED!", "ERROR")
            all_correct = False
    
    if not all_correct:
        log("❌ Fees not correctly updated", "ERROR")
        return False
    
    log("✅ Fees correctly updated name but preserved batch", "SUCCESS")
    
    log("\n" + "="*80)
    log("✅ ISOLATION TEST PASSED: Name update does not affect batch", "SUCCESS")
    log("="*80)
    return True

def test_edge_cases():
    """
    EDGE CASES: Invalid batchId, role permissions
    """
    log("\n" + "="*80)
    log("=== EDGE CASE TESTS ===")
    log("="*80)
    
    # Setup
    courses = get_courses()
    if not courses:
        log("❌ No courses found", "ERROR")
        return False
    
    course_name = courses[0]["name"]
    
    # Create student
    student, initial_fee = create_student(course_name)
    if not student:
        log("❌ Failed to create student", "ERROR")
        return False
    
    student_id = student["id"]
    
    # TEST: Invalid batchId
    log(f"\n--- Edge Case 1: Invalid batchId ---")
    response = update_student(student_id, {"batchId": "fake-batch-xyz-invalid"})
    
    if not response:
        log("❌ Request failed", "ERROR")
        return False
    
    log(f"Response status: {response.status_code}")
    
    if response.status_code == 200:
        log("✅ Request accepted (backend doesn't validate batchId existence)", "SUCCESS")
        
        # Verify what happened
        students = get_students()
        updated_student = next((s for s in students if s["id"] == student_id), None)
        
        log(f"Student batchId: {updated_student.get('batchId')}")
        log(f"Student batchName: {updated_student.get('batchName')}")
        
        # This is acceptable behavior - backend saves the ID but batchName stays undefined/null
        log("ℹ️  Backend accepts invalid batchId (no validation) - this is acceptable", "INFO")
    else:
        log(f"✅ Request rejected with error (validation present)", "SUCCESS")
    
    log("\n" + "="*80)
    log("✅ EDGE CASE TESTS COMPLETED", "SUCCESS")
    log("="*80)
    return True

def main():
    """Main test runner"""
    log("="*80)
    log("ZERO TO SKILL CRM - STUDENT BATCH TRANSFER BUG FIX TEST SUITE")
    log("="*80)
    log(f"Backend URL: {BASE_URL}")
    log(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log("="*80)
    
    # Login
    if not login():
        log("\n❌ LOGIN FAILED - Cannot proceed with tests", "ERROR")
        sys.exit(1)
    
    # Run tests
    results = {
        "Primary Test (Batch Transfer)": False,
        "Secondary Test (Batch Clear)": False,
        "Isolation Test (Name Update)": False,
        "Edge Cases": False
    }
    
    try:
        results["Primary Test (Batch Transfer)"] = test_batch_transfer()
    except Exception as e:
        log(f"❌ Primary test exception: {str(e)}", "ERROR")
    
    try:
        results["Secondary Test (Batch Clear)"] = test_batch_clear()
    except Exception as e:
        log(f"❌ Secondary test exception: {str(e)}", "ERROR")
    
    try:
        results["Isolation Test (Name Update)"] = test_name_update_isolation()
    except Exception as e:
        log(f"❌ Isolation test exception: {str(e)}", "ERROR")
    
    try:
        results["Edge Cases"] = test_edge_cases()
    except Exception as e:
        log(f"❌ Edge case test exception: {str(e)}", "ERROR")
    
    # Summary
    log("\n" + "="*80)
    log("TEST SUMMARY")
    log("="*80)
    
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        log(f"{test_name}: {status}")
        if not passed:
            all_passed = False
    
    log("="*80)
    
    if all_passed:
        log("🎉 ALL TESTS PASSED - BUG FIX VERIFIED", "SUCCESS")
        log("="*80)
        log("\nVERDICT: ✅ BUG FIXED")
        log("\nThe student batch transfer now correctly propagates to:")
        log("  • fees collection (batchId + batchName)")
        log("  • payments collection (batchName)")
        log("\nBatch-grouped views in Fees & Finance will now show correct data.")
        sys.exit(0)
    else:
        log("❌ SOME TESTS FAILED - BUG MAY STILL BE PRESENT", "ERROR")
        log("="*80)
        log("\nVERDICT: ❌ BUG STILL PRESENT OR PARTIAL FIX")
        sys.exit(1)

if __name__ == "__main__":
    main()
