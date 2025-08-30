/**
 * Lightweight Quiz Widget for C Programming Zero to Hero
 * No dependencies, keyboard accessible, progress persistent
 */

class QuizWidget {
  constructor(container) {
    this.container = container;
    this.quizId = container.dataset.quizId;
    this.title = container.dataset.title || 'Quiz';
    this.passMark = parseFloat(container.dataset.pass || '0.8');
    this.data = this.loadQuizData();
    this.userAnswers = {};
    this.isSubmitted = false;
    this.score = 0;
    
    if (this.data) {
      this.init();
    }
  }
  
  loadQuizData() {
    const dataScript = this.container.parentNode.querySelector('script.quiz-data');
    if (!dataScript) {
      console.warn('Quiz data script not found for', this.quizId);
      return null;
    }
    
    try {
      return JSON.parse(dataScript.textContent);
    } catch (e) {
      console.error('Invalid quiz data JSON:', e);
      return null;
    }
  }
  
  init() {
    this.setupEventListeners();
    this.renderQuizItems();
    this.loadProgress();
    this.showBadgeIfEarned();
  }
  
  renderQuizItems() {
    const itemsList = this.container.querySelector('.quiz-items');
    if (!itemsList) return;
    
    const items = this.data.shuffle ? this.shuffleArray([...this.data.items]) : this.data.items;
    
    itemsList.innerHTML = '';
    items.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'quiz-item';
      li.innerHTML = this.renderQuizItem(item, index);
      itemsList.appendChild(li);
    });
  }
  
  renderQuizItem(item, index) {
    const questionId = `${this.quizId}-q${index}`;
    const choices = item.choices.map((choice, choiceIndex) => {
      const choiceId = `${questionId}-c${choiceIndex}`;
      return `
        <div class="quiz-choice">
          <input type="radio" 
                 id="${choiceId}" 
                 name="${questionId}" 
                 value="${choiceIndex}"
                 aria-describedby="${questionId}-q">
          <label for="${choiceId}">${this.escapeHtml(choice)}</label>
        </div>
      `;
    }).join('');
    
    return `
      <div class="quiz-question" id="${questionId}-q">${this.escapeHtml(item.q)}</div>
      <div class="quiz-choices" role="radiogroup" aria-labelledby="${questionId}-q">
        ${choices}
      </div>
      <div class="quiz-explanation" data-explanation="${index}">
        <strong>Explanation:</strong> ${this.escapeHtml(item.explain)}
      </div>
    `;
  }
  
  setupEventListeners() {
    const submitBtn = this.container.querySelector('.quiz-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.handleSubmit());
      
      // Keyboard support
      submitBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleSubmit();
        }
      });
    }
    
    // Track answers
    this.container.addEventListener('change', (e) => {
      if (e.target.type === 'radio') {
        const questionIndex = this.getQuestionIndex(e.target.name);
        this.userAnswers[questionIndex] = parseInt(e.target.value);
        this.saveProgress();
      }
    });
    
    // Arrow key navigation within radio groups
    this.container.addEventListener('keydown', (e) => {
      if (e.target.type === 'radio' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        this.navigateRadioGroup(e.target, e.key === 'ArrowDown');
      }
    });
  }
  
  getQuestionIndex(name) {
    return parseInt(name.split('-q')[1]);
  }
  
  navigateRadioGroup(currentRadio, next) {
    const radioGroup = currentRadio.closest('.quiz-choices');
    const radios = Array.from(radioGroup.querySelectorAll('input[type="radio"]'));
    const currentIndex = radios.indexOf(currentRadio);
    
    let newIndex;
    if (next) {
      newIndex = currentIndex + 1 >= radios.length ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex - 1 < 0 ? radios.length - 1 : currentIndex - 1;
    }
    
    radios[newIndex].focus();
    radios[newIndex].checked = true;
    radios[newIndex].dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  handleSubmit() {
    if (this.isSubmitted) return;
    
    const totalQuestions = this.data.items.length;
    const answeredQuestions = Object.keys(this.userAnswers).length;
    
    if (answeredQuestions < totalQuestions) {
      alert(`Please answer all ${totalQuestions} questions before submitting.`);
      return;
    }
    
    this.isSubmitted = true;
    this.gradeQuiz();
    this.showResults();
    this.saveProgress();
    
    // Disable further changes
    const inputs = this.container.querySelectorAll('input[type="radio"]');
    inputs.forEach(input => input.disabled = true);
    
    const submitBtn = this.container.querySelector('.quiz-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitted';
    }
  }
  
  gradeQuiz() {
    let correct = 0;
    
    this.data.items.forEach((item, index) => {
      const userAnswer = this.userAnswers[index];
      const isCorrect = userAnswer === item.answer;
      
      if (isCorrect) correct++;
      
      // Visual feedback
      const quizItem = this.container.querySelectorAll('.quiz-item')[index];
      if (quizItem) {
        quizItem.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        // Show explanation
        const explanation = quizItem.querySelector('.quiz-explanation');
        if (explanation) {
          explanation.classList.add('show');
        }
      }
    });
    
    this.score = correct / this.data.items.length;
  }
  
  showResults() {
    const resultDiv = this.container.querySelector('.quiz-result');
    if (!resultDiv) return;
    
    const percentage = Math.round(this.score * 100);
    const passed = this.score >= this.passMark;
    
    resultDiv.className = `quiz-result show ${passed ? 'pass' : 'fail'}`;
    resultDiv.innerHTML = `
      <div class="quiz-score">Score: ${Math.round(this.score * this.data.items.length)}/${this.data.items.length} (${percentage}%)</div>
      <div>${passed ? '🎉 Great job! You passed!' : '💪 Keep practicing and try again!'}</div>
    `;
    
    // Focus result for screen readers
    resultDiv.setAttribute('tabindex', '-1');
    resultDiv.focus();
    
    // Show enhanced analytics
    this.showAnalytics();
    
    if (passed) {
      this.awardBadge();
      this.showConfetti();
    }
  }
  
  awardBadge() {
    const badgeDiv = this.container.querySelector('.quiz-badge');
    if (badgeDiv) {
      const badgeName = this.getBadgeName();
      badgeDiv.textContent = `⭐ ${badgeName}`;
      badgeDiv.hidden = false;
      
      // Save badge
      this.saveBadge();
      
      // Update footer badge display
      this.updateBadgeDisplay();
    }
  }
  
  getBadgeName() {
    const titleMap = {
      'basics': 'Basics Badge',
      'intro': 'Introduction Badge',
      'control': 'Control Flow Badge',
      'loops': 'Loops Badge',
      'arrays': 'Arrays Badge',
      'functions': 'Functions Badge',
      'pointers': 'Pointers Badge',
      'structures': 'Structures Badge',
      'files': 'Files Badge',
      'algorithms': 'Algorithms Badge'
    };
    
    for (const [key, name] of Object.entries(titleMap)) {
      if (this.quizId.toLowerCase().includes(key)) {
        return name;
      }
    }
    
    return 'Quiz Badge';
  }
  
  showConfetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; // Respect user preference
    }
    
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti';
    this.container.appendChild(confettiContainer);
    
    // Create confetti pieces
    for (let i = 0; i < 15; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.animationDelay = Math.random() * 0.3 + 's';
      piece.style.animationDuration = (1.5 + Math.random() * 0.5) + 's';
      confettiContainer.appendChild(piece);
    }
    
    // Clean up after animation
    setTimeout(() => {
      confettiContainer.remove();
    }, 2500);
  }
  
  saveProgress() {
    const progress = {
      answers: this.userAnswers,
      submitted: this.isSubmitted,
      score: this.score,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`czh.quiz.${this.quizId}`, JSON.stringify(progress));
  }
  
  loadProgress() {
    const saved = localStorage.getItem(`czh.quiz.${this.quizId}`);
    if (!saved) return;
    
    try {
      const progress = JSON.parse(saved);
      this.userAnswers = progress.answers || {};
      this.isSubmitted = progress.submitted || false;
      this.score = progress.score || 0;
      
      // Restore UI state
      Object.entries(this.userAnswers).forEach(([questionIndex, answerIndex]) => {
        const radio = this.container.querySelector(`input[name="${this.quizId}-q${questionIndex}"][value="${answerIndex}"]`);
        if (radio) radio.checked = true;
      });
      
      if (this.isSubmitted) {
        this.gradeQuiz();
        this.showResults();
        
        // Disable inputs
        const inputs = this.container.querySelectorAll('input[type="radio"]');
        inputs.forEach(input => input.disabled = true);
        
        const submitBtn = this.container.querySelector('.quiz-submit');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitted';
        }
      }
    } catch (e) {
      console.warn('Could not restore quiz progress:', e);
    }
  }
  
  saveBadge() {
    const badges = this.getBadges();
    badges[this.quizId] = {
      name: this.getBadgeName(),
      earned: Date.now(),
      score: this.score
    };
    localStorage.setItem('czh.badges', JSON.stringify(badges));
  }
  
  getBadges() {
    try {
      return JSON.parse(localStorage.getItem('czh.badges') || '{}');
    } catch (e) {
      return {};
    }
  }
  
  showBadgeIfEarned() {
    const badges = this.getBadges();
    if (badges[this.quizId]) {
      const badgeDiv = this.container.querySelector('.quiz-badge');
      if (badgeDiv) {
        badgeDiv.textContent = `⭐ ${badges[this.quizId].name}`;
        badgeDiv.hidden = false;
      }
    }
  }
  
  updateBadgeDisplay() {
    const badges = this.getBadges();
    const badgeCount = Object.keys(badges).length;
    
    if (badgeCount > 0) {
      // Add badge count to footer if it exists
      const footer = document.querySelector('footer');
      if (footer) {
        let badgeDisplay = footer.querySelector('.badge-display');
        if (!badgeDisplay) {
          badgeDisplay = document.createElement('div');
          badgeDisplay.className = 'badge-display';
          footer.appendChild(badgeDisplay);
        }
        
        const badgeNames = Object.values(badges).map(b => b.name).join(', ');
        badgeDisplay.innerHTML = `<small>🏆 Earned badges (${badgeCount}): ${badgeNames}</small>`;
      }
    }
  }
  
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  showAnalytics() {
    const analyticsContainer = document.getElementById('quiz-analytics');
    if (!analyticsContainer) return;
    
    // Calculate topic-based performance
    const topicScores = this.calculateTopicScores();
    
    // Update performance breakdown
    this.updatePerformanceBreakdown(topicScores);
    
    // Generate suggestions
    this.generateImprovementSuggestions(topicScores);
    
    // Show analytics with animation
    analyticsContainer.style.display = 'block';
    setTimeout(() => {
      analyticsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
  }

  calculateTopicScores() {
    const topics = {
      'Variable Declaration': { correct: 0, total: 0 },
      'Format Specifiers': { correct: 0, total: 0 },
      'I/O Operations': { correct: 0, total: 0 },
      'Syntax Rules': { correct: 0, total: 0 }
    };
    
    // Map questions to topics based on content
    this.data.items.forEach((item, index) => {
      const question = item.q.toLowerCase();
      const userAnswer = this.userAnswers[index];
      const isCorrect = userAnswer === item.answer;
      
      // Simple keyword-based categorization
      if (question.includes('variable') || question.includes('declaration') || question.includes('identifier')) {
        topics['Variable Declaration'].total++;
        if (isCorrect) topics['Variable Declaration'].correct++;
      } else if (question.includes('format') || question.includes('%') || question.includes('specifier')) {
        topics['Format Specifiers'].total++;
        if (isCorrect) topics['Format Specifiers'].correct++;
      } else if (question.includes('scanf') || question.includes('printf') || question.includes('&')) {
        topics['I/O Operations'].total++;
        if (isCorrect) topics['I/O Operations'].correct++;
      } else {
        topics['Syntax Rules'].total++;
        if (isCorrect) topics['Syntax Rules'].correct++;
      }
    });
    
    return topics;
  }

  updatePerformanceBreakdown(topicScores) {
    const performanceElements = document.querySelectorAll('.topic-performance');
    
    Object.entries(topicScores).forEach(([topic, score], index) => {
      if (performanceElements[index]) {
        const scoreValue = performanceElements[index].querySelector('.score-value');
        const progressFill = performanceElements[index].querySelector('.progress-fill');
        
        const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
        
        if (scoreValue && progressFill) {
          scoreValue.textContent = `${percentage}%`;
          progressFill.style.width = `${percentage}%`;
          
          // Update color classes
          scoreValue.className = 'score-value';
          progressFill.className = 'progress-fill';
          
          if (percentage >= 80) {
            scoreValue.classList.add('good');
            progressFill.classList.add('good');
          } else if (percentage >= 60) {
            scoreValue.classList.add('medium');
            progressFill.classList.add('medium');
          } else {
            scoreValue.classList.add('needs-work');
            progressFill.classList.add('needs-work');
          }
        }
      }
    });
  }

  generateImprovementSuggestions(topicScores) {
    const suggestionsList = document.querySelector('.suggestions-list');
    if (!suggestionsList) return;
    
    const suggestions = [];
    
    Object.entries(topicScores).forEach(([topic, score]) => {
      const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
      
      if (percentage < 80) {
        switch (topic) {
          case 'Variable Declaration':
            suggestions.push('Review variable naming rules and declaration syntax');
            break;
          case 'Format Specifiers':
            suggestions.push('Practice format specifiers - remember %d for int, %f for float, %c for char');
            break;
          case 'I/O Operations':
            suggestions.push('Focus on scanf usage - don\'t forget the & for addresses!');
            break;
          case 'Syntax Rules':
            suggestions.push('Review C syntax fundamentals and common programming patterns');
            break;
        }
      }
    });
    
    if (suggestions.length === 0) {
      suggestions.push('Excellent work! You\'ve mastered all the topics. Try the Memory Visualizer above for more practice!');
    }
    
    suggestionsList.innerHTML = suggestions.map(suggestion => `<li>${suggestion}</li>`).join('');
  }
}

/**
 * Interactive Timeline Widget
 * Handles timeline navigation and animations
 */
class TimelineWidget {
  constructor(container) {
    this.container = container;
    this.items = container.querySelectorAll('.timeline-item');
    this.currentIndex = 0;
    this.prevBtn = container.querySelector('[data-action="prev"]');
    this.nextBtn = container.querySelector('[data-action="next"]');
    this.progress = container.querySelector('.timeline-progress');
    
    if (this.items.length > 0) {
      this.init();
    }
  }
  
  init() {
    this.updateDisplay();
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.previous());
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.isTimelineVisible()) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.previous();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.next();
        }
      }
    });
    
    // Auto-advance every 10 seconds (optional)
    // this.autoAdvanceTimer = setInterval(() => {
    //   if (this.currentIndex < this.items.length - 1) {
    //     this.next();
    //   }
    // }, 10000);
  }
  
  isTimelineVisible() {
    const rect = this.container.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }
  
  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateDisplay();
    }
  }
  
  next() {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
      this.updateDisplay();
    }
  }
  
  updateDisplay() {
    // Update active item
    this.items.forEach((item, index) => {
      item.classList.remove('active', 'animating');
      
      if (index === this.currentIndex) {
        item.classList.add('active');
        setTimeout(() => item.classList.add('animating'), 50);
      }
    });
    
    // Update progress
    if (this.progress) {
      this.progress.textContent = `${this.currentIndex + 1} / ${this.items.length}`;
    }
    
    // Update button states
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentIndex === 0;
    }
    
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentIndex === this.items.length - 1;
    }
    
    // Accessibility
    this.items[this.currentIndex].setAttribute('aria-current', 'step');
    this.items.forEach((item, index) => {
      if (index !== this.currentIndex) {
        item.removeAttribute('aria-current');
      }
    });
  }
  
  destroy() {
    if (this.autoAdvanceTimer) {
      clearInterval(this.autoAdvanceTimer);
    }
  }
}

