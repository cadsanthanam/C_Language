// C Programming Zero to Hero - JavaScript

class App {
  constructor() {
    this.sidebar = document.querySelector('.sidebar');
    this.searchInput = document.querySelector('.search-input');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.navGroups = document.querySelectorAll('.nav-group');
    this.copyButtons = document.querySelectorAll('.copy-btn');
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupScrollSpy();
    this.setupSearch();
    this.setupKeyboardShortcuts();
    this.setupCodeBlocks();
    this.restoreState();
  }
  
  setupEventListeners() {
    // Collapsible nav groups
    this.navGroups.forEach(group => {
      const header = group.querySelector('.nav-group-header');
      if (header) {
        header.addEventListener('click', () => {
          this.toggleNavGroup(group);
        });
      }
    });
    
    // Mobile sidebar toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }
    
    // Copy buttons
    this.copyButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.copyCode(e.target);
      });
    });
    
    // Close mobile sidebar when clicking nav link
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          this.sidebar.classList.remove('open');
        }
      });
    });
  }
  
  setupScrollSpy() {
    const sections = document.querySelectorAll('section[id], article[id], h2[id], h3[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const observerOptions = {
      rootMargin: '-20% 0px -80% 0px',
      threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
          
          // Remove active class from all links
          navLinks.forEach(link => link.classList.remove('active'));
          
          // Add active class to current link
          if (activeLink) {
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
          }
        }
      });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
  }
  
  setupSearch() {
    if (!this.searchInput) return;
    
    this.searchInput.addEventListener('input', (e) => {
      this.filterNavigation(e.target.value);
    });
    
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.searchInput.value = '';
        this.filterNavigation('');
        this.searchInput.blur();
      }
    });
  }
  
  filterNavigation(query) {
    const links = document.querySelectorAll('.nav-link');
    const groups = document.querySelectorAll('.nav-group');
    
    if (!query.trim()) {
      // Show all links and groups
      links.forEach(link => {
        link.style.display = 'block';
      });
      groups.forEach(group => {
        group.style.display = 'block';
      });
      return;
    }
    
    const searchTerm = query.toLowerCase();
    
    groups.forEach(group => {
      const groupLinks = group.querySelectorAll('.nav-link');
      let hasVisibleLinks = false;
      
      groupLinks.forEach(link => {
        const text = link.textContent.toLowerCase();
        const isMatch = text.includes(searchTerm);
        
        link.style.display = isMatch ? 'block' : 'none';
        if (isMatch) hasVisibleLinks = true;
      });
      
      group.style.display = hasVisibleLinks ? 'block' : 'none';
    });
  }
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Focus search with '/'
      if (e.key === '/' && !this.isInputFocused()) {
        e.preventDefault();
        this.searchInput?.focus();
        return;
      }
      
      // Toggle sidebar with 't'
      if (e.key === 't' && !this.isInputFocused()) {
        e.preventDefault();
        this.toggleSidebar();
        return;
      }
      
      // Navigate with 'n' and 'p'
      if ((e.key === 'n' || e.key === 'p') && !this.isInputFocused()) {
        e.preventDefault();
        this.navigatePage(e.key === 'n' ? 'next' : 'prev');
        return;
      }
    });
  }
  
  setupCodeBlocks() {
    // Add copy buttons to code blocks
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
      const pre = block.parentElement;
      if (pre.querySelector('.copy-btn')) return; // Already has button
      
      const button = document.createElement('button');
      button.className = 'copy-btn';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      
      const header = document.createElement('div');
      header.className = 'code-header';
      header.appendChild(button);
      
      pre.style.position = 'relative';
      pre.appendChild(header);
      
      button.addEventListener('click', () => {
        this.copyCode(button);
      });
    });
  }
  
  toggleNavGroup(group) {
    const isCollapsed = group.classList.contains('collapsed');
    group.classList.toggle('collapsed');
    
    const header = group.querySelector('.nav-group-header');
    if (header) {
      header.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
    }
    
    this.saveState();
  }
  
  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.sidebar.classList.toggle('open');
    }
  }
  
  copyCode(button) {
    const pre = button.closest('pre');
    const code = pre.querySelector('code');
    const text = code.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.style.background = 'var(--success)';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
      }, 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = 'Copy';
      }, 2000);
    });
  }
  
  navigatePage(direction) {
    const currentLink = document.querySelector('.nav-link.active');
    if (!currentLink) return;
    
    const allLinks = Array.from(document.querySelectorAll('.nav-link'));
    const currentIndex = allLinks.indexOf(currentLink);
    
    let nextIndex;
    if (direction === 'next') {
      nextIndex = currentIndex + 1;
    } else {
      nextIndex = currentIndex - 1;
    }
    
    if (nextIndex >= 0 && nextIndex < allLinks.length) {
      const nextLink = allLinks[nextIndex];
      if (nextLink.href) {
        window.location.href = nextLink.href;
      }
    }
  }
  
  saveState() {
    const collapsedGroups = Array.from(document.querySelectorAll('.nav-group.collapsed'))
      .map(group => group.dataset.group || group.querySelector('.nav-group-header')?.textContent?.trim())
      .filter(Boolean);
    
    localStorage.setItem('nav-collapsed', JSON.stringify(collapsedGroups));
  }
  
  restoreState() {
    try {
      const collapsed = JSON.parse(localStorage.getItem('nav-collapsed') || '[]');
      
      collapsed.forEach(groupName => {
        const group = Array.from(document.querySelectorAll('.nav-group'))
          .find(g => {
            const header = g.querySelector('.nav-group-header');
            return header && header.textContent.trim() === groupName;
          });
        
        if (group) {
          group.classList.add('collapsed');
          const header = group.querySelector('.nav-group-header');
          if (header) {
            header.setAttribute('aria-expanded', 'false');
          }
        }
      });
    } catch (e) {
      console.warn('Failed to restore navigation state:', e);
    }
  }
  
  isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    );
  }
}

