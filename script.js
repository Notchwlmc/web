var toggleButton = document.getElementById('toggleButton');
if (toggleButton) {
    toggleButton.addEventListener('click', function() {
        var toggleText = document.getElementById('toggleText');
        if (!toggleText) return;
        if (toggleText.classList.contains('hidden')) {
            toggleText.classList.remove('hidden');
            toggleText.classList.add('visible');
        } else {
            toggleText.classList.remove('visible');
            toggleText.classList.add('hidden');
        }
    });
}
document.addEventListener('DOMContentLoaded', function() {
    var resourceLink = document.getElementById('link-resource');
    var targetUrl = 'https://modrinth.com/user/notchwlmc';
    if (resourceLink) {
        resourceLink.addEventListener('click', function(e) {
            e.preventDefault();               // 阻止 href="#" 回到顶部
            window.open(targetUrl, '_blank'); // 新标签页打开目标地址
        });
    } else {
        console.warn('未找到 id="link-resource" 的元素');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var resourceLink = document.getElementById('mcplugin');
    var targetUrl = './mcplugins.html';
    if (resourceLink) {
        resourceLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(targetUrl, '_blank');
        })
    }else {
        console.warn('未找到 id="mcplugin的元素')
    }
})

document.addEventListener('DOMContentLoaded', function() {
    var resourceLink = document.getElementById('plugin-home');
    var targetUrl = './mcplugins.html';
    if (resourceLink) {
        resourceLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(targetUrl, '_blank');
        })
    }else {
        console.warn('未找到 id="plugin-home"的元素')
    }
})
