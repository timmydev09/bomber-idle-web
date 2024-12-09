var buildUrl = "Build";
var loaderUrl = buildUrl + "/development.loader.js?638693575273517056";
var config = {
    dataUrl: buildUrl + "/f7cd4a45afc23b6169315ad6002c1eff.data.unityweb",
    frameworkUrl: buildUrl + "/a84d460ecccc2e9c32660ce40ad5683d.js.unityweb",
    codeUrl: buildUrl + "/c0a0ee142d4da2370976ab6825bca4ae.wasm.unityweb",
    streamingAssetsUrl: "StreamingAssets",
    companyName: "DefaultCompany",
    productName: "bomb-idle",
    productVersion: "0.1.7",

    cacheControl: function (url) {
        // Caching enabled for .data and .bundle files.
        // Revalidate if file is up to date before loading from cache
        if (url.match(/\.data/) || url.match(/\.bundle/)) {
            return "must-revalidate";
        }

        // Caching enabled for .mp4 and .custom files
        // Load file from cache without revalidation.
        if (url.match(/\.mp4/) || url.match(/\.custom/)) {
            return "immutable";
        }

        // Disable explicit caching for all other files.
        // Note: the default browser cache may cache them anyway.
        return "no-store";
    },
};

var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
    // Define a maximum pixel ratio for mobile to avoid rendering at too high resolutions
    const maxPixelRatioMobile = 2.0;
    config.devicePixelRatio = Math.min(window.devicePixelRatio, maxPixelRatioMobile);
}
else {
    config.devicePixelRatio = 2.0;
}

var canvas = document.querySelector("#unity-canvas");
var loadingBar = document.querySelector("#unity-loading-fg");
var textProgress = document.querySelector("#loading-progress-text");
var unityGame;
var script = document.createElement("script");
script.src = loaderUrl;
script.onload = function () {
    createUnityInstance(canvas, config, function (progress) {
        loadingBar.style.width = `${100 * progress}%`;
        textProgress.innerHTML = `${Math.floor(progress * 100)}%`;
    }).then(function (unityInstance) {
        unityGame = unityInstance;
    }).catch(function (message) {
        alert(message);
    });
};
document.body.appendChild(script);
function runUnityCommand(method, params) {
    unityGame?.SendMessage("WebBridge", method, params);
}
function UnityTaskCallBack(taskId, success, data) {
    runUnityCommand("UnityTaskCallBack", JSON.stringify({
        taskId,
        success,
        data: ((typeof data === 'object' && data !== null) ? JSON.stringify(data) : data.toString())
    }));
}

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://cdn.mirailabs.co/bomber/static/tonConnectConfig.json'
});

tonConnectUI.onStatusChange(walletAndwalletInfo => {
    runUnityCommand("StatusChange");
});
tonConnectUI.connectionRestored.then(restored => {
    if (restored) {
        console.log('Connection restored.');
    } else {
        console.log('Connection was not restored.');
    }
});

const resetView = {
    reset: () => {
        console.log("do reset")
        this.timeoutId = undefined
    },
    cancel: () => {
        clearTimeout(this.timeoutId)
    },
    setup: (time, action) => {
        if (typeof this.timeoutId === "number") {
            this.cancel()
        }

        this.timeoutId = setTimeout(() => {
            action()
        }, time);
    },
}

let timeoutId = undefined
const cancelTimeout = () => {
    if (!timeoutId) { return }
    clearTimeout(timeoutId)
    timeoutId = undefined
}

const setupTimeout = (time, action) => {
    cancelTimeout()
    timeoutId = setTimeout(() => {
        action()
    }, time);
}

document.body.addEventListener("focusout", function () {
    const body = document.getElementById("main-body")
    body.style.marginTop = "100px"
    if (!body) { return }
    setupTimeout(100, () => {
        body.style.marginTop = "0px"
    })
});


const createInput = (canvasId, x, y, width, height, fontsize, text, placeholder, isMultiLine, isPassword, isHidden, isMobile) => {
    var container = document.getElementById(UTF8ToString(canvasId));
    var canvas = container.getElementsByTagName('canvas')[0];

    if (!container && canvas) {
        // set the container to canvas.parentNode
        container = canvas.parentNode;
    }

    const holder = document.createElement("input_holder")
    holder.classList.add("input_holder")
    const input = document.createElement(isMultiLine ? "textarea" : "input")
    holder.appendChild(input)
    input.classList.add("input-handler")
    if (isMobile) {
        input.classList.add("multiline-input")
    }
    if (isHidden) {
        input.classList.add("hidden")
    }
    input.spellcheck = false
    input.value = UTF8ToString(text)
    input.placeholder = UTF8ToString(placeholder)
    if (isPassword) {
        input.type = 'password'
    }
    if (!isMobile) {
        container.appendChild(holder)
        return
    }
    const inputHolder = document.getElementById(UTF8ToString("input-holder"));
    if (inputHolder) {
        inputHolder.body.appendChild(holder)
        return;
    } else {
        document.body.appendChild(holder)
    }

    return input
}
