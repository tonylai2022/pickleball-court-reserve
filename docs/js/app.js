'use strict';

// Simple SPA state
const state = {
  currentPage: 'home',
  history: [],
  isMobileNavOpen: false,
  booking: {
    court: 'Urban Dinker Court',
    courtAddress: 'TRK·达鲁酷运动餐酒吧(友邦金融中心店)\n公平路209号友邦金融中心地下二层LG2层201号',
    courtPhone: '400-888-8888',
    date: null,
    startTime: null,
    endTime: null,
    hours: 0,
    pricePerHour: 120,
    amount: 0,
    paymentMethod: 'wechat',
    confirmationNumber: '',
    players: 2,
    equipmentSet: false, // Changed from addons to equipmentSet
    promo: null,
    isMember: false,
    fees: { base: 0, equipment: 0, discount: 0, service: 0, tax: 0, total: 0 }, // Changed addons to equipment
    selectedSlots: [] // array of {start,end}
  }
};

// Demo events catalog (original sample data)
const demoEvents = [
  { id: 'evt-1', title: '周三晚新手社交场', level: 'beginner', weekday: true, dateOffset: 1, start: '19:00', end: '21:00', price: 49, capacity: 12, booked: 6 },
  { id: 'evt-2', title: '周五夜进阶训练营', level: 'intermediate', weekday: true, dateOffset: 3, start: '20:00', end: '22:00', price: 69, capacity: 16, booked: 15 },
  { id: 'evt-3', title: '周末高手对抗赛', level: 'advanced', weekday: false, dateOffset: 5, start: '14:00', end: '17:00', price: 99, capacity: 12, booked: 12 },
  { id: 'evt-4', title: '周末欢乐拼场', level: 'beginner', weekday: false, dateOffset: 6, start: '10:00', end: '12:00', price: 59, capacity: 20, booked: 4 },
];

// Utils
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const show = el => el.classList.add('active');
const hide = el => el.classList.remove('active');

function showToast(message, duration = 2000) {
  const toast = $('#toast');
  $('#toast-message').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function openModal({ title = '提示', message = '', onConfirm = null, confirmText = '确定', cancelText = '取消', showCancel = true } = {}) {
  $('#modal-title').textContent = title;
  $('#modal-message').textContent = message;
  const overlay = $('#modal-overlay');
  const confirmBtn = $('#modal-confirm');
  const cancelBtn = $('#modal-cancel');
  confirmBtn.textContent = confirmText;
  cancelBtn.textContent = cancelText;
  if (showCancel) { cancelBtn.style.display = 'inline-flex'; } else { cancelBtn.style.display = 'none'; }
  confirmBtn.onclick = () => { closeModal(); onConfirm && onConfirm(); };
  showModal();
}
function showModal() { $('#modal-overlay').classList.add('show'); }
function closeModal() { $('#modal-overlay').classList.remove('show'); }
function setLoading(isLoading) { $('#loading').classList.toggle('show', isLoading); }

// Mobile Navigation Functions
function toggleMobileMenu() {
  state.isMobileNavOpen = !state.isMobileNavOpen;
  const overlay = $('#mobile-nav-overlay');
  const toggle = $('#mobileMenuToggle');

  if (state.isMobileNavOpen) {
    overlay.classList.add('active');
    toggle.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  } else {
    overlay.classList.remove('active');
    toggle.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function closeMobileMenu() {
  if (state.isMobileNavOpen) {
    toggleMobileMenu();
  }
}

// Navigation
function showPage(pageId) {
  // Close mobile menu if open
  closeMobileMenu();

  const pages = $$('.page');
  pages.forEach(p => hide(p));
  const map = {
    home: '#home-page',
    booking: '#booking-page',
    payment: '#payment-page',
    success: '#success-page',
    about: '#about-page',
    terms: '#terms-page',
    privacy: '#privacy-page',
    events: '#events-page',
    membership: '#membership-page',
    faq: '#faq-page'
  };
  const target = $(map[pageId]);
  if (!target) return;
  if (state.currentPage !== pageId) { state.history.push(state.currentPage); }
  state.currentPage = pageId;
  show(target);

  // Update navigation active states
  updateNavActiveStates(pageId);

  // Handle page-specific rendering
  if (pageId === 'events') { renderEvents(); }
  if (pageId === 'booking') { renderDates(); }
}

function updateNavActiveStates(pageId) {
  // Update desktop navigation
  $$('.nav-link').forEach(link => link.classList.remove('active'));
  const activeNavLink = $(`.nav-link[onclick*="${pageId}"]`);
  if (activeNavLink) activeNavLink.classList.add('active');

  // Update mobile navigation
  $$('.mobile-nav-link').forEach(link => link.classList.remove('active'));
  const activeMobileLink = $(`.mobile-nav-link[onclick*="${pageId}"]`);
  if (activeMobileLink) activeMobileLink.classList.add('active');

  // Update tabbar (mobile bottom navigation)
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  const tabMap = {
    home: '.tab-btn:nth-child(1)',
    events: '.tab-btn:nth-child(2)',
    membership: '.tab-btn:nth-child(3)',
    faq: '.tab-btn:nth-child(4)'
  };
  const activeTab = $(tabMap[pageId]);
  if (activeTab) activeTab.classList.add('active');
}

function goBack() {
  if (state.history.length === 0) { return showPage('home'); }
  const prev = state.history.pop();
  showPage(prev);
}

function goHome() {
  state.history = [];
  showPage('home');
}

// Responsive utilities
function isMobile() {
  return window.innerWidth < 768;
}

function isTablet() {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

function isDesktop() {
  return window.innerWidth >= 1024;
}

// Handle window resize
function handleResize() {
  // Close mobile menu if window becomes desktop size
  if (isDesktop() && state.isMobileNavOpen) {
    closeMobileMenu();
  }
}

// Touch and gesture support
function addTouchSupport() {
  let startX = 0;
  let startY = 0;

  document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });

  document.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = startX - endX;
    const diffY = startY - endY;

    // Swipe detection (horizontal swipes only)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swipe left - could open mobile menu
      } else {
        // Swipe right - could close mobile menu or go back
        if (state.isMobileNavOpen) {
          closeMobileMenu();
        }
      }
    }
  });
}

