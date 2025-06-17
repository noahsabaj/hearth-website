# Print Styles Documentation

## Overview
The `print.css` file provides comprehensive print stylesheets for the Hearth Engine website, ensuring documentation and content are optimized for printing.

## Features Implemented

### 1. **Basic Print Optimization**
- Light background with dark text for readability
- Serif fonts (Georgia) for better print legibility
- Proper page margins and formatting
- Page headers with title
- Page numbers in footer

### 2. **Hidden Elements**
- Navigation bars and menus
- Interactive buttons and controls
- Video/audio elements
- Social media links
- Sidebars and toolbars
- Loading spinners
- Theme toggles
- Footer content

### 3. **Typography**
- Hierarchical heading styles with borders
- Optimized font sizes for print (12pt body, scaled headings)
- Proper line height and spacing
- Orphan/widow control

### 4. **Links**
- URLs displayed after links (except internal anchors)
- Bold styling for emphasis
- Excluded mailto: and tel: links from URL display

### 5. **Code Blocks**
- Monospace font (Courier New)
- Light gray background
- Border styling
- Proper word wrapping
- Grayscale syntax highlighting
- Page break avoidance

### 6. **Tables**
- Full borders for clarity
- Header row highlighting
- Zebra striping for readability
- Page break avoidance

### 7. **Page Breaks**
- Avoid breaks after headings
- Keep related content together
- Force breaks before major sections
- Proper handling of code blocks and tables

### 8. **Documentation-Specific**
- Full-width content (no sidebars)
- Section-based page breaks
- Hidden edit links and feedback widgets
- Simplified related articles display
- Visible last updated information

### 9. **Page-Specific Optimizations**

#### Downloads Page
- Preserved download card structure
- URL display for download links
- Hidden platform icons
- Optimized release notes display

#### FAQ Page
- Expanded accordion content
- Hidden search functionality
- Preserved Q&A structure
- Category chips as simple borders

### 10. **Advanced Features**
- High-resolution print support (300dpi+)
- Landscape orientation support
- Cross-reference page numbers
- Table of contents with page numbers
- Print color adjustment for accuracy

## Usage

The print styles are automatically applied when users print any page on the Hearth Engine website. Users can:

1. Use browser print function (Ctrl/Cmd + P)
2. Save as PDF
3. Print to physical printer

## Testing

A test file is available at `/public/print-test.html` to preview print styles without actually printing.

## Browser Compatibility

Print styles are compatible with:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Most modern browsers supporting CSS3 print media queries

## Future Enhancements

Potential improvements:
- Custom headers/footers per section
- QR codes for external links
- Print-specific navigation index
- Configurable print themes
- Export options for different paper sizes