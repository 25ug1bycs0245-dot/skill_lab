const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('show');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('show');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const searchInput = document.getElementById('courseSearch');
const courseCards = document.querySelectorAll('.course-card');
const filterButtons = document.querySelectorAll('.pill');

let activeFilter = 'all';

function applyCourseFilters() {
  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';

  courseCards.forEach((card) => {
    const category = card.dataset.category || '';
    const content = card.textContent.toLowerCase();
    const matchesFilter = activeFilter === 'all' || category === activeFilter;
    const matchesSearch = !searchTerm || content.includes(searchTerm);
    const shouldShow = matchesFilter && matchesSearch;

    card.style.display = shouldShow ? 'block' : 'none';
  });
}

if (searchInput) {
  searchInput.addEventListener('input', applyCourseFilters);
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    activeFilter = button.dataset.filter || 'all';
    applyCourseFilters();
  });
});

const forms = document.querySelectorAll('form');

forms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    requiredFields.forEach((field) => {
      const isEmpty = !field.value.trim();
      if (isEmpty) {
        isValid = false;
        field.style.borderColor = '#d33';
      } else {
        field.style.borderColor = '#e8edf5';
      }
    });

    const messageBox = form.querySelector('.form-message');
    if (!messageBox) return;

    if (!isValid) {
      messageBox.textContent = 'Please complete all required fields.';
      messageBox.style.color = '#b42318';
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Submitted';
      submitButton.disabled = true;
      setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }, 1800);
    }

    messageBox.textContent = 'Your request has been submitted successfully. A counselor will contact you soon.';
    messageBox.style.color = '#123f8a';
    form.reset();
  });
});

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