// Home
function openBooking() {
  showPage('booking');
  renderDates();
  renderTimeSlots();
  updateSummary();
}

// Booking - Dates and times
function renderDates() {
  const container = $('#dateScroll');
  const today = new Date();
  const items = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = d.toLocaleDateString('zh-CN', { weekday: 'short' });
    const dateStr = d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    const iso = d.toISOString().slice(0, 10);
    const active = state.booking.date === iso ? ' active' : '';
    items.push(`<div class="date-chip${active}" data-date="${iso}" onclick="selectDate('${iso}')">
      <span class="day">${dayName}</span>
      <span class="date">${dateStr}</span>
    </div>`);
  }
  container.innerHTML = items.join('');
}

function selectDate(iso) {
  state.booking.date = iso;
  // Reset time selection when date changes
  state.booking.selectedSlots = [];
  state.booking.startTime = null;
  state.booking.endTime = null;
  state.booking.hours = 0;
  calcFees();
  renderDates();
  updateSummary();
  $('#confirmBooking').disabled = !(state.booking.date && state.booking.startTime);
}

function renderTimeSlots() {
  const container = $('#timeGrid');
  const items = [];
  const startHour = 8, endHour = 22; // 08:00-22:00
  for (let h = startHour; h < endHour; h++) {
    const start = String(h).padStart(2, '0') + ':00';
    const end = String(h + 1).padStart(2, '0') + ':00';
    const key = `${start}-${end}`;
    const active = state.booking.selectedSlots.some(s => s.start === start) ? ' active' : '';
    items.push(`<div class="time-slot${active}" data-key="${key}" onclick="toggleSlot('${start}','${end}')">${start} - ${end}</div>`);
  }
  container.innerHTML = items.join('');
}

