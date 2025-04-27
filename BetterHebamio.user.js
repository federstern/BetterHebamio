// ==UserScript==
// @name         BetterHebamio
// @version      1.3
// @author       Plimbus
// @copyright    Plimbus, lizensiert unter GPL-3.0
// @description  Weil die Bedienung mit der Maus einfach umständlich ist.
// @homepage     https://plimbus.de
// @source       https://github.com/federstern/BetterHebamio
// @match        https://*.hebamio.de/*
// @grant        none
// @run-at       document-start
// @tag          productivity
// @updateURL    https://github.com/federstern/BetterHebamio/raw/refs/heads/master/BetterHebamio.user.js
// @downloadURL  https://github.com/federstern/BetterHebamio/raw/refs/heads/master/BetterHebamio.user.js
// @supportURL   https://github.com/federstern/BetterHebamio/issues
// ==/UserScript==

(function () {
    'use strict';

	// Definitionen und Elemente
    const baseDomain = window.location.hostname.split('.')[0];
	let nextButton, carlogButton, submitButton, backButton1, backButton2, printReceiptButton;
	let clockCheckbox, clockText;
	let driveCheckbox, driveText;

    // Automatische Umleitung im Kalender
    const currentUrl = window.location.href;
    const match = currentUrl.match(/\/client\/(\d+)\/care-(after|before)\/review\/(\d+)/);
    if (match) {
        const [_, clientId, careType, reviewId] = match;
        const newUrl = `https://${baseDomain}.hebamio.de/client/care/edit/${reviewId}/${careType}`;
        window.location.replace(newUrl);
    }

    window.addEventListener('DOMContentLoaded', () => {
		// Alle nötigen Elemente finden
		nextButton = Array.from(document.querySelectorAll('a.btn.btn-primary[style="float: right"], a.btn.btn-primary[href="javascript:void(0)"]'))
			.find(el => el.textContent.includes("weiter"));
		carlogButton = document.querySelector('button.btn.btn-primary[form="carlog-api-form"]');
		submitButton = document.querySelector('button.btn.btn-primary[form="care"], button.btn.btn-primary.flex-fill.ms-4.ms-md-2.px-4.py-2[form="clientForm"], button.btn.btn-primary[form="phone-form"]');
		backButton1 = document.querySelector('a.btn.btn-link[style="float: left"][x-show="data.tab === 1"][href], a.btn.btn-link[style="float: left;"][x-show="data.tab === 1"][href]');
		if(!backButton1) {
			backButton1 = Array.from(document.querySelectorAll('a.btn.btn-link[href="javascript:void(0)"]'))
				.find(el => el.textContent.trim() === 'zurück');
		}
		printReceiptButton = document.querySelector('a.btn.btn-default.btn-xs.pull-right.desktop[href*="/client/invoice/invoice-type-select"]');
		clockText = document.querySelector('label.form-check-label[for="date_only-1"]');
		driveText = document.querySelector('label.form-check-label[for="single_trip-1"]');

		// Tastenkürzel sichtbar machen
		if (document.body.innerHTML.includes('Tour berechnen')) {
			document.body.innerHTML = document.body.innerHTML.replace(/Tour berechnen/g, '<b><u>T</u></b>our berechnen');
		}
		if(nextButton) {
			if(nextButton.innerHTML.includes('weiter')) {
				nextButton.innerHTML = nextButton.innerHTML.replace(/weiter/, '<b><u>w</u></b>eiter');
			}
		}
		if(carlogButton) {
			if(carlogButton.innerHTML.includes('speichern')) {
				carlogButton.innerHTML = carlogButton.innerHTML.replace(/speichern/, '<b>[<u>w</u>]</b> speichern');
			}
		}
		if(submitButton) {
			if(submitButton.innerHTML.includes('speichern')) {
				submitButton.innerHTML = submitButton.innerHTML.replace(/speichern/, '<b><u>s</u></b>peichern');
			}
		}
		document.querySelectorAll('i.fa.fa-arrow-left.fa-fw').forEach(icon => {
			const parent = icon.parentNode;
			if (parent?.textContent.trim() === 'zurück') {
				parent.innerHTML = '<i class="fa fa-arrow-left fa-fw"></i> <b><u>z</u></b>urück';
			}
		});
		if(backButton1) {
			if(backButton1.innerHTML.includes('zurück')) {
				backButton1.innerHTML = backButton1.innerHTML.replace(/zurück/, '<b><u>z</u></b>urück');
			}
		}
		if(printReceiptButton) {
			if(printReceiptButton.innerHTML.includes('Beleg erstellen')) {
				printReceiptButton.innerHTML = printReceiptButton.innerHTML.replace(/Beleg erstellen/, '<b><u>B</u></b>eleg erstellen');
			}
		}
		if(clockText) {
			if(clockText.innerHTML.includes('Uhrzeit ausblenden')) {
				clockText.innerHTML = clockText.innerHTML.replace(/Uhrzeit ausblenden/, '<b><u>U</u></b>hrzeit ausblenden');
			}
		}
		if(driveText) {
			if(driveText.innerHTML.includes('Einzelfahrt')) {
				driveText.innerHTML = driveText.innerHTML.replace(/Einzelfahrt/, '<b><u>E</u></b>inzelahrt');
			}
		}


		// Eingabefeld für Touren automatisch fokussieren
		if (currentUrl === `https://${baseDomain}.hebamio.de/car-log/google-maps/create`) {
			const input = document.querySelector('input.form-control.datepicker-date-new.input');
			if (input) {
				input.focus();
				input.setAttribute("tabindex", "1");
			}
		}

		// Knopf um alle Termine eines Tages in neuen Tabs zu öffnen und bearbeiten
		// Und sowas braucht man auch für Termine für Schwangerschaft und Wochenbett
        if (currentUrl.startsWith(`https://${baseDomain}.hebamio.de/calendar`)) {
			const dateDiv = document.querySelector('div.date div.head');
			dateDiv.style.height = '135px';
			
			const dayDivs = document.querySelectorAll('div.day');
			dayDivs.forEach(dayDiv => {
				const timesDiv = dayDiv.querySelector('div.times');
				const times = timesDiv.querySelectorAll('div.time');
				let allAppointments = [];
				times.forEach(time => {
					const appointments = time.querySelectorAll('div.label');
					appointments.forEach(appointment => {
						const dateLink = appointment.querySelectorAll(`a[href^="https://${baseDomain}.hebamio.de/client/"][href*="/care-after/review/"], a[href^="https://${baseDomain}.hebamio.de/client/"][href*="/care-before/review/"]`);
						if (dateLink[1]) {
							const link = dateLink[1].href;
							const match = link.match(/\/client\/(\d+)\/care-(after|before)\/review\/(\d+)/);
							if (match) {
								const [_, clientId, careType, reviewId] = match;
								const newLink = `https://${baseDomain}.hebamio.de/client/care/edit/${reviewId}/${careType}`;
								// dateLink[1].href = newLink; // Bitte?
								allAppointments.push(newLink);
							}
						}
					});
				});

				// Etwas schöner machen
				const headDiv = dayDiv.querySelector('div.head');
				headDiv.style.height = '135px';
				const newLink = document.createElement('a');
				newLink.className = 'btn btn-primary btn-xs';
				newLink.style.marginTop = '5px';
				newLink.href = 'javascript:void(0)';
				newLink.textContent = 'Termine öffnen';
				newLink.addEventListener('click', () => {
					allAppointments.forEach(link => {
						window.open(link, '_blank', 'noopener,noreferrer');
					});
				});
				headDiv.appendChild(document.createElement('br'));
				headDiv.appendChild(newLink);
			});
        }
    });

    // Tastenkürzel
    document.addEventListener('keydown', function (event) {
		// Das wirft zwar eine Warnung, aber es ist egal
        if (document.activeElement.matches('input, textarea, select')) return;

        switch (event.key) {
            case 'w':
                // Click 'weiter' or 'speichern' button
                if (nextButton && nextButton.style.display !== "none") nextButton.click();
				if (carlogButton && nextButton && nextButton.style.display == "none") carlogButton.click();
                break;

            case 'a':
                // Select all Frauen for a tour
                // Get all checkboxes with name=cares_after[] or cares_before[] and check/uncheck them all
                let checkboxes = document.querySelectorAll('input[type="checkbox"][name^="cares_"]');
				if(!checkboxes.length) {
					checkboxes = document.querySelectorAll('input[type="checkbox"].dont-bind-nicer-checkbox');
				}
                const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
                checkboxes.forEach(checkbox => {
                    checkbox.click();
                });
                break;

            case 's':
                // Submit the form
				// Klappt bei Telephonischen Beratungen nicht
                if (submitButton) submitButton.click();
                break;

            case 'm':
                // Toggle 'Materialpauschale verrechnen' checkbox
                const checkbox = document.querySelector('input#material-rate');
                if (checkbox && checkbox.type === 'checkbox') {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
                break;

            case 'p':
                // Toggle 'in Praxis' checkbox
                const inPraxisCheckbox = document.querySelector('input#in-ordination-1');
                if (inPraxisCheckbox && inPraxisCheckbox.type === 'checkbox') {
                    inPraxisCheckbox.checked = !inPraxisCheckbox.checked;
                    inPraxisCheckbox.dispatchEvent(new Event('change'));
                }
                break;

            case 't':
                // Create new tour
                const tourButton = document.querySelector(`a.btn.btn-primary[href="https://${baseDomain}.hebamio.de/car-log/google-maps/create"]`);
                if (tourButton) tourButton.click();
                break;
			
			case 'z':
				// Go back to the previous page
				backButton2 = Array.from(document.querySelectorAll('a.btn.btn-link[style="float: left;"][x-show="data.tab !== 1"][href="#"]'))
					.find(el => el.getAttribute('@click.prevent') === 'back()');
					if(!backButton1) {
						backButton1 = Array.from(document.querySelectorAll('a.btn.btn-link[href="javascript:void(0)"]'))
							.find(el => el.textContent.trim() === 'zurück');
					}

				if (backButton1) {
					if (backButton1.style.display == "none") {
						if (backButton2) backButton2.click();
					} else {
						backButton1.click();
					}
				} else if (backButton2) {
					if (backButton2.style.display == "none") {
						if (backButton1) backButton1.click();
					} else {
						backButton2.click();
					}
				}
			
			case 'b':
				// Print receipt
				if (printReceiptButton) window.open(printReceiptButton.href, '_blank', 'noopener,noreferrer');
				break;

			case 'u':
				// Toggle 'Uhrzeit' checkbox
				clockCheckbox = document.querySelector('input#date_only-1');
				if (clockCheckbox && clockCheckbox.type === 'checkbox') {
					clockCheckbox.click();
				}

			case 'e':
				// Toggle 'Einzelfahrt' checkbox
				driveCheckbox = document.querySelector('input#single_trip-1');
				if (driveCheckbox && driveCheckbox.type === 'checkbox') {
					driveCheckbox.click();
				}
				break;

			default:
				break;
        }
    });
})();
