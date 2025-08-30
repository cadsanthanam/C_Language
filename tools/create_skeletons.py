#!/usr/bin/env python3
"""
Create skeleton pages for missing files
"""

import os
from pathlib import Path

def create_chapter_skeleton(file_path, chapter_num, title):
    depth = len(Path(file_path).parts) - 1
    css_path = "../" * depth + "assets/styles.css"
    js_path = "../" * depth + "assets/app.js"
    quiz_css_path = "../" * depth + "assets/quiz.css"
    quiz_js_path = "../" * depth + "assets/quiz.js"
    favicon_path = "../" * depth + "assets/favicon.svg"
    
    content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="C Programming - {title}">
    <title>Chapter {chapter_num}: {title} | C Programming: Zero to Hero</title>
    <link rel="icon" type="image/svg+xml" href="{favicon_path}">
    <link rel="stylesheet" href="{css_path}">
    <link rel="stylesheet" href="{quiz_css_path}">
</head>
<body>
    <div class="app">
        <header class="header">
            <div class="logo">C Programming: Zero to Hero</div>
            <div class="search-container">
                <input type="search" class="search-input" placeholder="Search topics..." aria-label="Search">
            </div>
            <div class="shortcuts-hint">Press / to search, t to toggle nav</div>
        </header>

        <nav class="sidebar" aria-label="Course Navigation">
            <!-- Sidebar will be populated by sync tool -->
        </nav>

        <main class="main">
            <div class="content">
                <article>
                    <h1>Chapter {chapter_num}: {title}</h1>
                    
                    <section id="introduction">
                        <h2>Introduction</h2>
                        <p>This chapter covers {title.lower()} in C programming.</p>
                        
                        <div class="callout callout-info">
                            <div class="callout-title">🎯 Learning Objectives</div>
                            <p>By the end of this chapter, you will understand the fundamentals of {title.lower()}.</p>
                        </div>
                    </section>

                    <section id="basic-concepts">
                        <h2>Basic Concepts</h2>
                        <p>Content coming soon...</p>

                        <pre><code class="language-c">// Example code will be added here
#include &lt;stdio.h&gt;

int main() {{
    printf("Hello from {title}!\\n");
    return 0;
}}</code></pre>
                    </section>

                    <section id="practice-problems">
                        <h2>Practice Problems</h2>
                        <ol>
                            <li>Practice problem 1 (coming soon)</li>
                            <li>Practice problem 2 (coming soon)</li>
                            <li>Practice problem 3 (coming soon)</li>
                        </ol>
                    </section>

                    <section id="common-errors">
                        <h2>Common Errors</h2>
                        <div class="callout callout-error">
                            <div class="callout-title">❌ Common Mistake</div>
                            <p>Details about common errors will be added here.</p>
                        </div>
                    </section>
                </article>

                <footer class="footer">
                    <p>&copy; 2025 C Programming: Zero to Hero. Licensed under MIT for code, content under Creative Commons.</p>
                    <p>Built with ❤️ for engineering students. <a href="https://github.com/anthropics/claude-code">Generated with Claude Code</a></p>
                </footer>
            </div>
        </main>
    </div>

    <script src="{js_path}"></script>
    <script src="{quiz_js_path}" defer></script>