// Utility functions
function createDiagram(container, type, data) {
  // Simple SVG diagram generator
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 400 200');
  svg.setAttribute('class', `diagram diagram-${type}`);
  
  switch (type) {
    case 'memory':
      createMemoryDiagram(svg, data);
      break;
    case 'array':
      createArrayDiagram(svg, data);
      break;
    case 'pointer':
      createPointerDiagram(svg, data);
      break;
    case 'loop':
      createLoopDiagram(svg, data);
      break;
  }
  
  container.appendChild(svg);
}

function createMemoryDiagram(svg, data) {
  // Create memory boxes
  data.variables.forEach((variable, index) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', 50);
    rect.setAttribute('y', 50 + (index * 40));
    rect.setAttribute('width', 100);
    rect.setAttribute('height', 30);
    rect.setAttribute('fill', 'var(--tertiary-bg)');
    rect.setAttribute('stroke', 'var(--border)');
    svg.appendChild(rect);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', 100);
    text.setAttribute('y', 70 + (index * 40));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'var(--text-primary)');
    text.textContent = `${variable.name}: ${variable.value}`;
    svg.appendChild(text);
  });
}

// Index Page functionality for the main landing page
class IndexPage {
  constructor() {
    this.sidebar = document.getElementById('sidebar');
    this.menuBtn = document.getElementById('menuBtn');
    this.searchBox = document.getElementById('searchBox');
    this.navGroups = document.querySelectorAll('.nav-group');
    this.navLinks = Array.from(document.querySelectorAll('nav .nav-list a'));
    this.sections = this.navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    
    if (this.isIndexPage()) {
      this.init();
    }
  }
  
  isIndexPage() {
    return document.body.classList.contains('index-layout') || 
           document.querySelector('.topbar') || 
           document.querySelector('.index-nav');
  }
  
  init() {
    this.setupSidebarAccordion();
    this.setupActiveHighlight();
    this.setupSmoothScroll();
    this.setupMobileSidebar();
    this.setupSearch();
    this.setupKeyboardShortcuts();
  }
  
  setupSidebarAccordion() {
    this.navGroups.forEach(group => {
      const title = group.querySelector('.nav-title');
      const list = group.querySelector('.nav-list');
      const isOpen = group.getAttribute('data-open') === 'true';
      
      if (isOpen && list) {
        list.style.maxHeight = list.scrollHeight + 'px';
      }
      
      if (title) {
        title.addEventListener('click', () => {
          const expanded = title.getAttribute('aria-expanded') === 'true';
          title.setAttribute('aria-expanded', String(!expanded));
          
          if (list) {
            if (list.style.maxHeight) {
              list.style.maxHeight = null;
            } else {
              list.style.maxHeight = list.scrollHeight + 'px';
            }
          }
        });
      }
    });
  }
  
  setupActiveHighlight() {
    const onScroll = () => {
      let idx = this.sections.findIndex((sec, i) => sec && sec.getBoundingClientRect().top > 100) - 1;
      if (idx < 0) idx = this.sections.length - 1;
      
      this.navLinks.forEach(l => l.classList.remove('active'));
      const active = this.navLinks[idx];
      if (active) active.classList.add('active');
    };
    
    document.addEventListener('scroll', onScroll, { passive: true });
  }
  
  setupSmoothScroll() {
    this.navLinks.forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const id = a.getAttribute('href');
        const el = document.querySelector(id);
        
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        if (window.innerWidth <= 1024 && this.sidebar) {
          this.sidebar.classList.remove('open');
        }
        
        history.replaceState(null, '', id);
      });
    });
  }
  
  setupMobileSidebar() {
    if (this.menuBtn && this.sidebar) {
      this.menuBtn.addEventListener('click', () => {
        this.sidebar.classList.toggle('open');
      });
    }
  }
  
  setupSearch() {
    if (!this.searchBox) return;
    
    const filter = () => {
      const query = this.searchBox.value.trim().toLowerCase();
      document.querySelectorAll('nav .nav-list a').forEach(a => {
        a.style.display = a.textContent.toLowerCase().includes(query) ? '' : 'none';
      });
    };
    
    this.searchBox.addEventListener('input', filter);
  }
  
  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const isInputFocused = document.activeElement && 
        (document.activeElement.tagName === 'INPUT' || 
         document.activeElement.tagName === 'TEXTAREA');
      
      // Focus search with '/'
      if (e.key === '/' && !isInputFocused && this.searchBox) {
        e.preventDefault();
        this.searchBox.focus();
        this.searchBox.select();
        return;
      }
      
      // Toggle sidebar with 't'
      if (e.key.toLowerCase() === 't' && !isInputFocused && this.sidebar) {
        e.preventDefault();
        this.sidebar.classList.toggle('open');
        return;
      }
      
      // Navigate with 'n' and 'p'
      if (['n', 'p'].includes(e.key.toLowerCase()) && !isInputFocused) {
        e.preventDefault();
        const visible = this.navLinks.filter(a => a.offsetParent !== null);
        const current = visible.findIndex(a => a.classList.contains('active'));
        
        let next = e.key.toLowerCase() === 'n' ? current + 1 : current - 1;
        if (next < 0) next = visible.length - 1;
        if (next >= visible.length) next = 0;
        
        if (visible[next]) {
          visible[next].click();
        }
      }
    });
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize chapter page app
  if (document.querySelector('.sidebar:not(.index-nav)')) {
    new App();
  }
  
  // Initialize index page app
  new IndexPage();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}