import json
import boto3
import pdfplumber
import tempfile
import urllib.request
import urllib.parse
import re
from typing import Dict, List, Tuple, Optional
from itertools import groupby
from operator import itemgetter
from statistics import mean, mode, median

def detect_text_alignment(words: List[Dict], page_width: float) -> str:
    """Detect text alignment based on word positions."""
    if not words:
        return "left"
    
    left_margin = min(w["x0"] for w in words)
    right_margin = page_width - max(w["x1"] for w in words)
    
    # If margins are similar, text is likely centered
    if abs(left_margin - right_margin) < 10:
        return "center"
    # If right margin is smaller, text is likely right-aligned
    elif left_margin > right_margin + 20:
        return "right"
    else:
        return "left"

def classify_text_style(word_group: List[Dict], avg_font_size: float) -> str:
    """Classify text as heading or paragraph based on font size and style."""
    if not word_group:
        return "paragraph"
        
    group_size = mean(float(w.get("size", 12)) for w in word_group)
    font_families = [w.get("fontname", "").lower() for w in word_group]
    
    # Check for heading indicators
    is_likely_heading = (
        group_size > avg_font_size * 1.2 or  # Significantly larger font
        any("bold" in f for f in font_families) or  # Bold font
        len(" ".join(w["text"] for w in word_group).split()) < 8  # Short text
    )
    
    return "heading" if is_likely_heading else "paragraph"

def detect_list_items(lines: List[List[Dict]]) -> List[Tuple[int, str]]:
    """Detect lines that are likely list items and their type."""
    list_items = []
    
    for i, line in enumerate(lines):
        if not line:
            continue
            
        text = " ".join(w["text"] for w in line)
        
        # Common bullet point patterns
        bullet_patterns = [
            r'^[\s•\-\*◦○●⚫⬤]\s+(.+)$',  # Bullet points
            r'^\d+[.)]\s+(.+)$',  # Numbered lists
            r'^[a-zA-Z][.)]\s+(.+)$',  # Letter lists
            r'^[-–—]\s+(.+)$',  # Dashes
            r'^\[\s*[xX✓✔]\s*\]\s+(.+)$'  # Checkboxes
        ]
        
        for pattern in bullet_patterns:
            match = re.match(pattern, text)
            if match:
                list_type = "ordered" if re.match(r'^\d+[.)]\s+(.+)$', text) else "unordered"
                list_items.append((i, list_type))
                break
    
    return list_items

def extract_text_styles(words: List[Dict]) -> Dict:
    """Extract detailed text styling information from words."""
    styles = {}
    
    # Extract font properties
    fonts = [w.get("fontname", "").lower() for w in words]
    sizes = [float(w.get("size", 12)) for w in words]
    
    # Detect font weight and style
    is_bold = any("bold" in f for f in fonts)
    is_italic = any("italic" in f for f in fonts)
    
    # Get color information (if available)
    colors = [w.get("non_stroking_color") for w in words if w.get("non_stroking_color")]
    bg_colors = [w.get("stroking_color") for w in words if w.get("stroking_color")]
    
    styles["fontSize"] = f"{median(sizes)}px"
    styles["fontFamily"] = mode(fonts) if fonts else "sans-serif"
    
    if is_bold:
        styles["fontWeight"] = "bold"
    if is_italic:
        styles["fontStyle"] = "italic"
    
    if colors:
        # Convert PDF color space to RGB hex
        styles["color"] = pdf_color_to_hex(mode(colors))
    
    if bg_colors:
        styles["backgroundColor"] = pdf_color_to_hex(mode(bg_colors))
    
    return styles

def pdf_color_to_hex(color) -> str:
    """Convert PDF color space values to hex color."""
    if isinstance(color, (tuple, list)):
        if len(color) == 3:  # RGB
            return '#{:02x}{:02x}{:02x}'.format(
                int(color[0] * 255),
                int(color[1] * 255),
                int(color[2] * 255)
            )
        elif len(color) == 4:  # CMYK
            # Simple CMYK to RGB conversion
            c, m, y, k = color
            r = int((1 - c) * (1 - k) * 255)
            g = int((1 - m) * (1 - k) * 255)
            b = int((1 - y) * (1 - k) * 255)
            return '#{:02x}{:02x}{:02x}'.format(r, g, b)
    return '#000000'  # Default to black

