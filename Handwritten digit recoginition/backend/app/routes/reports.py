from flask import Blueprint, request, jsonify, Response, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
import csv
import io
import base64

from app.models import Prediction, User
from app.utils.notify import notify

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")


def _filtered_predictions(user_id):
    query = Prediction.query.filter_by(user_id=user_id)

    date_from = request.args.get("date_from")
    if date_from:
        query = query.filter(Prediction.created_at >= date_from)
    date_to = request.args.get("date_to")
    if date_to:
        query = query.filter(Prediction.created_at <= date_to)

    return query.order_by(Prediction.created_at.desc()).all()


@reports_bp.get("/csv")
@jwt_required()
def export_csv():
    user_id = get_jwt_identity()
    predictions = _filtered_predictions(user_id)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["Date", "Time", "Predicted Digit", "Confidence (%)", "Source", "Processing Time (ms)"])
    for p in predictions:
        writer.writerow(
            [
                p.created_at.strftime("%Y-%m-%d"),
                p.created_at.strftime("%H:%M:%S"),
                p.predicted_digit,
                p.confidence,
                p.source,
                p.processing_time_ms,
            ]
        )

    output = buffer.getvalue()
    notify(user_id, "report", "Report ready", f"Your CSV export ({len(predictions)} predictions) is ready.", link="/dashboard/reports")
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=digisense-predictions.csv"},
    )


@reports_bp.get("/pdf")
@jwt_required()
def export_pdf():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    predictions = _filtered_predictions(user_id)

    # Imported lazily — reportlab is only needed for this one route.
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.platypus import (
        SimpleDocTemplate,
        Table,
        TableStyle,
        Paragraph,
        Spacer,
        Image as RLImage,
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=letter, topMargin=0.6 * inch, bottomMargin=0.6 * inch
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "TitleStyle", parent=styles["Title"], textColor=colors.HexColor("#6C63FF"), fontSize=20
    )
    meta_style = ParagraphStyle("MetaStyle", parent=styles["Normal"], textColor=colors.grey, fontSize=9)

    elements = [
        Paragraph("DigiSense — Prediction Report", title_style),
        Paragraph(f"Generated for {user.name} ({user.email})", meta_style),
        Paragraph(f"{len(predictions)} predictions", meta_style),
        Spacer(1, 0.3 * inch),
    ]

    if predictions:
        avg_confidence = sum(p.confidence for p in predictions) / len(predictions)
        digit_counts = {}
        for p in predictions:
            digit_counts[p.predicted_digit] = digit_counts.get(p.predicted_digit, 0) + 1
        most_common = max(digit_counts, key=digit_counts.get)

        summary_data = [
            ["Total predictions", str(len(predictions))],
            ["Average confidence", f"{avg_confidence:.1f}%"],
            ["Most predicted digit", str(most_common)],
        ]
        summary_table = Table(summary_data, colWidths=[2.2 * inch, 2.2 * inch])
        summary_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F5F4FF")),
                    ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#6C63FF")),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E0DFFF")),
                ]
            )
        )
        elements.append(summary_table)
        elements.append(Spacer(1, 0.35 * inch))

        table_header = ["Image", "Digit", "Confidence", "Source", "Date", "Time"]
        table_rows = [table_header]
        for p in predictions[:200]:  # cap so the PDF stays a reasonable size
            thumb = ""
            if p.image_data and p.image_data.startswith("data:image"):
                try:
                    raw = base64.b64decode(p.image_data.split(",", 1)[1])
                    thumb = RLImage(io.BytesIO(raw), width=0.35 * inch, height=0.35 * inch)
                except Exception:  # noqa: BLE001
                    thumb = ""
            table_rows.append(
                [
                    thumb,
                    str(p.predicted_digit),
                    f"{p.confidence:.1f}%",
                    p.source,
                    p.created_at.strftime("%Y-%m-%d"),
                    p.created_at.strftime("%H:%M:%S"),
                ]
            )

        data_table = Table(table_rows, colWidths=[0.5 * inch, 0.6 * inch, 0.9 * inch, 0.8 * inch, 1 * inch, 0.9 * inch])
        data_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6C63FF")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("ALIGN", (1, 0), (-1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FAFAFF")]),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E0E0E0")),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )
        elements.append(data_table)
    else:
        elements.append(Paragraph("No predictions yet.", styles["Normal"]))

    doc.build(elements)
    buffer.seek(0)

    notify(user_id, "report", "Report ready", f"Your PDF export ({len(predictions)} predictions) is ready.", link="/dashboard/reports")

    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name="digisense-predictions.pdf",
    )
