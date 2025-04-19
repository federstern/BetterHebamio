// ==UserScript==
// @name         BetterHebamio
// @namespace    https://plimbus.de
// @version      1.0
// @description  Combines multiple Hebamio scripts into one
// @author       Plimbus
// @match        https://*.hebamio.de/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // Extract the base domain dynamically
    const baseDomain = window.location.hostname.split('.')[0];
    console.log(`Base domain: ${baseDomain}`);

    // Auto Redirect from review to edit
    const currentUrl = window.location.href;
    const match = currentUrl.match(/\/client\/(\d+)\/care-(after|before)\/review\/(\d+)/);
    if (match) {
        const [_, clientId, careType, reviewId] = match;
        const newUrl = `https://${baseDomain}.hebamio.de/client/care/edit/${reviewId}/${careType}`;
        window.location.replace(newUrl);
    }

    // Autofocus on Google Maps create page
    if (currentUrl === `https://${baseDomain}.hebamio.de/car-log/google-maps/create`) {
        window.addEventListener('DOMContentLoaded', () => {
            const input = document.querySelector('input.form-control.datepicker-date-new.input');
            if (input) {
                input.focus();
            }
        });
    }

    // if (currentUrl === `https://${baseDomain}.hebamio.de/calendar/*`) {
    window.addEventListener('DOMContentLoaded', () => {
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
                            // dateLink[1].href = newLink;
                            allAppointments.push(newLink);
                        }
                    }
                });
            });

            const headDiv = dayDiv.querySelector('div.head');
            headDiv.style.height = '135px';
            const newLink = document.createElement('a');
            newLink.className = 'btn btn-primary btn-xs';
            newLink.style.marginTop = '5px';
            newLink.href = 'javascript:void(0)';
            newLink.textContent = 'Termine öffnen';
            newLink.addEventListener('click', () => {
                // console.log(allAppointments);
                allAppointments.forEach(link => {
                    window.open(link, '_blank', 'noopener,noreferrer');
                });
            });
            headDiv.appendChild(document.createElement('br'));
            headDiv.appendChild(newLink);
        });
    });
    // }

    // Keyboard shortcuts
    document.addEventListener('keydown', function (event) {
        if (document.activeElement.matches('input, textarea, select')) return;

        switch (event.key) {
            case 'w':
                // Click 'weiter' or 'speichern' button
                let nextButton = document.querySelector('a.btn.btn-primary[style="float: right"]') ||
                    document.querySelector('button.btn.btn-primary[form="carlog-api-form"]');
                if (nextButton) nextButton.click();
                break;

            case 'a':
                // Select all Frauen for a tour
                // Get all checkboxes with name=cares_after[] or cares_before[] and check/uncheck them all
                const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="cares_"]');
                const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
                checkboxes.forEach(checkbox => {
                    checkbox.click();
                });
                break;

            case 's':
                // Submit the form
                const submitButton = document.querySelector('button.btn.btn-primary[form="care"]');
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
        }
    });
})();
