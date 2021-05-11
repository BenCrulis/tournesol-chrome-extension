const alertNotLoggedInOrError = () => {
  chrome.tabs.executeScript(null, { code: "window.alert('Make sure you are logged in on https://tournesol.app/. If you are logged in and this error persist, please let us know by creating an issue on https://github.com/tournesol-app/tournesol-chrome-extension/', 'ok')"})
}

const fetchTournesolApi = (url, method, data, callback) => {
  if (method == 'POST') {
    const fetch_with_cookie = (cookie) => {
        const csrftoken = cookie.value
        return fetch(`https://tournesol.app/api/v2/${url}`, {
            credentials: 'include',
            method: 'POST',
            mode: 'cors',
            referrer: "https://tournesol.app",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(data),
        }).then(r => {
          if (r.status == 403) alertNotLoggedInOrError()
          return r.json()
        }).then(callback).catch(callback)
    }
    chrome.cookies.get({ url: 'https://tournesol.app/', name: 'csrftoken' }, fetch_with_cookie);
    return;
  }
  if (method == 'GET') {
    return fetch(`https://tournesol.app/api/v2/${url}`).then(r => r.json())
  }
  throw Error(`Gethod should be 'GET' or 'POST', received ${method}`)
}

const addRateLater = (videoId) => {
  fetchTournesolApi('rate_later/', 'POST', {video: videoId}, () => {})
};

/*
 ** Useful method to extract a subset from an array
 ** Copied from https://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
 ** Used for adding some randomness in recommendations
 */
const getRandomSubarray = (arr, size) => {
  var shuffled = arr.slice(0), i = arr.length, temp, index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}

const getVideoStatistics = (videoId) => {
  return fetchTournesolApi(`videos/?video_id=${videoId}`, 'GET', {});
}
