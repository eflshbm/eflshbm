//Author: Rashid Saad
// contact: eflshbm@gmail.com
//31/10/2021
//Beni Melll Morocco

let sets = [];
const 
	smstrSec = document.getElementById('semesters'),
	autogen	 = document.getElementById("autogen"),
	logsSec	 = document.getElementById("logs"),
	quoteDiv = document.getElementById("quote"),
	storyDiv = document.getElementById("stories"),
	readrDiv = document.getElementById("reader"),
	readrCLR = document.getElementById("readerclear"),
	rndStory = document.getElementById("rndstory"),
	bakToTop = document.getElementById("top");


fetchtData = (url) => {
	fetch(url).then(response => {
		return response.json();
	})
	.then(
		json => {
			printData(json);
			render(decodeURI(window.location.hash),'#');
		})
	.catch(function(err) {
	  	console.log("Error:"+err);
	});
}

printData = (data) =>{

	// semesters

	let section = '<ul>';
	data.semesters.map(ENGsemester=>{
		const semesterID = ENGsemester.id;
		const semesterHD = `semester ${semesterID}`;
		const smstrSecID = `semester${semesterID}`;
		sets.push(smstrSecID);
		section += `<li><a href="#${smstrSecID}">${semesterHD}</a></li>`;
		let semester = `<section id="${smstrSecID}" class='semsclss sec'><h1 class="heading">${semesterHD} classes<a href="#" class="close">X</a></h1><ul>`;
		ENGsemester.classes.map(ENGclass => {
			const className = ENGclass.className.toLowerCase();

			// sort modules
			const modules = ENGclass.modules.sort((a,b)=>{return  parseInt(a.order) - parseInt(b.order)});

			const classSecID = `s${semesterID}`+className.replace(' ','');

			sets.push(classSecID);

			semester += `<li><a href="#${classSecID}">${className}</a></li>`;

			let sclass = `<section id="${classSecID}" class="sec engclasses">
			<h1 class="heading">${semesterHD} / ${className}<a href="#${smstrSecID}" class="close">X</a></h1><ul>`;
			modules.map(ENGmodule => {
				sclass += `<li id="${classSecID}m${ENGmodule.id}" class="module">
				<span>M${ENGmodule.id}</span>
				<h2>${ENGmodule.name}</h2>
				<h3>day: ${ENGmodule.day} | time: ${ENGmodule.time}</h3>
				<h4>hall: ${ENGmodule.hall}</h4>
				<h5>${ENGmodule.professor}</h5>
				</li>`;
				ENGsemester.modules.map(module => {
					if(module.id == ENGmodule.id && module[ENGmodule.professor] != undefined){
						sclass+= `<li class="links"><ol>`;
						module[ENGmodule.professor].forEach(weekCours => {
							sclass += `<li>
							<a href="lectures/M${ENGmodule.id}/${weekCours}.pdf" target="_blank">${weekCours}</a>
							</li>`;
						});
					}
					sclass += "</ol></li>";
				});
			});

			// time table pdf
			sclass += `<a href="tb/${classSecID}.pdf" target="_blank" class="savepdf">save timetable as <b class="red">pdf</b></a>`;
			sclass += "</ul></section>";

			autogen.insertAdjacentHTML('beforeend', sclass);
		});
		semester += "</ul></section>";
		autogen.insertAdjacentHTML('beforeend', semester);
	});

	section +="</ul>";

	smstrSec.insertAdjacentHTML('beforeend', section);

	// logs
	let logs = "<ul><li>+ added / # edited</li>";

	let i = 1;
	data.logs.map(log=>{
		// add show more if i = 5 / hide if > 5
		i > 5 ?
			logs += `<li class="sec"><h3><span>${log.op}</span> ${log.details}</h3><p>${timeSince(Date.parse(log.date))}</li>` :  
			logs += `<li><h3><span>${log.op}</span> ${log.details}</h3><p>${timeSince(Date.parse(log.date))}</li>`;
		i == 5 ? 
				logs += `<li id="morelogs">+ More Logs</li>` : false;
		i++;
	});

	logs += "</ul>";
	logsSec.insertAdjacentHTML('beforeend', logs);

	// show more logs
	document.getElementById("morelogs").onclick = function(){
		const locaTop = this.offsetTop;
		this.remove();
		const listofHiddenLogs = document.querySelectorAll('li.sec');
		listofHiddenLogs.forEach(li =>{
			li.classList.remove("sec");
		});
		window.scrollTo({top: locaTop, behavior: 'smooth'});
	}

	// quotes
	const
		rndNum = Math.floor(Math.random() * data.quotes.length),
		dataQuote = data.quotes[rndNum],
		quote = `<p>${dataQuote.quote}</p><span>${dataQuote.by}</span>`;

	quoteDiv.insertAdjacentHTML('beforeend', quote);

	// stories
	let stories = "<ul>";

	data.stories.map(story=>{
		stories += storyBuilder("li", story);
	});
	
	stories += "</ul>";
	storyDiv.insertAdjacentHTML('beforeend', stories);

	// random story fp
	const
		rndNumX = Math.floor(Math.random() * data.stories.length),
		dataStory = data.stories[rndNumX],
		story = storyBuilder("div", dataStory);

	rndStory.insertAdjacentHTML('beforeend', story);

	// reader trgr
	const reads = document.querySelectorAll('.read');
	reads.forEach(read=>{
		read.onclick = function(e){
			// clear reader
			// While there is a clear on X btn, peps could click on menu itms...
			readrDiv.childElementCount > 1 ? readrDiv.lastChild.remove() : false;
			fetch(`stories/${read.dataset.title}.txt`).then(response => {
				return response.text();
			})
			.then(
				text => {
					readrDiv.insertAdjacentHTML('beforeend', text);
				})
			.catch(function(err) {
			  	console.log("Error:"+err);
			});
		}
	});

	// clear reader div after exit X btn
	readrCLR.onclick = function(){
		readrDiv.childElementCount > 1 ? readrDiv.lastChild.remove() : false;
	}

	// A_ module li click show cours

	// 1a_ select links li > add class 'havelinks' to module, add + sign
	const listsOfLinks = document.querySelectorAll('.engclasses ul li.links');
	listsOfLinks.forEach(li =>{
		const prevSibl = li.previousElementSibling;
		prevSibl.classList.add('havelinks');
		prevSibl.querySelector('h2').insertAdjacentHTML('beforeend', '<i>+</i>');

	});

	// 2a_ get module with links > render links > change + to -
	const moduleWithLinks = document.querySelectorAll('.engclasses ul li.havelinks');
	moduleWithLinks.forEach(li => {
		li.onclick = function(){
			this.nextElementSibling.classList.toggle('render');
			this.classList.contains('bgflip') ? false : window.scrollTo({top: this.offsetTop, behavior: 'smooth'});
			this.classList.toggle('bgflip');
			lessORmore = this.querySelector('h2').firstElementChild;
			lessORmore.innerText === "+" ? lessORmore.innerText = "-" : lessORmore.innerText = "+";
		}
	});

	// enlarge last ol>li if %2 = 1
	const olist = document.querySelectorAll('.engclasses ul li.links ol');
	olist.forEach(ol => {
		ol.childElementCount%2 == 1 ? ol.lastElementChild.style.width = "100%" : false;
	});
}

