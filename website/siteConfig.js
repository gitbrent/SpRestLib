/**
 * Copyright (c) 2017-present, Brent Ely
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const siteConfig = {
	title: 'SpRestLib',
	tagline: 'JavaScript Library for SharePoint Web Services',
	url: 'https://gitbrent.github.io',
	baseUrl: '/SpRestLib/',
	projectName: 'SpRestLib',
	gaTrackingId: 'UA-75147115-3',
	headerLinks: [
		{href: 'https://github.com/gitbrent/SpRestLib/releases', label: 'Download'},
		{doc: 'installation', label: 'Get Started'},
		{doc: 'api-list', label: 'API Documentation'},
		{blog: true, label: 'Blog'},
		{href: 'https://github.com/gitbrent/SpRestLib/', label: 'GitHub'},
	],
	headerIcon: 'img/sprestlib.svg',
	footerIcon: 'img/sprestlib.svg',
	favicon: 'img/favicon.png',
	colors: {
		primaryColor: '#0088CC',
		secondaryColor: '#1199DD',
	},
	copyright: 'Copyright © '+ new Date().getFullYear() +' Brent Ely',
	projectName: 'SpRestLib',
	highlight: {
		theme: 'hybrid',
		defaultLang: 'javascript',
	},
	scripts: [
		'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js',
	],
	repoUrl: 'https://github.com/gitbrent/SpRestLib',
	onPageNav: 'separate',
	twitter: true,
	twitterImage: 'img/sprestlib.png',
};

module.exports = siteConfig;
