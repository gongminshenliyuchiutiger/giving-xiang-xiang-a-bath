/**
 * 幫雙溪高中校狗祥祥洗澡 - 3D 物理引擎核心遊戲邏輯
 * 特色亮點：
 * 1. 全新精雕 3D「雙溪高中校狗祥祥」解剖學模型：
 *    - 對照真實照片（祥祥照片01~03）：修長精實台灣犬流線身形、狗公腰收腹、四肢修長可動關節
 *    - 精準毛色：全黑頭配灰白吻端、額頭正中央細白線、大黑立耳、米色編織項圈、
 *      白胸與修長前腿的米克斯細斑點、背部大黑鞍斑、後腰側明顯白色縱向斑帶、
 *      高舉鐮刀狀黑長尾配「招牌白色毛筆尾尖」！
 * 2. 可隨時「把小狗移出臉盆」＆「乾濕分離吹乾」：
 *    - 支援一鍵把祥祥移出臉盆（或自動收起臉盆），跳上旁邊重現「祥祥照片03」的【乾爽木製長桌＋藍黃格紋太陽花毯】！
 *    - 選擇「移出吹乾」或「摸頭哄睡」時，若祥祥仍在臉盆內，會自動排空臉盆水並跳上乾爽木桌，絕不在有水的盆內吹乾！
 * 3. 校狗調皮亂跑系統 (Zoomies!)：
 *    - 洗澡洗到一半（或點擊頂部奔跑鈕），祥祥會調皮跳出臉盆在全場 8 字形狂奔亂跑，四肢真實擺動奔跑！
 *    - 玩家可直接點擊奔跑中的祥祥抓回，或投餵「骨頭犒賞 / 火箭玩具」把祥祥哄回來！
 * 4. 6 大雙溪高中祥祥秘密彩蛋系統（含圖鑑彈窗與解鎖推播）。
 * 5. 左下角吉祥物（image/LiyuChillGuy.svg）無上方對話框，懸停霓虹彩色發光抖動，可自由拖曳至任何位置。
 */

// ==========================================
// 1. Web Audio API 即時音效合成引擎
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.waterNoiseNode = null;
    this.waterGain = null;
    this.dryerNoiseNode = null;
    this.dryerGain = null;
    this.dryerHum = null;
    this.lastSpongeTime = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        try {
          this.ctx = new AudioContext();
        } catch (e) {}
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        this.ctx.resume();
      } catch (e) {}
    }
  }

  playSponge() {
    if (this.muted) return;
    const nowMs = performance.now();
    if (nowMs - this.lastSpongeTime < 90) return;
    this.lastSpongeTime = nowMs;

    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 320 + Math.random() * 240;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + 380, now + 0.11);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.008, now + 0.11);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playDuckQuack() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(680, now);
    osc1.frequency.exponentialRampToValueAtTime(1150, now + 0.07);
    osc1.frequency.exponentialRampToValueAtTime(560, now + 0.22);

    osc2.frequency.setValueAtTime(1360, now);
    osc2.frequency.exponentialRampToValueAtTime(2300, now + 0.07);
    osc2.frequency.exponentialRampToValueAtTime(1120, now + 0.22);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);
  }

  playSplash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.22);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.21);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  startWaterSound() {
    if (this.muted || this.waterNoiseNode) return;
    this.init();
    if (!this.ctx) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.waterNoiseNode = this.ctx.createBufferSource();
    this.waterNoiseNode.buffer = noiseBuffer;
    this.waterNoiseNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1250;
    filter.Q.value = 1.5;

    this.waterGain = this.ctx.createGain();
    this.waterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.waterGain.gain.exponentialRampToValueAtTime(0.22, this.ctx.currentTime + 0.08);

    this.waterNoiseNode.connect(filter);
    filter.connect(this.waterGain);
    this.waterGain.connect(this.ctx.destination);

    this.waterNoiseNode.start();
  }

  stopWaterSound() {
    if (this.waterGain && this.ctx) {
      const nodeToStop = this.waterNoiseNode;
      this.waterNoiseNode = null;
      this.waterGain = null;
      try {
        if (nodeToStop) nodeToStop.stop();
      } catch (e) {}
    }
  }

  startDryerSound() {
    if (this.muted || this.dryerNoiseNode) return;
    this.init();
    if (!this.ctx) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.dryerNoiseNode = this.ctx.createBufferSource();
    this.dryerNoiseNode.buffer = noiseBuffer;
    this.dryerNoiseNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 680;

    const hum = this.ctx.createOscillator();
    hum.type = 'triangle';
    hum.frequency.value = 165;

    this.dryerGain = this.ctx.createGain();
    this.dryerGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    this.dryerNoiseNode.connect(filter);
    filter.connect(this.dryerGain);
    hum.connect(this.dryerGain);
    this.dryerGain.connect(this.ctx.destination);

    this.dryerNoiseNode.start();
    hum.start();
    this.dryerHum = hum;
  }

  stopDryerSound() {
    if (this.dryerGain && this.ctx) {
      const noiseNode = this.dryerNoiseNode;
      const humNode = this.dryerHum;
      this.dryerNoiseNode = null;
      this.dryerGain = null;
      this.dryerHum = null;
      try {
        if (noiseNode) noiseNode.stop();
        if (humNode) humNode.stop();
      } catch (e) {}
    }
  }

  playDogBark() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    [0, 0.15].forEach((offset, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const base = idx === 0 ? 380 : 460;
      osc.frequency.setValueAtTime(base, now + offset);
      osc.frequency.exponentialRampToValueAtTime(base * 1.5, now + offset + 0.06);
      osc.frequency.exponentialRampToValueAtTime(base * 0.85, now + offset + 0.13);

      gain.gain.setValueAtTime(0.24, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.15);
    });
  }

  playEggUnlock() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [587.33, 880, 1174.66];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + i * 0.09;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.008, t + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    });
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.11;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.28, startTime);
      gain.gain.exponentialRampToValueAtTime(0.008, startTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.46);
    });
  }
}

// ==========================================
// 2. 遊戲主類別 (BathGame3D)
// ==========================================
class BathGame3D {
  constructor() {
    this.sfx = new SoundFX();
    this.activeTool = 'sponge'; // sponge | shower | soap | dryer | pet | duck | rocket | treat
    this.cleanliness = 0;
    this.happiness = 85;
    this.dryness = 55;
    this.gameCompleted = false;

    // 祥祥所在狀態：
    // 'in_basin'  : 在淺口大臉盆中搓洗/沖水
    // 'on_bench'  : 已移出臉盆，站在乾爽的木床藍黃格紋毯上（或臉盆已移開）
    // 'running'   : 調皮跳出臉盆在草地上全場自由狂奔亂跑 (Zoomies!)
    this.dogState = 'in_basin';
    this.basinRemoved = false; // 支援直接把臉盆移走，讓小狗完全離開臉盆
    this.isLyingDown = false;  // 趴在藍黃格紋毯上睡覺姿勢
    this.hasTriggeredAutoRun = false;
    this.runTime = 0;
    this.runTarget = new THREE.Vector3(2.2, 0, 1.2);
    this.runVel = new THREE.Vector3(0, 0, 0);
    this.runSpeed = 4.2;
    this.runTargetTimer = 0;
    this.jumpProgress = 0;
    this.headScrubCounter = 0;
    this.petCounter = 0;
    this.duckCount = 0;
    this.discoMode = false;

    // 祥祥物理彈性與甩水計時
    this.dogJiggle = { x: 0, z: 0, vx: 0, vz: 0 };
    this.shakeTimer = 0;

    // 6 大雙溪高中祥祥秘密彩蛋定義
    this.easterEggs = [
      { id: 'crown', icon: 'fa-crown', title: '雙溪泡泡皇冠王', desc: '用海綿或香皂集中搓洗祥祥的頭頂，搓出超萌 3D 泡泡皇冠！', unlocked: false },
      { id: 'zoomies', icon: 'fa-person-running', title: '校狗祥祥調皮大逃亡', desc: '祥祥洗到一半跳出臉盆全場到處狂奔，並成功把牠哄回來！', unlocked: false },
      { id: 'rocket', icon: 'fa-rocket', title: '最心愛的火箭玩具', desc: '送給祥祥最心愛的紅綠火箭拉繩玩具，讓祥祥開心叼在嘴裡！', unlocked: false },
      { id: 'nap', icon: 'fa-bed', title: '木床藍黃毯香甜午睡', desc: '在乾爽木床用「摸頭哄睡」溫柔摸祥祥，讓牠開心地趴在藍黃格紋毯上睡覺！', unlocked: false },
      { id: 'out_basin', icon: 'fa-bath', title: '乾濕分離：移出臉盆吹乾', desc: '將祥祥移出有水的臉盆，在乾爽木桌上享受專業暖風吹乾！', unlocked: false },
      { id: 'disco', icon: 'fa-wand-magic-sparkles', title: '黃金鴨王與雙溪霓虹派對', desc: '投入 5 隻橡皮小鴨或連點左下角吉祥物 5 下，召喚黃金鴨王與霓虹燈光秀！', unlocked: false }
    ];

    this.container = document.getElementById('canvas-container');
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.initThree();
    this.initPhysics();
    this.buildScene();
    this.buildXiangXiang();
    this.build3DCursorTools();
    this.initDirtAndFoamSystem();
    this.initWaterParticleSystem();
    this.initFloatingBubbleSystem();
    this.initPhysicsToys();
    this.setupEvents();
    this.setupMascot();
    this.renderEggModalList();
    this.updateHUD();
    this.animate();
  }

