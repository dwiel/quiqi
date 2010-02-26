// ==UserScript==
// @name           Quiqi
// @author         Zach Dwiel
// @namespace      http://quiqi.org
// @description    Insert answers to google searches
// @include        http://www.google.com/search?*
// @include        http://www.google.com/#hl=*
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// ==/UserScript==

var url = document.location.href;
var begin = url.indexOf('q=');
var end = url.indexOf('&', begin);
var query;
var fromsave = false;
if(end == -1) {
	query = url.substring(begin+2);
} else {
	query = url.substring(begin+2, end);
}

$.post = function(url, options, fn) {
  GM_xmlhttpRequest({
    method: 'POST',
    url: url,
    headers: {
      'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
      'Content-type' : 'application/x-www-form-urlencoded',
    },
    data:$.param(options),
    onload: function(responseDetails) {
      fn(responseDetails.responseText);
    }
  });
}

query = query.replace(/%22/g, "%5C%22").replace(/%27/g, "%5C%27");
GM_xmlhttpRequest({
	method: 'GET',
  url: 'http://quiqi.org/q/'+query,
	headers: {
		'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
	},
	onload: function(responseDetails) {
		response = responseDetails.responseText;
		response = response.replace(/</g,'&#60;');
		response = response.replace(/>/g,'&#62;');
		response = response.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/%2B/g, '\+').replace(/%2C/g, '\,');
		answer = response.replace(/\n/g,'<br>');
		answer_html = '<div id="answer" style="margin-left:1em;">'+answer+'</div>';
		$('#ssb').after(answer_html);
		$('#answer_content').html(answer);
	},
});

function submit_answer() {
	answer = $('#answer_content').val();
  query = query.replace(/\+/g, ' ');
  data = 'q='+query+'&a='+answer;
	GM_xmlhttpRequest({
		method: 'POST',
    url: 'http://quiqi.org/post.php',
		headers: {
			'Content-type' : 'application/x-www-form-urlencoded',
			'User-agent' : 'Mozilla/4.0 (compatible) Greasemonkey',
		},
		data:data,
		onload: function(responseDetails) {
      $('#google_answers_form').hide();
			response = responseDetails.responseText;
      if(response == "please login first") {
        fromsave = true;
        $('#login').slideDown();
      } else {
        response = response.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/%2B/g, '\+').replace(/%2C/g, '\,');
        response = response.replace(/</g,'&lt;');
        response = response.replace(/>/g,'&gt;');
        response = response.replace(/\n/g,'<br>');
        $('#answer').html(answer.replace(/\n/g, '<br>'));
        $('#answer').show();
      }
		},
	});
}

toggle_add_answer = function() {
  $('#google_answers_form').toggle();
  $('#answer').toggle();
  $('#answer_content').val(
    $('#answer').html()
                .replace(/<br>/g, '\n')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
   );
}

function login() {
  $.post('http://quiqi.org/login_submit.php', {username: $('#username').val(), password: $('#password').val()}, function (data) {
    if(data == "logged in") {
      $('#login').hide();
      $('#msg').html('logged in');
      setTimeout("$('#msg').fadeOut()", 3000);
      if(fromsave) {
        submit_answer();
        fromsave = false;
      }
    } else {
      alert(data);
    }
  });
}
function register() {
  $.post('http://quiqi.org/register_submit.php', {username: $('#username').val(), password: $('#password').val()}, function (data) {
    if(data == "registration complete") {
      $('#login').hide();
      $('#msg').html('registered');
      setTimeout("$('#msg').fadeOut()", 3000);
      if(fromsave) {
        submit_answer();
        fromsave = false;
      }
    } else {
      alert(data);
    }
  });
}
function cancel_login() {
  $('#login').slideUp();
  $('#msg').fadeOut();
  $('#answer').show();
  fromsave = false;
}

function nop() {}

$(document).ready( function() {
	// your jquery code here
 	form = '<form action="javascript:submit_answer()" method="post" id="google_answers_form">' +
 						'<input type="text" name="content" size="60" id="answer_content"/>' + 	
						'<a id="add"><b>add</b></a>' + 
 					'</form>' +
          '<div id="msg"></div>' +
          '<div id="login">' +
            'username: <input type="text" name="username" id="username"/><br/>' +
            'password: <input type="password" name="password" id="password"/><br/>' +
            '<a href="javascript:nop()" id="alogin">login</a> ' +
            '<a href="javascript:nop()" id="acancel_login">cancel</a> ' +
            '<a href="javascript:nop()" id="aregister">register</a>' +
          '</div>';
	$('#ssb').after(form);
  $('#add').click(submit_answer);
  $('#acancel_login').click(cancel_login);
  $('#alogin').click(login);
  $('#aregister').click(register);
	$('#google_answers_form').hide();
  $('#login').hide();
	
	$('#prs').after('<div id="ans" style="color:#DDD"><b>answer</b></div>');
	$('#ans').click(toggle_add_answer);
});
