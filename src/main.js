// קובץ JavaScript ראשי עבור אפליקציית דבקסם
import './style.css';
import { EducationalHelpers, ProgressTracker } from './helpers.js';

// יצירת מעקב התקדמות גלובלי
const progressTracker = new ProgressTracker();

// קלאס לייצוג גולה (כדור)
class Sphere {
  constructor(x, y, radius = 8, color = '#4299e1', speed = 1) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.vx = (Math.random() - 0.5) * speed;
    this.vy = (Math.random() - 0.5) * speed;
    this.originalRadius = radius;
    this.isAttracted = true;
  }

  // עדכון מיקום הגולה
  update(canvasWidth, canvasHeight, spheres, temperature = 1) {
    // תנועה בהתאם לטמפרטורה
    this.vx += (Math.random() - 0.5) * 0.1 * temperature;
    this.vy += (Math.random() - 0.5) * 0.1 * temperature;

    // הגבלת מהירות מקסימלית
    const maxSpeed = 2 * temperature;
    if (Math.abs(this.vx) > maxSpeed) this.vx = Math.sign(this.vx) * maxSpeed;
    if (Math.abs(this.vy) > maxSpeed) this.vy = Math.sign(this.vy) * maxSpeed;

    // כוח משיכה בין גולות (דבקסם)
    if (this.isAttracted && spheres) {
      spheres.forEach(other => {
        if (other !== this) {
          const dx = other.x - this.x;
          const dy = other.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0 && distance < 100) {
            const force = 0.001 / (distance * distance);
            this.vx += dx * force;
            this.vy += dy * force;
          }
        }
      });
    }

    // עדכון מיקום
    this.x += this.vx;
    this.y += this.vy;

    // החזרה מקצוות המסך
    if (this.x < this.radius || this.x > canvasWidth - this.radius) {
      this.vx = -this.vx * 0.8; // איבוד אנרגיה
      this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
    }
    if (this.y < this.radius || this.y > canvasHeight - this.radius) {
      this.vy = -this.vy * 0.8;
      this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y));
    }
  }

  // ציור הגולה
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    
    // יצירת גרדיאנט למראה יותר יפה
    const gradient = ctx.createRadialGradient(
      this.x - this.radius/3, this.y - this.radius/3, 0,
      this.x, this.y, this.radius
    );
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, this.darkenColor(this.color, 0.3));
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // מסגרת
    ctx.strokeStyle = this.darkenColor(this.color, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // פונקציה להכהיית צבע
  darkenColor(color, amount) {
    const col = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (col >> 16) - amt;
    const G = (col >> 8 & 0x00FF) - amt;
    const B = (col & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
}

// מנהל הדפים
class PageManager {
  constructor() {
    this.currentPage = 'intro';
    this.initNavigation();
    this.initPages();
  }

  initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPage = btn.getAttribute('data-page');
        this.switchToPage(targetPage);
      });
    });
    
    // כפתור סטטיסטיקות
    const statsBtn = document.getElementById('show-stats');
    if (statsBtn) {
      statsBtn.addEventListener('click', () => {
        this.showStatsModal();
      });
    }
  }

  switchToPage(pageId) {
    // רישום אינטראקציה
    progressTracker.recordInteraction('page_switch', pageId);
    
    // הסתרת הדף הנוכחי
    const currentPageElement = document.getElementById(`${this.currentPage}-page`);
    if (currentPageElement) {
      currentPageElement.classList.remove('active');
    }

    // הצגת הדף החדש
    const newPageElement = document.getElementById(`${pageId}-page`);
    if (newPageElement) {
      newPageElement.classList.add('active');
    }

    // עדכון הכפתורים
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-page') === pageId) {
        btn.classList.add('active');
      }
    });

    this.currentPage = pageId;
    this.initCurrentPage();
    
    // הצגת טיפ לדף החדש
    setTimeout(() => {
      this.showPageTip(pageId);
    }, 500);
  }

  initPages() {
    this.initCurrentPage();
  }

  initCurrentPage() {
    switch (this.currentPage) {
      case 'intro':
        this.initIntroPage();
        break;
      case 'microscope':
        this.initMicroscopePage();
        break;
      case 'spheres':
        this.initSpheresPage();
        break;
      case 'temperature':
        this.initTemperaturePage();
        break;
      case 'states':
        this.initStatesPage();
        break;
      case 'quiz':
        this.initQuizPage();
        break;
    }
  }

  // הצגת מודל סטטיסטיקות
  showStatsModal() {
    const stats = progressTracker.getStats();
    
    const modal = document.createElement('div');
    modal.className = 'stats-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>🏆 הישגים ונתונים</h2>
          <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">${stats.interactions}</div>
            <div class="stat-label">אינטראקציות</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${stats.pagesVisited}</div>
            <div class="stat-label">דפים נצפו</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${stats.achievements}</div>
            <div class="stat-label">הישגים</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${stats.timeSpent}</div>
            <div class="stat-label">דקות מחקר</div>
          </div>
        </div>
        <div class="fun-rating">
          <h3>${stats.funRating}</h3>
          <p>המשיכו לחקור ולגלות את סודות הדבקסם!</p>
        </div>
        <div class="next-challenge">
          <h4>האתגר הבא:</h4>
          <p>${EducationalHelpers.generateChallenge(this.currentPage)}</p>
        </div>
      </div>
    `;
    
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
    
    // סגירה בלחיצה על הרקע
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // הצגת טיפים לדף
  showPageTip(pageId) {
    const tip = document.getElementById(`${pageId}-tip`);
    if (tip) {
      tip.style.display = 'block';
      tip.classList.add('show');
    }
  }

  // סגירת טיפ לדף
  closePageTip(pageId) {
    const tip = document.getElementById(`${pageId}-tip`);
    if (tip) {
      tip.classList.remove('show');
      tip.style.display = 'none';
    }
  }

  // עדכון כפתור פעיל
  updateActiveButton(activePageId) {
    // הסרת active מכל הכפתורים
    document.querySelectorAll('.nav-btn, .stats-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // הוספת active לכפתור הפעיל
    if (activePageId === 'stats') {
      document.getElementById('show-stats').classList.add('active');
    } else {
      const activeBtn = document.querySelector(`[data-page="${activePageId}"]`);
      if (activeBtn) {
        activeBtn.classList.add('active');
      }
    }
  }

  // דף ההקדמה - תפוח נופל
  initIntroPage() {
    const canvas = document.getElementById('intro-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let appleY = 50;
    let isAnimating = false;

    const drawScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // עץ
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(140, 150, 20, 50);
      
      // עלים
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(150, 140, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // תפוח
      ctx.fillStyle = '#DC143C';
      ctx.beginPath();
      ctx.arc(180, appleY, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // עלה קטן
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(185, appleY - 5, 3, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      if (isAnimating && appleY < 170) {
        appleY += 3;
        drawScene();
        requestAnimationFrame(animate);
      } else if (appleY >= 170) {
        setTimeout(() => {
          appleY = 50;
          isAnimating = false;
          drawScene();
        }, 1000);
      }
    };

    canvas.addEventListener('click', () => {
      if (!isAnimating) {
        progressTracker.recordInteraction('apple_click', 'intro');
        isAnimating = true;
        animate();
      }
    });

    drawScene();
  }

  // דף המיקרוסקופ
  initMicroscopePage() {
    const canvas = document.getElementById('microscope-canvas');
    const slider = document.getElementById('zoom-slider');
    const zoomLevel = document.getElementById('zoom-level');
    const zoomDescription = document.getElementById('zoom-description');
    
    if (!canvas || !slider) return;
    
    const ctx = canvas.getContext('2d');
    let spheres = [];
    let animationId;

    const zoomLevels = {
      1: { name: 'עין רגילה', description: 'רואים חפצים רגילים - אבן, מים, אוויר' },
      2: { name: 'מיקרוסקופ רגיל', description: 'רואים תאים ומבנים קטנים' },
      3: { name: 'מיקרוסקופ חזק', description: 'רואים מולקולות - צורונים מחוברים!' },
      4: { name: 'מיקרוסקופ על', description: 'רואים אטומים - גולות בודדות!' },
      5: { name: 'מיקרוסקופ קסמים', description: 'רואים את הדבקסם בפעולה!' }
    };

    const initSpheres = (level) => {
      spheres = [];
      const count = level === '5' ? 15 : level === '4' ? 8 : level === '3' ? 5 : 0;
      
      for (let i = 0; i < count; i++) {
        const x = Math.random() * (canvas.width - 40) + 20;
        const y = Math.random() * (canvas.height - 40) + 20;
        const radius = level === '5' ? 6 : level === '4' ? 10 : 15;
        const colors = ['#4299e1', '#e53e3e', '#38a169', '#d69e2e', '#9f7aea'];
        spheres.push(new Sphere(x, y, radius, colors[i % colors.length], 0.5));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (spheres.length > 0) {
        spheres.forEach(sphere => {
          sphere.update(canvas.width, canvas.height, spheres, 0.3);
          sphere.draw(ctx);
        });
      } else {
        // מצב עין רגילה
        ctx.fillStyle = '#4a5568';
        ctx.font = '24px Heebo';
        ctx.textAlign = 'center';
        ctx.fillText('🧊 💧 ☁️', canvas.width/2, canvas.height/2);
        ctx.font = '16px Heebo';
        ctx.fillText('רואים חפצים רגילים', canvas.width/2, canvas.height/2 + 30);
      }
      
      animationId = requestAnimationFrame(animate);
    };

    slider.addEventListener('input', (e) => {
      const level = e.target.value;
      const info = zoomLevels[level];
      zoomLevel.textContent = info.name;
      zoomDescription.textContent = info.description;
      initSpheres(level);
    });

    initSpheres('1');
    animate();
  }

  // דף הגולות
  initSpheresPage() {
    const canvas = document.getElementById('spheres-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let spheres = [];
    let attractionEnabled = true;
    let animationId;

    // יצירת גולות ראשוניות
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * (canvas.width - 40) + 20;
      const y = Math.random() * (canvas.height - 40) + 20;
      const colors = ['#4299e1', '#e53e3e', '#38a169', '#d69e2e', '#9f7aea'];
      spheres.push(new Sphere(x, y, 8, colors[i % colors.length], 1));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      spheres.forEach(sphere => {
        sphere.isAttracted = attractionEnabled;
        sphere.update(canvas.width, canvas.height, spheres, 0.5);
        sphere.draw(ctx);
      });
      
      // ציור קווי חיבור כשיש משיכה
      if (attractionEnabled) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < spheres.length; i++) {
          for (let j = i + 1; j < spheres.length; j++) {
            const dx = spheres[j].x - spheres[i].x;
            const dy = spheres[j].y - spheres[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 60) {
              ctx.beginPath();
              ctx.moveTo(spheres[i].x, spheres[i].y);
              ctx.lineTo(spheres[j].x, spheres[j].y);
              ctx.stroke();
            }
          }
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };

    // כפתורי בקרה
    document.getElementById('add-spheres')?.addEventListener('click', () => {
      for (let i = 0; i < 3; i++) {
        const x = Math.random() * (canvas.width - 40) + 20;
        const y = Math.random() * (canvas.height - 40) + 20;
        const colors = ['#4299e1', '#e53e3e', '#38a169', '#d69e2e', '#9f7aea'];
        spheres.push(new Sphere(x, y, 8, colors[spheres.length % colors.length], 1));
      }
    });

    document.getElementById('remove-spheres')?.addEventListener('click', () => {
      spheres.splice(0, Math.min(3, spheres.length));
    });

    document.getElementById('toggle-attraction')?.addEventListener('click', () => {
      attractionEnabled = !attractionEnabled;
    });

    animate();
  }

  // דף הטמפרטורה
  initTemperaturePage() {
    const canvas = document.getElementById('temperature-canvas');
    const slider = document.getElementById('temperature-slider');
    const display = document.getElementById('temperature-display');
    const mercury = document.getElementById('mercury');
    
    if (!canvas || !slider) return;
    
    const ctx = canvas.getContext('2d');
    let spheres = [];
    let temperature = 20;
    let animationId;

    // יצירת גולות לפי מצב
    const initSpheres = () => {
      spheres = [];
      if (temperature < 0) {
        // מוצק - ריבוע מושלם
        const rows = 4;
        const cols = 4;
        const spacing = 35;
        const startX = (canvas.width - (cols - 1) * spacing) / 2;
        const startY = (canvas.height - (rows - 1) * spacing) / 2;
        
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = startX + col * spacing;
            const y = startY + row * spacing;
            spheres.push(new Sphere(x, y, 8, '#4299e1', 0.1));
          }
        }
      } else if (temperature >= 0 && temperature <= 100) {
        // נוזל - כדורים צמודים שמתגלגלים
        for (let i = 0; i < 16; i++) {
          const x = Math.random() * (canvas.width - 60) + 30;
          const y = Math.random() * (canvas.height - 60) + 30;
          spheres.push(new Sphere(x, y, 7, '#38a169', 1));
        }
      } else {
        // גז - עפים לכל הכיוונים
        for (let i = 0; i < 12; i++) {
          const x = Math.random() * (canvas.width - 40) + 20;
          const y = Math.random() * (canvas.height - 40) + 20;
          spheres.push(new Sphere(x, y, 5, '#e53e3e', Math.max(3, temperature / 50)));
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (temperature < 0) {
        // מוצק - רק רעידות קטנות
        spheres.forEach((sphere, index) => {
          const originalX = sphere.originalX || sphere.x;
          const originalY = sphere.originalY || sphere.y;
          sphere.originalX = originalX;
          sphere.originalY = originalY;
          
          sphere.x = originalX + (Math.random() - 0.5) * 2;
          sphere.y = originalY + (Math.random() - 0.5) * 2;
          sphere.draw(ctx);
        });
      } else if (temperature >= 0 && temperature <= 100) {
        // נוזל - תנועה צמודה ומתגלגלת
        const liquidSpeed = temperature / 100;
        spheres.forEach((sphere, i) => {
          // כוח משיכה לכדורים קרובים
          let forceX = 0, forceY = 0;
          spheres.forEach((other, j) => {
            if (i !== j) {
              const dx = other.x - sphere.x;
              const dy = other.y - sphere.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < 25 && distance > 0) {
                forceX += dx / distance * 0.1;
                forceY += dy / distance * 0.1;
              }
            }
          });
          
          sphere.vx = (sphere.vx || 0) + forceX + (Math.random() - 0.5) * liquidSpeed;
          sphere.vy = (sphere.vy || 0) + forceY + (Math.random() - 0.5) * liquidSpeed;
          
          // הגבלת מהירות
          const maxSpeed = liquidSpeed * 2;
          const speed = Math.sqrt(sphere.vx * sphere.vx + sphere.vy * sphere.vy);
          if (speed > maxSpeed) {
            sphere.vx = (sphere.vx / speed) * maxSpeed;
            sphere.vy = (sphere.vy / speed) * maxSpeed;
          }
          
          sphere.x += sphere.vx;
          sphere.y += sphere.vy;
          
          // גבולות
          if (sphere.x < sphere.radius || sphere.x > canvas.width - sphere.radius) {
            sphere.vx *= -0.8;
            sphere.x = Math.max(sphere.radius, Math.min(canvas.width - sphere.radius, sphere.x));
          }
          if (sphere.y < sphere.radius || sphere.y > canvas.height - sphere.radius) {
            sphere.vy *= -0.8;
            sphere.y = Math.max(sphere.radius, Math.min(canvas.height - sphere.radius, sphere.y));
          }
          
          sphere.draw(ctx);
        });
      } else {
        // גז - תנועה חופשית ומהירה
        const gasSpeed = Math.min(10, temperature / 30);
        spheres.forEach(sphere => {
          sphere.vx = (sphere.vx || 0) + (Math.random() - 0.5) * gasSpeed;
          sphere.vy = (sphere.vy || 0) + (Math.random() - 0.5) * gasSpeed;
          
          sphere.x += sphere.vx;
          sphere.y += sphere.vy;
          
          // התנגשות עם קירות
          if (sphere.x < sphere.radius || sphere.x > canvas.width - sphere.radius) {
            sphere.vx *= -0.9;
            sphere.x = Math.max(sphere.radius, Math.min(canvas.width - sphere.radius, sphere.x));
          }
          if (sphere.y < sphere.radius || sphere.y > canvas.height - sphere.radius) {
            sphere.vy *= -0.9;
            sphere.y = Math.max(sphere.radius, Math.min(canvas.height - sphere.radius, sphere.y));
          }
          
          sphere.draw(ctx);
        });
      }
      
      // הצגת מידע על המצב
      ctx.fillStyle = '#4a5568';
      ctx.font = '16px Heebo';
      ctx.textAlign = 'center';
      
      let stateText = '';
      if (temperature < 0) {
        stateText = 'מוצק - הגולות קפואות במקום 🧊';
      } else if (temperature <= 100) {
        stateText = 'נוזל - הגולות מתגלגלות יחד 💧';
      } else {
        stateText = 'גז - הגולות עפות חופשיות ☁️';
      }
      
      ctx.fillText(stateText, canvas.width/2, 30);
      
      animationId = requestAnimationFrame(animate);
    };

    // עדכון טמפרטורה
    const updateTemperature = () => {
      temperature = parseInt(slider.value);
      display.textContent = `${temperature}°C`;
      
      // עדכון מדחום (סקאלה של -100 עד 200)
      const mercuryHeight = ((temperature + 100) / 300) * 100;
      mercury.style.height = `${Math.max(0, Math.min(100, mercuryHeight))}%`;
      
      // שינוי צבע המדחום לפי טמפרטורה
      if (temperature < 0) {
        mercury.style.background = 'linear-gradient(to top, #3182ce, #63b3ed)'; // כחול
      } else if (temperature <= 100) {
        mercury.style.background = 'linear-gradient(to top, #38a169, #68d391)'; // ירוק
      } else {
        mercury.style.background = 'linear-gradient(to top, #e53e3e, #fc8181)'; // אדום
      }
      
      initSpheres();
    };

    slider.addEventListener('input', updateTemperature);
    
    initSpheres();
    updateTemperature();
    animate();
  }

  // דף מצבי החומר
  initStatesPage() {
    const canvas = document.getElementById('states-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let spheres = [];
    let currentState = 'solid';
    let animationId;

    const states = {
      solid: { 
        speed: 0.1, 
        attraction: true, 
        description: 'במצב מוצק הגולות דבוקות חזק ורק מתנדנדות במקום',
        color: '#3182ce'
      },
      liquid: { 
        speed: 0.8, 
        attraction: true, 
        description: 'במצב נוזלי הגולות עדיין דבוקות אבל יכולות לזוז ולהתגלגל',
        color: '#4299e1'
      },
      gas: { 
        speed: 2, 
        attraction: false, 
        description: 'במצב גזי הגולות עפות חופשיות ולא דבוקות זו לזו',
        color: '#e2e8f0'
      }
    };

    // יצירת גולות
    const initSpheres = () => {
      spheres = [];
      const count = 16;
      const state = states[currentState];
      
      for (let i = 0; i < count; i++) {
        let x, y;
        if (currentState === 'solid') {
          // מערך מסודר לחומר מוצק
          x = 100 + (i % 4) * 30;
          y = 100 + Math.floor(i / 4) * 30;
        } else {
          x = Math.random() * (canvas.width - 40) + 20;
          y = Math.random() * (canvas.height - 40) + 20;
        }
        spheres.push(new Sphere(x, y, 8, state.color, state.speed));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const state = states[currentState];
      spheres.forEach(sphere => {
        sphere.isAttracted = state.attraction;
        sphere.update(canvas.width, canvas.height, state.attraction ? spheres : null, state.speed);
        sphere.draw(ctx);
      });
      
      animationId = requestAnimationFrame(animate);
    };

    // כפתורי מצבי החומר
    document.querySelectorAll('.state-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.state-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentState = btn.getAttribute('data-state');
        const stateInfo = document.getElementById('state-info');
        if (stateInfo) {
          stateInfo.textContent = states[currentState].description;
        }
        
        initSpheres();
      });
    });

    initSpheres();
    animate();
  }

  initQuizPage() {
    // איתחול דף החידות
    initQuiz();
  }
}

// איקון SVG לכדור
const sphereIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="14" fill="#4299e1" stroke="#2b6cb0" stroke-width="2"/>
  <circle cx="12" cy="12" r="3" fill="#90cdf4" opacity="0.7"/>
</svg>
`;

// יצירת קובץ SVG
const blob = new Blob([sphereIcon], { type: 'image/svg+xml' });
const url = URL.createObjectURL(blob);

// הפעלת האפליקציה
document.addEventListener('DOMContentLoaded', () => {
  new PageManager();
});

console.log('🔬 דבקסם - מסע במיקרוסקופ הקסמים נטען בהצלחה!');

// פונקציות למודל הסטטיסטיקות
window.showStatsModal = function() {
  const modal = document.getElementById('statsModal');
  modal.classList.remove('hidden');
  
  // עדכון הנתונים במודל
  updateStatsDisplay();
};

window.closeStatsModal = function() {
  const modal = document.getElementById('statsModal');
  modal.classList.add('hidden');
};

window.closeTipModal = function() {
  const modal = document.getElementById('tipModal');
  modal.classList.add('hidden');
};

function updateStatsDisplay() {
  const stats = getUserStats();
  
  // עדכון מספרים
  document.getElementById('timeSpent').textContent = Math.round(stats.timeSpent / 60);
  document.getElementById('pagesVisited').textContent = stats.pagesVisited;
  document.getElementById('clicksCount').textContent = stats.clicksCount;
  document.getElementById('achievementsCount').textContent = stats.achievements.length;
  
  // עדכון דירוג כיף
  const funRating = document.getElementById('funRating');
  const rating = calculateFunRating(stats);
  funRating.textContent = rating;
  
  // עדכון אתגר הבא
  const nextChallenge = document.getElementById('nextChallenge');
  const challenge = getNextChallenge(stats);
  nextChallenge.textContent = challenge;
}

function calculateFunRating(stats) {
  const totalAchievements = stats.achievements.length;
  const totalPages = stats.pagesVisited;
  
  if (totalAchievements >= 10) {
    return "מדען גדול! 👨‍🔬 גילית את כל סודות הדבקסם!";
  } else if (totalAchievements >= 7) {
    return "חוקר מומחה! 🌟 אתה כמעט מבין הכל!";
  } else if (totalAchievements >= 5) {
    return "חוקר מתקדם! 🔍 המשך לגלות עוד!";
  } else if (totalAchievements >= 3) {
    return "חוקר מבטיח! 🎯 אתה על הדרך הנכונה!";
  } else if (totalPages >= 3) {
    return "חוקר סקרן! 🤔 אוהב לחקור דברים חדשים!";
  } else {
    return "חוקר מתחיל! 🌱 רק התחלת את המסע!";
  }
}

function getNextChallenge(stats) {
  const unvisitedPages = ['intro', 'microscope', 'spheres', 'temperature', 'states']
    .filter(page => !stats.visitedPages.includes(page));
  
  if (unvisitedPages.length > 0) {
    const pageNames = {
      'intro': 'הכוח הנעלם',
      'microscope': 'המיקרוסקופ הקסום',
      'spheres': 'עולם הגולות',
      'temperature': 'ריקוד הגולות',
      'states': 'קסמי החומר'
    };
    return `חקור את דף "${pageNames[unvisitedPages[0]]}" לגלות עוד סודות!`;
  }
  
  if (stats.achievements.length < 5) {
    return "נסה ללחוץ על דברים שונים בכל דף לגלות עוד סודות!";
  }
  
  if (stats.clicksCount < 50) {
    return "המשך לחקור ולנסות דברים חדשים - יש עוד הרבה לגלות!";
  }
  
  return "מדהים! אתה חוקר אמיתי! נסה ללמד חברים על הדבקסם!";
}

// פונקציה להצגת הישג חדש
function showAchievement(title, description) {
  // יצירת אלמנט הישג זמני
  const achievement = document.createElement('div');
  achievement.className = 'achievement-popup';
  achievement.innerHTML = `
    <div class="achievement-content">
      <h3>🏆 הישג חדש!</h3>
      <h4>${title}</h4>
      <p>${description}</p>
    </div>
  `;
  
  document.body.appendChild(achievement);
  
  // הסרה אחרי 3 שניות
  setTimeout(() => {
    achievement.remove();
  }, 3000);
}

// חיבור לכפתור הסטטיסטיקות
document.addEventListener('DOMContentLoaded', function() {
  const statsBtn = document.getElementById('show-stats');
  if (statsBtn) {
    statsBtn.addEventListener('click', showStatsModal);
  }
});

// סגירת מודלים בלחיצה על הרקע
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.add('hidden');
  }
});

