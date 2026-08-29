const fs = require('fs');
const path = require('path');

class SimplePDF {
    constructor() {
        this.pages = [];
        this.currentPage = null;
        this.pageWidth = 595.28;  // A4 size in points
        this.pageHeight = 841.89; // A4 height
        this.margin = 45;
        this.contentWidth = this.pageWidth - (this.margin * 2);
    }

    addPage() {
        this.currentPage = {
            commands: [],
            y: this.pageHeight - this.margin
        };
        this.pages.push(this.currentPage);
        return this.currentPage;
    }

    ensureSpace(neededHeight) {
        if (!this.currentPage || this.currentPage.y - neededHeight < this.margin + 30) {
            this.addPage();
            // Header bar on new page
            this.drawHeaderBar();
        }
    }

    drawHeaderBar() {
        if (this.pages.length > 1) {
            this.drawRect(this.margin, this.pageHeight - 35, this.contentWidth, 1, [0.8, 0.85, 0.9]);
            this.drawText("Aadithya's Portfolio — Technical Architecture & Code Explanation", this.margin, this.pageHeight - 28, {
                fontSize: 8,
                font: 'Helvetica',
                color: [0.4, 0.45, 0.55]
            });
        }
    }

    drawRect(x, y, w, h, color, fill = true) {
        const [r, g, b] = color;
        this.currentPage.commands.push(
            `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} ${fill ? 'rg' : 'RG'}`,
            `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${fill ? 'f' : 'S'}`
        );
    }

    drawText(text, x, y, options = {}) {
        const fontSize = options.fontSize || 10;
        const font = options.font || 'Helvetica';
        const [r, g, b] = options.color || [0.1, 0.1, 0.15];
        
        // Escape special PDF characters
        const safeText = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

        this.currentPage.commands.push(
            'BT',
            `/${font} ${fontSize} Tf`,
            `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`,
            `1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`,
            `(${safeText}) Tj`,
            'ET'
        );
    }

    addTitle(title, subtitle) {
        this.ensureSpace(80);
        // Gradient-like banner box
        this.drawRect(this.margin, this.currentPage.y - 70, this.contentWidth, 70, [0.06, 0.09, 0.16]);
        this.drawRect(this.margin, this.currentPage.y - 70, 4, 70, [0.23, 0.51, 0.96]); // Accent stripe

        this.drawText(title, this.margin + 18, this.currentPage.y - 30, {
            fontSize: 18,
            font: 'Helvetica-Bold',
            color: [0.97, 0.98, 1.0]
        });

        if (subtitle) {
            this.drawText(subtitle, this.margin + 18, this.currentPage.y - 52, {
                fontSize: 10,
                font: 'Helvetica',
                color: [0.58, 0.64, 0.72]
            });
        }

        this.currentPage.y -= 85;
    }

    addHeading1(text) {
        this.ensureSpace(40);
        this.currentPage.y -= 10;
        this.drawRect(this.margin, this.currentPage.y - 4, this.contentWidth, 22, [0.93, 0.95, 0.98]);
        this.drawRect(this.margin, this.currentPage.y - 4, 3, 22, [0.23, 0.51, 0.96]);
        this.drawText(text, this.margin + 10, this.currentPage.y + 2, {
            fontSize: 13,
            font: 'Helvetica-Bold',
            color: [0.08, 0.15, 0.3]
        });
        this.currentPage.y -= 26;
    }

    addHeading2(text) {
        this.ensureSpace(30);
        this.currentPage.y -= 6;
        this.drawText(text, this.margin, this.currentPage.y, {
            fontSize: 11,
            font: 'Helvetica-Bold',
            color: [0.45, 0.22, 0.78]
        });
        this.currentPage.y -= 16;
    }

