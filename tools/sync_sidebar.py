import os
import re
import xml.etree.ElementTree as ET
from xml.etree.ElementTree import Element, SubElement, tostring

def pretty_print(elem):
    """Return a pretty-printed XML string for the Element."""
    # This is a simplified pretty-printer. It's not perfect for HTML.
    from xml.dom import minidom
    rough_string = ET.tostring(elem, 'utf-8')
    reparsed = minidom.parseString(rough_string)
    return reparsed.toprettyxml(indent="  ")

def sync_sidebar_stdlib():
    """
    Extracts the sidebar from index.html and injects it into all other HTML files
    using only Python's standard library.
    """
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    source_html_path = os.path.join(project_root, 'index.html')
    
    print(f"Using '{source_html_path}' as the canonical source.")

    try:
        with open(source_html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
            # Use regex to find the sidebar content as ElementTree is not a full HTML parser
            sidebar_match = re.search(r'<nav class="sidebar".*?>.*?</nav>', html_content, re.DOTALL)
            if not sidebar_match:
                print("ERROR: Could not find sidebar navigation in index.html")
                return
            canonical_sidebar_html = sidebar_match.group(0)
    except FileNotFoundError:
        print(f"ERROR: Canonical source file not found at '{source_html_path}'")
        return

    target_dirs = ['chapters', 'practice', 'reference']
    files_synced = 0

    for directory in target_dirs:
        dir_path = os.path.join(project_root, directory)
        if not os.path.isdir(dir_path):
            continue

        for filename in os.listdir(dir_path):
            if filename.endswith('.html'):
                file_path = os.path.join(dir_path, filename)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    target_html = f.read()

                # Adjust paths in the canonical sidebar for the current file
                temp_sidebar = canonical_sidebar_html
                
                # Adjust asset paths like /assets/ -> ../assets/
                temp_sidebar = re.sub(r'href="/(assets|chapters|practice|reference|index.html)', r'href="../\1', temp_sidebar)

                # Set active link
                current_page_path = f"../{directory}/{filename}"
                # Remove any existing active state
                temp_sidebar = temp_sidebar.replace(' active" aria-current="page"', '"')
                # Add active state to the correct link
                active_link_pattern = f'href="{current_page_path}"'
                replacement = f'{active_link_pattern} class="nav-link active" aria-current="page"'
                temp_sidebar = temp_sidebar.replace(active_link_pattern, replacement)
                
                # Replace the old sidebar with the new one in the target file
                updated_html, count = re.subn(r'<nav class="sidebar".*?>.*?</nav>', temp_sidebar, target_html, flags=re.DOTALL)

                if count > 0:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(updated_html)
                    print(f"Synced sidebar in: {directory}/{filename}")
                    files_synced += 1
                else:
                    print(f"WARNING: Could not find sidebar in {directory}/{filename}")


    print(f"\nSync complete. Updated {files_synced} files.")

if __name__ == '__main__':
    sync_sidebar_stdlib()
