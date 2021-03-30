let table
let cardsData

document.addEventListener("DOMContentLoaded",() =>{
	table=document.querySelector('.table')
	cardsData=JSON.parse(getBackendData())
	let count=0
	let cards=document.querySelector('.table').querySelectorAll(".card")
	let cardProgressText=document.querySelector(".card-progress__subtitle")
	let cardProgressbar=document.querySelector(".card-progress__bar--fill")
	putCards(cards,cardsData)

	cards.forEach(card =>card.addEventListener('click',fliper))
	function fliper() {
		this.classList.add('card--flip')
		count++
		this.removeEventListener('click',fliper)
		if(count==1) cardProgressMove('Pick Card 1',"0.1s linear","7.9%")
		if(count==2) cardProgressMove('Pick Card 2',"0.6s linear","54%")
		if(count==3){
			cardProgressMove('Done',"0.4s linear","100%")
			setTimeout(go(),500)
		}
		function cardProgressMove(text,anim,val) {
			cardProgressText.textContent=text
			cardProgressbar.style.transition=anim
			cardProgressbar.style.width=val
		}
	}

	document.querySelector('.form__input--submit').addEventListener('click',formSubmit)
	document.querySelector('#google').addEventListener('click',authGoogle)
	document.querySelector('#facebook').addEventListener('click',authFacebook)

})

function go() {
	let progress=document.querySelector('.progress')
	let start = new Promise(res=>setTimeout(() => res(), 2000))
	start
	.then(()=>{
		table.innerHTML=''
		progress.classList.remove('hidden')
		return progress
	})
	.then((progress)=>{
		setTimeout(() => {
			progress.querySelector('.progress__fill').classList.add('progress__fill--full')
		}, 100)
		return progress
	})
	.then((progress)=>{
		let fill=progress.querySelector('.progress__fill')
		let text=progress.querySelector('.progress__text')
		setTimeout(() => {
			text.innerHTML='<p>Your Tarot reading is ready!</p><p>Click below to get it now:</p>'
			fill.innerHTML='<p>Get my reading</p>'
			return progress
		}, 1500)
		return fill
	})
	.then((fill)=>{
		fill.addEventListener('click',showForm)
		fill.style='cursor:pointer;'
	})
}

function showForm() {
	document.querySelector('#form').classList.remove('hidden')
	document.querySelector('.card-progress').classList.add('hidden')
	document.querySelector('.progress').classList.add('hidden')
	document.querySelector('.table').classList.add('hidden')
	document.querySelector('.form__input--submit').addEventListener('click',formSubmit)
	document.querySelector('#google').addEventListener('click',authGoogle)
	document.querySelector('#facebook').addEventListener('click',authFacebook)
}

async function formSubmit(e) {
	e.preventDefault();
	let form=document.querySelector('#form')
	if(formValidate()) showResult(sendData())

	async function sendData(){
		let formData= new FormData(form)
		formData.append('ids', cardsData.map(i=>i.id))
		let res=await fetch('/',{method: 'POST', body: formData})
		console.log(res);
		return res
	}

	function formValidate() {
		let err=false;
		inputs=form.querySelectorAll('input')
		inputs.forEach(el => inputValidate(el));
		if(!err) return true

		function inputValidate(input) {
			if (input.classList.contains('mail')) {
				if (!/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(input.value)){
					err=true
					input.classList.add('err')
				}
			}
		}
	}

}

function showResult(respons){
	if(respons.ok){
		let cards=JSON.parse(respons)
		console.log('respons.ok');
	}
	else{
		console.log('!respons.!!!ok');
		document.querySelector('#form').classList.add('hidden')
		document.querySelector('.advertisement2').classList.add('hidden')
		let cards=document.querySelector('.prediction').querySelectorAll(".card")
		putCards(cards,cardsData)
		putText(document.querySelector('.prediction__text'),cardsData)
		document.querySelector('.prediction').classList.remove('hidden')
		document.querySelector('.advertisement3').classList.remove('hidden')
	}
}

function authGoogle(e) {
	e.preventDefault();
}
function authFacebook(e) {
	e.preventDefault();
}

function randomId(min, max) {
	let rand = min + Math.random() * (max + 1 - min);
	return Math.floor(rand);
}

 function putCards(cards,data) {
	i=0
	cards.forEach(card =>{
		card.querySelector('.card__side--front').innerHTML=
		`<img src="img/${data[i].image}" alt="${data[i].imageAlt}">`
		i++
	})
}

function putText(text,data) {
	text.innerHTML=`<p>${data[0].prediction}</p><p>${data[1].prediction}</p><p>${data[2].prediction}</p>`
}

 function getBackendData() { //return JSON [{},{},{}]
	//let table=[0,1,4,7,8,36,69]
	let idsAll=[0,1,2,3,4,5,6]
	let idsCards=getCardsId()
	let desk=JSON.parse(document.querySelector('#service').innerHTML)
	return JSON.stringify(getCards())

	function getCards() {
		let cards=[]
		for (let i = 0; i < 3; i++)cards[i]=desk[idsCards[i]]
		return cards
	}

	function getCardsId() {
		let ids=[]
		for (let i = 6; i > 3; i--) {
			let id=randomId(0,i)
			ids.push(idsAll[id])
			idsAll.splice(id,1)
		}
		return ids
	}
}