// עדכון ההאזנה לכפתורים
document.addEventListener('DOMContentLoaded', function() {
  // הוספת האזנה לכפתורי הניווט
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const pageId = this.getAttribute('data-page');
      updateActiveButton(pageId);
      
      // הצגת הטיפ לדף החדש אחרי שנייה
      setTimeout(() => {
        showPageTip(pageId);
      }, 1000);
    });
  });
  
  // הוספת האזנה לכפתור הסטטיסטיקות
  const statsBtn = document.getElementById('show-stats');
  if (statsBtn) {
    statsBtn.addEventListener('click', function() {
      updateActiveButton('stats');
      showStatsModal();
    });
  }
});

// מערכת חידות
const quizQuestions = [
  {
    section: "חלק א': עולם של גולות",
    question: "לפי הסיפור, אם נסתכל במיקרוסקופ מיוחד על כל דבר בעולם, מה נגלה?",
    answers: [
      "שהכל עשוי מלגו צבעוני",
      "שהכל עשוי מגולות קטנטנות בכל מיני גדלים",
      "שהכל עשוי ממים",
      "שהכל עשוי מאוויר"
    ],
    correct: 1
  },
  {
    section: "חלק א': עולם של גולות",
    question: "איך קראנו בסיפור לכוח הנעלם שמושך את כל הגולות זו לזו?",
    answers: ["כוח הכבידה", "כוח המגנט", "דבקסם", "כוח-על"],
    correct: 2
  },
  {
    section: "חלק א': עולם של גולות",
    question: "למה קשה לקרוע דף נייר או לשבור מקל?",
    answers: [
      "כי הנייר והמקל לא רוצים שניגע בהם",
      "בגלל כוח הכבידה שמושך אותם לרצפה",
      "כי יש רוח חזקה שמחזיקה אותם",
      "כי כוח הדבקסם מחזיק את הגולות שלהם חזק ביחד"
    ],
    correct: 3
  },
  {
    section: "חלק ב': ריקוד הגולות",
    question: "איך ייראו הגולות בחפץ קשה כמו אבן או קרח?",
    answers: [
      "הן עפות במהירות ומתנגשות זו בזו",
      "הן מתגלגלות אחת על השנייה כמו במיקסר",
      "הן צפופות מאוד ורק רועדות קצת במקום",
      "הן ישנות ולא זזות בכלל"
    ],
    correct: 2
  },
  {
    section: "חלק ב': ריקוד הגולות",
    question: "ואיך ייראו הגולות בנוזל כמו מים או שמן?",
    answers: [
      "הן עפות בחופשיות באוויר",
      "הן צמודות אבל מתגלגלות זו על זו",
      "הן מסודרות בשורה ישרה ולא זזות",
      "הן נעלמות לגמרי"
    ],
    correct: 1
  },
  {
    section: "חלק ב': ריקוד הגולות",
    question: "באיזה מצב הגולות רחוקות זו מזו, עפות במהירות גבוהה ומתנגשות?",
    answers: [
      "במוצק (כמו עץ)",
      "בנוזל (כמו מיץ)", 
      "בגז (כמו האוויר שאנחנו נושמים)",
      "בשוקולד"
    ],
    correct: 2
  },
  {
    section: "חלק ג': חום ותנועה",
    question: "מה זה בעצם חום או טמפרטורה לפי הסיפור?",
    answers: [
      "צבע מיוחד שיש לגולות",
      "מדד למהירות התנועה של הגולות",
      "כמות הדבקסם שיש בין הגולות",
      "הגודל של הגולות"
    ],
    correct: 1
  },
  {
    section: "חלק ג': חום ותנועה",
    question: "כשאנחנו מחממים מים בסיר, מה בעצם קורה לגולות המים?",
    answers: [
      "הן הופכות להיות קטנות יותר",
      "הן מתחילות לנוע לאט יותר ויותר",
      "הן מקבלות יותר ויותר מהירות ומתחילות להשתולל",
      "הן נדבקות חזק יותר זו לזו"
    ],
    correct: 2
  },
  {
    section: "חלק ג': חום ותנועה",
    question: "מה קורה לגולות של הקרח כשהוא הופך למים ואז לאדים?",
    answers: [
      "הגולות קודם רועדות במקום, אחר כך מתגלגלות ולבסוף מתנתקות ועפות",
      "הגולות קודם עפות, אחר כך מתגלגלות ולבסוף קופאות במקום",
      "הגולות לא משנות את התנועה שלהן, רק הצבע משתנה",
      "מספר הגולות גדל ככל שמחממים יותר"
    ],
    correct: 0
  },
  {
    section: "חלק ג': חום ותנועה",
    question: "לפי הסיפור, למה הגולות באוויר לא נדבקות זו לזו למרות כוח הדבקסם?",
    answers: [
      "כי אין דבקסם באוויר",
      "כי הן נעות כל כך מהר, שהמהירות מתגברת על כוח המשיכה ביניהן",
      "כי הן חלקלקות מדי",
      "כי מישהו שם ביניהן שמן"
    ],
    correct: 1
  },
  {
    section: "חלק ד': הכירו את הצורונים",
    question: "מהם הצורונים שהסיפור מדבר עליהם?",
    answers: [
      "שם אחר לגולות בודדות",
      "מפלצות קטנות שחיות בין הגולות",
      "צורות מורכבות שנוצרו מכמה גולות שנדבקו חזק",
      "הכלים שבעזרתם אנחנו מסתכלים על הגולות"
    ],
    correct: 2
  },
  {
    section: "חלק ד': הכירו את הצורונים",
    question: "לפי הסיפור, למה צריך לחמם שמן לטמפרטורה גבוהה יותר ממים כדי שהוא ירתח?",
    answers: [
      "כי שמן הוא יותר צהוב ממים",
      "כי הצורונים של שמן גדולים יותר ונדבקים חזק יותר",
      "כי בשמן אין בכלל דבקסם",
      "כי הגולות של השמן פשוט לא אוהבות לזוז מהר"
    ],
    correct: 1
  },
  {
    section: "חלק ד': הכירו את הצורונים",
    question: "כשממיסים סוכר במים, מה קורה לצורונים של הסוכר?",
    answers: [
      "הם נשרפים ונעלמים",
      "הם מתפרקים ומתפזרים בין הצורונים של המים",
      "הם הופכים לצורונים של מים",
      "הם שוקעים לתחתית ונשארים שם ביחד"
    ],
    correct: 1
  }
];

