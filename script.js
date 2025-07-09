document.addEventListener('DOMContentLoaded', () => {
  function makeParticlesBG() {
    const canvas = document.getElementById('bg-anim');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth, height = window.innerHeight;
    let particles = [];

    function resize() {
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width; canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    const N = 32; 
    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 18 + Math.random() * 12, 
        dx: (Math.random() - 0.5) * 0.25, 
        dy: (Math.random() - 0.5) * 0.25, 
        o: 0.08 + Math.random() * 0.08 
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.fillStyle = isDark ? `rgba(90,209,230,${p.o})` : `rgba(52,152,219,${p.o})`;
        ctx.shadowColor = isDark ? "rgba(90,209,230,0.15)" : "rgba(52,152,219,0.10)";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0; 
      });
    }

    function update() {
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < -p.r) p.x = width + p.r;
        if (p.x > width + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = height + p.r;
        if (p.y > height + p.r) p.y = -p.r;
      });
    }

    function animate() {
      draw();
      update();
      requestAnimationFrame(animate);
    }
    animate();
  }
  makeParticlesBG();

  document.body.addEventListener('pointerdown', function(e) {
    const el = e.target.closest('.ripple');
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const rippleSpan = document.createElement('span'); 

    const size = Math.max(rect.width, rect.height) * 2;
    rippleSpan.style.width = rippleSpan.style.height = `${size}px`;
    rippleSpan.style.left = `${e.clientX - rect.left - size / 2}px`;
    rippleSpan.style.top = `${e.clientY - rect.top - size / 2}px`;

    rippleSpan.style.position = 'absolute';
    rippleSpan.style.borderRadius = '50%';
    rippleSpan.style.background = 'rgba(var(--color-primary-val, 52, 152, 219),0.14)'; 
    rippleSpan.style.pointerEvents = 'none';
    rippleSpan.style.opacity = '0.48';
    rippleSpan.style.zIndex = '1'; 
    rippleSpan.style.transform = 'scale(0)'; 
    rippleSpan.style.animation = 'ripple-anim .48s linear'; 

    el.appendChild(rippleSpan);
    rippleSpan.addEventListener('animationend', () => rippleSpan.remove());
  });

  const darkToggleBtn = document.getElementById('darkToggle');
  const darkIcon = document.getElementById('darkIcon');

  if (darkToggleBtn && darkIcon) {
    darkToggleBtn.addEventListener('click', () => {
      const html = document.documentElement;
      const isDark = html.getAttribute('data-theme') === 'dark';
      html.setAttribute('data-theme', isDark ? 'light' : 'dark');
      darkIcon.textContent = isDark ? 'dark_mode' : 'light_mode';
      try {
        document.cookie = "theme=" + (isDark ? 'light' : 'dark') + "; path=/; max-age=31536000; SameSite=Lax";
      } catch (e) { console.warn("Cookie setting failed:", e); }
    });

    try {
      const themeMatch = document.cookie.match(/theme=(light|dark)/);
      if (themeMatch) {
        document.documentElement.setAttribute('data-theme', themeMatch[1]);
        darkIcon.textContent = themeMatch[1] === "dark" ? 'light_mode' : 'dark_mode';
      }
    } catch (e) { console.warn("Cookie reading failed:", e); }
  }


  const themes = {
    blue:   {primary:'#3498db', accent:'#2ecc71', bg:'#f4f7f6', text:'#232946', primaryVal: '52, 152, 219', accentVal: '46, 204, 113'},
    green:  {primary:'#16a085', accent:'#27ae60', bg:'#f3fff6', text:'#212a22', primaryVal: '22, 160, 133', accentVal: '39, 174, 96'},
    orange: {primary:'#f2994a', accent:'#eb5757', bg:'#fff5e6', text:'#392c22', primaryVal: '242, 153, 74', accentVal: '235, 87, 87'},
    purple: {primary:'#6c63ff', accent:'#ff6cb6', bg:'#f6f2ff', text:'#32294a', primaryVal: '108, 99, 255', accentVal: '255, 108, 182'},
    minimal:{primary:'#8f8f8f', accent:'#d7d7d7', bg:'#fafbfc', text:'#232946', primaryVal: '143, 143, 143', accentVal: '215, 215, 215'},
    dark:   {primary:'#5ad1e6', accent:'#5fffad', bg:'#232946', text:'#e3eaff', primaryVal: '90, 209, 230', accentVal: '95, 255, 173'}
  };

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const themeName = this.dataset.theme;
      const theme = themes[themeName] || themes.blue;
      const rootStyle = document.documentElement.style;

      rootStyle.setProperty('--primary', theme.primary);
      rootStyle.setProperty('--accent', theme.accent);
      rootStyle.setProperty('--color-primary-val', theme.primaryVal);
      rootStyle.setProperty('--color-accent-val', theme.accentVal);

      const mainTitle = document.querySelector('.main-title');
      if (mainTitle) mainTitle.style.color = theme.primary;

      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      if (themeName === 'dark') { 
          document.documentElement.setAttribute('data-theme', 'dark');
          if(darkIcon) darkIcon.textContent = 'light_mode';
          document.body.style.background = `linear-gradient(120deg, ${themes.dark.bg} 0%, ${themes.dark.bg} 100%)`;
      } else {
          if (isDarkMode && themeName !== 'dark') {
             document.body.style.background = `linear-gradient(120deg, ${themes.dark.bg} 0%, ${themes.dark.bg} 100%)`;
          } else {
             document.body.style.background = `linear-gradient(120deg, ${theme.bg} 0%, #e3e9f0 100%)`;
          }
      }
      
      const profilePicPreview = document.getElementById('profilePicPreview');
      if(profilePicPreview) profilePicPreview.style.borderColor = theme.primary;
      
      document.querySelectorAll('.preview-section h2, .preview-section h4, .preview-section #previewProfession, .preview-section a').forEach(el => {
        if(el.id === 'previewProfession' || el.tagName === 'A' || el.tagName === 'H4') {
            el.style.color = theme.primary;
        }
      });


      try {
        document.cookie = "cvtheme=" + themeName + "; path=/; max-age=31536000; SameSite=Lax";
      } catch (e) { console.warn("Cookie setting failed:", e); }
    });
  });

  const randThemeBtn = document.getElementById('randThemeBtn');
  if (randThemeBtn) {
    randThemeBtn.addEventListener('click', function() {
      let keys = Object.keys(themes);
      let pick = keys[Math.floor(Math.random() * keys.length)];
      const themeButtonToClick = document.querySelector(`.theme-btn[data-theme="${pick}"]`);
      if (themeButtonToClick) themeButtonToClick.click();
    });
  }

  try {
    const cvThemeMatch = document.cookie.match(/cvtheme=([a-zA-Z]+)/);
    if (cvThemeMatch && themes[cvThemeMatch[1]]) {
      const themeButtonToClick = document.querySelector(`.theme-btn[data-theme="${cvThemeMatch[1]}"]`);
      if (themeButtonToClick) themeButtonToClick.click();
    } else {
        const blueThemeButton = document.querySelector('.theme-btn[data-theme="blue"]');
        if (blueThemeButton) blueThemeButton.click();
    }
  } catch (e) { console.warn("Cookie reading failed:", e); }


  const stepLabels = [
    "Personal Information",
    "Education, Skills & Experience",
    "Finalize & Download"
  ];
  function setProgress(step) {
    const fill = document.getElementById('progressBarFill');
    const stepLabelEl = document.getElementById('stepLabel');
    if (!fill || !stepLabelEl) return;

    const pct = Math.max(0, Math.min((step - 1) / (stepLabels.length -1), 1)); 
    fill.style.width = `${pct * 100}%`;
    stepLabelEl.textContent = stepLabels[step - 1] || "";
  }

  const steps = Array.from(document.querySelectorAll('.step-container'));
  let currentStep = 1;

  function showStep(n, focusFirst = false) {
    if (n < 1 || n > steps.length) return; 

    steps.forEach((s, i) => {
      const isActive = (i === n - 1);
      s.classList.toggle('active', isActive);
      s.classList.toggle('hidden', !isActive); 
      s.setAttribute('aria-hidden', !isActive); 

      if (isActive && focusFirst) {
        setTimeout(() => {
          const firstInput = s.querySelector("input:not([type='hidden']), textarea, button, select");
          if (firstInput) firstInput.focus();
        }, 50); 
      }
    });
    setProgress(n);
    currentStep = n;
  }

  document.querySelectorAll('.next').forEach(btn => {
    btn.addEventListener('click', () => {
      const parentStepContainer = btn.closest('.step-container');
      if (!parentStepContainer) return;
      const stepIdx = steps.indexOf(parentStepContainer);
      
      let allValid = true;
      parentStepContainer.querySelectorAll('input[required], textarea[required]').forEach(input => {
        if (!input.value.trim()) {
          input.reportValidity(); 
          allValid = false;
        }
      });

      if (allValid && stepIdx < steps.length - 1) {
        showStep(stepIdx + 2, true); 
      }
    });
  });

  document.querySelectorAll('.back').forEach(btn => {
    btn.addEventListener('click', () => {
      const parentStepContainer = btn.closest('.step-container');
      if (!parentStepContainer) return;
      const stepIdx = steps.indexOf(parentStepContainer);
      if (stepIdx > 0) {
        showStep(stepIdx, true); 
      }
    });
  });

  const cvForm = document.getElementById('cvForm');
  if (cvForm) {
    cvForm.addEventListener('keydown', function(e) {
      const activeStepContainer = steps[currentStep - 1];
      if (!activeStepContainer) return;

      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        if (document.activeElement && document.activeElement.tagName === "TEXTAREA") return; 
        const nextBtn = activeStepContainer.querySelector('.next');
        if (nextBtn) {
          nextBtn.click();
          e.preventDefault();
        } else if (currentStep === steps.length) { 
            const submitBtn = activeStepContainer.querySelector('button[type="submit"]');
            if(submitBtn) submitBtn.click();
            e.preventDefault();
        }
      }
      if (e.key === 'Escape') {
        if (currentStep > 1) {
          const backBtn = activeStepContainer.querySelector('.back');
          if(backBtn) backBtn.click();
          e.preventDefault();
        }
      }
      if (e.ctrlKey && (e.key === 'ArrowRight' || e.key === 'Tab' && !e.shiftKey)) {
        if (currentStep < steps.length) {
          const nextBtn = activeStepContainer.querySelector('.next');
          if(nextBtn) nextBtn.click();
          e.preventDefault();
        }
      }
      if (e.ctrlKey && (e.key === 'ArrowLeft' || e.key === 'Tab' && e.shiftKey)) {
        if (currentStep > 1) {
          const backBtn = activeStepContainer.querySelector('.back');
          if(backBtn) backBtn.click();
          e.preventDefault();
        }
      }
    });
  }

  function getInput(id) { return document.getElementById(id); }

  function updatePreview() {
    const setText = (elementId, value, placeholder = '—') => {
      const el = getInput(elementId);
      if (el) el.textContent = value || placeholder;
    };
    const setHtml = (elementId, value, placeholder = '—') => {
      const el = getInput(elementId);
      if (el) el.innerHTML = value ? value.replace(/\n/g, '<br>') : placeholder;
    };

    setText('previewName', getInput('name')?.value);
    setText('previewProfession', getInput('profession')?.value);
    setText('previewSummary', getInput('summary')?.value);
    setText('previewEmail', getInput('email')?.value);
    setText('previewPhone', getInput('phone')?.value);

    setHtml('previewEducation', getInput('education')?.value);
    setHtml('previewExperience', getInput('experience')?.value);

    const updateListPreview = (inputId, previewContainerId, tagClassBase) => {
      const items = (getInput(inputId)?.value || '').split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      const container = getInput(previewContainerId);
      if (!container) return;
      container.innerHTML = '';

      if (items.length === 0) {
        container.textContent = '—';
      } else {
        items.forEach(itemText => {
          let span = document.createElement('span');
          span.className = `${tagClassBase} px-2 py-1 rounded mb-1 text-xs`; 
          span.textContent = itemText;
          container.appendChild(span);
        });
      }
    };

    updateListPreview('skills', 'previewSkills', 'bg-primary/10 dark:bg-blue-900/40');
    updateListPreview('languages', 'previewLanguages', 'bg-accent/10 dark:bg-green-900/30');
    updateListPreview('certifications', 'previewCertifications', 'bg-orange-200 dark:bg-orange-600/40'); 
    updateListPreview('interests', 'previewInterests', 'bg-purple-200 dark:bg-purple-600/40'); 

    const setupLink = (linkId, inputId) => {
      const linkEl = getInput(linkId);
      const inputVal = getInput(inputId)?.value;
      if (linkEl) {
        linkEl.href = inputVal || '#';
        linkEl.style.display = inputVal ? 'inline-flex' : 'none';
      }
    };
    setupLink('previewGithub', 'github');
    setupLink('previewLinkedin', 'linkedin');
    setupLink('previewWebsite', 'website');
  }

  [
    'name', 'profession', 'summary', 'email', 'phone', 'education',
    'skills', 'experience', 'languages', 'certifications', 'interests',
    'github', 'linkedin', 'website'
  ].forEach(id => {
    const inputElement = getInput(id);
    if (inputElement) inputElement.addEventListener('input', updatePreview);
  });
  updatePreview();
  const profilePicInput = getInput('profilePic');
  if (profilePicInput) {
    profilePicInput.addEventListener('change', function(event) {
      const file = event.target.files[0];
      const imgPreview = getInput('previewPic');
      const placeholder = getInput('previewPicPlaceholder');
      if (!imgPreview || !placeholder) return;

      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          imgPreview.src = e.target.result;
          imgPreview.classList.remove('hidden');
          placeholder.classList.add('hidden');
        };
        reader.onerror = function() { 
          imgPreview.src = '#';
          imgPreview.classList.add('hidden');
          placeholder.classList.remove('hidden');
          console.error("File reader error.");
        };
        reader.readAsDataURL(file);
      } else {
        imgPreview.src = '#'; 
        imgPreview.classList.add('hidden');
        placeholder.classList.remove('hidden');
        if (file) console.warn("Invalid file type for profile picture.");
      }
    });
  }

  const SUGGESTIONS = {
    skills: [
      "JavaScript", "React", "Node.js", "TypeScript", "Python", "Java", "C#", "Ruby", "Go", "Swift",
      "HTML5", "CSS3", "SASS/LESS", "Tailwind CSS", "Bootstrap", "jQuery",
      "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js",
      "Express.js", "Django", "Flask", "Spring Boot", "Ruby on Rails", ".NET Core",
      "REST APIs", "GraphQL", "gRPC",
      "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Firebase",
      "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud Platform (GCP)", "Serverless",
      "Git", "CI/CD", "Jenkins", "GitHub Actions",
      "Agile", "Scrum", "Kanban", "JIRA",
      "UI/UX Design", "Figma", "Adobe XD", "Sketch", "Responsive Design", "Accessibility (A11Y)",
      "Problem Solving", "Team Leadership", "Communication", "Project Management", "Data Analysis", "Machine Learning"
    ],
    interests: [
      "Open Source Contributions", "Tech Meetups", "Hackathons", "Blogging (Technical)", "Side Projects",
      "Hiking", "Photography", "Music Production", "Playing an Instrument", "Creative Writing",
      "Travel", "Gaming (Strategy, Indie)", "Reading (Sci-Fi, Fantasy, Non-fiction)", "Volunteering",
      "Data Science", "Artificial Intelligence", "Cybersecurity", "Blockchain", "IoT",
      "Chess", "Cooking & Baking", "Gardening", "Fitness & Sports (Running, Cycling, Yoga)", "Astronomy"
    ],
    languages: [
      "English (Native)", "English (Fluent)", "English (Conversational)",
      "Spanish (Native)", "Spanish (Fluent)", "Spanish (Conversational)",
      "French (Native)", "French (Fluent)", "French (Conversational)",
      "German (Native)", "German (Fluent)", "German (Conversational)",
      "Mandarin Chinese (Native)", "Mandarin Chinese (Fluent)", "Mandarin Chinese (Conversational)",
      "Japanese (Native)", "Japanese (Fluent)", "Japanese (Conversational)",
      "Hindi (Native)", "Hindi (Fluent)", "Hindi (Conversational)"
    ]
  };

  document.querySelectorAll('.suggest-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const fieldName = this.dataset.field;
      if (!fieldName || !SUGGESTIONS[fieldName]) return;

      const inputElement = getInput(fieldName);
      if (!inputElement) return;

      let currentValues = inputElement.value.split(/[\n,]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
      let suggestionsToAdd = SUGGESTIONS[fieldName]
        .filter(suggestion => !currentValues.includes(suggestion.toLowerCase())) 
        .slice(0, 3); 

      if (suggestionsToAdd.length > 0) {
        const currentText = inputElement.value.trim();
        const newText = suggestionsToAdd.join(', ');
        inputElement.value = currentText ? `${currentText}, ${newText}` : newText;
        updatePreview(); 
        inputElement.focus(); 
      }
    });
  });

  const fontCycleBtn = document.getElementById('fontCycleBtn');
  if (fontCycleBtn) {
    const fontCycle = ['sans', 'serif', 'mono'];
    let fontCycleIdx = 0;
    fontCycleBtn.addEventListener('click', function() {
      fontCycleIdx = (fontCycleIdx + 1) % fontCycle.length;
      const previewSection = document.querySelector('.preview-section');
      if (previewSection) previewSection.setAttribute('data-font', fontCycle[fontCycleIdx]);
    });
  }

  const tips = [
    "💡 Quickly switch color themes using the buttons above!",
    "💡 Use keyboard: Enter for next, Esc for back.",
    "💡 Ctrl+Tab (or Ctrl+Arrow keys) can also navigate steps.",
    "💡 Try changing the CV preview font with the 'Aa' button.",
    "💡 Drag the CV preview card around on desktop screens.",
    "💡 Click the ✨ button for a random color theme!",
    "💡 Save your progress to the cloud and load it later!",
    "💡 Download your CV as a PDF or an Image."
  ];
  function showToastTip() {
    const toast = document.getElementById('toastTip');
    if (!toast) return;
    const tip = tips[Math.floor(Math.random() * tips.length)];
    toast.innerHTML = tip;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4800);
  }
  setTimeout(showToastTip, 1500); 

  const scrollBtn = document.getElementById('scrollTopBtn');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 140) {
        scrollBtn.classList.add('show');
      } else {
        scrollBtn.classList.remove('show');
      }
    });
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  (function() {
    const card = document.getElementById('cvPreviewCard');
    const handle = document.getElementById('dragHandle');
    if (!card || !handle) return;

    let isDragging = false, offsetX = 0, offsetY = 0;

    function onMouseDown(e) {
      if (window.innerWidth < 900 || e.button !== 0) return; 
      isDragging = true;
      card.classList.add('dragging');
      handle.style.cursor = 'grabbing'; 
      
      const rect = card.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      card.style.position = 'fixed';
      card.style.left = `${rect.left}px`;
      card.style.top = `${rect.top}px`;
      card.style.right = "auto"; 
      card.style.bottom = "auto";
      card.style.zIndex = '99'; 
      card.style.transition = 'none'; 
      document.body.style.userSelect = 'none'; 
    }

    function onMouseMove(e) {
      if (!isDragging) return;
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;

      const margin = 10;
      x = Math.max(margin, Math.min(x, window.innerWidth - card.offsetWidth - margin));
      y = Math.max(margin, Math.min(y, window.innerHeight - card.offsetHeight - margin));

      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
    }

    function onMouseUp() {
      if (isDragging) {
        isDragging = false;
        card.classList.remove('dragging');
        handle.style.cursor = 'grab'; 
        document.body.style.userSelect = ''; 
      }
    }

    handle.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    handle.addEventListener('dblclick', function() {
        if(window.innerWidth < 900) return;
        card.style.position = ''; 
        card.style.left = '';
        card.style.top = '';
        card.style.right = '';
        card.style.bottom = '';
        card.style.zIndex = '';
    });
  })();

  if (cvForm) {
    cvForm.addEventListener('submit', function(e) {
      e.preventDefault();
      generatePdf();
    });
  }

  const downloadImgBtn = document.getElementById('downloadImg');
  if (downloadImgBtn) {
    downloadImgBtn.addEventListener('click', function() {
      const cvPreviewCard = document.getElementById('cvPreviewCard');
      if (!cvPreviewCard || typeof html2canvas === 'undefined') {
        alert("Image generation library (html2canvas) not loaded or preview card not found.");
        return;
      }
      html2canvas(cvPreviewCard, {
        backgroundColor: null, 
        scale: 2, 
        useCORS: true 
      }).then(canvas => {
        const link = document.createElement('a');
        const fileNameBase = (getInput('name')?.value || 'CV').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${fileNameBase}_preview.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch(err => {
        console.error("Error generating image:", err);
        alert("Sorry, there was an error generating the image.");
      });
    });
  }

  function generatePdf() {
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
      alert("PDF library (jsPDF) not loaded.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    let margin = 15, y = margin, lineH = 7, pageW = doc.internal.pageSize.getWidth(), pageH = doc.internal.pageSize.getHeight();
    const contentWidth = pageW - 2 * margin;

    function addText(text, options, isMultiLine = false) {
        if (y + lineH > pageH - margin) { 
            doc.addPage();
            y = margin;
        }
        if (isMultiLine) {
            const splitText = doc.splitTextToSize(text, contentWidth - (options.xOffset || 0));
            doc.text(splitText, margin + (options.xOffset || 0), y, options);
            y += (splitText.length * (options.lineHeightFactor || 0.8) * lineH) ;
        } else {
            doc.text(text, margin + (options.xOffset || 0), y, options);
            y += lineH;
        }
    }
    
    const currentTheme = themes[document.cookie.match(/cvtheme=([a-zA-Z]+)/)?.[1] || 'blue'] || themes.blue;
    const primaryColor = currentTheme.primary;

    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(primaryColor);
    addText(getInput('name')?.value || "Your Name", {});

    doc.setFont("helvetica", "italic"); doc.setFontSize(12); doc.setTextColor("#333333");
    addText(getInput('profession')?.value || "Your Profession", {lineHeightFactor: 1});
    y += lineH * 0.5; 

    const img = getInput('previewPic');
    if (img && img.src && img.src.startsWith('data:image') && !img.classList.contains('hidden')) {
        try {
            const imgData = img.src;
            const imgSize = 30; 
            const imgX = pageW - margin - imgSize;
            const imgY = margin; 
            
            if (imgY + imgSize > pageH - margin && y > margin + imgSize) { 
            }
            doc.addImage(imgData, 'JPEG', imgX, imgY, imgSize, imgSize);
        } catch (err) { console.error("Error adding image to PDF:", err); }
    }


    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor("#555555");
    addText(getInput('summary')?.value || "A brief summary about yourself.", {maxWidth: contentWidth}, true);
    y += lineH * 0.5;

    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor("#444444");
    let contactInfo = [];
    if (getInput('email')?.value) contactInfo.push(`Email: ${getInput('email').value}`);
    if (getInput('phone')?.value) contactInfo.push(`Phone: ${getInput('phone').value}`);
    if (getInput('website')?.value) contactInfo.push(`Website: ${getInput('website').value}`);
    if (getInput('linkedin')?.value) contactInfo.push(`LinkedIn: ${getInput('linkedin').value}`);
    if (getInput('github')?.value) contactInfo.push(`GitHub: ${getInput('github').value}`);
    contactInfo.forEach(info => addText(info, {lineHeightFactor: 0.8}));
    y += lineH * 0.5;

    function addSection(title, content, isList = false) {
        if (!content && !isList) return; 
        let items = [];
        if (isList) {
            items = content.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
            if (items.length === 0) return; 
        }

        if (y + lineH * 2 > pageH - margin) { doc.addPage(); y = margin; } 
        doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(primaryColor);
        addText(title, {});
        doc.setDrawColor(primaryColor); doc.setLineWidth(0.3);
        doc.line(margin, y - lineH * 0.6, margin + 30, y - lineH * 0.6); 
        y += lineH * 0.3;

        doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor("#333333");
        if (isList) {
            items.forEach(item => addText(`• ${item}`, {maxWidth: contentWidth - 5, xOffset: 3, lineHeightFactor: 0.9}, true));
        } else {
            addText(content.replace(/\n/g, '\n  '), {maxWidth: contentWidth, lineHeightFactor: 0.9}, true); 
        }
        y += lineH * 0.5; 
    }

    addSection("Education", getInput('education')?.value.replace(/\n/g, '\n\n') || "", false); 
    addSection("Experience", getInput('experience')?.value.replace(/\n/g, '\n\n') || "", false);
    addSection("Skills", getInput('skills')?.value || "", true);
    addSection("Languages", getInput('languages')?.value || "", true);
    addSection("Certifications", getInput('certifications')?.value || "", true);
    addSection("Interests", getInput('interests')?.value || "", true);

    const fileNameBase = (getInput('name')?.value || 'CV').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${fileNameBase}_cv.pdf`);
  }

  if (typeof showStep === "function") {
    showStep(1, true); 
  }
});