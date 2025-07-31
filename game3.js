class DOGame {
    constructor() {
        this.selectedLevel = 3; // ★デフォルトレベル3（1+2）
        this.mapData = [];
        this.mouseRuRu = [];
        this.boardSize = 0;
        this.tileSize = 70;
        this.tiles = [];
        this.startTime = 0;
        this.sumMouseRuRu = 0;
        this.colorMode = true;
        this.heldTile = null;
        this.heldTileMousePos = null;
        this.selectedTileValue = null;
        this.isCleared = false;
        this.clearButtonRect = null;
        // 手数管理を追加
        this.moveCount = 0;
        this.timerElement = null;
        this.moveCountElement = null; // 手数表示用
        
        // ★年齢層管理を追加
        this.ageGroup = null; // 'adult', 'senior-child'
        this.adsEnabled = false; // 広告表示フラグ
        
        // ★タイマー設定管理を追加
        this.timerEnabled = true; // タイマーON/OFF設定
        this.gameTimer = null; // タイマーのインターバルID
        this.isTimerRunning = false; // タイマー動作状態
        
        this.initializeElements();
        this.setupEventListeners();
        
        // ★即座に年齢選択を初期化（DOM要素の初期状態を保持）
        this.initializeAgeSelection();
    }
    
    // ★年齢選択の初期化
    initializeAgeSelection() {
        console.log('年齢選択初期化開始');
        
        // 要素の存在確認
        const ageSelectScreen = document.getElementById('ageSelectScreen');
        const mainMenuScreen = document.getElementById('mainMenu');
        
        if (!ageSelectScreen || !mainMenuScreen) {
            console.error('年齢選択画面またはメインメニュー画面が見つかりません');
            return;
        }
        
        // ローカルストレージから設定を読み込み
        const savedAgeGroup = localStorage.getItem('gameAgeGroup');
        const savedTimerEnabled = localStorage.getItem('gameTimerEnabled');
        
        console.log('保存された年齢層設定:', savedAgeGroup);
        console.log('保存されたタイマー設定:', savedTimerEnabled);
        
        // タイマー設定を復元
        if (savedTimerEnabled !== null) {
            this.timerEnabled = savedTimerEnabled === 'true';
            if (this.elements.timerEnabled) {
                this.elements.timerEnabled.checked = this.timerEnabled;
            }
        }
        
        if (savedAgeGroup) {
            this.setAgeGroup(savedAgeGroup);
            console.log('保存された設定でメインメニューへ');
            // ★少し遅延させてから画面切り替え
            setTimeout(() => {
                this.showMainMenu();
            }, 50);
        } else {
            console.log('初回訪問: 年齢選択画面を維持');
            // ★初回訪問時は現在のHTML状態（年齢選択画面がactive）を維持
            // 何もしない（HTMLで既にageSelectScreenがactiveになっている）
        }
    }
    
    // ★年齢層を設定
    setAgeGroup(ageGroup) {
        this.ageGroup = ageGroup;
        this.adsEnabled = (ageGroup === 'adult');
        
        // ローカルストレージに保存
        localStorage.setItem('gameAgeGroup', ageGroup);
        
        // 広告の表示/非表示を制御
        this.controlAdDisplay();
        
        console.log(`年齢層設定: ${ageGroup}, 広告表示: ${this.adsEnabled}`);
    }
    
    // ★デバッグ用：年齢設定をリセット
    resetAgeSelection() {
        localStorage.removeItem('gameAgeGroup');
        localStorage.removeItem('gameTimerEnabled');
        this.ageGroup = null;
        this.adsEnabled = false;
        this.timerEnabled = true;
        console.log('年齢設定をリセットしました');
        location.reload(); // ページをリロード
    }
    
    // ★タイマー設定を変更
    setTimerEnabled(enabled) {
        this.timerEnabled = enabled;
        localStorage.setItem('gameTimerEnabled', enabled.toString());
        console.log(`タイマー設定: ${enabled ? 'ON' : 'OFF'}`);
        
        // ゲーム中の場合、タイマー表示を即座に更新
        if (this.screens.game.classList.contains('active')) {
            this.updateTimerDisplay();
        }
    }
    
    // ★広告の表示制御
    controlAdDisplay() {
        const adContainers = document.querySelectorAll('.ad-container');
        
        adContainers.forEach(container => {
            if (this.adsEnabled) {
                container.style.display = 'flex';
                container.style.visibility = 'visible';
            } else {
                container.style.display = 'none';
                container.style.visibility = 'hidden';
            }
        });
    }
    
    // ★年齢選択画面を表示
    showAgeSelection() {
        console.log('年齢選択画面を表示');
        this.showScreen('ageSelect');
    }
    
    // ★メインメニューを表示
    showMainMenu() {
        this.showScreen('mainMenu');
    }
    
    initializeElements() {
        this.screens = {
            ageSelect: document.getElementById('ageSelectScreen'), // ★追加
            mainMenu: document.getElementById('mainMenu'),
            rules: document.getElementById('rulesScreen'),
            game: document.getElementById('gameScreen'),
            end: document.getElementById('endScreen'),
            retireConfirm: document.getElementById('retireConfirmScreen'),
            stuckConfirm: document.getElementById('stuckConfirmScreen'),
            records: document.getElementById('recordsScreen') // ★追加
        };
        
        this.elements = {
            // ★年齢選択関連の要素
            seniorChildButton: document.getElementById('seniorChildButton'),
            adultButton: document.getElementById('adultButton'),
            settingsButton: document.getElementById('settingsButton'),
            
            // ★タイマー設定の要素
            timerEnabled: document.getElementById('timerEnabled'),
            
            levelSelect: document.getElementById('levelSelect'),
            playButton: document.getElementById('playButton'),
            rulesButton: document.getElementById('rulesButton'),
            closeRulesButton: document.getElementById('closeRulesButton'),
            gameRulesButton: document.getElementById('gameRulesButton'),
            retireButton: document.getElementById('retireButton'),
            backToMenuButton: document.getElementById('backToMenuButton'),
            timer: document.getElementById('timer'),
            clearTime: document.getElementById('clearTime'),
            clearMoves: document.getElementById('clearMoves'),
            levelClearInfo: document.getElementById('levelClearInfo'),
            colorMode: document.getElementById('colorMode'),
            confirmRetireYes: document.getElementById('confirmRetireYes'),
            confirmRetireNo: document.getElementById('confirmRetireNo'),
            confirmStuckYes: document.getElementById('confirmStuckYes'),
            confirmStuckNo: document.getElementById('confirmStuckNo'),
            // ★記録関連を追加
            recordsButton: document.getElementById('recordsButton'),
            backToMenuFromRecords: document.getElementById('backToMenuFromRecords'),
            clearRecordsButton: document.getElementById('clearRecordsButton'),
            recordsTableBody: document.getElementById('recordsTableBody'),
            // ★年齢選択ボタンを追加
            ageAdult: document.getElementById('ageAdult'),
            ageSenior: document.getElementById('ageSenior'),
            ageChild: document.getElementById('ageChild')
        };
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.timerElement = document.getElementById('timer');
        
        // 手数表示要素を作成（タイマーの隣に表示）
        if (this.timerElement && !this.moveCountElement) {
            this.moveCountElement = document.createElement('div');
            this.moveCountElement.id = 'moveCounter';
            this.moveCountElement.textContent = 'Moves: 0';
            this.moveCountElement.style.cssText = `
                font-size: 1.5rem;
                font-weight: bold;
                color: #333;
                margin-left: 20px;
            `;
            this.timerElement.parentElement.appendChild(this.moveCountElement);
        }
    }
    
    setupEventListeners() {
        // ★年齢選択のイベントリスナー
        this.elements.seniorChildButton.addEventListener('click', () => {
            this.setAgeGroup('senior-child');
            this.showMainMenu();
        });
        
        this.elements.adultButton.addEventListener('click', () => {
            this.setAgeGroup('adult');
            this.showMainMenu();
        });
        
        this.elements.settingsButton.addEventListener('click', () => {
            this.showAgeSelection();
        });
        
        // ★タイマー設定のイベントリスナー
        this.elements.timerEnabled.addEventListener('change', (e) => {
            this.setTimerEnabled(e.target.checked);
        });
        
        this.elements.playButton.addEventListener('click', () => this.startGame());
        this.elements.rulesButton.addEventListener('click', () => this.showRules());
        this.elements.closeRulesButton.addEventListener('click', () => this.showMainMenu());
        this.elements.gameRulesButton.addEventListener('click', () => this.showRules());
        this.elements.retireButton.addEventListener('click', () => this.showRetireConfirm());
        this.elements.backToMenuButton.addEventListener('click', () => this.showMainMenu());
        this.elements.levelSelect.addEventListener('change', (e) => {
            this.selectedLevel = parseInt(e.target.value) + 3;
        });
        this.elements.colorMode.addEventListener('change', (e) => {
            this.colorMode = e.target.checked;
            if (this.screens.game.classList.contains('active')) {
                this.drawGame();
            }
        });
        this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // リタイヤ確認画面のボタンイベント
        this.elements.confirmRetireYes.addEventListener('click', () => this.showStuckConfirm());
        this.elements.confirmRetireNo.addEventListener('click', () => this.showGame());

        // 詰んだ確認画面のボタンイベント
        this.elements.confirmStuckYes.addEventListener('click', () => this.showMainMenu());
        this.elements.confirmStuckNo.addEventListener('click', () => this.showGame());

        // ★新たに追加
        this.elements.recordsButton.addEventListener('click', () => this.showRecords());
        this.elements.backToMenuFromRecords.addEventListener('click', () => this.showMainMenu());
        this.elements.clearRecordsButton.addEventListener('click', () => this.clearAllRecords());
    }
    
    showScreen(screenName) {
        console.log('画面切り替え:', screenName);
        
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            }
        });
        
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            console.log('画面表示成功:', screenName);
        } else {
            console.error('画面が見つかりません:', screenName, 'Available screens:', Object.keys(this.screens));
        }
        
        if (screenName !== 'game' && this.canvas && this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // ★画面切り替え時に広告制御を実行（年齢選択画面以外）
        if (this.ageGroup && screenName !== 'ageSelect') {
            this.controlAdDisplay();
        }
    }
    
    // ★メインメニューを表示（年齢選択後）
    showMainMenu() { 
        this.showScreen('mainMenu'); 
        this.resetGame(); 
    }
    
    showRules() { 
        this.showScreen('rules'); 
    }

    showGame() {
        this.showScreen('game');
        // ゲーム画面に戻る際に描画を再開
        if (this.tiles.length > 0) {
            this.drawGame();
        }
    }

    showRetireConfirm() {
        this.showScreen('retireConfirm');
    }

    showStuckConfirm() {
        this.showScreen('stuckConfirm');
    }

    // ★新たに追加
    showRecords() {
        this.updateRecordsTable();
        this.showScreen('records');
    }

    startGame() {
        if (this.selectedLevel === 0 || this.selectedLevel < 3) {
            alert('レベルを選択してください');
            return;
        }
        this.showScreen('game');
        this.initializeGame();
        this.startTimer();
        
        // レベル1の場合のみルールボタンを表示
        const currentLevel = this.selectedLevel - 2;
        if (currentLevel === 1) {
            this.elements.gameRulesButton.style.display = 'inline-block';
        } else {
            this.elements.gameRulesButton.style.display = 'none';
        }
        
        // 手数をリセット
        this.resetMoveCount();
    }
    
    initializeGame() {
        this.boardSize = this.selectedLevel;
        this.generateDiamondMap();
        this.setupCanvas();
        this.drawGame();
        this.updateTimerDisplay(); // タイマー表示を更新
    }
    
    generateDiamondMap() {
        const N = this.boardSize;
        this.mapData = Array(N).fill().map(() => Array(N).fill(999));
        this.mouseRuRu = Array(N).fill().map(() => Array(N).fill(0));
        this.tiles = [];
        let upperPos = [], lowerPos = [];
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
            if (x + y < N - 1) upperPos.push([x, y]);
            else if (x + y > N - 1) lowerPos.push([x, y]);
        }
        let upperVals = [];
        for (let i = 1; i <= upperPos.length; i++) upperVals.push(i);
        upperVals = upperVals.sort(() => Math.random() - 0.5);
        let lowerVals = [];
        for (let i = 1; i <= lowerPos.length; i++) lowerVals.push(i);
        lowerVals = lowerVals.sort(() => Math.random() - 0.5);
        upperPos.forEach(([x, y], idx) => { this.mapData[y][x] = upperVals[idx]; });
        lowerPos.forEach(([x, y], idx) => { this.mapData[y][x] = lowerVals[idx]; });
    }
    
    setupCanvas() {
        const N = this.boardSize, s = this.tileSize, margin = s;
        const TOP_MARGIN = 120;

        const boardHeight = (N - 1) * s + s;
        const canvasW = ((N - 1) * s) + s * 2 + margin * 2;
        const canvasH = boardHeight + TOP_MARGIN + margin * 2;

        this.canvas.width = canvasW;
        this.canvas.height = canvasH;

        this.centerX = Math.floor(canvasW / 2);
        this.centerY = TOP_MARGIN;

        this.ms = [];
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++)
            this.ms.push({
                x, y,
                screenX: this.centerX + (x - y) * s / 2,
                screenY: this.centerY + (x + y) * s / 2,
                value: this.mapData[y][x]
            });
        this.tiles = this.ms.filter(cell => cell.value < 999);

        if (this.canvasScale === undefined) {
            const maxW = window.innerWidth;
            const maxH = window.innerHeight;
            this.canvasScale = Math.min(1, maxW / canvasW, maxH / canvasH);
            this.canvas.style.width = (canvasW * this.canvasScale) + 'px';
            this.canvas.style.height = (canvasH * this.canvasScale) + 'px';
        }
    }
    
    drawGrid() {
        const s = this.tileSize;
        this.ctx.save();
        this.ctx.strokeStyle = '#888';
        this.ctx.lineWidth = 2;
        for (const cell of this.ms) {
            const cx = cell.screenX, cy = cell.screenY;
            this.ctx.beginPath();
            this.ctx.moveTo(cx, cy - s / 2);
            this.ctx.lineTo(cx + s / 2, cy);
            this.ctx.lineTo(cx, cy + s / 2);
            this.ctx.lineTo(cx - s / 2, cy);
            this.ctx.closePath();
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
    
    drawGame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // ★豪華なゲーム背景
        this.ctx.save();

        // ベースのグラデーション
        const baseGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        baseGradient.addColorStop(0, '#f8f9fa');
        baseGradient.addColorStop(0.3, '#e9ecef');
        baseGradient.addColorStop(0.7, '#dee2e6');
        baseGradient.addColorStop(1, '#ced4da');
        this.ctx.fillStyle = baseGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 放射状のグラデーション（中央の光）
        const centerGradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.boardSize * this.tileSize * 1.5
        );
        centerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        centerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = centerGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 装飾的な円
        this.ctx.globalAlpha = 0.1;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = this.boardSize * this.tileSize * 0.8;
            const x = this.centerX + Math.cos(angle) * radius;
            const y = this.centerY + Math.sin(angle) * radius;

            const circleGradient = this.ctx.createRadialGradient(x, y, 0, x, y, 50);
            circleGradient.addColorStop(0, '#40CFFF');
            circleGradient.addColorStop(1, 'rgba(64, 207, 255, 0)');
            this.ctx.fillStyle = circleGradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 50, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;

        // 波紋効果
        this.ctx.globalAlpha = 0.08;
        for (let i = 0; i < 5; i++) {
            const waveRadius = (this.boardSize * this.tileSize * 0.3) + (i * 20);
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, waveRadius, 0, Math.PI * 2);
            this.ctx.strokeStyle = '#40CFFF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1;

        // 四隅の装飾
        this.ctx.globalAlpha = 0.15;
        const corners = [
            {x: 0, y: 0}, {x: this.canvas.width, y: 0},
            {x: 0, y: this.canvas.height}, {x: this.canvas.width, y: this.canvas.height}
        ];
        corners.forEach(corner => {
            const cornerGradient = this.ctx.createRadialGradient(
                corner.x, corner.y, 0,
                corner.x, corner.y, 100
            );
            cornerGradient.addColorStop(0, '#5555FF');
            cornerGradient.addColorStop(1, 'rgba(85, 85, 255, 0)');
            this.ctx.fillStyle = cornerGradient;
            this.ctx.beginPath();
            this.ctx.arc(corner.x, corner.y, 100, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;

        this.ctx.restore();

        this.drawGrid();
        
        // ★移動可能位置のハイライト表示
        if (this.heldTile) {
            this.drawValidMoves(this.heldTile);
        }
        
        this.tiles.forEach(tile => {
            if (this.heldTile && tile.x === this.heldTile.x && tile.y === this.heldTile.y) return;
            this.drawDiamondTile(tile, this.selectedTileValue !== null && tile.value === this.selectedTileValue);
        });
        if (this.heldTile) {
            this.drawDiamondTile({
                ...this.heldTile,
                screenX: this.heldTileMousePos ? this.heldTileMousePos[0] : this.heldTile.screenX,
                screenY: this.heldTileMousePos ? this.heldTileMousePos[1] : this.heldTile.screenY,
                isHeld: true
            }, true);
        }

        // ★著作権表示
        this.ctx.save();
        this.ctx.font = "11px Arial";
        this.ctx.fillStyle = "rgba(102, 102, 102, 0.5)";
        this.ctx.textAlign = "left";
        this.ctx.fillText("このゲームをパクらないで", 10, this.canvas.height - 50);
        this.ctx.fillText("作成日: 2025/7/5", 10, this.canvas.height - 35);
        this.ctx.fillText("クリエイター: Yaminion", 10, this.canvas.height - 20);
        this.ctx.restore();

        // ★クリア時の表示（上部に配置）
        if (this.isCleared) {
            this.ctx.save();
            this.ctx.font = "bold 32px Arial";
            this.ctx.fillStyle = "#40CFFF";
            this.ctx.strokeStyle = "#fff";
            this.ctx.lineWidth = 2;
            this.ctx.textAlign = "center";
            this.ctx.shadowColor = "rgba(64, 207, 255, 0.5)";
            this.ctx.shadowBlur = 20;
            this.ctx.strokeText("🎉 CLEAR! 🎉", this.canvas.width / 2, 50);
            this.ctx.fillText("🎉 CLEAR! 🎉", this.canvas.width / 2, 50);
            this.ctx.restore();

            // 次へボタン（右上に配置）
            const btnX = this.canvas.width - 100;
            const btnY = 80;
            const btnW = 160, btnH = 50;

            this.ctx.save();
            const buttonGradient = this.ctx.createLinearGradient(btnX - btnW/2, btnY - btnH/2, btnX + btnW/2, btnY + btnH/2);
            buttonGradient.addColorStop(0, '#40CFFF');
            buttonGradient.addColorStop(1, '#5555FF');

            // ★roundRectの代わりに手動で角丸四角形を描画
            this.drawRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 15);
            this.ctx.fillStyle = buttonGradient;
            this.ctx.shadowColor = "rgba(64, 207, 255, 0.4)";
            this.ctx.shadowBlur = 15;
            this.ctx.fill();
            this.ctx.strokeStyle = "#fff";
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.font = "bold 18px Arial";
            this.ctx.fillStyle = "#fff";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText("✨ 次へ ✨", btnX, btnY);
            this.ctx.restore();
            
            this.clearButtonRect = { x: btnX - btnW / 2, y: btnY - btnH / 2, w: btnW, h: btnH };
        } else {
            this.clearButtonRect = null;
        }
    }
    
    // ★移動可能位置をハイライトする関数
    drawValidMoves(tile) {
        const validMoves = this.getValidMoves(tile.x, tile.y);
        
        this.ctx.save();
        validMoves.forEach(move => {
            const cell = this.ms.find(c => c.x === move.x && c.y === move.y);
            if (cell) {
                const s = this.tileSize * 0.8;
                const cx = cell.screenX;
                const cy = cell.screenY;
                
                // 移動可能な位置を青く光らせる
                this.ctx.globalAlpha = 0.4;
                this.ctx.fillStyle = '#40CFFF';
                this.ctx.beginPath();
                this.ctx.moveTo(cx, cy - s / 2);
                this.ctx.lineTo(cx + s / 2, cy);
                this.ctx.lineTo(cx, cy + s / 2);
                this.ctx.lineTo(cx - s / 2, cy);
                this.ctx.closePath();
                this.ctx.fill();
                
                // 枠線も追加
                this.ctx.globalAlpha = 0.8;
                this.ctx.strokeStyle = '#40CFFF';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }
        });
        this.ctx.restore();
    }
    
    // ★移動可能な位置を取得する関数（直線上の空きマスを全て検索）
    getValidMoves(startX, startY) {
        const validMoves = [];
        const directions = [
            { dx: 0, dy: -1 }, // 上
            { dx: 1, dy: 0 },  // 右
            { dx: 0, dy: 1 },  // 下
            { dx: -1, dy: 0 }  // 左
        ];
        
        directions.forEach(dir => {
            let x = startX + dir.dx;
            let y = startY + dir.dy;
            
            // 各方向に対して連続した空きマスを探す
            while (x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize) {
                if (this.mapData[y][x] >= 999) {
                    // 空きマスが見つかった場合、移動可能位置として追加
                    validMoves.push({ x, y });
                } else {
                    // タイルがある場合は、その方向への移動を停止
                    break;
                }
                x += dir.dx;
                y += dir.dy;
            }
        });
        
        return validMoves;
    }
    
    // ★手動で角丸四角形を描画する関数
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    drawDiamondTile(tile, highlight = false) {
        const s = this.tileSize * 0.8, cx = tile.screenX, cy = tile.screenY;
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#E95D72', '#66B933', '#A575F5', '#FF9D32'];
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - s / 2);
        this.ctx.lineTo(cx + s / 2, cy);
        this.ctx.lineTo(cx, cy + s / 2);
        this.ctx.lineTo(cx - s / 2, cy);
        this.ctx.closePath();
        this.ctx.fillStyle = this.colorMode ? colors[(tile.value - 1) % colors.length] : '#E0E0E0';
        this.ctx.globalAlpha = tile.isHeld ? 0.7 : 1;
        this.ctx.fill(); this.ctx.globalAlpha = 1;
        
        if (highlight) {
            this.ctx.save();
            this.ctx.strokeStyle = "#40CFFF";
            this.ctx.lineWidth = 6;
            this.ctx.shadowColor = "#40CFFF";
            this.ctx.shadowBlur = 15;
            this.ctx.stroke();
            this.ctx.restore();
        }
        if (this.mouseRuRu[tile.y][tile.x] === 1) { this.ctx.strokeStyle = '#FFD700'; this.ctx.lineWidth = 3; }
        else if (tile.isHeld) { this.ctx.strokeStyle = '#FF3333'; this.ctx.lineWidth = 4; }
        else { this.ctx.strokeStyle = '#333'; this.ctx.lineWidth = 2; }
        this.ctx.stroke();
        this.ctx.fillStyle = this.colorMode ? "#222" : "#333";
        this.ctx.font = `bold ${this.tileSize / 2.3}px Arial`;
        this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
        this.ctx.fillText(tile.value, cx, cy);
        this.ctx.restore();
    }
    
    // 手数をリセット
    resetMoveCount() {
        this.moveCount = 0;
        this.updateMoveDisplay();
    }
    
    // 手数を増加
    incrementMoveCount() {
        this.moveCount++;
        this.updateMoveDisplay();
        console.log(`手数: ${this.moveCount}`);
    }
    
    // 手数表示を更新
    updateMoveDisplay() {
        if (this.moveCountElement) {
            this.moveCountElement.textContent = `Moves: ${this.moveCount}`;
        }
    }
    
    onCanvasClick(event) {
        const [cx, cy] = this.getCanvasXY(event);
        
        if (this.isCleared && this.clearButtonRect) {
            const r = this.clearButtonRect;
            if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) {
                this.isCleared = false;
                this.clearButtonRect = null;
                this.endGame();
                return;
            }
        }
        
        if (!this.heldTile) {
            const tile = this.getTileAt(cx, cy, false, true);
            if (tile) {
                this.heldTile = { ...tile };
                this.heldTileMousePos = [cx, cy];
                this.selectedTileValue = tile.value;
                this.drawGame();
            } else {
                this.selectedTileValue = null;
                this.drawGame();
            }
        } else {
            const emptyTile = this.getTileAt(cx, cy, true);
            if (emptyTile && this.mapData[emptyTile.y][emptyTile.x] >= 999) {
                const validMoves = this.getValidMoves(this.heldTile.x, this.heldTile.y);
                const isValidMove = validMoves.some(move => move.x === emptyTile.x && move.y === emptyTile.y);
                
                if (isValidMove) {
                    const sx = this.heldTile.x, sy = this.heldTile.y;
                    
                    // ★手数カウント（常にカウント、移動しなくても）
                    this.incrementMoveCount();
                    
                    this.mapData[emptyTile.y][emptyTile.x] = this.heldTile.value;
                    this.mapData[sy][sx] = 999;
                    this.updateMouseRuRuAfterMove(emptyTile.x, emptyTile.y);
                    this.updateMouseRuRuAfterMove(sx, sy);
                    this.setupCanvas();
                    
                    if (this.checkWin()) {
                        this.isCleared = true;
                        this.stopTimer();
                        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                        this.clearTimeSeconds = elapsed;
                        this.heldTile = null;
                        this.heldTileMousePos = null;
                        this.selectedTileValue = null;
                        this.drawGame();
                        return;
                    }
                } else {
                    // ★移動できない場所でも手数カウント
                    this.incrementMoveCount();
                }
            } else {
                // ★空きマス以外をクリックした場合も手数カウント
                this.incrementMoveCount();
            }
            
            this.heldTile = null;
            this.heldTileMousePos = null;
            this.selectedTileValue = null;
            this.drawGame();
        }
        
        // クリア時の処理部分で記録を保存
        if (this.sumMouseRuRu === this.tiles.length) {
            this.isCleared = true;
            this.stopTimer();
            
            // ★記録を保存
            const currentLevel = this.selectedLevel - 2;
            const clearTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.saveRecord(currentLevel, clearTime, this.moveCount);
            
            // 既存のコード...
        }
    }
    
    onMouseMove(event) {
        if (this.isCleared) return;
        
        if (this.heldTile) {
            this.heldTileMousePos = this.getCanvasXY(event);
            this.drawGame();
        }
    }
    
    getCanvasXY(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return [
            (event.clientX - rect.left) * scaleX,
            (event.clientY - rect.top) * scaleY
        ];
    }
    
    getTileAt(x, y, emptyOnly = false, movableOnly = false) {
        const s = this.tileSize * 0.8;
        let res = null;
        for (const cell of this.ms) {
            if (emptyOnly && this.mapData[cell.y][cell.x] < 999) continue;
            if (!emptyOnly && this.mapData[cell.y][cell.x] >= 999) continue;
            if (movableOnly && this.mouseRuRu[cell.y][cell.x] === 1) continue;
            const dx = Math.abs(x - cell.screenX), dy = Math.abs(y - cell.screenY);
            if (dx / (s / 2) + dy / (s / 2) <= 1) { res = cell; break; }
        }
        return res;
    }
    
    updateMouseRuRuAfterMove(x, y) {
        if (this.mapData[y][x] >= 999) return;
        const dirs = [
            { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
        ];
        for (const dir of dirs) {
            const nx = x + dir.dx, ny = y + dir.dy;
            if (
                ny >= 0 && ny < this.mapData.length &&
                nx >= 0 && nx < this.mapData.length &&
                this.mapData[ny][nx] < 999 &&
                this.mapData[y][x] === this.mapData[ny][nx]
            ) {
                if (this.mouseRuRu[y][x] === 0) { this.mouseRuRu[y][x] = 1; this.sumMouseRuRu++; }
                if (this.mouseRuRu[ny][nx] === 0) { this.mouseRuRu[ny][nx] = 1; this.sumMouseRuRu++; }
            }
        }
    }
    
    checkWin() {
        let totalTiles = 0;
        for (let y = 0; y < this.mapData.length; y++)
            for (let x = 0; x < this.mapData.length; x++)
                if (this.mapData[y][x] < 999) totalTiles++;
        return this.sumMouseRuRu >= totalTiles;
    }
    
    startTimer() {
        if (!this.timerEnabled) {
            this.updateTimerDisplay();
            return;
        }
        this.startTime = Date.now();
        this.elements.timer.textContent = `Time: 0s`;
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.elements.timer.textContent = `Time: ${elapsed}s`;
        }, 1000);
    }
    
    stopTimer() { 
        if (this.timerInterval) clearInterval(this.timerInterval); 
    }
    
    updateTimerDisplay() {
        if (this.elements.timer) {
            this.elements.timer.style.display = this.timerEnabled ? 'block' : 'none';
        }
    }
    
    endGame() {
        // クリア時間を設定
        if (this.clearTimeSeconds !== undefined) {
            this.elements.clearTime.textContent = `Time: ${this.clearTimeSeconds}s`;
        }
        
        // ★手数を設定
        if (this.elements.clearMoves) {
            this.elements.clearMoves.textContent = `Moves: ${this.moveCount}`;
        }
        
        const currentLevel = this.selectedLevel - 2;
        this.elements.levelClearInfo.textContent = `Level ${currentLevel} クリア！`;
        
        // ★記録を保存
        const isNewRecord = this.saveRecord(currentLevel, this.clearTimeSeconds || 0, this.moveCount);
        if (isNewRecord) {
            // 新記録アニメーション（オプション）
            console.log('🎉 新記録達成！');
        }
        
        // 自動レベルアップ
        if (currentLevel < 10) {
            const nextLevelIndex = currentLevel;
            this.elements.levelSelect.selectedIndex = nextLevelIndex;
            this.selectedLevel = nextLevelIndex + 3;
        }
        
        this.showScreen('end');
    }
    
    resetGame() {
        this.stopTimer();
        this.mapData = [];
        this.tiles = [];
        this.heldTile = null;
        this.heldTileMousePos = null;
        this.sumMouseRuRu = 0;
        this.mouseRuRu = [];
        this.canvasScale = undefined;
        this.isCleared = false;
        this.clearButtonRect = null;
        this.clearTimeSeconds = undefined;
        
        this.resetMoveCount();
        
        if (this.canvas && this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.elements.timer.textContent = 'Time: 0s';
    }
    
    // ★新たに追加
    updateRecordsTable() {
        const tbody = this.elements.recordsTableBody;
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        for (let level = 1; level <= 10; level++) {
            const record = this.getRecord(level);
            const row = tbody.insertRow();
            
            // レベル列
            const levelCell = row.insertCell(0);
            levelCell.textContent = `Level ${level}`;
            levelCell.className = 'level-cell';
            
            // クリア人数列
            const clearCountCell = row.insertCell(1);
            if (record.cleared) {
                clearCountCell.textContent = '1人';
                clearCountCell.className = 'cleared-cell';
            } else {
                clearCountCell.textContent = '未クリア';
                clearCountCell.className = 'not-cleared-cell';
            }
            
            // ベストタイム/手数列
            const recordCell = row.insertCell(2);
            if (record.cleared) {
                recordCell.textContent = `${record.bestTime}s / ${record.bestMoves}手`;
                recordCell.className = 'record-cell';
                
                // 最高記録にハイライト
                if (this.isBestRecord(level, record)) {
                    recordCell.classList.add('best-record');
                }
            } else {
                recordCell.textContent = '---';
                recordCell.className = 'not-cleared-cell';
            }
        }
    }

    getRecord(level) {
        const records = JSON.parse(localStorage.getItem('doGameRecords') || '{}');
        return records[level] || { cleared: false, bestTime: 999, bestMoves: 999 };
    }

    saveRecord(level, time, moves) {
        const records = JSON.parse(localStorage.getItem('doGameRecords') || '{}');
        
        if (!records[level] || time < records[level].bestTime || 
            (time === records[level].bestTime && moves < records[level].bestMoves)) {
            records[level] = {
                cleared: true,
                bestTime: time,
                bestMoves: moves,
                clearDate: new Date().toISOString().split('T')[0]
            };
            localStorage.setItem('doGameRecords', JSON.stringify(records));
            console.log(`新記録! Level ${level}: ${time}s / ${moves}手`);
            return true; // 新記録
        }
        return false; // 既存記録以下
    }

    isBestRecord(level, record) {
        return record.cleared;
    }

    clearAllRecords() {
        if (confirm('本当に全ての記録を削除しますか？')) {
            localStorage.removeItem('doGameRecords');
            this.updateRecordsTable();
            alert('記録を削除しました！');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => { new DOGame(); });
