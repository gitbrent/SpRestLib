/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const CompLibrary = require('../../core/CompLibrary.js');
const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;
const siteConfig = require(process.cwd() + '/siteConfig.js');

/* ========== */

function MakeLeftBulletText(strText) {
	return '<p style="text-align:left">&bull; '+ strText +'</p>';
}

// NOTE: Code is only recognized if lines have leading tabs (?)
const tryCodeBlock = `// 1: Load SpRestLib via CDN
var script = document.createElement('script');
script.src = "https://cdn.rawgit.com/gitbrent/SpRestLib/v1.6.0/dist/sprestlib.bundle.js";
document.getElementsByTagName('head')[0].appendChild(script);
//
// 2: Try some library methods
sprLib.user().info().then(  objUser  => (console.table ? console.table([objUser]) : console.log(objUser))  );
sprLib.site().lists().then( arrLists => (console.table ? console.table(arrLists)  : console.log(arrLists)) );
`;
const exCodeCSOM = `function queryListItems() {
    var context = new SP.ClientContext();
    var list = context.get_web().get_lists().getByTitle('Announcements');
    var caml = new SP.CamlQuery();
    returnedItems = list.getItems(caml);
    context.load(returnedItems);
    context.executeQueryAsync(onSucceededCallback, onFailedCallback);
 }
`;
const exCodeJquery = `$.ajax({
    url:
        "/_api/web/lists/getbytitle('Announcements')/items?$select=Id,Title",
    method: "GET",
    headers: { "Accept":"application/json;odata=verbose" },
    success: function (data) {
        console.log(data.d.results);
    },
    error: function (data) {
        console.error("Error: "+ data);
    }
});
`;
const exCodeSimple = `sprLib.list('Announcements').getItems(['Id','Title'])
.then(function(arrResults){ console.table(arrResults) })
.catch(function(strErrMsg){ console.error(strErrMsg)  });
`;
const exCodeChain = `sprLib.user().info()
.then(function(objUser){
    return sprLib.list('Projects').getItems({
        listCols: ['Id','Title'],
        queryFilter: 'Owner/Id eq ' + objUser.Id
    });
})
.then(function(arrItems){
    console.log('You have: '+ arrItems.length +' items');
})
.catch(function(strErr){ console.error(strErr); });
`;
const txt1 = `sprLib.list('Employees')
.getItems(
    ['Id', 'Name', 'Manager/Id', 'Manager/Title']
)
.then(function(arrData){ console.table(arrData) })
.catch(function(errMsg){ console.error(errMsg)  });
`;
const res1 = `.---------------------------------------------------.
| Id  |     Name     |           Manager            |
|-----|--------------|------------------------------|
| 441 | Clark Prince | {"Id":1,"Title":"Brent Ely"} |
| 442 | Diana Lord   | {"Id":1,"Title":"Brent Ely"} |
| 447 | Barry Allen  | {"Id":1,"Title":"Brent Ely"} |
'---------------------------------------------------'
`;
const txt2 = `sprLib.user().info().then(function(objSpUser){
    console.log( "User Id....... " + objSpUser.Id );
    console.log( "User Title.... " + objSpUser.Title );
    console.log( "User Email.... " + objSpUser.Email );
    console.log( "User LoginName " + objSpUser.LoginName );
});
`;
const res2 = `User Id....... 901
User Title.... Brent Ely
User Email.... brent@testco.onmicrosoft.com
User LoginName i:0#.f|membership|brent@testco.onmicrosoft.com
`;
const txt3 = `sprLib.rest({
    url:          '/sites/dev/_api/web/sitegroups',
    queryCols:    ['Title', 'LoginName'],
    queryOrderby: 'Title'
})
.then(function(arrdata){ console.table(arrdata) });
`;
const res3 = `.-------------------------------------------------.
|         Title          |       LoginName        |
|------------------------|------------------------|
| Dev Site Owners        | Dev Site Owners        |
| Dev Site Visitors      | Dev Site Visitors      |
'-------------------------------------------------'
`;
const txt4 = `var item = { Name:'Marty McFly', HireDate:new Date() };
//
Promise.resolve()
.then(function(){
    return sprLib.list('Employees').create(item);
})
.then(function(item){
    return sprLib.list('Employees').update(item);
})
.then(function(item){
    return sprLib.list('Employees').delete(item);
})
.then(function(item){
    console.log('We just ran the entire CRUD chain!');
});
`;
const res4 = `//
// Promises easily chain async calls:
//
// Created item!
//
// Updated item!
//
// Deleted item!
//
// We just ran the entire CRUD chain!
//
`;

