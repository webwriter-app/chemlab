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
		block-size: 1000px;
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
		--diagram-panel-width: min(27cqw, 24rem);
		--object-panel-width: min(44cqw, 38rem);
		--diagram-width: 0px;
		--object-width: 0px;
		position: relative;
		box-sizing: border-box;
		display: grid;
		grid-template-columns: var(--diagram-width) minmax(0, 1fr) var(--object-width);
		grid-template-rows: minmax(0, 1fr) auto;
		transition: grid-template-columns 220ms ease;
		width: 100%;
		height: 100%;
		border: 2px solid #6a6a6a;
		border-radius: 5px;
		background: #f7f7f5;
	}
	#upper.show-diagram-panel {
		--diagram-width: var(--diagram-panel-width);
	}
	#upper.show-object-panel {
		--object-width: var(--object-panel-width);
	}
	#upper.show-diagram-panel.show-object-panel {
		--object-panel-width: min(36cqw, 38rem);
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
		background: var(--sl-color-neutral-0);
		border: 1px solid var(--sl-color-neutral-300);
		border-radius: var(--sl-border-radius-medium);
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
		background: var(--sl-color-neutral-0);
		pointer-events: none;
	}
	.workspace-side .workspace-details {
		block-size: 100%;
		min-block-size: 0;
	}
	.workspace-side .workspace-details::part(header) {
		position: absolute;
		inset-block-start: 4px;
		z-index: 1;
		pointer-events: auto;
	}
	.workspace-side .workspace-details::part(base) {
		block-size: 100%;
		overflow: hidden auto;
	}
	.workspace-side .workspace-details[open]::part(base) {
		pointer-events: auto;
	}
	#diagramArea {
		grid-column: 1;
		box-shadow: inset -1px 0 var(--sl-color-neutral-200);
	}
	#diagramArea .workspace-details::part(header) {
		inset-inline-start: 4px;
	}
	#inlineDiagramPanel {
		box-sizing: border-box;
		inline-size: var(--diagram-panel-width);
		padding: calc(var(--panel-trigger-height) + 12px) 8px 4px;
	}
	#inlineDiagramPanel > sl-checkbox {
		display: block;
		margin-block: 6px;
	}
	#objectArea {
		grid-column: 3;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(calc(var(--panel-trigger-height) + 8px), auto) minmax(0, 1fr);
		box-shadow: inset 1px 0 var(--sl-color-neutral-200);
	}
	#objectArea .workspace-details::part(header) {
		inset-inline-end: 4px;
		flex-direction: row-reverse;
	}
	#objectArea .workspace-details {
		grid-row: 2;
	}
	#objectPanel {
		position: relative;
		box-sizing: border-box;
		inline-size: var(--object-panel-width);
		inset-inline-start: min(0px, calc(100% - var(--object-panel-width)));
		padding: 4px 8px;
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
	.selection-info {
		position: absolute;
		inset: 0 auto auto 0;
		box-sizing: border-box;
		inline-size: max-content;
		max-inline-size: min(13rem, calc(100% - 8px));
		max-block-size: min(11rem, 36vh, calc(100% - 8px));
		overflow: auto;
		padding: 5px;
		background: var(--sl-color-neutral-0);
		border: 1px solid var(--sl-color-neutral-200);
		border-radius: 5px;
		font-size: 0.85rem;
		overflow-wrap: anywhere;
	}
	#contextInfoBox {
		max-block-size: min(14rem, calc(100% - 8px));
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
	.object-summary-heading > .remObj {
		display: grid;
		place-items: center;
		margin: 0;
		padding: 2px 4px;
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
		gap: 5px;
		inline-size: 100%;
		block-size: auto;
		min-block-size: 80px;
		padding: 5px;
	}
	#contextMolInfo .vessel-carousel-thumbnail {
		display: grid;
		place-items: center;
		text-align: center;
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
	}
	#contextMolInfo::part(pagination) {
		gap: 5px;
	}
	#contextMolInfo::part(pagination-item) {
		width: 6px;
		height: 6px;
	}
	.vessel-ph-tag::part(base) {
		background: var(--indicator-color);
		border-color: var(--indicator-color);
		color: var(--indicator-text);
	}
	.vessel-carousel-card {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		overflow: hidden;
		width: 150px;
		height: 80px;
		border: 2px solid #0284c7;
		border-radius: 5px;
	}
	.vessel-carousel-thumbnail {
		display: contents;
	}
	.vessel-carousel-thumbnail > :is(svg, img) {
		width: 190px;
		height: 80px;
	}
	.vessel-carousel-quantities {
		display: block;
		background-color: #fdfdfd;
		border-radius: 5px;
		overflow: hidden;
	}
	.vessel-carousel-quantities > p {
		margin-bottom: 0;
	}
	.selection-info:not([data-anchored]) {
		visibility: hidden;
	}
	#amountMenu {
		--amount-control-height: 1.0625rem;
		z-index: 2;
		max-inline-size: min(13rem, calc(100% - 8px));
	}
	#amountMenu .selection-labels {
		align-items: center;
		padding: 0 0 5px;
	}
	#amountMenu sl-badge {
		max-inline-size: 100%;
	}
	#amountMenu sl-badge::part(base) {
		white-space: normal;
		overflow-wrap: anywhere;
	}
	.amount-menu-arrow {
		display: grid;
		flex: 1 0 auto;
		place-items: center;
	}
	.amount-menu-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
	}
	.amount-menu-quantity {
		position: relative;
		display: grid;
		place-items: center;
		inline-size: max-content;
		block-size: var(--amount-control-height);
	}
	.volume-bar {
		border-radius: var(--sl-border-radius-small);
		--amount-fill: color-mix(in srgb, var(--sl-color-primary-500) 16%, transparent);
		background: linear-gradient(to right, var(--amount-fill) var(--amount-progress), transparent var(--amount-progress)),
			color-mix(in srgb, var(--sl-color-primary-500) 7%, var(--sl-color-neutral-0));
	}
	.amount-menu-value {
		text-align: center;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		padding-inline: 2px;
	}
	.amount-menu-value[inert] {
		visibility: hidden;
	}
	#amountMenuValue,
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
	#amountMenuSlider,
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
	#amountMenuSlider::-webkit-slider-thumb,
	.amount-slider::-webkit-slider-thumb {
		appearance: none;
		inline-size: 1px;
		block-size: 100%;
		background: transparent;
	}
	#amountMenuSlider::-moz-range-thumb,
	.amount-slider::-moz-range-thumb {
		inline-size: 1px;
		block-size: 100%;
		border: 0;
		background: transparent;
	}
	.amount-menu-button {
		display: inline-grid;
		place-items: center;
		inline-size: 24px;
		block-size: 24px;
		margin: 0;
		padding: 0;
		line-height: 1;
		font-weight: 700;
	}
	.amount-menu-button[aria-disabled="true"] {
		opacity: 0.45;
		cursor: default;
	}
	.amount-menu-confirm {
		--sl-input-height-small: var(--amount-control-height);
		inline-size: var(--amount-control-height);
		block-size: var(--amount-control-height);
		margin-inline-start: auto;
	}
	.amount-menu-row .amount-menu-button:nth-last-child(2) {
		margin-inline-end: 5px;
	}
	.amount-menu-confirm::part(base) {
		inline-size: 100%;
		block-size: 100%;
		font-weight: 700;
		color: var(--sl-color-neutral-600);
	}
	.amount-menu-confirm::part(label) {
		display: grid;
		place-items: center;
		padding: 0;
	}
	.selection-labels {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		padding: 5px;
	}
	.selection-labels > sl-badge {
		margin: 0;
	}
	.selection-actions {
		display: flex;
		flex-direction: column;
	}
	.selection-actions > .remObj {
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		padding: 4px 6px;
		border-color: var(--sl-color-neutral-300);
		font-size: 10pt;
		line-height: 1.1;
		white-space: nowrap;
	}
	#teacherDrawer {
		--teacher-drawer-trigger-inset: 4px;
		--teacher-drawer-body-height: 340px;
		grid-column: 1 / -1;
		grid-row: 2;
		position: relative;
		z-index: 1;
		min-inline-size: 0;
	}
	#teacherDrawer::part(header) {
		position: absolute;
		inset-block-end: var(--teacher-drawer-trigger-inset);
		inset-inline-start: var(--teacher-drawer-trigger-inset);
	}
	#teacherDrawer::part(content) {
		padding-inline: 6px;
		padding-block-end: calc(var(--panel-trigger-height) + 2 * var(--teacher-drawer-trigger-inset));
		box-shadow: inset 0 1px var(--sl-color-neutral-200);
		background: var(--sl-color-neutral-0);
	}
	#teacherDrawerContent {
		box-sizing: border-box;
		max-block-size: min(var(--teacher-drawer-body-height), 60cqh);
		overflow: auto;
		padding: 4px 0;
	}
	#teacherTabs::part(nav) {
		margin-bottom: 6px;
	}
	#teacherTabs::part(tabs) {
		gap: 4px;
		border-radius: 0;
	}
	#teacherTabs > sl-tab::part(base) {
		padding: 5px 12px;
		border: 1px solid var(--sl-color-neutral-300);
		border-bottom: 0;
		border-radius: var(--sl-border-radius-medium) var(--sl-border-radius-medium) 0 0;
		background: var(--sl-color-neutral-0);
		color: var(--sl-color-neutral-700);
	}
	#teacherTabs > sl-tab:hover::part(base) {
		background: var(--sl-color-neutral-100);
	}
	#teacherTabs > sl-tab[active]::part(base) {
		border-color: var(--sl-color-primary-300);
		background: var(--sl-color-primary-100);
		color: var(--sl-color-primary-800);
	}
	#teacherTabs > sl-tab-panel {
		--padding: 0;
	}
	.palette-strip {
		display: grid;
		grid-template-rows: auto;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: 6px;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		padding: 2px 2px 5px;
	}
	.palette-card {
		display: grid;
		grid-template-rows: auto 1fr;
		gap: 5px;
		min-inline-size: 10.5rem;
		padding: 5px;
		border: 1px solid var(--sl-color-neutral-200);
		border-radius: 4px;
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
	.palette-card-name > sl-tag::part(base) {
		block-size: auto;
		min-block-size: 1.5em;
		white-space: normal;
		overflow-wrap: anywhere;
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
	.component-variant {
		display: grid;
		grid-template-rows: auto 1fr;
	}
	.component-variant-controls {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		padding-block-start: 2px;
	}
	.palette-variant {
		border: 1px solid var(--sl-color-neutral-200);
		border-radius: var(--sl-border-radius-medium);
		background: var(--sl-color-neutral-50);
	}
	.component-variant-body {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
	}
	.component-permission {
		grid-area: 1 / 2;
		z-index: 1;
		display: grid;
		place-items: center;
		justify-self: end;
		align-self: end;
		block-size: calc(var(--sl-input-height-small) * 0.8);
		margin-inline-end: 7px;
		margin-block-end: 4px;
	}
	.component-permission sl-tooltip,
	.chemical-permission sl-tooltip {
		--show-delay: 650ms;
	}
	.component-permission sl-checkbox::part(label),
	.chemical-permission sl-checkbox::part(label) {
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
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		padding: 2px;
		margin-block-end: 6px;
	}
	.chemical-group-select {
		flex: 0 1 13rem;
		min-inline-size: 0;
	}
	.chemical-search {
		flex: 1 1 12rem;
		min-inline-size: 0;
	}
	.chemical-filters ::part(form-control-label) {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	@container (max-width: 28rem) {
		.chemical-group-select {
			flex: 1 1 0;
		}
		.chemical-search {
			flex: 1 1 100%;
			order: 1;
		}
	}
	.palette-card-chemical {
		box-sizing: border-box;
		inline-size: max-content;
		min-inline-size: 5.5rem;
		align-self: start;
	}
	.palette-card-chemical:has(.chemical-solution) {
		min-inline-size: 9rem;
	}
	.palette-card-chemical > :not(.palette-card-header) {
		contain: inline-size;
	}
	.chemical-single {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: start;
	}
	.chemical-single > .chemical-tile,
	.chemical-single > .chemical-permission {
		grid-row: 1;
	}
	.chemical-single > .chemical-tile {
		grid-column: 1 / -1;
	}
	.chemical-single > .chemical-permission {
		grid-column: 2;
		align-self: end;
		padding: 4px;
	}
	.chemical-solution {
		display: grid;
		min-inline-size: 0;
	}
	.chemical-solution .chemical-preview {
		block-size: 42px;
	}
	.palette-card-menu-trigger {
		display: block;
		max-inline-size: 100%;
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
	.palette-card-menu-trigger > sl-tag::part(base) {
		block-size: auto;
		min-block-size: 1.5em;
		white-space: normal;
		overflow-wrap: anywhere;
	}
	.palette-card-menu-trigger[aria-expanded="true"] svg {
		transform: rotate(180deg);
	}
	.chemical-card-body {
		position: relative;
		min-inline-size: 0;
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
	.chemical-palette-group,
	.chemical-palette-subgroup {
		display: grid;
		gap: 4px;
		align-content: start;
		justify-items: start;
	}
	.chemical-palette-subgroups,
	.chemical-palette-cards {
		display: flex;
		gap: 6px;
	}
	.chemical-group-strip {
		gap: 12px;
	}
	.chemical-palette-subgroup + .chemical-palette-subgroup,
	.chemical-palette-group + .chemical-palette-group {
		border-inline-start: 1px solid var(--sl-color-neutral-200);
		padding-inline-start: 8px;
	}
	.chemical-subgroup-label {
		font-size: var(--sl-font-size-x-small);
		color: var(--sl-color-neutral-600);
		padding-inline: 5px;
	}
	.chemical-dose-carousel {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2px;
		padding: 2px 3px 0;
	}
	.chemical-dose-value {
		display: grid;
		place-items: center;
		min-inline-size: 5.5em;
	}
	.chemical-dose-carousel button {
		display: inline-grid;
		place-items: center;
		flex: none;
		border: 0;
		padding: 0;
		color: var(--sl-color-neutral-700);
		background: transparent;
		cursor: pointer;
	}
	.chemical-dose-carousel button:focus-visible {
		outline: 2px solid var(--sl-color-primary-600);
		outline-offset: 0;
		border-radius: var(--sl-border-radius-small);
	}
	.chemical-dose-carousel .chemical-carousel-arrow {
		inline-size: 20px;
		block-size: 22px;
	}
	.chemical-carousel-arrow:dir(rtl) svg {
		transform: scaleX(-1);
	}
	.chemical-dose-value sl-badge::part(base) {
		padding: 2px 4px;
		font-size: var(--sl-font-size-x-small);
		white-space: nowrap;
		opacity: 0.82;
	}
	.chemical-permission {
		display: grid;
		flex: none;
		place-items: center;
	}
	.chemical-tile {
		box-sizing: border-box;
		display: grid;
		justify-items: center;
		align-content: start;
		gap: 2px;
		width: 100%;
		padding: 4px;
		white-space: normal;
		overflow-wrap: anywhere;
		background: transparent;
	}
	.component-tile {
		grid-area: 1 / 1 / 2 / -1;
		cursor: grab;
		touch-action: pan-x;
		user-select: none;
		margin: 0;
		min-width: 0;
		padding: 2px 26px 3px;
		border: 1px solid transparent;
		background: transparent;
	}
	.component-preview {
		display: block;
		inline-size: 76px;
		block-size: 57px;
		color: #285160;
		pointer-events: none;
	}
	.chemical-tile {
		cursor: grab;
		touch-action: none;
		user-select: none;
		min-inline-size: 0;
		margin: 0;
		border: 1px solid transparent;
		border-radius: var(--sl-border-radius-medium);
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
	.teacher-editors {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(12rem, 100%), 1fr));
		gap: 8px;
	}
	#teacherDrawer h3 {
		font-size: 0.9rem;
		margin: 0.4rem 0;
	}
	.fill-meter {
		position: absolute;
		padding: 2px 4px;
		font-size: 0.7rem;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		pointer-events: none;
	}
	#settings_drawer {
		font-size: 1rem;
		margin: 0.25rem 0 0.5rem;
	}
	/* Stack the original settings sections within the narrower side panel. */
	#objectPanel #atom_panel,
	#objectPanel #molecule_panel {
		display: block;
	}
	#objectPanel #atom_panel::part(panel),
	#objectPanel #molecule_panel::part(panel) {
		display: block;
	}
	#objectPanel #atom_panel::part(divider),
	#objectPanel #molecule_panel::part(divider),
	:host([panelvariant="2"]) #atom_panel::part(end),
	:host([panelvariant="3"]) #atom_panel::part(end),
	:host([panelvariant="3"]) #molecule_panel::part(end) {
		display: none;
	}
	#objectPanel #ecomp_panel {
		flex-wrap: wrap;
	}
	#objectPanel #atom_panel > [slot="end"] > div {
		max-width: 100%;
	}
	#molecule_container {
		display: block;
		width: 100%;
	}

	#atoms {
		display: block !important;
		height: auto;
		max-height: 200px;
		overflow: auto;
	}

	atom_container {
		display: grid;
		/* Fixed, compact cells. #atom_panel is an sl-split-panel whose end
		   track is sized to its content (auto) and clips the overflow, so
		   the table's width has to stay inside the ~328px elements column
		   or most of it gets cut off. 18*17 + 17*1 = 323px. */
		grid-template-columns: repeat(18, 17px);
		grid-auto-rows: 18px;
		gap: 1px;
		width: max-content;
	}

	#ecomp_panel {
		display: flex;
		flex-direction: row;
	}
	#eCompInnerInfo {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin: 5px;
	}
	#filterButton {
		/* compact enough that all ten category filters fit the elements
		   column in a couple of wrapped rows instead of overflowing it */
		height: auto;
		padding: 1px 4px;
		font-size: 9px;
		line-height: 1.4;
		border-radius: 5px;
		align-items: flex-end;
	}
	#filterDiv::-webkit-scrollbar {
		display: none;
	}
	#filterDiv {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	#bondSelect {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-end;
		margin-inline: 5px;
	}
	#mol_prev_div {
		display: flex;
		align-items: center;
		padding-inline: 10px;
	}
	#mol_preview {
		margin-top: 10px;
		height: 150px;
		width: 150px;
		display: block;
		margin-inline: 5px;
		border-style: dashed;
		border-width: 1px;
		border-color: #787878;
	}
	#enter {
		color: #288d00;
		display: inline;
	}
	#enter:hover {
		color: #ffff;
		background-color: #288d00;
	}
	#addToElectrode {
		color: #b47b00;
	}
	#addToElectrode:hover {
		color: #ffff;
		background-color: #b47b00;
	}

	#charge_range {
		margin: 15px;
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
	#buttonAtom {
		border-radius: 3px;
		/* sized to fill one atom_container grid cell exactly. width:100% is
		   needed because a button's auto width is shrink-to-fit, so it would
		   not stretch to the grid track on its own. */
		height: 18px;
		width: 100%;
		min-width: 0;
		padding: 0;
		font-size: 8px;
		line-height: 1;
		overflow: hidden;
		align-items: center;
		justify-content: center;
	}
	.selection-info-title::part(base) {
		background-color: #ff1f66;
	}
	#contextTag::part(base) {
		background-color: #51a332;
		color: #fff;
	}
	#dialogOverview {
		position: absolute;
		bottom: 0px;
		right: 0px;
		top: revert !important;
		left: revert !important;
		display: block;

		margin-bottom: 5px;
		margin-right: 5px;
	}
	#dialogOverview::part(base) {
		background-color: #ffffff8d;
		backdrop-filter: blur(20px);
		border-radius: 5px;
		box-shadow: 0px 6px 12px 0px rgba(0, 0, 0, 0.33);
	}
	#confirmDialog::part(overlay) {
		visibility: hidden;
	}
	#confirmDialog::part(panel) {
		width: 215px;
		background-color: #ffffff8d;
		backdrop-filter: blur(20px);
		border-radius: 5px;
		box-shadow: 0px 0px 12px 3px rgba(0, 0, 0, 0.33);

		position: absolute;
	}
	#confirmDialog::part(body) {
		padding: 5px;
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
	sl-tab-group::part(tabs) {
		background-color: #ffff;
		border-radius: 5px;
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