/**
 * Memory Visualizer Widget
 * Parses simple C code and visualizes memory allocation
 */
class MemoryVisualizerWidget {
  constructor(container) {
    this.container = container;
    this.codeInput = container.querySelector('.memory-code-input');
    this.runBtn = container.querySelector('.run-simulation');
    this.resetBtn = container.querySelector('.reset-memory');
    this.memoryBlocks = container.querySelector('#memory-blocks');
    this.totalMemoryEl = container.querySelector('#total-memory');
    this.varCountEl = container.querySelector('#var-count');
    this.nextAddressEl = container.querySelector('#next-address');
    
    this.baseAddress = 0x1000;
    this.currentAddress = this.baseAddress;
    this.variables = [];
    
    if (this.codeInput && this.runBtn) {
      this.init();
    }
  }
  
  init() {
    this.setupEventListeners();
    this.runSimulation(); // Run initial simulation
  }
  
  setupEventListeners() {
    if (this.runBtn) {
      this.runBtn.addEventListener('click', () => this.runSimulation());
    }
    
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.resetMemory());
    }
    
    // Auto-run on code change (debounced)
    if (this.codeInput) {
      let timeout;
      this.codeInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => this.runSimulation(), 500);
      });
    }
  }
  
  parseCode(code) {
    const variables = [];
    const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('//'));
    
    const typePattern = /^(int|float|double|char)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:=\s*(.+?))?;/;
    
    for (const line of lines) {
      const match = line.match(typePattern);
      if (match) {
        const [, type, name, valueStr] = match;
        let value = valueStr || '0';
        
        // Clean up the value
        value = value.replace(/'/g, '').replace(/"/g, '').trim();
        
        variables.push({
          type,
          name,
          value: this.formatValue(type, value),
          size: this.getTypeSize(type)
        });
      }
    }
    
    return variables;
  }
  
  getTypeSize(type) {
    const sizes = {
      'char': 1,
      'int': 4,
      'float': 4,
      'double': 8
    };
    return sizes[type] || 4;
  }
  
  formatValue(type, value) {
    switch (type) {
      case 'char':
        if (value.length === 1) {
          return `'${value}'`;
        }
        return value;
      case 'int':
        return parseInt(value) || 0;
      case 'float':
        return parseFloat(value).toFixed(1) || '0.0';
      case 'double':
        return parseFloat(value).toFixed(5) || '0.00000';
      default:
        return value;
    }
  }
  
  runSimulation() {
    const code = this.codeInput ? this.codeInput.value : '';
    this.variables = this.parseCode(code);
    this.currentAddress = this.baseAddress;
    this.updateMemoryDisplay();
    this.updateStats();
  }
  
  resetMemory() {
    if (this.codeInput) {
      this.codeInput.value = `int age = 25;
float height = 5.8;
char grade = 'A';
double pi = 3.14159;`;
    }
    this.runSimulation();
  }
  
  updateMemoryDisplay() {
    if (!this.memoryBlocks) return;
    
    // Clear existing blocks
    this.memoryBlocks.innerHTML = '';
    
    if (this.variables.length === 0) {
      this.memoryBlocks.innerHTML = '<div class="memory-placeholder">Run simulation to see memory allocation</div>';
      return;
    }
    
    // Add each variable as a memory block
    this.variables.forEach((variable, index) => {
      const block = document.createElement('div');
      block.className = `memory-block ${variable.type} animated`;
      
      // Calculate address for this variable
      const address = this.currentAddress;
      this.currentAddress += variable.size;
      
      block.innerHTML = `
        <div class="memory-address">0x${address.toString(16).toUpperCase()}</div>
        <div class="memory-content">${variable.value}</div>
        <div class="variable-label">${variable.name} (${variable.type})</div>
      `;
      
      // Add with slight delay for animation effect
      setTimeout(() => {
        this.memoryBlocks.appendChild(block);
      }, index * 200);
    });
  }
  
  updateStats() {
    const totalMemory = this.variables.reduce((sum, variable) => sum + variable.size, 0);
    
    if (this.totalMemoryEl) {
      this.totalMemoryEl.textContent = `${totalMemory} bytes`;
    }
    
    if (this.varCountEl) {
      this.varCountEl.textContent = this.variables.length.toString();
    }
    
    if (this.nextAddressEl) {
      this.nextAddressEl.textContent = `0x${this.currentAddress.toString(16).toUpperCase()}`;
    }
  }
}

