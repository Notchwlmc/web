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

function initUI() {
    const navbar = document.getElementById('navbar');
    const menuBtn = document.getElementById('menuBtn');
    const navMenu = document.getElementById('navMenu');
    const gearBtn = document.getElementById('gearBtn');
    const settingsPanel = document.getElementById('settingsPanel');

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) { navbar.classList.add('scrolled'); } else { navbar.classList.remove('scrolled'); }
        });
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuBtn.classList.toggle('active');
            navMenu.classList.toggle('show');
            if (settingsPanel) settingsPanel.classList.remove('show');
        });
    }

    if (gearBtn) {
        gearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsPanel.classList.toggle('show');
            if (menuBtn) menuBtn.classList.remove('active');
            if (navMenu) navMenu.classList.remove('show');
        });
    }

    document.addEventListener('click', (e) => {
        if (navMenu && !navMenu.contains(e.target) && e.target !== menuBtn) {
            if (menuBtn) menuBtn.classList.remove('active');
            navMenu.classList.remove('show');
        }
        if (settingsPanel && !settingsPanel.contains(e.target) && e.target !== gearBtn) {
            settingsPanel.classList.remove('show');
        }
    });

    if (navMenu) navMenu.addEventListener('click', (e) => e.stopPropagation());
    if (settingsPanel) settingsPanel.addEventListener('click', (e) => e.stopPropagation());

    const blurSlider = document.getElementById('blurSlider');
    const blurVal = document.getElementById('blurVal');
    let blurRaf = null;
    if (blurSlider) {
        blurSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            if (blurVal) blurVal.textContent = `${val}px`;
            if (blurRaf) cancelAnimationFrame(blurRaf);
            blurRaf = requestAnimationFrame(() => {
                if (container) container.style.filter = val === '0' ? 'none' : `blur(${val}px)`;
            });
        });
    }

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

    if (ipBadge) {
        ipBadge.addEventListener('click', async () => {
            ipBadge.classList.remove('animate'); void ipBadge.offsetWidth; ipBadge.classList.add('animate');
            const ok = await copyText(ipAddress);
            if (!ok) {
                if (ipText) ipText.textContent = '复制失败';
                setTimeout(() => { if (ipText) ipText.textContent = `IP:${ipAddress}`; }, 2000);
                return;
            }
            if (ipText) ipText.textContent = '已复制!'; 
            ipBadge.classList.add('copied');
            setTimeout(() => { 
                if (ipText) ipText.textContent = `IP:${ipAddress}`; 
                ipBadge.classList.remove('copied'); 
            }, 2000);
        });
    }
}
