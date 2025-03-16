'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}

// experience-calculator.js

document.addEventListener("DOMContentLoaded", () => {
  function calculateDuration(startDate, endDate) {
    const start = new Date(startDate)
    const end = endDate === "present" ? new Date() : new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)

    let duration = ""
    if (years > 0) {
      duration += `${years} yr${years > 1 ? "s" : ""}`
    }
    if (months > 0) {
      if (duration) duration += ", "
      duration += `${months} mo${months > 1 ? "s" : ""}`
    }
    return duration
  }

  function updateDurations() {
    const timelineItems = document.querySelectorAll(".timeline-item span[data-start-date]")
    timelineItems.forEach((item) => {
      const startDate = item.getAttribute("data-start-date")
      const endDate = item.getAttribute("data-end-date")
      const durationElement = item.querySelector(".duration")

      if (durationElement) {
        const duration = calculateDuration(startDate, endDate)
        durationElement.textContent = duration
      } else if (endDate === "present") {
        const duration = calculateDuration(startDate, "present")
        item.textContent = `${item.textContent.split("—")[0]}— Present • ${duration}`
      }
    })
  }

  // Initial update
  updateDurations()

  // Update durations every minute
  setInterval(updateDurations, 60000)
})

// toasttt

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-form]")
  const inputs = form.querySelectorAll("[data-form-input]")
  const submitBtn = form.querySelector("[data-form-btn]")
  const submitBtnText = submitBtn.querySelector("span")
  const toast = document.getElementById("toast")

  function checkFormValidity() {
    const isValid = Array.from(inputs).every((input) => input.value.trim() !== "")
    submitBtn.disabled = !isValid
  }

  inputs.forEach((input) => {
    input.addEventListener("input", checkFormValidity)
  })

  function showToast(message, isSuccess) {
    toast.innerHTML = `
            <div class="toast__icon">
                <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="m13 13h-2v-6h2zm0 4h-2v-2h2zm-1-15c-1.3132 0-2.61358.25866-3.82683.7612-1.21326.50255-2.31565 1.23915-3.24424 2.16773-1.87536 1.87537-2.92893 4.41891-2.92893 7.07107 0 2.6522 1.05357 5.1957 2.92893 7.0711.92859.9286 2.03098 1.6651 3.24424 2.1677 1.21325.5025 2.51363.7612 3.82683.7612 2.6522 0 5.1957-1.0536 7.0711-2.9289 1.8753-1.8754 2.9289-4.4189 2.9289-7.0711 0-1.3132-.2587-2.61358-.7612-3.82683-.5026-1.21326-1.2391-2.31565-2.1677-3.24424-.9286-.92858-2.031-1.66518-3.2443-2.16773-1.2132-.50254-2.5136-.7612-3.8268-.7612z" fill="#fff"></path>
                </svg>
            </div>
            <div class="toast__title">${message}</div>
            <div class="toast__close">
                <svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z" fill="#fff"></path>
                </svg>
            </div>
        `
    toast.className = `toast ${isSuccess ? "success" : "error"} show`
    setTimeout(() => {
      toast.className = "toast"
    }, 3000)

    const closeBtn = toast.querySelector(".toast__close")
    closeBtn.addEventListener("click", () => {
      toast.className = "toast"
    })
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault()
    submitBtn.disabled = true
    const originalText = submitBtnText.textContent
    submitBtnText.textContent = "Sending..."

    const formData = new FormData(form)
    fetch(form.action, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showToast("Message sent successfully!", true)
          form.reset()
          checkFormValidity()
        } else {
          showToast("Unable to send message! Please try again.", false)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        showToast("Unable to send message! Please try again.", false)
      })
      .finally(() => {
        submitBtn.disabled = false
        submitBtnText.textContent = originalText
      })
  })
})