/* ========== */

class Button extends React.Component {
	render() {
		return (
			<div className="pluginWrapper buttonWrapper">
				<a className="button" href={this.props.href} target={this.props.target}>
					{this.props.children}
				</a>
			</div>
		);
	}
}

Button.defaultProps = {
	target: '_self',
};

function imgUrl(img) {
	return siteConfig.baseUrl + 'img/' + img;
}

function docUrl(doc, language) {
	return siteConfig.baseUrl + 'docs/' + (language ? language + '/' : '') + doc;
}

function pageUrl(page, language) {
	return siteConfig.baseUrl + (language ? language + '/' : '') + page;
}

const SplashContainer = props => (
	<div className="homeContainer">
		<div className="homeSplashFade">
			<div className="wrapper homeWrapper">{props.children}</div>
		</div>
	</div>
);

const Logo = props => (
	<div className="projectLogo">
		<img src={props.img_src} />
	</div>
);

const ProjectTitle = props => (
	<h2 className="projectTitle">
		{siteConfig.title}
		<small>{siteConfig.tagline}</small>
	</h2>
);

const PromoSection = props => (
	<div className="section promoSection">
		<div className="promoRow">
			<div className="pluginRowBlock">{props.children}</div>
		</div>
	</div>
);

const Block = props => (
	<Container
		padding={['bottom', 'top']}
		id={props.id}
		background={props.background}>
		<GridBlock align={props.align||"center"} contents={props.children} layout={props.layout} />
	</Container>
);

/* ============================== */

// 1: Top
class HomeSplash extends React.Component {
	render() {
		let language = this.props.language || '';
		return (
			<SplashContainer>
				<Logo img_src={imgUrl('sprestlib.svg')} />
				<div className="inner">
					<ProjectTitle />
					<PromoSection>
						<Button href="#try">Try It Out</Button>
						<Button href={docUrl('installation.html', language)}>Get Started</Button>
					</PromoSection>
				</div>
			</SplashContainer>
		);
	}
}

// 2:
const FeatureBullets = props => (
	<Block background="light" layout="fourColumn">
		{[
			{
				content: 'Provides list, user, site and REST methods for SharePoint 2013 API/SharePoint Online',
				image: imgUrl('circle-checklist.svg'),
				imageAlign: 'top',
				title: 'Full Featured',
			},
			{
				content: 'Most REST/Web Service interaction can be done in a couple of lines of code',
				image: imgUrl('circle-magic.svg'),
				imageAlign: 'top',
				title: 'Easy To Use',
			},
			{
				content: 'Lightweight, pure JavaScript library with no other framework dependencies',
				image: imgUrl('circle-blueprint.svg'),
				imageAlign: 'top',
				title: 'Modern',
			},
			{
				content: 'Utilizes new ES6 Promise architecture for asynchronous operation chaining/grouping',
				image: imgUrl('circle-handshake.svg'),
				imageAlign: 'top',
				title: 'Chains Async Ops',
			},
		]}
	</Block>
);

// 3:
const FeatureCallout = props => (
	<Container id='FeatureCallout' padding={['bottom', 'top']} background='white'>
		<h2>Clean and Concise SharePoint API</h2>
		<div>
			<img src="/SpRestLib/img/checkmark.svg" />
			Greatly simplifies SharePoint application development with single line commands that can be chained
		</div>
		<div>
			<img src="/SpRestLib/img/checkmark.svg" />
			Enables rapid development of SharePoint Apps/Add-ins using the JavaScript SharePoint App Model
		</div>
		<div>
			<img src="/SpRestLib/img/checkmark.svg" />
			Works with Node, Angular, Electron, and other popular application libraries
		</div>
		<div>
			<img src="/SpRestLib/img/checkmark.svg" />
			Direct SharePoint access via the REST/OData endpoints (no CSOM/JSOM or external libraries are utilized)
		</div>
	</Container>
);

