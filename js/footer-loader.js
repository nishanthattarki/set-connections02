document.addEventListener("DOMContentLoaded", function () {
    const footerPlaceholder = document.getElementById("global-footer-placeholder");
    if (!footerPlaceholder) return;

    const rootPath = footerPlaceholder.getAttribute("data-root") || "./";

    const footerHTML = `
    <!-- CTA Split -->
    <section class="cta-split"
        style="background: linear-gradient(135deg, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.75) 50%, transparent 100%), url('https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=1600') center/cover; background-attachment: fixed;">
        <div class="row g-0">
            <div class="col-lg-11">
                <div class="cta-content" style="background: transparent;">
                    <h2 style="font-size: 48px; font-weight: 700; margin-bottom: 10px; white-space: nowrap;">Start Your AI Discovery Today</h2>
                    <h3 style="font-size: 32px; font-weight: 600; margin-bottom: 15px; white-space: nowrap;">Build your AI Roadmap in 14 Days</h3>
                    <p style="font-size: 18px; opacity: 0.9; margin-bottom: 30px;">Start your transformation journey with expert guidance</p>
                    <a href="${rootPath}contact.html" class="btn-white-outline"
                        style="align-self: flex-start; padding-left: 28px; padding-right: 28px;">Contact Us Today</a>
                </div>
            </div>
            <div class="col-lg-1" style="background: transparent;">
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer"
        style="margin-top: 0; background: linear-gradient(135deg, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.75) 50%, rgba(0, 0, 0, 0.60) 100%), url('https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=1600') center/cover; background-attachment: fixed;">
        <div class="container">
            <div class="row">
                <div class="col-lg-4 mb-4">
                    <h5><span style="color: #ffffff;">Set</span><span style="color: var(--cyan);">CONNECT</span></h5>
                    <p style="color: #fff; font-weight: 500; font-size: 19px; margin-bottom: 5px; margin-top: 5px;">World Headquarters in Austin, TX, USA</p>
                    <p style="color: rgba(255, 255, 255, 0.9); font-weight: 400; font-size: 16px; margin-bottom: 0px;">The AI Success Playbook Company</p>
                    <p style="font-size: 13px; color: rgba(255, 255, 255, 0.7); line-height: 1.4; margin-top: 0px; margin-bottom: 20px;">Guiding business leaders to successful AI outcomes</p>
                    
                    <p class="mb-1"><i class="bi bi-geo-alt me-2"></i>Austin, Texas</p>
                    <p><i class="bi bi-geo-alt me-2"></i>Mumbai, India</p>
                </div>
                <div class="col-lg-2 mb-4">
                    <h5>Company</h5>
                    <a href="${rootPath}about.html">About Us</a>
                    <a href="${rootPath}our-work.html">Our Work</a>
                    <a href="${rootPath}case-studies.html">Case Studies</a>
                </div>
                <div class="col-lg-2 mb-4">
                    <h5>Services</h5>
                    <a href="${rootPath}our-services.html#discovery">AI Discovery</a>
                    <a href="${rootPath}our-services.html#immersion">AI Immersion</a>
                    <a href="${rootPath}our-services.html#activation">AI Activation</a>
                    <a href="${rootPath}our-services.html#scale">AI Scale</a>
                </div>
                <div class="col-lg-2 mb-4">
                    <h5>Resources</h5>
                    <a href="${rootPath}ai-blogs.html">AI Blogs</a>
                    <a href="${rootPath}setconnections.html">SetConnections</a>
                    <a href="${rootPath}contact.html">Contact Us</a>
                </div>
                <div class="col-lg-2 mb-4">
                    <h5>Connect</h5>
                    <a href="#"><i class="bi bi-linkedin me-2"></i>LinkedIn</a>
                    <a href="#"><i class="bi bi-twitter me-2"></i>Twitter</a>
                    <a href="mailto:contact@setconnect.ai"><i class="bi bi-envelope me-2"></i>Email</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 SetConnect Global. All rights reserved. | Founded in Austin, Texas</p>
            </div>
        </div>
    </footer>
    `;

    footerPlaceholder.innerHTML = footerHTML;
});
