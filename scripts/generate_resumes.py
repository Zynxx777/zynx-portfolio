from pathlib import Path
import shutil
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
PUBLIC_DIR = ROOT / "public" / "resumes"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

INK = colors.HexColor("#152338")
TEAL = colors.HexColor("#007F87")
MUTED = colors.HexColor("#46566A")
RULE = colors.HexColor("#B7C5D2")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="Name", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=23,
    leading=26, textColor=INK, spaceAfter=2,
))
styles.add(ParagraphStyle(
    name="Headline", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10.2,
    leading=13, textColor=TEAL, spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="Contact", parent=styles["Normal"], fontName="Helvetica", fontSize=8.1,
    leading=11, textColor=MUTED, spaceAfter=2, splitLongWords=1,
))
styles.add(ParagraphStyle(
    name="Section", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9.2,
    leading=11, textColor=TEAL, spaceBefore=7, spaceAfter=2, uppercase=True,
))
styles.add(ParagraphStyle(
    name="BodyCustom", parent=styles["Normal"], fontName="Helvetica", fontSize=8.6,
    leading=11.2, textColor=INK, spaceAfter=2.4, splitLongWords=1,
))
styles.add(ParagraphStyle(
    name="BulletCustom", parent=styles["BodyCustom"], leftIndent=10, firstLineIndent=-8,
    bulletIndent=0, spaceAfter=2.2,
))
styles.add(ParagraphStyle(
    name="Role", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9,
    leading=11, textColor=INK, spaceAfter=1,
))
styles.add(ParagraphStyle(
    name="Meta", parent=styles["Normal"], fontName="Helvetica-Oblique", fontSize=8,
    leading=10, textColor=MUTED, spaceAfter=2,
))

# The focused job-search resume follows a plain, centered, single-column ATS
# layout. The broader reference resume keeps the portfolio's restrained color.
ATS_INK = colors.HexColor("#111111")
ATS_MUTED = colors.HexColor("#333333")
ATS_RULE = colors.HexColor("#222222")
styles.add(ParagraphStyle(
    name="ATSName", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=20.5,
    leading=23, textColor=ATS_INK, alignment=TA_CENTER, spaceAfter=2,
))
styles.add(ParagraphStyle(
    name="ATSHeadline", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10.2,
    leading=12, textColor=ATS_INK, alignment=TA_CENTER, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="ATSContact", parent=styles["Normal"], fontName="Helvetica", fontSize=8.3,
    leading=10.6, textColor=ATS_MUTED, alignment=TA_CENTER, spaceAfter=1.5,
    splitLongWords=1,
))
styles.add(ParagraphStyle(
    name="ATSSection", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9.6,
    leading=11.3, textColor=ATS_INK, spaceBefore=6, spaceAfter=1.5,
))
styles.add(ParagraphStyle(
    name="ATSBody", parent=styles["Normal"], fontName="Helvetica", fontSize=9.1,
    leading=11.6, textColor=ATS_INK, spaceAfter=2.2, splitLongWords=1,
))
styles.add(ParagraphStyle(
    name="ATSBullet", parent=styles["ATSBody"], leftIndent=10, firstLineIndent=-8,
    bulletIndent=0, spaceAfter=1.8,
))
styles.add(ParagraphStyle(
    name="ATSRole", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9.3,
    leading=11.1, textColor=ATS_INK, spaceAfter=0.8,
))
styles.add(ParagraphStyle(
    name="ATSMeta", parent=styles["Normal"], fontName="Helvetica-Oblique", fontSize=8.4,
    leading=10, textColor=ATS_MUTED, spaceAfter=1.5,
))


def section(title, ats=False):
    style = styles["ATSSection"] if ats else styles["Section"]
    rule_color = ATS_RULE if ats else RULE
    return [
        Paragraph(title.upper() if ats else title, style),
        HRFlowable(width="100%", thickness=0.65 if ats else 0.6, color=rule_color, spaceAfter=4),
    ]


def bullet(text, ats=False):
    style = styles["ATSBullet"] if ats else styles["BulletCustom"]
    return Paragraph(f"&#8226;&nbsp; {text}", style)


def role(title, meta, details, ats=False):
    title_style = styles["ATSRole"] if ats else styles["Role"]
    meta_style = styles["ATSMeta"] if ats else styles["Meta"]
    content = [Paragraph(title, title_style), Paragraph(meta, meta_style)]
    content.extend(bullet(detail, ats=ats) for detail in details)
    return KeepTogether(content)