# Update the merge_words_into_paragraphs function to use the new style extraction
def merge_words_into_paragraphs(words: List[Dict], page_width: float) -> List[Dict]:
    """Merge words into coherent paragraphs and lists."""
    if not words:
        return []
    
    # Calculate average font size for the page
    avg_font_size = mean(float(w.get("size", 12)) for w in words)
    
    # Sort words by vertical position and then horizontal
    sorted_words = sorted(words, key=lambda w: (round(w["top"]), w["x0"]))
    
    # Group words into lines with tolerance for slight y-position differences
    tolerance = 3  # pixels
    lines = []
    current_line = []
    last_y = None
    
    for word in sorted_words:
        if last_y is None or abs(word["top"] - last_y) <= tolerance:
            current_line.append(word)
        else:
            if current_line:
                # Extract detailed styles for the line
                line_styles = extract_text_styles(current_line)
                lines.append({
                    "words": sorted(current_line, key=lambda w: w["x0"]),
                    "styles": line_styles
                })
            current_line = [word]
        last_y = word["top"]
    
    if current_line:
        line_styles = extract_text_styles(current_line)
        lines.append({
            "words": sorted(current_line, key=lambda w: w["x0"]),
            "styles": line_styles
        })
    
    # Detect list items
    list_markers = detect_list_items(lines)
    list_item_indices = set(i for i, _ in list_markers)
    
    # Process lines into paragraphs and lists
    elements = []
    current_list = []
    current_list_type = None
    current_para = []
    last_line_bottom = None
    line_spacing_tolerance = 5
    
    for i, line in enumerate(lines):
        if not line:
            continue
            
        line_top = min(w["top"] for w in line)
        line_bottom = max(w["bottom"] for w in line)
        line_text = " ".join(w["text"] for w in line)
        
        if i in list_item_indices:
            # Handle list items
            list_type = next(t for idx, t in list_markers if idx == i)
            
            # End current paragraph if any
            if current_para:
                elements.append(create_paragraph_element(current_para, page_width))
                current_para = []
            
            if current_list and list_type != current_list_type:
                # End current list if type changes
                elements.append(create_list_element(current_list, current_list_type, page_width))
                current_list = []
            
            current_list_type = list_type
            current_list.append({
                "content": line_text.lstrip("•-*◦○●⚫⬤ 123456789.)[xX✓✔]"),
                "position": {
                    "x": min(w["x0"] for w in line),
                    "y": line_top,
                    "width": max(w["x1"] for w in line) - min(w["x0"] for w in line),
                    "height": line_bottom - line_top
                },
                "style": {
                    "fontSize": f"{mode(float(w.get('size', 12)) for w in line)}px",
                    "fontFamily": mode(w.get("fontname", "sans-serif") for w in line)
                }
            })
        else:
            # Handle regular paragraphs
            if current_list:
                # End current list
                elements.append(create_list_element(current_list, current_list_type, page_width))
                current_list = []
                current_list_type = None
            
            # Check if this line belongs to current paragraph
            new_paragraph = (
                not current_para or
                last_line_bottom is None or
                abs(line_top - last_line_bottom) > line_spacing_tolerance
            )
            
            if new_paragraph and current_para:
                elements.append(create_paragraph_element(current_para, page_width))
                current_para = []
            
            current_para.append({
                "text": line_text,
                "top": line_top,
                "bottom": line_bottom,
                "words": line,
                "style": {
                    "fontSize": f"{mode(float(w.get('size', 12)) for w in line)}px",
                    "fontFamily": mode(w.get("fontname", "sans-serif") for w in line)
                }
            })
        
        last_line_bottom = line_bottom
    
    # Add any remaining elements
    if current_para:
        elements.append(create_paragraph_element(current_para, page_width))
    if current_list:
        elements.append(create_list_element(current_list, current_list_type, page_width))
    
    return elements

def create_paragraph_element(lines: List[Dict], page_width: float) -> Dict:
    """Create a paragraph element from a group of lines."""
    first_line = lines[0]
    last_line = lines[-1]
    
    content = " ".join(line["text"] for line in lines)
    element_type = classify_text_style(
        [w for line in lines for w in line["words"]], 
        mean(float(w.get("size", 12)) for line in lines for w in line["words"])
    )
    
    return {
        "type": element_type,
        "content": content,
        "position": {
            "x": min(w["x0"] for line in lines for w in line["words"]),
            "y": first_line["top"],
            "width": max(w["x1"] for line in lines for w in line["words"]) - 
                    min(w["x0"] for line in lines for w in line["words"]),
            "height": last_line["bottom"] - first_line["top"],
            "margins": {
                "left": min(w["x0"] for line in lines for w in line["words"]),
                "right": page_width - max(w["x1"] for line in lines for w in line["words"])
            }
        },
        "style": {
            **first_line["style"],
            "textAlign": detect_text_alignment(
                [w for line in lines for w in line["words"]], 
                page_width
            )
        }
    }

