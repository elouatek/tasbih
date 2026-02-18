(() => {
    'use strict';

    // ===== DOM Elements =====
    const radioButtons = document.querySelectorAll('input[name="tasbih"]');
    const badges = document.querySelectorAll('.radio-badge');
    const counterSection = document.getElementById('counter-section');
    const footerSection = document.getElementById('footer-section');
    const counterNumber = document.getElementById('counter-number');
    const tasbihBtn = document.getElementById('tasbih-btn');
    const btnText = document.getElementById('btn-text');
    const resetCurrentBtn = document.getElementById('reset-current-btn');
    const resetAllBtn = document.getElementById('reset-all-btn');

    // Modal Elements
    const confirmModal = document.getElementById('confirm-modal');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const confirmModalBtn = document.getElementById('confirm-modal-btn');

    // ===== State =====
    const STORAGE_KEY = 'tasbih_counters';
    const STORAGE_SELECTED = 'tasbih_selected';

    let selectedTasbih = '';
    let counters = {};

    // ===== Default counter values =====
    const DHIKR_KEYS = [
        'استغفر الله',
        'سبحان الله',
        'الحمد لله',
        'لا اله إلا الله',
        'الله أكبر'
    ];

    // ===== Initialize =====
    function init() {
        loadState();
        bindEvents();
        syncAllBadges();
    }

    function getDefaultCounters() {
        const obj = {};
        DHIKR_KEYS.forEach(key => {
            obj[key] = 0;
        });
        return obj;
    }

    function loadState() {
        // Load counters
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                counters = JSON.parse(saved);
                // Ensure all keys exist (in case new ones are added)
                DHIKR_KEYS.forEach(key => {
                    if (!(key in counters)) counters[key] = 0;
                });
            } catch (e) {
                console.error("Failed to parse counters", e);
                counters = getDefaultCounters();
            }
        } else {
            counters = getDefaultCounters();
        }

        // Load selected dhikr
        const savedSelected = localStorage.getItem(STORAGE_SELECTED);
        if (savedSelected && savedSelected in counters) {
            selectedTasbih = savedSelected;

            // Restore radio check
            radioButtons.forEach(radio => {
                if (radio.value === savedSelected) {
                    radio.checked = true;
                }
            });

            // Show counter with saved value
            counterNumber.textContent = counters[selectedTasbih];
            btnText.textContent = selectedTasbih;
            showCounter();
        }
    }

    function bindEvents() {
        // Radio selection
        radioButtons.forEach(radio => {
            radio.addEventListener('change', handleSelection);
        });

        // Main Button
        tasbihBtn.addEventListener('click', handleTasbihClick);

        // Reset Buttons
        resetCurrentBtn.addEventListener('click', handleResetCurrent);

        // Open Modal
        resetAllBtn.addEventListener('click', () => {
            confirmModal.classList.remove('hidden');
        });

        // Modal Actions
        cancelModalBtn.addEventListener('click', () => {
            confirmModal.classList.add('hidden');
        });

        confirmModalBtn.addEventListener('click', () => {
            handleResetAllConfirm();
            confirmModal.classList.add('hidden');
        });

        // Close modal on outside click
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                confirmModal.classList.add('hidden');
            }
        });
    }

    // ===== Handlers =====
    function handleSelection(e) {
        selectedTasbih = e.target.value;
        btnText.textContent = selectedTasbih;

        // Show the saved count for this dhikr (do NOT reset)
        counterNumber.textContent = counters[selectedTasbih];

        // Save selection
        try {
            localStorage.setItem(STORAGE_SELECTED, selectedTasbih);
        } catch (e) {
            console.error("Storage full?", e);
        }

        showCounter();
        syncAllBadges();
    }

    function handleTasbihClick(e) {
        if (!selectedTasbih) return;

        // Increment
        counters[selectedTasbih]++;
        counterNumber.textContent = counters[selectedTasbih];

        // Persist
        saveCounters();

        // Update the badge for this dhikr
        syncBadge(selectedTasbih);

        // Visual feedback
        counterNumber.classList.add('bump');
        setTimeout(() => counterNumber.classList.remove('bump'), 150);

        createRipple(e);
    }

    function handleResetCurrent() {
        if (!selectedTasbih) return;

        counters[selectedTasbih] = 0;
        counterNumber.textContent = 0;
        saveCounters();
        syncBadge(selectedTasbih);

        // Feedback
        counterNumber.classList.add('bump');
        setTimeout(() => counterNumber.classList.remove('bump'), 150);
    }

    function handleResetAllConfirm() {
        // Correctly reset counters
        counters = getDefaultCounters();
        saveCounters();

        // Update main display immediately if active
        if (selectedTasbih) {
            counterNumber.textContent = 0;
        }

        syncAllBadges();

        // Feedback
        counterNumber.classList.add('bump');
        setTimeout(() => counterNumber.classList.remove('bump'), 150);
    }

    // ===== Helpers =====
    function saveCounters() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
        } catch (e) {
            console.error("Failed to save counters", e);
        }
    }

    function showCounter() {
        counterSection.classList.remove('hidden');
        footerSection.classList.remove('hidden');

        // Only scroll if not already visible to avoid jumping
        // Simple check: is it in viewport? We'll just smooth scroll gently
        // setTimeout(() => {
        //     counterSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // }, 100);
    }

    function syncBadge(key) {
        badges.forEach(badge => {
            if (badge.dataset.key === key) {
                const val = counters[key] || 0;
                badge.textContent = val;
                badge.classList.toggle('has-count', val > 0);
            }
        });
    }

    function syncAllBadges() {
        badges.forEach(badge => {
            const key = badge.dataset.key;
            const val = counters[key] || 0;
            badge.textContent = val;
            badge.classList.toggle('has-count', val > 0);
        });
    }

    function createRipple(e) {
        const btn = tasbihBtn;
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    }

    // ===== Start =====
    init();
})();
