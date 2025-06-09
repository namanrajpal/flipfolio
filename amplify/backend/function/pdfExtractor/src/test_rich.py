import json
from index import handler
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import inch

def create_rich_test_pdf():
    """Create a test PDF with paragraphs, lists, and headings"""
    filename = "test_rich.pdf"
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    styles = getSampleStyleSheet()
    story = []
    
    # Add a heading
    story.append(Paragraph("Test Document", styles['Heading1']))
    story.append(Spacer(1, 12))
    
    # Add a paragraph
    story.append(Paragraph("""
        This is a test paragraph that should be detected as a single coherent element. 
        It contains multiple sentences and should demonstrate our paragraph detection capabilities.
    """, styles['Normal']))
    story.append(Spacer(1, 12))
    
    # Add a subheading
    story.append(Paragraph("List Section", styles['Heading2']))
    story.append(Spacer(1, 12))
    
    # Add a bullet list
    bullets = [
        "First bullet point in an unordered list",
        "Second bullet point with some additional text",
        "Third bullet point to test list detection"
    ]
    for bullet in bullets:
        story.append(Paragraph(f"• {bullet}", styles['Normal']))
        story.append(Spacer(1, 6))
    
    story.append(Spacer(1, 12))
    
    # Add numbered list
    numbers = [
        "First numbered item",
        "Second numbered item",
        "Third numbered item"
    ]
    for i, item in enumerate(numbers, 1):
        story.append(Paragraph(f"{i}. {item}", styles['Normal']))
        story.append(Spacer(1, 6))
    
    # Build the PDF
    doc.build(story)
    return filename

def run_test():
    try:
        print("Creating rich test PDF...")
        pdf_path = create_rich_test_pdf()
        
        # Test event that mimics API Gateway request
        test_event = {
            'body': json.dumps({
                'pdfUrl': f"file://{pdf_path}"
            })
        }

        # Mock context object
        class Context:
            def __init__(self):
                self.invoked_function_arn = 'arn:aws:lambda:us-west-2:123456789012:function:test'

        print("Starting PDF extraction test...")
        result = handler(test_event, Context())
        print("Extraction completed. Result:")
        print(json.dumps(json.loads(result['body']), indent=2))
        
        # Cleanup
        import os
        os.remove(pdf_path)
        
    except Exception as e:
        import traceback
        print("Error during extraction:", file=sys.stderr)
        traceback.print_exc()
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        sys.exit(1)

if __name__ == '__main__':
    run_test()