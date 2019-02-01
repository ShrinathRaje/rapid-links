/* google analytics script */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-XXXXXXXXX-X']); //tracking id hidden for security reasons
_gaq.push(['_trackPageview']);

(function () {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function launchUrl(request, n) {
    var link = request['url' + n];
    /* if url field is not set, just ignore the launch request */
    if (link.url != "") {
        if (link.newTab) {
            chrome.tabs.create({ url: link.url });
        } else {
            chrome.tabs.update({ url: link.url });
        }

        /* track events in google analytics */
        if (n === 1)
            _gaq.push(['_trackEvent', 'Alt + V', 'launched']);
        else if (n === 2)
            _gaq.push(['_trackEvent', 'Alt + B', 'launched']);
        else
            _gaq.push(['_trackEvent', 'Alt + N', 'launched']);
    }
}

/* one time initialization */
/* set empty fields with most visited websites */
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({
        url1: { url: "https://www.google.com/", newTab: false },
        url2: { url: "https://www.youtube.com/", newTab: false },
        url3: { url: "https://www.facebook.com/", newTab: false },
        showTutorial: true
    }, function () { });
});

/* listen to commands from the keyboard */
chrome.commands.onCommand.addListener(function (command) {
    switch (command) {
        case "launchFirstUrl":
            chrome.storage.sync.get(['url1'], function (request) { launchUrl(request, 1); });
            break;

        case "launchSecondUrl":
            chrome.storage.sync.get(['url2'], function (request) { launchUrl(request, 2); });
            break;

        case "launchThirdUrl":
            chrome.storage.sync.get(['url3'], function (request) { launchUrl(request, 3); });
            break;
    }
});
