let iframeCount = 1;
const maxIframes = 5;
const iframeSelections = [];

function selections(iframeData) {
    console.log(iframeData);  // You can handle iframe data here
}

window.openWebsite = function(url) {
    if (iframeCount >= maxIframes) {
        alert("Max limit reached");
        return;
    }

    let container = document.createElement('div');
    container.className = 'iframe-container';

    let iframe = document.createElement('iframe');
    iframe.src = url;

    let menuButton = document.createElement('button');
    menuButton.className = 'menu-button';
    menuButton.textContent = 'Menu';
    menuButton.onclick = function() {
        toggleMenu(container);
    };

    let menu = document.createElement('div');
    menu.className = 'menu';

    let closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = function() {
        closeIframe(container);
    };

    let fullscreenButton = document.createElement('button');
    fullscreenButton.textContent = 'Fullscreen';
    fullscreenButton.onclick = function() {
        toggleFullscreen(container);
    };

    let selectButton = document.createElement('button');
    selectButton.textContent = 'Add to Multi View';
    selectButton.onclick = function() {
        if (iframeCount < maxIframes) {
            let iframeData = `iframe#${iframeCount}#${url}`;
            iframeSelections.push(iframeData); // Store selected iframes
            selections(iframeData);  // Call selection function
            iframeCount++;
        }
    };

    menu.appendChild(selectButton);
    menu.appendChild(fullscreenButton);
    menu.appendChild(closeButton);

    container.appendChild(iframe);
    container.appendChild(menuButton);
    container.appendChild(menu);

    document.getElementById('iframe-container').appendChild(container);
};

window.closeIframe = function(container) {
    container.remove();
    iframeCount--;
};

window.toggleFullscreen = function(container) {
    if (container.classList.contains('fullscreen-mode')) {
        container.classList.remove('fullscreen-mode');
    } else {
        document.querySelectorAll('.fullscreen-mode').forEach((el) => el.classList.remove('fullscreen-mode'));
        container.classList.add('fullscreen-mode');
    }
};

window.toggleMenu = function(container) {
    let menu = container.querySelector('.menu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
};
