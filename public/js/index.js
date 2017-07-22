
window.addEventListener('DOMContentLoaded', function(){
	// addDiscussion({
	// 	usersId: ['59465114ed88ec11366880a1'],
	// 	discussion: {
	// 	    subject: 'Yo Superbe discussion',
	// 	    messages: [
	// 	    	{userId:'59623e261b8f8109adaa0c5d', text:'Oui les petites joue de ma doudou sont choues !'},
	// 	    	{userId:'59623e261b8f8109adaa0c5d', text:'Je ne m\'y trompe pas !'},
	// 	    ],
	// 	}
	// });
	// removeDiscussion("596a1a89dcc8ee41dc8149c6");
	// getFriend('594672ba04a511202f0eff8e');
	// addFriend('59465114ed88ec11366880a1');
	// acceptFriend('59465114ed88ec11366880a2');
	// addPost({
	// 	title: "Un titre de post", 
	// 	text: "Le text de ce post, c'est cool ca fonctionne vraiment !",
	// 	toUserId: "59465114ed88ec11366880a1",
	// });
	// removePost("594e7164a8944711eba74680");
	// addComment("594e7164a8944711eba74680", "Ceci est un commentaire posté :)");
	// removeComment("594e7164a8944711eba74680", "5957c07dde93fa437b2fe842");
});

window.addEventListener('beforeunload', function(){
	
});

// DISCUSSION
function addDiscussion(discussion) {
	var url = "/api/secure/profil/discussion/";
	sendAjax('POST', url, discussion);
}

function removeDiscussion(discussionId) {
	var url = "/api/secure/profil/discussion/" + discussionId;
	sendAjax('DELETE', url);
}

// FRIEND
function addFriend(userId) {
	var url = "/api/secure/profil/friend/" + userId;
	sendAjax('POST', url);
}

function getFriend(userId) {
	var url = "/api/secure/profil/friend";
	var data = {
		userId: userId
	};
	sendAjax('GET', url, data);
}

function acceptFriend(friendId) {
	var url = "/api/secure/profil/friend/" + friendId + '/accept/';
	sendAjax('PUT', url);
}

// POST
function addPost(data) {
	var url = "/api/secure/profil/post";
	sendAjax('POST', url, data);
}
function removePost(postId) {
	var url = "/api/secure/profil/post/" + postId;
	sendAjax('DELETE', url);
}

function addComment(postId, comment) {
	var url = "/api/secure/profil/post/" + postId + "/comment";
	var data = {
		comment: comment,
	};
	sendAjax('POST', url, data);
}

function removeComment(postId, commentId) {
	var url = "/api/secure/profil/post/" + postId + "/comment/" + commentId;
	sendAjax('DELETE', url);
}

// SEND AJAX
function sendAjax(method, url, data) {
	$.ajax({
		method: method,
		dataType: "JSON",
		url: url,
		data: data || null,
		success: function(m){
			console.log('AJAX', m);
		},
		error: function(m){
			console.error('AJAX', m.responseJSON);
		}
	});
}