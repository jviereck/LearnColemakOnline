var editor;
var inputField;
var currentMapping = '';
var currentLession = {
    value: 0,
    index: 0,
    error: {}
};

function setLession(name) {
    currentLession.index = 0;
    currentLession.value = lessions[name] || '';
    currentLession.error = {};
    editor.setValue(currentLession.value);
    editor.focus();
}

function nextLessionChar() {
    return currentLession.value[currentLession.index];
}

function normalizeChar(aChar) {
    var map = keymaps[currentMapping];

    if (!map) return aChar;

    var charIdx = map.indexOf(aChar);

    if (charIdx === -1) {
        // Not part of the keymapping :/
        // Return the original value for now.
        return aChar;
    }

    return keymaps.colemak[charIdx];
}

function onNewChar(newChar) {
    editor.removeOverlay(overlay);

    newChar = normalizeChar(newChar);

    if (nextLessionChar() === newChar) {
        currentLession.index ++;
    } else {
        var index = currentLession.index;
        var error = currentLession.error;
        if (!error[index]) {
            error[index] = 0;
        }
        error[index] ++;
    }

    editor.addOverlay(overlay);
}

function initKeyboardSelect() {
    var keyboardSelect = document.getElementById('keyboardSelect');
    keyboardSelect.addEventListener('change', function() {
        currentMapping = keyboardSelect.value;
    });
}

function initLessionSelect() {
    var lessionsSelect = document.getElementById('lessionsSelect');
    var keys = Object.keys(lessions);

    keys.forEach(function(lessionName) {
        var option = document.createElement('option');
        option.value = lessionName;
        option.textContent = lessionName;
        lessionsSelect.appendChild(option);
    });

    lessionsSelect.addEventListener('change', function() {
        setLession(lessionsSelect.value);
    });
}

function initInputDetection() {
    function checkInput() {
        var value = inputField.value;
        var newChar = value.substring(value.length - 1);
        inputField.value = '';
        if (newChar !== '') {
            onNewChar(newChar);
        }
    }

    // Very ugly, but works well for now...
    inputField.addEventListener('keypress', checkInput);
    inputField.addEventListener('keyup', checkInput);
    setInterval(checkInput, 50);
}

var overlay = {
    token: function(stream) {
        var error = currentLession.error;
        var ret = [];
        var pos = stream.pos;
        var idx = currentLession.index;

        if (error[pos]) {
            ret.push('fail');
        } else if (pos < idx){
            ret.push('pass');
        }
        if (pos == idx) {
            ret.push('current');
        }
        stream.next();
        return ret.join(' ');
    }
};

function initEditor() {
    var editorDom = document.getElementById('editor');

    editor = CodeMirror(editorDom, {
        lineWrapping: true,
        readOnly: true,
        styleActiveLine: true

    });

    inputField = editor.getInputField();

    editor.addOverlay(overlay);
}

// Boot.
initEditor();
initLessionSelect();
initInputDetection();
initKeyboardSelect();