let currentQuestionIndex = 0;
let correctAnswers = 0;

function initQuiz() {
  currentQuestionIndex = 0;
  correctAnswers = 0;
  showQuestion();
}

function showQuestion() {
  const question = quizQuestions[currentQuestionIndex];
  
  document.getElementById('quiz-section').textContent = question.section;
  document.getElementById('question-text').textContent = question.question;
  document.getElementById('current-question').textContent = currentQuestionIndex + 1;
  document.getElementById('total-questions').textContent = quizQuestions.length;
  
  // עדכון התקדמות
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  document.getElementById('quiz-progress').style.width = progress + '%';
  
  // יצירת תשובות
  const answersContainer = document.getElementById('answers-container');
  answersContainer.innerHTML = '';
  
  question.answers.forEach((answer, index) => {
    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer-option';
    answerDiv.textContent = `${index + 1}. ${answer}`;
    answerDiv.onclick = () => selectAnswer(index);
    answersContainer.appendChild(answerDiv);
  });
  
  // הסתרת פידבק וכפתורים
  document.getElementById('quiz-feedback').style.display = 'none';
  document.getElementById('next-question').classList.add('hidden');
  document.getElementById('finish-quiz').classList.add('hidden');
}

function selectAnswer(selectedIndex) {
  const question = quizQuestions[currentQuestionIndex];
  const answers = document.querySelectorAll('.answer-option');
  const feedback = document.getElementById('quiz-feedback');
  
  // הסרת בחירה קודמת
  answers.forEach(answer => {
    answer.classList.remove('selected', 'correct', 'incorrect');
  });
  
  // סימון התשובה שנבחרה
  answers[selectedIndex].classList.add('selected');
  
  if (selectedIndex === question.correct) {
    // תשובה נכונה
    answers[selectedIndex].classList.add('correct');
    feedback.className = 'quiz-feedback correct';
    feedback.innerHTML = getCorrectFeedback();
    correctAnswers++;
    
    // הצגת כפתור הבא
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        document.getElementById('next-question').classList.remove('hidden');
      } else {
        document.getElementById('finish-quiz').classList.remove('hidden');
      }
    }, 1500);
  } else {
    // תשובה שגויה
    answers[selectedIndex].classList.add('incorrect');
    feedback.className = 'quiz-feedback incorrect';
    feedback.innerHTML = getIncorrectFeedback();
  }
}

