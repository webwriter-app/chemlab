import { css } from "lit";
export const style = css`
	/*!
 * chota.css v0.9.2 | MIT License | https://github.com/jenil/chota
 */
	:root {
		--bg-color: #fff;
		--bg-secondary-color: #f3f3f6;
		--color-primary: #14854f;
		--color-lightGrey: #d2d6dd;
		--color-grey: #747681;
		--color-darkGrey: #3f4144;
		--color-error: #d43939;
		--color-success: #28bd14;
		--grid-maxWidth: 120rem;
		--grid-gutter: 2rem;
		--font-size: 1.6rem;
		--font-color: #333;
		--font-family-sans: -apple-system, "BlinkMacSystemFont", "Avenir",
			"Avenir Next", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell",
			"Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
		--font-family-mono: monaco, "Consolas", "Lucida Console", monospace;
	}
	html {
		-webkit-text-size-adjust: 100%;
		-moz-text-size-adjust: 100%;
		-ms-text-size-adjust: 100%;
		text-size-adjust: 100%;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		font-size: 62.5%;
		line-height: 1.15;
	}
	*,
	:after,
	:before {
		-webkit-box-sizing: inherit;
		box-sizing: inherit;
	}
	body {
		background-color: var(--bg-color);
		color: var(--font-color);
		font-family: Segoe UI, Helvetica Neue, sans-serif;
		font-family: var(--font-family-sans);
		font-size: var(--font-size);
		line-height: 1.6;
		margin: 0;
		padding: 0;
	}
	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		font-weight: 500;
		margin: 0.35em 0 0.7em;
	}
	h1 {
		font-size: 2em;
	}
	h2 {
		font-size: 1.75em;
	}
	h3 {
		font-size: 1.5em;
	}
	h4 {
		font-size: 1.25em;
	}
	h5 {
		font-size: 1em;
	}
	h6 {
		font-size: 0.85em;
	}
	a {
		color: var(--color-primary);
		text-decoration: none;
	}
	a:hover:not(.button) {
		opacity: 0.75;
	}
	button {
		font-family: inherit;
	}
	p {
		margin-top: 0;
	}
	blockquote {
		background-color: var(--bg-secondary-color);
		border-left: 3px solid var(--color-lightGrey);
		padding: 1.5rem 2rem;
	}
	dl dt {
		font-weight: 700;
	}
	hr {
		background-color: var(--color-lightGrey);
		height: 1px;
		margin: 1rem 0;
	}
	hr,
	table {
		border: none;
	}
	table {
		border-collapse: collapse;
		border-spacing: 0;
		text-align: left;
		width: 100%;
	}
	table.striped tr:nth-of-type(2n) {
		background-color: var(--bg-secondary-color);
	}
	td,
	th {
		padding: 1.2rem 0.4rem;
		vertical-align: middle;
	}
	thead {
		border-bottom: 2px solid var(--color-lightGrey);
	}
	tfoot {
		border-top: 2px solid var(--color-lightGrey);
	}
	code,
	kbd,
	pre,
	samp,
	tt {
		font-family: var(--font-family-mono);
	}
	code,
	kbd {
		border-radius: 4px;
		color: var(--color-error);
		font-size: 90%;
		padding: 0.2em 0.4em;
		white-space: pre-wrap;
	}
	code,
	kbd,
	pre {
		background-color: var(--bg-secondary-color);
	}
	pre {
		font-size: 1em;
		overflow-x: auto;
		padding: 1rem;
	}
	pre code {
		background: none;
		padding: 0;
	}
	abbr[title] {
		border-bottom: none;
		text-decoration: underline;
		-webkit-text-decoration: underline dotted;
		text-decoration: underline dotted;
	}
	img {
		max-width: 100%;
	}
	fieldset {
		border: 1px solid var(--color-lightGrey);
	}
	iframe {
		border: 0;
	}
	.container {
		margin: 0 auto;
		max-width: var(--grid-maxWidth);
		padding: 0 calc(var(--grid-gutter) / 2);
		width: 96%;
	}
	.row {
		-webkit-box-direction: normal;
		-webkit-box-pack: start;
		-ms-flex-pack: start;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-ms-flex-flow: row wrap;
		flex-flow: row wrap;
		justify-content: flex-start;
		margin-left: calc(var(--grid-gutter) / -2);
		margin-right: calc(var(--grid-gutter) / -2);
	}
	.row,
	.row.reverse {
		-webkit-box-orient: horizontal;
	}
	.row.reverse {
		-webkit-box-direction: reverse;
		-ms-flex-direction: row-reverse;
		flex-direction: row-reverse;
	}
	.col {
		-webkit-box-flex: 1;
		-ms-flex: 1;
		flex: 1;
	}
	.col,
	[class*=" col-"],
	[class^="col-"] {
		margin: 0 calc(var(--grid-gutter) / 2) calc(var(--grid-gutter) / 2);
	}
	.col-1 {
		-ms-flex: 0 0 calc(8.33333% - var(--grid-gutter));
		flex: 0 0 calc(8.33333% - var(--grid-gutter));
		max-width: calc(8.33333% - var(--grid-gutter));
	}
	.col-1,
	.col-2 {
		-webkit-box-flex: 0;
	}
	.col-2 {
		-ms-flex: 0 0 calc(16.66667% - var(--grid-gutter));
		flex: 0 0 calc(16.66667% - var(--grid-gutter));
		max-width: calc(16.66667% - var(--grid-gutter));
	}
	.col-3 {
		-ms-flex: 0 0 calc(25% - var(--grid-gutter));
		flex: 0 0 calc(25% - var(--grid-gutter));
		max-width: calc(25% - var(--grid-gutter));
	}
	.col-3,
	.col-4 {
		-webkit-box-flex: 0;
	}
	.col-4 {
		-ms-flex: 0 0 calc(33.33333% - var(--grid-gutter));
		flex: 0 0 calc(33.33333% - var(--grid-gutter));
		max-width: calc(33.33333% - var(--grid-gutter));
	}
	.col-5 {
		-ms-flex: 0 0 calc(41.66667% - var(--grid-gutter));
		flex: 0 0 calc(41.66667% - var(--grid-gutter));
		max-width: calc(41.66667% - var(--grid-gutter));
	}
	.col-5,
	.col-6 {
		-webkit-box-flex: 0;
	}
	.col-6 {
		-ms-flex: 0 0 calc(50% - var(--grid-gutter));
		flex: 0 0 calc(50% - var(--grid-gutter));
		max-width: calc(50% - var(--grid-gutter));
	}
	.col-7 {
		-ms-flex: 0 0 calc(58.33333% - var(--grid-gutter));
		flex: 0 0 calc(58.33333% - var(--grid-gutter));
		max-width: calc(58.33333% - var(--grid-gutter));
	}
	.col-7,
	.col-8 {
		-webkit-box-flex: 0;
	}
	.col-8 {
		-ms-flex: 0 0 calc(66.66667% - var(--grid-gutter));
		flex: 0 0 calc(66.66667% - var(--grid-gutter));
		max-width: calc(66.66667% - var(--grid-gutter));
	}
	.col-9 {
		-ms-flex: 0 0 calc(75% - var(--grid-gutter));
		flex: 0 0 calc(75% - var(--grid-gutter));
		max-width: calc(75% - var(--grid-gutter));
	}
	.col-10,
	.col-9 {
		-webkit-box-flex: 0;
	}
	.col-10 {
		-ms-flex: 0 0 calc(83.33333% - var(--grid-gutter));
		flex: 0 0 calc(83.33333% - var(--grid-gutter));
		max-width: calc(83.33333% - var(--grid-gutter));
	}
	.col-11 {
		-ms-flex: 0 0 calc(91.66667% - var(--grid-gutter));
		flex: 0 0 calc(91.66667% - var(--grid-gutter));
		max-width: calc(91.66667% - var(--grid-gutter));
	}
	.col-11,
	.col-12 {
		-webkit-box-flex: 0;
	}
	.col-12 {
		-ms-flex: 0 0 calc(100% - var(--grid-gutter));
		flex: 0 0 calc(100% - var(--grid-gutter));
		max-width: calc(100% - var(--grid-gutter));
	}
	@media screen and (max-width: 599px) {
		.container {
			width: 100%;
		}
		.col,
		[class*="col-"],
		[class^="col-"] {
			-webkit-box-flex: 0;
			-ms-flex: 0 1 100%;
			flex: 0 1 100%;
			max-width: 100%;
		}
	}
	@media screen and (min-width: 900px) {
		.col-1-md {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(8.33333% - var(--grid-gutter));
			flex: 0 0 calc(8.33333% - var(--grid-gutter));
			max-width: calc(8.33333% - var(--grid-gutter));
		}
		.col-2-md {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(16.66667% - var(--grid-gutter));
			flex: 0 0 calc(16.66667% - var(--grid-gutter));
			max-width: calc(16.66667% - var(--grid-gutter));
		}
		.col-3-md {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(25% - var(--grid-gutter));
			flex: 0 0 calc(25% - var(--grid-gutter));
			max-width: calc(25% - var(--grid-gutter));
		}
		.col-4-md {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(33.33333% - var(--grid-gutter));
			flex: 0 0 calc(33.33333% - var(--grid-gutter));
			max-width: calc(33.33333% - var(--grid-gutter));
		}
		.col-5-md {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(41.66667% - var(--grid-gutter));
			flex: 0 0 calc(41.66667% - var(--grid-gutter));
			max-width: calc(41.66667% - var(--grid-gutter));
		}
		.col-6-md {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(50% - var(--grid-gutter));
			flex: 0 0 calc(50% - var(--grid-gutter));
			max-width: calc(50% - var(--grid-gutter));
		}
		.col-7-md {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(58.33333% - var(--grid-gutter));
			flex: 0 0 calc(58.33333% - var(--grid-gutter));
			max-width: calc(58.33333% - var(--grid-gutter));
		}
		.col-8-md {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(66.66667% - var(--grid-gutter));
			flex: 0 0 calc(66.66667% - var(--grid-gutter));
			max-width: calc(66.66667% - var(--grid-gutter));
		}
		.col-9-md {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(75% - var(--grid-gutter));
			flex: 0 0 calc(75% - var(--grid-gutter));
			max-width: calc(75% - var(--grid-gutter));
		}
		.col-10-md {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(83.33333% - var(--grid-gutter));
			flex: 0 0 calc(83.33333% - var(--grid-gutter));
			max-width: calc(83.33333% - var(--grid-gutter));
		}
		.col-11-md {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(91.66667% - var(--grid-gutter));
			flex: 0 0 calc(91.66667% - var(--grid-gutter));
			max-width: calc(91.66667% - var(--grid-gutter));
		}
		.col-12-md {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(100% - var(--grid-gutter));
			flex: 0 0 calc(100% - var(--grid-gutter));
			max-width: calc(100% - var(--grid-gutter));
		}
	}
	@media screen and (min-width: 1200px) {
		.col-1-lg {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(8.33333% - var(--grid-gutter));
			flex: 0 0 calc(8.33333% - var(--grid-gutter));
			max-width: calc(8.33333% - var(--grid-gutter));
		}
		.col-2-lg {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(16.66667% - var(--grid-gutter));
			flex: 0 0 calc(16.66667% - var(--grid-gutter));
			max-width: calc(16.66667% - var(--grid-gutter));
		}
		.col-3-lg {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(25% - var(--grid-gutter));
			flex: 0 0 calc(25% - var(--grid-gutter));
			max-width: calc(25% - var(--grid-gutter));
		}
		.col-4-lg {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(33.33333% - var(--grid-gutter));
			flex: 0 0 calc(33.33333% - var(--grid-gutter));
			max-width: calc(33.33333% - var(--grid-gutter));
		}
		.col-5-lg {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(41.66667% - var(--grid-gutter));
			flex: 0 0 calc(41.66667% - var(--grid-gutter));
			max-width: calc(41.66667% - var(--grid-gutter));
		}
		.col-6-lg {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(50% - var(--grid-gutter));
			flex: 0 0 calc(50% - var(--grid-gutter));
			max-width: calc(50% - var(--grid-gutter));
		}
		.col-7-lg {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(58.33333% - var(--grid-gutter));
			flex: 0 0 calc(58.33333% - var(--grid-gutter));
			max-width: calc(58.33333% - var(--grid-gutter));
		}
		.col-8-lg {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(66.66667% - var(--grid-gutter));
			flex: 0 0 calc(66.66667% - var(--grid-gutter));
			max-width: calc(66.66667% - var(--grid-gutter));
		}
		.col-9-lg {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(75% - var(--grid-gutter));
			flex: 0 0 calc(75% - var(--grid-gutter));
			max-width: calc(75% - var(--grid-gutter));
		}
		.col-10-lg {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(83.33333% - var(--grid-gutter));
			flex: 0 0 calc(83.33333% - var(--grid-gutter));
			max-width: calc(83.33333% - var(--grid-gutter));
		}
		.col-11-lg {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(91.66667% - var(--grid-gutter));
			flex: 0 0 calc(91.66667% - var(--grid-gutter));
			max-width: calc(91.66667% - var(--grid-gutter));
		}
		.col-12-lg {
			-webkit-box-flex: 0;
			-ms-flex: 0 0 calc(100% - var(--grid-gutter));
			flex: 0 0 calc(100% - var(--grid-gutter));
			max-width: calc(100% - var(--grid-gutter));
		}
	}
	fieldset {
		padding: 0.5rem 2rem;
	}
	legend {
		font-size: 0.8em;
		letter-spacing: 0.1rem;
		text-transform: uppercase;
	}
	input:not(
			[type="checkbox"],
			[type="radio"],
			[type="submit"],
			[type="color"],
			[type="button"],
			[type="reset"]
		),
	select,
	textarea,
	textarea[type="text"] {
		border: 1px solid var(--color-lightGrey);
		border-radius: 4px;
		display: block;
		font-family: inherit;
		font-size: 1em;
		padding: 0.8rem 1rem;
		-webkit-transition: all 0.2s ease;
		transition: all 0.2s ease;
		width: 100%;
	}
	select {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background: #f3f3f6 no-repeat 100%;
		background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='40' fill='%23555'><polygon points='0,0 60,0 30,40'/></svg>");
		background-origin: content-box;
		background-size: 1ex;
	}
	.button,
	[type="button"],
	[type="reset"],
	[type="submit"],
	button {
		background: var(--color-lightGrey);
		border: 1px solid transparent;
		border-radius: 4px;
		color: var(--color-darkGrey);
		cursor: pointer;
		display: inline-block;
		font-size: var(--font-size);
		line-height: 1;
		padding: 1rem 2.5rem;
		text-align: center;
		text-decoration: none;
		-webkit-transform: scale(1);
		transform: scale(1);
		-webkit-transition: opacity 0.2s ease;
		transition: opacity 0.2s ease;
	}
	.button.dark,
	.button.error,
	.button.primary,
	.button.secondary,
	.button.success,
	[type="submit"] {
		background-color: #000;
		background-color: var(--color-primary);
		color: #fff;
		z-index: 1;
	}
	.button:hover,
	[type="button"]:hover,
	[type="reset"]:hover,
	[type="submit"]:hover,
	button:hover {
		opacity: 0.8;
	}
	button:disabled,
	button:disabled:hover,
	input:disabled,
	input:disabled:hover {
		cursor: not-allowed;
		opacity: 0.4;
	}
	.grouped {
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
	}
	.grouped > :not(:last-child) {
		margin-right: 16px;
	}
	.grouped.gapless > * {
		border-radius: 0 !important;
		margin: 0 0 0 -1px !important;
	}
	.grouped.gapless > :first-child {
		border-radius: 4px 0 0 4px !important;
		margin: 0 !important;
	}
	.grouped.gapless > :last-child {
		border-radius: 0 4px 4px 0 !important;
	}
	input:not(
			[type="checkbox"],
			[type="radio"],
			[type="submit"],
			[type="color"],
			[type="button"],
			[type="reset"],
			:disabled
		):hover,
	select:hover,
	textarea:hover,
	textarea[type="text"]:hover {
		border-color: var(--color-grey);
	}
	input:not(
			[type="checkbox"],
			[type="radio"],
			[type="submit"],
			[type="color"],
			[type="button"],
			[type="reset"]
		):focus,
	select:focus,
	textarea:focus,
	textarea[type="text"]:focus {
		border-color: var(--color-primary);
		-webkit-box-shadow: 0 0 1px var(--color-primary);
		box-shadow: 0 0 1px var(--color-primary);
		outline: none;
	}
	input.error:not(
			[type="checkbox"],
			[type="radio"],
			[type="submit"],
			[type="color"],
			[type="button"],
			[type="reset"]
		),
	textarea.error {
		border-color: var(--color-error);
	}
	input.success:not(
			[type="checkbox"],
			[type="radio"],
			[type="submit"],
			[type="color"],
			[type="button"],
			[type="reset"]
		),
	textarea.success {
		border-color: var(--color-success);
	}
	[type="checkbox"],
	[type="radio"] {
		height: 1.6rem;
		width: 2rem;
	}
	.button + .button {
		margin-left: 1rem;
	}
	.button.secondary {
		background-color: var(--color-grey);
	}
	.button.dark {
		background-color: var(--color-darkGrey);
	}
	.button.error {
		background-color: var(--color-error);
	}
	.button.success {
		background-color: var(--color-success);
	}
	.button.outline {
		background-color: transparent;
		border-color: var(--color-lightGrey);
	}
	.button.outline.primary {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}
	.button.outline.secondary {
		border-color: var(--color-grey);
		color: var(--color-grey);
	}
	.button.outline.dark {
		border-color: var(--color-darkGrey);
		color: var(--color-darkGrey);
	}
	.button.clear {
		background-color: transparent;
		border-color: transparent;
		color: var(--color-primary);
	}
	.button.icon {
		-webkit-box-align: center;
		-ms-flex-align: center;
		align-items: center;
		display: -webkit-inline-box;
		display: -ms-inline-flexbox;
		display: inline-flex;
	}
	.button.icon > img {
		margin-left: 2px;
	}
	.button.icon-only {
		padding: 1rem;
	}
	.button:active:not(:disabled),
	[type="button"]:active:not(:disabled),
	[type="reset"]:active:not(:disabled),
	[type="submit"]:active:not(:disabled),
	button:active:not(:disabled) {
		-webkit-transform: scale(0.98);
		transform: scale(0.98);
	}
	::-webkit-input-placeholder {
		color: #bdbfc4;
	}
	::-moz-placeholder {
		color: #bdbfc4;
	}
	:-ms-input-placeholder {
		color: #bdbfc4;
	}
	::-ms-input-placeholder {
		color: #bdbfc4;
	}
	::placeholder {
		color: #bdbfc4;
	}
	.nav {
		-webkit-box-align: stretch;
		-ms-flex-align: stretch;
		align-items: stretch;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		min-height: 5rem;
	}
	.nav img {
		max-height: 3rem;
	}
	.nav-center,
	.nav-left,
	.nav-right,
	.nav > .container {
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
	}
	.nav-center,
	.nav-left,
	.nav-right {
		-webkit-box-flex: 1;
		-ms-flex: 1;
		flex: 1;
	}
	.nav-left {
		-webkit-box-pack: start;
		-ms-flex-pack: start;
		justify-content: flex-start;
	}
	.nav-right {
		-webkit-box-pack: end;
		-ms-flex-pack: end;
		justify-content: flex-end;
	}
	.nav-center {
		-webkit-box-pack: center;
		-ms-flex-pack: center;
		justify-content: center;
	}
	@media screen and (max-width: 480px) {
		.nav,
		.nav > .container {
			-webkit-box-orient: vertical;
			-webkit-box-direction: normal;
			-ms-flex-direction: column;
			flex-direction: column;
		}
		.nav-center,
		.nav-left,
		.nav-right {
			-webkit-box-pack: center;
			-ms-flex-pack: center;
			-ms-flex-wrap: wrap;
			flex-wrap: wrap;
			justify-content: center;
		}
	}
	.nav .brand,
	.nav a {
		-webkit-box-align: center;
		-ms-flex-align: center;
		align-items: center;
		color: var(--color-darkGrey);
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		padding: 1rem 2rem;
		text-decoration: none;
	}
	.nav .active:not(.button),
	.nav [aria-current="page"]:not(.button) {
		color: #000;
		color: var(--color-primary);
	}
	.nav .brand {
		font-size: 1.75em;
		padding-bottom: 0;
		padding-top: 0;
	}
	.nav .brand img {
		padding-right: 1rem;
	}
	.nav .button {
		margin: auto 1rem;
	}
	.card {
		background: var(--bg-color);
		border-radius: 4px;
		-webkit-box-shadow: 0 1px 3px var(--color-grey);
		box-shadow: 0 1px 3px var(--color-grey);
		padding: 1rem 2rem;
	}
	.card p:last-child {
		margin: 0;
	}
	.card header > * {
		margin-bottom: 1rem;
		margin-top: 0;
	}
	.tabs {
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
	}
	.tabs a {
		text-decoration: none;
	}
	.tabs > .dropdown > summary,
	.tabs > a {
		-webkit-box-flex: 0;
		border-bottom: 2px solid var(--color-lightGrey);
		color: var(--color-darkGrey);
		-ms-flex: 0 1 auto;
		flex: 0 1 auto;
		padding: 1rem 2rem;
		text-align: center;
	}
	.tabs > a.active,
	.tabs > a:hover,
	.tabs > a[aria-current="page"] {
		border-bottom: 2px solid var(--color-darkGrey);
		opacity: 1;
	}
	.tabs > a.active,
	.tabs > a[aria-current="page"] {
		border-color: var(--color-primary);
	}
	.tabs.is-full a {
		-webkit-box-flex: 1;
		-ms-flex: 1 1 auto;
		flex: 1 1 auto;
	}
	.tag {
		border: 1px solid var(--color-lightGrey);
		color: var(--color-grey);
		display: inline-block;
		letter-spacing: 0.5px;
		line-height: 1;
		padding: 0.5rem;
		text-transform: uppercase;
	}
	.tag.is-small {
		font-size: 0.75em;
		padding: 0.4rem;
	}
	.tag.is-large {
		font-size: 1.125em;
		padding: 0.7rem;
	}
	.tag + .tag {
		margin-left: 1rem;
	}
	details.dropdown {
		display: inline-block;
		position: relative;
	}
	details.dropdown > :last-child {
		left: 0;
		position: absolute;
		white-space: nowrap;
	}
	.bg-primary {
		background-color: var(--color-primary) !important;
	}
	.bg-light {
		background-color: var(--color-lightGrey) !important;
	}
	.bg-dark {
		background-color: var(--color-darkGrey) !important;
	}
	.bg-grey {
		background-color: var(--color-grey) !important;
	}
	.bg-error {
		background-color: var(--color-error) !important;
	}
	.bg-success {
		background-color: var(--color-success) !important;
	}
	.bd-primary {
		border: 1px solid var(--color-primary) !important;
	}
	.bd-light {
		border: 1px solid var(--color-lightGrey) !important;
	}
	.bd-dark {
		border: 1px solid var(--color-darkGrey) !important;
	}
	.bd-grey {
		border: 1px solid var(--color-grey) !important;
	}
	.bd-error {
		border: 1px solid var(--color-error) !important;
	}
	.bd-success {
		border: 1px solid var(--color-success) !important;
	}
	.text-primary {
		color: var(--color-primary) !important;
	}
	.text-light {
		color: var(--color-lightGrey) !important;
	}
	.text-dark {
		color: var(--color-darkGrey) !important;
	}
	.text-grey {
		color: var(--color-grey) !important;
	}
	.text-error {
		color: var(--color-error) !important;
	}
	.text-success {
		color: var(--color-success) !important;
	}
	.text-white {
		color: #fff !important;
	}
	.pull-right {
		float: right !important;
	}
	.pull-left {
		float: left !important;
	}
	.text-center {
		text-align: center;
	}
	.text-left {
		text-align: left;
	}
	.text-right {
		text-align: right;
	}
	.text-justify {
		text-align: justify;
	}
	.text-uppercase {
		text-transform: uppercase;
	}
	.text-lowercase {
		text-transform: lowercase;
	}
	.text-capitalize {
		text-transform: capitalize;
	}
	.is-full-screen {
		min-height: 100vh;
		width: 100%;
	}
	.is-full-width {
		width: 100% !important;
	}
	.is-vertical-align {
		-webkit-box-align: center;
		-ms-flex-align: center;
		align-items: center;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
	}
	.is-center,
	.is-horizontal-align {
		-webkit-box-pack: center;
		-ms-flex-pack: center;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		justify-content: center;
	}
	.is-center {
		-webkit-box-align: center;
		-ms-flex-align: center;
		align-items: center;
	}
	.is-right {
		-webkit-box-pack: end;
		-ms-flex-pack: end;
		justify-content: flex-end;
	}
	.is-left,
	.is-right {
		-webkit-box-align: center;
		-ms-flex-align: center;
		align-items: center;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
	}
	.is-left {
		-webkit-box-pack: start;
		-ms-flex-pack: start;
		justify-content: flex-start;
	}
	.is-fixed {
		position: fixed;
		width: 100%;
	}
	.is-paddingless {
		padding: 0 !important;
	}
	.is-marginless {
		margin: 0 !important;
	}
	.is-pointer {
		cursor: pointer !important;
	}
	.is-rounded {
		border-radius: 100%;
	}
	.clearfix {
		clear: both;
		content: "";
		display: table;
	}
	.is-hidden {
		display: none !important;
	}
	@media screen and (max-width: 599px) {
		.hide-xs {
			display: none !important;
		}
	}
	@media screen and (min-width: 600px) and (max-width: 899px) {
		.hide-sm {
			display: none !important;
		}
	}
	@media screen and (min-width: 900px) and (max-width: 1199px) {
		.hide-md {
			display: none !important;
		}
	}
	@media screen and (min-width: 1200px) {
		.hide-lg {
			display: none !important;
		}
	}
	@media print {
		.hide-pr {
			display: none !important;
		}
	}

	/*own styles*/

	:host(:not([contenteditable="true"]):not([contenteditable=""]))
		.author-only {
		display: none;
	}
	:host {
		display: block;
		inline-size: 800px;
		max-inline-size: 100%;
		block-size: 600px;
		min-inline-size: min(260px, 100%);
		min-block-size: 280px;
		container-type: size;
		font-family: var(--sl-font-sans);
	}
	:host(:not(:fullscreen)) {
		resize: both;
		overflow: hidden;
	}
	:host(.ww-full-width) {
		inline-size: 100%;
	}

	#upper {
		--panel-trigger-width: 38px;
		--panel-trigger-height: 28px;
		--panel-handle-width: 23px;
		--panel-handle-top: 4px;
		--panel-outline: var(--sl-color-neutral-300);
		--workspace-outline-width: 1px;
		--workspace-inner-height: calc(100cqh - 2 * var(--workspace-outline-width));
		--diagram-panel-width: min(58cqw, clamp(10rem, 44cqw, 24rem));
		--diagram-width: 0px;
		--palette-panel-width: min(calc(100cqw - min(6rem, 36cqw)), clamp(13.5rem, 27cqw, 24rem));
		--palette-width: 0px;
		--lab-card-surface: var(--sl-color-neutral-0);
		--lab-card-inset: var(--sl-color-neutral-50);
		--lab-card-border: var(--sl-color-neutral-200);
		--lab-card-text: var(--sl-color-neutral-800);
		--lab-card-secondary-text: var(--sl-color-neutral-700);
		--lab-panel-shadow: 0 2px 8px rgb(0 0 0 / 9%);
		--lab-card-shadow: 0 1px 2px rgb(0 0 0 / 8%), 0 2px 5px rgb(0 0 0 / 13%);
		--canvas-control-surface: #f9f9f9;
		--canvas-control-shadow: 0 1px 3px rgb(0 0 0 / 14%);
		position: relative;
		box-sizing: border-box;
		display: grid;
		grid-template-columns: var(--diagram-width) minmax(0, 1fr) var(--palette-width);
		grid-template-rows: minmax(0, 1fr);
		transition: grid-template-columns 220ms ease;
		width: 100%;
		height: 100%;
		border: var(--workspace-outline-width) solid var(--panel-outline);
		border-radius: 5px;
		background: #fbfbfa;
	}
	#upper.show-diagram-panel {
		--diagram-width: var(--diagram-panel-width);
	}
	#upper.show-palette {
		--palette-width: var(--palette-panel-width);
	}
	#upper[data-loading] > :not(#canvasLoading) {
		/* Keep the grid dimensions used to initialize the renderer. */
		visibility: hidden;
	}
	#upper[data-loading-grid] {
		--loading-grid-line: color-mix(in srgb, var(--panel-outline) 48%, transparent);
		background-image:
			linear-gradient(to right, var(--loading-grid-line) 1px, transparent 1px),
			linear-gradient(to bottom, var(--loading-grid-line) 1px, transparent 1px);
		background-size: 18px 18px;
		background-position: center;
	}
	#canvasLoading {
		grid-area: 1 / 1 / 2 / 4;
		justify-self: center;
		align-self: center;
		box-sizing: border-box;
		inline-size: min(19rem, calc(100% - 1.5rem));
		display: grid;
		gap: 0.5rem;
		padding: 0.65rem 0.75rem;
		border: 1px solid var(--panel-outline);
		border-radius: 5px;
		background: var(--canvas-control-surface);
		color: var(--lab-card-text);
		box-shadow: var(--lab-panel-shadow);
	}
	#canvasLoading .loading-heading,
	#canvasLoading .loading-task {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	#canvasLoading .loading-heading {
		font-size: var(--sl-font-size-medium);
		line-height: 1.2;
	}
	#canvasLoading .loading-icon {
		flex: none;
		display: grid;
		place-items: center;
		inline-size: 1.625rem;
		block-size: 1.625rem;
		border: 1px solid var(--sl-color-primary-200);
		border-radius: var(--sl-border-radius-small);
		background: var(--sl-color-primary-50);
		color: var(--sl-color-primary-700);
	}
	#canvasLoading .loading-icon svg {
		inline-size: 1rem;
		block-size: 1rem;
	}
	#canvasLoading progress {
		appearance: none;
		display: block;
		inline-size: 100%;
		block-size: 0.375rem;
		border: 0;
		border-radius: var(--sl-border-radius-pill);
		overflow: hidden;
		background: var(--sl-color-neutral-200);
		accent-color: var(--sl-color-primary-600);
	}
	#canvasLoading progress::-webkit-progress-bar {
		background: var(--sl-color-neutral-200);
	}
	#canvasLoading progress::-webkit-progress-value {
		border-radius: var(--sl-border-radius-pill);
		background: var(--sl-color-primary-600);
	}
	#canvasLoading progress::-moz-progress-bar {
		border-radius: var(--sl-border-radius-pill);
		background: var(--sl-color-primary-600);
	}
	#canvasLoading .loading-task {
		justify-content: space-between;
		min-block-size: 1.25rem;
		color: var(--lab-card-secondary-text);
		font-size: var(--sl-font-size-small);
		overflow-wrap: anywhere;
	}
	#canvasLoading sl-badge {
		flex: none;
		font-variant-numeric: tabular-nums;
	}
	@media (forced-colors: active) {
		#canvasLoading progress {
			appearance: auto;
		}
	}
	:host(:fullscreen),
	:host(:fullscreen) #upper {
		width: 100%;
		height: 100%;
	}
	:host(:fullscreen) {
		min-block-size: 0;
	}
	.workspace-details::part(base) {
		border: 0;
		background: transparent;
	}
	.workspace-details::part(header) {
		box-sizing: border-box;
		flex-direction: row;
		justify-content: center;
		gap: 2px;
		padding: 0 2px;
		inline-size: var(--panel-trigger-width);
		block-size: var(--panel-trigger-height);
		background: var(--canvas-control-surface);
		border: 1px solid var(--panel-outline);
		border-radius: var(--sl-border-radius-medium);
		box-shadow: var(--canvas-control-shadow);
	}
	.workspace-details::part(summary) {
		flex: none;
	}
	.workspace-details::part(summary-icon) {
		rotate: 0deg;
	}
	.workspace-details::part(content) {
		padding: 0;
	}
	.workspace-summary {
		display: flex;
	}
	.workspace-side {
		grid-row: 1;
		position: relative;
		min-inline-size: 0;
		min-block-size: 0;
		z-index: 1;
		background: var(--lab-card-surface);
		pointer-events: none;
	}
	#upper.show-diagram-panel #diagramArea,
	#upper.show-palette #paletteArea {
		box-shadow: var(--lab-panel-shadow);
	}
	#upper.show-diagram-panel #diagramArea::after,
	#upper.show-palette #paletteArea::after {
		--handle-end: calc(var(--panel-handle-top) + var(--panel-trigger-height));
		content: "";
		position: absolute;
		inset-block: 0;
		inline-size: 1px;
		background: linear-gradient(to bottom,
			var(--panel-outline) 0 var(--panel-handle-top),
			transparent var(--panel-handle-top) var(--handle-end),
			var(--panel-outline) var(--handle-end) 100%);
		pointer-events: none;
	}
	#diagramArea::after {
		inset-inline-start: 100%;
	}
	#paletteArea::after {
		inset-inline-end: 100%;
	}
	.workspace-side .workspace-details {
		block-size: 100%;
		min-block-size: 0;
	}
	.workspace-side .workspace-details::part(header) {
		position: absolute;
		inset-block-start: var(--panel-handle-top);
		z-index: 1;
		pointer-events: auto;
	}
	.workspace-side .workspace-details::part(header):focus-visible {
		outline: 2px solid var(--sl-color-neutral-600);
		outline-offset: -3px;
	}
	.workspace-side .workspace-details[open]::part(header) {
		inline-size: var(--panel-handle-width);
		gap: 0;
	}
	.workspace-side .workspace-details[open] .workspace-summary > svg {
		display: none;
	}
	.workspace-side .workspace-details:dir(rtl) > svg {
		transform: scaleX(-1);
	}
	.workspace-side .workspace-details::part(base) {
		block-size: 100%;
		overflow: visible;
	}
	.workspace-side .workspace-details[open]::part(base) {
		pointer-events: auto;
	}
	#diagramArea {
		--diagram-axis-font-size: 11px;
		--diagram-axis-color: var(--sl-color-primary-800);
		grid-column: 1;
		background: var(--canvas-control-surface);
		font-family: var(--sl-font-sans);
	}
	#diagramArea:has(.diagram-builder-popup, .diagram-axis-select[open]) {
		z-index: 2;
	}
	#diagramControls {
		position: absolute;
		inset-block-start: var(--panel-handle-top);
		inset-inline-start: 100%;
		z-index: 2;
		pointer-events: none;
	}
	#diagramHandle {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2px;
		box-sizing: border-box;
		inline-size: var(--panel-trigger-width);
		block-size: var(--panel-trigger-height);
		margin: 0;
		padding: 0 2px;
		border: 1px solid var(--panel-outline);
		border-inline-start: 0;
		border-radius: 0 var(--sl-border-radius-medium) var(--sl-border-radius-medium) 0;
		background: var(--canvas-control-surface);
		box-shadow: var(--canvas-control-shadow);
		color: var(--lab-card-secondary-text);
		cursor: pointer;
		pointer-events: auto;
	}
	#diagramHandle:focus-visible {
		outline: 2px solid var(--sl-color-neutral-600);
		outline-offset: -3px;
	}
	#diagramHandle.diagram-handle-idle {
		color: var(--sl-color-neutral-500);
	}
	.diagram-suggestion-count {
		position: absolute;
		inset-block-start: -4px;
		inset-inline-end: -5px;
		pointer-events: none;
	}
	.diagram-suggestion-count::part(base) {
		padding: 1px 4px;
		font-size: 9px;
	}
	.show-diagram-panel #diagramHandle {
		inline-size: var(--panel-handle-width);
	}
	.diagram-surface {
		border: 1px solid var(--lab-card-border);
		border-radius: var(--sl-border-radius-medium);
		background: var(--canvas-control-surface);
		color: var(--lab-card-text);
		box-shadow: var(--lab-panel-shadow);
	}
	.diagram-builder {
		box-sizing: border-box;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 6px;
		padding: 6px;
		pointer-events: auto;
	}
	.diagram-builder-popup {
		inline-size: min(18rem, 85cqw);
		max-block-size: max(0px, calc(var(--workspace-inner-height) - var(--panel-trigger-height) - 10px));
		overflow: auto;
		overscroll-behavior: contain;
		scrollbar-width: thin;
	}
	.diagram-builder-inline {
		margin-block-end: 6px;
	}
	.diagram-builder-inline .diagram-suggestions {
		max-block-size: min(13rem, 30cqh);
		overflow: auto;
		overscroll-behavior: contain;
		scrollbar-width: thin;
		padding: 2px;
	}

	.diagram-builder-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
		min-inline-size: 0;
	}
	.diagram-section-tag {
		justify-self: start;
		max-inline-size: 100%;
	}
	.diagram-dismissed-trigger {
		flex: none;
		max-inline-size: 100%;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: var(--sl-border-radius-medium);
		background: transparent;
		color: inherit;
		text-align: start;
		cursor: pointer;
	}
	.diagram-dismissed-trigger > sl-tag {
		max-inline-size: 100%;
		pointer-events: none;
	}
	.diagram-dismissed-trigger[aria-expanded="true"] svg {
		transform: rotate(180deg);
	}
	.diagram-section-tag::part(base),
	.diagram-dismissed-trigger sl-tag::part(base),
	.diagram-sources sl-tag::part(base) {
		block-size: auto;
		min-block-size: 19px;
		line-height: 1.3;
		padding-block: 1px;
	}
	.diagram-section-tag::part(content),
	.diagram-dismissed-trigger sl-tag::part(content),
	.diagram-sources sl-tag::part(content) {
		white-space: normal;
		overflow-wrap: anywhere;
	}
	.diagram-dismissed-trigger sl-tag::part(base) {
		font-size: var(--diagram-axis-font-size);
	}
	.diagram-axis-select {
		--sl-input-height-small: 24px;
		--sl-input-font-size-small: var(--diagram-axis-font-size);
		--sl-input-spacing-small: 6px;
		min-inline-size: 0;
	}
	.diagram-builder .diagram-section-tag::part(content),
	.diagram-axis-select::part(form-control-label),
	.diagram-suggestion-title,
	.diagram-suggestion-axis b {
		font-size: var(--diagram-axis-font-size);
		font-weight: 700;
		color: var(--diagram-axis-color);
	}
	.diagram-axis-select::part(listbox) {
		scrollbar-width: thin;
	}
	.diagram-axis-select sl-divider {
		--spacing: 3px;
	}
	.diagram-axis-group-label {
		padding: 3px 8px;
		color: var(--lab-card-secondary-text);
		font-size: var(--sl-font-size-x-small);
		font-weight: var(--sl-font-weight-semibold);
		overflow-wrap: anywhere;
	}
	.diagram-axis-select sl-option::part(base) {
		padding: 3px 7px;
		font-size: var(--diagram-axis-font-size);
	}
	.diagram-axis-select sl-option::part(label) {
		white-space: normal;
		overflow-wrap: anywhere;
	}
	.diagram-suggestions {
		display: grid;
		gap: 5px;
	}
	.diagram-suggestion-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: start;
		gap: 4px;
	}
	.diagram-dismiss::part(base) {
		min-block-size: 22px;
		color: var(--lab-card-secondary-text);
	}
	.diagram-dismiss::part(label) {
		padding-inline: 4px;
	}
	.diagram-suggestion::part(base) {
		inline-size: 100%;
		justify-content: start;
		border-color: var(--lab-card-border);
		box-shadow: var(--canvas-control-shadow);
	}
	.diagram-suggestion-dismissed::part(base) {
		border: 1px solid var(--sl-color-warning-300);
		background: var(--sl-color-warning-50);
		box-shadow: none;
	}
	.diagram-suggestion::part(label) {
		display: grid;
		gap: 2px;
		min-inline-size: 0;
		padding: 4px 6px;
		text-align: start;
		white-space: normal;
		overflow-wrap: anywhere;
		line-height: 1.25;
	}
	.diagram-suggestion-axis,
	.diagram-empty {
		color: var(--lab-card-secondary-text);
		font-size: var(--sl-font-size-x-small);
	}
	.diagram-empty {
		margin: 2px 0;
		line-height: 1.4;
	}
	#inlineDiagramPanel {
		box-sizing: border-box;
		inline-size: 100%;
		block-size: var(--workspace-inner-height);
		overflow: hidden auto;
		overscroll-behavior-y: contain;
		scrollbar-width: thin;
		padding: 4px 6px 6px;
		pointer-events: auto;
	}
	#inlineDiagramPanel[inert] {
		visibility: hidden;
		pointer-events: none;
	}
	.diagram-toolbar,
	.diagram-heading {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
	}
	.diagram-toolbar {
		margin-block-end: 6px;
		padding: 5px;
	}
	.diagram-toolbar sl-checkbox {
		--sl-input-font-size-medium: var(--sl-font-size-small);
	}
	.diagram-control::part(base) {
		background: var(--canvas-control-surface);
		box-shadow: var(--canvas-control-shadow);
	}
	.diagram-control::part(base):hover {
		background: var(--sl-color-neutral-100);
	}
	.diagram-control::part(label) {
		display: flex;
		align-items: center;
		white-space: normal;
	}
	.diagram-remove::part(base) {
		min-block-size: 22px;
		color: var(--sl-color-danger-600);
	}
	.diagram-remove::part(label) {
		padding-inline: 4px;
	}
	.diagram-cards {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 8px;
		padding: 2px 2px 5px;
	}
	.diagram-card {
		display: grid;
		gap: 5px;
		padding: 5px;
		border-radius: 4px;
		background: var(--lab-card-surface);
		color: var(--lab-card-text);
		box-shadow: var(--lab-card-shadow);
	}
	.diagram-trim-track {
		--diagram-thumb-radius: 6px;
		position: absolute;
	}
	.diagram-trim-track-x {
		left: var(--plot-left);
		right: var(--plot-right);
		bottom: 2px;
		height: 20px;
	}
	.diagram-trim-track-y {
		top: var(--plot-top);
		bottom: var(--plot-bottom);
		left: 2px;
		width: 20px;
	}
	.diagram-trim-rail,
	.diagram-trim-window {
		position: absolute;
	}
	.diagram-trim-rail {
		pointer-events: none;
	}
	.diagram-trim-rail::after,
	.diagram-trim-window::after {
		content: "";
		position: absolute;
		border-radius: var(--sl-border-radius-pill);
		pointer-events: none;
	}
	.diagram-trim-rail::after {
		background: var(--sl-color-neutral-200);
	}
	.diagram-trim-window::after {
		background: var(--sl-color-primary-300);
	}
	.diagram-trim-track-x :is(.diagram-trim-rail, .diagram-trim-window, .diagram-trim-handle) {
		top: 0;
		bottom: 0;
	}
	.diagram-trim-track-x :is(.diagram-trim-rail, .diagram-trim-window)::after {
		inset: calc(50% - 3px) 0 auto;
		height: 6px;
	}
	.diagram-trim-track-x .diagram-trim-rail {
		left: 0;
		right: 0;
	}
	.diagram-trim-track-x .diagram-trim-window {
		left: var(--trim-min);
		right: calc(100% - var(--trim-max));
	}
	.diagram-trim-track-y :is(.diagram-trim-rail, .diagram-trim-window, .diagram-trim-handle) {
		left: 0;
		right: 0;
	}
	.diagram-trim-track-y :is(.diagram-trim-rail, .diagram-trim-window)::after {
		inset: 0 auto 0 calc(50% - 3px);
		width: 6px;
	}
	.diagram-trim-track-y .diagram-trim-rail {
		top: 0;
		bottom: 0;
	}
	.diagram-trim-track-y .diagram-trim-window {
		top: calc(100% - var(--trim-max));
		bottom: var(--trim-min);
	}
	.diagram-trim-handle {
		position: absolute;
		padding: 0;
		border: 0;
		border-radius: var(--sl-border-radius-small);
		background: transparent;
		touch-action: none;
		user-select: none;
	}
	.diagram-trim-handle::after {
		content: "";
		position: absolute;
		width: calc(2 * var(--diagram-thumb-radius));
		height: calc(2 * var(--diagram-thumb-radius));
		border-radius: 50%;
		background: var(--sl-color-primary-600);
	}
	.diagram-trim-handle:is(:hover, :active)::after {
		background: var(--sl-color-primary-500);
	}
	.diagram-trim-track-x .diagram-trim-handle {
		width: 10px;
		cursor: ew-resize;
	}
	.diagram-trim-track-x .diagram-trim-handle::after {
		top: calc(50% - var(--diagram-thumb-radius));
	}
	.diagram-trim-track-x .diagram-trim-min {
		right: calc(100% - var(--trim-min));
	}
	.diagram-trim-track-x .diagram-trim-min::after {
		right: calc(-1 * var(--diagram-thumb-radius));
	}
	.diagram-trim-track-x .diagram-trim-max {
		left: var(--trim-max);
	}
	.diagram-trim-track-x .diagram-trim-max::after {
		left: calc(-1 * var(--diagram-thumb-radius));
	}
	.diagram-trim-track-y .diagram-trim-handle {
		height: 10px;
		cursor: ns-resize;
	}
	.diagram-trim-track-y .diagram-trim-handle::after {
		left: calc(50% - var(--diagram-thumb-radius));
	}
	.diagram-trim-track-y .diagram-trim-min {
		top: calc(100% - var(--trim-min));
	}
	.diagram-trim-track-y .diagram-trim-min::after {
		top: calc(-1 * var(--diagram-thumb-radius));
	}
	.diagram-trim-track-y .diagram-trim-max {
		bottom: var(--trim-max);
	}
	.diagram-trim-track-y .diagram-trim-max::after {
		bottom: -8px;
	}

	.diagram-trim-handle:focus-visible {
		outline: none;
		z-index: 1;
	}
	.diagram-trim-handle:focus-visible::after {
		outline: var(--sl-focus-ring);
		outline-offset: var(--sl-focus-ring-offset);
	}
	.diagram-marker-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 3px 8px;
		color: var(--lab-card-secondary-text);
		font-size: var(--sl-font-size-x-small);
	}
	.diagram-marker-legend span {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.diagram-marker {
		flex: none;
		display: inline-block;
		width: 8px;
		height: 8px;
	}
	.diagram-marker-equivalence {
		background: var(--sl-color-warning-600);
		clip-path: polygon(50% 0, 100% 100%, 0 100%);
	}
	.diagram-marker-neutral {
		box-sizing: border-box;
		border: 1.5px solid var(--sl-color-success-600);
		border-radius: 50%;
	}
	.diagram-marker-half-equivalence {
		background: var(--sl-color-primary-600);
		transform: scale(0.8) rotate(45deg);
	}
	.diagram-axis-reset {
		position: absolute;
		left: 2px;
		display: grid;
		place-items: center;
		width: 24px;
		height: 20px;
		padding: 0;
		border: 1px solid var(--lab-card-border);
		border-radius: var(--sl-border-radius-medium);
		background: var(--lab-card-surface);
		color: var(--sl-color-primary-800);
		cursor: pointer;
		font: 600 10px var(--sl-font-sans);
		white-space: nowrap;
	}
	.diagram-axis-reset:disabled {
		visibility: hidden;
	}
	.diagram-axis-reset-x {
		bottom: 2px;
	}
	.diagram-axis-reset-y {
		bottom: 24px;
	}

	.diagram-sources {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
	}
	.diagram-source,
	.diagram-sources sl-tag {
		max-inline-size: 100%;
	}
	.diagram-source {
		display: inline-flex;
		padding: 0;
		border: 0;
		border-radius: var(--sl-border-radius-medium);
		background: transparent;
		cursor: pointer;
	}
	.diagram-source:is(:hover, :focus-visible) sl-tag::part(base) {
		border-color: var(--sl-color-primary-300);
		background: var(--sl-color-primary-50);
		color: var(--sl-color-primary-800);
	}
	.diagram-plot {
		position: relative;
		block-size: 250px;
		min-inline-size: 0;
		border: 1px solid var(--lab-card-border);
		border-radius: var(--sl-border-radius-medium);
		background: var(--lab-card-inset);
	}
	@media (prefers-reduced-motion: reduce) {
		#upper {
			transition: none;
		}
	}
	.selection-info[hidden] {
		display: none;
	}
	.panel-button-label {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.builder-exchange {
		position: absolute;
		inset: .5rem auto auto .5rem;
		z-index: 8;
		max-width: calc(100% - 1rem);
		padding: .5rem;
		border: 1px solid var(--lab-card-border);
		border-radius: 5px;
		background: var(--lab-card-surface);
		box-shadow: var(--lab-panel-shadow);
	}

	.builder-reference-list, .builder-reference-list > div {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: .35rem;
	}

	.builder-exchange p {
		margin: 0;
		font-size: .8rem;
	}

	.vessel-structure-link {
		padding: 0;
		border: 0;
		background: none;
		color: var(--sl-color-primary-700);
		font: inherit;
		text-decoration: underline;
		cursor: pointer;
	}

	#canvasArea {
		grid-column: 2;
		grid-row: 1;
		position: relative;
		min-width: 0;
		min-height: 0;
	}
	#canvasArea p_c,
	#canvasArea canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
	#canvasArea canvas {
		touch-action: none;
	}
	#canvasZoom {
		position: absolute;
		inset-block-end: 4px;
		inset-inline-end: 4px;
		max-width: calc(100% - 8px);
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 3px;
	}
	#resetZoom {
		display: inline-flex;
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
	}
	#zoomLevel::part(base) {
		min-inline-size: 3.5rem;
		justify-content: center;
		font-variant-numeric: tabular-nums;
	}
	#gridScale[hidden] {
		display: none;
	}
	#gridScale::part(content) {
		display: flex;
		align-items: center;
		gap: 5px;
	}
	.grid-scale-line {
		box-sizing: border-box;
		flex: none;
		inline-size: var(--grid-cell-width, 0px);
		block-size: 5px;
		border: 1px solid currentColor;
		border-block-start: 0;
	}
	#canvasZoom sl-button::part(label) {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 24px;
		padding-inline: 3px;
	}
	#canvasZoom sl-button::part(base),
	#canvasZoom sl-tag::part(base) {
		box-shadow: var(--canvas-control-shadow);
	}
	#canvasZoom sl-button:not([aria-pressed="true"])::part(base):not(:hover):not(:active),
	#canvasZoom sl-tag::part(base) {
		background: var(--canvas-control-surface);
	}
	.selection-info {
		position: absolute;
		inset: 0 auto auto 0;
		box-sizing: border-box;
		inline-size: max-content;
		max-inline-size: min(13rem, calc(100% - 8px));
		max-block-size: min(11rem, 36vh, calc(100% - 8px));
		overflow: auto;
		padding: 5px;
		background: var(--lab-card-surface);
		border: 1px solid var(--lab-card-border);
		border-radius: 5px;
		box-shadow: var(--lab-panel-shadow);
		font-size: 0.85rem;
		overflow-wrap: anywhere;
	}
	#contextInfoBox {
		max-block-size: min(14rem, calc(100% - 8px));
	}
	#contextInfoBox:has(.electrical-settings[open]) {
		max-block-size: min(26rem, calc(100% - 8px));
	}
	#contextInfoBox p {
		margin: 0.25em 0;
	}
	.object-summary-heading,
	#contextMixInfo {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	#contextMixInfo {
		flex-wrap: wrap;
	}
	#contextInfoBox .object-summary-heading {
		position: sticky;
		inset-block-start: 0;
		z-index: 2;
		background: var(--lab-card-surface);
	}
	.object-summary-action {
		display: grid;
		place-items: center;
		box-sizing: border-box;
		flex: none;
		inline-size: 22px;
		block-size: 20px;
		margin: 0;
		padding: 0;
		border-color: var(--lab-card-border);
		background: var(--lab-card-inset);
	}
	.object-summary-action:focus-visible {
		outline: var(--sl-focus-ring);
		outline-offset: var(--sl-focus-ring-offset);
	}
	.empty-vessel {
		color: var(--sl-color-primary-700);
	}
	.empty-vessel:hover {
		background: var(--sl-color-primary-100);
		border-color: var(--sl-color-primary-200);
	}
	.object-summary-action.remObj {
		margin-inline-start: auto;
		align-self: flex-start;
		color: var(--sl-color-danger-700);
	}
	.object-summary-action.remObj:hover {
		background: var(--sl-color-danger-50);
		border-color: var(--sl-color-danger-200);
	}
	.electrical-settings {
		inline-size: 10.5rem;
		max-inline-size: 100%;
	}
	.electrical-settings::part(base) {
		display: flex;
		flex-direction: column-reverse;
		border: 0;
		background: transparent;
	}
	.electrical-settings::part(header) {
		position: sticky;
		inset-block-end: 0;
		z-index: 1;
		align-self: center;
		box-sizing: border-box;
		block-size: 20px;
		inline-size: 24px;
		padding: 0;
		justify-content: center;
		color: var(--lab-card-secondary-text);
		background: var(--lab-card-surface);
	}
	.electrical-settings::part(header):hover {
		background: var(--lab-card-inset);
		color: var(--sl-color-primary-700);
	}
	.electrical-settings::part(summary) {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	.electrical-settings::part(summary-icon) {
		rotate: none;
	}
	.electrical-settings::part(content) {
		padding: 4px;
	}
	.electrical-settings sl-input,
	.electrical-settings label {
		display: block;
		margin-block-end: 4px;
	}
	.electrical-settings select {
		display: block;
		box-sizing: border-box;
		inline-size: 100%;
		min-block-size: var(--sl-input-height-small);
		border: 1px solid var(--sl-input-border-color);
		border-radius: var(--sl-input-border-radius-medium);
		font: inherit;
	}
	#contextMolInfo {
		inline-size: 12rem;
		max-inline-size: 100%;
		margin-block: 5px;
		--slide-gap: 0px;
	}
	#contextMolInfo::part(base) {
		gap: 4px 0;
	}
	#contextMolInfo::part(scroll-container) {
		height: auto;
		aspect-ratio: auto;
		grid-auto-rows: auto;
	}
	#contextMolInfo sl-carousel-item {
		--aspect-ratio: auto;
		min-inline-size: 0;
	}
	#contextMolInfo .vessel-carousel-card {
		box-sizing: border-box;
		display: grid;
		grid-template-columns: minmax(0, 3.5rem) minmax(0, 1fr);
		align-items: center;
		gap: 4px;
		inline-size: 100%;
		block-size: auto;
		padding: 2px 3px;
		overflow: hidden;
		border: 2px solid var(--lab-card-border);
		border-radius: 5px;
		background: var(--lab-card-inset);
		color: var(--lab-card-text);
	}
	#contextMolInfo .vessel-carousel-thumbnail {
		display: grid;
		place-items: center;
		text-align: center;
		/* Text thumbnails (ion formulas without a drawn structure) keep the
		   square size of the structure thumbnails so all cards share a height. */
		aspect-ratio: 1;
		align-self: center;
		overflow: hidden;
	}
	#contextMolInfo .vessel-thumbnail-source {
		position: absolute;
		inset-block-start: 2px;
		inset-inline-start: 2px;
		z-index: 1;
		padding: 0 2px;
		border-radius: 3px;
		background: var(--sl-color-primary-600);
		color: var(--sl-color-neutral-0);
		font-size: 8px;
		line-height: 1.4;
		pointer-events: none;
	}
	#contextMolInfo .vessel-carousel-thumbnail {
		position: relative;
	}
	#contextMolInfo .vessel-carousel-thumbnail > :is(svg, img) {
		display: block;
		inline-size: 100%;
		block-size: auto;
		aspect-ratio: 1;
		object-fit: contain;
	}
	#contextMolInfo .vessel-carousel-quantities {
		display: grid;
		gap: 2px;
		line-height: 1.25;
	}
	#contextMolInfo .vessel-carousel-quantities > :is(h5, p) {
		margin: 0;
		white-space: normal;
		overflow-wrap: anywhere;
		word-break: normal;
		hyphens: none;
	}
	#contextMolInfo .vessel-carousel-quantities > p {
		display: block;
		font-variant-numeric: tabular-nums;
		color: var(--lab-card-secondary-text);
	}
	/* A deposit sits on the electrode, not in the vessel, so its card is
	   outlined differently and says where the metal is. */
	#contextMolInfo .vessel-carousel-card.plated {
		border-style: dashed;
		border-color: var(--sl-color-primary-600);
	}
	#contextMolInfo .vessel-carousel-quantities > p.vessel-carousel-location {
		color: var(--sl-color-primary-700);
		font-weight: 600;
	}
	#contextMolInfo::part(pagination) {
		gap: 5px;
	}
	#contextMolInfo::part(pagination-item) {
		width: 6px;
		height: 6px;
		background-color: var(--sl-color-neutral-400);
	}
	#contextMolInfo::part(pagination-item--active) {
		background-color: var(--sl-color-primary-700);
	}
	#contextMixInfo sl-tag:not(.vessel-ph-tag)::part(base) {
		background: var(--lab-card-inset);
		border-color: var(--lab-card-border);
		color: var(--lab-card-text);
	}
	.vessel-ph-tag::part(base) {
		background: var(--indicator-color);
		border-color: color-mix(in srgb, var(--indicator-color), currentColor 15%);
		color: var(--indicator-text);
	}
	.vessel-saturation-tag::part(base) {
		aspect-ratio: 1;
		justify-content: center;
		padding-inline: 0;
	}
	.vessel-saturation-circle {
		display: block;
		box-sizing: border-box;
		inline-size: 13px;
		block-size: 13px;
		border: 1px solid var(--sl-color-primary-600);
		border-radius: 50%;
		background: linear-gradient(to top, var(--sl-color-primary-600) var(--saturation-fill),
			transparent var(--saturation-fill));
	}
	.selection-info:not([data-anchored]) {
		visibility: hidden;
	}
	#amountMenu {
		display: grid;
		gap: 4px;
		z-index: 2;
		inline-size: min(12rem, calc(100% - 8px));
		max-inline-size: none;
		max-block-size: min(16rem, calc(100% - 8px));
		padding: 5px;
	}
	.amount-menu-heading,
	.amount-menu-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 3px;
	}
	.amount-menu-heading strong {
		font-size: .77rem;
		line-height: 1.15;
	}
	.amount-menu-route {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) auto minmax(0, 1fr);
		align-items: center;
		gap: 3px;
	}
	.amount-menu-route sl-tag::part(base) {
		box-sizing: border-box;
		block-size: auto;
		min-block-size: 1.125rem;
		inline-size: 100%;
		font-size: .71rem;
		padding-inline: 4px;
		padding-block: 2px;
		white-space: normal;
		line-height: 1.15;
		overflow-wrap: anywhere;
	}
	.amount-menu-arrow {
		display: grid;
		place-items: center;
		color: var(--lab-card-secondary-text);
	}
	.amount-menu-actions {
		flex: none;
		justify-content: flex-end;
	}
	.volume-bar {
		border-radius: var(--sl-border-radius-small);
		--amount-fill: color-mix(in srgb, var(--sl-color-primary-500) 16%, transparent);
		background: linear-gradient(to right, var(--amount-fill) var(--amount-progress), transparent var(--amount-progress)),
			color-mix(in srgb, var(--sl-color-primary-500) 7%, var(--sl-color-neutral-0));
	}
	.amount-editor {
		position: absolute;
		inset: 0;
		box-sizing: border-box;
		inline-size: 100%;
		min-inline-size: 0;
		block-size: 100%;
		margin: 0;
		padding: 0 3px;
		font: inherit;
		text-align: center;
	}
	.amount-slider {
		position: absolute;
		inset: 0;
		appearance: none;
		inline-size: 100%;
		block-size: 100%;
		min-block-size: 0;
		margin: 0;
		padding: 0;
		border: 0;
		font: inherit;
		border-radius: var(--sl-border-radius-small);
		background: transparent;
		cursor: ew-resize;
		touch-action: none;
	}
	.amount-slider::-webkit-slider-thumb {
		appearance: none;
		inline-size: 1px;
		block-size: 100%;
		background: transparent;
	}
	.amount-slider::-moz-range-thumb {
		inline-size: 1px;
		block-size: 100%;
		border: 0;
		background: transparent;
	}
	.selection-labels {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.selection-labels > sl-badge {
		margin: 0;
	}
	.device-controls {
		display: grid;
		max-inline-size: 100%;
		margin-block: 3px;
		padding: 3px;
		box-sizing: border-box;
		border: 1px solid var(--lab-card-border);
		border-radius: 4px;
	}
	.device-controls[data-adjustable] { inline-size: 10.5rem; }
	.device-controls:has(#dispenseBurette) { min-inline-size: min(10.5rem, 100%); inline-size: 100%; }
	.device-actions, .device-mode, .device-readouts {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 3px;
	}
	.device-actions { flex: none; justify-content: flex-end; }
	.device-actions:has(.device-mode) { justify-content: space-between; }
	.device-readouts { padding-block-start: 3px; font-size: .74rem; font-variant-numeric: tabular-nums; }
	.device-reading {
		padding: 1px 5px;
		border: 1px solid var(--lab-card-border);
		border-radius: 4px;
		background: var(--lab-card-inset);
	}
	.device-diagnostics {
		margin-block: 2px;
		font-size: .74rem;
		color: var(--lab-card-secondary-text);
	}
	.device-diagnostics summary {
		cursor: pointer;
	}
	#paletteArea {
		--palette-inset: 8px;
		--palette-section-fill: #f8f6fa;
		--palette-heading-fill: #e8e0ee;
		--palette-heading-badge: #ded3e7;
		--palette-heading-ink: #4e3e5d;
		--palette-subheading-fill: #f1edf4;
		--palette-subheading-ink: #5e5367;
		grid-column: 3;
		background: var(--canvas-control-surface);
	}
	#teacherDrawer::part(header) {
		inset-inline-end: 100%;
		flex-direction: row-reverse;
		border-inline-end: 0;
		border-start-end-radius: 0;
		border-end-end-radius: 0;
	}
	#teacherDrawer::part(content) {
		overflow: hidden;
		padding: 0;
	}
	#teacherDrawerContent {
		box-sizing: border-box;
		inline-size: var(--palette-panel-width);
		block-size: var(--workspace-inner-height);
		margin-inline-start: min(0px, calc(100% - var(--palette-panel-width)));
		padding: 4px 6px 6px;
		overflow: hidden;
	}
	.selected-chemical {
		max-inline-size: 100%;
		justify-self: start;
	}
	.selected-chemical::part(label) {
		white-space: normal;
		overflow-wrap: anywhere;
	}
	#teacherTabs::part(nav) {
		flex: none;
		background: transparent;
	}
	#teacherTabs::part(tabs) {
		gap: 4px;
		background: var(--canvas-control-surface);
	}
	#teacherTabs {
		/* Shoelace's shared indicator does not include the gap between tabs. */
		--track-width: 0px;
		block-size: 100%;
		border-radius: var(--sl-border-radius-medium);
		background: var(--canvas-control-surface);
		box-shadow: 0 1px 5px rgb(0 0 0 / 10%);
	}
	#teacherTabs::part(base) {
		block-size: 100%;
	}
	#teacherTabs::part(body) {
		flex: 1 1 auto;
		min-block-size: 0;
		background: var(--lab-card-surface);
		overflow: hidden auto;
		overscroll-behavior-y: contain;
		scrollbar-width: thin;
		scrollbar-gutter: stable;
	}
	#teacherTabs > sl-tab {
		flex: 0 0 auto;
	}
	#teacherTabs > sl-tab::part(base) {
		display: flex;
		justify-content: center;
		box-sizing: border-box;
		block-size: 100%;
		min-block-size: var(--panel-trigger-height);
		padding: 3px 7px;
		border: 1px solid var(--lab-card-border);
		border-bottom: 0;
		border-radius: var(--sl-border-radius-medium) var(--sl-border-radius-medium) 0 0;
		background: var(--lab-card-surface);
		color: var(--lab-card-secondary-text);
		text-align: center;
		line-height: 1.2;
		white-space: nowrap;
	}
	#teacherTabs > sl-tab:hover::part(base) {
		background: var(--sl-color-neutral-100);
	}
	#teacherTabs > sl-tab[active]::part(base) {
		border-color: var(--sl-color-primary-200);
		color: var(--sl-color-primary-800);
		box-shadow: inset 0 -2px var(--sl-color-primary-600);
	}
	#teacherTabs > sl-tab-panel {
		--padding: 0;
	}
	.palette-content {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--palette-inset);
		padding: var(--palette-inset);
	}
	.palette-empty {
		margin: 0;
		color: var(--lab-card-secondary-text);
	}
	.palette-card {
		display: grid;
		grid-template-rows: auto 1fr;
		gap: 5px;
		min-inline-size: 0;
		padding: 5px;
		border-radius: 4px;
		background: var(--lab-card-surface);
		box-shadow: var(--lab-card-shadow);
		color: var(--lab-card-text);
	}
	.palette-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 6px;
	}
	.palette-card-name {
		position: relative;
		min-inline-size: 0;
	}
	.palette-card-name > sl-tag {
		max-inline-size: 100%;
	}
	.palette-card-name sl-tag::part(base) {
		block-size: auto;
		min-block-size: 1.5em;
		padding: 1px 5px;
		line-height: 1.25;
		white-space: normal;
		overflow-wrap: anywhere;
	}
	.palette-card:not(.palette-card-chemical) :is(.palette-card-name sl-tag, .palette-variant-value)::part(base) {
		min-inline-size: 0;
		white-space: nowrap;
	}
	.palette-card:not(.palette-card-chemical) :is(.palette-card-name sl-tag, .palette-variant-value)::part(content) {
		display: block;
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.palette-card-menu-indicator {
		margin-inline-start: 3px;
		vertical-align: -1px;
	}
	.component-permission-toggle {
		display: inline-flex;
		flex: none;
		cursor: pointer;
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		touch-action: manipulation;
		user-select: none;
	}
	.component-permission-toggle > sl-badge {
		margin: 0;
	}
	#permissionPopup {
		position: absolute;
		inset: 0;
		z-index: var(--sl-z-index-tooltip);
		pointer-events: none;
		--arrow-color: var(--sl-tooltip-background-color);
	}
	#permissionPopup:not([data-current-placement])::part(popup) {
		visibility: hidden;
	}
	#permissionTooltip {
		max-width: min(20rem, 80cqw);
		padding: var(--sl-tooltip-padding);
		border-radius: var(--sl-tooltip-border-radius);
		background: var(--sl-tooltip-background-color);
		color: var(--sl-tooltip-color);
		font-size: var(--sl-tooltip-font-size);
		line-height: var(--sl-tooltip-line-height);
	}
	.palette-variant-controls {
		display: grid;
		grid-template-columns: minmax(16px, 1fr) minmax(0, max-content) minmax(16px, 1fr);
		align-items: center;
		gap: 2px;
		min-block-size: 25px;
		padding-inline: 2px;
	}
	.palette-variant-value {
		grid-area: 1 / 2;
		min-inline-size: 0;
	}
	.palette-variant-controls sl-tag::part(base) {
		block-size: auto;
		min-block-size: 18px;
		justify-content: center;
		line-height: 1.2;
		white-space: normal;
		overflow-wrap: anywhere;
	}
	.palette-variant {
		border: 1px solid var(--lab-card-border);
		border-radius: var(--sl-border-radius-medium);
		background: var(--lab-card-inset);
	}
	.palette-preview-area {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}
	.palette-card-permission {
		grid-area: 1 / 1;
		z-index: 1;
		display: grid;
		place-items: center;
		justify-self: end;
		align-self: end;
		margin: 0 6px 4px;
	}
	.palette-card-permission sl-tooltip {
		--show-delay: 650ms;
	}
	.palette-card-permission sl-checkbox::part(label) {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: 0;
		overflow: hidden;
		clip-path: inset(50%);
	}
	.variant-arrow::part(base) {
		width: 100%;
		min-height: 0;
		height: 20px;
	}
	.variant-arrow:dir(rtl) svg {
		transform: scaleX(-1);
	}
	.variant-arrow[disabled] {
		visibility: hidden;
	}
	.variant-arrow::part(label) {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}
	.chemical-filters {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 6px;
		padding: 0;
	}
	.chemical-group-select {
		grid-area: 1 / 1 / 2 / -1;
		min-inline-size: 0;
	}
	#teacherTabs .chemical-group-select::part(combobox) {
		margin: 0;
	}
	.chemical-search {
		grid-area: 2 / 1 / 3 / -1;
		min-inline-size: 0;
	}
	.chemical-filters:has(.chemical-filter-badge) .chemical-search {
		grid-column-end: 2;
	}
	.chemical-filter-badge {
		grid-area: 2 / 2;
		justify-self: end;
	}
	.chemical-filters ::part(form-control-label) {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	.palette-card-menu-trigger {
		display: block;
		max-inline-size: 100%;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: var(--sl-border-radius-medium);
		background: transparent;
		color: inherit;
		text-align: start;
		cursor: pointer;
	}
	.palette-card-menu-trigger > sl-tag {
		max-inline-size: 100%;
		pointer-events: none;
	}
	.palette-card-menu-trigger[aria-expanded="true"] svg {
		transform: rotate(180deg);
	}
	.chemical-card-body {
		position: relative;
		min-inline-size: 0;
		contain: inline-size;
	}
	.chemical-card-preview:has(> .structure-link) {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 4px;
	}
	.structure-link {
		justify-self: start;
		max-inline-size: 100%;
	}
	.structure-link::part(base) {
		max-inline-size: 100%;
		height: auto;
		min-height: 24px;
	}
	.structure-link::part(label) {
		padding: 2px 7px;
		line-height: 1.25;
		white-space: normal;
		overflow-wrap: anywhere;
	}
	.chemical-card-preview[data-menu-open] {
		visibility: hidden;
	}
	.chemical-concentration-permissions {
		position: absolute;
		inset: 0;
		box-sizing: border-box;
		padding: 3px 5px;
		overflow-y: auto;
		overscroll-behavior-y: contain;
		scrollbar-width: thin;
	}
	.chemical-concentration-permissions > sl-checkbox {
		display: block;
		padding-block: 2px;
	}
	.palette-section,
	.palette-section-body,
	.palette-subgroup,
	.palette-card-list {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}
	.palette-section {
		border-radius: var(--sl-border-radius-medium);
	}
	.palette-section:has(> .palette-section-heading) {
		background: var(--palette-section-fill);
	}
	.palette-section-heading,
	.palette-subgroup-heading {
		padding: 4px var(--palette-inset);
	}
	.palette-section-heading {
		border-start-start-radius: inherit;
		border-start-end-radius: inherit;
		background: var(--palette-heading-fill);
		color: var(--palette-heading-ink);
	}
	.palette-section-body {
		gap: 12px;
		padding: var(--palette-inset);
	}
	.palette-subgroup {
		gap: 6px;
	}
	.palette-subgroup-heading {
		border-radius: var(--sl-border-radius-small);
		background: var(--palette-subheading-fill);
		color: var(--palette-subheading-ink);
	}
	.palette-card-list {
		gap: var(--palette-inset);
	}
	.palette-section-heading > sl-badge,
	.palette-subgroup-heading > sl-badge {
		max-inline-size: 100%;
		margin: 0;
	}
	.palette-section-heading > sl-badge::part(base),
	.palette-subgroup-heading > sl-badge::part(base) {
		padding: 1px 5px;
		border: 0;
		background: transparent;
		color: inherit;
		white-space: normal;
		overflow-wrap: anywhere;
		line-height: 1.25;
	}
	.palette-section-heading > sl-badge::part(base) {
		background: var(--palette-heading-badge);
	}
	.palette-subgroup-heading > sl-badge::part(base) {
		font-weight: var(--sl-font-weight-normal);
	}
	.chemical-dose-value {
		display: grid;
		place-items: center;
	}
	.chemical-dose-value > sl-badge {
		max-inline-size: 100%;
		margin: 0;
	}
	.chemical-carousel-arrow {
		display: inline-grid;
		place-items: center;
		justify-self: center;
		inline-size: min(20px, 100%);
		block-size: 22px;
		border: 0;
		margin: 0;
		padding: 0;
		color: var(--sl-color-neutral-700);
		background: transparent;
		cursor: pointer;
	}
	.chemical-carousel-arrow:focus-visible {
		outline: 2px solid var(--sl-color-primary-600);
		outline-offset: 0;
		border-radius: var(--sl-border-radius-small);
	}
	.chemical-carousel-arrow:dir(rtl) svg {
		transform: scaleX(-1);
	}
	.chemical-dose-value sl-badge::part(base) {
		padding: 2px 4px;
		font-size: var(--sl-font-size-x-small);
		line-height: 1.2;
		white-space: normal;
		overflow-wrap: anywhere;
	}
	.palette-preview-area > :is(.component-tile, .chemical-tile) {
		grid-area: 1 / 1;
		box-sizing: border-box;
		display: grid;
		place-items: center;
		inline-size: 100%;
		min-inline-size: 0;
		margin: 0;
		padding: 3px 22px;
		border: 1px solid transparent;
		border-radius: var(--sl-border-radius-medium);
		background: transparent;
		cursor: grab;
		touch-action: pan-y;
		user-select: none;
	}
	.component-preview {
		display: block;
		inline-size: 76px;
		max-inline-size: 100%;
		block-size: 57px;
		color: #285160;
		pointer-events: none;
	}
	.palette-dragging {
		cursor: grabbing;
	}
	.component-tile > *,
	button.chemical-tile > * {
		pointer-events: none;
	}
	.chemical-drag-preview {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 3;
		pointer-events: none;
		display: grid;
		justify-items: center;
		gap: 2px;
	}
	.chemical-drag-preview img {
		inline-size: 48px;
		block-size: 36px;
		object-fit: contain;
	}
	.component-tile[aria-pressed="true"],
	.chemical-tile[aria-pressed="true"] {
		background: var(--sl-color-primary-100);
		border-color: var(--sl-color-primary-600);
	}
	.chemical-preview {
		inline-size: min(76px, 100%);
		block-size: 57px;
		display: grid;
		place-items: center;
		text-align: center;
		font-size: var(--sl-font-size-small);
	}
	.chemical-preview img {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		object-fit: contain;
	}
	.fill-meter {
		position: absolute;
		padding: 2px 4px;
		font-size: 0.7rem;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		pointer-events: none;
	}
	.remObj {
		/* position: absolute;
    right: 0px;
    bottom: 0px; */
		color: #d10000;
		background-color: #ffff;
	}
	#foldMenu {
		/* position: absolute;
    left: 0px;
    bottom: 0px; */
		color: #0074aa;
		background-color: #ffff;
	}
	.remObj:hover {
		background-color: #d10000;
		color: #ffff;
	}
	#foldMenu:hover {
		background-color: #0074aa;
		color: #ffff;
	}
	.selection-info-title::part(base) {
		background-color: #ff1f66;
	}
	#contextTag::part(base) {
		background-color: #51a332;
		color: #fff;
	}
	#statusStrip {
		position: absolute;
		top: 8px;
		left: 50%;
		transform: translateX(-50%);
		max-width: min(70%, 420px);
		padding: 4px 12px;
		border-radius: 999px;
		border-left: 3px solid #d10000;
		background-color: #ffffffd9;
		backdrop-filter: blur(20px);
		box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.22);
		font-size: 10pt;
		line-height: 14pt;
		text-align: center;
		pointer-events: none;
		z-index: 20;
	}
	#statusStrip[hidden] {
		display: none;
	}
	.connection-list {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
	}
	.connection-list-label {
		font-size: 9pt;
		opacity: 0.7;
	}
	#smilesSwitch::part(label){
		font-size: 10pt;
		line-height: 10pt
	}
	p,
	button,
	h6 {
		font-size: 10pt;
		display: inline-flex;
		margin-inline: 5px;
		word-break: break-all;
	}
	p {
		word-wrap: break-word;
		overflow-wrap: break-word;
		margin-bottom: 0px;
		hyphens: auto;
	}
	h5 {
		font-size: 10pt;
		font-weight: bold;
		margin-inline: 5px;
		margin-bottom: -3px;
		text-overflow: ellipsis;
		white-space: nowrap;
		word-break: keep-all;
		overflow: hidden;
	}
	#toHeading {
		margin-block: 5px;
	}
	button {
		gap: 5px;
		padding: 5px;
		margin: 5px;
		background-color: rgb(255, 255, 255);
		color: rgb(69, 69, 69);
		border-width: 1px;
		border-style: solid;
		border-color: rgba(69, 69, 69, 0.28);
	}
	sl-select::part(combobox) {
		margin-top: 5px;
		margin-left: 5px;
	}
	#molAmount::part(base) {
		margin-top: 15px;
	}
	sl-badge {
		margin: 5px;
	}
	sl-option::part(base) {
		font-size: 10pt;
		padding: 5px;
	}
	sl-carousel::part(base) {
		gap: var(--sl-spacing-small);
	}
	sl-input::part(form-control-label) {
		font-size: 10pt;
	}
	sl-details::part(header),
	sl-details::part(content) {
		padding: 5px;
	}
	.optionsDetails:focus-within,
	.optionsDetails:focus {
		border-left: solid 1px #0074aa;
		border-radius: 0.25rem;
	}
	sl-checkbox {
		margin-left: 0px;
	}
	sl-drawer::part(panel) {
		background-color: #ffffff8d;
		backdrop-filter: blur(20px);
	}
	sl-radio::part(label) {
		font-size: 10pt;
	}
	sl-radio::part(base) {
		margin-left: 10px;
	}
	sl-radio::part(control),
	sl-radio::part(control--checked) {
		width: 10px;
		height: 10px;
		margin-top: 3px;
	}
	img {
		width: 75;
		height: 75px;
	}
	svg {
		pointer-events: none;
	}
`;