function toggleSlot(start, end) {
  const sel = state.booking.selectedSlots;
  sel.sort((a, b) => a.start.localeCompare(b.start));
  const first = sel[0];
  const last = sel[sel.length - 1];
  const existsIdx = sel.findIndex(s => s.start === start);
  if (existsIdx >= 0) {
    // Allow deselect only at the ends to keep contiguous
    if (first && start === first.start) { sel.shift(); }
    else if (last && start === last.start) { sel.pop(); }
    // ignore if middle
  } else {
    if (sel.length === 0) {
      sel.push({ start, end });
    } else if (last && start === last.end) {
      sel.push({ start, end });
    } else if (first && end === first.start) {
      sel.unshift({ start, end });
    } else {
      // Non-adjacent click ignored to enforce contiguous selection
    }
  }
  normalizeSlots();
  calcFees();
  renderTimeSlots();
  updateSummary();
  $('#confirmBooking').disabled = !(state.booking.date && state.booking.selectedSlots.length > 0);
}

function normalizeSlots() {
  if (state.booking.selectedSlots.length === 0) {
    state.booking.startTime = null;
    state.booking.endTime = null;
    state.booking.hours = 0;
    return;
  }
  // Selected slots are maintained contiguous; just read first/last
  const first = state.booking.selectedSlots[0];
  const last = state.booking.selectedSlots[state.booking.selectedSlots.length - 1];
  state.booking.startTime = first.start;
  state.booking.endTime = last.end;
  state.booking.hours = state.booking.selectedSlots.length;
}

function updateSummary() {
  $('#selectedDate').textContent = state.booking.date ? state.booking.date : '请选择日期';
  const hoursText = state.booking.hours ? `（共 ${state.booking.hours} 小时）` : '';
  $('#selectedTime').textContent = state.booking.startTime ? `${state.booking.startTime} - ${state.booking.endTime} ${hoursText}` : '请选择时间';
  renderFeeBreakdown('feeBreakdown');
  $('#totalPrice').textContent = `¥${state.booking.fees.total || 0}`;
  // per-person on booking page
  const per = state.booking.players > 0 ? Math.round((state.booking.fees.total / state.booking.players) * 100) / 100 : 0;
  $('#perPerson').textContent = `人均 ¥${per}`;
  // update qty labels
  $('#qty-paddles').textContent = state.booking.addons.paddles;
  $('#qty-balls').textContent = state.booking.addons.balls;
  const qp = document.getElementById('qty-players');
  if (qp) { qp.textContent = state.booking.players; }
}

function goToPayment() {
  if (!state.booking.date || !state.booking.startTime) {
    return showToast('请选择日期和时间');
  }
  showPage('payment');
  renderOrder();
}

// Payment
function renderOrder() {
  const b = state.booking;
  const details = [
    ['球场', b.court],
    ['日期', b.date],
    ['时间', `${b.startTime} - ${b.endTime}`],
    ['时长', `${b.hours} 小时`],
    ['参与人数', `${b.players} 人`]
  ];
  $('#orderDetails').innerHTML = details.map(([k, v]) => `<div class="order-row"><span>${k}</span><span>${v}</span></div>`).join('');
  renderFeeBreakdown('feeBreakdownPay');
  $('#paymentAmount').textContent = `¥${b.fees.total}`;
  const agree = document.getElementById('agreeTerms');
  if (agree) { agree.checked = false; }
  const payBtn = document.getElementById('payNow');
  if (payBtn) { payBtn.disabled = true; }
}

function processPayment() {
  openModal({
    title: '微信支付',
    message: `将支付 ¥${state.booking.fees.total}，用于预订${state.booking.court}。\n本演示站仅模拟支付流程。`,
    confirmText: '确认支付',
    onConfirm: () => {
      setLoading(true);
      // Simulate async payment
      setTimeout(() => {
        setLoading(false);
        const id = genConfirmationNumber();
        state.booking.confirmationNumber = id;
        showToast('支付成功');
        toSuccess();
      }, 900);
    }
  });
}

