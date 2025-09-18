// Global variables
let selectedDate = 'today';
let selectedTimeSlot = null;
let selectedPaymentMethod = null;

// Time slots data (simulated availability)
const timeSlots = {
    today: [
        { time: '08:00-09:00', available: false },
        { time: '09:00-10:00', available: true },
        { time: '10:00-11:00', available: true },
        { time: '11:00-12:00', available: false },
        { time: '12:00-13:00', available: true },
        { time: '13:00-14:00', available: true },
        { time: '14:00-15:00', available: false },
        { time: '15:00-16:00', available: true },
        { time: '16:00-17:00', available: true },
        { time: '17:00-18:00', available: true },
        { time: '18:00-19:00', available: false },
        { time: '19:00-20:00', available: true },
        { time: '20:00-21:00', available: true },
        { time: '21:00-22:00', available: false }
    ],
    tomorrow: [
        { time: '08:00-09:00', available: true },
        { time: '09:00-10:00', available: true },
        { time: '10:00-11:00', available: false },
        { time: '11:00-12:00', available: true },
        { time: '12:00-13:00', available: true },
        { time: '13:00-14:00', available: false },
        { time: '14:00-15:00', available: true },
        { time: '15:00-16:00', available: true },
        { time: '16:00-17:00', available: false },
        { time: '17:00-18:00', available: true },
        { time: '18:00-19:00', available: true },
        { time: '19:00-20:00', available: true },
        { time: '20:00-21:00', available: false },
        { time: '21:00-22:00', available: true }
    ],
    'day-after': [
        { time: '08:00-09:00', available: true },
        { time: '09:00-10:00', available: false },
        { time: '10:00-11:00', available: true },
        { time: '11:00-12:00', available: true },
        { time: '12:00-13:00', available: false },
        { time: '13:00-14:00', available: true },
        { time: '14:00-15:00', available: true },
        { time: '15:00-16:00', available: true },
        { time: '16:00-17:00', available: true },
        { time: '17:00-18:00', available: false },
        { time: '18:00-19:00', available: true },
        { time: '19:00-20:00', available: false },
        { time: '20:00-21:00', available: true },
        { time: '21:00-22:00', available: true }
    ]
};

// Date mapping for display
const dateMapping = {
    'today': '今天',
    'tomorrow': '明天',
    'day-after': '后天'
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    generateTimeSlots();
});

function setupEventListeners() {
    // Date selection buttons
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectDate(this.dataset.date);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const bookingModal = document.getElementById('bookingModal');
        const paymentModal = document.getElementById('paymentModal');
        const successModal = document.getElementById('successModal');
        
        if (event.target === bookingModal) {
            closeBookingModal();
        }
        if (event.target === paymentModal) {
            closePaymentModal();
        }
        if (event.target === successModal) {
            closeSuccessModal();
        }
    });
}

