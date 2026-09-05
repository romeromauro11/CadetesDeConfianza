/* ===================================================================
   PORTFOLIO — JS
   ===================================================================
   Solo interacción, nunca contenido. Reglas de este archivo:
   - No hay textos ni datos del portfolio acá adentro.
   - Todo lo que el visitante lee vive en index.html.
   - Cada función hace UNA cosa y se puede leer de arriba a abajo,
     en el mismo orden en que se inicializan al final del archivo.
   =================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  initMobileNav();
  initScrollSpy();
  initImagePlaceholders();
  initLightbox();
  initScrollEffects();   // barra de progreso + botón "volver arriba"
  initReveal();
  initCopyEmail();
  initConsoleSignature();
});

/* -------------------------------------------------------------
   UTIL — respeta "reducir movimiento" del sistema operativo.
   Se usa antes de disparar cualquier scroll o animación por JS
   (las animaciones puramente CSS ya se apagan solas, ver style.css).
------------------------------------------------------------- */
function prefiereMenosMovimiento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* -------------------------------------------------------------
   UTIL — mezcla varios callbacks de "scroll" en un solo listener
   con requestAnimationFrame, para no recalcular todo dos veces por
   cada pixel de scroll (ver initScrollEffects, más abajo).
------------------------------------------------------------- */
function alScrollear(callback) {
  var ticking = false;
  function tick() {
    callback();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(tick);
      ticking = true;
    }
  }, { passive: true });
  callback(); // estado inicial, por si la página ya carga con scroll
}

/* -------------------------------------------------------------
   1) MENÚ MÓVIL
   El sidebar de navegación (.doc-nav) se abre/cierra con el botón
   .nav-toggle en pantallas angostas. Incluye:
   - fondo oscuro (.nav-backdrop) que cierra el menú al tocarlo
   - Escape para cerrar
   - foco: al abrir se mueve al primer link; al cerrar, vuelve al botón
------------------------------------------------------------- */
function initMobileNav() {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.doc-nav');
  var backdrop = document.getElementById('navBackdrop');
  if (!toggle || !nav) return;

  function abrir() {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    if (backdrop) { backdrop.hidden = false; requestAnimationFrame(function () { backdrop.classList.add('is-visible'); }); }
    var primerLink = nav.querySelector('a');
    if (primerLink) primerLink.focus();
  }

  function cerrar(devolverFoco) {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (backdrop) {
      backdrop.classList.remove('is-visible');
      setTimeout(function () { backdrop.hidden = true; }, prefiereMenosMovimiento() ? 0 : 200);
    }
    if (devolverFoco) toggle.focus();
  }

  toggle.addEventListener('click', function () {
    var abierto = nav.classList.contains('is-open');
    if (abierto) cerrar(false); else abrir();
  });

  if (backdrop) backdrop.addEventListener('click', function () { cerrar(false); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) cerrar(true);
  });

  // Cierra el menú al elegir una sección (mejor UX en mobile)
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { cerrar(false); });
  });
}

/* -------------------------------------------------------------
   2) SCROLL SPY
   Resalta en el sidebar la sección que se está leyendo, con
   aria-current además de la clase visual (para lectores de pantalla).
------------------------------------------------------------- */
function initScrollSpy() {
  var sections = document.querySelectorAll('main [data-nav-id]');
  var links = document.querySelectorAll('.doc-nav a[href^="#"]');
  if (!sections.length || !links.length) return;

  var linkById = {};
  links.forEach(function (link) {
    linkById[link.getAttribute('href').replace('#', '')] = link;
  });

  function marcarActivo(link) {
    links.forEach(function (l) {
      l.classList.remove('is-active');
      l.removeAttribute('aria-current');
    });
    link.classList.add('is-active');
    link.setAttribute('aria-current', 'true');
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.getAttribute('data-nav-id');
        var link = linkById[id];
        if (link && entry.isIntersecting) marcarActivo(link);
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach(function (section) { observer.observe(section); });
}

/* -------------------------------------------------------------
   3) PLACEHOLDERS DE IMAGEN
   Mientras no cargues una URL real en un <img class="js-img">,
   se muestra un recuadro prolijo con el texto de .media-fallback
   en vez de un ícono de imagen rota.

   Para usar: cada imagen del sitio va envuelta así:

     <div class="media-frame">
       <img class="js-img" src="" alt="..." loading="lazy">
       <div class="media-fallback">
         <svg class="icon"><use href="#icon-camera"></use></svg>
         <span>Texto que describe qué captura va acá</span>
       </div>
     </div>

   Con src="" (vacío) se muestra el placeholder automáticamente.
   Cuando pegues una URL real en src="", si la URL falla al cargar,
   también vuelve a mostrarse el placeholder (no rompe el diseño).
------------------------------------------------------------- */
function initImagePlaceholders() {
  document.querySelectorAll('.js-img').forEach(function (img) {
    var frame = img.closest('.media-frame');
    var fallback = frame ? frame.querySelector('.media-fallback') : null;

    function showFallback() {
      img.style.display = 'none';
      if (fallback) fallback.style.display = 'flex';
    }

    var src = (img.getAttribute('src') || '').trim();
    if (!src) {
      showFallback();
    } else {
      img.addEventListener('error', showFallback);
    }
  });
}

/* -------------------------------------------------------------
   4) LIGHTBOX
   Click en cualquier captura ya cargada la muestra en grande.
   Maneja foco como corresponde a un diálogo modal: al abrir, el
   foco va al botón de cerrar; al cerrar, vuelve a lo que se
   había tocado para abrirlo.
------------------------------------------------------------- */
function initLightbox() {
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  var lightboxImg = lightbox.querySelector('img');
  var closeBtn = lightbox.querySelector('.lightbox-close');
  var ultimoFoco = null;

  function abrir(img) {
    ultimoFoco = document.activeElement;
    lightboxImg.src = img.getAttribute('src');
    lightboxImg.alt = img.getAttribute('alt') || '';
    lightbox.hidden = false;
    closeBtn.focus();
  }

  function cerrar() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    if (ultimoFoco && typeof ultimoFoco.focus === 'function') ultimoFoco.focus();
  }

  document.addEventListener('click', function (e) {
    var img = e.target.closest('.js-img');
    if (!img || img.style.display === 'none') return;
    if (!img.getAttribute('src')) return;
    abrir(img);
  });

  closeBtn.addEventListener('click', cerrar);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) cerrar();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) cerrar();
    // Tab dentro del lightbox: con un solo elemento enfocable (cerrar)
    // alcanza con mantenerlo enfocado, no hace falta un trap completo.
    if (e.key === 'Tab' && !lightbox.hidden) { e.preventDefault(); closeBtn.focus(); }
  });
}

