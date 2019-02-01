const numberOfRapidLinks = 3;
const emptyUrlPlaceholder = "Enter URL, e.g: www.example.com";

/* google analytics script */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-XXXXXXXXX-X']); //tracking id hidden for security reasons
_gaq.push(['_trackPageview']);

(function () {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

/*populate the url fields with values stored in the chrome storage */
/*add event listeners to all the buttons and input fields like radio buttons */
function initialize() {

    /* get all three stored urls which are guaranteed to be not empty at least on the first run of the extension */
    chrome.storage.sync.get(['url1', 'url2', 'url3'], function (result) {

        const list = Object.keys(result);

        for (let i = 0; i < numberOfRapidLinks; ++i) {
            const url = 'url' + (i + 1);
            const link = document.getElementById(url);

            const storedUrl = result[list[i]].url;
            const newTab = result[list[i]].newTab;

            if (storedUrl != "") {
                link.value = storedUrl;
                link.readOnly = true;

                checkNewTabButton(url, newTab);

                document.getElementById(url + '-update').style.display = "inline-block";
                document.getElementById(url + '-delete').style.display = "inline-block";

            } else {
                link.readOnly = false;
                link.placeholder = emptyUrlPlaceholder;
                document.getElementById(url + '-add').style.display = "inline-block";
                document.getElementById(url + '-form').style.display = "none";
            }
        }
    });

    /* add event listeners */
    for (let i = 0; i < numberOfRapidLinks; ++i) {
        const url = 'url' + (i + 1);
        document.getElementById(url + '-update').addEventListener('click', update);
        document.getElementById(url + '-save').addEventListener('click', save);
        document.getElementById(url + '-add').addEventListener('click', add);
        document.getElementById(url + '-cancel').addEventListener('click', cancel);
        document.getElementById(url + '-delete').addEventListener('click', deleteUrl);

        document.getElementById(url + '-yes').addEventListener('click', setNewTabValue);
        document.getElementById(url + '-no').addEventListener('click', setNewTabValue);

        document.getElementById(url).addEventListener('keyup', handleKeyPress);
    }

    /* handle tutorial popup */
    chrome.storage.sync.get(['showTutorial'], function (result) {
        if (result.showTutorial) {
            const tutorialPopup = document.createElement('div');
            tutorialPopup.setAttribute('id', 'tutorialPopup');

            tutorialPopup.innerHTML = '<h2>Welcome!</h2>' +
                '<p><b>Press and Hold</b> <kbd>Alt</kbd> key, then, <b>Press and immediately Release </b>' +
                "the <kbd> 'alphabet' </kbd> key to launch your favorite websites. " +
                "For e.g: Press <kbd>Alt + B</kbd> To launch YouTube.</p>" +
                '<input type="checkbox" id="tutorialCheckbox"> <label for="tutorialCheckbox">' +
                'Do not show this again</label>' +
                '<button id="tutorialButton">X</button>';

            document.querySelector('.container').appendChild(tutorialPopup);

            document.getElementById('tutorialButton').addEventListener('click', function () {
                if (document.getElementById('tutorialCheckbox').checked) {
                    chrome.storage.sync.set({ showTutorial: false }, function () { });
                }

                tutorialPopup.remove();
            });
        }
    });

    /* Navigation links */
    document.getElementById('addReview').addEventListener('click', handleNavLinks);
    document.getElementById('contact').addEventListener('click', handleNavLinks);
}

/* handle buttons depending on the context of the program */
function handleButtons(id, context) {
    const save = document.getElementById(id + '-save');
    const update = document.getElementById(id + '-update');
    const add = document.getElementById(id + '-add');
    const cancel = document.getElementById(id + '-cancel');
    const deleteUrl = document.getElementById(id + '-delete');

    switch (context) {
        case 'update':
            update.style.display = "none";
            deleteUrl.style.display = "none";
            save.style.display = "inline-block";
            cancel.style.display = "inline-block";
            document.getElementById(id + '-form').style.display = "block";
            document.getElementById(id).readOnly = false;
            break;

        case 'save':
        case 'cancel':
            update.style.display = "inline-block";
            deleteUrl.style.display = "inline-block";
            save.style.display = "none";
            cancel.style.display = "none";
            document.getElementById(id + '-form').style.display = "block";
            document.getElementById(id).readOnly = true;
            break;

        case 'delete':
            update.style.display = "none";
            deleteUrl.style.display = "none";
            add.style.display = "inline-block";
            document.getElementById(id + '-form').style.display = "none";
            document.getElementById(id).readOnly = false;
            break;

        case 'cancel-add':
            save.style.display = "none";
            cancel.style.display = "none";
            add.style.display = "inline-block";
            document.getElementById(id + '-form').style.display = "none";
    }
}

/* validate the url using regex */
function validateUrl(str) {
    const regexp = new RegExp(/^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/);

    return regexp.test(str);
}

/* update the url field */
function update(event) {
    const id = event.target.id.substring(0, 4);
    const url = document.getElementById(id);

    url.placeholder = emptyUrlPlaceholder;
    url.select();
    url.focus();
    handleButtons(id, 'update');
}

/* cancel the current operation and set the url field to it's previous value */
function cancel(event) {
    const id = event.target.id.substring(0, 4);

    chrome.storage.sync.get([id], function (result) {
        const link = result[id].url;
        if (link != "") {
            document.getElementById(id).value = link;
            handleButtons(id, 'cancel');
        } else {
            const url = document.getElementById(id);

            url.value = "";
            url.placeholder = emptyUrlPlaceholder;
            handleButtons(id, 'cancel-add');
        }

        checkNewTabButton(id, result[id].newTab);
    });
}

/* validate and save entered urls */
function save(event) {
    const id = event.target.id.substring(0, 4);
    var link = document.getElementById(id).value;

    if (link === "") {
        cancel(event);
        handleMessages('error: empty url', 1);
        return;
    }

    /* lets you enter urls without typing http or https */
    if (!link.includes('http'))
        link = 'http://' + link;

    if (!validateUrl(link)) {
        document.getElementById(id).value = "";
        cancel(event);
        handleMessages('error: invalid url', 1);
        return;
    }

    const newUrl = {};
    newUrl[id] = { url: link, newTab: document.getElementById(id + '-yes').checked };
    chrome.storage.sync.set(newUrl, function () {
        handleMessages('success: url saved', 0);
    });

    handleButtons(id, 'save');
}

/* add new urls */
function add(event) {
    const id = event.target.id.substring(0, 4);
    document.getElementById(id + '-add').style.display = "none";

    if (document.getElementById(id).value === "")
        update(event);
    else
        save(event);
}

/* set the url to empty string in the chrome storage */
function deleteUrl(event) {
    const id = event.target.id.substring(0, 4);

    const newUrl = {};
    newUrl[id] = { url: "", newTab: false };
    chrome.storage.sync.set(newUrl, function () {
        handleMessages('success: url deleted', 0);
    });

    const urlField = document.getElementById(id);
    urlField.value = "";
    urlField.placeholder = emptyUrlPlaceholder;
    document.getElementById(id + '-no').checked = true;

    handleButtons(id, 'delete');
}

/* set radio buttons depending on the value retrieved from the chrome storage */
function checkNewTabButton(id, val) {
    if (val)
        document.getElementById(id + '-yes').checked = true;
    else
        document.getElementById(id + '-no').checked = true;
}

/* lets you alter radio button values on the go without hitting any buttons */
function setNewTabValue(event) {
    const id = event.target.id.substring(0, 4);
    const yesOrNo = event.target.id.substring(5);

    chrome.storage.sync.get([id], function (result) {
        if (result[id].url === "") {
            handleMessages('error: no url saved', 1);
            return;
        }

        if (yesOrNo === "yes")
            result[id].newTab = true;
        else
            result[id].newTab = false;

        chrome.storage.sync.set(result, function () {
            if (result[id].newTab)
                handleMessages('success: open in new tab', 0);
            else
                handleMessages('success: do not open in new tab');
        });
    });
}

/* notify user with related and helpful messages */
function handleMessages(str, success) {
    const message = document.getElementById('message');
    message.textContent = str;
    message.style.color = success ? "#ff0000" : "#006400";

    /* end the message after 2 seconds */
    setTimeout(function () {
        message.textContent = "";
    }, 2000);
}

/* let's you save or add url's on pressing enter key */
function handleKeyPress(event) {
    //check if enter key was hit
    if (event.which === 13) {
        const id = event.target.id;

        const saveButton = document.getElementById(id + '-save');
        const addButton = document.getElementById(id + '-add');

        if (saveButton.style.display === "inline-block")
            saveButton.click();
        else
            addButton.click();
    }
}

/* handle clicks on links to external resources */
function handleNavLinks(event) {
    const link = event.target.href;
    chrome.tabs.create({ url: link });
}

initialize(); //let the game begin
