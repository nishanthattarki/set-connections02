(function() {
    function initGating() {
        const downloadBtns = document.querySelectorAll('.btn-cta-primary');
        if (!downloadBtns.length) return;

        // Create the overlay modal but keep it hidden
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(10, 25, 47, 0.98)';
        overlay.style.zIndex = '999999';
        overlay.style.display = 'none';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.backdropFilter = 'blur(10px)';
        
        // Set the HTML content of the modal
        overlay.innerHTML = `
            <div style="background: linear-gradient(145deg, #0f1520, #0c1219); border: 1px solid rgba(8, 145, 178, 0.3); border-radius: 12px; padding: 40px; max-width: 450px; width: 90%; box-shadow: 0 30px 60px rgba(0,0,0,0.5); text-align: center; color: #fff; font-family: 'Inter', sans-serif; position: relative;">
                <button class="close-btn" style="position: absolute; top: 15px; right: 20px; background: none; border: none; color: rgba(255,255,255,0.5); font-size: 28px; cursor: pointer; transition: color 0.3s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">&times;</button>
                <i class="bi bi-lock-fill" style="font-size: 40px; color: #0891b2; margin-bottom: 20px; display: inline-block;"></i>
                <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; margin-bottom: 12px; font-weight: 700;">Learn how to Discover and Unlock Business Value using AI</h3>
                <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin-bottom: 30px; line-height: 1.6;">Fill out this form (30 seconds or less).</p>
                
                <form id="gateForm" style="display: flex; flex-direction: column; gap: 15px;">
                    <input type="hidden" name="_subject" value="New AI Playbook Download — SetConnect">
                    <input type="hidden" name="_captcha" value="false">
                    <input type="hidden" name="_template" value="table">
                    <input type="text" name="_honey" style="display:none">
                    
                    <input type="text" id="gateName" name="full_name" placeholder="Full Name" required style="padding: 12px 16px; border-radius: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; outline: none; transition: border-color 0.3s;">
                    <input type="email" id="gateEmail" name="email" placeholder="Work Email" required style="padding: 12px 16px; border-radius: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; outline: none; transition: border-color 0.3s;">
                    <input type="text" id="gateCompany" name="company" placeholder="Company" required style="padding: 12px 16px; border-radius: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; outline: none; transition: border-color 0.3s;">
                    
                    <button type="submit" id="gateSubmitBtn" style="margin-top: 10px; background: #0891b2; color: #fff; border: none; padding: 14px; border-radius: 6px; font-weight: 600; font-size: 15px; cursor: pointer; transition: background 0.3s;" onmouseover="this.style.background='#0e7490'" onmouseout="this.style.background='#0891b2'">Download</button>
                </form>
                <div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 20px;">By submitting, you unlock access to all 4 AI guides.</div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Handle closing the modal manually
        const closeBtn = overlay.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        });

        let pendingDownloadUrl = null;

        // Attach click listeners to all download CTA buttons
        downloadBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                if (sessionStorage.getItem('unlocked_4steps') !== 'true') {
                    e.preventDefault(); // Stop the download temporarily
                    pendingDownloadUrl = btn.getAttribute('href'); // Save the URL to download later
                    overlay.style.display = 'flex'; // Show the form
                    document.body.style.overflow = 'hidden'; // Stop background scrolling
                }
            });
        });

        // Styling focus states for inputs
        const inputs = overlay.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => input.style.borderColor = '#0891b2');
            input.addEventListener('blur', () => input.style.borderColor = 'rgba(255,255,255,0.1)');
        });

        // Handle form submission
        const form = overlay.querySelector('#gateForm');
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Basic validation
            const name = document.getElementById('gateName').value.trim();
            const email = document.getElementById('gateEmail').value.trim();
            const company = document.getElementById('gateCompany').value.trim();

            if (name && email && company) {
                const btn = document.getElementById('gateSubmitBtn');
                const originalText = btn.textContent;
                btn.textContent = 'Submitting...';
                btn.disabled = true;

                try {
                    const formData = new FormData(form);
                    const response = await fetch('https://formsubmit.co/ajax/nishanthattarki23@gmail.com', {
                        method: 'POST',
                        body: formData,
                        headers: { 'Accept': 'application/json' }
                    });

                    if (response.ok) {
                        // Save to sessionStorage so they don't have to fill it again this session
                        sessionStorage.setItem('unlocked_4steps', 'true');
                        
                        // Hide the modal and restore scrolling
                        overlay.style.display = 'none';
                        document.body.style.overflow = '';
                        
                        // Trigger the download that they originally clicked
                        if (pendingDownloadUrl) {
                            window.open(pendingDownloadUrl, '_blank');
                            pendingDownloadUrl = null;
                        }
                    } else {
                        throw new Error('Server error');
                    }
                } catch (err) {
                    alert('There was an issue submitting your request. Please try again or email us directly.');
                } finally {
                    // Restore button state
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGating);
    } else {
        initGating();
    }
})();
