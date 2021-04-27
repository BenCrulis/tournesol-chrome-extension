chrome.contextMenus.removeAll(function (e, tab) {
  chrome.contextMenus.create({
    id: 'tournesol_add_rate_later',
    title: 'Rate later on Tournesol',
    contexts: ['link'],
  });
});

chrome.contextMenus.onClicked.addListener(function (e, tab) {
  var videoId = new URL(e.linkUrl).searchParams.get('v');
  if (!videoId) {
    alert('This must be used on a link to a youtube video', 'ok');
  } else {
    open(`https://tournesol.app/rate_later_add/${videoId}`, '_blank');
    chrome.tabs.update(tab.id, { active: true });
  }
});

/*
 ** Useful method to extract a subset from an array
 ** Copied from https://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
 ** Used for adding some randomness in recommendations
 */
function getRandomSubarray(arr, size) {
  var shuffled = arr.slice(0),
    i = arr.length,
    temp,
    index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}

function shuffleArray(array) {
  var copy = array.slice(0, array.length);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const recent_request = async () => {
	const response = await fetch(`https://tournesol.app/api/v2/videos/search_tournesol/?days_ago_lte=21&language=${request.language}&limit=6`,);
	const json = await response.json();
	return json;
  };

  const old_request = async () => {
	const response = await fetch(`https://tournesol.app/api/v2/videos/search_tournesol/?days_ago_gte=21&language=${request.language}&limit=6`,);
	const json = await response.json();
	return json;
  };

  const process = async () => {
	const recent = await recent_request();
	const old = await old_request();
	const recent_sub = getRandomSubarray(recent.results, Math.ceil(request.video_amount / 2));
	const old_sub = getRandomSubarray(old.results, Math.floor(request.video_amount / 2));
	const videos = recent_sub.concat(old_sub);
	const shuffled = shuffleArray(videos);

	chrome.tabs.sendMessage(sender.tab.id, {
	  data: shuffled,
	});
  }

  process();
});
