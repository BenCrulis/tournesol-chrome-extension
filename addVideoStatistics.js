// Youtube doesnt completely load a video page, so content script doesn't lauch correctly without these events

// This part is called on connection for the first time on youtube.com/*
/* ********************************************************************* */

//document.addEventListener('yt-navigate-finish', process);

if (document.body) process();
else document.addEventListener('DOMContentLoaded', process);

/* ********************************************************************* */

function process() {
  // Get video id via URL
  var videoId = new URL(location.href).searchParams.get('v');

  // Only enable on youtube.com/watch?v=* pages
  if (!location.pathname.startsWith('/watch') || !videoId) return;

  // Timer will run until needed elements are generated
  var timer = window.setInterval(createButtonIsReady, 300);

  function createButtonIsReady() {
    /*
     ** Wait for needed elements to be generated
     ** It seems those elements are generated via javascript, so run-at document_idle in manifest is not enough to prevent errors
     **
     ** Some ids on video pages are duplicated, so I take the first non-duplicated id and search in its childs the correct div to add the button
     ** Note: using .children[index] when child has no id
     */
    if (
      !document.getElementById('menu-container') ||
      !document.getElementById('menu-container').children.item('menu') ||
      !document.getElementById('menu-container').children.item('menu')
        .children[0] ||
      !document
        .getElementById('menu-container')
        .children.item('menu')
        .children[0].children.item('top-level-buttons')
    )
      return;

    // If the button already exists, don't create a new one
    if (document.getElementById('tournesol-statistics')) {
      window.clearInterval(timer);
      return;
    }

    window.clearInterval(timer);

    // Create statistic score div
    var statistics_div = document.createElement('div');
    statistics_div.setAttribute('id', 'tournesol-statistics');

    // Text td for better vertical alignment
    var text_p = document.createElement('p');
    text_p.setAttribute('valign', 'middle');


    chrome.runtime.sendMessage({
      message: 'getVideoStatistics',
      video_id: videoId
    }).then(function(resp) {
      console.log("this is the response");
      console.log(resp);

      if (document.getElementById('tournesol-statistics')) {
        return;
      }

      if (resp && resp.results && resp.results.length == 1) {
        vid = resp.results[0];
        console.log(vid);

        tournesol_score = Math.round(vid.tournesol_score);

        text_td_text = document.createTextNode(`Score: ${tournesol_score}`)
        text_p.append(text_td_text);
        statistics_div.append(text_p);

        var div = document
          .getElementById('menu-container')
          .children.item('menu')
          .children[0].children.item('top-level-buttons');
        div.insertBefore(statistics_div, div.children[2]);
      }

    }).catch(err => {
      console.log("error in getVideoStatistics");
      console.log(err);
    });
  }
}