def header(headline, ats=False):
    name_style = styles["ATSName"] if ats else styles["Name"]
    headline_style = styles["ATSHeadline"] if ats else styles["Headline"]
    contact_style = styles["ATSContact"] if ats else styles["Contact"]
    return [
        Paragraph("Joshua D", name_style),
        Paragraph(headline, headline_style),
        Paragraph("Channapatna, Karnataka, India  |  +91 72599 87691  |  joshuajosh3055@gmail.com", contact_style),
        Paragraph("Portfolio: https://zynx-portfolio.vercel.app/  |  GitHub: https://github.com/Zynxx777  |  LinkedIn: https://linkedin.com/in/Zynx", contact_style),
        Spacer(1, 4),
    ]


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.45)
    canvas.line(18 * mm, 13 * mm, A4[0] - 18 * mm, 13 * mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 8.5 * mm, "Joshua D | Resume")
    canvas.drawRightString(A4[0] - 18 * mm, 8.5 * mm, f"Page {doc.page}")
    canvas.restoreState()


def build(filename, story, title, ats=False):
    path = OUTPUT_DIR / filename
    doc = SimpleDocTemplate(
        str(path), pagesize=A4,
        rightMargin=(16 if ats else 18) * mm, leftMargin=(16 if ats else 18) * mm,
        topMargin=(13 if ats else 13) * mm, bottomMargin=(14 if ats else 18) * mm, title=title,
        author="Joshua D", subject="Resume",
    )
    if ats:
        doc.build(story)
    else:
        doc.build(story, onFirstPage=footer, onLaterPages=footer)
    shutil.copy2(path, PUBLIC_DIR / filename)
    return path


universal = header("IT Support & Linux | Web Projects | Electronics & Communication Engineering")
universal += section("Profile")
universal.append(Paragraph(
    "Electronics and Communication Engineering graduate targeting entry-level IT support and junior Linux administration, with a continuing interest in software development. Uses Arch Linux as a personal desktop, maintains package settings, and checks dependencies with pactree. Builds web portfolio projects through an AI-assisted workflow, reviewing generated code and making manual interface and code changes.",
    styles["BodyCustom"],
))

universal += section("Technical Skills")
universal.append(Paragraph(
    "<b>Linux and desktop support:</b> Arch Linux, Omarchy, pacman update configuration, package and dependency review with pactree, command-line maintenance (foundational).<br/>"
    "<b>Web and project tools:</b> React, TypeScript, Vite, Astro, Tailwind CSS, Supabase authentication prototype, Git, GitHub, responsive interface iteration, Three.js project familiarity.<br/>"
    "<b>ECE and embedded:</b> Electronics and communication systems, computer networks, embedded systems, Arduino and digital logic (academic exposure), Android Automotive and CAN concepts (project exposure).<br/>"
    "<b>Programming foundations:</b> HTML, CSS, JavaScript, TypeScript, Python, C/C++, and Verilog; exposure varies by coursework and project use.<br/>"
    "<b>Security and creative work:</b> Network security fundamentals; music instruction and personal electronic music practice.",
    styles["BodyCustom"],
))

universal += section("Recent Projects")
universal.append(role(
    "S.M. English School Website | Personal project",
    "Astro, Tailwind CSS, Supabase authentication prototype",
    ["Built a responsive multi-page school website MVP covering home, academics, admissions, and updates.",
     "Added a Supabase sign-in prototype for the admin area; the authentication flow is a prototype, not a production service.",
     "Source: https://github.com/Zynxx777/sm-english-school-web"],
))
universal.append(role(
    "ZYNX Portfolio | Personal project",
    "React, TypeScript, Vite, Three.js",
    ["Maintains a multi-page portfolio with interactive project browsing, responsive layouts, and an interactive 3D room.",
     "Reviews AI-generated code and makes manual changes to layout, content, and interactions.",
     "Portfolio: https://zynx-portfolio.vercel.app/"],
))
universal.append(PageBreak())
universal.append(Paragraph("Joshua D | Additional Background", styles["Headline"]))
universal += section("Current Experience")
universal.append(role(
    "Music Teacher (Part-time) | St Sophia Convent High School",
    "Karnataka, India | August 2026 - Present",
    ["Teach music to school students on a part-time schedule."],
))
universal += section("Linux & Desktop Support Practice")
universal.append(role(
    "Arch Linux Workstation Maintenance | Personal practice",
    "Arch Linux, pacman, pactree",
    ["Reviewed pacman update configuration and investigated application update behavior on a personal Linux desktop.",
     "Used pactree to inspect package dependency relationships before considering cleanup."],
))
universal += section("Education")
universal.append(role(
    "Bachelor of Engineering in Electronics & Communication Engineering | Don Bosco Institute of Technology",
    "2021 - 2025 | CGPA: 7.16 / 10",
    ["Relevant study: computer networks, embedded systems, VLSI and digital design, digital signal processing, telecommunications, and control systems."],
))
universal.append(role(
    "Pre-University Course (PCMB Science) | Shanthiniketan PU College",
    "2019 - 2021 | 71.6%",
    [],
))

