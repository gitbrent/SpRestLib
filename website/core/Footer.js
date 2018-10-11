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
						<a
							href={this.docUrl('installation.html')}
							onClick={()=>ga('send','event','Link','click','link-footer-Installation')}>
							Getting Started with SpRestLib
						</a>
						<a
							href={this.docUrl('api-rest.html')}
							onClick={()=>ga('send','event','Link','click','link-footer-ApiRest')}>
							SharePoint API Reference
						</a>
						<a
							href={this.props.config.baseUrl + 'blog'}
							onClick={()=>ga('send','event','Link','click','link-footer-SpDevGuides')}>
							SharePoint Development Guides
						</a>
						<a
							href={this.docUrl('feat-promises.html')}
							onClick={()=>ga('send','event','Link','click','link-footer-AboutPromises')}>
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
							href="https://www.pinterest.com/sprestlib/"
							target="_blank">
							Pinterest
						</a>
						<a
							href="https://www.youtube.com/channel/UCxZcCampOHn-47kvtcK_oVQ"
							target="_blank">
							YouTube Channel
						</a>
						<a
							href="https://plus.google.com/u/1/113247436909611337609"
							target="_blank">
							Google Plus
						</a>
					</div>
					<div>
						<h5>More</h5>
						<a href="https://github.com/gitbrent/sprestlib/issues" target="_blank">GitHub Issues</a>
						<a href="https://github.com/gitbrent/sprestlib" target="_blank">GitHub Project</a>
						<a href="https://stackoverflow.com/questions/tagged/sprestlib" target="_blank">SpRestLib on Stack Overflow</a>
						<a href="https://www.flaticon.com/packs/creativity" target="_blank">Site Icons</a>
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
