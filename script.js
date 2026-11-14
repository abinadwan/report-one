/**
 * RETAILPULSE - Dashboard Logic & Interactions
 * Arabic Data Analytics Platform for Retail Businesses
 * 
 * Features:
 * - Chart.js visualization with sample data
 * - Theme toggling (Light/Dark mode)
 * - File upload modal handling
 * - Toast notification system
 * - KPI card value simulation
 */

/* =========================================
   GLOBAL VARIABLES & STATE MANAGEMENT
   ========================================= */
const APP_CONFIG = {
    primaryColor: '#4F46E5',
    successColor: '#10B981',
    warningColor: '#F59E0B'
};

const CHART_CONFIG = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                font: {
                    family: 'Tajawal',
                    size: 14
                }
            }
        }
    },
    scales: {
        x: {
            grid: {
                display: false,
                drawBorder: false
            },
            ticks: {
                font: {
                    family: 'Tajawal',
                    weight: 500
                }
            }
        },
        y: {
            grid: {
                color: 'rgba(128, 128, 128, 0.1)',
                borderDash: [4, 4],
                drawBorder: false
            },
            ticks: {
                font: {
                    family: 'Tajawal',
                    weight: 500
                }
            }
        }
    }
};

/* =========================================
   INITIALIZATION FUNCTIONS
   ========================================= */

/**
 * Initialize the dashboard when DOM content is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 RetailPulse - Dashboard initialized');
    
    // Initialize all components
    initThemeToggle();
    initializeSalesChart();
    setupNavigation();
    setupUploadModal();
    setupToastNotifications();
    simulateKPIUpdates();
});

/* =========================================
   THEME TOGGLE FUNCTIONALITY
   ========================================= */

function initThemeToggle() {
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Check for saved user preference or default to light mode
    const currentTheme = localStorage.getItem('retailpulse-theme');
    const isDarkMode = currentTheme === 'dark';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeIcon.className = 'fas fa-sun';
    }
    
    // Toggle theme on click event
    themeToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event propagation
        const body = document.body;
        
        if (body.classList.contains('dark-mode')) {
            // Switch to Light Mode
            body.classList.remove('dark-mode');
            themeIcon.className = 'fas fa-moon';
            localStorage.setItem('retailpulse-theme', 'light');
        } else {
            // Switch to Dark Mode
            body.classList.add('dark-mode');
            themeIcon.className = 'fas fa-sun';
            localStorage.setItem('retailpulse-theme', 'dark');
        }
    });
}

/* =========================================
   CHART.JS - SALES GROWTH VISUALIZATION
   ========================================= */

function initializeSalesChart() {
    const ctx = document.getElementById('salesGrowthChart').getContext('2d');
    
    // Sample Arabic data for sales growth
    const weeklyData = [
        { week: 'الأحد', sales: 15400 },
        { week: 'الإثنين', sales: 18200 },
        { week: 'الثلاثاء', sales: 12300 }, // Note the dip on Tuesday
        { week: 'الأربعاء', sales: 19800 },
        { week: 'الخميس', sales: 22500 },
        { week: 'الجمعة', sales: 24100 },
        { week: 'السبت', sales: 21800 }
    ];
    
    // Create gradient for chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, APP_CONFIG.primaryColor);
    gradient.addColorStop(1, '#8B5CF6');
    
    // Line Chart - Sales Growth Over Weeks
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: weeklyData.map(d => d.week),
            datasets: [{
                label: 'المبيعات (ر.س)',
                data: weeklyData.map(d => d.sales),
                borderColor: APP_CONFIG.primaryColor,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4, // Smooth curves
                borderWidth: 3,
                pointBackgroundColor: '#8B5CF6',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 9,
                hoverOffset: 10
            }]
        },
        options: CHART_CONFIG
    });
    
    // Add tooltip animation and styling
    Chart.default.config().plugins.tooltip = {
        bodyFont: {
            family: 'Tajawal',
            weight: '600'
        },
        titleFont: {
            family: 'Tajawal',
            weight: '700'
        },
        padding: 12,
        cornerRadius: 8
    };
}

/* =========================================
   NAVIGATION SETUP
   ========================================= */

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Highlight active/active based on URL (simulated)
    highlightActiveNav('dashboard');
    
    // Click events for navigation (simulated page switching)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            highlightActiveNav(targetId);
            
            // Console log to simulate page change
            document.getElementById('pageTitle').textContent = getSectionTitle(targetId);
        });
    });
}

