/* =========================================================
   نُقطة | استوديو رقمي
   ملف الجافاسكريبت الرئيسي — script.js
   ---------------------------------------------------------
   الوظائف:
   01. تهيئة العناصر والأدوات المساعدة
   02. الهيدر وشريط التقدم وزر العودة للأعلى
   03. قائمة الجوال
   04. تفعيل رابط القسم الحالي
   05. حركات الظهور عند التمرير
   06. عدّادات الأرقام
   07. نافذة تفاصيل المشروع
   08. نسخ البريد الإلكتروني
   09. السنة الحالية
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     01. تهيئة العناصر والأدوات المساعدة
     ======================================================= */
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefersReducedMotion = () => reduceMotionQuery.matches;

  const header = $("#site-header");
  const menuToggle = $("#menu-toggle");
  const mainNav = $("#main-nav");
  const progressBar = $("#scroll-progress-bar");
  const backToTop = $("#back-to-top");
  const navLinks = $$(".nav-link");

  const toast = $("#toast");
  const toastMessage = $("#toast-message");
  let toastTimer = null;

  /* =======================================================
     04. تفعيل رابط القسم الحالي
     ======================================================= */
  const sectionIds = ["home", "services", "why", "portfolio", "testimonials", "contact"];
  const pageSections = sectionIds
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  function updateActiveNav(scrollTop) {
    if (!pageSections.length || !navLinks.length) return;

    const viewportMarker = scrollTop + window.innerHeight * 0.32;
    let activeId = pageSections[0].id;

    pageSections.forEach(function (section) {
      const sectionTop = section.getBoundingClientRect().top + scrollTop;
      if (sectionTop <= viewportMarker) {
        activeId = section.id;
      }
    });

    /* عند الوصول لنهاية الصفحة نفعّل رابط التواصل */
    if (scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 8) {
      activeId = pageSections[pageSections.length - 1].id;
    }

    navLinks.forEach(function (link) {
      const target = link.getAttribute("href");
      const isActive = target === "#" + activeId;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  /* =======================================================
     02. الهيدر وشريط التقدم وزر العودة للأعلى
     ======================================================= */
  let scrollTicking = false;

  function getScrollTop() {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  function updateScrollUI() {
    const scrollTop = getScrollTop();
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

    /* حالة الهيدر */
    if (header) {
      header.classList.toggle("is-scrolled", scrollTop > 12);
    }

    /* شريط تقدم القراءة */
    if (progressBar) {
      const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
      progressBar.style.width = Math.min(100, Math.max(0, progress)) + "%";
    }

    /* زر العودة للأعلى */
    if (backToTop) {
      backToTop.classList.toggle("is-visible", scrollTop > 620);
    }

    updateActiveNav(scrollTop);
    scrollTicking = false;
  }

  function requestScrollUpdate() {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateScrollUI);
      scrollTicking = true;
    }
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate, { passive: true });
  window.addEventListener("load", updateScrollUI);
  updateScrollUI();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });
    });
  }

  /* =======================================================
     03. قائمة الجوال
     ======================================================= */
  function setMenuState(isOpen) {
    if (!header || !menuToggle) return;

    header.classList.toggle("nav-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "إغلاق قائمة التنقل" : "فتح قائمة التنقل"
    );
  }

  if (menuToggle && header) {
    menuToggle.addEventListener("click", function () {
      setMenuState(!header.classList.contains("nav-open"));
    });

    /* إغلاق القائمة عند اختيار أي رابط */
    $$("a", mainNav).forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuState(false);
      });
    });

    /* إغلاق القائمة عند النقر خارجها */
    document.addEventListener("click", function (event) {
      if (
        header.classList.contains("nav-open") &&
        !header.contains(event.target)
      ) {
        setMenuState(false);
      }
    });

    /* إغلاق القائمة بزر Escape */
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && header.classList.contains("nav-open")) {
        setMenuState(false);
        menuToggle.focus();
      }
    });

    /* إعادة ضبط القائمة عند العودة لسطح المكتب */
    window.addEventListener(
      "resize",
      function () {
        if (window.innerWidth > 1020) {
          setMenuState(false);
        }
      },
      { passive: true }
    );
  }

  /* =======================================================
     05. حركات الظهور عند التمرير
     ======================================================= */
  const revealElements = $$("[data-reveal]");

  /* إعطاء تأخير بسيط ومتدرج للعناصر الشقيقة */
  revealElements.forEach(function (element) {
    const parent = element.parentElement;
    if (!parent) return;

    const siblings = Array.from(parent.children).filter(function (child) {
      return child.hasAttribute("data-reveal");
    });

    const index = siblings.indexOf(element);
    if (index > 0) {
      const delay = Math.min(index, 10) * 55;
      element.style.setProperty("--reveal-delay", delay + "ms");
    }
  });

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    revealElements.forEach(function (element) {
      element.classList.add("is-visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -55px 0px"
      }
    );

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  }

  /* =======================================================
     06. عدّادات الأرقام
     ======================================================= */
  const counters = $$("[data-counter]");

  function animateCounter(element) {
    const target = Number(element.getAttribute("data-counter")) || 0;
    const suffix = element.getAttribute("data-suffix") || "";
    const duration = 1500;

    if (prefersReducedMotion()) {
      element.textContent = target + suffix;
      return;
    }

    const startTime = performance.now();

    function tick(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);

      element.textContent = value + suffix;

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        element.textContent = target + suffix;
      }
    }

    window.requestAnimationFrame(tick);
  }

  if (counters.length) {
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      counters.forEach(function (counter) {
        counter.textContent =
          (Number(counter.getAttribute("data-counter")) || 0) +
          (counter.getAttribute("data-suffix") || "");
      });
    } else {
      const counterObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.65 }
      );

      counters.forEach(function (counter) {
        counterObserver.observe(counter);
      });
    }
  }

  /* =======================================================
     07. نافذة تفاصيل المشروع
     ======================================================= */
  const projectModal = $("#project-modal");
  const modalClose = $("#modal-close");
  const modalImage = $("#modal-image");
  const modalCategory = $("#modal-category");
  const modalTitle = $("#project-modal-title");
  const modalDescription = $("#modal-description");
  const modalTags = $("#modal-tags");
  const modalYear = $("#modal-year");
  const modalScope = $("#modal-scope");
  const modalCta = $("#modal-cta");

  /* بيانات المشاريع — يمكن تعديلها أو إضافة مشاريع جديدة بسهولة */
  const projects = {
    nova: {
      title: "Nova Finance",
      category: "منصة مالية",
      image: "images/portfolio-1.svg",
      description:
        "لوحة تحكم مالية عصرية تجمع البيانات المعقدة في واجهة واضحة وسهلة. ركّزنا على بناء نظام بصري داكن أنيق، مع تسلسل معلوماتي دقيق وتجربة استخدام مريحة على الشاشات المختلفة.",
      tags: ["تصميم واجهات", "تطوير Front-end", "لوحة تحكم", "تحسين الأداء"],
      year: "2026",
      scope: "تصميم + تطوير"
    },
    lumen: {
      title: "Lumen Store",
      category: "متجر إلكتروني",
      image: "images/portfolio-2.svg",
      description:
        "متجر إلكتروني بهوية دافئة وأنيقة، صُمم ليجعل عملية التصفح والشراء بسيطة وممتعة. تم التركيز على إبراز المنتجات، بناء الثقة، وتقليل الخطوات حتى إتمام الطلب.",
      tags: ["تجارة إلكترونية", "هوية بصرية", "تجربة مستخدم", "متجاوب"],
      year: "2025",
      scope: "هوية + متجر"
    },
    atlas: {
      title: "Atlas Travel",
      category: "صفحة هبوط",
      image: "images/portfolio-3.svg",
      description:
        "صفحة هبوط لشركة سفر تهدف إلى تحويل الزائر إلى حجز مباشر. اعتمدنا على صورة بصرية جذابة، رسالة واضحة، وأزرار إجراء مدروسة لتقليل التشتت ورفع نسبة التحويل.",
      tags: ["صفحة هبوط", "تصميم بصري", "تحسين التحويل", "كتابة إعلانية"],
      year: "2025",
      scope: "تصميم + تطوير"
    },
    aura: {
      title: "Aura Studio",
      category: "هوية شخصية",
      image: "images/portfolio-4.svg",
      description:
        "موقع شخصي لمصممة مستقلة يعكس أسلوبها الهادئ والراقي. تم بناء هوية بصرية مرنة، مع مساحات بيضاء واسعة وتفاصيل بسيطة تمنح المحتوى مساحة للتألق.",
      tags: ["هوية شخصية", "موقع تعريفي", "أسلوب تحريري", "أنيميشن"],
      year: "2026",
      scope: "هوية + موقع"
    },
    pulse: {
      title: "Pulse SaaS",
      category: "منصة SaaS",
      image: "images/portfolio-5.svg",
      description:
        "واجهة تحليلات لمنصة SaaS تساعد الفرق على قراءة مؤشرات الأداء بسرعة. صُممت البطاقات والرسوم البيانية لتوصل المعلومة في لمحة، مع نظام ألوان داكن يقلل إجهاد العين.",
      tags: ["SaaS", "لوحة تحكم", "تصميم بيانات", "تطوير واجهات"],
      year: "2026",
      scope: "تصميم + تطوير"
    },
    mira: {
      title: "Mira Dining",
      category: "موقع مطعم",
      image: "images/portfolio-6.svg",
      description:
        "موقع لمطعم يقدم تجربة بصرية دافئة تشبه أجواء المكان. مزجنا بين الصور الغنية والخطوط الأنيقة وقائمة طعام واضحة، مع دعوات مباشرة للحجز والزيارة.",
      tags: ["ضيافة", "موقع تعريفي", "قائمة طعام", "تصميم فاخر"],
      year: "2025",
      scope: "تصميم + تطوير"
    }
  };

  let lastFocusedElement = null;

  function openProjectModal(projectKey) {
    const project = projects[projectKey];
    if (!project || !projectModal) return;

    lastFocusedElement = document.activeElement;

    if (modalImage) {
      modalImage.src = project.image;
      modalImage.alt = "معاينة مشروع " + project.title;
    }

    if (modalCategory) modalCategory.textContent = project.category;
    if (modalTitle) modalTitle.textContent = project.title;
    if (modalDescription) modalDescription.textContent = project.description;
    if (modalYear) modalYear.textContent = project.year;
    if (modalScope) modalScope.textContent = project.scope;

    if (modalTags) {
      modalTags.innerHTML = project.tags
        .map(function (tag) {
          return '<span class="modal-tag">' + tag + "</span>";
        })
        .join("");
    }

    document.body.classList.add("modal-open");

    if (typeof projectModal.showModal === "function") {
      projectModal.showModal();
    } else {
      projectModal.setAttribute("open", "");
    }

    if (modalClose) {
      window.setTimeout(function () {
        modalClose.focus();
      }, 50);
    }
  }

  function closeProjectModal() {
    if (!projectModal) return;

    if (typeof projectModal.close === "function" && projectModal.open) {
      projectModal.close();
    } else {
      projectModal.removeAttribute("open");
      document.body.classList.remove("modal-open");
      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
    }
  }

  $$("[data-project]").forEach(function (button) {
    button.addEventListener("click", function () {
      openProjectModal(button.getAttribute("data-project"));
    });
  });

  if (projectModal) {
    /* النقر على الخلفية يغلق النافذة */
    projectModal.addEventListener("click", function (event) {
      if (event.target === projectModal) {
        closeProjectModal();
      }
    });

    /* تنظيف الحالة عند الإغلاق بأي طريقة (Escape مثلًا) */
    projectModal.addEventListener("close", function () {
      document.body.classList.remove("modal-open");
    });
  }

  if (modalClose) {
    modalClose.addEventListener("click", closeProjectModal);
  }

  if (modalCta) {
    modalCta.addEventListener("click", function () {
      closeProjectModal();
    });
  }

  /* =======================================================
     08. نسخ البريد الإلكتروني
     ======================================================= */
  function showToast(message) {
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.add("is-visible");

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2800);
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      /* سنستخدم الطريقة الاحتياطية أدناه */
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      return copied;
    } catch (error) {
      return false;
    }
  }

  const copyEmailButton = $("#copy-email");

  if (copyEmailButton) {
    copyEmailButton.addEventListener("click", async function () {
      const email = copyEmailButton.getAttribute("data-email") || "";
      if (!email) return;

      const copied = await copyToClipboard(email);
      const label = copyEmailButton.querySelector("span");

      if (copied) {
        copyEmailButton.classList.add("is-copied");
        if (label) label.textContent = "تم النسخ";
        showToast("تم نسخ البريد الإلكتروني");

        window.setTimeout(function () {
          copyEmailButton.classList.remove("is-copied");
          if (label) label.textContent = "نسخ";
        }, 2200);
      } else {
        showToast("تعذّر النسخ تلقائيًا، يمكنك تحديد البريد يدويًا");
      }
    });
  }

  /* =======================================================
     09. السنة الحالية
     ======================================================= */
  const yearElement = $("#current-year");
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }

  /* إعادة حساب موضع الأقسام بعد تحميل الخطوط والصور */
  window.addEventListener("load", function () {
    window.setTimeout(updateScrollUI, 120);
  });
})();