def create_list_element(list_items: List[Dict], list_type: str, page_width: float) -> Dict:
    """Create a list element from a group of list items."""
    first_item = list_items[0]
    last_item = list_items[-1]
    
    return {
        "type": "list",
        "listType": list_type,
        "items": [item["content"] for item in list_items],
        "position": {
            "x": first_item["position"]["x"],
            "y": first_item["position"]["y"],
            "width": page_width - first_item["position"]["x"] * 2,
            "height": (last_item["position"]["y"] + last_item["position"]["height"]) - 
                     first_item["position"]["y"],
            "margins": {
                "left": first_item["position"]["x"],
                "right": page_width - (first_item["position"]["x"] + first_item["position"]["width"])
            }
        },
        "style": {
            **first_item["style"],
            "textAlign": "left"  # Lists are typically left-aligned
        }
    }

def download_pdf(url: str) -> str:
    """Download PDF from URL to temp file and return the path"""
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
        if url.startswith('file://'):
            # For local testing, just return the local path
            return urllib.parse.unquote(url[7:])
        else:
            urllib.request.urlretrieve(url, tmp.name)
            return tmp.name

def detect_layout_type(pages: List[Dict]) -> str:
    """Detect the document layout type based on content analysis"""
    if not pages:
        return 'minimal'
        
    # Sample the first few pages
    sample_pages = pages[:min(3, len(pages))]
    
    # Analyze column layout
    has_multiple_columns = any(
        len([e for e in page["elements"] if e["type"] in ("paragraph", "heading")]) > 3
        and any(abs(e1["position"]["x"] - e2["position"]["x"]) > page["width"] * 0.4
                for i, e1 in enumerate(page["elements"])
                for e2 in page["elements"][i+1:])
        for page in sample_pages
    )
    
    # Check for magazine-style layout indicators
    has_large_headings = any(
        any(e["type"] == "heading" and float(e["style"]["fontSize"].rstrip("px")) > 24
            for e in page["elements"])
        for page in sample_pages
    )
    
    has_images = any(
        any(e["type"] == "image" for e in page["elements"])
        for page in sample_pages
    )
    
    if has_multiple_columns and (has_large_headings or has_images):
        return 'magazine'
    elif len(pages) > 5 and not has_multiple_columns:
        return 'article'
    else:
        return 'minimal'

def analyze_typography(pages: List[Dict]) -> Dict:
    """Analyze document typography to generate theme settings"""
    if not pages:
        return {}
        
    font_sizes = []
    line_heights = []
    fonts = set()
    
    for page in pages:
        for elem in page["elements"]:
            if elem["type"] in ("paragraph", "heading"):
                if "fontSize" in elem["style"]:
                    size = float(elem["style"]["fontSize"].rstrip("px"))
                    font_sizes.append(size)
                if "fontFamily" in elem["style"]:
                    fonts.add(elem["style"]["fontFamily"])
                if "lineHeight" in elem["style"]:
                    line_heights.append(float(elem["style"]["lineHeight"]))
    
    if not font_sizes:
        return {}
        
    # Calculate typography scale
    base_size = median(font_sizes)
    heading_sizes = [s for s in font_sizes if s > base_size * 1.2]
    heading_scale = max(heading_sizes) / base_size if heading_sizes else 1.5
    
    return {
        "scale": {
            "baseFontSize": base_size,
            "headingScale": heading_scale,
            "spacing": median(line_heights) if line_heights else 1.5
        },
        "typography": {
            "paragraphSpacing": 1.4,
            "lineHeight": median(line_heights) if line_heights else 1.5,
            "headingFontFamily": next((f for f in fonts if "bold" in f.lower()), None),
            "bodyFontFamily": next((f for f in fonts if "bold" not in f.lower()), None)
        }
    }

