(function () {
	'use strict';

	var page = document.querySelector('.inspius-home-redesign-page .ir-page');

	if (!page) {
		return;
	}

	/* Keep the shared mobile navigation working on pages without a dedicated script. */
	var navToggle = page.querySelector('.ir-nav-toggle');
	var navMenu = page.querySelector('#ir-nav-menu');
	var hasDedicatedNav = page.classList.contains('ir-insights-page') ||
		page.classList.contains('ir-podcast-single-page') ||
		page.classList.contains('air-page');

	if (navToggle && navMenu && !hasDedicatedNav) {
		navToggle.addEventListener('click', function () {
			var isOpen = navToggle.getAttribute('aria-expanded') === 'true';

			navToggle.setAttribute('aria-expanded', String(!isOpen));
			navMenu.classList.toggle('is-open', !isOpen);
		});

		navMenu.addEventListener('click', function (event) {
			if (event.target.closest('a')) {
				navToggle.setAttribute('aria-expanded', 'false');
				navMenu.classList.remove('is-open');
			}
		});
	}

	function prepareRevealGroup(selector, modifier, step) {
		var elements = page.querySelectorAll(selector);

		Array.prototype.forEach.call(elements, function (element, index) {
			if (element.closest('#resources') || element.classList.contains('ir-home-reveal')) {
				return;
			}

			element.classList.add('ir-home-reveal');

			if (modifier) {
				element.classList.add(modifier);
			}

			element.style.setProperty('--ir-home-delay', String((index % 5) * step) + 'ms');
		});
	}

	prepareRevealGroup(
		'.ir-logo-strip h2, main .ir-section-tag, main .ir-section-title, .ir-section-heading-row .ir-text-link, .ir-testimonial-slider',
		'ir-home-reveal-soft',
		45
	);
	prepareRevealGroup(
		'.ir-logo-row > span, .ir-feature-grid > *, .ir-process-grid > *, .ir-insight-grid > *',
		'ir-home-reveal-soft',
		80
	);
	prepareRevealGroup(
		'.ir-stack-pills > span, .ir-episode-list > *',
		'ir-home-reveal-soft',
		55
	);
	prepareRevealGroup(
		'.ir-podcast-copy, .ir-podcast-featured',
		'ir-home-reveal-left',
		0
	);
	prepareRevealGroup(
		'.ir-final-cta, .ir-footer-grid, .ir-footer-bottom',
		'ir-home-reveal-soft',
		70
	);

	var revealElements = page.querySelectorAll('.ir-home-reveal');
	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	document.documentElement.classList.add('ir-home-motion-ready');

	var testimonialSlider = page.querySelector('[data-testimonial-slider]');

	if (testimonialSlider) {
		var testimonialViewport = testimonialSlider.querySelector('.ir-testimonial-viewport');
		var testimonialTrack = testimonialSlider.querySelector('.ir-testimonial-track');
		var testimonialCards = testimonialTrack ? testimonialTrack.querySelectorAll('.ir-testimonial-card') : [];
		var testimonialPrev = testimonialSlider.querySelector('.ir-testimonial-prev');
		var testimonialNext = testimonialSlider.querySelector('.ir-testimonial-next');
		var testimonialStatus = testimonialSlider.querySelector('.ir-testimonial-status');
		var testimonialIndex = 0;
		var testimonialPaused = false;
		var testimonialTouchStart = null;
		var testimonialOffset = 0;
		var testimonialLoopDistance = 0;
		var testimonialCardStep = 0;
		var testimonialRenderedIndex = -1;
		var testimonialLastTimestamp = 0;
		var testimonialSpeed = 34;

		if (testimonialTrack && testimonialCards.length > 1) {
			Array.prototype.forEach.call(testimonialCards, function (card) {
				var clone = card.cloneNode(true);

				clone.setAttribute('aria-hidden', 'true');
				clone.setAttribute('data-testimonial-clone', 'true');
				testimonialTrack.appendChild(clone);
			});
		}

		function testimonialPerView() {
			return window.innerWidth <= 680 ? 1 : 2;
		}

		function renderTestimonialSlider() {
			if (!testimonialTrack || !testimonialCards.length || testimonialCardStep <= 0) {
				return;
			}

			testimonialIndex = Math.floor(testimonialOffset / testimonialCardStep) % testimonialCards.length;
			testimonialTrack.style.transform = 'translate3d(-' + String(testimonialOffset) + 'px, 0, 0)';

			if (testimonialIndex === testimonialRenderedIndex) {
				return;
			}

			testimonialRenderedIndex = testimonialIndex;
			var visibleEnd = testimonialIndex + testimonialPerView();

			Array.prototype.forEach.call(testimonialCards, function (card, cardIndex) {
				var isVisible = cardIndex >= testimonialIndex && cardIndex < visibleEnd;
				card.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
			});

			if (testimonialStatus) {
				var lastVisibleIndex = (testimonialIndex + testimonialPerView() - 1) % testimonialCards.length;
				var visibleRange = testimonialPerView() > 1 ? String(testimonialIndex + 1) + '\u2013' + String(lastVisibleIndex + 1) : String(testimonialIndex + 1);

				testimonialStatus.textContent = visibleRange + ' / ' + String(testimonialCards.length);
			}
		}

		function measureTestimonialSlider() {
			if (!testimonialTrack || !testimonialCards.length) {
				return;
			}

			var trackStyles = window.getComputedStyle(testimonialTrack);
			var trackGap = parseFloat(trackStyles.columnGap || trackStyles.gap) || 24;
			var cardWidth = testimonialCards[0].getBoundingClientRect().width;
			var cardStep = cardWidth + trackGap;
			var previousLoopDistance = testimonialLoopDistance;

			testimonialCardStep = cardStep;
			testimonialLoopDistance = cardStep * testimonialCards.length;

			if (previousLoopDistance > 0 && testimonialLoopDistance > 0) {
				testimonialOffset = (testimonialOffset / previousLoopDistance) * testimonialLoopDistance;
			}

			if (testimonialLoopDistance > 0) {
				testimonialOffset = testimonialOffset % testimonialLoopDistance;
			}

			testimonialRenderedIndex = -1;
			renderTestimonialSlider();
		}

		function moveTestimonialSlider(direction) {
			var maxIndex = Math.max(0, testimonialCards.length - testimonialPerView());

			if (testimonialCardStep <= 0) {
				measureTestimonialSlider();
			}

			testimonialIndex = Math.floor(testimonialOffset / testimonialCardStep) % testimonialCards.length;
			testimonialIndex += direction;

			if (testimonialIndex > maxIndex) {
				testimonialIndex = 0;
			} else if (testimonialIndex < 0) {
				testimonialIndex = maxIndex;
			}

			testimonialOffset = testimonialIndex * testimonialCardStep;
			renderTestimonialSlider();
		}

		function animateTestimonialSlider(timestamp) {
			if (!testimonialLastTimestamp) {
				testimonialLastTimestamp = timestamp;
			}

			var elapsed = Math.min(timestamp - testimonialLastTimestamp, 100);
			testimonialLastTimestamp = timestamp;

			// Keep the ticker moving continuously, just like the client-logo strip
			// on the original home template. Visibility-based throttling made the
			// cards appear frozen until the section had been scrolled into view.
			if (!testimonialPaused && !document.hidden && testimonialLoopDistance > 0) {
				testimonialOffset += testimonialSpeed * elapsed / 1000;
				if (testimonialOffset >= testimonialLoopDistance) {
					testimonialOffset = testimonialOffset % testimonialLoopDistance;
				}
				renderTestimonialSlider();
			}

			window.requestAnimationFrame(animateTestimonialSlider);
		}

		if (testimonialPrev) {
			testimonialPrev.addEventListener('click', function () {
				moveTestimonialSlider(-1);
			});
		}

		if (testimonialNext) {
			testimonialNext.addEventListener('click', function () {
				moveTestimonialSlider(1);
			});
		}

		testimonialSlider.addEventListener('mouseenter', function () {
			testimonialPaused = true;
		});

		testimonialSlider.addEventListener('mouseleave', function () {
			testimonialPaused = false;
		});

		testimonialSlider.addEventListener('focusin', function () {
			testimonialPaused = true;
		});

		testimonialSlider.addEventListener('focusout', function () {
			window.setTimeout(function () {
				testimonialPaused = testimonialSlider.contains(document.activeElement);
			}, 0);
		});

		if (testimonialViewport) {
			testimonialViewport.addEventListener(
				'touchstart',
				function (event) {
					testimonialTouchStart = event.touches[0].clientX;
				},
				{ passive: true }
			);

			testimonialViewport.addEventListener(
				'touchend',
				function (event) {
					if (testimonialTouchStart === null) {
						return;
					}

					var touchDistance = event.changedTouches[0].clientX - testimonialTouchStart;
					testimonialTouchStart = null;

					if (Math.abs(touchDistance) > 45) {
						moveTestimonialSlider(touchDistance < 0 ? 1 : -1);
					}
				},
				{ passive: true }
			);
		}

		window.addEventListener('resize', measureTestimonialSlider);
		measureTestimonialSlider();

		if (!reduceMotion && testimonialCards.length > testimonialPerView() && 'requestAnimationFrame' in window) {
			window.requestAnimationFrame(animateTestimonialSlider);
		}
	}

	if (reduceMotion || !('IntersectionObserver' in window)) {
		Array.prototype.forEach.call(revealElements, function (element) {
			element.classList.add('is-visible');
		});
		return;
	}

	var observer = new IntersectionObserver(
		function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) {
					return;
				}

				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			});
		},
		{
			root: null,
			rootMargin: '0px 0px -8% 0px',
			threshold: 0.08
		}
	);

	Array.prototype.forEach.call(revealElements, function (element) {
		observer.observe(element);
	});
}());