/**
 * Decision Tree Visualizer Widget
 * Visualizes conditional logic flow for educational purposes
 */
class DecisionVisualizerWidget {
  constructor(container) {
    this.container = container;
    this.codeInput = container.querySelector('.decision-code-input');
    this.runBtn = container.querySelector('.run-decision');
    this.resetBtn = container.querySelector('.reset-decision');
    this.ageInput = container.querySelector('#age-input');
    this.licenseInput = container.querySelector('#license-input');
    this.updateBtn = container.querySelector('.update-values');
    this.variableValuesEl = container.querySelector('#variable-values');
    
    this.variables = { age: 25, hasLicense: 1 };
    
    if (this.codeInput && this.runBtn) {
      this.init();
    }
  }
  
  init() {
    this.setupEventListeners();
    this.updateVisualization();
  }
  
  setupEventListeners() {
    if (this.runBtn) {
      this.runBtn.addEventListener('click', () => this.runVisualization());
    }
    
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.resetVisualization());
    }
    
    if (this.updateBtn) {
      this.updateBtn.addEventListener('click', () => this.updateVariables());
    }
    
    // Update on input changes
    if (this.ageInput) {
      this.ageInput.addEventListener('change', () => this.updateVariables());
    }
    
    if (this.licenseInput) {
      this.licenseInput.addEventListener('change', () => this.updateVariables());
    }
  }
  
  updateVariables() {
    if (this.ageInput && this.licenseInput) {
      this.variables.age = parseInt(this.ageInput.value) || 0;
      this.variables.hasLicense = parseInt(this.licenseInput.value) || 0;
      
      // Update code
      const newCode = `int age = ${this.variables.age};
int hasLicense = ${this.variables.hasLicense};

if (age >= 18) {
    if (hasLicense == 1) {
        printf("You can drive!\\n");
    } else {
        printf("Get your license first.\\n");
    }
} else {
    printf("Too young to drive.\\n");
}`;
      
      if (this.codeInput) {
        this.codeInput.value = newCode;
      }
      
      this.updateVisualization();
    }
  }
  
  runVisualization() {
    this.updateVisualization();
    // Animate the decision path
    this.animateDecisionPath();
  }
  
  resetVisualization() {
    this.variables = { age: 25, hasLicense: 1 };
    
    if (this.ageInput) this.ageInput.value = '25';
    if (this.licenseInput) this.licenseInput.value = '1';
    
    const resetCode = `int age = 25;
int hasLicense = 1;

if (age >= 18) {
    if (hasLicense == 1) {
        printf("You can drive!\\n");
    } else {
        printf("Get your license first.\\n");
    }
} else {
    printf("Too young to drive.\\n");
}`;
    
    if (this.codeInput) {
      this.codeInput.value = resetCode;
    }
    
    this.updateVisualization();
  }
  
  updateVisualization() {
    // Update variable values display
    if (this.variableValuesEl) {
      this.variableValuesEl.textContent = `age = ${this.variables.age}, hasLicense = ${this.variables.hasLicense}`;
    }
    
    // Evaluate conditions
    const firstCondition = this.variables.age >= 18;
    const secondCondition = this.variables.hasLicense == 1;
    
    // Update first condition
    const firstConditionNode = this.container.querySelector('[data-condition="age >= 18"]');
    if (firstConditionNode) {
      const resultEl = firstConditionNode.querySelector('.condition-result');
      if (resultEl) {
        resultEl.textContent = `${this.variables.age} >= 18 = ${firstCondition}`;
      }
    }
    
    // Update second condition if applicable
    const secondConditionNode = this.container.querySelector('[data-condition="hasLicense == 1"]');
    if (secondConditionNode) {
      const resultEl = secondConditionNode.querySelector('.condition-result');
      if (resultEl) {
        resultEl.textContent = `${this.variables.hasLicense} == 1 = ${secondCondition}`;
      }
    }
    
    // Update active states
    this.updateActiveStates(firstCondition, secondCondition);
  }
  
  updateActiveStates(firstCondition, secondCondition) {
    // Reset all states
    const nodes = this.container.querySelectorAll('.tree-node');
    const branches = this.container.querySelectorAll('.branch-label');
    
    nodes.forEach(node => {
      node.classList.remove('active', 'inactive');
    });
    
    branches.forEach(branch => {
      branch.classList.remove('active');
    });
    
    // Set active path based on conditions
    if (firstCondition) {
      // Age >= 18: TRUE path
      const trueBranch = this.container.querySelector('.true-branch');
      if (trueBranch && trueBranch.closest('.tree-branches')) {
        trueBranch.classList.add('active');
      }
      
      const secondConditionNode = this.container.querySelector('[data-condition="hasLicense == 1"]');
      if (secondConditionNode) {
        secondConditionNode.classList.add('active');
      }
      
      if (secondCondition) {
        // hasLicense == 1: TRUE path
        const nestedTrueBranch = this.container.querySelector('.nested-branches .true-branch');
        if (nestedTrueBranch) {
          nestedTrueBranch.classList.add('active');
        }
        
        const driveNode = this.container.querySelector('.nested-branches .branch-right .result-node');
        if (driveNode) {
          driveNode.classList.add('active');
          driveNode.classList.remove('inactive');
        }
        
        // Mark other result nodes as inactive
        const otherResults = this.container.querySelectorAll('.result-node');
        otherResults.forEach(node => {
          if (!node.classList.contains('active')) {
            node.classList.add('inactive');
          }
        });
      } else {
        // hasLicense == 1: FALSE path
        const nestedFalseBranch = this.container.querySelector('.nested-branches .false-branch');
        if (nestedFalseBranch) {
          nestedFalseBranch.classList.add('active');
        }
        
        const licenseNode = this.container.querySelector('.nested-branches .branch-left .result-node');
        if (licenseNode) {
          licenseNode.classList.add('active');
          licenseNode.classList.remove('inactive');
        }
        
        // Mark other result nodes as inactive
        const otherResults = this.container.querySelectorAll('.result-node');
        otherResults.forEach(node => {
          if (!node.classList.contains('active')) {
            node.classList.add('inactive');
          }
        });
      }
    } else {
      // Age >= 18: FALSE path
      const falseBranch = this.container.querySelector('.false-branch');
      if (falseBranch && falseBranch.closest('.tree-branches')) {
        falseBranch.classList.add('active');
      }
      
      const tooYoungNode = this.container.querySelector('.branch-left .result-node');
      if (tooYoungNode) {
        tooYoungNode.classList.add('active');
        tooYoungNode.classList.remove('inactive');
      }
      
      // Mark other nodes as inactive
      const secondConditionNode = this.container.querySelector('[data-condition="hasLicense == 1"]');
      if (secondConditionNode) {
        secondConditionNode.classList.remove('active');
      }
      
      const otherResults = this.container.querySelectorAll('.result-node');
      otherResults.forEach(node => {
        if (!node.classList.contains('active')) {
          node.classList.add('inactive');
        }
      });
    }
  }
  
  animateDecisionPath() {
    // Add a brief animation to highlight the decision flow
    const activeNodes = this.container.querySelectorAll('.tree-node.active, .branch-label.active');
    
    activeNodes.forEach((node, index) => {
      setTimeout(() => {
        node.style.transform = 'scale(1.05)';
        setTimeout(() => {
          node.style.transform = '';
        }, 300);
      }, index * 200);
    });
  }
}

