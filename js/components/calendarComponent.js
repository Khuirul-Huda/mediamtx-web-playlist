// ============================================
// Calendar Component
// ============================================

import DOM from '../config/domElements.js';
import appState from '../state/appState.js';
import { fetchRecordings } from '../services/recordingService.js';

// Set filter dates
export function setFilterDates(start, end) {
    const toLocalIso = (date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };
    DOM.filterStart.value = toLocalIso(start);
    DOM.filterEnd.value = toLocalIso(end);
}

// Set today's date
export function setToday() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    
    setFilterDates(start, end);
    appState.selectedDate = now;
    renderCalendar();
    
    if (appState.currentChannel) {
        fetchRecordings();
    }
}

// Render calendar
export function renderCalendar() {
    if (!DOM.calendarGrid || !DOM.currentMonthYear) return;
    
    DOM.calendarGrid.innerHTML = '';
    
    const year = appState.currentCalendarDate.getFullYear();
    const month = appState.currentCalendarDate.getMonth();
    
    DOM.currentMonthYear.innerText = new Date(year, month).toLocaleString('default', {
        month: 'long',
        year: 'numeric'
    });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Empty slots
    for (let i = 0; i < firstDay; i++) {
        const el = document.createElement('div');
        el.className = 'calendar-day empty';
        DOM.calendarGrid.appendChild(el);
    }
    
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const el = document.createElement('div');
        el.className = 'calendar-day';
        el.innerText = day;
        
        // Check if Today
        const today = new Date();
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            el.classList.add('today');
        }
        
        // Check if Selected
        if (day === appState.selectedDate.getDate() && 
            month === appState.selectedDate.getMonth() && 
            year === appState.selectedDate.getFullYear()) {
            el.classList.add('active');
        }
        
        el.onclick = () => {
            appState.selectedDate = new Date(year, month, day);
            const start = new Date(appState.selectedDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(appState.selectedDate);
            end.setHours(23, 59, 59, 999);
            setFilterDates(start, end);
            renderCalendar();
            
            if (appState.currentChannel) {
                fetchRecordings();
            }
        };
        
        DOM.calendarGrid.appendChild(el);
    }
}

// Navigate to previous month
export function prevMonth() {
    appState.currentCalendarDate.setMonth(appState.currentCalendarDate.getMonth() - 1);
    renderCalendar();
}

// Navigate to next month
export function nextMonth() {
    appState.currentCalendarDate.setMonth(appState.currentCalendarDate.getMonth() + 1);
    renderCalendar();
}

// Initialize calendar event listeners
export function initCalendar() {
    if (DOM.prevMonth) {
        DOM.prevMonth.onclick = prevMonth;
    }
    
    if (DOM.nextMonth) {
        DOM.nextMonth.onclick = nextMonth;
    }
}