function toSuccess() {
  showPage('success');
  $('#confirmationNumber').textContent = state.booking.confirmationNumber;
  const rows = [
    ['球场', state.booking.court],
    ['地址', state.booking.courtAddress.replace(/\n/g, '，')],
    ['日期', state.booking.date],
    ['时间', `${state.booking.startTime} - ${state.booking.endTime}（${state.booking.hours} 小时）`],
    ['参与人数', `${state.booking.players} 人`],
    ['支付方式', '微信支付'],
    ['实付金额', `¥${state.booking.fees.total}`]
  ];
  $('#bookingDetails').innerHTML = rows.map(([k, v]) => `<div class="detail-row"><span class="detail-label">${k}</span><span class="detail-value">${v}</span></div>`).join('');
  const per = state.booking.players > 0 ? Math.round((state.booking.fees.total / state.booking.players) * 100) / 100 : 0;
  $('#perPersonSuccess').textContent = `人均 ¥${per}`;
}

// Success actions
function copyBookingNumber() {
  const text = state.booking.confirmationNumber;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('已复制预订编号'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('已复制预订编号');
  }
}

function shareBooking() {
  const shareData = {
    title: 'TRK 匹克球场预订',
    text: `我在 ${state.booking.date} ${state.booking.startTime}-${state.booking.endTime} 预订了球场，一起来打球吧！`,
    url: location.href
  };
  if (navigator.share) {
    navigator.share(shareData).catch(() => { });
  } else {
    copyBookingNumber();
    openModal({ title: '分享', message: '已复制预订编号，可粘贴给好友。' });
  }
}

// Events list
function dateFromOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const iso = d.toISOString().slice(0, 10);
  const label = d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', weekday: 'short' });
  return { iso, label };
}

// Schedule grid interactions
function bookOpenPlay(days, start, end) {
  const today = new Date();
  let targetDate = new Date(today);

  // Find next occurrence of the days
  if (days === 'mon-tue') {
    while (targetDate.getDay() !== 1 && targetDate.getDay() !== 2) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
  } else if (days === 'wed-fri') {
    while (targetDate.getDay() < 3 || targetDate.getDay() > 5) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
  }

  state.booking.date = targetDate.toISOString().slice(0, 10);
  const startHour = parseInt(start.split(':')[0]);
  const endHour = parseInt(end.split(':')[0]);

  state.booking.selectedSlots = [];
  for (let h = startHour; h < endHour; h++) {
    const slotStart = `${String(h).padStart(2, '0')}:00`;
    const slotEnd = `${String(h + 1).padStart(2, '0')}:00`;
    state.booking.selectedSlots.push({ start: slotStart, end: slotEnd });
  }

  normalizeSlots();
  calcFees();
  showPage('booking');
  renderDates();
  renderTimeSlots();
  updateSummary();
  $('#confirmBooking').disabled = false;
}

function waitlistOpenPlay(days) {
  showToast('已加入OPEN PLAY候补名单（演示）');
}

function bookDupr(day, level) {
  showToast(`已报名${day} DUPR积分赛 ${level}（演示）`);
}

