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
    confirmationNumber: ''
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
    const active = state.booking.startTime === start ? ' active' : '';
    items.push(`<div class="time-slot${active}" data-key="${key}" onclick="selectTime('${start}','${end}')">${start} - ${end}</div>`);
  }
  container.innerHTML = items.join('');
}

function selectTime(start, end){
  state.booking.startTime = start;
  state.booking.endTime = end;
  state.booking.hours = 1;
  state.booking.amount = state.booking.hours * state.booking.pricePerHour;
  renderTimeSlots();
  updateSummary();
  $('#confirmBooking').disabled = !(state.booking.date && state.booking.startTime);
}

function updateSummary(){
  $('#selectedDate').textContent = state.booking.date ? state.booking.date : '请选择日期';
  $('#selectedTime').textContent = state.booking.startTime ? `${state.booking.startTime} - ${state.booking.endTime}` : '请选择时间';
  $('#totalPrice').textContent = `¥${state.booking.amount || 0}`;
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
    ['单价', `¥${b.pricePerHour}/小时`],
    ['时长', `${b.hours} 小时`]
  ];
  $('#orderDetails').innerHTML = details.map(([k,v]) => `<div class="order-row"><span>${k}</span><span>${v}</span></div>`).join('');
  $('#paymentAmount').textContent = `¥${b.amount}`;
}

function processPayment(){
  openModal({
    title:'微信支付',
    message:`将支付 ¥${state.booking.amount}，用于预订${state.booking.court}。\n本演示站仅模拟支付流程。`,
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
    ['时间', `${state.booking.startTime} - ${state.booking.endTime}`],
    ['支付方式', '微信支付'],
    ['实付金额', `¥${state.booking.amount}`]
  ];
  $('#bookingDetails').innerHTML = rows.map(([k,v]) => `<div class="detail-row"><span class="detail-label">${k}</span><span class="detail-value">${v}</span></div>`).join('');
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

// Expose functions for inline handlers used in HTML
window.showPage = showPage;
window.goBack = goBack;
window.goHome = goHome;
window.openBooking = openBooking;
window.selectDate = selectDate;
window.selectTime = selectTime;
window.goToPayment = goToPayment;
window.processPayment = processPayment;
window.copyBookingNumber = copyBookingNumber;
window.shareBooking = shareBooking;
window.addToCalendar = addToCalendar;
window.contactSupport = contactSupport;
window.openMap = openMap;
window.makePhoneCall = makePhoneCall;
window.closeModal = closeModal;

// Init
window.addEventListener('DOMContentLoaded', () => {
  showPage('home');
  // preload booking widgets to avoid first-time jank
  renderDates();
  renderTimeSlots();
});
