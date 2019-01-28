const numberOfRapidLinks = 3;
const emptyUrlPlaceholder = "Enter URL, e.g: www.example.com";

function initialize() {

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

                if (newTab)
                    document.getElementById(url + '-yes').checked = true;
                else
                    document.getElementById(url + '-no').checked = true;

                document.getElementById(url + '-update').style.display = "inline-block";
                document.getElementById(url + '-delete').style.display = "inline-block";

            } else {
                link.readOnly = false;
                link.placeholder = emptyUrlPlaceholder;
                document.getElementById(url + '-add').style.display = "inline-block";
            }
        }
    });

    for (let i = 0; i < numberOfRapidLinks; ++i) {
        const url = 'url' + (i + 1);
        document.getElementById(url + '-update').addEventListener('click', update);
        document.getElementById(url + '-save').addEventListener('click', save);
        document.getElementById(url + '-add').addEventListener('click', add);
        document.getElementById(url + '-cancel').addEventListener('click', cancel);
        document.getElementById(url + '-delete').addEventListener('click', deleteUrl);

        document.getElementById(url + '-yes').addEventListener('click', setNewTabValue);
        document.getElementById(url + '-no').addEventListener('click', setNewTabValue);
    }
}

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
            document.getElementById(id).readOnly = false;
            break;

        case 'save':
        case 'cancel':
            update.style.display = "inline-block";
            deleteUrl.style.display = "inline-block";
            save.style.display = "none";
            cancel.style.display = "none";
            document.getElementById(id).readOnly = true;
            break;

        case 'delete':
            update.style.display = "none";
            deleteUrl.style.display = "none";
            add.style.display = "inline-block";
            document.getElementById(id).readOnly = false;
            break;

        case 'cancel-add':
            save.style.display = "none";
            cancel.style.display = "none";
            add.style.display = "inline-block";
    }
}

function validateUrl(str) {
    const regexp = new RegExp(/^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/);

    return regexp.test(str);
}

function update(event) {
    const id = event.target.id.substring(0, 4);
    document.getElementById(id).value = "";
    document.getElementById(id).placeholder = emptyUrlPlaceholder;
    document.getElementById(id).focus();
    handleButtons(id, 'update');
}

function cancel(event) {
    const id = event.target.id.substring(0, 4);

    chrome.storage.sync.get([id], function (result) {
        const link = result[id].url;
        if (link != "") {
            document.getElementById(id).value = link;
            handleButtons(id, 'cancel');
        } else {
            document.getElementById(id).value = "";
            document.getElementById(id).placeholder = emptyUrlPlaceholder;
            handleButtons(id, 'cancel-add');
        }

        if (result[id].newTab)
            document.getElementById(id + '-yes').checked = true;
        else
            document.getElementById(id + '-no').checked = true;
    });
}

function save(event) {
    const id = event.target.id.substring(0, 4);
    var link = document.getElementById(id).value;

    if (!link.includes('http'))
        link = 'http://' + link;

    if (!validateUrl(link)) {
        document.getElementById(id).value = "";
        cancel(event);
        return;
    }

    const newUrl = {};
    newUrl[id] = { url: link, newTab: document.getElementById(id + '-yes').checked };
    chrome.storage.sync.set(newUrl, function () {

    });

    handleButtons(id, 'save');
}

function add(event) {
    const id = event.target.id.substring(0, 4);
    document.getElementById(id + '-add').style.display = "none";
    update(event);
}

function deleteUrl(event) {
    const id = event.target.id.substring(0, 4);

    const newUrl = {};
    newUrl[id] = { url: "", newTab: false };
    chrome.storage.sync.set(newUrl, function () {

    });

    document.getElementById(id).value = "";
    document.getElementById(id).placeholder = emptyUrlPlaceholder;
    document.getElementById(id + '-no').checked = true;

    handleButtons(id, 'delete');
}

function setNewTabValue(event) {
    const id = event.target.id.substring(0, 4);
    const yesOrNo = event.target.id.substring(5);

    chrome.storage.sync.get([id], function (result) {
        if (yesOrNo === "yes")
            result[id].newTab = true;
        else
            result[id].newTab = false;

        chrome.storage.sync.set(result, function () {

        });
    });
}

initialize();