// Legacy event functions
function renderEvents() {
  const list = document.getElementById('eventsList');
  if (!list) return;
  renderDayStrip();
  const level = (document.getElementById('filterLevel')?.value) || '';
  const day = (document.getElementById('filterDay')?.value) || '';
  const activeOffset = Number(document.querySelector('.day-chip.active')?.dataset.offset || 0);
  const items = demoEvents.filter(e => {
    if (level && e.level !== level) return false;
    if (day === 'weekday' && !e.weekday) return false;
    if (day === 'weekend' && e.weekday) return false;
    if (!isNaN(activeOffset) && activeOffset > 0 && e.dateOffset !== activeOffset) return false;
    return true;
  }).map(e => {
    const d = dateFromOffset(e.dateOffset);
    const left = Math.max(0, e.capacity - e.booked);
    const full = left === 0;
    return `<div class="event-card">
      <div class="event-info">
        <div class="event-title">${e.title}</div>
        <div class="event-meta">
          <span>日期：${d.label}</span>
          <span>时间：${e.start}-${e.end}</span>
          <span>水平：${e.level === 'beginner' ? '新手' : e.level === 'intermediate' ? '进阶' : '高手'}</span>
          <span class="spots">${full ? '已满' : `余位：${left}`}</span>
        </div>
      </div>
      <div class="event-cta">
        <div class="price">¥${e.price}</div>
        ${full
        ? `<button class="btn-secondary" onclick="waitlistEvent('${e.id}')">候补</button>`
        : `<button class="btn-primary" onclick="bookEvent('${e.id}')">报名</button>`}
      </div>
    </div>`;
  });
  list.innerHTML = items.join('') || '<div class="muted">暂无符合条件的活动</div>';
}
function renderDayStrip() {
  const strip = document.getElementById('dayStrip');
  if (!strip) return;
  if (strip.dataset.bind === '1') return; // simple once-binding
  const today = new Date();
  const chips = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const label = d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', weekday: 'short' });
    const active = i === 0 ? ' active' : '';
    chips.push(`<div class="day-chip${active}" data-offset="${i}" onclick="selectDay(${i}, this)">${label}</div>`);
  }
  strip.innerHTML = chips.join('');
  strip.dataset.bind = '1';
}
function selectDay(offset, el) {
  $$('.day-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderEvents();
}
function waitlistEvent(id) {
  showToast('已加入候补（演示）');
}
function bookEvent(id) {
  const ev = demoEvents.find(x => x.id === id);
  if (!ev) return;
  // Map into booking selections: set date and time range
  const d = dateFromOffset(ev.dateOffset);
  state.booking.date = d.iso;
  // derive start hour from start string
  const h = parseInt(ev.start.split(':')[0], 10);
  state.booking.selectedSlots = [{ start: ev.start, end: `${String(h + 1).padStart(2, '0')}:00` }];
  // extend slots to cover full range
  for (let hour = h + 1; hour < parseInt(ev.end.split(':')[0], 10); hour++) {
    state.booking.selectedSlots.push({ start: `${String(hour).padStart(2, '0')}:00`, end: `${String(hour + 1).padStart(2, '0')}:00` });
  }
  normalizeSlots();
  calcFees();
  showPage('booking');
  renderDates();
  renderTimeSlots();
  updateSummary();
  $('#confirmBooking').disabled = false;
}

// FAQ
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  if (!item) return;
  item.classList.toggle('open');
}

// Membership demo: flip the member flag
function enableDemoMembership() {
  state.booking.isMember = true;
  calcFees();
  updateSummary();
  showToast('已启用会员折扣（演示）');
}

function addToCalendar() {
  // Create simple .ics content
  const start = `${state.booking.date}T${state.booking.startTime.replace(':', '')}00`;
  const end = `${state.booking.date}T${state.booking.endTime.replace(':', '')}00`;
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:匹克球 - ${state.booking.court}\nDTSTART:${start}\nDTEND:${end}\nLOCATION:${state.booking.courtAddress}\nDESCRIPTION:预订编号 ${state.booking.confirmationNumber}\nEND:VEVENT\nEND:VCALENDAR`;
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'booking.ics'; a.click();
  URL.revokeObjectURL(url);
}

function contactSupport() { makePhoneCall(state.booking.courtPhone); }
function openMap() {
  const query = encodeURIComponent('TRK 达鲁酷运动餐酒吧 友邦金融中心');
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
}
function makePhoneCall(tel) { window.location.href = `tel:${tel}`; }

// Helpers
function genConfirmationNumber() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TRK-${t}-${r}`;
}

// Pricing and fees
function isWeekend(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay();
  return day === 0 || day === 6;
}
function isPeak(start) {
  const hour = parseInt(start.split(':')[0], 10);
  return hour >= 18; // 18:00+ as peak
}
function calcFees() {
  const b = state.booking;
  // base hours and dynamic per-slot pricing
  let base = 0;
  const weekendUp = isWeekend(b.date) ? 1.2 : 1.0; // 20% weekend uplift
  const slots = b.selectedSlots;
  slots.forEach(s => {
    const peakUp = isPeak(s.start) ? 1.15 : 1.0; // 15% peak uplift evenings
    base += b.pricePerHour * weekendUp * peakUp;
  });
  const equipment = b.equipmentSet ? 60 : 0; // Equipment set: 4 racquets + 2 balls = ¥60
  let subtotal = base + equipment;
  // discounts
  let discount = 0;
  if (b.isMember) { discount += subtotal * 0.10; }
  if (b.promo === 'PICKLE10') { discount += subtotal * 0.10; }
  subtotal = Math.max(0, subtotal - discount);
  // No service fee or tax - final total is just the subtotal
  const total = round2(subtotal);
  b.fees = {
    base: round2(base),
    equipment: round2(equipment), // Changed from addons to equipment
    discount: round2(discount),
    service: 0, // Removed service fee
    tax: 0, // Removed tax fee
    total
  };
  b.amount = total;
}
function round2(n) { return Math.round(n * 100) / 100; }