function openBookingModal() {
    document.getElementById('bookingModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    generateTimeSlots();
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    resetBookingState();
}

function selectDate(date) {
    selectedDate = date;
    
    // Update active date button
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-date="${date}"]`).classList.add('active');
    
    // Regenerate time slots for selected date
    generateTimeSlots();
    hideBookingSummary();
}

function generateTimeSlots() {
    const slotsGrid = document.getElementById('slotsGrid');
    slotsGrid.innerHTML = '';
    
    const slots = timeSlots[selectedDate];
    
    slots.forEach((slot, index) => {
        const slotBtn = document.createElement('button');
        slotBtn.className = `slot-btn ${slot.available ? '' : 'unavailable'}`;
        slotBtn.textContent = slot.time;
        slotBtn.dataset.time = slot.time;
        slotBtn.dataset.index = index;
        
        if (slot.available) {
            slotBtn.addEventListener('click', () => selectTimeSlot(slot.time, slotBtn));
        }
        
        slotsGrid.appendChild(slotBtn);
    });
}

function selectTimeSlot(time, button) {
    // Remove previous selection
    document.querySelectorAll('.slot-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add selection to clicked button
    button.classList.add('selected');
    selectedTimeSlot = time;
    
    // Show booking summary
    showBookingSummary();
    
    // Enable proceed button
    document.getElementById('proceedToPayment').disabled = false;
}

function showBookingSummary() {
    const summary = document.getElementById('bookingSummary');
    document.getElementById('selectedDate').textContent = dateMapping[selectedDate];
    document.getElementById('selectedTime').textContent = selectedTimeSlot;
    summary.style.display = 'block';
}

function hideBookingSummary() {
    document.getElementById('bookingSummary').style.display = 'none';
    document.getElementById('proceedToPayment').disabled = true;
    selectedTimeSlot = null;
}

function showPaymentOptions() {
    document.getElementById('paymentModal').style.display = 'block';
    document.getElementById('paymentTotal').textContent = '¥120';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    selectedPaymentMethod = null;
    
    // Reset payment selection
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.checked = false;
    });
    document.getElementById('confirmPayment').disabled = true;
}

function selectPayment(method) {
    selectedPaymentMethod = method;
    
    // Remove previous selections
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked option
    event.currentTarget.classList.add('selected');
    
    // Update radio button
    document.getElementById(method).checked = true;
    
    // Enable confirm payment button
    document.getElementById('confirmPayment').disabled = false;
}

function processPayment() {
    // Simulate payment processing
    const confirmBtn = document.getElementById('confirmPayment');
    const originalText = confirmBtn.textContent;
    
    confirmBtn.textContent = '处理中...';
    confirmBtn.disabled = true;
    
    // Simulate payment delay
    setTimeout(() => {
        closePaymentModal();
        closeBookingModal();
        showSuccessModal();
    }, 2000);
}

function showSuccessModal() {
    // Generate booking ID
    const bookingId = 'PB' + Date.now().toString().slice(-6);
    document.getElementById('bookingId').textContent = bookingId;
    
    // Format date and time
    const dateText = dateMapping[selectedDate];
    const dateTimeText = `${dateText} ${selectedTimeSlot}`;
    document.getElementById('bookingDateTime').textContent = dateTimeText;
    
    document.getElementById('successModal').style.display = 'block';
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    resetBookingState();
}

function resetBookingState() {
    selectedDate = 'today';
    selectedTimeSlot = null;
    selectedPaymentMethod = null;
    
    // Reset date selection
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[data-date="today"]').classList.add('active');
    
    // Reset time slot selection
    document.querySelectorAll('.slot-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Reset payment selection
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.checked = false;
    });
    
    // Hide summary and disable buttons
    hideBookingSummary();
    document.getElementById('confirmPayment').disabled = true;
    document.getElementById('confirmPayment').textContent = '确认支付';
}

// Animation and interaction enhancements
function addHoverEffects() {
    // Add subtle animations to buttons
    document.querySelectorAll('.slot-btn, .payment-option, .date-btn').forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Initialize hover effects when DOM is loaded
document.addEventListener('DOMContentLoaded', addHoverEffects);

// Keyboard navigation support
document.addEventListener('keydown', function(event) {
    // Close modals with Escape key
    if (event.key === 'Escape') {
        const visibleModal = document.querySelector('.modal[style*="block"]');
        if (visibleModal) {
            const modalId = visibleModal.id;
            switch (modalId) {
                case 'bookingModal':
                    closeBookingModal();
                    break;
                case 'paymentModal':
                    closePaymentModal();
                    break;
                case 'successModal':
                    closeSuccessModal();
                    break;
            }
        }
    }
});

// Touch support for mobile devices
function addTouchSupport() {
    let touchStartY = 0;
    
    document.addEventListener('touchstart', function(event) {
        touchStartY = event.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(event) {
        const touchEndY = event.changedTouches[0].clientY;
        const diffY = touchStartY - touchEndY;
        
        // Implement swipe gestures if needed
        if (Math.abs(diffY) > 50) {
            // Handle vertical swipes
        }
    });
}

// Initialize touch support
document.addEventListener('DOMContentLoaded', addTouchSupport);
