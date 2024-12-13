
const setCanvasSize = () => {
    const parent = document.getElementById('unity-container')
    const child = document.getElementById('unity-canvas')
    const parentHeight = parent.offsetHeight
    child.style.height = `${parentHeight}px`
}

const registerResizeEvent = () => {
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            document.body.style.height = window.visualViewport.height + 'px';
        });
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) window.scrollTo(0, 0);
    });
}

window.addEventListener('load', () => {
    setCanvasSize()
    registerResizeEvent()
    console.log('on page load')
});
