/**
 * Copyright (c) 2017-present, Brent Ely
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// <a href={this.props.config.baseUrl + 'blog'}>Blog</a>

const React = require('react');

class Footer extends React.Component {
	docUrl(doc, language) {
		const baseUrl = this.props.config.baseUrl;
		return baseUrl + 'docs/' + (language ? language + '/' : '') + doc;
	}

	pageUrl(doc, language) {
		const baseUrl = this.props.config.baseUrl;
		return baseUrl + (language ? language + '/' : '') + doc;
	}

	render() {
		const currentYear = new Date().getFullYear();
		return (
			<footer className="nav-footer" id="footer">
				<section className="sitemap">
					<a href={this.props.config.baseUrl} className="nav-home">
						{this.props.config.footerIcon && (
							<img
								src={this.props.config.baseUrl + this.props.config.footerIcon}
								alt={this.props.config.title}
								width="66"
								height="58"
							/>
						)}
					</a>
					<div>
						<h5>Docs</h5>
						<a href={this.docUrl('installation.html', this.props.language)}>
							Getting Started
						</a>
						<a href={this.docUrl('api-rest.html', this.props.language)}>
							SharePoint API Reference
						</a>
						<a href={this.props.config.baseUrl + 'blog'}>SharePoint Development Guides</a>
						<a href={this.docUrl('feat-promises.html', this.props.language)}>
							About JavaScript Promises
						</a>
					</div>
					<div>
						<h5>Community</h5>
						<a
							href="https://twitter.com/SpRestLib"
							target="_blank">
							Twitter
						</a>
						<a
							href="https://plus.google.com/u/1/113247436909611337609"
							target="_blank">
							Google Plus
						</a>
						<a
							href="http://stackoverflow.com/questions/tagged/sprestlib"
							target="_blank">
							Stack Overflow
						</a>
						<a
							href="https://www.youtube.com/channel/UCxZcCampOHn-47kvtcK_oVQ"
							target="_blank">
							YouTube Channel
						</a>
					</div>
					<div>
						<h5>More</h5>
						<a href="https://github.com/gitbrent/sprestlib/issues">GitHub Issues</a>
						<a href="https://github.com/gitbrent/sprestlib">GitHub Project</a>
						<a href="https://www.flaticon.com/packs/creativity">Site Icons</a>
					</div>
				</section>

				<section className="copyright">
					Copyright &copy; {currentYear} Brent Ely
				</section>
			</footer>
		);
	}
}

module.exports = Footer;