function highlightActiveNav(sectionId) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected nav item
    const activeLink = document.querySelector(`.nav-link[data-target="${sectionId}"]`);
    if (activeLink) {
        activeLink.closest('.nav-item').classList.add('active');
    }
}

function getSectionTitle(sectionId) {
    const titles = {
        'dashboard': 'لوحة التحكم',
        'sales': 'سجل المبيعات',
        'products': 'المنتجات والمخزون',
        'customers': 'العملاء',
        'reports': 'التقارير'
    };
    return titles[sectionId] || sectionId;
}

/* =========================================
   UPLOAD DATA MODAL HANDLING
   ========================================= */

function setupUploadModal() {
    const uploadBtn = document.getElementById('uploadDataBtn');
    const modalOverlay = document.getElementById('uploadModal');
    const closeButtons = document.querySelectorAll('.close-modal, [data-action="suggest"]'); // Include all close triggers
    
    // Open Modal on click
    uploadBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling to modal click event
        openUploadModal();
    });
    
    // Close Modal Functions
    function closeModal() {
        modalOverlay.classList.remove('active');
        
        // Clear file inputs if any
        const input = document.querySelector('#uploadInput');
        if (input) {
            input.value = '';
        }
        
        // Hide progress bar and reset styles
        document.querySelector('.upload-status').textContent = 'جاهز';
        document.getElementById('uploadProgress').style.width = '0%';
        setTimeout(() => {
            document.querySelector('.upload-progress').classList.remove('active');
        }, 100);
    }
    
    const modalCloseBtn = document.querySelector('.modal-header > .close-modal');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            closeModal();
        });
    });
    
    // Close on backdrop click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Simulated file upload on input change
    const dragArea = document.querySelector('.drag-drop-area');
    let uploadedFile = null;
    
    dragArea.addEventListener('click', () => {
        if (!uploadedFile) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv,.xlsx,';
            input.id = 'uploadInput'; // Match with CSS selector
            
            // Trigger file selection via JavaScript
            document.querySelector('#uploadModal .modal-body').appendChild(input);
            input.click();
            
            // Handle file selection on change
            input.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    uploadedFile = e.target.files[0];
                    showUploadProgress(e.target.files[0]);
                }
            });
        }
    });
    
    function openUploadModal() {
        modalOverlay.style.display = 'flex';
        
        // Add transition for smooth appearance
        requestAnimationFrame(() => {
            modalOverlay.classList.add('active');
        });
    }
    
    function showUploadProgress(file) {
        const inputFile = document.querySelector('#uploadInput');
        const progressFill = document.getElementById('uploadProgress');;
        const statusText = document.querySelector('.upload-status');
        
        // Show progress bar initially
        const progressSteps = [30, 60, 85, 100];
        let currentStep = 0;
        
        function nextStep() {
            currentStep++;
            if (currentStep < progressSteps.length) {
                progressFill.style.width = `${progressSteps[currentStep]}%`;
                
                const statuses = [
                    'جارِ تحميل الملف...',
                    'جاري معالجة البيانات...',
                    'تم تحليل النتائج...',
                    'تمت العملية بنجاح!'
                ];
                statusText.textContent = statuses[currentStep];
            } else {
                // Final success state (after 3 seconds)
                setTimeout(() => {
                    if (!modalOverlay.classList.contains('active')) return;
                    
                    progressFill.style.width = '100%';
                    statusText.textContent = 'تمت العملية بنجاح!';
                    
                    // Show success toast
                    showToast('تم معالجة البيانات بنجاح!', 'success');
                    
                    setTimeout(() => {
                        closeModal();
                    }, 2000);
                }, 2500);
            }
        }
        
        nextStep();
    }
}

/* =========================================
   TOAST NOTIFICATION SYSTEM
   ========================================= */

function setupToastNotifications() {
    const toastContainer = document.getElementById('toastContainer');
    
    setTimeout(() => {
        // Initial welcome toast
        showToast('مرحباً بك في منصة نبض المبيعات! 🎉', 'success');
    }, 100);
}