/**
 * Loop Visualizer Widget - Step-by-step loop execution visualization
 */
class LoopVisualizerWidget {
  constructor(container) {
    this.container = container;
    this.currentStep = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.intervalId = null;
    this.currentLoopType = 'for';
    this.loopConfigs = this.initializeLoopConfigs();
    
    this.init();
  }
  
  initializeLoopConfigs() {
    return {
      for: {
        code: `for (int i = 1; i <= 5; i++) {
    printf("%d ", i);
}`,
        steps: [
          { step: 1, description: "Initialize: i = 1", variables: { i: 1 }, output: "", highlight: "i = 1" },
          { step: 2, description: "Check condition: i <= 5 (1 <= 5 = true)", variables: { i: 1 }, output: "", highlight: "i <= 5" },
          { step: 3, description: "Execute body: printf", variables: { i: 1 }, output: "1 ", highlight: "printf" },
          { step: 4, description: "Update: i++", variables: { i: 2 }, output: "1 ", highlight: "i++" },
          { step: 5, description: "Check condition: i <= 5 (2 <= 5 = true)", variables: { i: 2 }, output: "1 ", highlight: "i <= 5" },
          { step: 6, description: "Execute body: printf", variables: { i: 2 }, output: "1 2 ", highlight: "printf" },
          { step: 7, description: "Update: i++", variables: { i: 3 }, output: "1 2 ", highlight: "i++" },
          { step: 8, description: "Check condition: i <= 5 (3 <= 5 = true)", variables: { i: 3 }, output: "1 2 ", highlight: "i <= 5" },
          { step: 9, description: "Execute body: printf", variables: { i: 3 }, output: "1 2 3 ", highlight: "printf" },
          { step: 10, description: "Update: i++", variables: { i: 4 }, output: "1 2 3 ", highlight: "i++" },
          { step: 11, description: "Check condition: i <= 5 (4 <= 5 = true)", variables: { i: 4 }, output: "1 2 3 ", highlight: "i <= 5" },
          { step: 12, description: "Execute body: printf", variables: { i: 4 }, output: "1 2 3 4 ", highlight: "printf" },
          { step: 13, description: "Update: i++", variables: { i: 5 }, output: "1 2 3 4 ", highlight: "i++" },
          { step: 14, description: "Check condition: i <= 5 (5 <= 5 = true)", variables: { i: 5 }, output: "1 2 3 4 ", highlight: "i <= 5" },
          { step: 15, description: "Execute body: printf", variables: { i: 5 }, output: "1 2 3 4 5 ", highlight: "printf" },
          { step: 16, description: "Update: i++", variables: { i: 6 }, output: "1 2 3 4 5 ", highlight: "i++" },
          { step: 17, description: "Check condition: i <= 5 (6 <= 5 = false)", variables: { i: 6 }, output: "1 2 3 4 5 ", highlight: "i <= 5" },
          { step: 18, description: "Loop ends", variables: { i: 6 }, output: "1 2 3 4 5 ", highlight: "" }
        ]
      },
      while: {
        code: `int i = 1;
while (i <= 5) {
    printf("%d ", i);
    i++;
}`,
        steps: [
          { step: 1, description: "Initialize: i = 1", variables: { i: 1 }, output: "", highlight: "i = 1" },
          { step: 2, description: "Check condition: i <= 5 (1 <= 5 = true)", variables: { i: 1 }, output: "", highlight: "i <= 5" },
          { step: 3, description: "Execute body: printf", variables: { i: 1 }, output: "1 ", highlight: "printf" },
          { step: 4, description: "Execute body: i++", variables: { i: 2 }, output: "1 ", highlight: "i++" },
          { step: 5, description: "Check condition: i <= 5 (2 <= 5 = true)", variables: { i: 2 }, output: "1 ", highlight: "i <= 5" },
          { step: 6, description: "Execute body: printf", variables: { i: 2 }, output: "1 2 ", highlight: "printf" },
          { step: 7, description: "Execute body: i++", variables: { i: 3 }, output: "1 2 ", highlight: "i++" },
          { step: 8, description: "Check condition: i <= 5 (3 <= 5 = true)", variables: { i: 3 }, output: "1 2 ", highlight: "i <= 5" },
          { step: 9, description: "Execute body: printf", variables: { i: 3 }, output: "1 2 3 ", highlight: "printf" },
          { step: 10, description: "Execute body: i++", variables: { i: 4 }, output: "1 2 3 ", highlight: "i++" },
          { step: 11, description: "Check condition: i <= 5 (4 <= 5 = true)", variables: { i: 4 }, output: "1 2 3 ", highlight: "i <= 5" },
          { step: 12, description: "Execute body: printf", variables: { i: 4 }, output: "1 2 3 4 ", highlight: "printf" },
          { step: 13, description: "Execute body: i++", variables: { i: 5 }, output: "1 2 3 4 ", highlight: "i++" },
          { step: 14, description: "Check condition: i <= 5 (5 <= 5 = true)", variables: { i: 5 }, output: "1 2 3 4 ", highlight: "i <= 5" },
          { step: 15, description: "Execute body: printf", variables: { i: 5 }, output: "1 2 3 4 5 ", highlight: "printf" },
          { step: 16, description: "Execute body: i++", variables: { i: 6 }, output: "1 2 3 4 5 ", highlight: "i++" },
          { step: 17, description: "Check condition: i <= 5 (6 <= 5 = false)", variables: { i: 6 }, output: "1 2 3 4 5 ", highlight: "i <= 5" },
          { step: 18, description: "Loop ends", variables: { i: 6 }, output: "1 2 3 4 5 ", highlight: "" }
        ]
      },
      'do-while': {
        code: `int i = 1;
do {
    printf("%d ", i);
    i++;
} while (i <= 5);`,
        steps: [
          { step: 1, description: "Initialize: i = 1", variables: { i: 1 }, output: "", highlight: "i = 1" },
          { step: 2, description: "Execute body: printf (runs at least once)", variables: { i: 1 }, output: "1 ", highlight: "printf" },
          { step: 3, description: "Execute body: i++", variables: { i: 2 }, output: "1 ", highlight: "i++" },
          { step: 4, description: "Check condition: i <= 5 (2 <= 5 = true)", variables: { i: 2 }, output: "1 ", highlight: "i <= 5" },
          { step: 5, description: "Execute body: printf", variables: { i: 2 }, output: "1 2 ", highlight: "printf" },
          { step: 6, description: "Execute body: i++", variables: { i: 3 }, output: "1 2 ", highlight: "i++" },
          { step: 7, description: "Check condition: i <= 5 (3 <= 5 = true)", variables: { i: 3 }, output: "1 2 ", highlight: "i <= 5" },
          { step: 8, description: "Execute body: printf", variables: { i: 3 }, output: "1 2 3 ", highlight: "printf" },
          { step: 9, description: "Execute body: i++", variables: { i: 4 }, output: "1 2 3 ", highlight: "i++" },
          { step: 10, description: "Check condition: i <= 5 (4 <= 5 = true)", variables: { i: 4 }, output: "1 2 3 ", highlight: "i <= 5" },
          { step: 11, description: "Execute body: printf", variables: { i: 4 }, output: "1 2 3 4 ", highlight: "printf" },
          { step: 12, description: "Execute body: i++", variables: { i: 5 }, output: "1 2 3 4 ", highlight: "i++" },
          { step: 13, description: "Check condition: i <= 5 (5 <= 5 = true)", variables: { i: 5 }, output: "1 2 3 4 ", highlight: "i <= 5" },
          { step: 14, description: "Execute body: printf", variables: { i: 5 }, output: "1 2 3 4 5 ", highlight: "printf" },
          { step: 15, description: "Execute body: i++", variables: { i: 6 }, output: "1 2 3 4 5 ", highlight: "i++" },
          { step: 16, description: "Check condition: i <= 5 (6 <= 5 = false)", variables: { i: 6 }, output: "1 2 3 4 5 ", highlight: "i <= 5" },
          { step: 17, description: "Loop ends", variables: { i: 6 }, output: "1 2 3 4 5 ", highlight: "" }
        ]
      },
      nested: {
        code: `for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        printf("(%d,%d) ", i, j);
    }
    printf("\\n");
}`,
        steps: [
          { step: 1, description: "Outer loop: i = 1", variables: { i: 1, j: 0 }, output: "", highlight: "i = 1" },
          { step: 2, description: "Inner loop: j = 1", variables: { i: 1, j: 1 }, output: "", highlight: "j = 1" },
          { step: 3, description: "Print (1,1)", variables: { i: 1, j: 1 }, output: "(1,1) ", highlight: "printf" },
          { step: 4, description: "Inner loop: j++", variables: { i: 1, j: 2 }, output: "(1,1) ", highlight: "j++" },
          { step: 5, description: "Print (1,2)", variables: { i: 1, j: 2 }, output: "(1,1) (1,2) ", highlight: "printf" },
          { step: 6, description: "Inner loop: j++", variables: { i: 1, j: 3 }, output: "(1,1) (1,2) ", highlight: "j++" },
          { step: 7, description: "Print (1,3)", variables: { i: 1, j: 3 }, output: "(1,1) (1,2) (1,3) ", highlight: "printf" },
          { step: 8, description: "Inner loop ends, print newline", variables: { i: 1, j: 4 }, output: "(1,1) (1,2) (1,3) \\n", highlight: "printf" },
          { step: 9, description: "Outer loop: i++", variables: { i: 2, j: 4 }, output: "(1,1) (1,2) (1,3) \\n", highlight: "i++" },
          { step: 10, description: "Inner loop: j = 1", variables: { i: 2, j: 1 }, output: "(1,1) (1,2) (1,3) \\n", highlight: "j = 1" },
          { step: 11, description: "Print (2,1)", variables: { i: 2, j: 1 }, output: "(1,1) (1,2) (1,3) \\n(2,1) ", highlight: "printf" },
          { step: 12, description: "Inner loop: j++", variables: { i: 2, j: 2 }, output: "(1,1) (1,2) (1,3) \\n(2,1) ", highlight: "j++" },
          { step: 13, description: "Print (2,2)", variables: { i: 2, j: 2 }, output: "(1,1) (1,2) (1,3) \\n(2,1) (2,2) ", highlight: "printf" },
          { step: 14, description: "Inner loop: j++", variables: { i: 2, j: 3 }, output: "(1,1) (1,2) (1,3) \\n(2,1) (2,2) ", highlight: "j++" },
          { step: 15, description: "Print (2,3)", variables: { i: 2, j: 3 }, output: "(1,1) (1,2) (1,3) \\n(2,1) (2,2) (2,3) ", highlight: "printf" },
          { step: 16, description: "Inner loop ends, print newline", variables: { i: 2, j: 4 }, output: "(1,1) (1,2) (1,3) \\n(2,1) (2,2) (2,3) \\n", highlight: "printf" },
          { step: 17, description: "Outer loop: i++", variables: { i: 3, j: 4 }, output: "(1,1) (1,2) (1,3) \\n(2,1) (2,2) (2,3) \\n", highlight: "i++" },
          { step: 18, description: "Inner loop: j = 1", variables: { i: 3, j: 1 }, output: "(1,1) (1,2) (1,3) \\n(2,1) (2,2) (2,3) \\n", highlight: "j = 1" },
          { step: 19, description: "Print (3,1)", variables: { i: 3, j: 1 }, output: "(1,1) (1,2) (1,3) \\n(2,1) (2,2) (2,3) \\n(3,1) ", highlight: "printf" },
          { step: 20, description: "Inner loop: j++", variables: { i: 3, j: 2 }, output: "(1,1) (1,2) (1,3) \\n(2,1) (2,2) (2,3) \\n(3,1) ", highlight: "j++" },
          { step: 21, description: "Print (3,2)", variables: { i: 3, j: 2 }, output: "(1,1) (1,2) (1,3) \\n(2,1) (2,2) (2,3) \\n(3,1) (3,2) ", highlight: "printf" },
          { step: 22, description: "Inner loop: j++", variables: { i: 3, j: 3 }, output: "(1,1) (1,2) (1,3) \\n(2,1) (2,2) (2,3) \\n(3,1) (3,2) ", highlight: "j++" },
          { step: 23, description: "Print (3,3)", variables: { i: 3, j: 3 }, output: "(1,1) (1,2) (1,3) \\n(2,1) (2,2) (2,3) \\n(3,1) (3,2) (3,3) ", highlight: "printf" },
          { step: 24, description: "Inner loop ends, print newline", variables: { i: 3, j: 4 }, output: "(1,1) (1,2) (1,3) \\n(2,1) (2,2) (2,3) \\n(3,1) (3,2) (3,3) \\n", highlight: "printf" },
          { step: 25, description: "Outer loop ends", variables: { i: 4, j: 4 }, output: "(1,1) (1,2) (1,3) \\n(2,1) (2,2) (2,3) \\n(3,1) (3,2) (3,3) \\n", highlight: "" }
        ]
      }
    };
  }
  