function renderFeeBreakdown(targetId) {
  const el = document.getElementById(targetId);
  const f = state.booking.fees;
  const parts = [];
  parts.push(`<div class="fee-row"><span>基础费用</span><span>¥${f.base}</span></div>`);
  if (state.booking.equipmentSet) {
    parts.push(`<div class="fee-row"><span>装备套餐 <span class="badge">4支球拍 + 2盒球</span></span><span>¥${f.equipment}</span></div>`);
  }
  if (state.booking.isMember || state.booking.promo) {
    const tags = [];
    if (state.booking.isMember) tags.push('会员9折');
    if (state.booking.promo) tags.push(`优惠码 ${state.booking.promo}`);
    parts.push(`<div class="fee-row"><span class="muted">优惠 <span class="badge">${tags.join(' + ')}</span></span><span class="muted">-¥${f.discount}</span></div>`);
  }
  // Removed service fee and tax fee lines
  parts.push(`<div class="fee-row total"><span>合计</span><span>¥${f.total}</span></div>`);
  el.innerHTML = parts.join('');
}

// Handlers for UI controls
function changeAddonQty(key, delta) {
  const b = state.booking;
  b.addons[key] = Math.max(0, (b.addons[key] || 0) + delta);
  calcFees();
  updateSummary();
}
function changePlayers(delta) {
  state.booking.players = Math.max(1, state.booking.players + delta);
  updateSummary();
}
function toggleEquipment(checked) {
  state.booking.equipmentSet = !!checked;
  calcFees();
  updateSummary();
}
function applyPromo() {
  const code = ($('#promoInput').value || '').trim().toUpperCase();
  state.booking.promo = code || null;
  calcFees();
  updateSummary();
}
function toggleMember(checked) {
  state.booking.isMember = !!checked;
  calcFees();
  updateSummary();
}
function togglePayEnabled() {
  const agreed = document.getElementById('agreeTerms').checked;
  document.getElementById('payNow').disabled = !agreed;
}

// Expose functions for inline handlers used in HTML
window.showPage = showPage;
window.goBack = goBack;
window.goHome = goHome;
window.openBooking = openBooking;
window.selectDate = selectDate;
window.toggleSlot = toggleSlot;
window.goToPayment = goToPayment;
window.processPayment = processPayment;
window.copyBookingNumber = copyBookingNumber;
window.shareBooking = shareBooking;
window.addToCalendar = addToCalendar;
window.contactSupport = contactSupport;
window.openMap = openMap;
window.makePhoneCall = makePhoneCall;
window.closeModal = closeModal;
window.changeAddonQty = changeAddonQty;
window.changePlayers = changePlayers;
window.applyPromo = applyPromo;
window.toggleMember = toggleMember;
window.toggleEquipment = toggleEquipment;
window.togglePayEnabled = togglePayEnabled;
window.renderEvents = renderEvents;
window.bookEvent = bookEvent;
window.toggleFaq = toggleFaq;
window.enableDemoMembership = enableDemoMembership;
window.selectDay = selectDay;
window.waitlistEvent = waitlistEvent;
window.bookOpenPlay = bookOpenPlay;
window.waitlistOpenPlay = waitlistOpenPlay;
window.bookDupr = bookDupr;

// Store original functions before overriding them
const originalSelectDate = selectDate;
const originalToggleSlot = toggleSlot;

