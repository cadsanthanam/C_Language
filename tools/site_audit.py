#!/usr/bin/env python3
"""
Site Readiness Audit for C Programming Zero to Hero
Validates completeness, structure, and quality of static site
"""

import os
import re
import sys
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse


class HTMLValidator(HTMLParser):
    def __init__(self, file_path):
        super().__init__()
        self.file_path = file_path
        self.errors = []
        self.warnings = []
        self.has_doctype = False
        self.has_html_lang = False
        self.h1_count = 0
        self.has_header = False
        self.has_nav_sidebar = False
        self.has_main = False
        self.has_footer = False
        self.css_links = []
        self.js_links = []
        self.ids = set()
        self.links = []
        self.current_tag = None
        self.current_attrs = {}
        self.code_blocks = 0
        self.has_practice_section = False
        self.has_common_errors = False

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        self.current_attrs = dict(attrs)
        
        if tag == 'html' and any(attr[0] == 'lang' for attr in attrs):
            self.has_html_lang = True
        elif tag == 'h1':
            self.h1_count += 1
        elif tag == 'header':
            self.has_header = True
        elif tag == 'nav' and any(attr[1] and 'sidebar' in attr[1] for attr in attrs if attr[0] == 'class'):
            self.has_nav_sidebar = True
        elif tag == 'main':
            self.has_main = True
        elif tag == 'footer':
            self.has_footer = True
        elif tag == 'link' and any(attr[0] == 'rel' and attr[1] == 'stylesheet' for attr in attrs):
            href = next((attr[1] for attr in attrs if attr[0] == 'href'), None)
            if href:
                self.css_links.append(href)
        elif tag == 'script':
            src = next((attr[1] for attr in attrs if attr[0] == 'src'), None)
            if src:
                self.js_links.append(src)
        elif tag == 'a':
            href = next((attr[1] for attr in attrs if attr[0] == 'href'), None)
            if href:
                self.links.append(href)
        elif tag == 'code' and self.current_attrs.get('class') == 'language-c':
            self.code_blocks += 1
            
        # Check for IDs
        id_attr = next((attr[1] for attr in attrs if attr[0] == 'id'), None)
        if id_attr:
            if id_attr in self.ids:
                self.errors.append(f"Duplicate ID: {id_attr}")
            self.ids.add(id_attr)

    def handle_data(self, data):
        if 'practice' in data.lower() and self.current_tag in ['h2', 'h3']:
            self.has_practice_section = True
        elif 'common errors' in data.lower() and self.current_tag in ['h2', 'h3']:
            self.has_common_errors = True

    def handle_decl(self, decl):
        if decl.lower().startswith('doctype html'):
            self.has_doctype = True


