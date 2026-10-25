const scene = new THREE.Scene();
const container = document.getElementById('canvas-container');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); }, false);

const textureLoader = new THREE.TextureLoader();
const materials = [];
const panoramaFiles = [
    'panorama_1.png', 'panorama_3.png',
    'panorama_4.png', 'panorama_5.png',
    'panorama_0.png', 'panorama_2.png'
];

panoramaFiles.forEach(file => {
    const mat = new THREE.MeshBasicMaterial({ color: 0x0a0a0f, side: THREE.BackSide });
    const tex = textureLoader.load('./' + file, () => {
        mat.map = tex;
        mat.color.setHex(0xffffff);
        mat.needsUpdate = true;
    });
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    materials.push(mat);
});

scene.background = new THREE.Color(0x0a0a0f);
const geometry = new THREE.BoxGeometry(2000, 2000, 2000);
const skybox = new THREE.Mesh(geometry, materials);
scene.add(skybox);

let currentSpeedMultiplier = 1;
let time = 0;

function animate() {
    requestAnimationFrame(animate);

    time += 0.001 * currentSpeedMultiplier;

    camera.rotation.x = -0.05 + Math.sin(time * 0.5) * 0.02;
    camera.rotation.y = Math.sin(time * 0.3) * 0.05;

    skybox.rotation.y -= 0.0002 * currentSpeedMultiplier;

    renderer.render(scene, camera);
}
animate();

let resizeRaf = null;
function updateSize() {
    const w = window.innerWidth; const h = window.innerHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
function scheduleResize() {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(updateSize);
}

window.addEventListener('resize', scheduleResize);
window.addEventListener('orientationchange', scheduleResize);
if (window.visualViewport) { window.visualViewport.addEventListener('resize', scheduleResize); }

const navbar = document.getElementById('navbar');
const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');
const gearBtn = document.getElementById('gearBtn');
const settingsPanel = document.getElementById('settingsPanel');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) { navbar.classList.add('scrolled'); } else { navbar.classList.remove('scrolled'); }
});

menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuBtn.classList.toggle('active');
    navMenu.classList.toggle('show');
    settingsPanel.classList.remove('show');
});

gearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsPanel.classList.toggle('show');
    menuBtn.classList.remove('active');
    navMenu.classList.remove('show');
});

document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && e.target !== menuBtn) {
        menuBtn.classList.remove('active');
        navMenu.classList.remove('show');
    }
    if (!settingsPanel.contains(e.target) && e.target !== gearBtn) {
        settingsPanel.classList.remove('show');
    }
});

navMenu.addEventListener('click', (e) => e.stopPropagation());
settingsPanel.addEventListener('click', (e) => e.stopPropagation());

const blurSlider = document.getElementById('blurSlider');
const blurVal = document.getElementById('blurVal');
let blurRaf = null;
blurSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    blurVal.textContent = `${val}px`;
    if (blurRaf) cancelAnimationFrame(blurRaf);
    blurRaf = requestAnimationFrame(() => {
        container.style.filter = val === '0' ? 'none' : `blur(${val}px)`;
    });
});

const speedSlider = document.getElementById('speedSlider');
const speedVal = document.getElementById('speedVal');
speedSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    currentSpeedMultiplier = val;
    speedVal.textContent = `${val.toFixed(1)}x`;
});

const ipBadge = document.getElementById('ipBadge');
const ipText = document.getElementById('ipText');
const ipAddress = 'mc.notchwlmc.us.ci';

async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(text); return true; } catch (_) {}
    }
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:none;outline:none;box-shadow:none;background:transparent;opacity:0;font-size:16px;';
    document.body.appendChild(ta); ta.focus(); ta.select(); ta.setSelectionRange(0, text.length);
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
    document.body.removeChild(ta);
    return ok;
}

