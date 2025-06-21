// קובץ עזר לפונקציות נוספות של דבקסם
export class EducationalHelpers {
  
  // יצירת טקסט מסביר דינמי
  static createExplanationText(context, level = 1) {
    const explanations = {
      intro: [
        "בטבע יש כוחות שפועלים כל הזמן סביבנו",
        "התפוח נופל בגלל כוח הכבידה, אבל יש עוד כוח חשוב - הדבקסם!",
        "הדבקסם הוא הכוח שגורם לחומרים להתחבר ולהישאר יחד"
      ],
      microscope: [
        "עין רגילה רואה רק חפצים גדולים כמו שולחן או כוס",
        "מיקרוסקופ רגיל מראה לנו תאים קטנים שמהם נבנה הגוף שלנו",
        "במיקרוסקופ חזק אנחנו רואים צורונים - קבוצות של גולות שמחוברות יחד",
        "במיקרוסקופ על אנחנו רואים גולות בודדות - זה מה שנקרא אטומים!",
        "במיקרוסקופ הקסמים אנחנו רואים איך הדבקסם עובד ומחבר את הגולות"
      ],
      spheres: [
        "כל החומר בעולם בנוי מגולות קטנות שנקראות אטומים",
        "הגולות נמשכות זו לזו כמו מגנטים - זה הדבקסם!",
        "כשיש דבקסם, הגולות נשארות קרוב זו לזו",
        "כשאין דבקסם, הגולות עפות לכל הכיוונים"
      ],
      temperature: [
        "טמפרטורה זה לא משהו שאנחנו רואים - זה תנועה!",
        "כשחם, הגולות נעות מהר יותר ומתנגשות חזק יותר",
        "כשקר, הגולות נעות לאט יותר ובקושי זזות",
        "המדחום מודד כמה מהר הגולות נעות ופוגעות בו"
      ],
      states: [
        "באבן (מוצק) הגולות דבוקות חזק ורק מתנדנדות במקום",
        "במים (נוזל) הגולות עדיין דבוקות אבל יכולות לזוז ולהתגלגל",
        "באוויר (גז) הגולות עפות חופשיות ולא דבוקות בכלל"
      ]
    };
    
    return explanations[context] ? explanations[context][level - 1] || explanations[context][0] : "";
  }
  
  // יצירת אפקטים ויזואליים מיוחדים
  static createParticleEffect(ctx, x, y, color = '#FFD700', count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const distance = Math.random() * 20 + 10;
      const particleX = x + Math.cos(angle) * distance;
      const particleY = y + Math.sin(angle) * distance;
      
      ctx.beginPath();
      ctx.arc(particleX, particleY, Math.random() * 3 + 1, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
  
  // הוספת צלילים חינוכיים (ללא קבצי שמע - רק ויזואלי)
  static createSoundVisualization(ctx, x, y, intensity = 1) {
    const rings = 3;
    for (let i = 0; i < rings; i++) {
      ctx.beginPath();
      ctx.arc(x, y, (i + 1) * 15 * intensity, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 - i * 0.1})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  
  // יצירת דירוג כיף למשוב
  static createFunRating(interactions) {
    if (interactions < 5) return "🌟 נהדר! המשיכו לחקור!";
    if (interactions < 10) return "🌟🌟 אתם כבר מומחים!";
    if (interactions < 20) return "🌟🌟🌟 מדענים אמיתיים!";
    return "🌟🌟🌟🌟 מומחי דבקסם!";
  }
  
  // פונקציה ליצירת טיפים לגיל
  static getAgeTip(age) {
    if (age < 6) return "נסו ללחוץ על הכפתורים השונים וראו מה קורה!";
    if (age < 9) return "שימו לב איך הגולות מתנהגות כשמשנים את הטמפרטורה";
    if (age < 12) return "נסו להבין מה הקשר בין מהירות הגולות לטמפרטורה";
    return "חשבו על איך הדבקסם עובד במציאות - למה חפצים לא מתפרקים?";
  }
  
  // פונקציה ליצירת אתגרים
  static generateChallenge(pageType) {
    const challenges = {
      intro: "נסו להבין למה התפוח לא עף לחלל!",
      microscope: "מה הדמיון בין מיקרוסקופ אמיתי למיקרוסקופ הקסום שלנו?",
      spheres: "נסו להבין מה קורה כשאין דבקסם - איך זה נראה?",
      temperature: "האם אתם יכולים לנחש מה יקרה במינוס 273 מעלות?",
      states: "נסו לחשוב על חומרים אחרים - איך הדבקסם עובד בהם?"
    };
    
    return challenges[pageType] || "המשיכו לחקור ולגלות!";
  }
}

// קלאס לניהול התקדמות המשתמש
export class ProgressTracker {
  constructor() {
    this.interactions = 0;
    this.pagesVisited = new Set();
    this.achievements = [];
    this.startTime = Date.now();
  }
  
  // רישום אינטראקציה
  recordInteraction(type, page) {
    this.interactions++;
    this.pagesVisited.add(page);
    
    // בדיקת הישגים
    this.checkAchievements();
  }
  
  // בדיקת הישגים
  checkAchievements() {
    const newAchievements = [];
    
    if (this.interactions >= 5 && !this.achievements.includes('explorer')) {
      newAchievements.push({ id: 'explorer', title: 'חוקר מתחיל', description: '5 אינטראקציות ראשונות!' });
    }
    
    if (this.pagesVisited.size >= 3 && !this.achievements.includes('navigator')) {
      newAchievements.push({ id: 'navigator', title: 'נווט מומחה', description: 'ביקור ב-3 דפים שונים!' });
    }
    
    if (this.interactions >= 20 && !this.achievements.includes('scientist')) {
      newAchievements.push({ id: 'scientist', title: 'מדען צעיר', description: '20 אינטראקציות - אתם מדענים אמיתיים!' });
    }
    
    newAchievements.forEach(achievement => {
      this.achievements.push(achievement.id);
      this.showAchievement(achievement);
    });
  }
  
  // הצגת הישג
  showAchievement(achievement) {
    // יצירת הודעת הישג
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
      <div class="achievement-content">
        <h3>🏆 הישג חדש!</h3>
        <h4>${achievement.title}</h4>
        <p>${achievement.description}</p>
      </div>
    `;
    
    // הוספת CSS
    popup.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 1000;
      animation: slideIn 0.5s ease;
      max-width: 300px;
    `;
    
    document.body.appendChild(popup);
    
    // הסרה אוטומטית אחרי 3 שניות
    setTimeout(() => {
      popup.style.animation = 'slideOut 0.5s ease';
      setTimeout(() => popup.remove(), 500);
    }, 3000);
  }
  
  // קבלת סטטיסטיקות
  getStats() {
    const timeSpent = Math.round((Date.now() - this.startTime) / 1000 / 60); // דקות
    return {
      interactions: this.interactions,
      pagesVisited: this.pagesVisited.size,
      achievements: this.achievements.length,
      timeSpent: timeSpent,
      funRating: EducationalHelpers.createFunRating(this.interactions)
    };
  }
}

// CSS לאנימציות ההישגים
const achievementCSS = `
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.achievement-popup h3 {
  margin: 0 0 10px 0;
  font-size: 1.2em;
}

.achievement-popup h4 {
  margin: 0 0 5px 0;
  font-size: 1.1em;
}

.achievement-popup p {
  margin: 0;
  font-size: 0.9em;
  opacity: 0.9;
}
`;

// הוספת CSS לראש המסמך
const style = document.createElement('style');
style.textContent = achievementCSS;
document.head.appendChild(style);
