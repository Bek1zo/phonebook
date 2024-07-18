let phonesZoneDiv = $(".phoneszone");
let keywordInput = $(".keyword");
let findZoneDiv = $(".findzone");


$(document).ready(function() {

	if(!(!!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g))){
		if (history.state) {
			phonesZoneDiv.scrollTop(history.state.data);
		}
		phonesZoneDiv.scroll(function() {
			var scrollPos = phonesZoneDiv.scrollTop();
			var stateObj = { data: scrollPos };
			history.replaceState(stateObj, "");
		});
	}

	var ctrlDown = false;
	$(document).on('keyup', function(e){
		if(e.which === 17){
			ctrlDown = false;
		}
	});

	$(document).on('keydown', function(e){
		if(e.which===13){console.log('keup'); search();}
		if(e.which === 17){
			ctrlDown = true;
		}
		if(!keywordInput.is(':focus') && ((e.which>=48 && e.which <= 90) || e.which === 219 || e.which === 221|| e.which === 186|| e.which === 222|| e.which === 188|| e.which === 190|| e.which === 191 || e.which === 13)){
			if (ctrlDown) {
				return;
			}
			var input = keywordInput;
			input.focus();
			var tmpStr = input.val();
			input.val('');
			input.val(tmpStr);
		}
	});

	$("button[name='find']").on("click", function () {search()});
	keywordInput.on("keydown", function (e){console.log('keyup0');if(e.which===13){console.log('keup'); search();}});
	keywordInput.focus();
});

var testString = function (str, keyword) {
	keyword = keyword.replace(/\s\s+/g, ' '); // replace multiple spaces with one
	var keywordMas = new Array(keyword);
	if(keyword.slice(-1)!==' '){
		keywordMas = keyword.split(' ');
	}
	for (var index = 0; index < keywordMas.length; ++index) {
		var element = keywordMas[index];
		var reg = new RegExp(element, "ig");
		if (!reg.test(str)) {
			return false;
		}
	}
	return true;
}

function search() {
	let keyword;
	let keywordInput = $(".keyword");
	let findZoneDiv = $(".findzone");
	keywordInput.val(transliterate(keywordInput.val()));
	if (keyword !== keywordInput.val()) {
		keyword = keywordInput.val().toLowerCase().replace(new RegExp("ё", "g"), 'е');
		findZoneDiv.empty();
		if (keyword) {
			var isFind = false;

			$(".column").each(function () {
				if (testString($(this).text().toLowerCase().replace(new RegExp("ё", "g"), 'е'), keyword)) {
					isFind = true;

					let res	= $(this).attr("ID").toString().split('_')[0]
					console.log(res)
					let col1 = $('#' + res + '_1').html().toString().replace('\f', '')
					let col2 = $('#' + res + '_2').html().toString().replace('\f', '')
					let col3 = $('#' + res + '_3').html().toString().replace('\f', '')
					let col4 = $('#' + res + '_4').html().toString().replace('\f', '')
					let col5 = $('#' + res + '_5').html().toString().replace('\f', '')
					let a = $("<a class='min-h-12' href='#" + res + '_2' + "'></a>")

					a.append("<div'>" + col1 + "</div>");
					a.append("<div>" + col2 + "</div>");
					a.append("<div>" + col3 + "</div>");
					a.append("<div>" + col4 + "</div>");
					a.append("<div>" + col5 + "</div>");

					findZoneDiv.append(a);
					findZoneDiv.append($("<br>"));
				}
			});
			if(!isFind)
				findZoneDiv.append($("<p style='margin:10px;'>По контексту запроса '" + keyword + "' ничего не найдено.</p>"));
			$(".findzone a").on('click', function(){
				hideStruct();
			})
		}
	}
}

// Транслитерация при ошибочном вводе на латыни
function transliterate(text) {
	var rus = "й ц у к е н г ш щ з х ъ ф ы в а п р о л д ж э я ч с м и т ь б ю ё ё".split(/ +/g);
	var eng = "q w e r t y u i o p [ ] a s d f g h j k l ; ' z x c v b n m , . ` ~".split(/ +/g);
	var x;
	for(x = 0; x < rus.length; x++) {
		text = text.split(eng[x]).join(rus[x]);
		text = text.split(eng[x].toUpperCase()).join(rus[x].toUpperCase());
	}
	return text;
}

// Переопределить jquery contains() делая ее независимой от регистра. 
// Использование: let matches = $("span[id]:contains('привет')");
$.expr[":"].contains = $.expr.createPseudo(function(arg) {
	return function( elem ) {
		return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
	};
});

// Переопределить jquery для проверки фокуса элемента 
// Использование: $("input[name='keyword']").is(':focus') возвращает bool
$.extend(jQuery.expr[':'], {
	focus: "a == document.activeElement"
});
