var hash;
var token = null;

/* ************* */

// SPOTIFY AUTHENTICATION - WORKING BUT UNNECESSARY FOR NOW

/*
document.getElementById('login-button').addEventListener('click', function() {

    var client_id = '65fe5dec0aaa47e8ab365e51137a9ef9'; // Your client id
    var redirect_uri = 'http://localhost:3000/'; // Your redirect uri

    // var state = generateRandomString(16);

    // localStorage.setItem(stateKey, state);
    var scope = 'user-read-private user-read-email';

    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(client_id);
    //url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
    // url += '&state=' + encodeURIComponent(state);

    window.location = url;
    token = window.location.hash

    }, false);

// document.querySelector("#token-button").addEventListener('click', getToken, false)
*/

// THIS RETRIEVES AN ACCESS TOKEN UPON OPENING THE PAGE
/*
$(function() {
    getToken()
    if (token === null) {

        var client_id = '65fe5dec0aaa47e8ab365e51137a9ef9'; // Your client id
        var redirect_uri = 'http://localhost:3000/'; // Your redirect uri

        var url = 'https://accounts.spotify.com/authorize';
        url += '?response_type=token';
        url += '&client_id=' + encodeURIComponent(client_id);
        url += '&redirect_uri=' + encodeURIComponent(redirect_uri);

        window.location = url;
        // token = window.location.hash
    }
})
*/


function getToken() {
    // GET THE LOGIN TOKEN FROM THE URL
    var h = window.location.hash
    console.log("HASH!")
    console.log(h)
    if (h!="") {
        console.log(h.match(/^#[^&]*/))
        token = h.match(/^#[^&]*/)
    }
}

/********************/