ipBadge.addEventListener('click', async () => {
    ipBadge.classList.remove('animate'); void ipBadge.offsetWidth; ipBadge.classList.add('animate');
    const ok = await copyText(ipAddress);
    if (!ok) {
        ipText.textContent = '复制失败';
        setTimeout(() => { ipText.textContent = `IP:${ipAddress}`; }, 2000);
        return;
    }
    ipText.textContent = '已复制!'; ipBadge.classList.add('copied');
    setTimeout(() => { ipText.textContent = `IP:${ipAddress}`; ipBadge.classList.remove('copied'); }, 2000);
});

function getCommonNavHTML(titleCn, titleEn) {
    return `
    <nav class="navbar" id="navbar">
        <div class="nav-left">
            <button id="menuBtn" class="menu-btn" title="菜单">
                <span></span><span></span><span></span>
            </button>
            <a href="index.html" class="logo">
                <div class="logo-dot"></div>
                <div class="logo-text-group">
                    <span class="logo-text-cn">${titleCn}</span>
                    <span class="logo-text-en">${titleEn}</span>
                </div>
            </a>
            <div id="navMenu" class="nav-menu">
                <ul>
                    <li><a href="index.html">首页概览</a></li>
                    <li><a href="mcplugins.html">资源中心</a></li>
                    <li><a href="#">反馈</a></li>
                    <li><a href="#">关于我们</a></li>
                </ul>
            </div>
        </div>
        <div class="nav-controls">
            <div class="settings-wrapper">
                <button id="gearBtn" class="gear-btn" title="设置">
                    <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"></path></svg>
                </button>
                <div id="settingsPanel" class="settings-panel">
                    <div class="setting-item">
                        <div class="setting-header"><span>背景模糊</span><span id="blurVal">10px</span></div>
                        <input type="range" id="blurSlider" min="0" max="15" value="10" step="1">
                    </div>
                    <div class="setting-item">
                    </div>
                </div>
            </div>
            <div class="status-badge" id="ipBadge" title="点击复制服务器IP">
                <div class="dot"></div>
                <span id="ipText">IP:mc.notchwlmc.us.ci</span>
            </div>
        </div>
    </nav>
    `;
}

function getCommonFooterHTML() {
    return `
    <footer class="footer">
        <p>&copy; 2026 Created by GanYi.</p>
        <a href="https://github.com/Notchwlmc" target="_blank" class="github-link" title="访问我的 GitHub">
            <svg viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
        </a>
        <a href="https://qun.qq.com/universal-share/share?ac=1&authKey=GqJmZonrmk5PX9kR9p5mI9U3MdLtufAn2ZgMymV7%2BfrYG43qVrrU9C1dMWv4VrC0&busi_data=eyJncm91cENvZGUiOiIyOTUyODY5OTMiLCJ0b2tlbiI6InUxMnJmOG9ENmpjbmZRS3B2cjErUFlQSGtLMnBaeXFnRHZvMGp5ZG42Zk5Wd08yS1paM2dXcFU5RzUwMmdTdXAiLCJ1aW4iOiIxNjM3Njk1OTEzIn0%3D&data=rhihtQaBPgmXln2qOwsb6ZXoPXWSrzypKOCHca0gxOhEUGvsv_LQC6P_xoLY8gILMQUR0Xh8A58nqjQm4TWMFg&svctype=4&tempid=h5_group_info" target="_blank" class="qq-link" title="加入我们,295286993">
            <svg t="1792808590054" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="256" height="256"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m210.5 612.4c-11.5 1.4-44.9-52.7-44.9-52.7 0 31.3-16.2 72.2-51.1 101.8 16.9 5.2 54.9 19.2 45.9 34.4-7.3 12.3-125.6 7.9-159.8 4-34.2 3.8-152.5 8.3-159.8-4-9.1-15.2 28.9-29.2 45.8-34.4-35-29.5-51.1-70.4-51.1-101.8 0 0-33.4 54.1-44.9 52.7-5.4-0.7-12.4-29.6 9.4-99.7 10.3-33 22-60.5 40.2-105.8-3.1-116.9 45.3-215 160.4-215 113.9 0 163.3 96.1 160.4 215 18.1 45.2 29.9 72.8 40.2 105.8 21.7 70.1 14.6 99.1 9.3 99.7z"></path></svg>
        </a>
    </footer>
    `;
}