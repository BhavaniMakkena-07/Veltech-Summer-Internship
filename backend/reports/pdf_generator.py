from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)

styles = getSampleStyleSheet()


def generate_pdf(scan_data, ai_analysis=None):
    """
    Generates a PDF report and returns it as BytesIO.
    """

    buffer = BytesIO()

    doc = SimpleDocTemplate(buffer)

    elements = []

    # -----------------------
    # Title
    # -----------------------

    title = Paragraph("<b><font size=20>SecureVision Security Report</font></b>", styles["Title"])
    elements.append(title)
    elements.append(Spacer(1, 20))

    # -----------------------
    # Basic Information
    # -----------------------

    info = [
        ["Filename", scan_data["filename"]],
        ["Language", scan_data["language"]],
        ["Security Score", str(scan_data["security_score"])],
        ["Risk Level", scan_data["risk_level"]],
        ["Total Findings", str(len(scan_data["findings"]))],
    ]

    table = Table(info, colWidths=[150, 300])

    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
        ("GRID", (0,0), (-1,-1), 1, colors.grey),
        ("BACKGROUND",(0,0),(0,-1),colors.HexColor("#eeeeee")),
        ("BOTTOMPADDING",(0,0),(-1,-1),10),
        ("TOPPADDING",(0,0),(-1,-1),10)
    ]))

    elements.append(table)
    elements.append(Spacer(1,25))

    # -----------------------
    # Findings
    # -----------------------

    elements.append(
        Paragraph("<b>Detected Vulnerabilities</b>", styles["Heading2"])
    )

    elements.append(Spacer(1,10))

    for finding in scan_data["findings"]:

        elements.append(
            Paragraph(
                f"<b>{finding['rule_id']}</b>",
                styles["Heading3"]
            )
        )

        elements.append(
            Paragraph(
                f"<b>Severity:</b> {finding['severity']}",
                styles["Normal"]
            )
        )

        elements.append(
            Paragraph(
                finding["message"],
                styles["Normal"]
            )
        )

        elements.append(Spacer(1,12))

    # -----------------------
    # AI Section
    # -----------------------

    if ai_analysis:

        elements.append(
            Paragraph("<b>AI Security Analysis</b>", styles["Heading2"])
        )

        elements.append(Spacer(1,10))

        elements.append(
            Paragraph(ai_analysis["summary"].replace("\n", "<br/>"),
            styles["Normal"])
        )

    doc.build(elements)

    buffer.seek(0)

    return buffer