class SiteAuditor:
    def __init__(self, root_path):
        self.root = Path(root_path)
        self.errors = []
        self.warnings = []
        self.required_files = {
            'index.html': 'root',
            'assets/styles.css': 'css',
            'assets/app.js': 'js',
            'assets/quiz.js': 'js',
            'assets/quiz.css': 'css',
            'assets/favicon.svg': 'icon',
            '404.html': 'root',
            
            # Chapters
            'chapters/01-introduction.html': 'chapter',
            'chapters/02-basics.html': 'chapter',
            'chapters/03-control-flow.html': 'chapter',
            'chapters/04-loops.html': 'chapter',
            'chapters/05-arrays-strings.html': 'chapter',
            'chapters/06-functions.html': 'chapter',
            'chapters/07-pointers.html': 'chapter',
            'chapters/08-structures.html': 'chapter',
            'chapters/09-files.html': 'chapter',
            'chapters/10-algorithms.html': 'chapter',
            
            # Practice
            'practice/basics.html': 'practice',
            'practice/control-loops.html': 'practice',
            'practice/arrays.html': 'practice',
            'practice/functions.html': 'practice',
            'practice/pointers.html': 'practice',
            'practice/structures.html': 'practice',
            'practice/files.html': 'practice',
            
            # Reference
            'reference/common-errors.html': 'reference',
            'reference/exam-guide.html': 'reference',
            'reference/tools-resources.html': 'reference'
        }
        
    def audit_file_structure(self):
        """Check if all required files exist"""
        print("📁 Auditing file structure...")
        missing_files = []
        
        for file_path, file_type in self.required_files.items():
            full_path = self.root / file_path
            if not full_path.exists():
                missing_files.append(file_path)
                self.errors.append(f"Missing required file: {file_path}")
        
        return len(missing_files) == 0
    
    def audit_html_file(self, file_path):
        """Audit a single HTML file"""
        full_path = self.root / file_path
        
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            self.errors.append(f"{file_path}: Cannot read file - {e}")
            return None
            
        validator = HTMLValidator(file_path)
        validator.feed(content)
        
        # Check required elements
        issues = []
        if not validator.has_doctype:
            issues.append("Missing DOCTYPE html")
        if not validator.has_html_lang:
            issues.append("Missing <html lang='en'>")
        if validator.h1_count != 1:
            issues.append(f"Expected 1 <h1>, found {validator.h1_count}")
        if not validator.has_header:
            issues.append("Missing <header>")
        if not validator.has_nav_sidebar:
            issues.append("Missing <nav> with sidebar class")
        if not validator.has_main:
            issues.append("Missing <main>")
        if not validator.has_footer:
            issues.append("Missing <footer>")
            
        # Check CSS/JS includes
        depth = len(Path(file_path).parts) - 1
        expected_css = "../" * depth + "assets/styles.css" if depth > 0 else "assets/styles.css"
        expected_js = "../" * depth + "assets/app.js" if depth > 0 else "assets/app.js"
        
        if expected_css not in validator.css_links:
            issues.append(f"Missing or incorrect CSS link: expected {expected_css}")
        if expected_js not in validator.js_links:
            issues.append(f"Missing or incorrect JS link: expected {expected_js}")
            
        # Chapter-specific checks
        if file_path.startswith('chapters/'):
            if validator.code_blocks == 0:
                issues.append("Chapter missing code blocks")
            if not validator.has_practice_section:
                issues.append("Chapter missing Practice section")
            if not validator.has_common_errors:
                issues.append("Chapter missing Common Errors section")
        
        return {
            'path': file_path,
            'issues': issues,
            'links': validator.links,
            'ids': validator.ids,
            'code_blocks': validator.code_blocks
        }
    
    def check_internal_links(self, html_files_data):
        """Check that internal links resolve correctly"""
        print("🔗 Checking internal links...")
        
        for file_data in html_files_data:
            file_path = file_data['path']
            current_dir = Path(file_path).parent
            
            for link in file_data['links']:
                if link.startswith('#'):
                    # Internal anchor
                    anchor = link[1:]
                    if anchor not in file_data['ids']:
                        self.errors.append(f"{file_path}: Broken anchor #{anchor}")
                elif not link.startswith(('http://', 'https://', 'mailto:')):
                    # Internal link
                    if '#' in link:
                        target_path, anchor = link.split('#', 1)
                    else:
                        target_path, anchor = link, None
                        
                    # Resolve relative path
                    if target_path:
                        resolved_path = (current_dir / target_path).resolve()
                        relative_path = resolved_path.relative_to(self.root.resolve())
                        
                        if not (self.root / relative_path).exists():
                            self.errors.append(f"{file_path}: Broken link to {link}")
                        elif anchor:
                            # Check if target has the anchor
                            target_data = next((f for f in html_files_data if f['path'] == str(relative_path)), None)
                            if target_data and anchor not in target_data['ids']:
                                self.errors.append(f"{file_path}: Broken anchor {link}")
    
    def check_sidebar_consistency(self, html_files_data):
        """Check that sidebar navigation is consistent"""
        print("📊 Checking sidebar consistency...")
        
        # Extract sidebar from index.html as canonical
        index_data = next((f for f in html_files_data if f['path'] == 'index.html'), None)
        if not index_data:
            self.errors.append("Cannot find index.html for sidebar reference")
            return
        
        # For now, just check that each page has navigation links
        for file_data in html_files_data:
            if len([l for l in file_data['links'] if 'chapters/' in l or 'practice/' in l or 'reference/' in l]) < 5:
                self.warnings.append(f"{file_data['path']}: Sidebar may be incomplete")
    
    def run_audit(self):
        """Run complete site audit"""
        print("🚀 Starting C Programming Zero to Hero Site Audit\n")
        
        # Check file structure
        files_ok = self.audit_file_structure()
        
        # Audit HTML files
        html_files = [f for f in self.required_files.keys() if f.endswith('.html')]
        html_files_data = []
        
        print("\n📄 Auditing HTML files...")
        for file_path in html_files:
            if (self.root / file_path).exists():
                file_data = self.audit_html_file(file_path)
                if file_data:
                    html_files_data.append(file_data)
                    if file_data['issues']:
                        for issue in file_data['issues']:
                            self.errors.append(f"{file_path}: {issue}")
        
        # Check links and consistency
        if html_files_data:
            self.check_internal_links(html_files_data)
            self.check_sidebar_consistency(html_files_data)
        
        # Generate report
        self.generate_report()
        
        # Return exit code
        return 0 if len(self.errors) == 0 else 1
    
    def generate_report(self):
        """Generate audit report"""
        report_path = self.root / 'tools' / 'audit-report.md'
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("# Site Audit Report - C Programming Zero to Hero\n\n")
            f.write(f"**Generated:** {__import__('datetime').datetime.now().isoformat()}\n\n")
            
            # Summary
            status = "PASS ✅" if len(self.errors) == 0 else "FAIL ❌"
            f.write(f"## Overall Status: {status}\n\n")
            f.write(f"- **Errors:** {len(self.errors)}\n")
            f.write(f"- **Warnings:** {len(self.warnings)}\n\n")
            
            # File structure
            f.write("## File Structure\n\n")
            for file_path, file_type in self.required_files.items():
                exists = (self.root / file_path).exists()
                status = "✅" if exists else "❌"
                f.write(f"- {status} `{file_path}`\n")
            f.write("\n")
            
            # Errors
            if self.errors:
                f.write("## Errors\n\n")
                for error in self.errors:
                    f.write(f"- ❌ {error}\n")
                f.write("\n")
            
            # Warnings  
            if self.warnings:
                f.write("## Warnings\n\n")
                for warning in self.warnings:
                    f.write(f"- ⚠️ {warning}\n")
                f.write("\n")
            
            # Checklist
            f.write("## Quality Checklist\n\n")
            checklist_items = [
                ("All required pages exist", len([f for f in self.required_files.keys() if not (self.root / f).exists()]) == 0),
                ("HTML structure valid", len([e for e in self.errors if 'Missing' in e and any(tag in e for tag in ['DOCTYPE', 'html', 'h1', 'header', 'nav', 'main', 'footer'])]) == 0),
                ("CSS/JS paths correct", len([e for e in self.errors if 'CSS link' in e or 'JS link' in e]) == 0),
                ("No broken internal links", len([e for e in self.errors if 'Broken link' in e or 'Broken anchor' in e]) == 0),
                ("Chapters have code blocks", len([e for e in self.errors if 'missing code blocks' in e]) == 0),
                ("Chapters have practice sections", len([e for e in self.errors if 'missing Practice section' in e]) == 0),
                ("Chapters have error guidance", len([e for e in self.errors if 'missing Common Errors' in e]) == 0)
            ]
            
            for item, passed in checklist_items:
                status = "✅" if passed else "❌"
                f.write(f"- {status} {item}\n")
        
        print(f"\n📋 Audit report generated: {report_path}")
        
        # Print summary
        print(f"\n📊 AUDIT SUMMARY")
        print(f"Status: {status}")
        print(f"Errors: {len(self.errors)}")
        print(f"Warnings: {len(self.warnings)}")
        
        if self.errors:
            print(f"\nFirst few errors:")
            for error in self.errors[:5]:
                print(f"  ❌ {error}")
            if len(self.errors) > 5:
                print(f"  ... and {len(self.errors) - 5} more")


def main():
    if len(sys.argv) > 1:
        root_path = sys.argv[1]
    else:
        root_path = '.'
    
    auditor = SiteAuditor(root_path)
    exit_code = auditor.run_audit()
    sys.exit(exit_code)


if __name__ == '__main__':
    main()