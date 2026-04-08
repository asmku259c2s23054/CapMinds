document.addEventListener('DOMContentLoaded', function() {

    // getting all elements
    const navCalendarBtn = document.querySelector('[data-target="calendarView"]');
    const navDashboardBtn = document.querySelector('[data-target="dashboardView"]');
    const calendarView = document.getElementById('calendarView');
    const dashboardView = document.getElementById('dashboardView');
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');

    const appointmentModal = document.getElementById('appointmentModal');
    const headerBookBtn = document.getElementById('headerBookBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const appointmentForm = document.getElementById('appointmentForm');

    // dashboard things
    const appointmentTableBody = document.getElementById('appointmentTableBody');
    const searchPatient = document.getElementById('searchPatient');
    const searchDoctor = document.getElementById('searchDoctor');
    const filterStartDate = document.getElementById('filterStartDate');
    const filterEndDate = document.getElementById('filterEndDate');
    const btnUpdateFilter = document.getElementById('btnUpdateFilter');

    // calendar things
    const calCurrentMonthYear = document.getElementById('calCurrentMonthYear');
    const calendarGridBody = document.getElementById('calendarGridBody');
    let currentCalDate = new Date(); 
    let editingId = null;

    // fetch from localstorage
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

    // init app
    renderDashboard();
    renderCalendar();
    
    // click events
    navCalendarBtn.addEventListener('click', () => switchView('calendar'));
    navDashboardBtn.addEventListener('click', () => switchView('dashboard'));
    
    toggleSidebarBtn.addEventListener('click', function() {
        sidebar.classList.toggle('expanded');
    });

    headerBookBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    
    appointmentForm.addEventListener('submit', handleFormSubmit);

    // filtering
    btnUpdateFilter.addEventListener('click', renderDashboard);
    searchPatient.addEventListener('input', renderDashboard);
    searchDoctor.addEventListener('input', renderDashboard);

    // calender navigation
    document.getElementById('calPrevBtn').addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('calNextBtn').addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() + 1);
        renderCalendar();
    });
    document.getElementById('calTodayBtn').addEventListener('click', () => {
        currentCalDate = new Date();
        renderCalendar();
    });

    document.getElementById('calDoctorFilter').addEventListener('change', () => {
        renderCalendar();
    });

    // functions
    function switchView(viewName) {
        if (viewName === 'calendar') {
            navCalendarBtn.classList.add('active');
            navDashboardBtn.classList.remove('active');
            calendarView.style.display = 'block';
            dashboardView.style.display = 'none';
            renderCalendar(); 
        } else {
            navDashboardBtn.classList.add('active');
            navCalendarBtn.classList.remove('active');
            dashboardView.style.display = 'block';
            calendarView.style.display = 'none';
        }
    }

    function openModal(item = null) {
        appointmentModal.classList.add('show');
        const dateEl = document.getElementById('fieldDate');
        const timeEl = document.getElementById('fieldTime');

        if (item) {
            editingId = item.id;
            document.getElementById('editAppointmentId').value = item.id;
            document.getElementById('fieldPatient').value = item.patient;
            document.getElementById('fieldDoctor').value = item.doctor;
            document.getElementById('fieldHospital').value = item.hospital;
            document.getElementById('fieldSpecialty').value = item.specialty;
            dateEl.type = 'date';
            dateEl.value = item.date;
            timeEl.type = 'time';
            timeEl.value = item.time;
            document.getElementById('fieldReason').value = item.reason;
        } else {
            editingId = null;
            appointmentForm.reset();
            dateEl.type = 'text';
            timeEl.type = 'text';
            document.getElementById('editAppointmentId').value = '';
        }
    }

    function closeModal() {
        appointmentModal.classList.remove('show');
        appointmentForm.reset();
        editingId = null;
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        const newApt = {
            id: editingId ? editingId : Date.now().toString(),
            patient: document.getElementById('fieldPatient').value,
            doctor: document.getElementById('fieldDoctor').value,
            hospital: document.getElementById('fieldHospital').value,
            specialty: document.getElementById('fieldSpecialty').value,
            date: document.getElementById('fieldDate').value,
            time: document.getElementById('fieldTime').value,
            reason: document.getElementById('fieldReason').value
        };

        if (editingId) {
            const index = appointments.findIndex(a => a.id === editingId);
            if (index !== -1) {
                appointments[index] = newApt;
            }
        } else {
            appointments.push(newApt);
        }

        saveData();
        closeModal();
        renderDashboard();
        renderCalendar();
    }

    window.deleteAppt = function(id) {
        if(confirm('Are you sure you want to delete this appointment?')) {
            appointments = appointments.filter(a => a.id !== id);
            saveData();
            renderDashboard();
            renderCalendar();
        }
    }

    window.editAppt = function(id) {
        let apt = appointments.find(a => a.id === id);
        if (apt) {
            openModal(apt);
        }
    }

    function saveData() {
        localStorage.setItem('appointments', JSON.stringify(appointments));
    }

    function renderDashboard() {
        appointmentTableBody.innerHTML = '';
        
        let pSearch = searchPatient.value.toLowerCase();
        let dSearch = searchDoctor.value.toLowerCase();
        let start = filterStartDate.value;
        let end = filterEndDate.value;

        // filter data
        let filteredData = appointments.filter(apt => {
            let pMatch = apt.patient.toLowerCase().includes(pSearch);
            let dMatch = apt.doctor.toLowerCase().includes(dSearch);
            
            let dateMatch = true;
            if (start && end) {
                dateMatch = (apt.date >= start && apt.date <= end);
            } else if (start) {
                dateMatch = apt.date >= start;
            } else if (end) {
                dateMatch = apt.date <= end;
            }

            return pMatch && dMatch && dateMatch;
        });

        // show in table
        filteredData.forEach(apt => {
            let tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td class="text-blue">${apt.patient}</td>
                <td class="text-blue">${apt.doctor}</td>
                <td>${apt.hospital}</td>
                <td>${apt.specialty}</td>
                <td>${formatDateToDMY(apt.date)}</td>
                <td class="text-blue">${apt.time}</td>
                <td>
                    <button class="action-btn edit" onclick="editAppt('${apt.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn delete" onclick="deleteAppt('${apt.id}')"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            appointmentTableBody.appendChild(tr);
        });

        if (filteredData.length === 0) {
            appointmentTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: #6b7280;">No appointments found.</td></tr>`;
        }
    }

    function renderCalendar() {
        calendarGridBody.innerHTML = '';
        
        let year = currentCalDate.getFullYear();
        let month = currentCalDate.getMonth();
        
        let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        calCurrentMonthYear.textContent = monthNames[month] + " " + year;

        let firstDay = new Date(year, month, 1).getDay(); 
        let daysInMonth = new Date(year, month + 1, 0).getDate();
        let daysInPrevMonth = new Date(year, month, 0).getDate();

        let today = getIsoDate(new Date());

        for (let i = 0; i < 42; i++) {
            let cell = document.createElement('div');
            cell.className = 'cal-cell';

            let cellDate = '';
            let dayNum = 0;

            if (i < firstDay) {
                cell.classList.add('other-month');
                dayNum = daysInPrevMonth - firstDay + i + 1;
                let prevD = new Date(year, month - 1, dayNum);
                cellDate = getIsoDate(prevD);
            } else if (i >= firstDay && i < firstDay + daysInMonth) {
                dayNum = i - firstDay + 1;
                let currD = new Date(year, month, dayNum);
                cellDate = getIsoDate(currD);
                
                if (cellDate === today) {
                    cell.style.backgroundColor = '#eff6ff'; // highlight today
                }
            } else {
                cell.classList.add('other-month');
                dayNum = i - firstDay - daysInMonth + 1;
                let nextD = new Date(year, month + 1, dayNum);
                cellDate = getIsoDate(nextD);
            }

            cell.innerHTML = `<div class="cal-date-number">${dayNum}</div>`;

            // show events
            let dayEvents = getAppointmentsForDate(cellDate);
            
            dayEvents.forEach(apt => {
                let div = document.createElement('div');
                div.className = 'cal-event';
                
                div.innerHTML = `
                    <div class="event-details">
                        <i class="fa-solid fa-person-walking"></i>
                        <span>${apt.patient} - ${apt.time}</span>
                    </div>
                    <div class="event-actions">
                        <i class="fa-solid fa-pen cal-edit-btn" onclick="editAppt('${apt.id}')"></i>
                        <i class="fa-solid fa-file-lines cal-info-btn" title="Reason: ${apt.reason}"></i>
                        <i class="fa-solid fa-trash-can cal-del-btn" onclick="deleteAppt('${apt.id}')"></i>
                    </div>
                `;
                cell.appendChild(div);
            });

            calendarGridBody.appendChild(cell);
        }
    }

    function getAppointmentsForDate(dateStr) {
        let pSearch = searchPatient.value.toLowerCase();
        let dSearch = searchDoctor.value.toLowerCase();
        let selectedDoc = document.getElementById('calDoctorFilter').value; 

        return appointments.filter(apt => {
            if (apt.date !== dateStr) return false;
            
            let matchP = apt.patient.toLowerCase().includes(pSearch);
            let matchD = true;
            
            if (dSearch) {
                matchD = apt.doctor.toLowerCase().includes(dSearch);
            } else if (selectedDoc) {
                matchD = (apt.doctor === selectedDoc);
            }

            return matchP && matchD;
        });
    }

    // util functions
    function getIsoDate(d) {
        let y = d.getFullYear();
        let m = String(d.getMonth() + 1).padStart(2, '0');
        let day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function formatDateToDMY(iso) {
        if (!iso) return '';
        let parts = iso.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return iso;
    }

    // add mock data if empty (for demo)
    if (appointments.length === 0) {
        appointments = [
            { id: '1', patient: 'Henry James', doctor: 'James Marry', hospital: 'Salus Center (General Hospital)', specialty: 'Dermatology', date: '2023-01-18', time: '09:00 AM', reason: 'Checkup' },
            { id: '2', patient: 'Jane Smith', doctor: 'James Marry', hospital: 'Ultracare (General Hospital)', specialty: 'Dermatology', date: getIsoDate(new Date()), time: '12:00 PM', reason: 'Follow up' }
        ];
        saveData();
    }
});
