//Author: Rashid Saad
//31/10/2021
//Beni Melll Morocco

let sets = [];
const autogen = document.getElementById("autogen");

fetchtData = (url, divID) => {
	fetch(url).then(response => {
		return response.json();
	})
	.then(
		json => {
			printData(json, divID);
			render(decodeURI(window.location.hash),'#');
		})
	.catch(function(err) {
	  	console.log("Error:"+err);
	});
}

printData = (data, divID) =>{

	let section = '<ul>';
	data.semesters.map(ENGsemester=>{
		const semesterID = ENGsemester.id;
		const semesterHD = `semester ${semesterID}`;
		const smstrSecID = `semester${semesterID}`;
		sets.push(smstrSecID);
		section += `<li><a href="#${smstrSecID}">${semesterHD}</a></li>`;
		let semester = `<section id="${smstrSecID}" class='semsclss sec'><h1>${semesterHD} classes<a href="#" class="close">X</a></h1><ul>`;
		ENGsemester.classes.map(ENGclass => {
			const className = ENGclass.className;

			// const modules = ENGclass.modules;
			// sort modules
			const modules = ENGclass.modules.sort((a,b)=>{return  parseInt(a.order) - parseInt(b.order)});

			const classSecID = `s${semesterID}`+className.replace(' ','');

			sets.push(classSecID);

			semester += `<li><a href="#${classSecID}">${className}</a></li>`;

			let sclass = `<section id="${classSecID}" class="sec engclasses">
			<h1>${semesterHD} / ${className}<a href="#${smstrSecID}" class="close">X</a></h1><ul>`;
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
			sclass += `<a href="tb/${classSecID}.pdf" target="_blank" class="savepdf">save as <b class="red">pdf</b></a>`;
			sclass += "</ul></section>";

			autogen.insertAdjacentHTML('beforeend', sclass);
		});
		semester += "</ul></section>";
		autogen.insertAdjacentHTML('beforeend', semester);
	});

	section +="</ul>";

	divID.insertAdjacentHTML('beforeend', section);

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

	// enlarge last ol>li if len = 1
	y = document.querySelectorAll('.engclasses ul li.links ol');
	y.forEach(ol => {
		if(ol.childElementCount == 1){
			ol.lastElementChild.style.width = "100%";
		}
	});
}

render = (url) => {
	let secs 	= ['','semesters', 'info'].concat(sets),
	sec 		= url.slice(1),
	index 		= secs.indexOf(sec);

	index === -1 ? sec = 'error' : sec == '' ? sec = 'semesters' : false;
	
	const allSecs = document.querySelectorAll('section.sec');
	allSecs.forEach(sec => sec.classList.remove('render'));
	document.getElementById(sec).classList.add('render');
};

renderNow = () => {render(decodeURI(window.location.hash))}

function init(){
	window.onhashchange = renderNow;

	const semestersDiv = document.getElementById('semesters');
	const url = "data.json";
	fetchtData(url, semestersDiv);
}