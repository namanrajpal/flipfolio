# ROADMAP

New Data Processing Pipeline:

Create a new service to handle PDF extraction using pdf2htmlEX or pdfplumber
Extract structured data including:
Text boxes with positions and styles
Images with their coordinates
Color schemes and fonts
Page layout information
Data Storage & Structure:

Create a new interface for the extracted content:
{
Store this alongside the PDF in S3
View Mode Selection:

Add a view mode switcher to the existing FolioPage component
Support three modes:
Current Flipbook (existing)
Scroll view (simple vertical scroll)
Dynamic view (responsive HTML recreation)
Implementation Phases: Phase 1:

Set up PDF extraction service
Create basic storage for extracted content
Implement simple scroll view
Phase 2:

Add AI-powered layout analysis
Implement dynamic view with CSS Grid
Add theme generation
Phase 3:

Add view mode switching UI
Optimize performance and caching
Add theme customization
Would you like me to start implementing any specific part of this plan? I can:

Add the view mode switcher infrastructure
Set up the PDF extraction service
Create the basic scroll view component
Something else you prefer