    addParagraph(text) {
        const words = text.split(' ');
        let currentLine = '';
        const maxCharsPerLine = 92;

        for (const word of words) {
            if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                this.ensureSpace(14);
                this.drawText(currentLine, this.margin, this.currentPage.y, {
                    fontSize: 9.5,
                    font: 'Helvetica',
                    color: [0.18, 0.22, 0.28]
                });
                this.currentPage.y -= 13;
                currentLine = word;
            }
        }

        if (currentLine) {
            this.ensureSpace(14);
            this.drawText(currentLine, this.margin, this.currentPage.y, {
                fontSize: 9.5,
                font: 'Helvetica',
                color: [0.18, 0.22, 0.28]
            });
            this.currentPage.y -= 13;
        }

        this.currentPage.y -= 4; // Extra spacing after paragraph
    }

    addBullet(title, description) {
        const text = title ? `${title}: ${description}` : description;
        const words = text.split(' ');
        let currentLine = '';
        const maxCharsPerLine = 86;
        let isFirstLine = true;

        for (const word of words) {
            if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                this.ensureSpace(13);
                if (isFirstLine) {
                    this.drawText('•', this.margin + 6, this.currentPage.y, {
                        fontSize: 10,
                        font: 'Helvetica-Bold',
                        color: [0.23, 0.51, 0.96]
                    });
                    this.drawText(currentLine, this.margin + 18, this.currentPage.y, {
                        fontSize: 9,
                        font: 'Helvetica',
                        color: [0.2, 0.24, 0.3]
                    });
                    isFirstLine = false;
                } else {
                    this.drawText(currentLine, this.margin + 18, this.currentPage.y, {
                        fontSize: 9,
                        font: 'Helvetica',
                        color: [0.2, 0.24, 0.3]
                    });
                }
                this.currentPage.y -= 12;
                currentLine = word;
            }
        }

        if (currentLine) {
            this.ensureSpace(13);
            if (isFirstLine) {
                this.drawText('•', this.margin + 6, this.currentPage.y, {
                    fontSize: 10,
                    font: 'Helvetica-Bold',
                    color: [0.23, 0.51, 0.96]
                });
            }
            this.drawText(currentLine, this.margin + 18, this.currentPage.y, {
                fontSize: 9,
                font: 'Helvetica',
                color: [0.2, 0.24, 0.3]
            });
            this.currentPage.y -= 12;
        }
        this.currentPage.y -= 2;
    }

    addCodeBlock(codeLines, label) {
        const height = (codeLines.length * 11) + 20;
        this.ensureSpace(height + 10);

        // Code container background
        this.drawRect(this.margin, this.currentPage.y - height, this.contentWidth, height, [0.08, 0.11, 0.18]);
        
        if (label) {
            this.drawText(label, this.margin + 10, this.currentPage.y - 12, {
                fontSize: 8,
                font: 'Helvetica-Bold',
                color: [0.4, 0.75, 0.98]
            });
        }

        let lineY = this.currentPage.y - (label ? 24 : 14);
        for (const line of codeLines) {
            this.drawText(line, this.margin + 12, lineY, {
                fontSize: 7.8,
                font: 'Courier',
                color: [0.85, 0.9, 0.95]
            });
            lineY -= 11;
        }

        this.currentPage.y -= (height + 8);
    }

    addCallout(title, text) {
        const words = text.split(' ');
        let currentLine = '';
        const lines = [];
        for (const word of words) {
            if ((currentLine + ' ' + word).length <= 80) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        if (currentLine) lines.push(currentLine);

        const height = (lines.length * 12) + 24;
        this.ensureSpace(height);

        // Callout box
        this.drawRect(this.margin, this.currentPage.y - height, this.contentWidth, height, [0.93, 0.98, 0.99]);
        this.drawRect(this.margin, this.currentPage.y - height, 3, height, [0.02, 0.71, 0.83]);

        this.drawText(title, this.margin + 12, this.currentPage.y - 14, {
            fontSize: 9.5,
            font: 'Helvetica-Bold',
            color: [0.05, 0.45, 0.55]
        });

        let lineY = this.currentPage.y - 27;
        for (const line of lines) {
            this.drawText(line, this.margin + 12, lineY, {
                fontSize: 8.5,
                font: 'Helvetica',
                color: [0.15, 0.25, 0.32]
            });
            lineY -= 12;
        }

        this.currentPage.y -= (height + 8);
    }

    generatePDF() {
        const objects = [];
        let objCount = 0;

        const addObj = (data) => {
            objCount++;
            objects.push({ id: objCount, data });
            return objCount;
        };

        // 1: Catalog
        const catalogId = addObj('<< /Type /Catalog /Pages 2 0 R >>');

        // 2: Pages (placeholder)
        const pagesId = addObj(''); // Will replace later

        // 3: Fonts
        const fontHelvId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
        const fontHelvBoldId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
        const fontCourierId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>');

        const pageIds = [];

        // Generate each page object and its content stream
        this.pages.forEach((page, index) => {
            // Footer with page number
            const footerText = `Page ${index + 1} of ${this.pages.length}`;
            page.commands.push(
                'BT',
                '/Helvetica 8 Tf',
                '0.5 0.55 0.65 rg',
                `1 0 0 1 ${this.pageWidth / 2 - 20} 25 Tm`,
                `(${footerText}) Tj`,
                'ET'
            );

            const streamContent = page.commands.join('\n');
            const streamLength = Buffer.byteLength(streamContent, 'utf-8');

            const contentStreamId = addObj(`<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`);

            const pageObjId = addObj(
                `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.pageWidth} ${this.pageHeight}] ` +
                `/Resources << /Font << /Helvetica ${fontHelvId} 0 R /Helvetica-Bold ${fontHelvBoldId} 0 R /Courier ${fontCourierId} 0 R >> >> ` +
                `/Contents ${contentStreamId} 0 R >>`
            );

            pageIds.push(pageObjId);
        });

        // Update Pages object (id: 2)
        objects[1].data = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

        // Assemble raw PDF file buffer
        let pdf = '%PDF-1.4\n';
        const xrefOffsets = [];

        objects.forEach(obj => {
            xrefOffsets.push(Buffer.byteLength(pdf, 'utf-8'));
            pdf += `${obj.id} 0 obj\n${obj.data}\nendobj\n`;
        });

        const xrefStart = Buffer.byteLength(pdf, 'utf-8');
        pdf += `xref\n0 ${objCount + 1}\n0000000000 65535 f \n`;
        xrefOffsets.forEach(offset => {
            pdf += offset.toString().padStart(10, '0') + ' 00000 n \n';
        });

        pdf += `trailer\n<< /Size ${objCount + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
        return Buffer.from(pdf, 'utf-8');
    }
}

// Build the complete portfolio documentation PDF
const pdf = new SimplePDF();
pdf.addPage();

pdf.addTitle(
    'Aadithya Sivasankar N R — Portfolio Documentation',
    'Comprehensive Technical Architecture, Languages, Frameworks & Robot Animation Deep-Dive'
);

pdf.addHeading1('1. Technology Stack & Languages Used');
pdf.addParagraph('This modern, responsive portfolio application is built with a zero-bloat, high-performance architecture using modern web standards and APIs:');

pdf.addBullet('HTML5 (HyperText Markup Language)', 'Semantic page structure, accessibility attributes, navigation landmarks, meta tags, and deep SVG embedding.');
pdf.addBullet('CSS3 (Cascading Style Sheets)', 'Vanilla CSS design system using Custom Properties (Variables), 3D perspective transforms, Flexbox/Grid layouts, Glassmorphism backdrop-filters, and keyframe animations.');
pdf.addBullet('JavaScript (Vanilla ES6+)', 'Pointer events listener, dynamic vector coordinate math, linear interpolation (Lerp) physics loop on requestAnimationFrame, and asynchronous fetch API.');
pdf.addBullet('Scalable Vector Graphics (SVG)', 'Fully customized, resolution-independent vector illustrations with gradient shaders, glow filters (feGaussianBlur), and clipping paths (clipPath).');
pdf.addBullet('Node.js Backend Server (server.js)', 'Lightweight built-in HTTP server providing MIME-type static file serving and port-collision auto recovery.');
pdf.addBullet('FormSubmit API (Cloud Forwarder)', 'Asynchronous REST endpoint handling contact form submissions and forwarding them directly to your Gmail without server backend overhead.');
pdf.addBullet('Font Awesome 6 & Google Fonts (Outfit)', 'Iconography suite for navigation/social links, combined with modern geometric typography.');

pdf.addHeading1('2. System Architecture & File Organization');
pdf.addParagraph('The codebase follows a modular separation of concerns between structure, visual presentation, and interactive mechanics:');

pdf.addBullet('index.html', 'Main document containing Navbar, Hero Section with Cyber Robot SVG, About (Education & Internships), Technical Skills, Projects, Contact Form, and Footer.');
pdf.addBullet('style.css', 'Design system tokens, color palettes, glassmorphism cards, responsive media queries (desktop, tablet, mobile), and 3D perspective canvas rules.');
pdf.addBullet('script.js', 'Core logic: Mobile hamburger menu toggle, navbar scroll effects, scroll-spy navigation, asynchronous contact form dispatcher, and robot mouse tracking controller.');
pdf.addBullet('server.js', 'Zero-dependency Node HTTP web server running on port 3000.');

pdf.addHeading1('3. Deep-Dive: How the Robot Cursor-Tracking Animation Works');
pdf.addParagraph('The interactive robot character in the Hero section uses a multi-tiered pipeline involving Vector SVG layering, CSS 3D perspectives, and Javascript vector trigonometry with Linear Interpolation (Lerp).');

pdf.addHeading2('Phase A: Layered SVG Construction (index.html)');
pdf.addParagraph('The robot is constructed in vector layers so that individual parts can be isolated and transformed independently in 2D and 3D space:');

pdf.addBullet('#char-head', 'The entire head group (purple hood, silver rim, cyan headphones with pulsing LED antenna, and visor). Rotates in 3D (pitch, yaw, roll).');
pdf.addBullet('#char-visor-group', 'Glossy dark shield helmet screen with specular glass reflection arc.');
pdf.addBullet('#char-eyes-container (clip-path)', 'Clipped strictly to the inside of the visor so the eyes never bleed outside the helmet screen boundary.');
pdf.addBullet('#char-eyes', 'Dual glowing cyan-white circular eyes with radial gradient shaders and feGaussianBlur glow filters.');

pdf.addHeading2('Phase B: 3D Canvas & Perspective Setup (style.css)');
pdf.addParagraph('In style.css, the parent container is given a 3D perspective to enable genuine depth:');

pdf.addCodeBlock([
    '.hero-visual {',
    '    perspective: 1200px;',
    '    transform-style: preserve-3d;',
    '}',
    '.char-head-group {',
    '    transform-origin: 205px 175px;',
    '    will-change: transform;',
    '    transition: transform 0.06s cubic-bezier(0.2, 0.8, 0.2, 1);',
    '}',
    '.char-eyes-group {',
    '    transform-origin: 205px 172px;',
    '    will-change: transform;',
    '}'
], 'CSS: 3D Perspective and Transform Origins');

pdf.addHeading2('Phase C: Mouse Vector Math & Normalized Offsets (script.js)');
pdf.addParagraph('When the user moves their mouse (or touches their mobile screen), script.js computes the relative vector from the character head center:');

pdf.addCodeBlock([
    'const rect = characterContainer.getBoundingClientRect();',
    'const charCenterX = rect.left + rect.width * 0.49;',
    'const charCenterY = rect.top + rect.height * 0.33;',
    '',
    'const deltaX = clientX - charCenterX;',
    'const deltaY = clientY - charCenterY;',
    '',
    '// Normalize between -1.0 and +1.0',
    'const normX = Math.max(-1, Math.min(1, deltaX / (window.innerWidth * 0.4)));',
    'const normY = Math.max(-1, Math.min(1, deltaY / (window.innerHeight * 0.4)));',
    '',
    'targetEyeX = normX * 24;  // Eye displacement in px',
    'targetEyeY = normY * 18;',
    'targetHeadRotY = normX * 18;  // Head Yaw in degrees',
    'targetHeadRotX = -normY * 14; // Head Pitch in degrees'
], 'JavaScript: Mouse Vector & Normalization Math');

pdf.addHeading2('Phase D: Smooth Physics via Linear Interpolation (Lerp)');
pdf.addParagraph('Rather than jumping instantly to the mouse position, script.js runs a 60 FPS requestAnimationFrame loop that smoothly glides (damps) towards the target position:');

pdf.addCodeBlock([
    'function animateCharacter() {',
    '    const lerpEye = 0.10;',
    '    const lerpHead = 0.08;',
    '',
    '    currentEyeX += (targetEyeX - currentEyeX) * lerpEye;',
    '    currentEyeY += (targetEyeY - currentEyeY) * lerpEye;',
    '    currentHeadRotY += (targetHeadRotY - currentHeadRotY) * lerpHead;',
    '    currentHeadRotX += (targetHeadRotX - currentHeadRotX) * lerpHead;',
    '',
    '    // Apply transforms directly to SVG elements',
    '    charEyes.style.transform = `translate(${currentEyeX.toFixed(2)}px, ${currentEyeY.toFixed(2)}px)`;',
    '    charHead.style.transform = `translate(${currentHeadTransX}px, ${currentHeadTransY}px) rotateY(${currentHeadRotY}deg) rotateX(${currentHeadRotX}deg)`;',
    '',
    '    requestAnimationFrame(animateCharacter);',
    '}'
], 'JavaScript: Lerp Animation Loop');

pdf.addHeading2('Phase E: Micro-Interactions & Easter Eggs');
pdf.addBullet('Periodic Blinking (triggerRandomBlink)', 'A randomized timer triggers every 3–6.5 seconds, temporarily scaling scaleY of the eyes to 0.08 for 160ms.');
pdf.addBullet('Rest Position Decay (mouseleave)', 'When the mouse leaves the browser window, targets smoothly return to zero, centering the character face.');
pdf.addBullet('Celebration Click Effect', 'Clicking the robot triggers a bounce keyframe animation (robotCheer) and a celebratory double-blink.');

pdf.addHeading1('4. Real-Time Gmail Dispatcher (Get In Touch Section)');
pdf.addParagraph('The contact form in index.html is linked to FormSubmit API with an AJAX listener in script.js:');
pdf.addBullet('Asynchronous Fetch', 'Submits JSON data containing sender name, email, subject, and message without triggering page reloads.');
pdf.addBullet('Visual Feedback', 'Changes button text from "Sending..." to "Message Sent! ✓" in emerald green upon successful delivery.');
pdf.addBullet('Fail-Safe Fallback', 'If the visitor is offline or a browser blocker interferes, it automatically redirects to the user default email client (mailto:).');

pdf.addCallout(
    'Key Project Highlights',
    'This portfolio combines crisp vector graphics, zero-dependency Node serving, GPU-accelerated 3D transforms, real-time physics interpolation, and cloud-forwarded Gmail delivery to deliver an unforgettable user experience.'
);

// Save generated PDF to workspace
const pdfBuffer = pdf.generatePDF();
const outputPath = path.join(__dirname, 'portfolio_documentation.pdf');
fs.writeFileSync(outputPath, pdfBuffer);
console.log('PDF documentation successfully generated at:', outputPath);
