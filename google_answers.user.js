// ==UserScript==
// @name           Google Answers
// @author         Zach Dwiel
// @namespace      http://dwiel.net
// @description    Insert answers to google searches
// @include        http://www.google.com/search?*
// @include        http://www.google.com/#hl=*
// @require        http://code.jquery.com/jquery-latest.js
// ==/UserScript==

var url = document.location.href;
var begin = url.indexOf('q=');
var end = url.indexOf('&', begin);
var query;
if(end == -1) {
	query = url.substring(begin+2);
} else {
	query = url.substring(begin+2, end);
}

GM_xmlhttpRequest({
	method: 'GET',
	url: 'http://dwiel.net/english/nlp.php?language=answers&query='+query,
	headers: {
		'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
	},
	onload: function(responseDetails) {
		response = responseDetails.responseText;
 		if(response.substring(0,1) == '{') {
 			fullresponse = eval('('+response+')');
 			response = fullresponse['answer'];
			response += ' <a href="'+fullresponse['source']+'">source</a>';
 		}
    response = response.replace('<','&#60;');
    response = response.replace('>','&#62;');
		answer = response.replace(/\n/g,'<br>');
		answer_html = '<div id="answer" style="margin-left:1em;">'+answer+'</div>';
		$('#ssb').after(answer_html);
		
		$('#answer_content').html(answer);
	},
});

submit_answer = function() {
	answer = $('#answer_content').val();
	data = 'language=answers&match='+query+'&matchtype=answer&type=data&content='+answer;
	GM_xmlhttpRequest({
		method: 'POST',
		url: 'http://dwiel.net/english/new-rule-submit.php',
		headers: {
			'Content-type' : 'application/x-www-form-urlencoded',
			'User-agent' : 'Mozilla/4.0 (compatible) Greasemonkey',
		},
		data:encodeURI(data),
		onload: function(responseDetails) {
			response = responseDetails.responseText;
      response = response.replace('<','&nblt;');
      response = response.replace('>','&nbgt;');
			response = response.replace(/\n/g,'<br>');
			$('#google_answers_form').hide();
			$('#answer').html(answer.replace(/\n/g, '<br>'));
			$('#answer').show();
		},
	});
// 	alert('http://dwiel.net/english/new-rule-submit.php' + data);
}

show_add_answer = function() {
	$('#add').click(submit_answer);
	$('#google_answers_form').show();
	$('#answer').hide();
	$('#answer_content').val($('#answer').html().replace(/<br>/g, '\n'));
}

$(document).ready( function() {
	// your jquery code here
 	form = '<form action="javascript:submit_answer()" method="post" id="google_answers_form">' +
 						'<input type="text" name="content" size="60" id="answer_content"/>' + 	
						'<a id="add"><b>add</b></a>' + 
 					'</form>';
	$('#ssb').after(form);
	$('#google_answers_form').hide();
	
	$('#prs').after('<div id="ans" style="color:#DDD"><b>answer</b></div>');
	$('#ans').click(function () {
		show_add_answer();
	});
});
