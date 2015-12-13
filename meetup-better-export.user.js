// ==UserScript==
// @name         Meetup Better Event Exporter
// @namespace    http://boris.joff3.com
// @version      1.0
// @description  Export full Meetup event description to Google Calendar
// @author       Boris Joffe
// @match        http://*.meetup.com/*
// @match        https://*.meetup.com/*
// @grant        none
// ==/UserScript==
/* jshint -W097 */
/* eslint-disable no-console, no-unused-vars */
'use strict';

/*
The MIT License (MIT)

Copyright (c) 2015 Boris Joffe

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/


// Util
var
	qs = document.querySelector.bind(document),
	qsa = document.querySelectorAll.bind(document),
	err = console.error.bind(console),
	log = console.log.bind(console),
	euc = encodeURIComponent;

var DEBUG = false;
function dbg() {
  if (DEBUG)
	  console.log.apply(console, arguments);

  return arguments[0];
}

function qsv(elmStr, parent) {
	var elm = parent ? parent.querySelector(elmStr) : qs(elmStr);
	if (!elm) err('(qs) Could not get element -', elmStr);
	return elm;
}

function qsav(elmStr, parent) {
	var elm = parent ? parent.querySelectorAll(elmStr) : qsa(elmStr);
	if (!elm) err('(qsa) Could not get element -', elmStr);
	return elm;
}

function updateExportLink() {
	log('Event Exporter running');

	var
		calLink = qsv('a[href*="google.com/calendar"]'),
		descElm = qsv('#event-description-wrap'),
		desc;

	if (descElm.innerText) {
		desc = descElm.innerText;
	} else {
		// fallback, HTML encoded entities will appear broken
		desc = descElm.innerHTML
		              .replace(/<br>\s*/g, '\n') // fix newlines
		              .replace(/<a href="([^"]*)"[^>]*>/g, '[$1] ') // show link urls
		              .replace(/<[^>]*>/g, '');  // strip html tags
	}

	var meetupGroupName = qsv('meta[property="og:title"]').getAttribute('content');

	// Google doesn't allow descriptions over a certain length
	var ELLIPSIS = '...';
	var MAX_DESC = 2100 - ELLIPSIS.length;

	var leadingText = euc(meetupGroupName + '\n' + location.href + '\n\n');
	var MAX_DESC_WITH_LEADING_TEXT = MAX_DESC - leadingText.length;
	var leadingTextTruncated = euc('[Details cut off]\n' + location.href + '\n');

	if (euc(desc).length > MAX_DESC_WITH_LEADING_TEXT) {
		desc = desc.replace(/(\s)\s*/g, '$1'); // condense whitespace
		desc = leadingTextTruncated + euc(desc);  // inform user about truncation
		desc = desc.slice(0, MAX_DESC) + ELLIPSIS;
	} else {
		desc = leadingText + euc(desc);
	}

	calLink.target = '_blank';
	calLink.href = calLink.href.replace(/details=([^&]*)/, 'details=' + euc(desc));
}

function modifyExportLinkWhenLoaded() {
/*
	if (!qs('#event_button_bar') || !qs('#event_description') || !qs('[itemprop="startDate"]')) {
		// not loaded
		dbg('page not loaded...');
		setTimeout(modifyExportLinkWhenLoaded, 1000);
	} else {
		// loaded
		dbg('page loaded...adding link');
		updateExportLink();
	}
*/
		updateExportLink();
}


window.addEventListener('load', modifyExportLinkWhenLoaded, true);
