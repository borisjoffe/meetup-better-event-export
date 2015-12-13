// ==UserScript==
// @name         Meetup Better Event Exporter
// @namespace    http://boris.joff3.com
// @version      1.1
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
var DEBUG = false;
function dbg() {
	if (DEBUG)
		console.log.apply(console, arguments);

	return arguments[0];
}


var
	qs = document.querySelector.bind(document),
	err = console.error.bind(console),
	log = console.log.bind(console),
	euc = encodeURIComponent;

function qsv(elmStr, parent) {
	var elm = parent ? parent.querySelector(elmStr) : qs(elmStr);
	if (!elm) err('(qs) Could not get element -', elmStr);
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

	// Google? doesn't allow calendar links over a certain length
	var leadingText = euc(meetupGroupName + '\n' + location.href + '\n\n');
	var leadingTextTruncated = euc('[Details cut off]\n' + location.href + '\n');
	var linkWithoutDetails = calLink.href.replace(/details=([^&]*)/, 'details=');

	// limit seems to be around 2000-3000 chars but may not be a full url limit and seems to vary depending on the Meetup content
	var FULL_LINK_MAX_CHARS = 2300; //2543;
	var FULL_DETAILS_MAX_CHARS = FULL_LINK_MAX_CHARS - linkWithoutDetails.length;
	var DETAILS_MAX_CHARS = FULL_DETAILS_MAX_CHARS - leadingText.length;
	var ELLIPSIS = '...';

	var isTruncated = false;
	dbg('original desc length =', euc(desc).length);
	if (euc(desc).length > DETAILS_MAX_CHARS) {
		dbg('truncating');
		desc = desc.replace(/(\s)\s*/g, '$1');    // condense whitespace
		desc = leadingTextTruncated + euc(desc);  // inform user about truncation
		desc = desc.slice(0, FULL_DETAILS_MAX_CHARS - ELLIPSIS.length) + ELLIPSIS;
		isTruncated = true;
	} else {
		dbg('not truncating');
		desc = leadingText + euc(desc);
	}

	calLink.href = linkWithoutDetails.replace(/details=/, 'details=' + desc);
	//calLink.innerHTML += isTruncated ? ' (truncated)' : ' (full)';
	dbg('desc text len =', desc.length);
	dbg('full link length =', calLink.href.length);

	calLink.target = '_blank';

	// show color change to notify user that link changed
	var lightGreen = 'rgba(0, 255, 0, 0.1)';
	var lightYellow = 'rgba(255, 255, 0, 0.1)';
	var linkColor = isTruncated ? lightYellow : lightGreen;
	calLink.parentNode.style.backgroundColor = linkColor;
	qsv('#addToCalAction').style.backgroundColor = linkColor;
}

window.addEventListener('load', updateExportLink, true);