def analyze_column_layout(elements: List[Dict], page_width: float) -> Dict:
    """Analyze and detect multi-column layout with detailed spacing."""
    if not elements:
        return {"columns": 1, "spacing": None}
        
    # Get x-positions of all text elements
    x_positions = [(e["position"]["x"], e["position"]["width"]) for e in elements 
                  if e["type"] in ("paragraph", "heading")]
    
    if not x_positions:
        return {"columns": 1, "spacing": None}
    
    # Find clusters of x-positions using gap analysis
    sorted_positions = sorted(x_positions, key=lambda x: x[0])
    gaps = []
    
    for i in range(len(sorted_positions) - 1):
        current_end = sorted_positions[i][0] + sorted_positions[i][1]
        next_start = sorted_positions[i + 1][0]
        gap = next_start - current_end
        if gap > page_width * 0.1:  # Significant gap indicating column break
            gaps.append(gap)
    
    # Analyze gaps to determine column count and spacing
    if not gaps:
        return {"columns": 1, "spacing": None}
    
    # If we have consistent gaps, we likely have columns
    avg_gap = mean(gaps)
    gap_variance = (max(gaps) - min(gaps)) / avg_gap
    
    if gap_variance < 0.3:  # Consistent gaps indicate regular columns
        columns = len(gaps) + 1
        return {
            "columns": columns,
            "spacing": avg_gap,
            "columnWidth": (page_width - (columns - 1) * avg_gap) / columns
        }
    
    return {"columns": 1, "spacing": None}

def extract_text_style(element) -> Dict:
    """Extract comprehensive text styling information from a PDF element."""
    style = {}
    
    # Basic text properties
    style["fontSize"] = element.get_text_size()
    style["fontFamily"] = element.get_font().split('+')[-1].split('-')[0]
    
    # Font weight and style
    font_name = element.get_font().lower()
    style["fontWeight"] = "bold" if "bold" in font_name else "normal"
    style["fontStyle"] = "italic" if any(x in font_name for x in ["italic", "oblique"]) else "normal"
    
    # Colors
    fill_color = element.get_text_color()
    if fill_color:
        style["color"] = rgb_to_hex(fill_color)
    
    # Background color
    bg_color = extract_background_color(element)
    if bg_color:
        style["backgroundColor"] = rgb_to_hex(bg_color)
    
    # Text alignment and spacing
    style["textAlign"] = detect_text_alignment(element)
    style["lineHeight"] = calculate_line_height(element)
    style["letterSpacing"] = element.get_text_size() * 0.05  # Approximate
    
    return style

def rgb_to_hex(rgb_tuple) -> str:
    """Convert RGB tuple to hex color code."""
    if not rgb_tuple or len(rgb_tuple) < 3:
        return None
    return f"#{int(rgb_tuple[0]*255):02x}{int(rgb_tuple[1]*255):02x}{int(rgb_tuple[2]*255):02x}"

def extract_background_color(element) -> tuple:
    """Extract background color from PDF element."""
    try:
        # Get non-stroke operations from the element
        operations = element._objs
        for op in operations:
            if hasattr(op, 'color') and op.operands[0] == 'n':  # Non-stroking color operation
                return op.color
    except:
        pass
    return None

def detect_text_alignment(element) -> str:
    """Detect text alignment based on position and bounds."""
    page_width = element.page.width
    x_start = element.bbox[0]
    x_end = element.bbox[2]
    
    # Calculate relative position on page
    rel_start = x_start / page_width
    rel_end = x_end / page_width
    
    if rel_start < 0.1:
        return "left"
    elif rel_end > 0.9:
        return "right"
    elif abs((rel_start + rel_end) / 2 - 0.5) < 0.1:
        return "center"
    return "left"  # Default

def calculate_line_height(element) -> float:
    """Calculate line height based on font metrics."""
    font_size = element.get_text_size()
    return font_size * 1.2  # Standard multiplier for comfortable reading

