window.addEventListener('load', () => {
    const parent = document.getElementById('unity-container')
    const child = document.getElementById('unity-canvas')
    const parentHeight = parent.offsetHeight
    child.style.height = `${parentHeight}px`
    console.log('on page load')
});