// Enhanced Booking Interface Functions
function quickSelect(option) {
  const today = new Date();
  let selectedDate, selectedTime;

  switch (option) {
    case 'today-evening':
      selectedDate = today;
      selectDate(formatDate(today));
      // Auto-select 6-8 PM slots
      setTimeout(() => {
        const slots = ['18:00-19:00', '19:00-20:00'];
        slots.forEach(slot => {
          const slotEl = document.querySelector(`[data-slot="${slot}"]`);
          if (slotEl && slotEl.classList.contains('available')) {
            slotEl.click();
          }
        });
      }, 100);
      break;

    case 'tomorrow-morning':
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      selectDate(formatDate(tomorrow));
      // Auto-select 9-11 AM slots
      setTimeout(() => {
        const slots = ['09:00-10:00', '10:00-11:00'];
        slots.forEach(slot => {
          const slotEl = document.querySelector(`[data-slot="${slot}"]`);
          if (slotEl && slotEl.classList.contains('available')) {
            slotEl.click();
          }
        });
      }, 100);
      break;

    case 'weekend':
      // Find next weekend date
      const daysUntilSaturday = (6 - today.getDay()) % 7;
      const nextSaturday = new Date(today);
      nextSaturday.setDate(today.getDate() + (daysUntilSaturday || 7));
      selectDate(formatDate(nextSaturday));
      break;
  }

  // Show visual feedback
  showToast('已为您快速选择时间');

  // Scroll to time section
  const timeSection = document.querySelector('.time-section');
  if (timeSection) {
    timeSection.scrollIntoView({ behavior: 'smooth' });
  }
}

let currentBookingStep = 1;

function nextStep() {
  if (currentBookingStep < 2) {
    currentBookingStep++;
    updateBookingSteps();
    updateProgressIndicator();
    updateFooterButtons();
  } else {
    // Go to payment
    goToPayment();
  }
}

function previousStep() {
  if (currentBookingStep > 1) {
    currentBookingStep--;
    updateBookingSteps();
    updateProgressIndicator();
    updateFooterButtons();
  }
}