  init() {
    this.setupEventListeners();
    this.updateDisplay();
  }
  
  setupEventListeners() {
    const loopSelect = this.container.querySelector('#loop-type-select');
    const startBtn = this.container.querySelector('#start-visualization');
    const stepBtn = this.container.querySelector('#step-visualization');
    const resetBtn = this.container.querySelector('#reset-visualization');
    
    if (loopSelect) {
      loopSelect.addEventListener('change', (e) => {
        this.currentLoopType = e.target.value;
        this.reset();
        this.updateDisplay();
      });
    }
    
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startVisualization());
    }
    
    if (stepBtn) {
      stepBtn.addEventListener('click', () => this.stepForward());
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }
  }
  
  updateDisplay() {
    const config = this.loopConfigs[this.currentLoopType];
    const codeDisplay = this.container.querySelector('#current-loop-code');
    
    if (codeDisplay) {
      codeDisplay.textContent = config.code;
    }
    
    this.updateExecutionState();
  }
  
  updateExecutionState() {
    const config = this.loopConfigs[this.currentLoopType];
    const currentStepData = config.steps[this.currentStep] || config.steps[config.steps.length - 1];
    
    const variablesDiv = this.container.querySelector('#loop-variables');
    const outputDiv = this.container.querySelector('#loop-output');
    const stepDiv = this.container.querySelector('#current-step');
    
    if (variablesDiv) {
      variablesDiv.innerHTML = '';
      Object.entries(currentStepData.variables).forEach(([name, value]) => {
        const varItem = document.createElement('div');
        varItem.className = 'variable-item';
        varItem.innerHTML = `
          <span class="variable-name">${name}:</span>
          <span class="variable-value">${value}</span>
        `;
        variablesDiv.appendChild(varItem);
      });
    }
    
    if (outputDiv) {
      outputDiv.textContent = currentStepData.output.replace(/\\n/g, '\n');
    }
    
    if (stepDiv) {
      stepDiv.innerHTML = `
        <div class="execution-step">
          Step ${currentStepData.step}: ${currentStepData.description}
        </div>
      `;
    }
  }
  
  startVisualization() {
    if (this.isRunning) {
      this.pause();
      return;
    }
    
    this.isRunning = true;
    this.container.classList.add('loop-running');
    
    const startBtn = this.container.querySelector('#start-visualization');
    if (startBtn) startBtn.textContent = '⏸ Pause';
    
    this.intervalId = setInterval(() => {
      this.stepForward();
      if (this.currentStep >= this.loopConfigs[this.currentLoopType].steps.length - 1) {
        this.complete();
      }
    }, 1000);
  }
  
  pause() {
    this.isRunning = false;
    this.isPaused = true;
    this.container.classList.remove('loop-running');
    this.container.classList.add('loop-paused');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    const startBtn = this.container.querySelector('#start-visualization');
    if (startBtn) startBtn.textContent = '▶ Resume';
  }
  
  complete() {
    this.isRunning = false;
    this.container.classList.remove('loop-running', 'loop-paused');
    this.container.classList.add('loop-completed');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    const startBtn = this.container.querySelector('#start-visualization');
    if (startBtn) startBtn.textContent = '✓ Completed';
  }
  
  stepForward() {
    const config = this.loopConfigs[this.currentLoopType];
    if (this.currentStep < config.steps.length - 1) {
      this.currentStep++;
      this.updateExecutionState();
    }
  }
  
  reset() {
    this.currentStep = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.container.classList.remove('loop-running', 'loop-paused', 'loop-completed');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    const startBtn = this.container.querySelector('#start-visualization');
    if (startBtn) startBtn.textContent = '▶ Start';
    
    this.updateExecutionState();
  }
}

/**
 * Pattern Generator Widget - Interactive nested loop pattern creator
 */
class PatternGeneratorWidget {
  constructor(container) {
    this.container = container;
    this.currentPattern = 'triangle';
    this.currentSize = 5;
    this.currentChar = '*';
    this.patternsCreated = new Set();
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.generatePattern();
  }
  