  // 解鎖彩蛋並顯示推播
  unlockEasterEgg(id) {
    const egg = this.easterEggs.find(e => e.id === id);
    if (!egg || egg.unlocked) return;
    egg.unlocked = true;
    this.sfx.playEggUnlock();

    const unlockedCount = this.easterEggs.filter(e => e.unlocked).length;
    document.getElementById('egg-val').innerText = `${unlockedCount}/${this.easterEggs.length}`;
    this.renderEggModalList();

    const toast = document.getElementById('egg-toast');
    document.getElementById('egg-toast-desc').innerText = `【${egg.title}】${egg.desc}`;
    toast.classList.add('show');
    clearTimeout(this.eggToastTimer);
    this.eggToastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3600);
  }

  renderEggModalList() {
    const container = document.getElementById('egg-list-container');
    if (!container) return;
    container.innerHTML = this.easterEggs.map(egg => `
      <div class="egg-card ${egg.unlocked ? 'unlocked' : ''}">
        <div class="egg-card-icon">
          <i class="fa-solid ${egg.unlocked ? egg.icon : 'fa-lock'}"></i>
        </div>
        <div class="egg-card-info">
          <h4>
            <span>${egg.title}</span>
            <span class="egg-status-badge">
              <i class="fa-solid ${egg.unlocked ? 'fa-circle-check' : 'fa-lock'}"></i>
              <span>${egg.unlocked ? '已解鎖' : '未解鎖'}</span>
            </span>
          </h4>
          <p>${egg.desc}</p>
        </div>
      </div>
    `).join('');
  }

  // ----------------------------------------
  // 初始化 Three.js 渲染器、相機與燈光
  // ----------------------------------------
  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdbeafe);
    this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.022);

    this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.1, 100);
    this.defaultCamPos = new THREE.Vector3(0, 3.3, 5.6);
    this.defaultTarget = new THREE.Vector3(0, 1.05, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.03;
    this.controls.minPolarAngle = 0.18;
    this.controls.minDistance = 2.4;
    this.controls.maxDistance = 12.0;

    this.updateResponsiveCamera(true);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xbae6fd, 0.85);
    this.hemiLight.position.set(0, 18, 0);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfffbeb, 0.98);
    this.dirLight.position.set(5, 11, 7);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    const d = 5.5;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.scene.add(this.dirLight);

    this.partyLight = new THREE.PointLight(0x38bdf8, 0.6, 14);
    this.partyLight.position.set(-3, 3.8, 2);
    this.scene.add(this.partyLight);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.isPointerDown = false;
    this.isUsingToolOnTarget = false;
    this.lastHitPoint = new THREE.Vector3(0, 1.2, 0);
  }

  // 依據螢幕長寬比（桌面橫向、平板、手機直向）動態計算最佳 3D 相機距離與焦點
  updateResponsiveCamera(resetCam = false) {
    const aspect = this.width / Math.max(1, this.height);
    if (aspect < 1.0) {
      // 手機或平板直向模式：自動拉遠相機距離，讓臉盆、木桌與祥祥完整呈現在上下 HUD 之間
      const zoomOut = Math.min(1.62, Math.max(1.05, 0.94 / Math.pow(aspect, 0.56)));
      this.defaultCamPos.set(0, 3.25 * Math.pow(zoomOut, 0.45), 5.6 * zoomOut);
      this.defaultTarget.set(0, 0.98, 0);
    } else if (this.height < 560) {
      // 手機橫向矮螢幕
      this.defaultCamPos.set(0, 3.1, 5.2);
      this.defaultTarget.set(0, 0.96, 0);
    } else {
      // 標準桌面與筆電比例
      this.defaultCamPos.set(0, 3.3, 5.6);
      this.defaultTarget.set(0, 1.05, 0);
    }

    if (resetCam) {
      this.camera.position.copy(this.defaultCamPos);
      if (this.controls) {
        this.controls.target.copy(this.defaultTarget);
        this.controls.update();
      }
    }
  }

  // ----------------------------------------
  // 初始化 Cannon.js 物理世界
  // ----------------------------------------
  initPhysics() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 10;

    this.groundMaterial = new CANNON.Material('groundMaterial');
    this.toyMaterial = new CANNON.Material('toyMaterial');

    this.world.addContactMaterial(new CANNON.ContactMaterial(this.groundMaterial, this.toyMaterial, {
      friction: 0.18,
      restitution: 0.65
    }));

    this.waterHeight = 0.34; // 低淺口寵物臉盆水面高度（不遮擋祥祥修長四肢！）
    this.targetWaterHeight = 0.34;
    this.physicsBodies = [];
  }

  // 繪製水盆外壁可愛圓潤字體貼圖：一面「雙溪高中」、另一面「SXHS」
  drawBasinLabelTexture() {
    if (!this.tubLabelCanvas) {
      this.tubLabelCanvas = document.createElement('canvas');
      this.tubLabelCanvas.width = 2048;
      this.tubLabelCanvas.height = 256;
    }
    const canvas = this.tubLabelCanvas;
    const ctx = canvas.getContext('2d');

    // 1. 水盆溫潤奶白底色與上下粉藍波浪飾條
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 2048, 256);

    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, 0, 2048, 34);
    ctx.fillRect(0, 222, 2048, 34);

    // 繪製可愛肉球腳印小裝飾函式
    const drawCutePaw = (cx, cy, scale, color, angle = 0) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.scale(scale, scale);
      ctx.fillStyle = color;
      // 掌心
      ctx.beginPath();
      ctx.ellipse(0, 6, 14, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      // 四顆小腳趾
      [[-14, -8], [-5, -14], [5, -14], [14, -8]].forEach(([tx, ty]) => {
        ctx.beginPath();
        ctx.ellipse(tx, ty, 5.2, 6.8, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    };

    // 繪製圓潤可愛貼紙立體字函式
    const drawCuteStickerWord = (text, centerX, centerY, fontSize, colors) => {
      ctx.save();
      ctx.font = `900 ${fontSize}px "Fredoka", "Noto Sans TC", "Microsoft JhengHei", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      const chars = Array.from(text);
      const spacing = fontSize * 0.98;
      const totalWidth = (chars.length - 1) * spacing;
      const startX = centerX - totalWidth / 2;

      chars.forEach((ch, idx) => {
        const x = startX + idx * spacing;
        const y = centerY + (idx % 2 === 0 ? -4 : 4);
        const tilt = (idx % 2 === 0 ? -0.045 : 0.045);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tilt);

        // 外層柔和立體陰影
        ctx.shadowColor = 'rgba(2, 132, 199, 0.28)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;

        // 可愛深海藍厚外框
        ctx.strokeStyle = '#0369a1';
        ctx.lineWidth = 22;
        ctx.strokeText(ch, 0, 0);

        // 純白貼紙內邊框
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 12;
        ctx.strokeText(ch, 0, 0);

        // 繽紛糖果漸層填色
        const grad = ctx.createLinearGradient(0, -fontSize * 0.5, 0, fontSize * 0.5);
        grad.addColorStop(0, colors[idx % colors.length][0]);
        grad.addColorStop(1, colors[idx % colors.length][1]);
        ctx.fillStyle = grad;
        ctx.fillText(ch, 0, 0);

        // 左上角可愛Q版高光白點
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.ellipse(-fontSize * 0.16, -fontSize * 0.22, 6, 3.2, -0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      ctx.restore();
    };

    // 糖果配色組
    const paletteFront = [
      ['#38bdf8', '#0284c7'],
      ['#fb7185', '#e11d48'],
      ['#facc15', '#ea580c'],
      ['#34d399', '#059669']
    ];
    const paletteBack = [
      ['#fb7185', '#e11d48'],
      ['#38bdf8', '#0284c7'],
      ['#a78bfa', '#7c3aed'],
      ['#facc15', '#d97706']
    ];

    // 正面 (u = 0.25 -> x = 512)：可愛字體「雙溪高中」
    drawCuteStickerWord('雙溪高中', 512, 130, 108, paletteFront);
    drawCutePaw(225, 130, 1.35, '#38bdf8', -0.28);
    drawCutePaw(799, 130, 1.35, '#fb7185', 0.28);

    // 背面 (u = 0.75 -> x = 1536)：可愛字體「SXHS」
    drawCuteStickerWord('SXHS', 1536, 130, 116, paletteBack);
    drawCutePaw(1265, 130, 1.35, '#facc15', -0.28);
    drawCutePaw(1807, 130, 1.35, '#34d399', 0.28);

    // 左右兩側過渡區點綴可愛小泡泡與腳印
    [0, 1024, 2048].forEach(bx => {
      drawCutePaw(bx, 128, 1.05, '#bae6fd', 0.15);
    });

    if (this.tubOuterTex) {
      this.tubOuterTex.needsUpdate = true;
    }
  }

  // ----------------------------------------
  // 建造場景：
  // 0. 雙溪高中翠綠陽光草地（含自然草葉紋理與立體草叢小花）
  // 1. 淺口可移開的寵物洗澡臉盆（一面印有可愛字體「雙溪高中」、一面「SXHS」）
  // 2. 乾爽木製美容長桌 + 藍黃太陽花格紋毯（100% 還原祥祥照片03.jpg！）
  // ----------------------------------------
  buildScene() {
    // 調整環境半球光地面反射色為柔和草地綠，避免地板反白
    if (this.hemiLight) {
      this.hemiLight.groundColor.setHex(0x86efac);
    }

    // 繪製無縫自然校園草地貼圖 (512 x 512)
    const grassCanvas = document.createElement('canvas');
    grassCanvas.width = 512;
    grassCanvas.height = 512;
    const gctx = grassCanvas.getContext('2d');

    // 草地溫暖翠綠基底
    gctx.fillStyle = '#5bb450';
    gctx.fillRect(0, 0, 512, 512);

    // 陽光斑駁草皮深淺自然區塊
    for (let i = 0; i < 90; i++) {
      const gx = Math.random() * 512;
      const gy = Math.random() * 512;
      const gr = 24 + Math.random() * 56;
      const grad = gctx.createRadialGradient(gx, gy, 4, gx, gy, gr);
      if (i % 2 === 0) {
        grad.addColorStop(0, 'rgba(132, 204, 22, 0.32)');
        grad.addColorStop(1, 'rgba(132, 204, 22, 0)');
      } else {
        grad.addColorStop(0, 'rgba(63, 130, 45, 0.28)');
        grad.addColorStop(1, 'rgba(63, 130, 45, 0)');
      }
      gctx.fillStyle = grad;
      gctx.beginPath();
      gctx.arc(gx, gy, gr, 0, Math.PI * 2);
      gctx.fill();
    }

    // 細緻繪製數千根雙溪草地草葉筆觸
    const bladeColors = ['#4d9e3f', '#65a30d', '#84cc16', '#3f822d', '#74b816', '#a3e635'];
    gctx.lineCap = 'round';
    for (let i = 0; i < 2600; i++) {
      const bx = Math.random() * 512;
      const by = Math.random() * 512;
      const bh = 5 + Math.random() * 9;
      const tilt = (Math.random() - 0.5) * 4.5;
      gctx.strokeStyle = bladeColors[i % bladeColors.length];
      gctx.lineWidth = 1.2 + Math.random() * 1.4;
      gctx.beginPath();
      gctx.moveTo(bx, by);
      gctx.quadraticCurveTo(bx + tilt * 0.5, by - bh * 0.5, bx + tilt, by - bh);
      gctx.stroke();
    }

    // 點綴細小三葉草與草地小白花點
    for (let i = 0; i < 45; i++) {
      const fx = Math.random() * 512;
      const fy = Math.random() * 512;
      gctx.fillStyle = i % 3 === 0 ? '#fef08a' : '#ffffff';
      gctx.beginPath();
      gctx.arc(fx, fy, 1.8 + Math.random() * 1.5, 0, Math.PI * 2);
      gctx.fill();
    }

    const floorTex = new THREE.CanvasTexture(grassCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(9, 9);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(32, 32),
      new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9, metalness: 0.0 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 在洗澡區外圍草地上點綴立體 3D 小草叢與校園小雛菊，增添草地生機感
    const tuftMat = new THREE.MeshStandardMaterial({ color: 0x4d9e3f, roughness: 0.8 });
    const flowerPetalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const flowerCenterMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });

    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
      const dist = 2.6 + Math.random() * 4.8;
      const tx = Math.cos(angle) * dist;
      const tz = Math.sin(angle) * dist;

      const tuftGroup = new THREE.Group();
      tuftGroup.position.set(tx, 0, tz);

      for (let b = 0; b < 3; b++) {
        const bladeGeo = new THREE.ConeGeometry(0.035, 0.18 + Math.random() * 0.08, 5);
        bladeGeo.translate(0, 0.09, 0);
        const blade = new THREE.Mesh(bladeGeo, tuftMat);
        blade.rotation.z = (b - 1) * 0.28;
        blade.rotation.y = b * 1.1;
        tuftGroup.add(blade);
      }

      if (i % 3 === 0) {
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), flowerPetalMat);
        flower.scale.set(1.4, 0.45, 1.4);
        flower.position.set(0.04, 0.15, 0.02);
        tuftGroup.add(flower);

        const pistil = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), flowerCenterMat);
        pistil.position.set(0.04, 0.165, 0.02);
        tuftGroup.add(pistil);
      }

      this.scene.add(tuftGroup);
    }

    const groundBody = new CANNON.Body({
      mass: 0,
      material: this.groundMaterial,
      shape: new CANNON.Plane()
    });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.world.addBody(groundBody);

    // =========================================================
    // A. 可隨時移開的「低淺口寵物洗澡臉盆」(Basin Group)
    // 外壁一面印有可愛圓體字「雙溪高中」，另一面印有「SXHS」！
    // =========================================================
    this.tubGroup = new THREE.Group();
    this.tubTargetX = 0;

    this.drawBasinLabelTexture();
    this.tubOuterTex = new THREE.CanvasTexture(this.tubLabelCanvas);
    this.tubOuterTex.anisotropy = 4;

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        this.drawBasinLabelTexture();
      });
    }

    // 水盆外壁（FrontSide 顯示「雙溪高中」與「SXHS」可愛塗裝）
    const tubOuterMat = new THREE.MeshStandardMaterial({
      map: this.tubOuterTex,
      roughness: 0.18,
      metalness: 0.04,
      side: THREE.FrontSide
    });
    const tubOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(1.55, 1.38, 0.42, 64, 1, true),
      tubOuterMat
    );
    tubOuter.position.y = 0.21;
    // 旋轉 -90 度使 u=0.25（雙溪高中）正對前方相機 (+Z)，u=0.75（SXHS）正對後方 (-Z)
    tubOuter.rotation.y = -Math.PI / 2;
    tubOuter.castShadow = true;
    tubOuter.receiveShadow = true;
    this.tubGroup.add(tubOuter);

    // 水盆內壁（BackSide 呈現乾淨清爽的粉藍白內壁，不透出外壁文字）
    const tubInnerMat = new THREE.MeshStandardMaterial({
      color: 0xf0f9ff,
      roughness: 0.2,
      metalness: 0.04,
      side: THREE.BackSide
    });
    const tubInner = new THREE.Mesh(
      new THREE.CylinderGeometry(1.545, 1.375, 0.42, 64, 1, true),
      tubInnerMat
    );
    tubInner.position.y = 0.21;
    tubInner.receiveShadow = true;
    this.tubGroup.add(tubInner);

    const tubRimMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.22
    });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.065, 16, 64), tubRimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.42;
    rim.castShadow = true;
    this.tubGroup.add(rim);

    const innerBottom = new THREE.Mesh(
      new THREE.CylinderGeometry(1.37, 1.37, 0.03, 48),
      new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.7 })
    );
    innerBottom.position.y = 0.015;
    innerBottom.receiveShadow = true;
    this.tubGroup.add(innerBottom);

    // 動態波浪水面網格
    this.waterGeo = new THREE.PlaneGeometry(2.9, 2.9, 32, 32);
    this.waterGeo.rotateX(-Math.PI / 2);
    const posAttr = this.waterGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const dist = Math.hypot(vx, vz);
      if (dist > 1.44) {
        const scale = 1.44 / dist;
        posAttr.setX(i, vx * scale);
        posAttr.setZ(i, vz * scale);
      }
    }
    this.waterGeo.computeVertexNormals();

    this.waterRipples = [];
    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.72,
      roughness: 0.08,
      metalness: 0.18
    });
    this.waterMesh = new THREE.Mesh(this.waterGeo, this.waterMat);
    this.waterMesh.position.y = this.waterHeight;
    this.tubGroup.add(this.waterMesh);

    this.scene.add(this.tubGroup);

    // =========================================================
    // B. 木製美容長床＋藍黃太陽花格紋毯
    // 當把祥祥移出臉盆或進入「暖風吹乾 / 摸頭哄睡」時，木桌會滑入中央（或祥祥跳上木桌），
    // 確保吹乾絕對不在有水的臉盆內！
    // =========================================================
    this.benchGroup = new THREE.Group();
    this.benchGroup.position.set(3.6, 0, 0); // 初始在右側待命，移出臉盆時滑至中央
    this.benchTargetX = 3.6;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.65 });
    // 木桌面
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.09, 1.55), woodMat);
    tableTop.position.y = 0.28;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    this.benchGroup.add(tableTop);

    // 四根木桌腳與橫樑
    [
      [-0.98, -0.62], [0.98, -0.62],
      [-0.98, 0.62], [0.98, 0.62]
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.12), woodMat);
      leg.position.set(lx, 0.14, lz);
      leg.castShadow = true;
      this.benchGroup.add(leg);
    });

    // 繪製藍白格紋＋黃色向日葵毛毯紋理
    const blanketCanvas = document.createElement('canvas');
    blanketCanvas.width = 512;
    blanketCanvas.height = 512;
    const bctx = blanketCanvas.getContext('2d');
    bctx.fillStyle = '#60a5fa';
    bctx.fillRect(0, 0, 512, 512);
    // 藍白格紋
    for (let x = 0; x < 512; x += 64) {
      for (let y = 0; y < 512; y += 64) {
        bctx.fillStyle = (x + y) % 128 === 0 ? '#eff6ff' : '#3b82f6';
        bctx.globalAlpha = 0.55;
        bctx.fillRect(x, y, 64, 64);
      }
    }
    bctx.globalAlpha = 1.0;
    // 黃色太陽花圖案
    bctx.fillStyle = '#fde047';
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      bctx.beginPath();
      bctx.ellipse(150 + Math.cos(a) * 65, 256 + Math.sin(a) * 65, 32, 16, a, 0, Math.PI * 2);
      bctx.fill();
    }
    bctx.fillStyle = '#eab308';
    bctx.beginPath();
    bctx.arc(150, 256, 38, 0, Math.PI * 2);
    bctx.fill();

    const blanketTex = new THREE.CanvasTexture(blanketCanvas);
    const blanketMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.06, 1.42),
      new THREE.MeshStandardMaterial({ map: blanketTex, roughness: 0.9 })
    );
    blanketMesh.position.y = 0.35;
    blanketMesh.receiveShadow = true;
    this.benchGroup.add(blanketMesh);

    this.scene.add(this.benchGroup);
  }

  // =========================================================
  // 把祥祥移出臉盆 / 切換臉盆與乾爽木桌 (核心功能！)
  // =========================================================
  moveDogOutOfBasin(showNotice = true) {
    if (this.dogState === 'running') {
      this.stopDogRunning(false);
    }
    this.basinRemoved = true;
    this.dogState = 'on_bench';

    // 臉盆向左側滑開並排空積水，乾爽的藍黃毯木桌滑入正中央！
    this.tubTargetX = -4.2;
    this.benchTargetX = 0;
    this.targetWaterHeight = 0.02;

    // 祥祥高興地跳躍站上乾爽木桌（高度 y = 0.36）
    this.jumpProgress = 1.0;
    this.sfx.playDogBark();
    this.unlockEasterEgg('out_basin');

    const basinBtnIcon = document.querySelector('#btn-basin-toggle i');
    if (basinBtnIcon) basinBtnIcon.className = 'fa-solid fa-soap';

    if (showNotice) {
      this.showFloatingText(new THREE.Vector3(0, 2.1, 0), '已將祥祥移出臉盆，站上乾爽藍黃毯木桌！', 'fa-bath');
    }
    this.updateHUD();
  }

  moveDogIntoBasin(showNotice = true) {
    if (this.dogState === 'running') {
      this.stopDogRunning(false);
    }
    this.basinRemoved = false;
    this.isLyingDown = false;
    this.dogState = 'in_basin';

    this.tubTargetX = 0;
    this.benchTargetX = 4.2;
    this.targetWaterHeight = 0.34;
    this.jumpProgress = 1.0;
    this.sfx.playSplash();

    const basinBtnIcon = document.querySelector('#btn-basin-toggle i');
    if (basinBtnIcon) basinBtnIcon.className = 'fa-solid fa-bath';

    if (showNotice) {
      this.showFloatingText(new THREE.Vector3(0, 2.1, 0), '祥祥回到淺口澡盆準備搓澡沖水！', 'fa-shower');
    }
    this.updateHUD();
  }

  toggleBasinState() {
    if (this.basinRemoved || this.dogState === 'on_bench') {
      this.moveDogIntoBasin(true);
    } else {
      this.moveDogOutOfBasin(true);
    }
  }

  // 在水面激起真實 3D 波紋
  addWaterRipple(x, z, strength = 0.05) {
    const localX = x - this.tubGroup.position.x;
    if (Math.hypot(localX, z) > 1.45) return;
    this.waterRipples.push({ x: localX, z, radius: 0.05, strength, age: 0 });
    if (this.waterRipples.length > 10) {
      this.waterRipples.shift();
    }
  }

  updateWaterSurface(dt, time) {
    this.waterHeight += (this.targetWaterHeight - this.waterHeight) * dt * 4;
    this.waterMesh.position.y = this.waterHeight;
    this.waterMesh.visible = this.waterHeight > 0.05;

    for (let i = this.waterRipples.length - 1; i >= 0; i--) {
      const r = this.waterRipples[i];
      r.age += dt;
      r.radius += dt * 1.8;
      r.strength *= 0.94;
      if (r.age > 1.6 || r.strength < 0.003) {
        this.waterRipples.splice(i, 1);
      }
    }

    const posAttr = this.waterGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      if (Math.hypot(vx, vz) >= 1.4) {
        posAttr.setY(i, 0);
        continue;
      }
      let y = Math.sin(vx * 3.2 + time * 2.6) * 0.009 + Math.cos(vz * 3.2 + time * 2.2) * 0.009;
      for (let j = 0; j < this.waterRipples.length; j++) {
        const r = this.waterRipples[j];
        const d = Math.hypot(vx - r.x, vz - r.z);
        const diff = d - r.radius;
        if (Math.abs(diff) < 0.32) {
          y += Math.cos(diff * 16.0) * r.strength * (1 - Math.abs(diff) / 0.32);
        }
      }
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
    this.waterGeo.computeVertexNormals();
  }

  // =========================================================
  // 建立討喜可愛、高辨識度且一體成型的「雙溪高中校狗祥祥」3D 模型
  // 採用單一平滑流線網格 + 自訂 UV 貼圖繪製花色，徹底消除拼湊感與恐怖谷效應！
  // 特徵：
  // 1. 一體成型平滑流線軀幹：白胸小斑點 + 背部黑鞍斑 + 後腰側招牌白斑帶 + 黑臀
  // 2. 溫柔討喜的五官：黑頭配額頭中央細白線、柔和白灰吻端、雙高光無辜大眼、微笑粉紅小舌頭（無尖牙或突兀下顎）
  // 3. 圓潤挺拔的大立耳 + 米色編織項圈與小金牌
  // 4. 四肢平滑圓潤斑點狗腿與可愛小肉球腳掌
  // 5. 自然上揚的黑色長尾巴 + 蓬鬆可愛的白色毛筆尾尖
  // =========================================================
  buildXiangXiang() {
    this.dogGroup = new THREE.Group();
    this.dogBodyRoot = new THREE.Group();
    this.dogGroup.add(this.dogBodyRoot);

    // ---------------------------------------------------------
    // 1. 繪製「一體成型軀幹」專屬側向投影花色貼圖 (1024 x 512)
    // X 軸：0(尾部) -> 1024(前胸)；Y 軸：0(背部頂端) -> 512(腹部底端)
    // ---------------------------------------------------------
    const bodyCanvas = document.createElement('canvas');
    bodyCanvas.width = 1024;
    bodyCanvas.height = 512;
    const bctx = bodyCanvas.getContext('2d');

    // 底色：溫暖純白毛色
    bctx.fillStyle = '#f8fafc';
    bctx.fillRect(0, 0, 1024, 512);

    // 在白毛區域撒上討喜圓潤的米克斯小斑點 (前胸 x > 620 與腹部 y > 360)
    for (let i = 0; i < 240; i++) {
      const sx = Math.random() * 1024;
      const sy = Math.random() * 512;
      if (sx > 620 || sy > 350 || (sx > 180 && sx < 320)) {
        bctx.fillStyle = i % 2 === 0 ? '#475569' : '#64748b';
        bctx.beginPath();
        bctx.arc(sx, sy, 3.5 + Math.random() * 4.5, 0, Math.PI * 2);
        bctx.fill();
      }
    }

    // 繪製背部與側腹平滑的大黑鞍斑 + 黑色後臀 (柔和炭黑 #1e2028 讓 3D 光影更柔和立體)
    bctx.fillStyle = '#1e2028';
    // 中段黑鞍斑 (x: 290 ~ 680)
    bctx.beginPath();
    bctx.moveTo(285, 0);
    bctx.lineTo(695, 0);
    bctx.quadraticCurveTo(670, 260, 620, 385);
    bctx.quadraticCurveTo(450, 415, 305, 360);
    bctx.closePath();
    bctx.fill();

    // 後臀黑斑 (x: 0 ~ 245)，中間留出 x: 215 ~ 295 作為招牌「後腰側白色斑帶」！
    // 延伸至底部 y=512，讓臀部下方與後大腿根部黑毛完全自然銜接無白縫
    bctx.beginPath();
    bctx.moveTo(0, 0);
    bctx.lineTo(245, 0);
    bctx.quadraticCurveTo(212, 220, 205, 512);
    bctx.lineTo(0, 512);
    bctx.closePath();
    bctx.fill();

    const bodyTex = new THREE.CanvasTexture(bodyCanvas);

    // ---------------------------------------------------------
    // 2. 繪製四肢專用「白底圓點」與「後腿上黑下白自然漸層過渡」貼圖
    // ---------------------------------------------------------
    const frontLegCanvas = document.createElement('canvas');
    frontLegCanvas.width = 256;
    frontLegCanvas.height = 256;
    const flctx = frontLegCanvas.getContext('2d');
    flctx.fillStyle = '#f8fafc';
    flctx.fillRect(0, 0, 256, 256);
    flctx.fillStyle = '#475569';
    for (let i = 0; i < 55; i++) {
      flctx.beginPath();
      flctx.arc(Math.random() * 256, Math.random() * 256, 2.5 + Math.random() * 3.5, 0, Math.PI * 2);
      flctx.fill();
    }
    const frontLegTex = new THREE.CanvasTexture(frontLegCanvas);

    const backLegCanvas = document.createElement('canvas');
    backLegCanvas.width = 256;
    backLegCanvas.height = 256;
    const blctx = backLegCanvas.getContext('2d');
    blctx.fillStyle = '#f8fafc';
    blctx.fillRect(0, 0, 256, 256);
    blctx.fillStyle = '#475569';
    for (let i = 0; i < 48; i++) {
      blctx.beginPath();
      blctx.arc(Math.random() * 256, 125 + Math.random() * 125, 2.5 + Math.random() * 3.5, 0, Math.PI * 2);
      blctx.fill();
    }
    // 上半部大腿為黑毛，膝蓋交界處加入自然毛流鋸齒過渡，不再生硬截斷
    blctx.fillStyle = '#1e2028';
    blctx.beginPath();
    blctx.moveTo(0, 0);
    blctx.lineTo(256, 0);
    blctx.lineTo(256, 118);
    for (let x = 256; x >= 0; x -= 16) {
      const waveY = 118 + Math.sin(x * 0.12) * 7;
      blctx.lineTo(x, waveY);
    }
    blctx.closePath();
    blctx.fill();
    const backLegTex = new THREE.CanvasTexture(backLegCanvas);

    this.matBody = new THREE.MeshStandardMaterial({ map: bodyTex, roughness: 0.72 });
    this.matFrontLeg = new THREE.MeshStandardMaterial({ map: frontLegTex, roughness: 0.75 });
    this.matBackLeg = new THREE.MeshStandardMaterial({ map: backLegTex, roughness: 0.75 });
    this.matBlackFur = new THREE.MeshStandardMaterial({ color: 0x1e2028, roughness: 0.68 });
    this.matPureWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
    this.matInnerEar = new THREE.MeshStandardMaterial({ color: 0xfda4af, roughness: 0.75 });
    this.matNose = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.18, metalness: 0.1 });
    this.matCollar = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45 });
    this.matGold = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.2 });
    this.matTongue = new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.35 });
    this.matEye = new THREE.MeshStandardMaterial({ color: 0x1c120c, roughness: 0.08 });
    this.matEyeLight = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // =========================================================
    // A. 一體成型平滑流線軀幹（無任何突兀接縫！）
    // 透過對高細分球體進行平滑數學塑形，打造飽滿前胸、微收腰身與圓潤臀部
    // =========================================================
    const torsoGeo = new THREE.SphereGeometry(1, 56, 40);
    const pos = torsoGeo.attributes.position;
    const uv = torsoGeo.attributes.uv;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i); // -1(尾端) ~ +1(胸端)

      // 拉長為流線狗身比例
      const lengthZ = z * 0.74;

      // 前胸(z > 0)寬闊飽滿，後腰(z < 0)柔和收腰
      const waistFactor = z >= 0
        ? 1.0 + 0.08 * Math.sin(z * Math.PI * 0.5)
        : 0.88 + 0.12 * Math.cos(z * Math.PI * 0.6);

      let widthX = x * 0.36 * waistFactor;
      let heightY = y * 0.38 * waistFactor;

      // 前胸自然下垂深胸感，後腹柔和收腰並飽滿包覆後臀大腿根部
      if (y < 0) {
        if (z > 0.1) {
          heightY *= 1.12;
        } else if (z < -0.1) {
          heightY *= 0.90;
        }
      }
      // 背線柔和微拱
      const backOffset = Math.cos(z * 1.2) * 0.03;

      pos.setXYZ(i, widthX, heightY + backOffset, lengthZ);

      // 側向投影 UV：讓左右兩側完美對應我們繪製的祥祥花色貼圖
      const uCoord = Math.max(0.01, Math.min(0.99, (z + 1.0) * 0.5));
      const vCoord = Math.max(0.01, Math.min(0.99, (y + 1.0) * 0.5));
      uv.setXY(i, uCoord, vCoord);
    }
    pos.needsUpdate = true;
    uv.needsUpdate = true;
    torsoGeo.computeVertexNormals();

    this.torsoMesh = new THREE.Mesh(torsoGeo, this.matBody);
    this.torsoMesh.position.set(0, 1.04, 0);
    this.torsoMesh.castShadow = true;
    this.torsoMesh.receiveShadow = true;
    this.dogBodyRoot.add(this.torsoMesh);

    // =========================================================
    // B. 圓潤挺拔的頸部、鮮豔紅色項圈與討喜可愛的頭部
    // =========================================================
    this.neckPivot = new THREE.Group();
    this.neckPivot.position.set(0, 1.16, 0.52);
    this.dogBodyRoot.add(this.neckPivot);

    // 平滑圓潤的脖子
    const neckGeo = new THREE.CylinderGeometry(0.21, 0.28, 0.42, 28);
    const neckMesh = new THREE.Mesh(neckGeo, this.matBlackFur);
    neckMesh.position.set(0, 0.15, 0.08);
    neckMesh.rotation.x = 0.38;
    neckMesh.castShadow = true;
    this.neckPivot.add(neckMesh);

    // 脖子前側白毛胸領
    const neckFrontGeo = new THREE.SphereGeometry(0.22, 20, 16);
    neckFrontGeo.scale(0.82, 1.15, 0.65);
    const neckFront = new THREE.Mesh(neckFrontGeo, this.matFrontLeg);
    neckFront.position.set(0, 0.08, 0.16);
    neckFront.rotation.x = 0.38;
    this.neckPivot.add(neckFront);

    // 祥祥鮮豔紅色項圈 + 可愛小金牌
    const collarGroup = new THREE.Group();
    collarGroup.position.set(0, 0.12, 0.09);
    collarGroup.rotation.x = Math.PI / 2 + 0.38;
    const collarTorus = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.048, 18, 36), this.matCollar);
    collarTorus.castShadow = true;
    collarGroup.add(collarTorus);

    const goldBell = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), this.matGold);
    goldBell.position.set(0, 0.265, 0.02);
    collarGroup.add(goldBell);
    this.neckPivot.add(collarGroup);

    // 頭部主群組
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.38, 0.20);
    this.neckPivot.add(this.headGroup);

    // 圓潤飽滿的可愛黑頭顱
    const headGeo = new THREE.SphereGeometry(0.31, 32, 28);
    headGeo.scale(0.96, 0.94, 1.04);
    this.headMesh = new THREE.Mesh(headGeo, this.matBlackFur);
    this.headMesh.castShadow = true;
    this.headGroup.add(this.headMesh);

    // 照片02、03招牌：額頭正中央可愛細白線
    const blazeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.16, 12);
    const blazeMesh = new THREE.Mesh(blazeGeo, this.matPureWhite);
    blazeMesh.position.set(0, 0.11, 0.285);
    blazeMesh.rotation.x = -0.42;
    this.headGroup.add(blazeMesh);

    // 圓潤討喜的雙層漸變狗吻部（黑底銜接前端柔和白毛，無突兀接縫或恐怖尖牙！）
    const snoutBaseGeo = new THREE.SphereGeometry(0.20, 28, 24);
    snoutBaseGeo.scale(0.88, 0.76, 1.25);
    const snoutBase = new THREE.Mesh(snoutBaseGeo, this.matBlackFur);
    snoutBase.position.set(0, -0.05, 0.24);
    snoutBase.castShadow = true;
    this.headGroup.add(snoutBase);

    // 吻端柔和白毛區（照片01、03嘴尖白灰斑點毛）
    const muzzleWhiteGeo = new THREE.SphereGeometry(0.165, 24, 20);
    muzzleWhiteGeo.scale(0.90, 0.75, 1.12);
    const muzzleWhite = new THREE.Mesh(muzzleWhiteGeo, this.matFrontLeg);
    muzzleWhite.position.set(0, -0.055, 0.34);
    this.headGroup.add(muzzleWhite);

    // 圓潤愛心感黑鼻頭
    const noseGeo = new THREE.SphereGeometry(0.062, 18, 16);
    noseGeo.scale(1.18, 0.85, 0.95);
    const noseMesh = new THREE.Mesh(noseGeo, this.matNose);
    noseMesh.position.set(0, 0.01, 0.51);
    this.headGroup.add(noseMesh);

    // 討喜可愛的粉紅小舌頭（無尖牙，開心時微微吐出）
    const tongueGeo = new THREE.SphereGeometry(0.068, 16, 14);
    tongueGeo.scale(0.85, 0.35, 1.35);
    this.tongue = new THREE.Mesh(tongueGeo, this.matTongue);
    this.tongue.position.set(0, -0.145, 0.39);
    this.tongue.rotation.x = 0.25;
    this.headGroup.add(this.tongue);

    // 溫柔無辜的大眼睛（貼合臉部弧度 + 雙星高光 + 可愛淺色眉毛點，徹底告別凸眼恐怖感！）
    this.eyes = [];
    [-1, 1].forEach(side => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * 0.145, 0.065, 0.265);
      eyeGroup.rotation.y = side * 0.28;

      const eyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.052, 18, 18), this.matEye);
      eyeBall.scale.set(0.95, 1.05, 0.55); // 扁平圓潤貼合臉龐，不外凸
      eyeGroup.add(eyeBall);

      // 主星高光（大白點）
      const glintBig = new THREE.Mesh(new THREE.SphereGeometry(0.017, 10, 10), this.matEyeLight);
      glintBig.position.set(side * 0.012, 0.018, 0.028);
      eyeGroup.add(glintBig);

      // 副星高光（小白點，增加靈動感）
      const glintSmall = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), this.matEyeLight);
      glintSmall.position.set(-side * 0.014, -0.015, 0.028);
      eyeGroup.add(glintSmall);

      this.headGroup.add(eyeGroup);
      this.eyes.push(eyeGroup);
    });

    // 圓潤挺拔的台灣犬可愛大立耳（含柔和粉紅內耳）
    this.ears = [];
    [-1, 1].forEach(side => {
      const earGroup = new THREE.Group();
      earGroup.position.set(side * 0.19, 0.21, -0.02);
      earGroup.rotation.set(0.06, side * 0.2, -side * 0.22);

      // 外耳（圓潤錐形）
      const outerEarGeo = new THREE.ConeGeometry(0.135, 0.38, 24);
      outerEarGeo.translate(0, 0.17, 0);
      outerEarGeo.scale(0.85, 1.0, 0.42);
      const outerEar = new THREE.Mesh(outerEarGeo, this.matBlackFur);
      outerEar.castShadow = true;
      earGroup.add(outerEar);

      // 耳尖圓球修飾（讓耳尖圓潤不刺眼）
      const earTip = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), this.matBlackFur);
      earTip.position.set(0, 0.35, 0);
      earGroup.add(earTip);

      // 粉嫩內耳
      const innerEarGeo = new THREE.ConeGeometry(0.085, 0.26, 16);
      innerEarGeo.translate(0, 0.13, 0);
      innerEarGeo.scale(0.75, 1.0, 0.2);
      const innerEar = new THREE.Mesh(innerEarGeo, this.matInnerEar);
      innerEar.position.set(0, 0.02, 0.035);
      earGroup.add(innerEar);

      this.headGroup.add(earGroup);
      this.ears.push(earGroup);
    });

    // 彩蛋 1：頭頂 3D 巨型泡泡皇冠帽
    this.bubbleCrownGroup = new THREE.Group();
    this.bubbleCrownGroup.position.set(0, 0.33, 0.02);
    this.bubbleCrownGroup.visible = false;
    const crownFoamMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.12,
      clearcoat: 1.0
    });
    [
      [0, 0, 0, 0.17],
      [-0.13, -0.02, 0.03, 0.12],
      [0.13, -0.02, 0.03, 0.12],
      [0, 0.13, 0.02, 0.12],
      [0, 0.23, 0.02, 0.075]
    ].forEach(([bx, by, bz, br]) => {
      const b = new THREE.Mesh(new THREE.SphereGeometry(br, 14, 12), crownFoamMat);
      b.position.set(bx, by, bz);
      this.bubbleCrownGroup.add(b);
    });
    this.headGroup.add(this.bubbleCrownGroup);

    // 彩蛋 3：祥祥嘴裡叼著的「照片02紅綠火箭玩具」
    this.mouthRocket = this.createRocketMesh();
    this.mouthRocket.scale.setScalar(0.65);
    this.mouthRocket.rotation.z = Math.PI / 2;
    this.mouthRocket.position.set(0, -0.11, 0.48);
    this.mouthRocket.visible = false;
    this.headGroup.add(this.mouthRocket);

    // =========================================================
    // C. 一體成型流線雕塑狗腿與可愛腳掌
    // 消除突兀的外凸球形關節與圓柱頂蓋白邊，讓大腿自然融入軀幹臀部與前胸！
    // =========================================================
    this.legs = {};

    // 建立單一無縫流線前腿網格
    const createSculptedFrontLegGeo = () => {
      const geo = new THREE.SphereGeometry(1, 24, 24);
      const p = geo.attributes.position;
      const uvs = geo.attributes.uv;
      for (let i = 0; i < p.count; i++) {
        const nx = p.getX(i);
        const ny = p.getY(i);
        const nz = p.getZ(i);
        const t = (1 - ny) * 0.5; // 0(肩頂融入胸腔) -> 1(腳踝)

        const py = 0.05 - t * 0.87;
        const capFade = Math.sin(Math.acos(Math.max(-1, Math.min(1, ny))));
        const radiusProfile = (0.094 * (1 - t * 0.30)) * Math.pow(capFade, 0.22);
        const px = nx * radiusProfile;
        const pz = nz * radiusProfile * (1.08 - t * 0.08);

        p.setXYZ(i, px, py, pz);
        const u = (Math.atan2(nx, nz) / (Math.PI * 2)) + 0.5;
        uvs.setXY(i, u, 1 - t);
      }
      p.needsUpdate = true;
      uvs.needsUpdate = true;
      geo.computeVertexNormals();
      return geo;
    };

    // 建立單一無縫流線後腿網格（具真實狗狗大腿肌肉線條與微彎飛節弧度，頂部完全包入黑臀）
    const createSculptedHindLegGeo = () => {
      const geo = new THREE.SphereGeometry(1, 28, 28);
      const p = geo.attributes.position;
      const uvs = geo.attributes.uv;
      for (let i = 0; i < p.count; i++) {
        const nx = p.getX(i);
        const ny = p.getY(i);
        const nz = p.getZ(i);
        const t = (1 - ny) * 0.5; // 0(髖部深嵌黑臀內) -> 1(後腳踝)

        const py = 0.07 - t * 0.91;
        const capFade = Math.sin(Math.acos(Math.max(-1, Math.min(1, ny))));
        const endRound = Math.pow(capFade, 0.20);

        // 大腿上半段 (t < 0.46) 圓潤流線，膝蓋至飛節 (t >= 0.46) 平滑收細為修長小腿
        const thighBlend = Math.max(0, 1 - Math.pow(t / 0.52, 1.6));
        const rx = (0.066 + 0.042 * thighBlend) * endRound;
        const rz = (0.066 + 0.068 * thighBlend) * endRound;

        // 狗狗後腿自然的微 S 型飛節曲線（大腿微向前、飛節微向後、腳掌回正）
        const hockCurveZ =
          Math.sin(t * Math.PI) * 0.022 -
          Math.sin(Math.max(0, (t - 0.32) / 0.68) * Math.PI) * 0.042;

        const px = nx * rx;
        const pz = nz * rz + hockCurveZ;

        p.setXYZ(i, px, py, pz);
        const u = (Math.atan2(nx, nz) / (Math.PI * 2)) + 0.5;
        uvs.setXY(i, u, 1 - t);
      }
      p.needsUpdate = true;
      uvs.needsUpdate = true;
      geo.computeVertexNormals();
      return geo;
    };

    const frontLegGeo = createSculptedFrontLegGeo();
    const hindLegGeo = createSculptedHindLegGeo();

    // 前腿 (FL, FR)：自然嵌入前胸下方，白底細黑斑點
    ['FL', 'FR'].forEach((key, idx) => {
      const side = idx === 0 ? -1 : 1;
      const legPivot = new THREE.Group();
      legPivot.position.set(side * 0.175, 0.90, 0.42);

      const legShaft = new THREE.Mesh(frontLegGeo, this.matFrontLeg);
      legShaft.castShadow = true;
      legPivot.add(legShaft);

      // 圓潤可愛狗腳掌
      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.082, 16, 14), this.matFrontLeg);
      paw.scale.set(0.95, 0.60, 1.26);
      paw.position.set(0, -0.82, 0.035);
      legPivot.add(paw);

      this.dogBodyRoot.add(legPivot);
      this.legs[key] = legPivot;
    });

    // 後腿 (BL, BR)：自然由黑色後臀流線延伸而下，上半黑大腿平滑過渡至下半白斑點小腿
    ['BL', 'BR'].forEach((key, idx) => {
      const side = idx === 0 ? -1 : 1;
      const legPivot = new THREE.Group();
      legPivot.position.set(side * 0.165, 0.92, -0.43);

      const legShaft = new THREE.Mesh(hindLegGeo, this.matBackLeg);
      legShaft.castShadow = true;
      legPivot.add(legShaft);

      // 圓潤可愛後腳掌
      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.082, 16, 14), this.matFrontLeg);
      paw.scale.set(0.95, 0.60, 1.26);
      paw.position.set(0, -0.84, 0.02);
      legPivot.add(paw);

      this.dogBodyRoot.add(legPivot);
      this.legs[key] = legPivot;
    });

    // =========================================================
    // D. 照片01招牌特徵：自然上揚的黑色長尾 + 圓潤蓬鬆的白色尾尖
    // =========================================================
    this.tailGroup = new THREE.Group();
    this.tailGroup.position.set(0, 1.12, -0.68);
    this.dogBodyRoot.add(this.tailGroup);

    this.tailPivot = new THREE.Group();
    this.tailGroup.add(this.tailPivot);

    const blackTailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.14, -0.16),
      new THREE.Vector3(0, 0.36, -0.24),
      new THREE.Vector3(0, 0.58, -0.20)
    ]);
    const blackTailGeo = new THREE.TubeGeometry(blackTailCurve, 20, 0.052, 14, false);
    const blackTailMesh = new THREE.Mesh(blackTailGeo, this.matBlackFur);
    blackTailMesh.castShadow = true;
    this.tailPivot.add(blackTailMesh);

    // 蓬鬆圓潤的白色毛筆尾尖
    const whiteTipMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.072, 16, 16),
      this.matPureWhite
    );
    whiteTipMesh.scale.set(0.9, 1.85, 0.9);
    whiteTipMesh.position.set(0, 0.68, -0.19);
    whiteTipMesh.rotation.x = 0.15;
    this.tailPivot.add(whiteTipMesh);

    this.scene.add(this.dogGroup);
  }

  // 建立祥祥最心愛的紅綠火箭玩具網格
  createRocketMesh() {
    const rocketGroup = new THREE.Group();
    const mintMat = new THREE.MeshStandardMaterial({ color: 0x6ee7b7, roughness: 0.65 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 });
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.5 });
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.8 });

    const fusel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.32, 16), mintMat);
    fusel.castShadow = true;
    rocketGroup.add(fusel);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.17, 16), redMat);
    nose.position.y = 0.24;
    rocketGroup.add(nose);

    const win = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), yellowMat);
    win.rotation.x = Math.PI / 2;
    win.position.set(0, 0.04, 0.12);
    rocketGroup.add(win);

    [-0.13, 0.13].forEach(x => {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.04), redMat);
      fin.position.set(x, -0.05, 0);
      rocketGroup.add(fin);
    });

    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.045, 0.20, 10), ropeMat);
    rope.position.y = -0.24;
    rocketGroup.add(rope);

    return rocketGroup;
  }

  // =========================================================
  // 校狗祥祥全場草地自由狂奔系統 (Free-Roaming Zoomies!)
  // =========================================================
  pickNewRunTarget() {
    const aspect = this.width / Math.max(1, this.height);
    const maxX = aspect < 0.8 ? 1.95 : (aspect < 1.2 ? 2.75 : 3.45);
    const minZ = -2.75;
    const maxZ = 2.25;

    const curX = this.dogGroup.position.x;
    const curZ = this.dogGroup.position.z;

    let bestX = (Math.random() < 0.5 ? -1 : 1) * (1.7 + Math.random() * (maxX - 1.7));
    let bestZ = minZ + Math.random() * (maxZ - minZ);

    for (let i = 0; i < 16; i++) {
      const candX = (Math.random() * 2 - 1) * maxX;
      const candZ = minZ + Math.random() * (maxZ - minZ);
      const distCenter = Math.hypot(candX, candZ);
      const distCurrent = Math.hypot(candX - curX, candZ - curZ);

      // 避開正中央臉盆/木床區域，並挑選距離當前位置夠遠的草地隨機目標點，讓祥祥全場到處跑
      if (distCenter > 1.68 && distCurrent > 1.55) {
        bestX = candX;
        bestZ = candZ;
        break;
      }
    }

    this.runTarget.set(bestX, 0, bestZ);
    this.runSpeed = 3.8 + Math.random() * 1.8;
    this.runTargetTimer = 0.85 + Math.random() * 1.35;
  }

  startDogRunning() {
    if (this.dogState === 'running') return;
    this.isLyingDown = false;
    this.dogState = 'running';
    this.runTime = 0;
    this.jumpProgress = 1.0;

    // 隨機選擇一個初始跳出方向，直接往草地衝刺
    const initAngle = Math.random() * Math.PI * 2;
    this.pickNewRunTarget();
    this.runVel.set(Math.sin(initAngle) * 4.2, 0, Math.cos(initAngle) * 4.2);

    this.sfx.playDogBark();
    this.unlockEasterEgg('zoomies');

    document.getElementById('escape-alert').classList.add('active');
    const runBtnIcon = document.querySelector('#btn-run-toggle i');
    if (runBtnIcon) runBtnIcon.className = 'fa-solid fa-bone';

    this.showFloatingText(this.dogGroup.position.clone().add(new THREE.Vector3(0, 1.8, 0)), '汪汪！祥祥跳出臉盆全場到處狂奔啦！', 'fa-paw');
  }

  stopDogRunning(withTreat = true) {
    if (this.dogState !== 'running') return;
    document.getElementById('escape-alert').classList.remove('active');
    const runBtnIcon = document.querySelector('#btn-run-toggle i');
    if (runBtnIcon) runBtnIcon.className = 'fa-solid fa-person-running';

    this.dogState = this.basinRemoved ? 'on_bench' : 'in_basin';
    this.dogGroup.position.set(0, this.basinRemoved ? 0.36 : 0, 0);
    this.dogGroup.rotation.set(0, 0, 0);
    this.runVel.set(0, 0, 0);
    this.jumpProgress = 1.0;

    // 恢復四肢站立角度
    Object.values(this.legs).forEach(leg => {
      leg.rotation.set(0, 0, 0);
    });

    this.sfx.playDogBark();
    if (withTreat) {
      this.happiness = 100;
      this.showFloatingText(new THREE.Vector3(0, 2.0, 0), '祥祥乖乖回來了！好棒！', 'fa-heart');
    }
    this.updateHUD();
  }

  // ----------------------------------------
  // 3. 建立 3D 手持工具游標 (跟隨滑鼠移動與傾斜)
  // ----------------------------------------
  build3DCursorTools() {
    this.cursorRoot = new THREE.Group();
    this.scene.add(this.cursorRoot);
    this.toolMeshes = {};

    // (A) 3D 黃色海綿
    const spongeGroup = new THREE.Group();
    const spongeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.16, 0.26),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.85 })
    );
    spongeGroup.add(spongeMesh);
    this.toolMeshes.sponge = spongeGroup;
    this.cursorRoot.add(spongeGroup);

    // (B) 3D 銀色蓮蓬頭
    const showerGroup = new THREE.Group();
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.18 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.42, 14), chromeMat);
    handle.rotation.x = Math.PI / 3;
    handle.position.set(0, 0.14, 0.16);
    showerGroup.add(handle);
    const headDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.08, 20), chromeMat);
    headDisk.rotation.x = -Math.PI / 6;
    showerGroup.add(headDisk);
    this.toolMeshes.shower = showerGroup;
    this.cursorRoot.add(showerGroup);

    // (C) 3D 粉紅香皂
    const soapGroup = new THREE.Group();
    soapGroup.add(new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.11, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.2 })
    ));
    this.toolMeshes.soap = soapGroup;
    this.cursorRoot.add(soapGroup);

    // (D) 3D 專業吹風機
    const dryerGroup = new THREE.Group();
    const dryerMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, metalness: 0.2 });
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.38, 18), dryerMat);
    barrel.rotation.x = Math.PI / 2;
    dryerGroup.add(barrel);
    const dryerHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.28, 14), dryerMat);
    dryerHandle.position.set(0, -0.18, 0.06);
    dryerHandle.rotation.x = 0.25;
    dryerGroup.add(dryerHandle);
    this.toolMeshes.dryer = dryerGroup;
    this.cursorRoot.add(dryerGroup);

    // (E) 3D 溫柔撫摸小手 (摸頭哄睡：以可愛立體手掌與五指取代原本的粉紅橢圓)
    const petGroup = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xffd2b3,
      roughness: 0.52,
      metalness: 0.02
    });
    const cuffMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.45
    });
    const cuffTrimMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5
    });

    // 圓潤飽滿的手掌心與手背
    const palmGeo = new THREE.SphereGeometry(0.115, 22, 18);
    palmGeo.scale(1.12, 0.44, 1.15);
    const palmMesh = new THREE.Mesh(palmGeo, skinMat);
    palmMesh.position.set(0, 0, 0.03);
    palmMesh.castShadow = true;
    petGroup.add(palmMesh);

    // 四根微彎的可愛手指（食指、中指、無名指、小指）
    const fingerSpecs = [
      { x: -0.078, len: 0.115, r: 0.024, yaw: 0.09 },
      { x: -0.026, len: 0.132, r: 0.025, yaw: 0.03 },
      { x: 0.026,  len: 0.122, r: 0.024, yaw: -0.03 },
      { x: 0.076,  len: 0.096, r: 0.021, yaw: -0.10 }
    ];
    fingerSpecs.forEach(f => {
      const fGroup = new THREE.Group();
      fGroup.position.set(f.x, -0.004, -0.07);
      fGroup.rotation.set(-0.24, f.yaw, 0);

      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(f.r * 0.9, f.r, f.len, 14),
        skinMat
      );
      shaft.rotation.x = Math.PI / 2;
      shaft.position.z = -f.len * 0.5;
      shaft.castShadow = true;
      fGroup.add(shaft);

      const tip = new THREE.Mesh(new THREE.SphereGeometry(f.r * 0.92, 12, 12), skinMat);
      tip.position.z = -f.len;
      fGroup.add(tip);

      petGroup.add(fGroup);
    });

    // 圓潤的大拇指
    const thumbGroup = new THREE.Group();
    thumbGroup.position.set(-0.105, -0.008, 0.045);
    thumbGroup.rotation.set(-0.15, 0.58, 0);
    const thumbShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.028, 0.095, 14),
      skinMat
    );
    thumbShaft.rotation.x = Math.PI / 2;
    thumbShaft.position.z = -0.048;
    thumbShaft.castShadow = true;
    thumbGroup.add(thumbShaft);
    const thumbTip = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 12), skinMat);
    thumbTip.position.z = -0.095;
    thumbGroup.add(thumbTip);
    petGroup.add(thumbGroup);

    // 手腕與可愛雙溪藍白袖口
    const wristMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.075, 0.10, 16), skinMat);
    wristMesh.rotation.x = Math.PI / 2 - 0.22;
    wristMesh.position.set(0, 0.018, 0.16);
    petGroup.add(wristMesh);

    const cuffTrim = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.018, 12, 24), cuffTrimMat);
    cuffTrim.rotation.x = 0.22;
    cuffTrim.position.set(0, 0.025, 0.19);
    petGroup.add(cuffTrim);

    const cuffSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.086, 0.096, 0.11, 18), cuffMat);
    cuffSleeve.rotation.x = Math.PI / 2 - 0.22;
    cuffSleeve.position.set(0, 0.038, 0.24);
    cuffSleeve.castShadow = true;
    petGroup.add(cuffSleeve);

    this.toolMeshes.pet = petGroup;
    this.cursorRoot.add(petGroup);

    this.updateCursorToolVisibility();
  }

  updateCursorToolVisibility() {
    Object.keys(this.toolMeshes).forEach(key => {
      this.toolMeshes[key].visible = (key === this.activeTool) && this.isPointerInCanvas;
    });
  }

  // ----------------------------------------
  // 4. 自然貼合毛皮的「雙溪校園泥漬、草屑與真實葉脈落葉」系統
  //    徹底告別突兀的 3D 圓球與平板方塊！
  //    採用：
  //    (1) 貼合流線軀幹與四肢曲面的網格投影貼花 (Surface-Conforming Curved Decals)
  //    (2) 多層次有機泥巴噴濺、乾涸黃土邊緣與毛流刷痕程序貼圖
  //    (3) 具真實葉柄、主脈、側脈與自然微捲曲度的雙溪校園落葉
  //    (4) 全身動態微霧泥塵毛皮塗層 (隨搓洗進度漸進消退還原亮麗毛色)
  // ----------------------------------------

  // 計算軀幹流線曲面上的精確 3D 座標（供曲面泥漬與落葉完美貼合身體）
  getTorsoSurfacePoint(nx, ny, nz, radialOffset = 0) {
    const len = Math.hypot(nx, ny, nz) || 1;
    const x = nx / len;
    const y = ny / len;
    const z = nz / len;
    const r = 1 + radialOffset;

    const lengthZ = z * 0.74 * r;
    const waistFactor = z >= 0
      ? 1.0 + 0.08 * Math.sin(z * Math.PI * 0.5)
      : 0.88 + 0.12 * Math.cos(z * Math.PI * 0.6);

    let widthX = x * 0.36 * waistFactor * r;
    let heightY = y * 0.38 * waistFactor * r;

    if (y < 0) {
      if (z > 0.1) {
        heightY *= 1.12;
      } else if (z < -0.1) {
        heightY *= 0.90;
      }
    }
    const backOffset = Math.cos(z * 1.2) * 0.03;
    return new THREE.Vector3(widthX, 1.04 + heightY + backOffset, lengthZ);
  }

  // 產生自然有機的「泥巴噴濺＋乾涸黃土＋草地微漬＋毛流暈染」透明貼圖
  createOrganicMudTexture(seed = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const rand = (n) => {
      const x = Math.sin(seed * 97.13 + n * 43.71) * 10000;
      return x - Math.floor(x);
    };

    // 1. 柔和底層泥土漸層暈染（邊緣完全柔和透明，無生硬邊界）
    const baseGrad = ctx.createRadialGradient(128, 128, 10, 128, 128, 118);
    baseGrad.addColorStop(0, 'rgba(138, 94, 52, 0.76)');
    baseGrad.addColorStop(0.48, 'rgba(162, 114, 68, 0.58)');
    baseGrad.addColorStop(0.78, 'rgba(181, 134, 84, 0.25)');
    baseGrad.addColorStop(1, 'rgba(181, 134, 84, 0)');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 256, 256);

    // 2. 不規則有機泥塊輪廓（多頻正弦波模擬真實泥印邊緣）
    for (let layer = 0; layer < 3; layer++) {
      ctx.beginPath();
      const baseR = 72 - layer * 14;
      const steps = 48;
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const wave =
          Math.sin(a * 3 + seed * 2.1 + layer) * 14 +
          Math.cos(a * 5 - seed * 1.7) * 9 +
          Math.sin(a * 8 + layer * 3.3) * 5;
        const r = Math.max(18, baseR + wave);
        const px = 128 + Math.cos(a) * r;
        const py = 128 + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      const layerColors = [
        'rgba(176, 128, 78, 0.46)',
        'rgba(132, 88, 48, 0.52)',
        'rgba(104, 67, 35, 0.45)'
      ];
      ctx.fillStyle = layerColors[layer];
      ctx.fill();
    }

    // 3. 順著毛髮生長方向的細微毛流泥絲（讓泥漬看起來滲入毛髮纖維中）
    ctx.lineCap = 'round';
    for (let i = 0; i < 65; i++) {
      const angle = rand(i * 3) * Math.PI * 2;
      const dist = 35 + rand(i * 3 + 1) * 65;
      const len = 10 + rand(i * 3 + 2) * 18;
      const sx = 128 + Math.cos(angle) * dist;
      const sy = 128 + Math.sin(angle) * dist;
      const strokeAngle = angle + (rand(i * 7) - 0.5) * 0.45;
      ctx.strokeStyle = i % 3 === 0
        ? 'rgba(196, 148, 96, 0.38)'
        : 'rgba(115, 76, 40, 0.42)';
      ctx.lineWidth = 1.5 + rand(i * 5) * 2.2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(strokeAngle) * len, sy + Math.sin(strokeAngle) * len);
      ctx.stroke();
    }

    // 4. 周圍微小泥點噴濺與雙溪草地微綠土粒（增加真實自然細節）
    const speckColors = ['#6b4423', '#8c5d33', '#b88655', '#d1a372', '#5c4028', '#6e7838'];
    for (let i = 0; i < 80; i++) {
      const angle = rand(i * 11 + 5) * Math.PI * 2;
      const dist = Math.pow(rand(i * 11 + 6), 0.75) * 106;
      const rx = 128 + Math.cos(angle) * dist;
      const ry = 128 + Math.sin(angle) * dist;
      const rad = 1.8 + rand(i * 11 + 7) * 5.2 * (1 - dist / 125);

      ctx.fillStyle = speckColors[i % speckColors.length];
      ctx.globalAlpha = 0.35 + (1 - dist / 120) * 0.5;
      ctx.beginPath();
      ctx.ellipse(rx, ry, rad * 1.2, rad * 0.85, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  // 產生具真實葉柄、葉脈與漸層色澤的「雙溪校園自然落葉」貼圖
  createBotanicalLeafTexture(variant = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.translate(128, 128);

    // 1. 彎曲自然的葉柄 (Petiole)
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-98, 6);
    ctx.quadraticCurveTo(-78, 12, -58, 2);
    ctx.stroke();

    // 2. 葉片本體自然水滴鋸齒流線輪廓
    ctx.beginPath();
    ctx.moveTo(-62, 2);
    ctx.bezierCurveTo(-35, -62, 36, -66, 98, -4);
    ctx.bezierCurveTo(36, 64, -35, 62, -62, 2);
    ctx.closePath();

    const leafGrad = ctx.createLinearGradient(-62, -45, 98, 45);
    if (variant % 2 === 0) {
      leafGrad.addColorStop(0, '#84cc16');
      leafGrad.addColorStop(0.45, '#eab308');
      leafGrad.addColorStop(0.82, '#d97706');
      leafGrad.addColorStop(1, '#9a3412');
    } else {
      leafGrad.addColorStop(0, '#d97706');
      leafGrad.addColorStop(0.5, '#ea580c');
      leafGrad.addColorStop(0.85, '#b45309');
      leafGrad.addColorStop(1, '#78350f');
    }
    ctx.fillStyle = leafGrad;
    ctx.fill();

    // 葉緣柔和深色自然包邊
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 3. 葉片中央主脈與分岔側葉脈
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-60, 2);
    ctx.quadraticCurveTo(15, -3, 92, -4);
    ctx.stroke();

    const veinPairs = [-32, -8, 16, 40, 62];
    ctx.lineWidth = 1.8;
    veinPairs.forEach((vx, idx) => {
      const span = 38 - idx * 5.2;
      // 上側葉脈
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.quadraticCurveTo(vx + 12, -span * 0.55, vx + 24, -span);
      ctx.stroke();
      // 下側葉脈
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.quadraticCurveTo(vx + 12, span * 0.55, vx + 24, span);
      ctx.stroke();
    });

    // 4. 自然秋葉斑點
    ctx.fillStyle = 'rgba(120, 53, 15, 0.32)';
    [[-15, -18, 4.5], [22, 16, 5.5], [45, -12, 3.8], [-25, 20, 3.5]].forEach(([bx, by, br]) => {
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  // 建立 100% 貼合軀幹曲面的泥漬或落葉網格（無任何懸空或穿模！）
  createCurvedTorsoDecal(centerDir, sizeU, sizeV, radialOffset, material, isLeaf = false, rotationAngle = 0) {
    const dir = centerDir.clone().normalize();
    const worldUp = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const tangentU = new THREE.Vector3().crossVectors(worldUp, dir).normalize();
    const tangentV = new THREE.Vector3().crossVectors(dir, tangentU).normalize();

    if (rotationAngle !== 0) {
      const cosA = Math.cos(rotationAngle);
      const sinA = Math.sin(rotationAngle);
      const uCopy = tangentU.clone();
      const vCopy = tangentV.clone();
      tangentU.copy(uCopy).multiplyScalar(cosA).addScaledVector(vCopy, sinA);
      tangentV.copy(vCopy).multiplyScalar(cosA).addScaledVector(uCopy, -sinA);
    }

    const centerSurfacePos = this.getTorsoSurfacePoint(dir.x, dir.y, dir.z, radialOffset);
    const segs = 14;
    const geo = new THREE.PlaneGeometry(1, 1, segs, segs);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) * sizeU;
      const v = pos.getY(i) * sizeV;

      const sampleDir = dir.clone()
        .addScaledVector(tangentU, u)
        .addScaledVector(tangentV, v)
        .normalize();

      // 若是落葉，葉尖與葉緣帶有極輕微的自然弧度
      const extraLift = isLeaf ? (u * u + v * v) * 0.035 : 0;
      const pt = this.getTorsoSurfacePoint(sampleDir.x, sampleDir.y, sampleDir.z, radialOffset + extraLift);

      pos.setXYZ(i, pt.x - centerSurfacePos.x, pt.y - centerSurfacePos.y, pt.z - centerSurfacePos.z);
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();

    const mesh = new THREE.Mesh(geo, material);
    mesh.position.copy(centerSurfacePos);
    return mesh;
  }

  // 建立包覆於四肢圓柱曲面的腳踝/小腿泥漬（直接綁定於狗腿關節，奔跑或趴睡時隨狗腿自然連動！）
  createCurvedLegDecal(legPivot, yCenter, angleCenter, heightSpan, angleSpan, material) {
    const segsU = 12;
    const segsV = 10;
    const geo = new THREE.PlaneGeometry(1, 1, segsU, segsV);
    const pos = geo.attributes.position;

    const getLegRadius = (y) => {
      const t = Math.max(0, Math.min(1, (-y) / 0.76));
      return (0.092 * (1 - t) + 0.068 * t) + 0.005;
    };

    const rCenter = getLegRadius(yCenter);
    const centerPos = new THREE.Vector3(
      Math.sin(angleCenter) * rCenter,
      yCenter,
      Math.cos(angleCenter) * rCenter
    );

    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i); // -0.5 ~ 0.5
      const v = pos.getY(i); // -0.5 ~ 0.5

      const theta = angleCenter + u * angleSpan;
      const py = yCenter + v * heightSpan;
      const r = getLegRadius(py);

      const px = Math.sin(theta) * r;
      const pz = Math.cos(theta) * r;

      pos.setXYZ(i, px - centerPos.x, py - centerPos.y, pz - centerPos.z);
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();

    const mesh = new THREE.Mesh(geo, material);
    mesh.position.copy(centerPos);
    legPivot.add(mesh);
    return mesh;
  }

  // 建立全身微霧泥塵毛皮塗層，隨整體清潔度漸進變淡，呈現洗完澡毛髮由灰撲撲變閃亮的真實感
  initCoatDirtLayer() {
    const coatCanvas = document.createElement('canvas');
    coatCanvas.width = 512;
    coatCanvas.height = 256;
    const ctx = coatCanvas.getContext('2d');

    for (let i = 0; i < 180; i++) {
      const cx = Math.random() * 512;
      const cy = 50 + Math.random() * 190;
      const r = 14 + Math.random() * 32;
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
      grad.addColorStop(0, 'rgba(146, 102, 58, 0.26)');
      grad.addColorStop(0.6, 'rgba(168, 120, 72, 0.12)');
      grad.addColorStop(1, 'rgba(168, 120, 72, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const coatTex = new THREE.CanvasTexture(coatCanvas);
    this.coatDirtMat = new THREE.MeshStandardMaterial({
      map: coatTex,
      transparent: true,
      opacity: 0.75,
      roughness: 0.95,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1
    });

    const overlayGeo = this.torsoMesh.geometry.clone();
    this.coatDirtOverlay = new THREE.Mesh(overlayGeo, this.coatDirtMat);
    this.coatDirtOverlay.position.copy(this.torsoMesh.position);
    this.coatDirtOverlay.scale.setScalar(1.004);
    this.dogBodyRoot.add(this.coatDirtOverlay);
  }

  initDirtAndFoamSystem() {
    this.dirtSpots = [];
    this.attachedFoams = [];

    // 1. 建立全身自然微霧泥塵底層
    this.initCoatDirtLayer();

    // 2. 定義貼合身體各部位曲面的自然泥漬與校園落葉配置
    const torsoSpotsConfig = [
      // 前胸與左右肩側泥巴噴濺
      { dir: new THREE.Vector3(-0.78, -0.08, 0.56), sizeU: 0.56, sizeV: 0.48, type: 'mud', seed: 11, rot: 0.3 },
      { dir: new THREE.Vector3(0.78, -0.06, 0.52), sizeU: 0.56, sizeV: 0.48, type: 'mud', seed: 23, rot: -0.4 },
      // 背部中央與後臀草地打滾泥印
      { dir: new THREE.Vector3(0.05, 0.95, 0.08), sizeU: 0.62, sizeV: 0.52, type: 'mud', seed: 37, rot: 0.2 },
      { dir: new THREE.Vector3(-0.82, -0.05, -0.35), sizeU: 0.58, sizeV: 0.50, type: 'mud', seed: 49, rot: -0.5 },
      { dir: new THREE.Vector3(0.82, -0.05, -0.38), sizeU: 0.58, sizeV: 0.50, type: 'mud', seed: 61, rot: 0.6 },
      { dir: new THREE.Vector3(-0.04, 0.88, -0.62), sizeU: 0.60, sizeV: 0.50, type: 'mud', seed: 73, rot: 0.15 },
      // 雙溪校園真實葉脈落葉（自然貼合於背側毛髮上）
      { dir: new THREE.Vector3(-0.42, 0.86, 0.34), sizeU: 0.44, sizeV: 0.34, type: 'leaf', seed: 0, rot: 0.55 },
      { dir: new THREE.Vector3(0.44, 0.84, -0.36), sizeU: 0.46, sizeV: 0.36, type: 'leaf', seed: 1, rot: -0.65 }
    ];

    torsoSpotsConfig.forEach((cfg, idx) => {
      const isLeaf = cfg.type === 'leaf';
      const tex = isLeaf
        ? this.createBotanicalLeafTexture(cfg.seed)
        : this.createOrganicMudTexture(cfg.seed);

      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        opacity: isLeaf ? 0.96 : 0.92,
        roughness: isLeaf ? 0.65 : 0.95,
        metalness: 0.0,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: isLeaf ? -3 : -2
      });

      const radialOffset = isLeaf ? 0.012 : (0.006 + (idx % 3) * 0.0015);
      const mesh = this.createCurvedTorsoDecal(
        cfg.dir,
        cfg.sizeU,
        cfg.sizeV,
        radialOffset,
        mat,
        isLeaf,
        cfg.rot
      );
      this.dogBodyRoot.add(mesh);

      this.dirtSpots.push({
        mesh,
        originalScale: mesh.scale.clone(),
        originalOpacity: mat.opacity,
        health: 100,
        cleaned: false,
        type: cfg.type
      });
    });

    // 3. 左右前腿包覆式泥巴腳印（綁定在 FL / FR 狗腿上，隨奔跑與趴睡自然連動）
    [
      { legKey: 'FL', yCenter: -0.44, angleCenter: 0.35, seed: 85 },
      { legKey: 'FR', yCenter: -0.42, angleCenter: -0.35, seed: 97 }
    ].forEach(legCfg => {
      const tex = this.createOrganicMudTexture(legCfg.seed);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        opacity: 0.92,
        roughness: 0.95,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2
      });

      const mesh = this.createCurvedLegDecal(
        this.legs[legCfg.legKey],
        legCfg.yCenter,
        legCfg.angleCenter,
        0.34,
        Math.PI * 1.15,
        mat
      );

      this.dirtSpots.push({
        mesh,
        originalScale: mesh.scale.clone(),
        originalOpacity: mat.opacity,
        health: 100,
        cleaned: false,
        type: 'mud'
      });
    });

    this.totalDirtCount = this.dirtSpots.length;

    const foamMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.15,
      transmission: 0.35,
      transparent: true,
      opacity: 0.94,
      clearcoat: 1.0
    });
    const foamGeo = new THREE.SphereGeometry(0.12, 12, 10);

    for (let i = 0; i < 40; i++) {
      const fm = new THREE.Mesh(foamGeo, foamMat);
      fm.visible = false;
      this.dogBodyRoot.add(fm);
      this.attachedFoams.push({ mesh: fm, active: false, amount: 0 });
    }
  }

  // 當泥漬或落葉被刷洗/沖水時，以自然溶解淡化取代突兀縮小球體
  applyDirtDamage(dirt, damage, cleanMsg, cleanIcon) {
    dirt.health -= damage;
    if (dirt.health <= 0) {
      dirt.health = 0;
      dirt.cleaned = true;
      dirt.mesh.visible = false;
      const worldPos = dirt.mesh.getWorldPosition(new THREE.Vector3());
      this.showFloatingText(worldPos, cleanMsg, cleanIcon);
    } else {
      const ratio = Math.max(0.08, dirt.health / 100);
      if (dirt.type === 'leaf') {
        // 落葉被刷動時輕微位移並淡出
        dirt.mesh.material.opacity = dirt.originalOpacity * Math.pow(ratio, 0.7);
        dirt.mesh.scale.setScalar(0.75 + 0.25 * ratio);
      } else {
        // 泥漬被海綿或水柱刷洗時，透明度平滑消退、邊緣微微暈開溶解
        dirt.mesh.material.opacity = dirt.originalOpacity * Math.pow(ratio, 0.85);
        const diffuseScale = 1.0 + (1.0 - ratio) * 0.08;
        dirt.mesh.scale.set(
          dirt.originalScale.x * diffuseScale,
          dirt.originalScale.y * diffuseScale,
          dirt.originalScale.z * diffuseScale
        );
      }
    }
  }

  addAttachedFoam(worldPoint) {
    const localPoint = this.dogBodyRoot.worldToLocal(worldPoint.clone());
    let existing = this.attachedFoams.find(
      f => f.active && f.mesh.position.distanceTo(localPoint) < 0.18
    );
    if (existing) {
      existing.amount = Math.min(100, existing.amount + 35);
      const s = 0.6 + (existing.amount / 100) * 0.85;
      existing.mesh.scale.setScalar(s);
      return;
    }

    const freeFoam = this.attachedFoams.find(f => !f.active);
    if (freeFoam) {
      freeFoam.active = true;
      freeFoam.amount = 65;
      freeFoam.mesh.visible = true;
      freeFoam.mesh.position.copy(localPoint);
      freeFoam.mesh.scale.setScalar(0.75);
    }
  }

  // ----------------------------------------
  // 5. 花灑物理水滴粒子與漂浮泡泡系統
  // ----------------------------------------
  initWaterParticleSystem() {
    const dropGeo = new THREE.SphereGeometry(0.038, 8, 8);
    const dropMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      roughness: 0.08,
      transparent: true,
      opacity: 0.86
    });

    this.waterPool = [];
    for (let i = 0; i < 75; i++) {
      const drop = new THREE.Mesh(dropGeo, dropMat);
      drop.visible = false;
      this.scene.add(drop);
      this.waterPool.push({
        mesh: drop,
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        life: 0
      });
    }
  }

  spawnWaterStream(targetPoint) {
    const showerPos = this.cursorRoot.position.clone();
    const dir = new THREE.Vector3().subVectors(targetPoint, showerPos).normalize();

    for (let j = 0; j < 4; j++) {
      const p = this.waterPool.find(item => !item.active);
      if (!p) break;

      p.active = true;
      p.mesh.visible = true;
      p.pos.copy(showerPos).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        -0.04,
        (Math.random() - 0.5) * 0.1
      ));
      p.mesh.position.copy(p.pos);

      const speed = 7.5 + Math.random() * 2.0;
      p.vel.set(
        dir.x * speed + (Math.random() - 0.5) * 1.2,
        dir.y * speed + (Math.random() - 0.5) * 0.8,
        dir.z * speed + (Math.random() - 0.5) * 1.2
      );
      p.life = 0.85;
    }
  }

  spawnShakeWaterDrops() {
    const center = this.dogGroup.position.clone().add(new THREE.Vector3(0, 1.15, 0));
    for (let i = 0; i < 30; i++) {
      const p = this.waterPool.find(item => !item.active);
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.6 + Math.random() * 3.2;

      p.active = true;
      p.mesh.visible = true;
      p.pos.copy(center).add(new THREE.Vector3(
        Math.cos(angle) * 0.35,
        (Math.random() - 0.3) * 0.35,
        Math.sin(angle) * 0.45
      ));
      p.mesh.position.copy(p.pos);
      p.vel.set(Math.cos(angle) * speed, 1.8 + Math.random() * 2.2, Math.sin(angle) * speed);
      p.life = 1.0;
    }
  }

  updateWaterParticles(dt) {
    const gravity = -15.0;
    this.waterPool.forEach(p => {
      if (!p.active) return;

      p.vel.y += gravity * dt;
      p.pos.addScaledVector(p.vel, dt);
      p.mesh.position.copy(p.pos);
      p.life -= dt * 1.4;

      if (p.pos.y <= this.waterHeight) {
        this.addWaterRipple(p.pos.x, p.pos.z, 0.025);
        p.active = false;
        p.mesh.visible = false;
        return;
      }

      if (p.life <= 0) {
        p.active = false;
        p.mesh.visible = false;
      }
    });
  }

  initFloatingBubbleSystem() {
    this.bubbles = [];
    const bubbleGeo = new THREE.SphereGeometry(0.095, 14, 12);
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.82,
      opacity: 0.88,
      transparent: true,
      roughness: 0.05,
      ior: 1.33,
      clearcoat: 1.0
    });

    for (let i = 0; i < 60; i++) {
      const mesh = new THREE.Mesh(bubbleGeo, bubbleMat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.bubbles.push({
        mesh,
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        scale: 1,
        life: 0,
        seed: Math.random() * 10
      });
    }
  }

  spawnFloatingBubble(pos, count = 2) {
    for (let i = 0; i < count; i++) {
      const b = this.bubbles.find(item => !item.active);
      if (!b) break;

      b.active = true;
      b.mesh.visible = true;
      b.pos.copy(pos).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.25,
        (Math.random() - 0.2) * 0.2,
        (Math.random() - 0.5) * 0.25
      ));
      b.mesh.position.copy(b.pos);
      b.vel.set(
        (Math.random() - 0.5) * 0.35,
        0.35 + Math.random() * 0.45,
        (Math.random() - 0.5) * 0.35
      );
      b.scale = 0.45 + Math.random() * 0.75;
      b.mesh.scale.setScalar(b.scale);
      b.life = 1.0;
    }
  }

  updateFloatingBubbles(dt, time) {
    this.bubbles.forEach(b => {
      if (!b.active) return;

      b.pos.x += b.vel.x * dt + Math.sin(time * 3 + b.seed) * 0.004;
      b.pos.y += b.vel.y * dt;
      b.pos.z += b.vel.z * dt + Math.cos(time * 2.5 + b.seed) * 0.004;
      b.mesh.position.copy(b.pos);

      b.vel.x *= 0.97;
      b.vel.z *= 0.97;

      b.life -= dt * 0.22;
      b.mesh.scale.setScalar(b.scale * Math.max(0.1, b.life));

      if (b.life <= 0 || b.pos.y > 4.5) {
        b.active = false;
        b.mesh.visible = false;
      }
    });
  }

  // ----------------------------------------
  // 6. 物理剛體玩具（橡皮小鴨、滑溜香皂、照片02紅綠火箭玩具、黃金鴨王）
  // ----------------------------------------
  initPhysicsToys() {
    this.createRubberDuck(new THREE.Vector3(0.88, 1.2, 0.48), false);
    this.createSoapBar(new THREE.Vector3(-0.82, 1.2, 0.45));
    this.createRocketToy(new THREE.Vector3(0.78, 1.4, -0.45));
  }

  trimExcessToys() {
    if (this.physicsBodies.length > 14) {
      const oldest = this.physicsBodies.shift();
      this.scene.remove(oldest.mesh);
      this.world.removeBody(oldest.body);
    }
  }

  createRubberDuck(pos, isKing = false) {
    this.trimExcessToys();
    const scale = isKing ? 1.85 : 1.0;
    const duckGroup = new THREE.Group();
    const duckMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: isKing ? 0.12 : 0.28,
      metalness: isKing ? 0.82 : 0.05
    });
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    const bodyGeo = new THREE.SphereGeometry(0.18 * scale, 16, 14);
    bodyGeo.scale(1, 0.82, 1.25);
    const body = new THREE.Mesh(bodyGeo, duckMat);
    body.castShadow = true;
    duckGroup.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.125 * scale, 14, 14), duckMat);
    head.position.set(0, 0.15 * scale, 0.12 * scale);
    head.castShadow = true;
    duckGroup.add(head);

    const beakGeo = new THREE.ConeGeometry(0.06 * scale, 0.11 * scale, 10);
    beakGeo.rotateX(Math.PI / 2);
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.position.set(0, 0.13 * scale, 0.24 * scale);
    duckGroup.add(beak);

    [-0.06 * scale, 0.06 * scale].forEach(x => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022 * scale, 8, 8), eyeMat);
      eye.position.set(x, 0.19 * scale, 0.19 * scale);
      duckGroup.add(eye);
    });

    this.scene.add(duckGroup);

    const duckBody = new CANNON.Body({
      mass: 0.38 * scale,
      material: this.toyMaterial,
      linearDamping: 0.22,
      angularDamping: 0.4
    });
    duckBody.addShape(new CANNON.Sphere(0.18 * scale));
    duckBody.position.set(pos.x, pos.y, pos.z);
    this.world.addBody(duckBody);

    this.physicsBodies.push({
      mesh: duckGroup,
      body: duckBody,
      type: 'duck',
      buoyancy: 15.0 * scale,
      wasInWater: false
    });
  }

  createSoapBar(pos) {
    this.trimExcessToys();
    const soapGroup = new THREE.Group();
    const soapMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.10, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.2, metalness: 0.05 })
    );
    soapMesh.castShadow = true;
    soapGroup.add(soapMesh);
    this.scene.add(soapGroup);

    const soapBody = new CANNON.Body({
      mass: 0.35,
      material: this.toyMaterial,
      linearDamping: 0.18,
      angularDamping: 0.3
    });
    soapBody.addShape(new CANNON.Box(new CANNON.Vec3(0.14, 0.05, 0.09)));
    soapBody.position.set(pos.x, pos.y, pos.z);
    this.world.addBody(soapBody);

    this.physicsBodies.push({
      mesh: soapGroup,
      body: soapBody,
      type: 'soap',
      buoyancy: 12.0,
      wasInWater: false
    });
  }

  createRocketToy(pos) {
    this.trimExcessToys();
    const rocketGroup = this.createRocketMesh();
    rocketGroup.rotation.z = 0.4;
    this.scene.add(rocketGroup);

    const rocketBody = new CANNON.Body({
      mass: 0.4,
      material: this.toyMaterial,
      linearDamping: 0.2,
      angularDamping: 0.35
    });
    rocketBody.addShape(new CANNON.Sphere(0.2));
    rocketBody.position.set(pos.x, pos.y, pos.z);
    this.world.addBody(rocketBody);

    this.physicsBodies.push({
      mesh: rocketGroup,
      body: rocketBody,
      type: 'rocket',
      buoyancy: 15.5,
      wasInWater: false
    });
  }

  updatePhysics(dt) {
    this.world.step(1 / 60, dt, 3);

    const tubX = this.tubGroup.position.x;
    this.physicsBodies.forEach(item => {
      const body = item.body;
      const mesh = item.mesh;

      const distToTub = Math.hypot(body.position.x - tubX, body.position.z);
      if (distToTub < 1.42 && body.position.y < this.waterHeight && this.waterHeight > 0.1) {
        if (!item.wasInWater && body.velocity.y < -0.7) {
          this.addWaterRipple(body.position.x, body.position.z, 0.06);
          this.sfx.playSplash();
        }
        item.wasInWater = true;

        const depth = this.waterHeight - body.position.y;
        const submerged = Math.min(1.0, depth / 0.25);
        body.applyForce(new CANNON.Vec3(0, item.buoyancy * submerged, 0), body.position);

        body.velocity.scale(0.92, body.velocity);
        body.angularVelocity.scale(0.88, body.angularVelocity);

        if (item.type === 'duck') {
          const upAxis = new CANNON.Vec3(0, 1, 0);
          const duckUp = body.quaternion.vmult(upAxis);
          const torque = duckUp.cross(upAxis);
          body.angularVelocity.x += torque.x * 2.2;
          body.angularVelocity.z += torque.z * 2.2;
        }
      } else {
        item.wasInWater = false;
      }

      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    });
  }

  // ----------------------------------------
  // 7. 事件綁定與工具互動系統
  // ----------------------------------------
  setupEvents() {
    const dom = this.renderer.domElement;
    this.isPointerInCanvas = false;

    dom.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', () => this.onPointerUp());
    dom.addEventListener('pointerleave', () => {
      this.isPointerInCanvas = false;
      this.updateCursorToolVisibility();
    });

    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / Math.max(1, this.height);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      this.updateResponsiveCamera(true);
      this.clampMascotToViewport();
    });

    // 底部工具列切換
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectTool(btn.dataset.tool);
      });
    });

    // 步驟引導膠囊也可直接點擊切換階段
    document.getElementById('pill-step-1').addEventListener('click', () => {
      this.moveDogIntoBasin(true);
      this.selectTool('sponge');
    });
    document.getElementById('pill-step-2').addEventListener('click', () => {
      this.moveDogIntoBasin(true);
      this.selectTool('shower');
    });
    document.getElementById('pill-step-3').addEventListener('click', () => {
      this.moveDogOutOfBasin(true);
      this.selectTool('dryer');
    });

    // 頂部功能按鈕
    document.getElementById('btn-basin-toggle').addEventListener('click', () => {
      this.toggleBasinState();
    });

    document.getElementById('btn-run-toggle').addEventListener('click', () => {
      if (this.dogState === 'running') {
        this.stopDogRunning(true);
      } else {
        this.startDogRunning();
      }
    });

    document.getElementById('btn-coax-now').addEventListener('click', () => {
      this.giveTreat();
      this.stopDogRunning(true);
    });

    document.getElementById('btn-shake').addEventListener('click', () => {
      this.triggerDogShake();
    });

    document.getElementById('btn-album').addEventListener('click', () => {
      document.getElementById('album-modal').classList.add('active');
    });
    document.getElementById('btn-close-album').addEventListener('click', () => {
      document.getElementById('album-modal').classList.remove('active');
    });
    document.getElementById('album-modal').addEventListener('click', (e) => {
      if (e.target.id === 'album-modal') {
        document.getElementById('album-modal').classList.remove('active');
      }
    });

    document.getElementById('btn-eggs').addEventListener('click', () => {
      this.renderEggModalList();
      document.getElementById('egg-modal').classList.add('active');
    });
    document.getElementById('btn-close-egg').addEventListener('click', () => {
      document.getElementById('egg-modal').classList.remove('active');
    });
    document.getElementById('egg-modal').addEventListener('click', (e) => {
      if (e.target.id === 'egg-modal') {
        document.getElementById('egg-modal').classList.remove('active');
      }
    });

    document.getElementById('btn-camera-reset').addEventListener('click', () => {
      this.updateResponsiveCamera(true);
      this.showFloatingText(new THREE.Vector3(0, 2.0, 0), '已重置最佳視角', 'fa-crosshairs');
    });

    document.getElementById('btn-sound').addEventListener('click', (e) => {
      this.sfx.muted = !this.sfx.muted;
      if (this.sfx.muted) {
        this.sfx.stopWaterSound();
        this.sfx.stopDryerSound();
      }
      const icon = e.currentTarget.querySelector('i');
      icon.className = this.sfx.muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      this.resetGame();
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
      document.getElementById('win-modal').classList.remove('active');
      this.resetGame();
    });

    document.getElementById('btn-keep-playing').addEventListener('click', () => {
      document.getElementById('win-modal').classList.remove('active');
    });
  }

  selectTool(toolName) {
    this.activeTool = toolName;
    document.querySelectorAll('.tool-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tool === toolName);
    });
    this.updateHintBanner();
    this.updateCursorToolVisibility();
    this.sfx.stopWaterSound();
    this.sfx.stopDryerSound();

    // 關鍵優化：吹乾或摸頭哄睡絕不在有水的臉盆內進行！
    // 當玩家選擇「移出吹乾 (dryer)」或「摸頭哄睡 (pet)」時，自動把祥祥移出臉盆跳上乾爽木桌！
    if (toolName === 'dryer' || toolName === 'pet') {
      if (!this.basinRemoved || this.dogState === 'in_basin') {
        this.moveDogOutOfBasin(true);
      }
    } else if (toolName === 'shower') {
      this.isLyingDown = false;
    }

    if (toolName === 'duck') {
      this.duckCount++;
      if (this.duckCount >= 5) {
        this.createRubberDuck(new THREE.Vector3(0, 2.5, 0), true);
        this.discoMode = true;
        this.unlockEasterEgg('disco');
        this.showFloatingText(new THREE.Vector3(0, 2.2, 0), '召喚巨型黃金鴨王！', 'fa-crown');
      } else {
        this.createRubberDuck(new THREE.Vector3((Math.random() - 0.5) * 1.1, 1.9, (Math.random() - 0.5) * 0.9), false);
      }
      this.sfx.playDuckQuack();
      this.happiness = Math.min(100, this.happiness + 4);
      this.updateHUD();
    } else if (toolName === 'rocket') {
      if (this.dogState === 'running') {
        this.stopDogRunning(true);
      }
      this.createRocketToy(new THREE.Vector3((Math.random() - 0.5) * 0.9, 1.9, (Math.random() - 0.5) * 0.9));
      this.mouthRocket.visible = true;
      clearTimeout(this.rocketMouthTimer);
      this.rocketMouthTimer = setTimeout(() => {
        this.mouthRocket.visible = false;
      }, 4500);
      this.sfx.playDogBark();
      this.happiness = 100;
      this.unlockEasterEgg('rocket');
      this.showFloatingText(new THREE.Vector3(0, 2.1, 0), '祥祥開心叼起最愛的火箭玩具！', 'fa-rocket');
      this.updateHUD();
    } else if (toolName === 'soap') {
      this.createSoapBar(new THREE.Vector3((Math.random() - 0.5) * 0.8, 1.8, (Math.random() - 0.5) * 0.8));
      this.sfx.playSponge();
    } else if (toolName === 'treat') {
      if (this.dogState === 'running') {
        this.stopDogRunning(true);
      }
      this.giveTreat();
    }
  }

  updateHintBanner() {
    const banner = document.getElementById('hint-text');
    const hints = {
      sponge: '按住祥祥來回搓洗去泥！搓頭頂可解鎖「泡泡皇冠」，點上方浴缸鈕可隨時把祥祥移出臉盆！',
      shower: '按住噴出物理水柱沖洗泡沫！水柱還能推動橡皮小鴨與火箭玩具喔！',
      soap: '在祥祥身上抹上滑溜香皂，產生超多香噴噴的綿密泡沫！',
      dryer: '已自動將祥祥移出臉盆至乾爽木桌！按住祥祥用暖風把毛髮吹乾即可過關！',
      pet: '在乾爽木床溫柔摸祥祥，祥祥會開心地趴在藍黃格紋毯上睡覺喔！',
      duck: '投入浮力橡皮小鴨！累積投入 5 隻小鴨可召喚「巨型黃金鴨王」彩蛋！',
      rocket: '祥祥最心愛的紅綠火箭拉繩玩具！祥祥會開心地叼在嘴裡！',
      treat: '餵食祥祥最愛的大骨頭，還可以把亂跑中的祥祥立刻哄回來！'
    };
    banner.innerText = hints[this.activeTool] || '';
  }

  getSceneIntersection() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const targets = [this.dogGroup, this.tubGroup, this.benchGroup, ...this.physicsBodies.map(p => p.mesh)];
    const intersects = this.raycaster.intersectObjects(targets, true);
    return intersects.length > 0 ? intersects[0] : null;
  }

  onPointerDown(e) {
    if (e.button === 1 || e.button === 2) {
      this.controls.enabled = true;
      return;
    }

    this.mouse.x = (e.clientX / this.width) * 2 - 1;
    this.mouse.y = -(e.clientY / this.height) * 2 + 1;
    this.isPointerDown = true;
    this.isPointerInCanvas = true;

    const hit = this.getSceneIntersection();
    if (hit) {
      // 如果祥祥正在全場調皮亂跑，玩家直接點擊到祥祥即可把牠抓回來！
      let obj = hit.object;
      let hitDog = false;
      while (obj) {
        if (obj === this.dogGroup) {
          hitDog = true;
          break;
        }
        obj = obj.parent;
      }

      if (this.dogState === 'running' && hitDog) {
        this.stopDogRunning(true);
        return;
      }

      this.controls.enabled = false;
      this.isUsingToolOnTarget = true;
      this.handleToolAction(hit, hitDog);
    } else {
      this.controls.enabled = true;
      this.isUsingToolOnTarget = false;
    }
  }

  onPointerMove(e) {
    this.mouse.x = (e.clientX / this.width) * 2 - 1;
    this.mouse.y = -(e.clientY / this.height) * 2 + 1;
    this.isPointerInCanvas = true;
    this.updateCursorToolVisibility();

    const hit = this.getSceneIntersection();
    if (hit) {
      this.lastHitPoint.copy(hit.point);
      this.update3DCursorPosition(hit.point);
      if (this.isPointerDown && this.isUsingToolOnTarget) {
        let obj = hit.object;
        let hitDog = false;
        while (obj) {
          if (obj === this.dogGroup) {
            hitDog = true;
            break;
          }
          obj = obj.parent;
        }
        this.handleToolAction(hit, hitDog);
      }
    }
  }

  onPointerUp() {
    this.isPointerDown = false;
    this.isUsingToolOnTarget = false;
    this.controls.enabled = true;
    this.sfx.stopWaterSound();
    this.sfx.stopDryerSound();
  }

  update3DCursorPosition(point) {
    if (this.activeTool === 'shower') {
      this.cursorRoot.position.copy(point).add(new THREE.Vector3(0.35, 0.82, 0.52));
      this.cursorRoot.lookAt(point);
    } else if (this.activeTool === 'dryer') {
      this.cursorRoot.position.copy(point).add(new THREE.Vector3(-0.42, 0.52, 0.62));
      this.cursorRoot.lookAt(point);
    } else if (this.activeTool === 'pet') {
      const t = performance.now() * 0.012;
      const strokeZ = this.isPointerDown ? Math.sin(t) * 0.06 : 0;
      const strokeY = this.isPointerDown ? Math.abs(Math.cos(t)) * 0.025 : 0;
      this.cursorRoot.position.copy(point).add(new THREE.Vector3(0, 0.11 + strokeY, 0.14 + strokeZ));
      this.cursorRoot.rotation.set(
        -0.25 + Math.sin(t) * 0.12,
        Math.cos(t * 0.7) * 0.10,
        0
      );
    } else {
      const offset = point.clone().sub(this.dogGroup.position.clone().add(new THREE.Vector3(0, 1.0, 0))).normalize().multiplyScalar(0.14);
      this.cursorRoot.position.copy(point).add(offset);
      this.cursorRoot.rotation.set(
        Math.sin(performance.now() * 0.015) * 0.15,
        Math.cos(performance.now() * 0.015) * 0.2,
        0
      );
    }
  }

  handleToolAction(hit, hitDog) {
    const point = hit.point;

    // 點擊物理玩具彈跳
    this.physicsBodies.forEach(p => {
      if (hit.object.parent === p.mesh) {
        p.body.applyImpulse(
          new CANNON.Vec3((Math.random() - 0.5) * 0.8, 1.5, (Math.random() - 0.5) * 0.8),
          p.body.position
        );
        this.addWaterRipple(p.body.position.x, p.body.position.z, 0.05);
        if (p.type === 'duck') {
          this.sfx.playDuckQuack();
        }
      }
    });

    // 1. 海綿或香皂搓洗
    if (this.activeTool === 'sponge' || this.activeTool === 'soap') {
      this.isLyingDown = false;
      const cleanPower = this.activeTool === 'sponge' ? 24 : 20;
      this.sfx.playSponge();
      this.spawnFloatingBubble(point, 2);

      if (hitDog) {
        this.addAttachedFoam(point);
        this.dogJiggle.vx += (Math.random() - 0.5) * 0.32;
        this.dogJiggle.vz += (Math.random() - 0.5) * 0.32;

        // 檢查是否搓洗祥祥的頭頂（觸發彩蛋 1：雙溪泡泡皇冠王！）
        const headWorldPos = this.headGroup.getWorldPosition(new THREE.Vector3());
        if (point.distanceTo(headWorldPos) < 0.42) {
          this.headScrubCounter++;
          if (this.headScrubCounter >= 12 && !this.bubbleCrownGroup.visible) {
            this.bubbleCrownGroup.visible = true;
            this.unlockEasterEgg('crown');
            this.showFloatingText(headWorldPos, '戴上雙溪泡泡皇冠！', 'fa-crown');
          }
        }
      }

      this.dirtSpots.forEach(dirt => {
        if (!dirt.cleaned) {
          const dirtWorldPos = dirt.mesh.getWorldPosition(new THREE.Vector3());
          if (point.distanceTo(dirtWorldPos) < 0.48) {
            this.applyDirtDamage(
              dirt,
              cleanPower,
              dirt.type === 'leaf' ? '刷掉校園落葉！' : '泥漬溶解清潔！',
              dirt.type === 'leaf' ? 'fa-leaf' : 'fa-wand-magic-sparkles'
            );
          }
        }
      });

      // 趣味機制：當洗掉一半泥垢時，祥祥會興奮得跳出臉盆調皮亂跑一次！
      const cleanedCount = this.dirtSpots.filter(d => d.cleaned).length;
      if (cleanedCount >= 5 && !this.hasTriggeredAutoRun && this.dogState !== 'running') {
        this.hasTriggeredAutoRun = true;
        this.startDogRunning();
      }

      this.happiness = Math.min(100, this.happiness + 0.3);
      this.updateHUD();
    }

    // 2. 花灑沖水
    else if (this.activeTool === 'shower') {
      this.isLyingDown = false;
      this.sfx.startWaterSound();
      this.spawnWaterStream(point);
      this.addWaterRipple(point.x, point.z, 0.035);
      this.dryness = Math.max(25, this.dryness - 0.7);

      // 沖掉頭頂泡泡皇冠與身上附著泡沫
      const headWorldPos = this.headGroup.getWorldPosition(new THREE.Vector3());
      if (this.bubbleCrownGroup.visible && point.distanceTo(headWorldPos) < 0.5) {
        this.bubbleCrownGroup.visible = false;
        this.headScrubCounter = 0;
      }

      this.attachedFoams.forEach(f => {
        if (f.active) {
          const foamWorldPos = f.mesh.getWorldPosition(new THREE.Vector3());
          if (point.distanceTo(foamWorldPos) < 0.55) {
            f.amount -= 30;
            if (f.amount <= 0) {
              f.active = false;
              f.mesh.visible = false;
              this.spawnFloatingBubble(foamWorldPos, 1);
            } else {
              f.mesh.scale.setScalar(0.5 + (f.amount / 100) * 0.8);
            }
          }
        }
      });

      this.dirtSpots.forEach(dirt => {
        if (!dirt.cleaned) {
          const dirtWorldPos = dirt.mesh.getWorldPosition(new THREE.Vector3());
          if (point.distanceTo(dirtWorldPos) < 0.46) {
            this.applyDirtDamage(
              dirt,
              14,
              dirt.type === 'leaf' ? '水柱沖走落葉！' : '沖乾淨囉！',
              'fa-droplet'
            );
          }
        }
      });

      this.physicsBodies.forEach(item => {
        const bPos = new THREE.Vector3(item.body.position.x, item.body.position.y, item.body.position.z);
        if (bPos.distanceTo(point) < 0.65) {
          const pushDir = bPos.sub(this.cursorRoot.position).normalize();
          item.body.applyImpulse(
            new CANNON.Vec3(pushDir.x * 0.18, -0.04, pushDir.z * 0.18),
            item.body.position
          );
        }
      });

      this.updateHUD();
    }

    // 3. 移出臉盆在乾爽木桌上吹乾 (Dryer)
    else if (this.activeTool === 'dryer') {
      // 確保吹乾時一定已經移出有水的臉盆！
      if (!this.basinRemoved) {
        this.moveDogOutOfBasin(true);
      }
      this.sfx.startDryerSound();
      this.spawnDryerSparkles(point);

      if (hitDog) {
        this.dryness = Math.min(100, this.dryness + 2.2);
        this.dogJiggle.vx += (Math.random() - 0.5) * 0.2;
        this.happiness = Math.min(100, this.happiness + 0.4);
      }

      this.updateHUD();
      this.checkVictoryCondition();
    }

    // 4. 摸頭哄睡（趴在乾爽木床藍黃格紋毯上睡覺！）
    else if (this.activeTool === 'pet') {
      if (!this.basinRemoved) {
        this.moveDogOutOfBasin(false);
      }
      if (hitDog) {
        this.petCounter++;
        this.happiness = 100;
        this.dogJiggle.vx += (Math.random() - 0.5) * 0.15;
        if (this.petCounter % 8 === 0) {
          this.showFloatingText(point, '祥祥好開心～', 'fa-heart');
        }
        if (this.petCounter >= 10 && !this.isLyingDown) {
          this.isLyingDown = true;
          this.sfx.playDogBark();
          this.unlockEasterEgg('nap');
          this.showFloatingText(new THREE.Vector3(0, 1.8, 0), '祥祥開心地趴在藍黃格紋毯上睡覺囉！', 'fa-bed');
        }
        this.updateHUD();
      }
    }
  }

  triggerDogShake() {
    this.shakeTimer = 0.85;
    this.sfx.playSplash();
    this.sfx.playDogBark();
    this.spawnShakeWaterDrops();
    this.dryness = Math.min(100, this.dryness + 22);
    this.addWaterRipple(0, 0, 0.08);
    this.showFloatingText(this.dogGroup.position.clone().add(new THREE.Vector3(0, 1.9, 0)), '祥祥甩乾水珠！', 'fa-water');
    this.updateHUD();
    this.checkVictoryCondition();
  }

  spawnDryerSparkles(pos) {
    for (let i = 0; i < 2; i++) {
      const sparkle = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfde047 })
      );
      sparkle.position.copy(pos).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      ));
      this.scene.add(sparkle);

      const startTime = performance.now();
      const anim = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        sparkle.position.y += 0.026;
        sparkle.scale.multiplyScalar(0.91);
        if (elapsed < 0.36) {
          requestAnimationFrame(anim);
        } else {
          this.scene.remove(sparkle);
        }
      };
      anim();
    }
  }

  giveTreat() {
    this.sfx.playDogBark();
    this.happiness = 100;
    this.showFloatingText(this.dogGroup.position.clone().add(new THREE.Vector3(0, 1.9, 0.5)), '祥祥超愛吃大骨頭！', 'fa-bone');

    const boneGroup = new THREE.Group();
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.45 });
    const stemGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.32);
    stemGeo.rotateZ(Math.PI / 2);
    boneGroup.add(new THREE.Mesh(stemGeo, boneMat));

    const tipGeo = new THREE.SphereGeometry(0.056, 10, 10);
    [[-0.16, 0.038], [-0.16, -0.038], [0.16, 0.038], [0.16, -0.038]].forEach(([tx, ty]) => {
      const tip = new THREE.Mesh(tipGeo, boneMat);
      tip.position.set(tx, ty, 0);
      boneGroup.add(tip);
    });

    boneGroup.position.copy(this.dogGroup.position).add(new THREE.Vector3(0, 1.45, 1.25));
    this.scene.add(boneGroup);

    const start = performance.now();
    const animateBone = () => {
      const t = (performance.now() - start) / 1000;
      boneGroup.rotation.y += 0.14;
      boneGroup.position.z -= 0.015;
      if (t < 1.0) {
        requestAnimationFrame(animateBone);
      } else {
        this.scene.remove(boneGroup);
      }
    };
    animateBone();
    this.updateHUD();
  }

  // 顯示帶有 Font Awesome 圖示的物理漂浮提示標籤
  showFloatingText(pos, text, iconClass = 'fa-wand-magic-sparkles') {
    const screenPos = pos.clone().project(this.camera);
    const x = Math.max(60, Math.min(this.width - 60, (screenPos.x * 0.5 + 0.5) * this.width));
    const y = Math.max(60, Math.min(this.height - 60, (-screenPos.y * 0.5 + 0.5) * this.height));

    const el = document.createElement('div');
    el.className = 'floating-text';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${text}</span>`;
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 1150);
  }

  updateHUD() {
    // 計算每個泥漬的細緻剩餘健康度，讓進度條與全身微霧泥塵消退更平滑自然
    const totalHealthRemaining = this.dirtSpots.reduce((acc, d) => acc + (d.cleaned ? 0 : d.health), 0);
    const dirtCleanRatio = 1 - (totalHealthRemaining / (this.totalDirtCount * 100));

    if (this.coatDirtMat) {
      this.coatDirtMat.opacity = Math.max(0, (1 - dirtCleanRatio) * 0.75);
      this.coatDirtOverlay.visible = this.coatDirtMat.opacity > 0.01;
    }

    const activeFoamCount = this.attachedFoams.filter(f => f.active).length;
    const foamPercent = Math.min(100, Math.round((activeFoamCount / 12) * 100));

    let totalClean = dirtCleanRatio * 68;
    if (dirtCleanRatio >= 0.99) {
      const rinseFactor = Math.max(0, 1 - activeFoamCount / 10);
      totalClean += rinseFactor * 16;
      if (activeFoamCount === 0) {
        totalClean += (this.dryness / 100) * 16;
      }
    }
    this.cleanliness = Math.min(100, Math.round(totalClean));

    document.getElementById('clean-progress-fill').style.width = `${this.cleanliness}%`;
    document.getElementById('clean-percent').innerText = `${this.cleanliness}%`;
    document.getElementById('foam-val').innerText = `${foamPercent}%`;
    document.getElementById('dry-val').innerText = `${Math.round(this.dryness)}%`;
    document.getElementById('happiness-val').innerText = `${Math.round(this.happiness)}%`;

    const pills = document.querySelectorAll('.step-pill');
    if (pills.length === 3) {
      pills.forEach(p => p.classList.remove('active', 'done'));
      if (dirtCleanRatio < 0.99) {
        pills[0].classList.add('active');
      } else if (activeFoamCount > 0) {
        pills[0].classList.add('done');
        pills[1].classList.add('active');
      } else if (this.dryness < 98 || !this.basinRemoved) {
        pills[0].classList.add('done');
        pills[1].classList.add('done');
        pills[2].classList.add('active');
      } else {
        pills[0].classList.add('done');
        pills[1].classList.add('done');
        pills[2].classList.add('done');
      }
    }
  }

  checkVictoryCondition() {
    if (this.gameCompleted) return;
    const allDirtCleaned = this.dirtSpots.every(d => d.cleaned);
    const allFoamRinsed = this.attachedFoams.every(f => !f.active);

    // 必須已經移出臉盆（不在水盆內）且吹乾，才算 100% 完美通關！
    if (allDirtCleaned && allFoamRinsed && this.dryness >= 98 && this.basinRemoved) {
      this.cleanliness = 100;
      this.dryness = 100;
      this.updateHUD();
      this.gameCompleted = true;
      this.sfx.playVictory();

      if (typeof confetti === 'function') {
        confetti({
          particleCount: 150,
          spread: 85,
          origin: { y: 0.55 }
        });
      }

      setTimeout(() => {
        document.getElementById('win-modal').classList.add('active');
      }, 750);
    }
  }

  resetGame() {
    this.gameCompleted = false;
    this.hasTriggeredAutoRun = false;
    this.dryness = 55;
    this.happiness = 85;
    this.headScrubCounter = 0;
    this.petCounter = 0;
    this.bubbleCrownGroup.visible = false;
    this.mouthRocket.visible = false;

    this.moveDogIntoBasin(false);

    this.dirtSpots.forEach(d => {
      d.health = 100;
      d.cleaned = false;
      d.mesh.visible = true;
      d.mesh.scale.copy(d.originalScale);
      if (d.mesh.material && d.originalOpacity !== undefined) {
        d.mesh.material.opacity = d.originalOpacity;
      }
    });
    if (this.coatDirtMat) {
      this.coatDirtMat.opacity = 0.75;
      this.coatDirtOverlay.visible = true;
    }
    this.attachedFoams.forEach(f => {
      f.active = false;
      f.amount = 0;
      f.mesh.visible = false;
    });
    this.selectTool('sponge');
    this.updateHUD();
    this.showFloatingText(new THREE.Vector3(0, 1.8, 0), '重新幫雙溪高中校狗祥祥洗澡囉！', 'fa-rotate-left');
  }

  // 當螢幕轉向或縮放時，確保被拖曳過的吉祥物不會超出可視畫面範圍
  clampMascotToViewport() {
    const mascot = document.getElementById('mascot');
    if (!mascot || !mascot.style.left) return;
    const rect = mascot.getBoundingClientRect();
    const clampedLeft = Math.max(4, Math.min(window.innerWidth - rect.width - 4, rect.left));
    const clampedTop = Math.max(4, Math.min(window.innerHeight - rect.height - 4, rect.top));
    mascot.style.left = `${clampedLeft}px`;
    mascot.style.top = `${clampedTop}px`;
  }

  // ----------------------------------------
  // 8. 網頁左下角吉祥物 (無上方對話框，懸停霓虹彩色發光抖動 + 自由拖曳至任何地方)
  // ----------------------------------------
  setupMascot() {
    const mascot = document.getElementById('mascot');
    let isDragging = false;
    let hasMoved = false;
    let offsetX = 0;
    let offsetY = 0;
    let downX = 0;
    let downY = 0;
    let clickCount = 0;

    mascot.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      isDragging = true;
      hasMoved = false;
      downX = e.clientX;
      downY = e.clientY;
      const rect = mascot.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      mascot.setPointerCapture(e.pointerId);
      mascot.classList.add('neon-active');
    });

    mascot.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      e.stopPropagation();
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 4) {
        hasMoved = true;
      }

      const rect = mascot.getBoundingClientRect();
      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;

      newLeft = Math.max(0, Math.min(window.innerWidth - rect.width, newLeft));
      newTop = Math.max(0, Math.min(window.innerHeight - rect.height, newTop));

      mascot.style.left = `${newLeft}px`;
      mascot.style.top = `${newTop}px`;
      mascot.style.bottom = 'auto';
      mascot.style.right = 'auto';
    });

    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      mascot.classList.remove('neon-active');
      try {
        mascot.releasePointerCapture(e.pointerId);
      } catch (err) {}

      // 連點吉祥物 5 下觸發彩蛋 6：雙溪霓虹派對與黃金鴨王！
      if (!hasMoved) {
        this.sfx.playDuckQuack();
        clickCount++;
        if (clickCount >= 5) {
          clickCount = 0;
          this.discoMode = !this.discoMode;
          this.createRubberDuck(new THREE.Vector3(0, 2.5, 0), true);
          this.unlockEasterEgg('disco');
        }
      }
    };

    mascot.addEventListener('pointerup', endDrag);
    mascot.addEventListener('pointercancel', endDrag);
  }

  // ----------------------------------------
  // 9. 動畫與物理主迴圈
  // ----------------------------------------
  animate() {
    requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;
    const dt = 0.016;

    // 1. 平滑過渡臉盆與乾爽藍黃毯木桌位置
    this.tubGroup.position.x += (this.tubTargetX - this.tubGroup.position.x) * dt * 5.5;
    this.benchGroup.position.x += (this.benchTargetX - this.benchGroup.position.x) * dt * 5.5;

    // 2. 更新物理與水面
    this.updatePhysics(dt);
    this.updateWaterSurface(dt, time);
    this.updateWaterParticles(dt);
    this.updateFloatingBubbles(dt, time);

    // 3. 彩蛋 6 霓虹派對燈光秀
    if (this.discoMode) {
      const hue = (time * 0.5) % 1;
      this.partyLight.color.setHSL(hue, 0.9, 0.55);
      this.partyLight.intensity = 1.6;
    }

    // 4. 處理祥祥三種狀態姿態：全場自由狂奔 (running) vs 站立/跳躍 vs 藍黃毯趴睡 (isLyingDown)
    if (this.dogState === 'running') {
      this.runTime += dt;
      this.runTargetTimer -= dt;
      if (this.jumpProgress > 0) {
        this.jumpProgress = Math.max(0, this.jumpProgress - dt * 2.2);
      }

      const curPos = this.dogGroup.position;
      const dx = this.runTarget.x - curPos.x;
      const dz = this.runTarget.z - curPos.z;
      const distToTarget = Math.hypot(dx, dz);

      // 抵達隨機目標點或計時結束時，立即挑選下一個草地目標點，全場自由到處跑！
      if (distToTarget < 0.48 || this.runTargetTimer <= 0) {
        this.pickNewRunTarget();
      }

      const dirX = dx / (distToTarget || 1);
      const dirZ = dz / (distToTarget || 1);
      // 活潑小狗奔跑時的自然S型微幅靈動折返感
      const weave = Math.sin(this.runTime * 6.2) * 0.26;
      let steerX = dirX - dirZ * weave;
      let steerZ = dirZ + dirX * weave;

      // 跳離中央後，若經過中央臉盆或木床附近，自動沿切線流暢繞行不穿模
      const distCenter = Math.hypot(curPos.x, curPos.z);
      if (this.runTime > 0.28 && distCenter < 1.72 && distCenter > 0.01) {
        const pushWeight = (1.72 - distCenter) / 1.72;
        const outX = curPos.x / distCenter;
        const outZ = curPos.z / distCenter;
        const cross = outX * steerZ - outZ * steerX;
        const tangSign = cross >= 0 ? 1 : -1;
        steerX += (outX * 1.4 - outZ * tangSign * 1.2) * pushWeight * 2.4;
        steerZ += (outZ * 1.4 + outX * tangSign * 1.2) * pushWeight * 2.4;
      }

      const steerLen = Math.hypot(steerX, steerZ) || 1;
      const targetVx = (steerX / steerLen) * this.runSpeed;
      const targetVz = (steerZ / steerLen) * this.runSpeed;

      this.runVel.x += (targetVx - this.runVel.x) * Math.min(1, dt * 6.5);
      this.runVel.z += (targetVz - this.runVel.z) * Math.min(1, dt * 6.5);

      const aspect = this.width / Math.max(1, this.height);
      const maxX = aspect < 0.8 ? 2.05 : (aspect < 1.2 ? 2.85 : 3.6);
      const minZ = -2.85;
      const maxZ = 2.35;

      let nextX = curPos.x + this.runVel.x * dt;
      let nextZ = curPos.z + this.runVel.z * dt;

      if (nextX < -maxX || nextX > maxX) {
        nextX = Math.max(-maxX, Math.min(maxX, nextX));
        this.runVel.x *= -0.7;
        this.pickNewRunTarget();
      }
      if (nextZ < minZ || nextZ > maxZ) {
        nextZ = Math.max(minZ, Math.min(maxZ, nextZ));
        this.runVel.z *= -0.7;
        this.pickNewRunTarget();
      }

      const jumpArc = Math.sin(this.jumpProgress * Math.PI) * 0.78;
      const gallopBounce = Math.abs(Math.sin(this.runTime * 16.5)) * 0.20;
      this.dogGroup.position.set(nextX, jumpArc + gallopBounce, nextZ);

      // 平滑轉向奔跑速度方向（最短角度插值）
      if (Math.hypot(this.runVel.x, this.runVel.z) > 0.1) {
        const targetYaw = Math.atan2(this.runVel.x, this.runVel.z);
        let diff = targetYaw - this.dogGroup.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.dogGroup.rotation.y += diff * Math.min(1, dt * 12);
      }

      // 四肢真實奔跑交替擺動動畫
      const stride = Math.sin(time * 22) * 0.65;
      this.legs.FL.rotation.x = stride;
      this.legs.BR.rotation.x = stride;
      this.legs.FR.rotation.x = -stride;
      this.legs.BL.rotation.x = -stride;

      // 奔跑時甩出泡泡
      if (Math.random() < 0.25) {
        this.spawnFloatingBubble(this.dogGroup.position.clone().add(new THREE.Vector3(0, 1.1, 0)), 1);
      }
    } else {
      // 跳出臉盆或站上木桌的彈跳弧線
      if (this.jumpProgress > 0) {
        this.jumpProgress = Math.max(0, this.jumpProgress - dt * 2.4);
      }
      const baseHeight = this.basinRemoved ? 0.36 : 0;
      const jumpArc = Math.sin(this.jumpProgress * Math.PI) * 0.85;
      this.dogGroup.position.set(0, baseHeight + jumpArc, 0);
      this.dogGroup.rotation.y += (0 - this.dogGroup.rotation.y) * dt * 6;

      // 趴在木床藍黃格紋毯上睡覺姿勢 vs 挺拔站姿
      const targetBodyY = this.isLyingDown ? -0.45 : 0;
      this.dogBodyRoot.position.y += (targetBodyY - this.dogBodyRoot.position.y) * dt * 6;

      if (this.isLyingDown) {
        this.legs.FL.rotation.x = -Math.PI / 2.2;
        this.legs.FR.rotation.x = -Math.PI / 2.2;
        this.legs.BL.rotation.x = Math.PI / 2.3;
        this.legs.BR.rotation.x = Math.PI / 2.3;
        this.neckPivot.rotation.x = 0.42;
      } else {
        ['FL', 'FR', 'BL', 'BR'].forEach(k => {
          this.legs[k].rotation.x += (0 - this.legs[k].rotation.x) * dt * 8;
        });
        this.neckPivot.rotation.x += (0 - this.neckPivot.rotation.x) * dt * 8;
      }
    }

    // 5. 祥祥彈簧物理晃動與甩水動畫
    const stiffness = 170;
    const damping = 12;
    this.dogJiggle.vx += (-stiffness * this.dogJiggle.x - damping * this.dogJiggle.vx) * dt;
    this.dogJiggle.vz += (-stiffness * this.dogJiggle.z - damping * this.dogJiggle.vz) * dt;
    this.dogJiggle.x += this.dogJiggle.vx * dt;
    this.dogJiggle.z += this.dogJiggle.vz * dt;

    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const shakeAngle = Math.sin(time * 55) * 0.28;
      this.dogBodyRoot.rotation.z = shakeAngle;
      this.headGroup.rotation.z = -shakeAngle * 1.25;
    } else {
      this.dogBodyRoot.rotation.z = this.dogJiggle.x * 0.22;
      this.dogBodyRoot.rotation.x = this.dogJiggle.z * 0.18;
      this.headGroup.rotation.z = Math.sin(time * 1.8) * 0.04 + this.dogJiggle.x * 0.3;
    }

    // 6. 祥祥招牌白尾尖長尾巴開心搖擺
    if (this.tailPivot) {
      const wagSpeed = 6.0 + (this.happiness / 100) * 10.0;
      this.tailPivot.rotation.z = Math.sin(time * wagSpeed) * 0.46;
    }

    // 7. 祥祥大黑立耳靈動微動
    if (this.ears && this.ears.length === 2) {
      this.ears[0].rotation.z = -0.24 + Math.sin(time * 2.8) * 0.05;
      this.ears[1].rotation.z = 0.24 - Math.sin(time * 2.8) * 0.05;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new BathGame3D();
});