function getCorrectFeedback() {
  const messages = [
    "מעולה! אתם חוקרים מצוינים! 🌟",
    "פנטסטי! הבנתם בדיוק נכון! 🎉", 
    "וואו! אתם באמת מבינים את עולם הגולות! ⭐",
    "מדהים! התשובה מושלמת! 🏆",
    "כל הכבוד! אתם אמיתיים מדענים! 🔬"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getIncorrectFeedback() {
  const messages = [
    "לא נכון, אבל זה בסדר! בואו ננסה שוב 😊",
    "קרוב, אבל לא מדויק. נסו תשובה אחרת! 🤔",
    "לא בדיוק... חשבו על מה שראיתם בדפים הקודמים 💭",
    "טעות קטנה! נסו שוב, אני בטוח שתצליחו! 💪"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// האזנה לכפתורים
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('next-question')?.addEventListener('click', function() {
    currentQuestionIndex++;
    showQuestion();
  });
  
  document.getElementById('finish-quiz')?.addEventListener('click', function() {
    showResults();
  });
});

function showResults() {
  const resultsDiv = document.getElementById('quiz-results');
  const percentage = Math.round((correctAnswers / quizQuestions.length) * 100);
  
  let message = '';
  if (percentage >= 90) {
    message = 'מדען גדול! 👨‍🔬 אתם מבינים הכל על הדבקסם!';
  } else if (percentage >= 70) {
    message = 'חוקר מומחה! 🌟 ביצועים מעולים!';
  } else if (percentage >= 50) {
    message = 'חוקר מתקדם! 🔍 אתם בדרך הנכונה!';
  } else {
    message = 'חוקר מתחיל! 🌱 כדאי לחזור על החומר!';
  }
  
  resultsDiv.innerHTML = `
    <h3>סיימתם את החידות!</h3>
    <p>ענית נכון על ${correctAnswers} מתוך ${quizQuestions.length} שאלות</p>
    <p>ציון: ${percentage}%</p>
    <p>${message}</p>
    <button class="quiz-btn" onclick="initQuiz()">התחל מחדש</button>
  `;
  
  document.getElementById('quiz-card').style.display = 'none';
  resultsDiv.style.display = 'block';
}

// יתוף PageManager עם החידות
class QuizManager {
  constructor() {
    this.initQuiz = initQuiz;
  }
}