function updateBookingSteps() {
  const steps = document.querySelectorAll('.booking-step');
  steps.forEach((step, index) => {
    if (index + 1 === currentBookingStep) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
}

function updateProgressIndicator() {
  const progressSteps = document.querySelectorAll('.progress-step');
  progressSteps.forEach((step, index) => {
    if (index + 1 <= currentBookingStep) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
}

function updateFooterButtons() {
  const confirmBooking = document.querySelector('.confirm-booking');

  // Enable booking button if date and time slots are selected
  confirmBooking.disabled = !isBookingComplete();
}

function canProceedToNextStep() {
  // Check if date and time are selected
  return state.booking.date && state.booking.selectedSlots.length > 0;
}

function isBookingComplete() {
  // Check if date and time slots are selected (players count is not required anymore)
  return state.booking.date && state.booking.selectedSlots.length > 0;
}

function toggleSummary() {
  const summaryContent = document.querySelector('.summary-content');
  const toggleBtn = document.querySelector('.summary-toggle');

  if (summaryContent.classList.contains('collapsible')) {
    summaryContent.classList.remove('collapsible');
    toggleBtn.textContent = '收起';
  } else {
    summaryContent.classList.add('collapsible');
    toggleBtn.textContent = '展开';
  }
}

function showToast(message, duration = 3000) {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    animation: slideDown 0.3s ease-out;
  `;

  // Add animation styles
  if (!document.getElementById('toast-styles')) {
    const styles = document.createElement('style');
    styles.id = 'toast-styles';
    styles.textContent = `
      @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
      }
    `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}

// Enhanced date selection with better UX
function enhancedSelectDate(dateStr) {
  // Call the original selectDate function directly
  originalSelectDate(dateStr);

  // Add visual feedback
  const dateElements = document.querySelectorAll('.date-chip');
  dateElements.forEach(el => {
    el.classList.remove('selected');
    if (el.dataset.date === dateStr) {
      el.classList.add('selected');
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  showToast('日期已选择');
}// Enhanced time slot selection
function enhancedToggleSlot(start, end) {
  // Call the original toggleSlot function directly instead of through window
  originalToggleSlot(start, end);

  // Update footer price in real-time
  const footerPrice = document.getElementById('footerPrice');
  if (footerPrice) {
    footerPrice.textContent = `¥${state.booking.amount || 0}`;
  }

  // Update step button state
  updateFooterButtons();

  // Provide haptic feedback on mobile
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
}

// Override original functions with enhanced versions
window.selectDate = enhancedSelectDate;
window.toggleSlot = enhancedToggleSlot;

// Expose new enhanced booking functions
window.quickSelect = quickSelect;
window.nextStep = nextStep;
window.previousStep = previousStep;
window.toggleSummary = toggleSummary;
window.showToast = showToast;

// Initialize responsive features and mobile navigation
function initializeMobileFeatures() {
  // Set up mobile menu close on outside click
  const mobileNav = document.getElementById('mobileNav');
  if (mobileNav) {
    mobileNav.addEventListener('click', (e) => {
      if (e.target === mobileNav) {
        closeMobileMenu();
      }
    });
  }

  // Handle window resize for responsive behavior
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Close mobile menu if screen becomes desktop size
      if (!isMobile() && !isTablet()) {
        closeMobileMenu();
      }

      // Update navigation active states
      updateNavActiveStates();
    }, 100);
  });

  // Add swipe gesture support for mobile menu
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 100;
    const swipeDistance = touchEndX - touchStartX;

    // Swipe right to open menu (from left edge)
    if (swipeDistance > swipeThreshold && touchStartX < 50) {
      if (!document.getElementById('mobileNav').classList.contains('active')) {
        toggleMobileMenu();
      }
    }

    // Swipe left to close menu
    if (swipeDistance < -swipeThreshold) {
      if (document.getElementById('mobileNav').classList.contains('active')) {
        closeMobileMenu();
      }
    }
  }

  // Initialize tabbar active states if on mobile
  if (isMobile()) {
    updateNavActiveStates();
  }
}

// Init
window.addEventListener('DOMContentLoaded', () => {
  // Initialize mobile features first
  initializeMobileFeatures();

  // Show home page
  showPage('home');

  // Preload booking widgets to avoid first-time jank
  renderDates();
  renderTimeSlots();
  calcFees();
  updateSummary();

  // Set initial navigation state
  updateNavActiveStates();

  // Initialize enhanced booking interface
  initializeEnhancedBooking();
});

function initializeEnhancedBooking() {
  // Set up booking step navigation
  updateBookingSteps();
  updateProgressIndicator();
  updateFooterButtons();

  // Add enhanced interactions to existing elements
  const timeSlots = document.querySelectorAll('.time-slot');
  timeSlots.forEach(slot => {
    // Add long press for details
    let pressTimer;
    slot.addEventListener('mousedown', () => {
      pressTimer = setTimeout(() => {
        showSlotDetails(slot);
      }, 500);
    });

    slot.addEventListener('mouseup', () => {
      clearTimeout(pressTimer);
    });

    slot.addEventListener('mouseleave', () => {
      clearTimeout(pressTimer);
    });
  });

  // Add scroll listeners for sticky summary
  let lastScrollTop = 0;
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const summary = document.querySelector('.sticky-summary');

    if (summary && scrollTop > lastScrollTop && scrollTop > 200) {
      // Scrolling down - hide summary header
      summary.classList.add('compact');
    } else if (summary) {
      // Scrolling up - show full summary
      summary.classList.remove('compact');
    }
    lastScrollTop = scrollTop;
  });
}

function showSlotDetails(slot) {
  const slotTime = slot.dataset.slot;
  const isAvailable = slot.classList.contains('available');
  const isPeak = isPeakHour(slotTime.split('-')[0]);

  const details = `
    <div class="slot-details-popup">
      <h4>时间详情</h4>
      <p><strong>时间:</strong> ${slotTime}</p>
      <p><strong>状态:</strong> ${isAvailable ? '可预订' : '已预订'}</p>
      <p><strong>类型:</strong> ${isPeak ? '高峰时段 (+15%)' : '普通时段'}</p>
      ${isPeak ? '<p class="peak-notice">⚡ 高峰时段价格稍高</p>' : ''}
    </div>
  `;

  showToast(isAvailable ? `${slotTime} 可预订` : `${slotTime} 已预订`, 2000);
}

function isPeakHour(hour) {
  const h = parseInt(hour.split(':')[0]);
  return h >= 18 || h <= 8; // Evening or early morning
}