  setupEventListeners() {
    const patternSelect = this.container.querySelector('#pattern-type');
    const sizeSlider = this.container.querySelector('#pattern-size');
    const charInput = this.container.querySelector('#pattern-char');
    const generateBtn = this.container.querySelector('#generate-pattern');
    const copyBtn = this.container.querySelector('.copy-btn');
    
    if (patternSelect) {
      patternSelect.addEventListener('change', (e) => {
        this.currentPattern = e.target.value;
        this.generatePattern();
      });
    }
    
    if (sizeSlider) {
      sizeSlider.addEventListener('input', (e) => {
        this.currentSize = parseInt(e.target.value);
        const sizeValue = this.container.querySelector('#size-value');
        if (sizeValue) sizeValue.textContent = this.currentSize;
        this.generatePattern();
      });
    }
    
    if (charInput) {
      charInput.addEventListener('input', (e) => {
        this.currentChar = e.target.value.charAt(0) || '*';
        this.generatePattern();
      });
    }
    
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generatePattern());
    }
    
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyCode());
    }
  }
  
  generatePattern() {
    const patternResult = this.container.querySelector('#pattern-result');
    const patternCode = this.container.querySelector('#pattern-code-output');
    
    if (!patternResult || !patternCode) return;
    
    this.container.classList.add('pattern-generating');
    
    setTimeout(() => {
      const { pattern, code } = this.createPattern();
      
      patternResult.textContent = pattern;
      patternCode.textContent = code;
      
      this.container.classList.remove('pattern-generating');
      this.container.classList.add('pattern-generated');
      
      // Track patterns created for badge progress
      this.patternsCreated.add(this.currentPattern);
      this.updateBadgeProgress();
      
      setTimeout(() => {
        this.container.classList.remove('pattern-generated');
      }, 300);
    }, 100);
  }
  
  createPattern() {
    switch (this.currentPattern) {
      case 'triangle':
        return this.createTriangle();
      case 'inverted-triangle':
        return this.createInvertedTriangle();
      case 'pyramid':
        return this.createPyramid();
      case 'diamond':
        return this.createDiamond();
      case 'multiplication':
        return this.createMultiplicationTable();
      default:
        return this.createTriangle();
    }
  }
  
  createTriangle() {
    let pattern = '';
    let code = `#include <stdio.h>

int main() {
    // Right triangle pattern
    for (int i = 1; i <= ${this.currentSize}; i++) {
        for (int j = 1; j <= i; j++) {
            printf("${this.currentChar} ");
        }
        printf("\\n");
    }
    return 0;
}`;
    
    for (let i = 1; i <= this.currentSize; i++) {
      for (let j = 1; j <= i; j++) {
        pattern += this.currentChar + ' ';
      }
      pattern += '\n';
    }
    
    return { pattern, code };
  }
  
  createInvertedTriangle() {
    let pattern = '';
    let code = `#include <stdio.h>

int main() {
    // Inverted triangle pattern
    for (int i = ${this.currentSize}; i >= 1; i--) {
        for (int j = 1; j <= i; j++) {
            printf("${this.currentChar} ");
        }
        printf("\\n");
    }
    return 0;
}`;
    
    for (let i = this.currentSize; i >= 1; i--) {
      for (let j = 1; j <= i; j++) {
        pattern += this.currentChar + ' ';
      }
      pattern += '\n';
    }
    
    return { pattern, code };
  }
  
  createPyramid() {
    let pattern = '';
    let code = `#include <stdio.h>

int main() {
    // Pyramid pattern
    for (int i = 1; i <= ${this.currentSize}; i++) {
        // Print spaces
        for (int j = 1; j <= ${this.currentSize} - i; j++) {
            printf(" ");
        }
        // Print characters
        for (int j = 1; j <= 2*i - 1; j++) {
            printf("${this.currentChar}");
        }
        printf("\\n");
    }
    return 0;
}`;
    
    for (let i = 1; i <= this.currentSize; i++) {
      // Add spaces
      for (let j = 1; j <= this.currentSize - i; j++) {
        pattern += ' ';
      }
      // Add characters
      for (let j = 1; j <= 2*i - 1; j++) {
        pattern += this.currentChar;
      }
      pattern += '\n';
    }
    
    return { pattern, code };
  }
  
  createDiamond() {
    let pattern = '';
    let code = `#include <stdio.h>

int main() {
    // Diamond pattern
    // Upper half
    for (int i = 1; i <= ${this.currentSize}; i++) {
        for (int j = 1; j <= ${this.currentSize} - i; j++) {
            printf(" ");
        }
        for (int j = 1; j <= 2*i - 1; j++) {
            printf("${this.currentChar}");
        }
        printf("\\n");
    }
    // Lower half
    for (int i = ${this.currentSize - 1}; i >= 1; i--) {
        for (int j = 1; j <= ${this.currentSize} - i; j++) {
            printf(" ");
        }
        for (int j = 1; j <= 2*i - 1; j++) {
            printf("${this.currentChar}");
        }
        printf("\\n");
    }
    return 0;
}`;
    
    // Upper half
    for (let i = 1; i <= this.currentSize; i++) {
      for (let j = 1; j <= this.currentSize - i; j++) {
        pattern += ' ';
      }
      for (let j = 1; j <= 2*i - 1; j++) {
        pattern += this.currentChar;
      }
      pattern += '\n';
    }
    // Lower half
    for (let i = this.currentSize - 1; i >= 1; i--) {
      for (let j = 1; j <= this.currentSize - i; j++) {
        pattern += ' ';
      }
      for (let j = 1; j <= 2*i - 1; j++) {
        pattern += this.currentChar;
      }
      pattern += '\n';
    }
    
    return { pattern, code };
  }
  
  createMultiplicationTable() {
    let pattern = '';
    let code = `#include <stdio.h>

int main() {
    // Multiplication table
    for (int i = 1; i <= ${this.currentSize}; i++) {
        for (int j = 1; j <= ${this.currentSize}; j++) {
            printf("%3d", i * j);
        }
        printf("\\n");
    }
    return 0;
}`;
    
    for (let i = 1; i <= this.currentSize; i++) {
      for (let j = 1; j <= this.currentSize; j++) {
        const product = i * j;
        pattern += product.toString().padStart(3, ' ');
      }
      pattern += '\n';
    }
    
    return { pattern, code };
  }
  
  copyCode() {
    const codeElement = this.container.querySelector('#pattern-code-output');
    if (codeElement) {
      navigator.clipboard.writeText(codeElement.textContent).then(() => {
        const copyBtn = this.container.querySelector('.copy-btn');
        if (copyBtn) {
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = '✓ Copied!';
          copyBtn.style.background = 'var(--good)';
          
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = 'var(--brand)';
          }, 2000);
        }
      });
    }
  }
  
  updateBadgeProgress() {
    const badgeItem = document.querySelector('[data-badge="pattern-artist"]');
    if (badgeItem) {
      const progressText = badgeItem.querySelector('.progress-text');
      const count = this.patternsCreated.size;
      
      if (progressText) {
        progressText.textContent = `${count}/5 patterns`;
      }
      
      if (count >= 5) {
        this.earnBadge('pattern-artist', 'Pattern Artist', 'Created 5 different patterns');
        badgeItem.classList.add('earned');
      }
    }
  }
  
  earnBadge(badgeId, name, description) {
    // Same badge earning logic as other widgets
    const badges = JSON.parse(localStorage.getItem('czh.badges') || '{}');
    if (!badges[badgeId]) {
      badges[badgeId] = {
        id: badgeId,
        name: name,
        description: description,
        earnedAt: new Date().toISOString(),
        chapter: 'loops'
      };
      localStorage.setItem('czh.badges', JSON.stringify(badges));
      
      this.showBadgeNotification(name, description);
    }
  }
  
  showBadgeNotification(name, description) {
    // Create and show badge notification
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
      <div class="badge-notification-content">
        <div class="badge-icon">🏆</div>
        <div>
          <strong>Badge Earned!</strong><br>
          <em>${name}</em><br>
          <small>${description}</small>
        </div>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--good);
      color: white;
      padding: 1rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--elev);
      z-index: 10000;
      animation: slideInRight 0.5s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

/**
 * Initialize Enhanced Quiz for Chapter 4: Loops
 */