universal += section("Academic Project Exposure")
universal.append(role(
    "Automotive Cockpit Systems Project",
    "ECE academic project exposure",
    ["Studied Android Automotive OS, CAN bus, and embedded cockpit system concepts. Presented as academic project work, not professional employment."],
))
universal.append(role(
    "MediVend Smart Dispenser Concept",
    "ECE academic project exposure",
    ["Academic concept related to introductory microcontroller work, digital logic, and electronics engineering."],
))

universal += section("Selected Training & Recognition")
universal.append(bullet("7chats Messenger bug bounty contest recognition (September 2021), recorded in existing resume materials for reporting an authentication issue."))
universal.append(bullet("VLSI digital design and Verilog programming coursework (July 2024)."))
universal.append(bullet("Python programming basics coursework (July 2024)."))
universal.append(bullet("Network security coursework (February 2025)."))

universal += section("Additional Interests")
universal.append(Paragraph(
    "Music teaching and personal electronic music practice under the 7YNX alias. Interested in growing practical IT support and Linux administration experience while continuing to develop software skills.",
    styles["BodyCustom"],
))

focused = header("Entry-Level IT Support | Junior Linux Administration", ats=True)
focused += section("Profile", ats=True)
focused.append(Paragraph(
    "ECE graduate seeking an entry-level IT support or junior Linux administration role. Uses Arch Linux as a personal desktop and has hands-on practice with pacman configuration, application update investigation, and package dependency checks with pactree. Brings clear communication from current part-time teaching work and an interest in growing into software development.",
    styles["ATSBody"],
))

focused += section("Relevant Skills", ats=True)
focused.append(Paragraph(
    "<b>Linux:</b> Arch Linux desktop use, Omarchy, pacman update configuration, package and dependency review (pactree), command-line maintenance (foundational).<br/>"
    "<b>Support practice:</b> investigate software update behavior, review package changes, and inspect dependencies before cleanup.<br/>"
    "<b>Technical foundation:</b> computer networks and network security coursework, hardware and embedded systems coursework, Git and GitHub project workflow.<br/>"
    "<b>Software interest:</b> responsive UI iteration; foundational familiarity with React, TypeScript, Astro, Tailwind CSS, and Python through portfolio projects and coursework.",
    styles["ATSBody"],
))

focused += section("Linux Practice", ats=True)
focused.append(role(
    "Arch Linux Workstation Maintenance | Personal practice",
    "Arch Linux, pacman, pactree",
    ["Reviewed package-manager update configuration while investigating application update behavior.",
     "Used pactree to check dependency relationships before considering orphaned-package cleanup.",
     "Maintains a customized Linux desktop environment for daily personal use."],
    ats=True,
))

focused += section("Selected Projects", ats=True)
focused.append(role(
    "S.M. English School Website | Personal project",
    "Astro, Tailwind CSS, Supabase authentication prototype",
    ["Created a responsive multi-page website MVP with an admin sign-in prototype.",
     "Source: https://github.com/Zynxx777/sm-english-school-web"],
    ats=True,
))
focused.append(role(
    "ZYNX Portfolio | Personal project",
    "React, TypeScript, Vite, Three.js",
    ["Iterates on an AI-assisted portfolio codebase with manual UI, responsive layout, and content changes.",
     "Portfolio: https://zynx-portfolio.vercel.app/"],
    ats=True,
))

focused += section("Experience", ats=True)
focused.append(role(
    "Music Teacher (Part-time) | St Sophia Convent High School",
    "Karnataka, India | August 2026 - Present",
    ["Teach music to school students on a part-time schedule; current work alongside an IT career transition."],
    ats=True,
))

focused += section("Education & Training", ats=True)
focused.append(role(
    "B.E. Electronics & Communication Engineering | Don Bosco Institute of Technology",
    "2021 - 2025 | CGPA: 7.16 / 10",
    ["Relevant study: computer networks, embedded systems, electronics, and digital design."],
    ats=True,
))
focused.append(Paragraph(
    "Selected coursework: Network Security (February 2025); Python Programming Basics (July 2024). 7chats Messenger bug bounty contest recognition (September 2021) is listed in existing resume materials.",
    styles["ATSBody"],
))

if "--focused-only" in sys.argv:
    generated = [build("Joshua_D_IT_Support_Linux_Resume.pdf", focused, "Joshua D - IT Support and Linux Resume", ats=True)]
else:
    generated = [
        build("Joshua_D_Universal_Resume.pdf", universal, "Joshua D - Universal Resume"),
        build("Joshua_D_IT_Support_Linux_Resume.pdf", focused, "Joshua D - IT Support and Linux Resume", ats=True),
    ]
for path in generated:
    print(path)
