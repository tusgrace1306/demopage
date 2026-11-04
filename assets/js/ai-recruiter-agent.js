(function () {
	'use strict';

	var page = document.querySelector('.air-page');
	var toggle = document.querySelector('.air-page .ir-nav-toggle');
	var menu = document.getElementById('ir-nav-menu');

	if (!page) {
		return;
	}

	function closeMenu() {
		if (!toggle || !menu) {
			return;
		}

		toggle.setAttribute('aria-expanded', 'false');
		menu.classList.remove('is-open');
	}

	if (toggle && menu) {
		toggle.addEventListener('click', function () {
			var isOpen = toggle.getAttribute('aria-expanded') === 'true';
			toggle.setAttribute('aria-expanded', String(!isOpen));
			menu.classList.toggle('is-open', !isOpen);
		});

		menu.addEventListener('click', function (event) {
			if (event.target.closest('a')) {
				closeMenu();
			}
		});

		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
				closeMenu();
				toggle.focus();
			}
		});
	}

	function prepareRevealGroup(selector, modifier, step) {
		var elements = page.querySelectorAll(selector);

		Array.prototype.forEach.call(elements, function (element, index) {
			if (element.classList.contains('air-reveal')) {
				return;
			}

			element.classList.add('air-reveal');

			if (modifier) {
				element.classList.add(modifier);
			}

			element.style.setProperty('--air-reveal-delay', String((index % 4) * step) + 'ms');
		});
	}

	prepareRevealGroup(
		'.air-credibility, main .ir-section-tag, main .ir-section-title, .air-roadmap-closing',
		'air-reveal-soft',
		45
	);
	prepareRevealGroup(
		'.ir-feature-card, .air-three-step-grid > article, .air-roadmap-list > article, .air-pilot-benefits > article, .air-faq-list > details',
		'air-reveal-soft',
		85
	);
	prepareRevealGroup(
		'.air-module-layout:not(.air-module-layout-reverse) .air-module-copy, .air-module-layout-reverse .air-output-card, .air-service-bridge > div, .air-security-copy, .air-registration-copy',
		'air-reveal-left',
		0
	);
	prepareRevealGroup(
		'.air-module-layout:not(.air-module-layout-reverse) .air-output-card, .air-module-layout-reverse .air-module-copy, .air-service-bridge > .air-button, .air-trust-panel, .air-registration-form',
		'air-reveal-right',
		0
	);
	prepareRevealGroup(
		'.air-live-card, .air-module-copy blockquote',
		'air-reveal-soft',
		70
	);

	var revealElements = page.querySelectorAll('.air-reveal');
	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	document.documentElement.classList.add('air-motion-ready');

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