def detect_columns(text_elements, page_width: float) -> List[Dict]:
    """Detect and group text elements into columns based on their x-positions."""
    if not text_elements:
        return []
    
    # Sort elements by x position
    sorted_elements = sorted(text_elements, key=lambda e: e.bbox[0])
    
    # Find potential column boundaries
    x_positions = [e.bbox[0] for e in sorted_elements]
    column_gaps = []
    for i in range(1, len(x_positions)):
        gap = x_positions[i] - x_positions[i-1]
        if gap > page_width * 0.15:  # Consider gaps > 15% of page width as column separators
            column_gaps.append((x_positions[i-1] + gap/2, gap))
    
    # Group elements into columns
    columns = []
    if not column_gaps:
        # Single column
        columns.append({"elements": text_elements, "width": page_width})
    else:
        # Multiple columns
        current_elements = []
        current_x = 0
        for element in sorted_elements:
            x_center = (element.bbox[0] + element.bbox[2]) / 2
            
            # Check if we've crossed a column boundary
            for gap_x, gap_width in column_gaps:
                if current_x < gap_x <= x_center:
                    if current_elements:
                        columns.append({
                            "elements": current_elements,
                            "width": gap_x - current_x
                        })
                        current_elements = []
                    current_x = gap_x + gap_width
            
            current_elements.append(element)
        
        # Add the last column
        if current_elements:
            columns.append({
                "elements": current_elements,
                "width": page_width - current_x
            })
    
    return columns

def extract_page_content(page) -> Dict:
    """Extract content from a page with enhanced layout detection."""
    text_elements = []
    # Extract raw words first
    words = page.extract_words(
        x_tolerance=3,
        y_tolerance=3,
        keep_blank_chars=False,
        use_text_flow=True,
        horizontal_ltr=True,
        vertical_ttb=True,
        extra_attrs=['fontname', 'size'],
    )
    
    # Group words into paragraphs
    paragraphs = merge_words_into_paragraphs(words, page.width)
    
    # Extract images
    image_elements = []
    for image in page.images:
        image_elements.append({
            "type": "image",
            "content": image["src"],
            "position": {
                "x": image["x0"],
                "y": image["y0"],
                "width": image["x1"] - image["x0"],
                "height": image["y1"] - image["y0"]
            }
        })
    
    # Detect columns
    columns = detect_columns(text_elements, page.width)
    
    content = []
    for column in columns:
        column_elements = []
        current_paragraph = []
        last_y = None
        last_font_size = None
        
        for element in sorted(column["elements"], key=lambda e: (-e.bbox[1], e.bbox[0])):
            style = extract_text_style(element)
            y_pos = element.bbox[1]
            
            # Detect paragraph breaks
            if last_y is not None:
                y_gap = last_y - y_pos
                if y_gap > style["fontSize"] * 1.5 or last_font_size != style["fontSize"]:
                    if current_paragraph:
                        column_elements.append({
                            "type": "paragraph",
                            "content": current_paragraph,
                            "style": style
                        })
                        current_paragraph = []
            
            current_paragraph.append({
                "text": element.get_text(),
                "style": style
            })
            
            last_y = y_pos
            last_font_size = style["fontSize"]
        
        # Add the last paragraph
        if current_paragraph:
            column_elements.append({
                "type": "paragraph",
                "content": current_paragraph,
                "style": style
            })
        
        content.append({
            "type": "column",
            "content": column_elements,
            "width": column["width"]
        })
    
    return {
        "type": "page",
        "content": content,
        "width": page.width,
        "height": page.height
    }

def handler(event, context):
    try:
        body = json.loads(event['body'])
        pdf_url = body.get('pdfUrl')
        
        if not pdf_url:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({"error": "No PDF URL provided"})
            }

        print(f"Processing PDF from URL: {pdf_url}")
        pdf_path = download_pdf(pdf_url)
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                pages = []
                for page in pdf.pages:
                    page_content = extract_page_content(page)
                    pages.append(page_content)
                
                # Analyze document structure and create theme
                layout_type = detect_layout_type(pages)
                typography = analyze_typography(pages)
                
                extracted_content = {
                    "pages": pages,
                    "theme": {
                        "colors": ["#000000"],  # Default color
                        "fonts": list(set(
                            word["fontname"] 
                            for word in pdf.pages[0].extract_words(extra_attrs=['fontname']) 
                            if "fontname" in word
                        )),
                        "layout": layout_type,
                        **typography
                    },
                    "metadata": {
                        "pageCount": len(pdf.pages),
                        "createdAt": context.invoked_function_arn.split(":")[2]
                    }
                }
                
                return {
                    "statusCode": 200,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": json.dumps(extracted_content)
                }
        finally:
            if not pdf_url.startswith('file://'):
                import os
                os.unlink(pdf_path)
                
    except Exception as e:
        import traceback
        print("Error during extraction:", str(e))
        traceback.print_exc()
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": str(e)})
        }