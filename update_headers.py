import os
import re

directory = r"c:\Users\OM\.gemini\antigravity\scratch\setconnect-landing-pages\setconnect-website-full"

# The standard navbar from index.html (with 'active' stripped so we can inject it based on filename, or just standard)
standard_header = """    <header class="modern-header">
        <div class="container">
            <nav class="navbar navbar-expand-lg">
                <a class="brand" href="index.html">
                    <img src="images/setconnect-logo.png" alt="SetConnect Globe">
                    <span style="color:#fff;">Set</span><span style="color:var(--cyan);">CONNECT</span>
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navModern">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navModern">
                    <ul class="navbar-nav nav-modern ms-auto align-items-center">
                        <li class="nav-item"><a class="nav-link {index_active}" href="index.html">Home</a></li>
                        <li class="nav-item"><a class="nav-link {services_active}" href="ourservices-2.html">Our Services</a></li>
                        <li class="nav-item"><a class="nav-link {work_active}" href="work-and-connections.html">Client Impact & Ecosystem</a></li>
                        <li class="nav-item"><a class="nav-link {blogs_active}" href="ai-blogs.html">AI Blogs</a></li>
                        <li class="nav-item"><a class="nav-link {about_active}" href="about.html">About Us</a></li>
                        <li class="nav-item ms-3"><a href="contact.html" class="btn-cyan">Contact Us</a></li>
                    </ul>
                </div>
            </nav>
        </div>
    </header>"""

# Using regex to match from <header class="modern-header"> to </header>
header_pattern = re.compile(r'<header class="modern-header">.*?</header>', re.DOTALL | re.IGNORECASE)

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".html"):
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            if '<header class="modern-header">' in content:
                # Determine active class
                replacements = {"index_active": "", "services_active": "", "work_active": "", "blogs_active": "", "about_active": ""}
                
                # Make path comparison robust
                f_name = file.lower()
                if f_name == "index.html":
                    replacements["index_active"] = "active"
                elif f_name == "ourservices-2.html" or f_name == "our-services.html":
                    replacements["services_active"] = "active"
                elif f_name == "work-and-connections.html" or f_name == "our-work.html" or f_name == "case-studies.html":
                    replacements["work_active"] = "active"
                elif f_name == "ai-blogs.html":
                    replacements["blogs_active"] = "active"
                elif f_name == "about.html":
                    replacements["about_active"] = "active"

                new_header = standard_header.format(**replacements)
                
                # We need to adjust relative paths if it's in a subdirectory!
                depth = root[len(directory):].count(os.sep)
                if depth > 0:
                    prefix = "../" * depth
                    new_header = new_header.replace('href="', f'href="{prefix}')
                    new_header = new_header.replace('src="images/', f'src="{prefix}images/')
                    # Don't break external links or anchor links if any (though these are all standard pages)
                
                # Apply replacement
                new_content = header_pattern.sub(new_header, content)

                if new_content != content:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"Updated {file_path}")
            else:
                print(f"Skipped {file_path} (No modern-header found)")