function initializeLoopsQuiz() {
  const quizSection = document.querySelector('#loops-quiz');
  if (!quizSection) return;
  
  const quizQuestions = [
    {
      id: 1,
      question: "What happens first in a for loop?",
      type: "multiple-choice",
      topic: "for-loops",
      options: [
        "The condition is checked",
        "The initialization statement runs",
        "The update statement runs", 
        "The loop body executes"
      ],
      correct: 1,
      explanation: "In a for loop, the initialization statement runs first, only once at the beginning."
    },
    {
      id: 2, 
      question: "How many times will this loop run?\n\nfor (int i = 1; i <= 10; i++) {\n    printf(\"%d \", i);\n}",
      type: "multiple-choice",
      topic: "for-loops",
      options: ["9 times", "10 times", "11 times", "Infinite times"],
      correct: 1,
      explanation: "The loop runs while i <= 10, starting from i=1, so it runs exactly 10 times (1,2,3,4,5,6,7,8,9,10)."
    },
    {
      id: 3,
      question: "What's the main difference between while and do-while loops?",
      type: "multiple-choice", 
      topic: "while-loops",
      options: [
        "while is faster than do-while",
        "do-while executes at least once, while may not execute at all",
        "while can only use integer conditions",
        "There is no difference"
      ],
      correct: 1,
      explanation: "do-while executes the body first, then checks the condition, so it always runs at least once."
    },
    {
      id: 4,
      question: "What will this code output?\n\nint i = 5;\nwhile (i > 0) {\n    printf(\"%d \", i);\n    i--;\n}",
      type: "multiple-choice",
      topic: "while-loops", 
      options: [
        "5 4 3 2 1",
        "5 4 3 2 1 0", 
        "1 2 3 4 5",
        "Infinite loop"
      ],
      correct: 0,
      explanation: "The loop starts with i=5 and decrements until i=0, printing 5 4 3 2 1."
    },
    {
      id: 5,
      question: "What does the 'break' statement do in a loop?", 
      type: "multiple-choice",
      topic: "break-continue",
      options: [
        "Skips the current iteration and continues with the next",
        "Pauses the loop for a specified time",
        "Immediately exits the loop entirely", 
        "Restarts the loop from the beginning"
      ],
      correct: 2,
      explanation: "The 'break' statement immediately terminates the loop and continues execution after the loop."
    },
    {
      id: 6,
      question: "What does the 'continue' statement do in a loop?",
      type: "multiple-choice",
      topic: "break-continue", 
      options: [
        "Exits the loop immediately",
        "Skips the rest of the current iteration and moves to the next iteration",
        "Repeats the current iteration",
        "Pauses the loop execution"
      ],
      correct: 1,
      explanation: "The 'continue' statement skips the remaining code in the current iteration and jumps to the next iteration."
    },
    {
      id: 7,
      question: "In nested loops, how many total iterations occur?\n\nfor (int i = 1; i <= 3; i++) {\n    for (int j = 1; j <= 4; j++) {\n        printf(\"*\");\n    }\n}",
      type: "multiple-choice",
      topic: "nested-loops",
      options: ["7 iterations", "12 iterations", "3 iterations", "4 iterations"],
      correct: 1, 
      explanation: "Outer loop runs 3 times, inner loop runs 4 times for each outer iteration: 3 × 4 = 12 total iterations."
    },
    {
      id: 8,
      question: "Which loop type is best for input validation?",
      type: "multiple-choice",
      topic: "while-loops",
      options: [
        "for loop - because it has a built-in counter",
        "while loop - because you don't know how many attempts are needed", 
        "do-while loop - because it always validates at least once",
        "All loops are equally good for validation"
      ],
      correct: 1,
      explanation: "while loops are ideal for input validation because you repeat until valid input is received, and you don't know how many attempts that will take."
    },
    {
      id: 9,
      question: "What will happen with this code?\n\nfor (int i = 0; i < 5; i++)\n    printf(\"%d \", i);\n    printf(\"Done\");",
      type: "multiple-choice",
      topic: "for-loops",
      options: [
        "Prints: 0 1 2 3 4 Done",
        "Prints: 0 1 2 3 4 Done Done Done Done Done",
        "Syntax error",
        "Infinite loop"
      ],
      correct: 0,
      explanation: "Without braces, only the first printf is in the loop body. The second printf executes once after the loop completes."
    },
    {
      id: 10,
      question: "How do you create an infinite loop in C?",
      type: "multiple-choice", 
      topic: "while-loops",
      options: [
        "for (;;) or while(1)",
        "while(0)",
        "for(int i=0; i<10; i--)",
        "You cannot create infinite loops in C"
      ],
      correct: 0,
      explanation: "for(;;) or while(1) creates infinite loops. while(1) uses a condition that's always true, and for(;;) has empty initialization, condition, and update."
    }
  ];
  
  // Set up enhanced quiz functionality
  const startBtn = quizSection.querySelector('#start-quiz');
  const nextBtn = quizSection.querySelector('#next-question');
  const submitBtn = quizSection.querySelector('#submit-quiz');
  const restartBtn = quizSection.querySelector('#restart-quiz');
  const questionsContainer = quizSection.querySelector('#quiz-questions');
  const resultsContainer = quizSection.querySelector('#quiz-results');
  
  let currentQuestion = 0;
  let userAnswers = {};
  let quizStarted = false;
  
  function startQuiz() {
    quizStarted = true;
    currentQuestion = 0;
    userAnswers = {};
    
    startBtn.style.display = 'none';
    nextBtn.style.display = 'inline-block';
    resultsContainer.style.display = 'none';
    restartBtn.style.display = 'none';
    
    showQuestion(currentQuestion);
  }
  
  function showQuestion(index) {
    if (index >= quizQuestions.length) {
      showSubmitButton();
      return;
    }
    
    const question = quizQuestions[index];
    questionsContainer.innerHTML = `
      <div class="question-container">
        <div class="question-header">
          <span class="question-number">Question ${index + 1} of ${quizQuestions.length}</span>
          <span class="question-topic">${question.topic.replace('-', ' ').toUpperCase()}</span>
        </div>
        <h3 class="question-text">${question.question.replace(/\n/g, '<br>')}</h3>
        <div class="options-container">
          ${question.options.map((option, i) => `
            <label class="option-label">
              <input type="radio" name="question-${question.id}" value="${i}" class="option-input">
              <span class="option-text">${option}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
    
    // Update button states
    nextBtn.style.display = index < quizQuestions.length - 1 ? 'inline-block' : 'none';
    submitBtn.style.display = index === quizQuestions.length - 1 ? 'inline-block' : 'none';
  }
  
  function showSubmitButton() {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'inline-block';
  }
  
  function nextQuestion() {
    // Save current answer
    const selectedOption = questionsContainer.querySelector('input[type="radio"]:checked');
    if (selectedOption) {
      userAnswers[quizQuestions[currentQuestion].id] = parseInt(selectedOption.value);
    }
    
    currentQuestion++;
    showQuestion(currentQuestion);
  }
  
  function submitQuiz() {
    // Save final answer
    const selectedOption = questionsContainer.querySelector('input[type="radio"]:checked');
    if (selectedOption) {
      userAnswers[quizQuestions[currentQuestion].id] = parseInt(selectedOption.value);
    }
    
    // Calculate results
    const results = calculateResults();
    showResults(results);
    updateBadges(results);
  }
  
  function calculateResults() {
    let correct = 0;
    const topicScores = {};
    const questionResults = [];
    
    quizQuestions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      const isCorrect = userAnswer === question.correct;
      
      if (isCorrect) correct++;
      
      if (!topicScores[question.topic]) {
        topicScores[question.topic] = { correct: 0, total: 0 };
      }
      topicScores[question.topic].total++;
      if (isCorrect) topicScores[question.topic].correct++;
      
      questionResults.push({
        question: question,
        userAnswer: userAnswer,
        isCorrect: isCorrect
      });
    });
    
    const score = Math.round((correct / quizQuestions.length) * 100);
    
    return {
      score: score,
      correct: correct,
      total: quizQuestions.length,
      topicScores: topicScores,
      questionResults: questionResults
    };
  }
  
  function showResults(results) {
    questionsContainer.style.display = 'none';
    submitBtn.style.display = 'none';
    resultsContainer.style.display = 'block';
    restartBtn.style.display = 'inline-block';
    
    // Update score display
    const scoreElement = resultsContainer.querySelector('#final-score');
    if (scoreElement) {
      scoreElement.textContent = results.score;
      scoreElement.className = `score-number ${results.score >= 80 ? 'excellent' : results.score >= 60 ? 'good' : 'needs-improvement'}`;
    }
    
    // Show performance breakdown
    const breakdownElement = resultsContainer.querySelector('#performance-breakdown');
    if (breakdownElement) {
      let performanceText = '';
      if (results.score >= 90) performanceText = '🏆 Excellent! Loop mastery achieved!';
      else if (results.score >= 80) performanceText = '🎯 Great job! Strong loop understanding!';
      else if (results.score >= 60) performanceText = '📚 Good work! Review the areas below.';
      else performanceText = '🔄 Keep practicing! Loops take time to master.';
      
      breakdownElement.innerHTML = `<p>${performanceText}</p>`;
    }
    
    // Show topic analysis
    const topicScoresElement = resultsContainer.querySelector('#topic-scores');
    if (topicScoresElement) {
      topicScoresElement.innerHTML = '';
      Object.entries(results.topicScores).forEach(([topic, scores]) => {
        const percentage = Math.round((scores.correct / scores.total) * 100);
        const topicDiv = document.createElement('div');
        topicDiv.className = 'topic-score-item';
        topicDiv.innerHTML = `
          <span class="topic-name">${topic.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
          <span class="topic-score ${percentage >= 80 ? 'excellent' : percentage >= 60 ? 'good' : 'needs-work'}">${scores.correct}/${scores.total} (${percentage}%)</span>
        `;
        topicScoresElement.appendChild(topicDiv);
      });
    }
    
    // Show recommendations
    const recommendationsElement = resultsContainer.querySelector('#recommendation-list');
    if (recommendationsElement) {
      const recommendations = generateRecommendations(results);
      recommendationsElement.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
    }
    
    // Save progress
    saveQuizProgress('loops', results);
  }
  
  function generateRecommendations(results) {
    const recommendations = [];
    
    Object.entries(results.topicScores).forEach(([topic, scores]) => {
      const percentage = (scores.correct / scores.total) * 100;
      
      if (percentage < 60) {
        switch (topic) {
          case 'for-loops':
            recommendations.push('Review for loop syntax and initialization → condition → update pattern');
            break;
          case 'while-loops':
            recommendations.push('Practice while loop condition checking and preventing infinite loops');
            break;
          case 'break-continue':
            recommendations.push('Study the difference between break (exit loop) and continue (skip iteration)');
            break;
          case 'nested-loops':
            recommendations.push('Work through nested loop examples step by step to understand iteration counts');
            break;
        }
      }
    });
    
    if (results.score >= 90) {
      recommendations.push('🎉 Excellent work! Try the advanced practice problems to challenge yourself further.');
    } else if (results.score >= 80) {
      recommendations.push('Great job! Practice the pattern generation problems to strengthen your nested loop skills.');
    } else if (results.score >= 60) {
      recommendations.push('Good foundation! Review the common errors section and practice more loop examples.');
    } else {
      recommendations.push('Take time to work through each loop type systematically. Start with simple for loops and build up.');
    }
    
    return recommendations;
  }
  
  function updateBadges(results) {
    const badges = JSON.parse(localStorage.getItem('czh.badges') || '{}');
    let newBadges = false;
    
    // Loop Beginner Badge
    if (!badges['loop-beginner']) {
      badges['loop-beginner'] = {
        id: 'loop-beginner',
        name: 'Loop Beginner',
        description: 'Completed first loop quiz',
        earnedAt: new Date().toISOString(),
        chapter: 'loops'
      };
      newBadges = true;
      showBadgeNotification('Loop Beginner', 'Completed first loop quiz');
    }
    
    // For Loop Master Badge
    const forLoopScore = results.topicScores['for-loops'];
    if (forLoopScore && (forLoopScore.correct / forLoopScore.total) >= 0.8 && !badges['for-master']) {
      badges['for-master'] = {
        id: 'for-master',
        name: 'For Loop Master',
        description: 'Scored 80%+ on for loop questions',
        earnedAt: new Date().toISOString(),
        chapter: 'loops'
      };
      newBadges = true;
      showBadgeNotification('For Loop Master', 'Scored 80%+ on for loop questions');
    }
    
    // While Loop Wizard Badge
    const whileLoopScore = results.topicScores['while-loops'];
    if (whileLoopScore && (whileLoopScore.correct / whileLoopScore.total) >= 0.8 && !badges['while-wizard']) {
      badges['while-wizard'] = {
        id: 'while-wizard',
        name: 'While Loop Wizard',
        description: 'Scored 80%+ on while loop questions',
        earnedAt: new Date().toISOString(),
        chapter: 'loops'
      };
      newBadges = true;
      showBadgeNotification('While Loop Wizard', 'Scored 80%+ on while loop questions');
    }
    
    // Nested Loop Ninja Badge
    const nestedLoopScore = results.topicScores['nested-loops'];
    if (nestedLoopScore && (nestedLoopScore.correct / nestedLoopScore.total) >= 0.8 && !badges['nested-ninja']) {
      badges['nested-ninja'] = {
        id: 'nested-ninja', 
        name: 'Nested Loop Ninja',
        description: 'Scored 80%+ on nested loop questions',
        earnedAt: new Date().toISOString(),
        chapter: 'loops'
      };
      newBadges = true;
      showBadgeNotification('Nested Loop Ninja', 'Scored 80%+ on nested loop questions');
    }
    
    // Loop Legend Badge (perfect score)
    if (results.score === 100 && !badges['loop-legend']) {
      badges['loop-legend'] = {
        id: 'loop-legend',
        name: 'Loop Legend', 
        description: 'Perfect score on loops quiz',
        earnedAt: new Date().toISOString(),
        chapter: 'loops'
      };
      newBadges = true;
      showBadgeNotification('Loop Legend', 'Perfect score on loops quiz');
    }
    
    if (newBadges) {
      localStorage.setItem('czh.badges', JSON.stringify(badges));
      updateBadgeDisplay();
    }
  }
  
  function showBadgeNotification(name, description) {
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
      <div class="badge-notification-content">
        <div class="badge-icon">🏆</div>
        <div>
          <strong>Badge Earned!</strong><br>
          <em>${name}</em><br>
          <small>${description}</small>
        </div>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--good);
      color: white;
      padding: 1rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--elev);
      z-index: 10000;
      animation: slideInRight 0.5s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
  
  function updateBadgeDisplay() {
    const badges = JSON.parse(localStorage.getItem('czh.badges') || '{}');
    
    // Update badge items on page
    Object.keys(badges).forEach(badgeId => {
      const badgeItem = document.querySelector(`[data-badge="${badgeId}"]`);
      if (badgeItem) {
        badgeItem.classList.add('earned');
        const progressText = badgeItem.querySelector('.progress-text');
        if (progressText) {
          progressText.textContent = 'Earned!';
        }
      }
    });
  }
  
  function saveQuizProgress(chapter, results) {
    const progress = JSON.parse(localStorage.getItem('czh.progress') || '{}');
    if (!progress.quizzes) progress.quizzes = {};
    
    progress.quizzes[chapter] = {
      score: results.score,
      completedAt: new Date().toISOString(),
      topicScores: results.topicScores
    };
    
    localStorage.setItem('czh.progress', JSON.stringify(progress));
  }
  
  function restartQuiz() {
    questionsContainer.style.display = 'block';
    resultsContainer.style.display = 'none';
    restartBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    
    currentQuestion = 0;
    userAnswers = {};
    quizStarted = false;
  }
  
  // Event listeners
  if (startBtn) startBtn.addEventListener('click', startQuiz);
  if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
  if (submitBtn) submitBtn.addEventListener('click', submitQuiz);
  if (restartBtn) restartBtn.addEventListener('click', restartQuiz);
  
  // Load existing badge states
  updateBadgeDisplay();
}