function showToast(message, type = 'info') {
    const toastClass = `${type}-toast`;
    const toastEl = document.createElement(`div`);
    toastEl.className = `toast ${toastClass}`;
    
    let iconText = '';
    if (type === 'success') {
        iconText = '<i class="fas fa-check-circle"></i>';
    } else if (type === 'error') {
        iconText = '<i class="fas fa-exclamation-circle"></i>';
    } else {
        iconText = '<i class="fas fa-info-circle"></i>';
    }
    
    toastEl.innerHTML = `${iconText} <strong>${message}</strong>`;
    
    // Append to container
    toastContainer.appendChild(toastEl);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toastContainer.contains(toastEl)) {
            const fadeOut = toastEl.style;
            fadeOut.opacity = '0';
            setTimeout(() => {
                toastContainer.removeChild(toastEl);
            }, 300);
        }
    }, 5000);
}

/* =========================================
   SIMULATE KPI CARD VALUE UPDATES
   (For demonstration purposes)
   ========================================= */

function simulateKPIUpdates() {
    // Simulate periodic updates to KPI values
    const salesValue = document.querySelector('.kpi-value[data-sales]');
    const aovValue = document.querySelector('.kpi-value[data-aov]');
    
    if (salesValue && aovValue) {
        setInterval(() => {
            // Randomly fluctuate the values slightly
            const baseSales = parseFloat(salesValue.innerText.replace(',', '').replace(' ر.س', ''));
            const variation = Math.random() * 50;
            
            salesValue.innerHTML = `245,890 + ${variation} ر.س`;
            aovValue.innerHTML = (197.20 + Math.random()).toFixed(2) + ' ر.س';
        }, 100); // Simulate every 100ms for demo
    }
}

/* =========================================
   FILTER BUTTONS FOR CHART
   (Simulated functionality)
   ========================================= */

document.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('.filter-btn');
    
    if (filterBtn && filterBtn.dataset.filter) {
        const filterType = filterBtn.dataset.filter;
        
        // Handle the filtered data simulation
        if (filterType === 'weekly') {
            showToast('عرض البيانات: الأسبوعي', 'info');
        } else if (filterType === 'monthly') {
            showToast('عرض البيانات: شهري', 'info');
        } else if (filterType === 'yearly') {
            showToast('عرض البيانات: سنوي', 'info');
        }
    }
});

/* =========================================
   SMART INSIGHTS ACTION BUTTONS
   ========================================= */

document.addEventListener('click', (e) => {
    const suggestBtn = e.target.closest('[data-action="suggest"]');
    
    if (suggestBtn) {
        const action = suggestBtn.dataset.action;
        
        if (action === 'suggest') {
            showToast('جاري عرض التوصية...', 'info');
            
            // Simulate suggestion completion
            setTimeout(() => {
                showToast(`تم تطبيق التوصية بنجاح!`, 'success');
            }, 1000);
        }
    }
});

/* =========================================
   UTILITY FUNCTIONS
   ========================================= */

/**
 * Format Arabic numbers with proper separators
 */
function formatArabicNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Convert currency to Arabic
 */
function convertToCurrency(price) {
    const symbol = 'ر.س';
    return `${symbol}${formatArabicNumber(parseFloat(price).toFixed(2))}`;
}

/**
 * Calculate percentage difference
 */
function calculatePercentageDifference(current, previous) {
    return ((current - previous) / previous * 100).toFixed(1);
}

console.log('🎯 RetailPulse Dashboard initialized with Chart.js and UI handlers');
console.log(`✨ Theme toggle: ${localStorage.getItem('retailpulse-theme') === 'dark' ? 'Dark Mode' : 'Light Mode'}`);

/* =========================================
   PERFORMANCE OPTIMIZATIONS
   ========================================= */
// Debounce API calls if needed in future
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* =========================================
   ANIMATION UTILITIES
   ========================================= */
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    
    function step(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start);
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    
    if (duration > 0) {
        window.requestAnimationFrame(step);
    }
}

/* =========================================
   EVENT LISTENERS FOR RESPONSIVE BEHAVIOR
   ========================================= */

window.addEventListener('resize', () => {
    // Trigger chart resize on window resize
    const chart = document.getElementById('salesGrowthChart');
    if (chart) {
        chart.dispatchEvent(new Event('resize'));
    }
});

/**
 * Retain focus when changing tabs/touch
 */
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Restore focus to main content when coming back from tabs
        document.querySelector('.main-content').focus();
    }
});