// top
bakToTop.onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});
window.onscroll  = () => scroll(bakToTop, 300);

render = (url) => {
	let secs 	= ['','semesters', 'about', 'stories', 'logs', 'reader'].concat(sets),
	sec 		= url.slice(1),
	index 		= secs.indexOf(sec);

	index === -1 ? sec = 'error' : sec == '' ? sec = 'semesters' : false;
	
	const rendredSec = document.querySelector("section.render");
	rendredSec ? rendredSec.classList.remove("render") : false;
	document.getElementById(sec).classList.add('render');

	// menu (active item)
	// remove active
	const active = document.querySelector("li.active");
	active ? active.classList.remove("active") : false;
	// add active
	const item = document.querySelector(`menu ul li[data-name=${sec}]`);
	item ? item.classList.add("active") : false;

};

// fix + call @ printData
renderNow = () => {render(decodeURI(window.location.hash))}

function init(){
	window.onhashchange = renderNow;

	const url = "data.json";
	fetchtData(url);
}

// f(x)s 

storyBuilder = (mainElem, story) => {
	const mTitle = story.title.replaceAll(" ", "_").toLowerCase();
	str = `<${mainElem} class="module"><h2>${story.title}</h2><h3><i>${story.author}</i></h3>
							<h4>Published In: ${story.published}</h4>
							<a href="#reader" data-title="${mTitle}" class="read">read</a></${mainElem}>`;
	return str;
}
scroll = (target, ot) => {
	pageYOffset > ot ? target.classList.add('render') : target.classList.remove('render');
}

function timeSince(date) {

  var secs = Math.floor((new Date() - date) / 1000);

  var intVal = Math.floor(secs / 31536000);
  if (intVal >= 1) {
  	if(intVal > 1){
  		return intVal + " years ago";
  	}
  	else if(intVal = 1){
  		return "a year ago";
  	}
  }

  intVal = Math.floor(secs / 2592000);
  if (intVal >= 1) {
  	if(intVal > 1){
  		return intVal + " months ago";
  	}
  	else if(intVal = 1){
  		return "a month ago";
  	}
  }

  intVal = Math.floor(secs / 86400);
  if (intVal >= 1) {
  	if(intVal > 1){
  		return intVal + " days ago";
  	}
  	else if(intVal = 1){
  		return "a day ago";
  	}
  }

  intVal = Math.floor(secs / 3600);
  if (intVal >= 1) {
  	if(intVal > 1){
  		return intVal + " hours ago";
  	}
  	else if(intVal = 1){
  		return "an hour ago";
  	}
  }

  intVal = Math.floor(secs / 60);
  if (intVal >= 1) {
  	if(intVal > 1){
  		return intVal + " minutes ago";
  	}
  	else if(intVal = 1){
  		return "a minutes ago";
  	}
  }

  return Math.floor(secs) + " seconds ago";
};