// Initialize quizzes when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize quiz widgets
  const quizContainers = document.querySelectorAll('.quiz');
  quizContainers.forEach(container => {
    new QuizWidget(container);
  });
  
  // Initialize timeline widgets
  const timelineContainers = document.querySelectorAll('.timeline-container');
  timelineContainers.forEach(container => {
    new TimelineWidget(container);
  });
  
  // Initialize memory visualizer widgets
  const memoryVisualizers = document.querySelectorAll('.memory-visualizer');
  memoryVisualizers.forEach(container => {
    new MemoryVisualizerWidget(container);
  });
  
  // Initialize decision visualizer widgets
  const decisionVisualizers = document.querySelectorAll('.decision-visualizer');
  decisionVisualizers.forEach(container => {
    new DecisionVisualizerWidget(container);
  });
  
  // Initialize loop visualizer widgets
  const loopVisualizers = document.querySelectorAll('.loop-visualizer');
  loopVisualizers.forEach(container => {
    new LoopVisualizerWidget(container);
  });
  
  // Initialize pattern generator widgets
  const patternGenerators = document.querySelectorAll('.pattern-generator');
  patternGenerators.forEach(container => {
    new PatternGeneratorWidget(container);
  });
  
  // Initialize enhanced quiz for loops (Chapter 4)
  if (window.location.pathname.includes('04-loops.html')) {
    initializeLoopsQuiz();
  }
  
  // Show existing badges in footer on page load
  const badges = JSON.parse(localStorage.getItem('czh.badges') || '{}');
  if (Object.keys(badges).length > 0) {
    const footer = document.querySelector('footer');
    if (footer) {
      let badgeDisplay = footer.querySelector('.badge-display');
      if (!badgeDisplay) {
        badgeDisplay = document.createElement('div');
        badgeDisplay.className = 'badge-display';
        badgeDisplay.style.marginTop = '1rem';
        footer.appendChild(badgeDisplay);
      }
      
      const badgeCount = Object.keys(badges).length;
      const badgeNames = Object.values(badges).map(b => b.name).join(', ');
      badgeDisplay.innerHTML = `<small style="color: var(--muted);">🏆 Earned badges (${badgeCount}): ${badgeNames}</small>`;
    }
  }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuizWidget;
}