const form = document.getElementById('bookingForm');
const responseBox = document.getElementById('response');

document.getElementById('date').min = new Date().toISOString().split('T')[0];

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button');
  btn.disabled = true;
  btn.textContent = "Processing...";

  const name = form.name.value;
  const email = form.email.value;
  const date = form.date.value;
  const startTime = form.startTime.value;
  const duration = parseInt(form.duration.value);

  try {
    const res = await fetch('http://<YOUR_EC2_IP>/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, date, startTime, duration })
    });
    const data = await res.json();

    if (res.ok) {
      responseBox.className = 'message success';
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(start.getTime() + duration * 60000);
      const toGoogleTime = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '');

      const calendarUrl = new URL('https://calendar.google.com/calendar/render');
      calendarUrl.searchParams.set('action', 'TEMPLATE');
      calendarUrl.searchParams.set('text', `Appointment with ${name}`);
      calendarUrl.searchParams.set('dates', `${toGoogleTime(start)}/${toGoogleTime(end)}`);
      calendarUrl.searchParams.set('details', `WAT Scheduling System booking for ${name}`);
      calendarUrl.searchParams.set('location', 'Online');

      responseBox.innerHTML = `
        <strong>Booking Confirmed!</strong><br/>
        <p>${data.time}</p>
        <a href="${calendarUrl}" target="_blank">📅 Add to Google Calendar</a>
      `;
      form.reset();
    } else {
      responseBox.className = 'message error';
      responseBox.textContent = data.error || 'Booking failed. Try again.';
    }
  } catch {
    responseBox.className = 'message error';
    responseBox.textContent = 'Connection error. Try again later.';
  } finally {
    responseBox.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Book Appointment';
  }
});
