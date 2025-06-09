import json
import sys
import traceback
import os
import base64
from index import handler

def create_test_pdf():
    """Create a simple test PDF from base64 string"""
    # This is a minimal PDF with text and a bullet point
    pdf_base64 = """JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooVGhpcyBpcyBhIHRlc3QgUERGKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCgp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTAgMDAwMDAgbiAKMDAwMDAwMDA3OSAwMDAwMCBuIAowMDAwMDAwMTczIDAwMDAwIG4gCjAwMDAwMDAzMDEgMDAwMDAgbiAKMDAwMDAwMDM4MCAwMDAwMCBuIAp0cmFpbGVyCjw8CiAgL1NpemUgNgogIC9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0OTIKJSVFT0YK"""
    
    pdf_path = "test.pdf"
    with open(pdf_path, "wb") as f:
        f.write(base64.b64decode(pdf_base64))
    return pdf_path

def run_test():
    try:
        print("Creating test PDF...")
        pdf_path = create_test_pdf()
        
        # Test event that mimics API Gateway request
        test_event = {
            'body': json.dumps({
                'pdfUrl': f"file://{os.path.abspath(pdf_path)}"
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
        os.remove(pdf_path)
        
    except Exception as e:
        print("Error during extraction:", file=sys.stderr)
        traceback.print_exc()
        if os.path.exists("test.pdf"):
            os.remove("test.pdf")
        sys.exit(1)

if __name__ == '__main__':
    run_test()