/* -------------------------------------------------------------
   5) EFECTOS DE SCROLL — barra de progreso + botón "volver arriba"
   Los dos dependen de la misma posición de scroll, así que comparten
   un único listener (ver alScrollear) en vez de tener uno cada uno.
------------------------------------------------------------- */
function initScrollEffects() {
  var bar = document.querySelector('.progress-line');
  var backToTop = document.getElementById('backToTop');
  if (!bar && !backToTop) return;

  alScrollear(function () {
    var scrollTop = window.scrollY;

    if (bar) {
      var height = document.documentElement.scrollHeight - window.innerHeight;
      var pct = height > 0 ? (scrollTop / height) * 100 : 0;
      bar.style.width = pct + '%';
    }

    if (backToTop) {
      var mostrar = scrollTop > window.innerHeight * 0.6;
      backToTop.hidden = !mostrar;
      // rAF extra para que el navegador registre hidden=false antes
      // de animar la opacidad (si no, a veces salta sin transición).
      requestAnimationFrame(function () { backToTop.classList.toggle('is-visible', mostrar); });
    }
  });

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefiereMenosMovimiento() ? 'auto' : 'smooth' });
    });
  }
}

/* -------------------------------------------------------------
   6) REVEAL SUAVE AL HACER SCROLL
   Aplica a elementos con clase .reveal (encabezados de sección).
   Movimiento mínimo a propósito: sube 10px y aparece, nada más.
------------------------------------------------------------- */
function initReveal() {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach(function (item) { observer.observe(item); });
}

/* -------------------------------------------------------------
   7) COPIAR EMAIL
   Botón junto al email de contacto (ver sección Contacto). Usa la
   Clipboard API con un fallback simple para navegadores viejos.
------------------------------------------------------------- */
function initCopyEmail() {
  var btn = document.querySelector('.copy-btn[data-copy]');
  if (!btn) return;
  var status = btn.querySelector('.copy-btn-status');
  var useIcon = btn.querySelector('use');
  var iconOriginal = useIcon ? useIcon.getAttribute('href') : null;
  var timeoutId = null;

  function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto);
    }
    // Fallback: input temporal + document.execCommand (navegadores viejos
    // o contextos sin HTTPS, donde Clipboard API no está disponible).
    return new Promise(function (resolve, reject) {
      var input = document.createElement('textarea');
      input.value = texto;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.focus();
      input.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(input);
      }
    });
  }

  btn.addEventListener('click', function () {
    var texto = btn.getAttribute('data-copy');
    if (!texto) return;

    copiarTexto(texto).then(function () {
      btn.classList.add('is-copied');
      if (status) status.textContent = '¡Copiado!';
      if (useIcon) useIcon.setAttribute('href', '#icon-check');

      clearTimeout(timeoutId);
      timeoutId = setTimeout(function () {
        btn.classList.remove('is-copied');
        if (status) status.textContent = '';
        if (useIcon && iconOriginal) useIcon.setAttribute('href', iconOriginal);
      }, 1800);
    }).catch(function () {
      if (status) status.textContent = 'No se pudo copiar';
    });
  });
}

/* -------------------------------------------------------------
   8) FIRMA EN CONSOLA
   Un gesto chico para quien mira las devtools — no afecta nada
   del sitio, es solo cortesía entre developers.
------------------------------------------------------------- */
function initConsoleSignature() {
  try {
    console.log(
      '%c👋 Hola.%c Si estás mirando el código, probablemente te interese cómo está armado el resto. Contacto al final de la página.',
      'font-weight: 600; font-size: 13px;',
      'font-weight: 400; font-size: 12px; color: #565F68;'
    );
  } catch (e) { /* si console no está disponible, no pasa nada */ }
}
