const registerPageEvent = () => {

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
}

window.addEventListener('load', () => {
    const parent = document.getElementById('unity-container')
    const child = document.getElementById('unity-canvas')
    const parentHeight = parent.offsetHeight
    child.style.height = `${parentHeight}px`
    console.log('on page load')

    registerPageEvent()
});
