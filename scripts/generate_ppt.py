import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_dermascan_deck(output_path):
    prs = Presentation()
    # Set 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    # Palette definition (DermaScan Theme: Deep Teal / Emerald / Dark Navy / Clean White)
    BG_DARK = RGBColor(15, 23, 42)       # #0f172a (Dark Slate)
    CARD_DARK = RGBColor(30, 41, 59)     # #1e293b (Card Slate)
    PRIMARY_TEAL = RGBColor(13, 148, 136) # #0d9488 (Teal)
    EMERALD_GREEN = RGBColor(16, 185, 129)# #10b981 (Emerald)
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(148, 163, 184) # #94a3b8
    ACCENT_AMBER = RGBColor(245, 158, 11) # #f59e0b
    ACCENT_RED = RGBColor(239, 68, 68)    # #ef4444
    BORDER_COLOR = RGBColor(51, 65, 85)
    
    blank_layout = prs.slide_layouts[6]
    
    # Utility function to set solid background color
    def set_slide_bg(slide, color):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = color

    # Utility function to create slide header
    def add_slide_header(slide, tag_text, title_text):
        # Tag pill / label
        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.4))
        tf_tag = tag_box.text_frame
        tf_tag.word_wrap = True
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = tag_text.upper()
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = PRIMARY_TEAL
        p_tag.font.name = 'Arial'

        # Main Slide Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.7))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE
        p_title.font.name = 'Arial'

    # -------------------------------------------------------------
    # SLIDE 1: Title Slide (Cover)
    # -------------------------------------------------------------
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide1, BG_DARK)
    
    # Hero decorative shape
    shape = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9))
    shape.fill.solid()
    shape.fill.fore_color.rgb = CARD_DARK
    shape.line.color.rgb = BORDER_COLOR
    shape.line.width = Pt(1.5)

    # Title content inside card
    title_box = slide1.shapes.add_textbox(Inches(1.2), Inches(1.5), Inches(10.9), Inches(4.5))
    tf1 = title_box.text_frame
    tf1.word_wrap = True

    p1 = tf1.paragraphs[0]
    p1.text = "DERMASCAN"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = PRIMARY_TEAL
    p1.font.name = 'Arial'
    
    p2 = tf1.add_paragraph()
    p2.text = "AI-Powered Animal Dermatological Screening & Stray Rescue Platform"
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p2.font.name = 'Arial'
    p2.space_before = Pt(10)

    p3 = tf1.add_paragraph()
    p3.text = "Bridging Citizens, Rescue NGOs, Veterinarians, and Municipalities for Rapid Animal Welfare & Outbreak Control"
    p3.font.size = Pt(14)
    p3.font.color.rgb = TEXT_MUTED
    p3.font.name = 'Arial'
    p3.space_before = Pt(16)

    # Key highlight pills box
    pills_data = [
        ("🤖 91.4% AI Accuracy", PRIMARY_TEAL),
        ("🚨 Emergency SOS Triage", ACCENT_RED),
        ("🗺️ Real-Time GIS Dispatch", EMERALD_GREEN),
        ("🩺 Digital Vet Prescriptions", ACCENT_AMBER)
    ]
    for i, (pill_text, pill_color) in enumerate(pills_data):
        pill_shape = slide1.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, 
            Inches(1.2 + i * 2.7), Inches(5.2), Inches(2.5), Inches(0.7)
        )
        pill_shape.fill.solid()
        pill_shape.fill.fore_color.rgb = BG_DARK
        pill_shape.line.color.rgb = pill_color
        pill_shape.line.width = Pt(1.5)
        
        tf_pill = pill_shape.text_frame
        tf_pill.word_wrap = True
        p_pill = tf_pill.paragraphs[0]
        p_pill.text = pill_text
        p_pill.font.size = Pt(11)
        p_pill.font.bold = True
        p_pill.font.color.rgb = TEXT_WHITE
        p_pill.alignment = PP_ALIGN.CENTER

    slide1.notes_slide.notes_text_frame.text = (
        "Speaker Notes Slide 1: Welcome to the DermaScan presentation. "
        "DermaScan is an end-to-end AI-assisted platform addressing untreated stray animal skin diseases, "
        "enabling rapid triage, seamless NGO rescue dispatch, and clinical verification."
    )

    # -------------------------------------------------------------
    # SLIDE 2: Problem & Solution Statement
    # -------------------------------------------------------------
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide2, BG_DARK)
    add_slide_header(slide2, "01 / Executive Overview", "The Problem & The DermaScan Solution")

    # Left Box: Problem Statement
    prob_card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0))
    prob_card.fill.solid()
    prob_card.fill.fore_color.rgb = CARD_DARK
    prob_card.line.color.rgb = ACCENT_RED
    prob_card.line.width = Pt(1.5)

    tf_prob = prob_card.text_frame
    tf_prob.word_wrap = True
    p_prob_t = tf_prob.paragraphs[0]
    p_prob_t.text = "⚠️ THE CHALLENGE IN ANIMAL WELFARE"
    p_prob_t.font.size = Pt(16)
    p_prob_t.font.bold = True
    p_prob_t.font.color.rgb = ACCENT_RED

    points_prob = [
        "Uncontrolled Stray Dermatological Outbreaks: Severe mange, fungal ringworm, and pyoderma cause prolonged suffering in stray populations.",
        "Delayed Rescue Response: Citizens lack tools to evaluate disease severity or identify nearby active rescue NGOs.",
        "Zoonotic Risk to Communities: Parasitic skin conditions like scabies can transmit to humans and domestic pets if untreated.",
        "Lack of Standardized Clinical Tracking: Paper records lead to missing medical follow-ups and incomplete recovery cycles."
    ]
    for pt in points_prob:
        p = tf_prob.add_paragraph()
        p.text = "• " + pt
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(10)

    # Right Box: Solution Statement
    sol_card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
    sol_card.fill.solid()
    sol_card.fill.fore_color.rgb = CARD_DARK
    sol_card.line.color.rgb = EMERALD_GREEN
    sol_card.line.width = Pt(1.5)

    tf_sol = sol_card.text_frame
    tf_sol.word_wrap = True
    p_sol_t = tf_sol.paragraphs[0]
    p_sol_t.text = "✨ THE DERMASCAN SOLUTION"
    p_sol_t.font.size = Pt(16)
    p_sol_t.font.bold = True
    p_sol_t.font.color.rgb = EMERALD_GREEN

    points_sol = [
        "Instant AI Diagnostic Classifier: Pre-screens uploaded photos for 5+ dermatological conditions with 91.4% accuracy.",
        "Automated Priority & SOS Triage: Priority score (0-100) instantly alerts NGOs to critical open wound/trauma cases.",
        "Interactive GIS Dispatch Map: Real-time mapping connects citizen reporters directly with verified rescue NGOs.",
        "Digital Clinical Prescriptions: Veterinarians generate signed digital treatment plans and track recovery timelines."
    ]
    for pt in points_sol:
        p = tf_sol.add_paragraph()
        p.text = "• " + pt
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(10)

    slide2.notes_slide.notes_text_frame.text = (
        "Speaker Notes Slide 2: Highlighting the core problem of delayed rescue responses and zoonotic disease risks, "
        "and how DermaScan solves this with AI screening, automated triage, and connected NGO workflows."
    )

    # -------------------------------------------------------------
    # SLIDE 3: AI Screening & Quality Engine
    # -------------------------------------------------------------
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide3, BG_DARK)
    add_slide_header(slide3, "02 / Artificial Intelligence", "AI Dermatological Screening & Quality Engine")

    # 3 Column Cards
    card_width = Inches(3.7)
    card_gap = Inches(0.3)
    
    # Card 1: Pre-Screening Quality
    c1 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), card_width, Inches(5.0))
    c1.fill.solid()
    c1.fill.fore_color.rgb = CARD_DARK
    c1.line.color.rgb = BORDER_COLOR
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "1. Quality Pre-Check"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_TEAL
    
    c1_bullets = [
        "Automatic Validation: Evaluates image brightness, sharpness, and focus before running inference.",
        "Safety Threshold: Rejects blurry/obstructed photos to prevent false clinical classifications.",
        "Confidence Rating: Ensures high trustworthiness of screening results."
    ]
    for bullet in c1_bullets:
        pb = tf1.add_paragraph()
        pb.text = "• " + bullet
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_MUTED
        pb.space_before = Pt(12)

    # Card 2: Multi-Class Classifier
    c2 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + card_width + card_gap), Inches(1.8), card_width, Inches(5.0))
    c2.fill.solid()
    c2.fill.fore_color.rgb = CARD_DARK
    c2.line.color.rgb = PRIMARY_TEAL
    c2.line.width = Pt(1.5)
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "2. AI Classifier Engine"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = EMERALD_GREEN

    c2_bullets = [
        "EfficientNet-B2 Model: Fine-tuned on 4,280 benchmark animal dermatological images.",
        "Multi-Condition Diagnosis: Identifies Canine Mange, Fungal Ringworm, Allergic Dermatitis, Pyoderma.",
        "Pathology Breakdown: Detects alopecia, epidermal scabbing, and inflammatory erythema."
    ]
    for bullet in c2_bullets:
        pb = tf2.add_paragraph()
        pb.text = "• " + bullet
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_WHITE
        pb.space_before = Pt(12)

    # Card 3: Clinical Outputs & Visual Slider
    c3 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + (card_width + card_gap)*2), Inches(1.8), card_width, Inches(5.0))
    c3.fill.solid()
    c3.fill.fore_color.rgb = CARD_DARK
    c3.line.color.rgb = BORDER_COLOR
    tf3 = c3.text_frame
    tf3.word_wrap = True
    p = tf3.paragraphs[0]
    p.text = "3. Clinical Action & Slider"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER

    c3_bullets = [
        "Zoonotic Alert System: Flags transmissible diseases (e.g. sarcoptic mange, ringworm) with safety protocols.",
        "Before/After Slider: Interactive visual comparison component for post-treatment tracking.",
        "One-Click Filing: Directly feeds diagnosis and severity levels into rescue dispatch form."
    ]
    for bullet in c3_bullets:
        pb = tf3.add_paragraph()
        pb.text = "• " + bullet
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_MUTED
        pb.space_before = Pt(12)

    slide3.notes_slide.notes_text_frame.text = (
        "Speaker Notes Slide 3: Explaining the technical AI pipeline. Image quality gatekeeping -> EfficientNet-B2 classification -> "
        "Zoonotic alerts & interactive recovery sliders."
    )

    # -------------------------------------------------------------
    # SLIDE 4: Stray Rescue Dispatch & GIS Map
    # -------------------------------------------------------------
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide4, BG_DARK)
    add_slide_header(slide4, "03 / Field Logistics", "Stray Rescue Dispatch & Interactive GIS Map")

    # 2 Wide Row Cards
    r1 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.7), Inches(2.3))
    r1.fill.solid()
    r1.fill.fore_color.rgb = CARD_DARK
    r1.line.color.rgb = ACCENT_RED
    r1.line.width = Pt(1.5)

    tf_r1 = r1.text_frame
    tf_r1.word_wrap = True
    p = tf_r1.paragraphs[0]
    p.text = "🚨 Algorithmic Priority Scoring & Emergency SOS Triage"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = ACCENT_RED

    bullets_r1 = [
        "Dynamic Priority Calculation (0–100): Combines AI severity, skin infection spread, bleeding, and animal mobility.",
        "Emergency SOS Banners: Immediately broadcasts priority cases (Score 90+) to active rescue networks.",
        "Real-Time Geolocation Tagging: Captures precise latitude/longitude coordinates and street landmarks for field teams."
    ]
    for b in bullets_r1:
        pb = tf_r1.add_paragraph()
        pb.text = "• " + b
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_WHITE
        pb.space_before = Pt(4)

    r2 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.4), Inches(11.7), Inches(2.4))
    r2.fill.solid()
    r2.fill.fore_color.rgb = CARD_DARK
    r2.line.color.rgb = PRIMARY_TEAL
    r2.line.width = Pt(1.5)

    tf_r2 = r2.text_frame
    tf_r2.word_wrap = True
    p = tf_r2.paragraphs[0]
    p.text = "🗺️ Interactive GIS Map & NGO Dispatch Workflow"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_TEAL

    bullets_r2 = [
        "Proximity Radius Filtering: NGOs filter emergency cases within 5km, 10km, or 20km operational zones.",
        "One-Click Rescue Claim: NGOs accept cases, assign specific field volunteers, and launch ambulance transit.",
        "Live Case Lifecycle Pipeline: Tracks status transparently from Reported → NGO Assigned → In Treatment → Recovered."
    ]
    for b in bullets_r2:
        pb = tf_r2.add_paragraph()
        pb.text = "• " + b
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_WHITE
        pb.space_before = Pt(4)

    slide4.notes_slide.notes_text_frame.text = (
        "Speaker Notes Slide 4: Highlighting the logistical power of DermaScan — priority score triage for emergency SOS cases "
        "and proximity-based NGO dispatch mapping."
    )

    # -------------------------------------------------------------
    # SLIDE 5: Vet Clinical Audit & Admin Outbreak Analytics
    # -------------------------------------------------------------
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide5, BG_DARK)
    add_slide_header(slide5, "04 / Clinical & Data Management", "Veterinary Clinical Audit & Admin Outbreak Analytics")

    # Left Column: Vet Clinical Audit
    card_v = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0))
    card_v.fill.solid()
    card_v.fill.fore_color.rgb = CARD_DARK
    card_v.line.color.rgb = ACCENT_AMBER
    card_v.line.width = Pt(1.5)

    tf_v = card_v.text_frame
    tf_v.word_wrap = True
    p_v = tf_v.paragraphs[0]
    p_v.text = "🩺 Veterinary Clinical Audit & Rx Generator"
    p_v.font.size = Pt(16)
    p_v.font.bold = True
    p_v.font.color.rgb = ACCENT_AMBER

    bullets_v = [
        "Clinical Verification: Licensed veterinarians review AI screening outputs, skin scrapings, and confirm diagnoses.",
        "Digital Prescription Cards: Generates digital Rx specifying drug dosage (e.g. Ivermectin, Medicated Shampoo, Antibiotics).",
        "Recheck Scheduling: Automates follow-up reminders for weekly medicated baths and booster treatments.",
        "PDF/Print Export: Prescriptions can be exported and printed for shelter staff and field volunteers."
    ]
    for b in bullets_v:
        pb = tf_v.add_paragraph()
        pb.text = "• " + b
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_WHITE
        pb.space_before = Pt(10)

    # Right Column: Admin Analytics
    card_a = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
    card_a.fill.solid()
    card_a.fill.fore_color.rgb = CARD_DARK
    card_a.line.color.rgb = PRIMARY_TEAL
    card_a.line.width = Pt(1.5)

    tf_a = card_a.text_frame
    tf_a.word_wrap = True
    p_a = tf_a.paragraphs[0]
    p_a.text = "📊 Outbreak Analytics & Spatial Intelligence"
    p_a.font.size = Pt(16)
    p_a.font.bold = True
    p_a.font.color.rgb = PRIMARY_TEAL

    bullets_a = [
        "AI Classifier Telemetry: Real-time tracking of accuracy (91.4%), confusion matrix, and model evaluation metrics.",
        "Geographic Outbreak Heatmaps: Identifies disease clusters across city sectors (e.g. Nagarbhavi, Vijayanagar, Kengeri).",
        "Disease Distribution Metrics: Tracks prevalence of Mange vs. Fungal Ringworm vs. Allergic Dermatitis over time.",
        "One-Click CSV Export: Export complete case histories for municipal health audits and epidemiological studies."
    ]
    for b in bullets_a:
        pb = tf_a.add_paragraph()
        pb.text = "• " + b
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_WHITE
        pb.space_before = Pt(10)

    slide5.notes_slide.notes_text_frame.text = (
        "Speaker Notes Slide 5: Detailing veterinary clinical verification and prescription generation, alongside "
        "admin outbreak analytics and spatial intelligence."
    )

    # -------------------------------------------------------------
    # SLIDE 6: Impact, Technology Stack & Future Roadmap
    # -------------------------------------------------------------
    slide6 = prs.slides.add_slide(blank_layout)
    set_slide_bg(slide6, BG_DARK)
    add_slide_header(slide6, "05 / Impact & Future Vision", "Impact, Technology Architecture & Roadmap")

    # 3 Bottom Horizontal Cards
    h_width = Inches(3.7)
    h_gap = Inches(0.3)

    # Card 1: Measurable Impact
    i1 = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), h_width, Inches(5.0))
    i1.fill.solid()
    i1.fill.fore_color.rgb = CARD_DARK
    i1.line.color.rgb = EMERALD_GREEN
    i1.line.width = Pt(1.5)
    tf_i1 = i1.text_frame
    tf_i1.word_wrap = True
    p = tf_i1.paragraphs[0]
    p.text = "🌱 Measurable Impact"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = EMERALD_GREEN

    b_i1 = [
        "Rapid Response Time: Reduces average rescue dispatch time from days to under 45 minutes.",
        "Higher Stray Recovery Rate: Early screening prevents chronic skin decay and mortality.",
        "Zoonotic Containment: Protects public health by mitigating human scabies & fungal spread."
    ]
    for b in b_i1:
        pb = tf_i1.add_paragraph()
        pb.text = "• " + b
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_WHITE
        pb.space_before = Pt(12)

    # Card 2: Tech Architecture
    i2 = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + h_width + h_gap), Inches(1.8), h_width, Inches(5.0))
    i2.fill.solid()
    i2.fill.fore_color.rgb = CARD_DARK
    i2.line.color.rgb = PRIMARY_TEAL
    i2.line.width = Pt(1.5)
    tf_i2 = i2.text_frame
    tf_i2.word_wrap = True
    p = tf_i2.paragraphs[0]
    p.text = "⚡ Tech Architecture"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_TEAL

    b_i2 = [
        "Frontend Stack: Built with React + Vite, modern Vanilla CSS, and custom UI design tokens.",
        "Offline-First Storage: LocalStorage sync ensures continuous data availability during field work.",
        "Multi-Lingual Ready: Localization support for English, Kannada, and Hindi."
    ]
    for b in b_i2:
        pb = tf_i2.add_paragraph()
        pb.text = "• " + b
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_WHITE
        pb.space_before = Pt(12)

    # Card 3: Future Roadmap
    i3 = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + (h_width + h_gap)*2), Inches(1.8), h_width, Inches(5.0))
    i3.fill.solid()
    i3.fill.fore_color.rgb = CARD_DARK
    i3.line.color.rgb = ACCENT_AMBER
    i3.line.width = Pt(1.5)
    tf_i3 = i3.text_frame
    tf_i3.word_wrap = True
    p = tf_i3.paragraphs[0]
    p.text = "🚀 Future Roadmap"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER

    b_i3 = [
        "Native Mobile PWA: Offline camera deployment with TensorFlow.js edge inference.",
        "IoT Smart Collars: Integration with telemetry collars for stray pack monitoring.",
        "Municipal Integration: Automated sync with civic stray census and ABC sterilization drives."
    ]
    for b in b_i3:
        pb = tf_i3.add_paragraph()
        pb.text = "• " + b
        pb.font.size = Pt(12)
        pb.font.color.rgb = TEXT_WHITE
        pb.space_before = Pt(12)

    slide6.notes_slide.notes_text_frame.text = (
        "Speaker Notes Slide 6: Summary of real-world impact, technology stack, and future scalability roadmap."
    )

    prs.save(output_path)
    print(f"Successfully generated PowerPoint presentation at: {output_path}")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "dermascan_presentation.pptx"
    create_dermascan_deck(out)
