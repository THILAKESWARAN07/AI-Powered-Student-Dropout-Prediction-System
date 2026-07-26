import io
import csv
from datetime import datetime, timezone
import datetime as dt
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from openpyxl import Workbook

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.models.school import School
from app.models.student import (
    Student, StudentAcademics, StudentAttendance, 
    StudentBehaviour, StudentFamily, StudentHealth, 
    StudentTechnology, StudentPrediction
)
from app.schemas.dashboard import (
    DashboardSummaryResponse, DashboardChartsResponse,
    RecentPredictionItem, ModelDetailsResponse
)
from app.core.logging import logger

router = APIRouter()

def get_filtered_query(
    db: Session,
    current_user: User,
    school_id: Optional[int] = None,
    class_name: Optional[str] = None,
    section: Optional[str] = None,
    gender: Optional[str] = None,
    community: Optional[str] = None,
    attendance_min: Optional[float] = None,
    attendance_max: Optional[float] = None,
    marks_min: Optional[float] = None,
    marks_max: Optional[float] = None,
    risk_level: Optional[str] = None,
    financial_difficulty: Optional[str] = None,
    child_labour_risk: Optional[str] = None,
    low_motivation: Optional[str] = None,
    academic_backlogs: Optional[str] = None,
    date_min: Optional[str] = None,
    date_max: Optional[str] = None
):
    # Subquery for latest prediction ID per student
    latest_pred_sub = db.query(
        StudentPrediction.student_id,
        func.max(StudentPrediction.id).label("latest_id")
    ).group_by(StudentPrediction.student_id).subquery()
    
    # Main query selecting scalar columns for optimal performance
    query = db.query(
        Student.id,
        Student.student_id,
        Student.full_name,
        Student.school_id,
        func.coalesce(School.school_name, "Unknown").label("school_name"),
        Student.gender,
        Student.community,
        Student.class_name,
        Student.section,
        Student.age,
        StudentAttendance.attendance_percentage,
        StudentAcademics.overall_percentage,
        StudentAcademics.academic_backlogs,
        StudentFamily.financial_difficulty,
        StudentFamily.child_labour_risk,
        StudentBehaviour.low_motivation,
        StudentPrediction.dropout_risk,
        StudentPrediction.confidence,
        StudentPrediction.predicted_at
    ).outerjoin(
        School, School.id == Student.school_id
    ).outerjoin(
        StudentAcademics, StudentAcademics.student_id == Student.id
    ).outerjoin(
        StudentAttendance, StudentAttendance.student_id == Student.id
    ).outerjoin(
        StudentBehaviour, StudentBehaviour.student_id == Student.id
    ).outerjoin(
        StudentFamily, StudentFamily.student_id == Student.id
    ).outerjoin(
        latest_pred_sub, latest_pred_sub.c.student_id == Student.id
    ).outerjoin(
        StudentPrediction, StudentPrediction.id == latest_pred_sub.c.latest_id
    ).filter(
        Student.is_deleted == False
    )
    
    # Scoping based on user role
    if current_user.role in ["headmaster", "teacher"]:
        query = query.filter(Student.school_id == current_user.school_id)
    elif school_id:
        query = query.filter(Student.school_id == school_id)
        
    # Apply filters
    if class_name:
        query = query.filter(Student.class_name == class_name)
    if section:
        query = query.filter(Student.section == section)
    if gender:
        query = query.filter(Student.gender == gender)
    if community:
        query = query.filter(Student.community == community)
    if attendance_min is not None:
        query = query.filter(StudentAttendance.attendance_percentage >= attendance_min)
    if attendance_max is not None:
        query = query.filter(StudentAttendance.attendance_percentage <= attendance_max)
    if marks_min is not None:
        query = query.filter(StudentAcademics.overall_percentage >= marks_min)
    if marks_max is not None:
        query = query.filter(StudentAcademics.overall_percentage <= marks_max)
    if risk_level:
        query = query.filter(StudentPrediction.dropout_risk == risk_level)
    if financial_difficulty:
        query = query.filter(StudentFamily.financial_difficulty == financial_difficulty)
    if child_labour_risk:
        query = query.filter(StudentFamily.child_labour_risk == child_labour_risk)
    if low_motivation:
        query = query.filter(StudentBehaviour.low_motivation == low_motivation)
    if academic_backlogs:
        query = query.filter(StudentAcademics.academic_backlogs == academic_backlogs)
        
    if date_min:
        try:
            d_min = datetime.strptime(date_min, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            query = query.filter(StudentPrediction.predicted_at >= d_min)
        except ValueError:
            pass
    if date_max:
        try:
            d_max = datetime.strptime(date_max, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            d_max = d_max + dt.timedelta(days=1)
            query = query.filter(StudentPrediction.predicted_at < d_max)
        except ValueError:
            pass
            
    return query

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_summary(
    school_id: Optional[int] = None,
    class_name: Optional[str] = None,
    section: Optional[str] = None,
    gender: Optional[str] = None,
    community: Optional[str] = None,
    attendance_min: Optional[float] = None,
    attendance_max: Optional[float] = None,
    marks_min: Optional[float] = None,
    marks_max: Optional[float] = None,
    risk_level: Optional[str] = None,
    financial_difficulty: Optional[str] = None,
    child_labour_risk: Optional[str] = None,
    low_motivation: Optional[str] = None,
    academic_backlogs: Optional[str] = None,
    date_min: Optional[str] = None,
    date_max: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Pre-filter counts for debugging
        student_count_before = db.query(Student).filter(Student.is_deleted == False).count()
        prediction_count_before = db.query(StudentPrediction).count()

        query = get_filtered_query(
            db, current_user, school_id, class_name, section, gender, community,
            attendance_min, attendance_max, marks_min, marks_max, risk_level,
            financial_difficulty, child_labour_risk, low_motivation, academic_backlogs,
            date_min, date_max
        )
        rows = query.all()
        
        total_students = len(rows)
        pred_rows = [r for r in rows if r.dropout_risk is not None]
        total_predictions = len(pred_rows)
        
        high_count = sum(1 for r in pred_rows if r.dropout_risk == "High")
        medium_count = sum(1 for r in pred_rows if r.dropout_risk == "Medium")
        low_count = sum(1 for r in pred_rows if r.dropout_risk == "Low")
        
        conf_sum = sum(r.confidence for r in pred_rows if r.confidence is not None)
        avg_confidence = conf_sum / total_predictions if total_predictions > 0 else 0.0
        
        from app.services import model_loader
        metrics = model_loader.get_model_metrics() or {}
        model_accuracy = metrics.get("accuracy", 0.9205) * 100
        roc_auc = metrics.get("roc_auc", 0.9535) * 100
        
        logger.info(
            f"[DASHBOARD SUMMARY] "
            f"Current User ID: {current_user.id} | Current Role: {current_user.role} | Current School ID: {current_user.school_id} | "
            f"Student Count Before Filters: {student_count_before} | Student Count After Filters: {total_students} | "
            f"Prediction Count Before Filters: {prediction_count_before} | Prediction Count After Filters: {total_predictions} | "
            f"High Risk Count: {high_count} | Medium Risk Count: {medium_count} | Low Risk Count: {low_count}"
        )

        return {
            "total_students": total_students,
            "total_predictions": total_predictions,
            "high_risk_count": high_count,
            "medium_risk_count": medium_count,
            "low_risk_count": low_count,
            "avg_confidence": round(avg_confidence, 2),
            "model_accuracy": round(model_accuracy, 2),
            "roc_auc": round(roc_auc, 2)
        }
    except Exception as e:
        logger.error(f"Error fetching dashboard summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate dashboard summary: {str(e)}"
        )

@router.get("/charts", response_model=DashboardChartsResponse)
def get_charts(
    school_id: Optional[int] = None,
    class_name: Optional[str] = None,
    section: Optional[str] = None,
    gender: Optional[str] = None,
    community: Optional[str] = None,
    attendance_min: Optional[float] = None,
    attendance_max: Optional[float] = None,
    marks_min: Optional[float] = None,
    marks_max: Optional[float] = None,
    risk_level: Optional[str] = None,
    financial_difficulty: Optional[str] = None,
    child_labour_risk: Optional[str] = None,
    low_motivation: Optional[str] = None,
    academic_backlogs: Optional[str] = None,
    date_min: Optional[str] = None,
    date_max: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Pre-filter counts for debugging
        student_count_before = db.query(Student).filter(Student.is_deleted == False).count()
        prediction_count_before = db.query(StudentPrediction).count()

        query = get_filtered_query(
            db, current_user, school_id, class_name, section, gender, community,
            attendance_min, attendance_max, marks_min, marks_max, risk_level,
            financial_difficulty, child_labour_risk, low_motivation, academic_backlogs,
            date_min, date_max
        )
        rows = query.all()
        total_students = len(rows)
        total_predictions = sum(1 for r in rows if r.dropout_risk is not None)

        logger.info(
            f"[DASHBOARD CHARTS] "
            f"Current User ID: {current_user.id} | Current Role: {current_user.role} | Current School ID: {current_user.school_id} | "
            f"Student Count Before Filters: {student_count_before} | Student Count After Filters: {total_students} | "
            f"Prediction Count Before Filters: {prediction_count_before} | Prediction Count After Filters: {total_predictions}"
        )
        
        # 1. Risk Distribution
        risk_dist = {"High": 0, "Medium": 0, "Low": 0}
        for r in rows:
            if r.dropout_risk:
                risk_dist[r.dropout_risk] += 1
        risk_dist_list = [{"name": k, "value": v} for k, v in risk_dist.items()]
        
        # 2. Prediction Trend
        trend_dict = {}
        for r in rows:
            if r.dropout_risk and r.predicted_at:
                d_str = r.predicted_at.strftime("%Y-%m-%d")
                if d_str not in trend_dict:
                    trend_dict[d_str] = {"High": 0, "Medium": 0, "Low": 0}
                trend_dict[d_str][r.dropout_risk] += 1
        sorted_trend = sorted(trend_dict.items())
        trend_list = [{"date": k, "High": v["High"], "Medium": v["Medium"], "Low": v["Low"]} for k, v in sorted_trend]
        
        # 3. Attendance Distribution
        att_brackets = {"< 60%": 0, "60%-75%": 0, "75%-85%": 0, "85%-100%": 0}
        for r in rows:
            pct = r.attendance_percentage
            if pct is not None:
                if pct < 60:
                    att_brackets["< 60%"] += 1
                elif pct < 75:
                    att_brackets["60%-75%"] += 1
                elif pct < 85:
                    att_brackets["75%-85%"] += 1
                else:
                    att_brackets["85%-100%"] += 1
        att_list = [{"name": k, "value": v} for k, v in att_brackets.items()]
        
        # 4. Academics Distribution
        acad_brackets = {"< 50%": 0, "50%-65%": 0, "65%-80%": 0, "80%-100%": 0}
        for r in rows:
            pct = r.overall_percentage
            if pct is not None:
                if pct < 50:
                    acad_brackets["< 50%"] += 1
                elif pct < 65:
                    acad_brackets["50%-65%"] += 1
                elif pct < 80:
                    acad_brackets["65%-80%"] += 1
                else:
                    acad_brackets["80%-100%"] += 1
        acad_list = [{"name": k, "value": v} for k, v in acad_brackets.items()]
        
        # 5. Gender Distribution
        gender_dist = {}
        for r in rows:
            g = r.gender or "Unknown"
            gender_dist[g] = gender_dist.get(g, 0) + 1
        gender_list = [{"name": k, "value": v} for k, v in gender_dist.items()]
        
        # 6. Community Distribution
        comm_dist = {}
        for r in rows:
            c = r.community or "Unknown"
            comm_dist[c] = comm_dist.get(c, 0) + 1
        comm_list = [{"name": k, "value": v} for k, v in comm_dist.items()]
        
        # Helper to format risk-grouped distributions
        def get_risk_grouped(group_by_field):
            grouped = {}
            for r in rows:
                val = getattr(r, group_by_field)
                if val is not None and r.dropout_risk:
                    val_str = str(val)
                    if val_str not in grouped:
                        grouped[val_str] = {"High": 0, "Medium": 0, "Low": 0}
                    grouped[val_str][r.dropout_risk] += 1
            return [{"name": k, "High": v["High"], "Medium": v["Medium"], "Low": v["Low"]} for k, v in grouped.items()]
            
        school_risk = get_risk_grouped("school_name")
        class_risk = get_risk_grouped("class_name")
        financial_risk = get_risk_grouped("financial_difficulty")
        child_labour_risk = get_risk_grouped("child_labour_risk")
        backlogs_risk = get_risk_grouped("academic_backlogs")
        motivation_risk = get_risk_grouped("low_motivation")
        
        return {
            "risk_distribution": risk_dist_list,
            "prediction_trend": trend_list,
            "attendance_distribution": att_list,
            "academics_distribution": acad_list,
            "gender_distribution": gender_list,
            "community_distribution": comm_list,
            "school_risk_comparison": school_risk,
            "class_risk_comparison": class_risk,
            "financial_difficulty_analysis": financial_risk,
            "child_labour_risk_analysis": child_labour_risk,
            "backlogs_analysis": backlogs_risk,
            "motivation_analysis": motivation_risk
        }
    except Exception as e:
        logger.error(f"Error generating charts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate dashboard charts: {str(e)}"
        )

@router.get("/recent", response_model=List[RecentPredictionItem])
def get_recent(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Pre-filter counts for debugging
        prediction_count_before = db.query(StudentPrediction).count()

        query = db.query(StudentPrediction).join(
            Student, Student.id == StudentPrediction.student_id
        ).outerjoin(
            School, School.id == Student.school_id
        ).filter(
            Student.is_deleted == False
        )
        
        if current_user.role in ["headmaster", "teacher"]:
            query = query.filter(Student.school_id == current_user.school_id)
            
        recent_preds = query.order_by(StudentPrediction.predicted_at.desc()).limit(10).all()
        
        logger.info(
            f"[DASHBOARD RECENT] "
            f"Current User ID: {current_user.id} | Current Role: {current_user.role} | Current School ID: {current_user.school_id} | "
            f"Prediction Count Before Filters: {prediction_count_before} | Prediction Count After Filters: {len(recent_preds)}"
        )

        results = []
        for p in recent_preds:
            school_name = p.student.school.school_name if (p.student and p.student.school) else "Unknown"
            results.append({
                "id": p.id,
                "student_name": p.student.full_name if p.student else "Unknown",
                "student_id": p.student.student_id if p.student else "Unknown",
                "risk_level": p.dropout_risk,
                "predicted_at": p.predicted_at.isoformat(),
                "probability": p.probability or 0.0,
                "confidence": p.confidence or 0.0,
                "school_name": school_name
            })
        return results
    except Exception as e:
        logger.error(f"Error fetching recent predictions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch recent predictions: {str(e)}"
        )

@router.get("/model", response_model=ModelDetailsResponse)
def get_model(
    current_user: User = Depends(get_current_user)
):
    try:
        from app.services import model_loader
        
        metrics = model_loader.get_model_metrics() or {}
        features = model_loader.get_feature_columns() or []
        
        model = model_loader.get_model()
        if not model:
            raise HTTPException(
                status_code=503,
                detail="Model is not loaded."
            )
            
        classifier = model.named_steps['classifier']
        preprocessor = model.named_steps['preprocessor']
        
        feature_names = preprocessor.get_feature_names_out()
        importances = classifier.feature_importances_
        
        categorical_features = [
            "Gender", "Section", "Medium_of_Instruction", "Community", "Classroom_Participation", 
            "Teacher_Feedback", "Parents_Education", "Parents_Occupation", "Single_Parent", "Guardian_Support",
            "Transport_Mode", "Chronic_Illness", "Nutrition_Status", "Vision_Problems", "Mental_Health_Risk",
            "Disability_Status", "Internet_Access", "Smartphone_Access", "Computer_Access", 
            "Electricity_Availability", "School_Type", "Teacher_Student_Ratio", "Midday_Meal_Beneficiary",
            "Participation_in_Extracurricular", "Library_Usage", "Financial_Difficulty", "Child_Labour_Risk",
            "Frequent_Migration", "Family_Issues", "Academic_Backlogs", "Low_Motivation", "Bullying_Experience"
        ]
        
        raw_importances = {}
        for name, imp in zip(feature_names, importances):
            if name.startswith("num__"):
                raw_name = name[5:]
            elif name.startswith("cat__"):
                raw_name = None
                for cat_feat in categorical_features:
                    if name.startswith(f"cat__{cat_feat}_"):
                        raw_name = cat_feat
                        break
                if not raw_name:
                    raw_name = name[5:].split("_")[0]
            else:
                raw_name = name
                
            raw_importances[raw_name] = raw_importances.get(raw_name, 0.0) + float(imp)
            
        feature_importance_list = []
        for feat in features:
            imp = raw_importances.get(feat, 0.0)
            label = feat.replace("_", " ")
            feature_importance_list.append({
                "feature": feat,
                "label": label,
                "importance": round(imp, 4)
            })
            
        feature_importance_list = sorted(feature_importance_list, key=lambda x: x["importance"], reverse=True)
        
        return {
            "model_name": "CatBoost Dropout Prediction Pipeline",
            "algorithm": "CatBoost Classifier",
            "features_count": len(features),
            "accuracy": metrics.get("accuracy", 0.9205),
            "precision": metrics.get("precision", 0.9260),
            "recall": metrics.get("recall", 0.9140),
            "f1_score": metrics.get("f1_score", 0.9200),
            "roc_auc": metrics.get("roc_auc", 0.9535),
            "training_dataset_size": 20000,
            "prediction_version": "v1.0.0",
            "feature_importance": feature_importance_list
        }
    except Exception as e:
        logger.error(f"Error retrieving model information details: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate model parameters report: {str(e)}"
        )

@router.get("/reports/export")
def export_reports(
    format: str,
    school_id: Optional[int] = None,
    class_name: Optional[str] = None,
    section: Optional[str] = None,
    gender: Optional[str] = None,
    community: Optional[str] = None,
    attendance_min: Optional[float] = None,
    attendance_max: Optional[float] = None,
    marks_min: Optional[float] = None,
    marks_max: Optional[float] = None,
    risk_level: Optional[str] = None,
    financial_difficulty: Optional[str] = None,
    child_labour_risk: Optional[str] = None,
    low_motivation: Optional[str] = None,
    academic_backlogs: Optional[str] = None,
    date_min: Optional[str] = None,
    date_max: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        query = get_filtered_query(
            db, current_user, school_id, class_name, section, gender, community,
            attendance_min, attendance_max, marks_min, marks_max, risk_level,
            financial_difficulty, child_labour_risk, low_motivation, academic_backlogs,
            date_min, date_max
        )
        rows = query.all()
        
        headers = [
            "Student ID", "Full Name", "Gender", "Age", "Class", "Section", "School Name",
            "Attendance Percentage", "Overall Percentage", "Financial Difficulty",
            "Child Labour Risk", "Low Motivation", "Academic Backlogs",
            "Dropout Risk Level", "Prediction Confidence", "Predicted At"
        ]
        
        def generate_row(r):
            return [
                r.student_id, r.full_name, r.gender, r.age, r.class_name, r.section, r.school_name,
                r.attendance_percentage, r.overall_percentage, r.financial_difficulty,
                r.child_labour_risk, r.low_motivation, r.academic_backlogs,
                r.dropout_risk or "Not Predicted", r.confidence or 0.0,
                r.predicted_at.isoformat() if r.predicted_at else "N/A"
            ]
            
        if format == "xlsx":
            wb = Workbook()
            ws = wb.active
            ws.title = "Prediction Summary Report"
            ws.append(headers)
            for r in rows:
                ws.append(generate_row(r))
                
            file_stream = io.BytesIO()
            wb.save(file_stream)
            file_stream.seek(0)
            return StreamingResponse(
                file_stream,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": "attachment; filename=dropout_predictions_report.xlsx"}
            )
        else:
            file_stream = io.StringIO()
            writer = csv.writer(file_stream)
            writer.writerow(headers)
            for r in rows:
                writer.writerow(generate_row(r))
                
            output = io.BytesIO(file_stream.getvalue().encode('utf-8'))
            return StreamingResponse(
                output,
                media_type="text/csv",
                headers={"Content-Disposition": "attachment; filename=dropout_predictions_report.csv"}
            )
    except Exception as e:
        logger.error(f"Error exporting dashboard reports: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate download streams: {str(e)}"
        )
