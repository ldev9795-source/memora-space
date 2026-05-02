import { icons } from "../components/icons.js";

const slides = [
  {
    eyebrow: "Capture",
    title: "Your day, one quiet timeline.",
    copy: "Tasks, notes, reminders, and small thoughts live together without clutter.",
    icon: icons.today
  },
  {
    eyebrow: "Plan",
    title: "Calendar that behaves like mobile.",
    copy: "Tap dates, jump weeks, create reminders, and keep the selected day readable.",
    icon: icons.calendar
  },
  {
    eyebrow: "Save",
    title: "Folders for everything later.",
    copy: "Create personal spaces, file paused tasks, and bring them back when they matter.",
    icon: icons.stash
  }
];

export function OnboardingView(state, actions) {
  const root = document.createElement("main");
  root.className = "onboarding-page page";
  const slide = slides[state.onboardingStep] || slides[0];
  const isLast = state.onboardingStep === slides.length - 1;

  root.innerHTML = `
    <section class="onboarding-card glass">
      <div class="onboarding-top">
        <span class="onboarding-brand">${icons.brand}<span class="mono-label">Memora Space</span></span>
        <button type="button" class="onboarding-skip">Skip</button>
      </div>
      <div class="onboarding-visual">
        <span>${slide.icon}</span>
      </div>
      <div class="onboarding-copy">
        <span class="mono-label">${slide.eyebrow}</span>
        <h1>${slide.title}</h1>
        <p>${slide.copy}</p>
      </div>
      <div class="onboarding-dots" aria-label="Onboarding progress">
        ${slides.map((_, index) => `<span class="${index === state.onboardingStep ? "active" : ""}"></span>`).join("")}
      </div>
      <div class="onboarding-actions">
        <button type="button" class="secondary" ${state.onboardingStep === 0 ? "disabled" : ""}>Back</button>
        <button type="button" class="primary">${isLast ? "Continue" : "Next"}</button>
      </div>
    </section>
  `;

  root.querySelector(".onboarding-skip").addEventListener("click", actions.onFinishOnboarding);
  root.querySelector(".secondary").addEventListener("click", actions.onPrevOnboarding);
  root.querySelector(".primary").addEventListener("click", isLast ? actions.onFinishOnboarding : actions.onNextOnboarding);
  return root;
}
