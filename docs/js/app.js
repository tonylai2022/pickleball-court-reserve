'use strict';

// Simple SPA state
const state = {
  currentPage: 'home',
  history: [],
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
    addons: { paddles: 0, balls: 0 },
    promo: null,
    isMember: false,
    fees: { base: 0, addons: 0, discount: 0, service: 0, tax: 0, total: 0 },
    selectedSlots: [] // array of {start,end}
  }
};

// Utils
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const show = el => el.classList.add('active');
const hide = el => el.classList.remove('active');

function showToast(message, duration = 2000){
  const toast = $('#toast');
  $('#toast-message').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function openModal({ title = '提示', message = '', onConfirm = null, confirmText = '确定', cancelText = '取消', showCancel = true } = {}){
  $('#modal-title').textContent = title;
  $('#modal-message').textContent = message;
  const overlay = $('#modal-overlay');
  const confirmBtn = $('#modal-confirm');
  const cancelBtn = $('#modal-cancel');
  confirmBtn.textContent = confirmText;
  cancelBtn.textContent = cancelText;
  if(showCancel){ cancelBtn.style.display = 'inline-flex'; } else { cancelBtn.style.display = 'none'; }
  confirmBtn.onclick = () => { closeModal(); onConfirm && onConfirm(); };
  showModal();
}
function showModal(){ $('#modal-overlay').classList.add('show'); }
function closeModal(){ $('#modal-overlay').classList.remove('show'); }
function setLoading(isLoading){ $('#loading').classList.toggle('show', isLoading); }

// Navigation
function showPage(pageId){
  const pages = $$('.page');
  pages.forEach(p => hide(p));
  const map = {
    home: '#home-page',
    booking: '#booking-page',
    payment: '#payment-page',
    success: '#success-page',
    about: '#about-page',
    terms: '#terms-page',
    privacy: '#privacy-page'
  };
  const target = $(map[pageId]);
  if(!target) return;
  if(state.currentPage !== pageId){ state.history.push(state.currentPage); }
  state.currentPage = pageId;
  show(target);
}
function goBack(){
  if(state.history.length === 0){ return showPage('home'); }
  const prev = state.history.pop();
  showPage(prev);
}
function goHome(){ state.history = []; showPage('home'); }

// Home
function openBooking(){
  showPage('booking');
  renderDates();
  renderTimeSlots();
  updateSummary();
}

// Booking - Dates and times
function renderDates(){
  const container = $('#dateScroll');
  const today = new Date();
  const items = [];
  for(let i=0;i<14;i++){
    const d = new Date(today);
    d.setDate(today.getDate()+i);
    const dayName = d.toLocaleDateString('zh-CN', { weekday:'short' });
    const dateStr = d.toLocaleDateString('zh-CN', { month:'2-digit', day:'2-digit' });
    const iso = d.toISOString().slice(0,10);
    const active = state.booking.date === iso ? ' active' : '';
    items.push(`<div class="date-chip${active}" data-date="${iso}" onclick="selectDate('${iso}')">
      <span class="day">${dayName}</span>
      <span class="date">${dateStr}</span>
    </div>`);
  }
  container.innerHTML = items.join('');
}

function selectDate(iso){
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

function renderTimeSlots(){
  const container = $('#timeGrid');
  const items = [];
  const startHour = 8, endHour = 22; // 08:00-22:00
  for(let h = startHour; h < endHour; h++){
    const start = String(h).padStart(2,'0') + ':00';
    const end = String(h+1).padStart(2,'0') + ':00';
    const key = `${start}-${end}`;
    const active = state.booking.selectedSlots.some(s => s.start === start) ? ' active' : '';
    items.push(`<div class="time-slot${active}" data-key="${key}" onclick="toggleSlot('${start}','${end}')">${start} - ${end}</div>`);
  }
  container.innerHTML = items.join('');
}

function toggleSlot(start, end){
  const sel = state.booking.selectedSlots;
  sel.sort((a,b) => a.start.localeCompare(b.start));
  const first = sel[0];
  const last = sel[sel.length-1];
  const existsIdx = sel.findIndex(s => s.start === start);
  if(existsIdx >= 0){
    // Allow deselect only at the ends to keep contiguous
    if(first && start === first.start){ sel.shift(); }
    else if(last && start === last.start){ sel.pop(); }
    // ignore if middle
  } else {
    if(sel.length === 0){
      sel.push({ start, end });
    } else if(last && start === last.end){
      sel.push({ start, end });
    } else if(first && end === first.start){
      sel.unshift({ start, end });
    } else {
      // Non-adjacent click ignored to enforce contiguous selection
    }
  }
  normalizeSlots();
  calcFees();
  renderTimeSlots();
  updateSummary();
  $('#confirmBooking').disabled = !(state.booking.date && state.booking.selectedSlots.length>0);
}

function normalizeSlots(){
  if(state.booking.selectedSlots.length === 0){
    state.booking.startTime = null;
    state.booking.endTime = null;
    state.booking.hours = 0;
    return;
  }
  // Selected slots are maintained contiguous; just read first/last
  const first = state.booking.selectedSlots[0];
  const last = state.booking.selectedSlots[state.booking.selectedSlots.length-1];
  state.booking.startTime = first.start;
  state.booking.endTime = last.end;
  state.booking.hours = state.booking.selectedSlots.length;
}

function updateSummary(){
  $('#selectedDate').textContent = state.booking.date ? state.booking.date : '请选择日期';
  const hoursText = state.booking.hours ? `（共 ${state.booking.hours} 小时）` : '';
  $('#selectedTime').textContent = state.booking.startTime ? `${state.booking.startTime} - ${state.booking.endTime} ${hoursText}` : '请选择时间';
  renderFeeBreakdown('feeBreakdown');
  $('#totalPrice').textContent = `¥${state.booking.fees.total || 0}`;
  // per-person on booking page
  const per = state.booking.players>0 ? Math.round((state.booking.fees.total/state.booking.players)*100)/100 : 0;
  $('#perPerson').textContent = `人均 ¥${per}`;
  // update qty labels
  $('#qty-paddles').textContent = state.booking.addons.paddles;
  $('#qty-balls').textContent = state.booking.addons.balls;
  const qp = document.getElementById('qty-players');
  if(qp){ qp.textContent = state.booking.players; }
}

function goToPayment(){
  if(!state.booking.date || !state.booking.startTime){
    return showToast('请选择日期和时间');
  }
  showPage('payment');
  renderOrder();
}

// Payment
function renderOrder(){
  const b = state.booking;
  const details = [
    ['球场', b.court],
    ['日期', b.date],
    ['时间', `${b.startTime} - ${b.endTime}`],
    ['时长', `${b.hours} 小时`],
    ['参与人数', `${b.players} 人`]
  ];
  $('#orderDetails').innerHTML = details.map(([k,v]) => `<div class="order-row"><span>${k}</span><span>${v}</span></div>`).join('');
  renderFeeBreakdown('feeBreakdownPay');
  $('#paymentAmount').textContent = `¥${b.fees.total}`;
  const agree = document.getElementById('agreeTerms');
  if(agree){ agree.checked = false; }
  const payBtn = document.getElementById('payNow');
  if(payBtn){ payBtn.disabled = true; }
}

function processPayment(){
  openModal({
    title:'微信支付',
  message:`将支付 ¥${state.booking.fees.total}，用于预订${state.booking.court}。\n本演示站仅模拟支付流程。`,
    confirmText:'确认支付',
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

function toSuccess(){
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
  $('#bookingDetails').innerHTML = rows.map(([k,v]) => `<div class="detail-row"><span class="detail-label">${k}</span><span class="detail-value">${v}</span></div>`).join('');
  const per = state.booking.players>0 ? Math.round((state.booking.fees.total/state.booking.players)*100)/100 : 0;
  $('#perPersonSuccess').textContent = `人均 ¥${per}`;
}

// Success actions
function copyBookingNumber(){
  const text = state.booking.confirmationNumber;
  if(navigator.clipboard){
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

function shareBooking(){
  const shareData = {
    title: 'TRK 匹克球场预订',
    text: `我在 ${state.booking.date} ${state.booking.startTime}-${state.booking.endTime} 预订了球场，一起来打球吧！`,
    url: location.href
  };
  if(navigator.share){
    navigator.share(shareData).catch(()=>{});
  } else {
    copyBookingNumber();
    openModal({ title:'分享', message:'已复制预订编号，可粘贴给好友。' });
  }
}

function addToCalendar(){
  // Create simple .ics content
  const start = `${state.booking.date}T${state.booking.startTime.replace(':','')}00`;
  const end = `${state.booking.date}T${state.booking.endTime.replace(':','')}00`;
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:匹克球 - ${state.booking.court}\nDTSTART:${start}\nDTEND:${end}\nLOCATION:${state.booking.courtAddress}\nDESCRIPTION:预订编号 ${state.booking.confirmationNumber}\nEND:VEVENT\nEND:VCALENDAR`;
  const blob = new Blob([ics], { type:'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'booking.ics'; a.click();
  URL.revokeObjectURL(url);
}

function contactSupport(){ makePhoneCall(state.booking.courtPhone); }
function openMap(){
  const query = encodeURIComponent('TRK 达鲁酷运动餐酒吧 友邦金融中心');
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
}
function makePhoneCall(tel){ window.location.href = `tel:${tel}`; }

// Helpers
function genConfirmationNumber(){
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2,6).toUpperCase();
  return `TRK-${t}-${r}`;
}

// Pricing and fees
function isWeekend(dateStr){
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay();
  return day === 0 || day === 6;
}
function isPeak(start){
  const hour = parseInt(start.split(':')[0],10);
  return hour >= 18; // 18:00+ as peak
}
function calcFees(){
  const b = state.booking;
  // base hours and dynamic per-slot pricing
  let base = 0;
  const weekendUp = isWeekend(b.date) ? 1.2 : 1.0; // 20% weekend uplift
  const slots = b.selectedSlots;
  slots.forEach(s => {
    const peakUp = isPeak(s.start) ? 1.15 : 1.0; // 15% peak uplift evenings
    base += b.pricePerHour * weekendUp * peakUp;
  });
  const addons = b.addons.paddles * 20 + b.addons.balls * 10;
  let subtotal = base + addons;
  // discounts
  let discount = 0;
  if(b.isMember){ discount += subtotal * 0.10; }
  if(b.promo === 'PICKLE10'){ discount += subtotal * 0.10; }
  subtotal = Math.max(0, subtotal - discount);
  // fees and tax
  const service = subtotal * 0.05; // 5% service fee
  const tax = subtotal * 0.06; // 6% tax
  const total = round2(subtotal + service + tax);
  b.fees = {
    base: round2(base),
    addons: round2(addons),
    discount: round2(discount),
    service: round2(service),
    tax: round2(tax),
    total
  };
  b.amount = total;
}
function round2(n){ return Math.round(n*100)/100; }

function renderFeeBreakdown(targetId){
  const el = document.getElementById(targetId);
  const f = state.booking.fees;
  const parts = [];
  parts.push(`<div class="fee-row"><span>基础费用</span><span>¥${f.base}</span></div>`);
  if(state.booking.addons.paddles>0 || state.booking.addons.balls>0){
    const addonsLabel = [];
    if(state.booking.addons.paddles>0) addonsLabel.push(`球拍×${state.booking.addons.paddles}`);
    if(state.booking.addons.balls>0) addonsLabel.push(`球×${state.booking.addons.balls}`);
    parts.push(`<div class="fee-row"><span>增值服务 <span class="badge">${addonsLabel.join('，')}</span></span><span>¥${f.addons}</span></div>`);
  }
  if(state.booking.isMember || state.booking.promo){
    const tags = [];
    if(state.booking.isMember) tags.push('会员9折');
    if(state.booking.promo) tags.push(`优惠码 ${state.booking.promo}`);
    parts.push(`<div class="fee-row"><span class="muted">优惠 <span class="badge">${tags.join(' + ')}</span></span><span class="muted">-¥${f.discount}</span></div>`);
  }
  parts.push(`<div class="fee-row"><span>服务费 (5%)</span><span>¥${f.service}</span></div>`);
  parts.push(`<div class="fee-row"><span>税费 (6%)</span><span>¥${f.tax}</span></div>`);
  parts.push(`<div class="fee-row total"><span>合计</span><span>¥${f.total}</span></div>`);
  el.innerHTML = parts.join('');
}

// Handlers for UI controls
function changeAddonQty(key, delta){
  const b = state.booking;
  b.addons[key] = Math.max(0, (b.addons[key] || 0) + delta);
  calcFees();
  updateSummary();
}
function changePlayers(delta){
  state.booking.players = Math.max(1, state.booking.players + delta);
  updateSummary();
}
function applyPromo(){
  const code = ($('#promoInput').value || '').trim().toUpperCase();
  state.booking.promo = code || null;
  calcFees();
  updateSummary();
}
function toggleMember(checked){
  state.booking.isMember = !!checked;
  calcFees();
  updateSummary();
}
function togglePayEnabled(){
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
window.togglePayEnabled = togglePayEnabled;

// Init
window.addEventListener('DOMContentLoaded', () => {
  showPage('home');
  // preload booking widgets to avoid first-time jank
  renderDates();
  renderTimeSlots();
  calcFees();
  updateSummary();
});