// 4:
const FeatureCallCode = props => (
	<Container id='FeatureCallCode' padding={['bottom']} background='light'>
		<p></p>
		<h2>Say Goodbye to Callbacks and Writing Complicated Operations</h2>
		<p>
			Interacting with SharePoint web services does not have to be verbose or require lots of asynchronous
			operation handling.
		</p>
		<p>
			SpRestLib methods call <code>then()</code> when complete (so you dont need callbacks) and chaining queries is as easy
			as adding another SpRestLib query to a <code>then()</code>.  Additionally, exceptions are just as easy to deal with -
			simply add a <code>catch()</code> statement.
		</p>
		<div style={{display:'table',width:'100%'}}>
			<div style={{display:'table-cell',width:'20%',paddingRight:'10px'}}><h2>Simple Query</h2></div>
			<div style={{display:'table-cell',width:'80%'}}><pre><code>{exCodeSimple}</code></pre></div>
		</div>
		<div style={{display:'table',width:'100%'}}>
			<div style={{display:'table-cell',width:'20%',paddingRight:'10px'}}><h2>Chained Queries</h2></div>
			<div style={{display:'table-cell',width:'80%'}}><pre><code>{exCodeChain}</code></pre></div>
		</div>
	</Container>
);

// 5:
const TryOutLiveDemo = props => (
	<Block id="try" align="left" background="white" layout="twoColumn">
		{[
			{
				title: 'Try It Out: Library Test Drive',
				content: '<p>You should try using SpRestLib!</p>'
					+ "<p>Just open your browser's Developer Tools window anywhere on your SharePoint site, "
					+ "then run the following code snippet which will load the SpRestLib bundle script dynamically:</p>",
			},
			{
				title: '',
				content: '<pre><code>'+tryCodeBlock+'</code></pre><img src="/SpRestLib/img/tryitout.png" class="imgShadow" />',
			},
		]}
	</Block>
);

// 6:
const MethodExamples = props => (
	<Container id='MethodExamples' padding={['bottom', 'top']} background='light'>
		<div>
			<h2>SpRestLib Interface Examples</h2>
			<h4>SpRestLib does the heavy-lifting for you!</h4>

			<GridBlock
				align="left"
				layout="twoColumn"
				contents={[
					{ title:'Get List Items', content:'<pre><code>'+ txt1 +'</code></pre>' },
					{ title:'Results', content:'<pre><code>'+ res1 +'</code></pre>' }
				]}
			/>
			<GridBlock
				align="left"
				layout="twoColumn"
				contents={[
					{ title:'Get User Information', content:'<pre><code>'+ txt2 +'</code></pre>' },
					{ title:'Results', content:'<pre><code>'+ res2 +'</code></pre>' }
				]}
			/>
			<GridBlock
				align="left"
				layout="twoColumn"
				contents={[
					{ title:'REST Queries', content:'<pre><code>'+ txt3 +'</code></pre>' },
					{ title:'Results', content:'<pre><code>'+ res3 +'</code></pre>' }
				]}
			/>
			<GridBlock
				align="left"
				layout="twoColumn"
				contents={[
					{ title:'CRUD Operations', content:'<pre><code>'+ txt4 +'</code></pre>' },
					{ title:'Results', content:'<pre><code>'+ res4 +'</code></pre>' }
				]}
			/>
		</div>
	</Container>
);

// 7:
const LearnMore = props => (
	<Block background="white" id="learn">
		{[
			{
				title: 'Learn More',
				image: imgUrl('sprestlib.svg'),
				imageAlign: 'left',
				content: '<ul style="text-align:left">'
					+ '<li><a href="'+ docUrl('installation.html', '') +'">Installing SpRestLib</a></li>'
					+ '</ul>'
			},
		]}
	</Block>
);

// DEFINE PAGE
class Index extends React.Component {
	render() {
		let language = this.props.language || '';

		return (
			<div>
				<HomeSplash language={language} />
				<div className="mainContainer">
					<FeatureBullets />
					<FeatureCallout />
					<FeatureCallCode />
					<TryOutLiveDemo />
					<MethodExamples />
				</div>
				<script>hljs.initHighlightingOnLoad();</script>
			</div>
		);
	}
}

module.exports = Index;
