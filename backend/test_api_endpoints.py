import sys
import os
import requests

def run_api_tests():
    base_url = "http://127.0.0.1:8000/api/v1"
    
    print("Testing connection to uvicorn server at", base_url)
    
    # 1. Login
    login_data = {
        "email": "admin@test.com",
        "password": "Admin@123"
    }
    
    try:
        r = requests.post(f"{base_url}/auth/login", json=login_data)
    except Exception as e:
        print("ERROR: Could not connect to backend server. Make sure it is running on port 8000.", e)
        sys.exit(1)
        
    if r.status_code != 200:
        print(f"ERROR: Login failed with status code {r.status_code}. Response: {r.text}")
        sys.exit(1)
        
    token_json = r.json()
    token = token_json["access_token"]
    print("Successfully logged in! Access token retrieved.")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # 2. Get Model Info
    print("\n--- Testing Model Info Endpoint ---")
    r_info = requests.get(f"{base_url}/predictions/model-info", headers=headers)
    print("Model Info status code:", r_info.status_code)
    if r_info.status_code == 200:
        print("Model Info payload:")
        print(r_info.json())
    else:
        print("ERROR:", r_info.text)
        
    # 3. Get Dashboard Model Info
    print("\n--- Testing Dashboard Model Endpoint ---")
    r_dash = requests.get(f"{base_url}/dashboard/model", headers=headers)
    print("Dashboard Model status code:", r_dash.status_code)
    if r_dash.status_code == 200:
        dash_json = r_dash.json()
        print("Dashboard Model algorithm:", dash_json.get("algorithm"))
        print("Dashboard Model dataset size:", dash_json.get("training_dataset_size"))
        print("Dashboard Model version:", dash_json.get("prediction_version"))
        print("Dashboard Model features count:", dash_json.get("features_count"))
        print("Top 5 Overall Feature Weights:")
        for idx, item in enumerate(dash_json.get("feature_importance", [])[:5]):
            print(f"  #{idx+1} {item['label']} ({item['feature']}): {item['importance']}%")
    else:
        print("ERROR:", r_dash.text)
        
    # 4. Get Student list to find a student ID
    print("\n--- Testing Student List Endpoint ---")
    r_studs = requests.get(f"{base_url}/students?limit=5", headers=headers)
    print("Student List status code:", r_studs.status_code)
    if r_studs.status_code != 200:
        print("ERROR: Failed to retrieve students list.", r_studs.text)
        sys.exit(1)
        
    studs_json = r_studs.json()
    students_list = studs_json.get("results", [])
    if not students_list:
        print("WARNING: No students found in database. Cannot run prediction test.")
        return
        
    first_student = students_list[0]
    student_id = first_student["id"]
    student_name = first_student["full_name"]
    print(f"Found student: {student_name} (ID: {student_id})")
    
    # 5. Run prediction
    print(f"\n--- Testing Single Student Prediction Endpoint for student ID {student_id} ---")
    r_pred = requests.post(f"{base_url}/predictions/student/{student_id}", headers=headers)
    print("Prediction status code:", r_pred.status_code)
    if r_pred.status_code == 200:
        pred_json = r_pred.json()
        print("Prediction Result payload:")
        print(f"  Student Name: {pred_json['full_name']}")
        print(f"  Dropout Status prediction: {pred_json['prediction']}")
        print(f"  Dropout Probability ('Yes'): {pred_json['probability']}")
        print(f"  AI Confidence: {pred_json['confidence']}")
        print(f"  Risk Level: {pred_json['risk_level']}")
        print(f"  Probabilities Mapping: {pred_json.get('probabilities')}")
        print("  Top Explanations:")
        for exp in pred_json.get("top_features", []):
            print(f"    - {exp['label']}: {exp['importance']}% - {exp['reason']}")
        print("  Recommended Actions:")
        for rec in pred_json.get("recommended_actions", []):
            print(f"    - {rec}")
    else:
        print("ERROR:", r_pred.text)
        
    # 6. Prediction History
    print(f"\n--- Testing Prediction History Endpoint for student ID {student_id} ---")
    r_hist = requests.get(f"{base_url}/predictions/history/{student_id}", headers=headers)
    print("History status code:", r_hist.status_code)
    if r_hist.status_code == 200:
        hist_json = r_hist.json()
        print(f"Retrieved {len(hist_json)} historical records. Latest record:")
        if hist_json:
            latest = hist_json[0]
            print(f"  Dropout Risk: {latest['dropout_risk']}")
            print(f"  Dropout Status: {latest['dropout_status']}")
            print(f"  Model Version: {latest['model_version']}")
    else:
        print("ERROR:", r_hist.text)
        
    print("\nAPI VERIFICATION ENDPOINT TESTS COMPLETE!")

if __name__ == "__main__":
    run_api_tests()
