document.addEventListener("DOMContentLoaded", function () {
    const headerPlaceholder = document.getElementById("global-header-placeholder");
    if (!headerPlaceholder) return;

    const rootPath = headerPlaceholder.getAttribute("data-root") || "./";

    // Detect active page from current URL
    const currentPath = window.location.pathname.toLowerCase();
    const getActive = (page) => {
        // Match the filename at the end of the path
        if (currentPath.endsWith(page)) return " active";
        // Special case: root or index
        if (page === "index.html" && (currentPath.endsWith("/") || currentPath === "")) return " active";
        return "";
    };

    const headerHTML = `
    <header class="modern-header">
        <div class="container">
            <nav class="navbar navbar-expand-lg">
                <a class="brand" href="${rootPath}index.html">
                    <img src="${rootPath}images/setconnect-logo.png" alt="SetConnect Globe">
                    Set<span>CONNECT</span>
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navModern" aria-controls="navModern" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navModern">
                    <ul class="navbar-nav nav-modern ms-auto align-items-center">
                        <li class="nav-item"><a class="nav-link${getActive('index.html')}" href="${rootPath}index.html">Home</a></li>
                        <li class="nav-item"><a class="nav-link${getActive('ourservices-2.html')}" href="${rootPath}ourservices-2.html">Our Services</a></li>
                        <li class="nav-item"><a class="nav-link${getActive('work-and-connections.html')}" href="${rootPath}work-and-connections.html">Client Impact</a></li>
                        <li class="nav-item"><a class="nav-link${getActive('ai-blogs.html')}" href="${rootPath}ai-blogs.html">AI Insights</a></li>
                        <li class="nav-item"><a class="nav-link${getActive('about.html')}" href="${rootPath}about.html">Who We Are</a></li>
                        <li class="nav-item ms-3"><a href="${rootPath}contact.html" class="btn-cyan${getActive('contact.html')}">Contact Us</a></li>
                    </ul>
                </div>
            </nav>
        </div>
    </header>
    `;

    headerPlaceholder.innerHTML = headerHTML;

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.modern-header');
        if (header) {
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }
    });
});
