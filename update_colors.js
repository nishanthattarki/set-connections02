const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/OM/.gemini/antigravity/scratch/setconnect-landing-pages/setconnect-website-full';
const dirs = ['aiblogs', 'casestudies', 'our-work'];

dirs.forEach(d => {
    const dirPath = path.join(baseDir, d);
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach(file => {
            if (file.endsWith('.html')) {
                const filePath = path.join(dirPath, file);
                let content = fs.readFileSync(filePath, 'utf8');

                // Update root/body
                content = content.replace(/background-color:\s*#0f1419\s*!important;/g, 'background-color: #0a192f !important;');

                // Update heroes
                content = content.replace(/linear-gradient\(135deg,\s*#1a2332\s*0%,\s*#1e3a3a\s*100%\)/g, 'linear-gradient(135deg, #0d1b3e 0%, #0a2545 50%, #0e163a 100%)');

                // Light Sections
                content = content.replace(/\.blog-content\s*\{[\s\S]*?background:\s*#0f1419;/g, match => match.replace('#0f1419', '#ffffff'));
                content = content.replace(/\.case-content\s*\{[\s\S]*?background:\s*#0f1419;/g, match => match.replace('#0f1419', '#ffffff'));
                content = content.replace(/\.content-section\s*\{[\s\S]*?background:\s*#0f1419;/g, match => match.replace('#0f1419', '#ffffff'));
                content = content.replace(/\.hero-image-section\s*\{[\s\S]*?background:\s*#0f1419;/g, match => match.replace('#0f1419', '#ffffff'));

                // Dark sections
                content = content.replace(/\.back-section\s*\{[\s\S]*?background:\s*#0f1419;/g, match => match.replace('#0f1419', '#0a192f'));

                // Cards and texts inside light sections
                content = content.replace(/\.author-bio\s*\{[\s\S]*?background:\s*rgba\(255,\s*255,\s*255,\s*0\.05\);/g, match => match.replace('rgba(255, 255, 255, 0.05)', '#f8f9fa'));
                content = content.replace(/\.author-bio\s*\{[\s\S]*?border:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.1\);/g, match => match.replace('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.08)'));
                
                content = content.replace(/\.content-card\s*\{[\s\S]*?background:\s*linear-gradient\(145deg,\s*#1a2332\s*0%,\s*#0d1117\s*100%\);/g, match => match.replace('linear-gradient(145deg, #1a2332 0%, #0d1117 100%)', '#f8f9fa'));
                content = content.replace(/\.content-card\s*\{[\s\S]*?border:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.08\);/g, match => match.replace('rgba(255, 255, 255, 0.08)', 'rgba(0, 0, 0, 0.08)'));
                content = content.replace(/\.content-card\s*\{[\s\S]*?border:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.1\);/g, match => match.replace('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.08)'));

                // Text colors
                content = content.replace(/\.blog-text\s*\{[\s\S]*?color:\s*rgba\(255,\s*255,\s*255,\s*0\.9\);/g, match => match.replace('rgba(255, 255, 255, 0.9)', 'rgba(0, 0, 0, 0.75)'));
                content = content.replace(/\.blog-text\s*h2\s*\{[\s\S]*?color:\s*#fff;/g, match => match.replace('#fff', '#1a2332'));
                content = content.replace(/\.blog-author\s*\{[\s\S]*?color:\s*rgba\(255,\s*255,\s*255,\s*0\.6\);/g, match => match.replace('rgba(255, 255, 255, 0.6)', 'rgba(0, 0, 0, 0.6)'));

                content = content.replace(/\.content-card\s*h2\s*\{[\s\S]*?color:\s*#fff;/g, match => match.replace('#fff', '#1a2332'));
                content = content.replace(/\.content-card\s*h2\s*\{[\s\S]*?color:\s*#ffffff;/g, match => match.replace('#ffffff', '#1a2332'));
                content = content.replace(/\.content-card\s*p\s*\{[\s\S]*?color:\s*rgba\(255,\s*255,\s*255,\s*0\.75\);/g, match => match.replace('rgba(255, 255, 255, 0.75)', 'rgba(0, 0, 0, 0.75)'));
                content = content.replace(/\.content-card\s*p\s*\{[\s\S]*?color:\s*rgba\(255,\s*255,\s*255,\s*0\.8\);/g, match => match.replace('rgba(255, 255, 255, 0.8)', 'rgba(0, 0, 0, 0.75)'));
                content = content.replace(/\.content-card\s*li\s*\{[\s\S]*?color:\s*rgba\(255,\s*255,\s*255,\s*0\.75\);/g, match => match.replace('rgba(255, 255, 255, 0.75)', 'rgba(0, 0, 0, 0.75)'));
                content = content.replace(/\.content-card\s*ul\s*li\s*\{[\s\S]*?color:\s*rgba\(255,\s*255,\s*255,\s*0\.8\);/g, match => match.replace('rgba(255, 255, 255, 0.8)', 'rgba(0, 0, 0, 0.75)'));
                content = content.replace(/\.content-card\s*strong\s*\{[\s\S]*?color:\s*#fff;/g, match => match.replace('#fff', '#1a2332'));

                content = content.replace(/\.outcome-box\s*\{[\s\S]*?background:\s*rgba\(8,\s*145,\s*178,\s*0\.08\);/g, match => match.replace('rgba(8, 145, 178, 0.08)', '#ffffff'));
                content = content.replace(/\.outcome-box\s*\{[\s\S]*?border:\s*1px\s*solid\s*rgba\(8,\s*145,\s*178,\s*0\.2\);/g, match => match.replace('rgba(8, 145, 178, 0.2)', 'rgba(0, 0, 0, 0.08)'));
                content = content.replace(/\.outcome-box\s*h4\s*\{[\s\S]*?color:\s*#fff;/g, match => match.replace('#fff', '#1a2332'));

                // Some cards have .content-card ul li border
                content = content.replace(/\.content-card\s*ul\s*li\s*\{[\s\S]*?border-bottom:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.1\);/g, match => match.replace('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.08)'));

                fs.writeFileSync(filePath, content);
                console.log('Updated', filePath);
            }
        });
    }
});