</body>
</html>'''
    
    return content

def create_practice_skeleton(file_path, title):
    depth = len(Path(file_path).parts) - 1
    css_path = "../" * depth + "assets/styles.css"
    js_path = "../" * depth + "assets/app.js"
    favicon_path = "../" * depth + "assets/favicon.svg"
    
    content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="C Programming Practice - {title}">
    <title>{title} Practice | C Programming: Zero to Hero</title>
    <link rel="icon" type="image/svg+xml" href="{favicon_path}">
    <link rel="stylesheet" href="{css_path}">
</head>
<body>
    <div class="app">
        <header class="header">
            <div class="logo">C Programming: Zero to Hero</div>
            <div class="search-container">
                <input type="search" class="search-input" placeholder="Search topics..." aria-label="Search">
            </div>
            <div class="shortcuts-hint">Press / to search, t to toggle nav</div>
        </header>

        <nav class="sidebar" aria-label="Course Navigation">
            <!-- Sidebar will be populated by sync tool -->
        </nav>

        <main class="main">
            <div class="content">
                <article>
                    <h1>{title} Practice</h1>
                    
                    <section id="easy-problems">
                        <h2>Easy Level Problems</h2>
                        <ol>
                            <li>Practice problem 1 (coming soon)</li>
                            <li>Practice problem 2 (coming soon)</li>
                        </ol>
                    </section>

                    <section id="medium-problems">
                        <h2>Medium Level Problems</h2>
                        <ol>
                            <li>Challenge problem 1 (coming soon)</li>
                            <li>Challenge problem 2 (coming soon)</li>
                        </ol>
                    </section>

                    <section id="solutions">
                        <h2>Solutions</h2>
                        <p>Solutions will be added soon...</p>
                    </section>
                </article>

                <footer class="footer">
                    <p>&copy; 2025 C Programming: Zero to Hero. Licensed under MIT for code, content under Creative Commons.</p>
                    <p>Built with ❤️ for engineering students. <a href="https://github.com/anthropics/claude-code">Generated with Claude Code</a></p>
                </footer>
            </div>
        </main>
    </div>

    <script src="{js_path}"></script>
</body>
</html>'''
    
    return content

def create_reference_skeleton(file_path, title):
    depth = len(Path(file_path).parts) - 1
    css_path = "../" * depth + "assets/styles.css"
    js_path = "../" * depth + "assets/app.js"
    favicon_path = "../" * depth + "assets/favicon.svg"
    
    content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="C Programming Reference - {title}">
    <title>{title} | C Programming: Zero to Hero</title>
    <link rel="icon" type="image/svg+xml" href="{favicon_path}">
    <link rel="stylesheet" href="{css_path}">
</head>
<body>
    <div class="app">
        <header class="header">
            <div class="logo">C Programming: Zero to Hero</div>
            <div class="search-container">
                <input type="search" class="search-input" placeholder="Search topics..." aria-label="Search">
            </div>
            <div class="shortcuts-hint">Press / to search, t to toggle nav</div>
        </header>

        <nav class="sidebar" aria-label="Course Navigation">
            <!-- Sidebar will be populated by sync tool -->
        </nav>

        <main class="main">
            <div class="content">
                <article>
                    <h1>{title}</h1>
                    
                    <section id="overview">
                        <h2>Overview</h2>
                        <p>This reference covers {title.lower()}.</p>
                    </section>

                    <section id="details">
                        <h2>Details</h2>
                        <p>Detailed content coming soon...</p>
                    </section>
                </article>

                <footer class="footer">
                    <p>&copy; 2025 C Programming: Zero to Hero. Licensed under MIT for code, content under Creative Commons.</p>
                    <p>Built with ❤️ for engineering students. <a href="https://github.com/anthropics/claude-code">Generated with Claude Code</a></p>
                </footer>
            </div>
        </main>
    </div>

    <script src="{js_path}"></script>
</body>
</html>'''
    
    return content

def main():
    root = Path('.')
    
    # Chapter skeletons
    chapters = [
        (5, "Arrays & Strings"),
        (6, "Functions"),
        (7, "Pointers"),
        (8, "Structures"),
        (9, "File I/O"),
        (10, "Algorithms")
    ]
    
    for num, title in chapters:
        file_path = f"chapters/{num:02d}-{title.lower().replace(' ', '-').replace('&', '').replace('/', '')}.html"
        full_path = root / file_path
        if not full_path.exists():
            content = create_chapter_skeleton(file_path, num, title)
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Created {file_path}")
    
    # Practice skeletons
    practice_pages = [
        "Arrays",
        "Functions", 
        "Pointers",
        "Structures",
        "Files"
    ]
    
    for title in practice_pages:
        file_path = f"practice/{title.lower()}.html"
        full_path = root / file_path
        if not full_path.exists():
            content = create_practice_skeleton(file_path, title)
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Created {file_path}")
    
    # Reference skeleton
    ref_file = root / "reference/tools-resources.html"
    if not ref_file.exists():
        content = create_reference_skeleton("reference/tools-resources.html", "Tools & Resources")
        with open(ref_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Created reference/tools-resources.html")
    
    print("All skeleton files created!")

if __name__ == '__main__':
    main()