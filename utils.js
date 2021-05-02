
function withCookie(callback) {
  chrome.cookies.get(
    { url: 'https://tournesol.app/', name: 'csrftoken' },
    (cookie) => callback(cookie.value),
  );
};


function addRateLater(csrftoken) {
  console.log('with referer');
  console.log(csrftoken);
  fetch('https://tournesol.app/api/v2/rate_later/', {
    credentials: 'include',
    method: 'POST',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    body: JSON.stringify({ video: 'gW0JQ1OoLwM' }),
  })
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(console.log)
    .catch(function (ex) {
      console.log('Request failed', ex);
    });
};
