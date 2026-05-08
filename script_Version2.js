// ==================== GLOBAL STATE MANAGEMENT ====================
let playerBalance = parseInt(localStorage.getItem('astaar_balance')) || 10000;
let activeBets = JSON.parse(localStorage.getItem('astaar_bets')) || [];
let bettingHistory = JSON.parse(localStorage.getItem('astaar_history')) || [];
let winnerPrediction = localStorage.getItem('astaar_winner') || null;
let selectedWinnerTeam = null;

// 3D Scene Variables
let scene, camera, renderer;
let stadium = null;
let stadiumObjects = [];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🏏 Astaar Bets Initializing...');
    initializeThreeJS();
    loadTeams();
    loadMatches();
    loadPredictions();
    loadWinnerTeams();
    updateBalance();
    loadLeaderboard();
    setupNavigation();
    updateActiveBets();
    console.log('✅ Astaar Bets Ready!');
});

// ==================== THREE.JS 3D IMPLEMENTATION ====================
function initializeThreeJS() {
    const canvas = document.getElementById('3d-canvas');

    // Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    scene.fog = new THREE.Fog(0x0a0e27, 500, 1000);

    // Camera Setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 20, 40);
    camera.lookAt(0, 0, 0);

    // Renderer Setup
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    canvas.appendChild(renderer.domElement);

    // Lighting
    setupLighting();

    // Create Stadium
    createStadium();

    // Animation Loop
    animate();

    // Handle Resize
    window.addEventListener('resize', onWindowResize);
}

function setupLighting() {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Directional Light (Sun)
    const directionalLight = new THREE.DirectionalLight(0x00d4ff, 0.9);
    directionalLight.position.set(60, 80, 40);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    // Point Lights for Stadium Floodlights
    const floodlightPositions = [
        [-45, 50, -45],
        [45, 50, -45],
        [-45, 50, 45],
        [45, 50, 45]
    ];

    floodlightPositions.forEach((pos, index) => {
        const light = new THREE.PointLight(0x00d4ff, 1.2);
        light.position.set(...pos);
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        scene.add(light);
    });
}

function createStadium() {
    stadiumObjects = [];

    // Ground (Cricket Field)
    const groundGeometry = new THREE.CircleGeometry(50, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a4d2e,
        roughness: 0.8,
        metalness: 0.1,
        wireframe: false
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.y = -0.1;
    scene.add(ground);
    stadiumObjects.push(ground);

    // Pitch Circle (Inner Field)
    const pitchGeometry = new THREE.CircleGeometry(30, 64);
    const pitchEdgesGeometry = new THREE.EdgesGeometry(pitchGeometry);
    const pitchMaterial = new THREE.LineBasicMaterial({
        color: 0x00d4ff,
        linewidth: 3
    });
    const pitch = new THREE.LineSegments(pitchEdgesGeometry, pitchMaterial);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.z = 0;
    pitch.position.y = 0;
    scene.add(pitch);
    stadiumObjects.push(pitch);

    // Crease Lines
    const creaseGeometry = new THREE.BufferGeometry();
    const creasePoints = [
        new THREE.Vector3(-0.5, 0, -20),
        new THREE.Vector3(0.5, 0, -20),
        new THREE.Vector3(0.5, 0, 20),
        new THREE.Vector3(-0.5, 0, 20)
    ];
    creaseGeometry.setFromPoints(creasePoints);
    const creaseEdges = new THREE.EdgesGeometry(creaseGeometry);
    const creaseMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const crease = new THREE.LineSegments(creaseEdges, creaseMaterial);
    crease.position.y = 0.1;
    scene.add(crease);
    stadiumObjects.push(crease);

    // Stadium Stands (4 Large Boxes)
    const standGeometry = new THREE.BoxGeometry(100, 40, 15);
    const standMaterial = new THREE.MeshStandardMaterial({
        color: 0x00d4ff,
        roughness: 0.5,
        metalness: 0.6,
        emissive: 0x00d4ff,
        emissiveIntensity: 0.2
    });

    const standPositions = [
        [0, 20, -60],
        [0, 20, 60],
        [-60, 20, 0],
        [60, 20, 0]
    ];

    standPositions.forEach(pos => {
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.set(...pos);
        stand.castShadow = true;
        stand.receiveShadow = true;
        scene.add(stand);
        stadiumObjects.push(stand);
    });

    // Floodlight Poles
    const poleGeometry = new THREE.CylinderGeometry(2, 2.5, 50);
    const poleMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040,
        roughness: 0.7,
        metalness: 0.3
    });

    const lightPositions = [
        [-50, 25, -50],
        [50, 25, -50],
        [-50, 25, 50],
        [50, 25, 50]
    ];

    lightPositions.forEach(pos => {
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(pos[0], pos[1], pos[2]);
        pole.castShadow = true;
        pole.receiveShadow = true;
        scene.add(pole);
        stadiumObjects.push(pole);

        // Floodlight fixtures
        const fixtureGeometry = new THREE.BoxGeometry(8, 2, 8);
        const fixtureMaterial = new THREE.MeshStandardMaterial({
            color: 0x00d4ff,
            emissive: 0x00d4ff,
            emissiveIntensity: 0.5,
            metalness: 0.8
        });
        const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
        fixture.position.set(pos[0], pos[1] + 25, pos[2]);
        fixture.castShadow = true;
        scene.add(fixture);
        stadiumObjects.push(fixture);
    });

    // Scoreboard
    const scoreboardGeometry = new THREE.BoxGeometry(60, 40, 2);
    const scoreboardMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        emissive: 0x00d4ff,
        emissiveIntensity: 0.3,
        metalness: 0.9
    });
    const scoreboard = new THREE.Mesh(scoreboardGeometry, scoreboardMaterial);
    scoreboard.position.set(0, 40, -75);
    scoreboard.castShadow = true;
    scene.add(scoreboard);
    stadiumObjects.push(scoreboard);
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate camera slightly for dynamic effect
    const time = Date.now() * 0.0001;
    camera.position.x = Math.sin(time * 0.3) * 5;
    camera.position.z = 40 + Math.cos(time * 0.2) * 5;
    camera.lookAt(0, 10, 0);

    // Animate floodlights
    stadiumObjects.forEach((obj, index) => {
        if (obj.geometry && obj.geometry.type === 'BoxGeometry' && index > 15) {
            obj.rotation.y += 0.002;
        }
    });

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==================== TEAMS SECTION ====================
function loadTeams() {
    const container = document.getElementById('teams-container');
    container.innerHTML = '';

    IPL_TEAMS.forEach((team, index) => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.style.animationDelay = `${index * 0.1}s`;
        teamCard.innerHTML = `
            <div class="team-logo">${team.emoji}</div>
            <div class="team-name">${team.name}</div>
            <div class="team-code">${team.code}</div>
            <div class="team-stats">
                <div class="stat">
                    <div class="stat-value">${team.wins}</div>
                    <div class="stat-label">WINS</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${team.losses}</div>
                    <div class="stat-label">LOSSES</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${team.titles}</div>
                    <div class="stat-label">TITLES</div>
                </div>
            </div>
        `;
        container.appendChild(teamCard);
    });
}

// ==================== MATCHES SECTION ====================
function loadMatches() {
    const container = document.getElementById('matches-container');
    container.innerHTML = '';

    UPCOMING_MATCHES.forEach((match, index) => {
        const team1 = getTeamById(match.team1);
        const team2 = getTeamById(match.team2);

        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        matchCard.style.animationDelay = `${index * 0.1}s`;
        matchCard.innerHTML = `
            <div class="match-date">
                <i class="fas fa-calendar"></i> Match ${match.matchNumber} • ${new Date(match.date).toLocaleDateString('en-IN', {weekday: 'short', month: 'short', day: 'numeric'})} at ${match.time}
            </div>
            <div class="match-teams">
                <div class="team-info">
                    <div class="team-info-emoji">${team1.emoji}</div>
                    <div class="team-info-name">${team1.code}</div>
                </div>
                <div class="match-vs">VS</div>
                <div class="team-info">
                    <div class="team-info-emoji">${team2.emoji}</div>
                    <div class="team-info-name">${team2.code}</div>
                </div>
            </div>
            <div class="match-venue"><i class="fas fa-map-marker-alt"></i> ${match.venue}</div>
            <div class="match-action">
                <button onclick="openBettingModal(${match.id}, '${match.team1}', '${match.team2}', 'winner')">
                    <i class="fas fa-crown"></i> Bet Winner
                </button>
                <button onclick="openBettingModal(${match.id}, '${match.team1}', '${match.team2}', 'toss')">
                    <i class="fas fa-coins"></i> Bet Toss
                </button>
            </div>
        `;
        container.appendChild(matchCard);
    });
}

// ==================== PREDICTIONS SECTION ====================
function loadPredictions() {
    const container = document.getElementById('predictions-container');
    container.innerHTML = '';

    UPCOMING_MATCHES.forEach((match, index) => {
        const team1 = getTeamById(match.team1);
        const team2 = getTeamById(match.team2);
        const prediction = PREDICTIONS[match.id];

        const predictionCard = document.createElement('div');
        predictionCard.className = 'prediction-card';
        predictionCard.style.animationDelay = `${index * 0.1}s`;

        let winnerHTML = '';
        Object.entries(prediction.matchWinner).forEach(([team, probability]) => {
            const teamObj = getTeamById(team);
            winnerHTML += `
                <div class="prediction-item">
                    <label class="prediction-label">${teamObj.name}</label>
                    <div class="probability-bar-container">
                        <div class="probability-bar" style="width: 0%;" data-width="${probability}"></div>
                    </div>
                    <div class="probability-text">
                        <span>${teamObj.code}</span>
                        <span>${probability}%</span>
                    </div>
                </div>
            `;
        });

        predictionCard.innerHTML = `
            <div class="prediction-match-title"><i class="fas fa-chart-bar"></i> ${team1.code} vs ${team2.code}</div>
            <h4 style="color: #a0aec0; margin-top: 15px; margin-bottom: 15px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Match Winner Probability</h4>
            ${winnerHTML}
        `;
        container.appendChild(predictionCard);

        // Animate probability bars
        setTimeout(() => {
            const bars = predictionCard.querySelectorAll('.probability-bar');
            bars.forEach(bar => {
                const width = bar.getAttribute('data-width');
                bar.style.width = width + '%';
            });
        }, 100);
    });
}

// ==================== BETTING MODAL ====================
function openBettingModal(matchId, team1, team2, betType) {
    const modal = document.getElementById('betting-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const match = UPCOMING_MATCHES.find(m => m.id === matchId);

    const team1Obj = getTeamById(team1);
    const team2Obj = getTeamById(team2);

    let title, bodyHTML;

    if (betType === 'winner') {
        title = `<i class="fas fa-crown"></i> Predict Match Winner`;
        bodyHTML = `
            <p style="margin-bottom: 25px; color: #a0aec0; font-weight: 500;">${team1Obj.name} vs ${team2Obj.name}</p>
            <p style="margin-bottom: 25px; color: #a0aec0; font-size: 13px;">Choose which team will win the match. Correct prediction doubles your bet!</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                <button onclick="placeBet(${matchId}, '${team1}', 'winner')" style="padding: 18px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.05)); border: 1.5px solid rgba(0, 212, 255, 0.3); color: #00d4ff; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 14px; transition: all 0.3s ease; letter-spacing: 1px;">
                    <div style="font-size: 32px; margin-bottom: 8px;">${team1Obj.emoji}</div>
                    ${team1Obj.code} WINS
                </button>
                <button onclick="placeBet(${matchId}, '${team2}', 'winner')" style="padding: 18px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.05)); border: 1.5px solid rgba(0, 212, 255, 0.3); color: #00d4ff; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 14px; transition: all 0.3s ease; letter-spacing: 1px;">
                    <div style="font-size: 32px; margin-bottom: 8px;">${team2Obj.emoji}</div>
                    ${team2Obj.code} WINS
                </button>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; color: #a0aec0; margin-bottom: 10px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Bet Amount (₹)</label>
                <input type="number" id="bet-amount" value="100" min="10" max="${playerBalance}" style="width: 100%; padding: 14px; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(0, 212, 255, 0.2); color: #fff; border-radius: 10px; font-weight: 600; font-size: 15px;" placeholder="Enter bet amount">
            </div>
            <div style="background: rgba(0, 212, 255, 0.08); padding: 12px; border-radius: 8px; border-left: 3px solid #00d4ff; font-size: 12px; color: #a0aec0;">
                <i class="fas fa-info-circle"></i> Win: 2x your bet | Lose: Lose your bet amount
            </div>
        `;
    } else {
        title = `<i class="fas fa-coins"></i> Predict Toss Winner`;
        bodyHTML = `
            <p style="margin-bottom: 25px; color: #a0aec0; font-weight: 500;">${team1Obj.name} vs ${team2Obj.name}</p>
            <p style="margin-bottom: 25px; color: #a0aec0; font-size: 13px;">Choose which team will win the coin toss. Each team has a 50% chance!</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                <button onclick="placeBet(${matchId}, '${team1}', 'toss')" style="padding: 18px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.05)); border: 1.5px solid rgba(0, 212, 255, 0.3); color: #00d4ff; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 14px; transition: all 0.3s ease; letter-spacing: 1px;">
                    <div style="font-size: 32px; margin-bottom: 8px;">${team1Obj.emoji}</div>
                    ${team1Obj.code} TOSS
                </button>
                <button onclick="placeBet(${matchId}, '${team2}', 'toss')" style="padding: 18px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.05)); border: 1.5px solid rgba(0, 212, 255, 0.3); color: #00d4ff; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 14px; transition: all 0.3s ease; letter-spacing: 1px;">
                    <div style="font-size: 32px; margin-bottom: 8px;">${team2Obj.emoji}</div>
                    ${team2Obj.code} TOSS
                </button>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; color: #a0aec0; margin-bottom: 10px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Bet Amount (₹)</label>
                <input type="number" id="bet-amount" value="100" min="10" max="${playerBalance}" style="width: 100%; padding: 14px; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(0, 212, 255, 0.2); color: #fff; border-radius: 10px; font-weight: 600; font-size: 15px;" placeholder="Enter bet amount">
            </div>
            <div style="background: rgba(0, 212, 255, 0.08); padding: 12px; border-radius: 8px; border-left: 3px solid #00d4ff; font-size: 12px; color: #a0aec0;">
                <i class="fas fa-info-circle"></i> 50-50 Chance | Win: 2x your bet | Lose: Lose your bet amount
            </div>
        `;
    }

    modalTitle.innerHTML = title;
    modalBody.innerHTML = bodyHTML;
    modal.classList.add('show');
}

function placeBet(matchId, team, betType) {
    const betAmount = parseInt(document.getElementById('bet-amount')?.value) || 100;

    if (betAmount > playerBalance) {
        showNotification('❌ Insufficient balance!', true);
        return;
    }

    if (betAmount < 10) {
        showNotification('❌ Minimum bet is ₹10', true);
        return;
    }

    const bet = {
        id: Date.now(),
        matchId,
        team,
        type: betType,
        amount: betAmount,
        timestamp: new Date().toISOString(),
        status: 'active'
    };

    activeBets.push(bet);
    playerBalance -= betAmount;

    // Save to localStorage
    localStorage.setItem('astaar_balance', playerBalance);
    localStorage.setItem('astaar_bets', JSON.stringify(activeBets));

    updateBalance();
    updateActiveBets();
    closeModal('betting-modal');
    
    const teamObj = getTeamById(team);
    showNotification(`✅ Bet placed! ₹${betAmount} on ${teamObj.code} (${betType.toUpperCase()})`);

    // Simulate result after 4 seconds
    setTimeout(() => simulateBetResult(bet), 4000);
}

function simulateBetResult(bet) {
    const isWin = Math.random() > 0.5;
    const winnings = isWin ? bet.amount * 2 : 0;

    if (isWin) {
        playerBalance += winnings;
        bet.status = 'win';
        bet.result = `Won ₹${winnings}`;
    } else {
        bet.status = 'loss';
        bet.result = `Lost ₹${bet.amount}`;
    }

    // Remove from active bets
    activeBets = activeBets.filter(b => b.id !== bet.id);

    // Add to history
    bettingHistory.push(bet);

    // Save to localStorage
    localStorage.setItem('astaar_balance', playerBalance);
    localStorage.setItem('astaar_bets', JSON.stringify(activeBets));
    localStorage.setItem('astaar_history', JSON.stringify(bettingHistory));

    updateBalance();
    updateActiveBets();

    const teamObj = getTeamById(bet.team);
    const message = isWin ? `🎉 YOU WON! ₹${winnings} | ${teamObj.code}` : `😢 YOU LOST | ${teamObj.code}`;
    showNotification(message, !isWin);
}

function updateActiveBets() {
    const activeBetsList = document.getElementById('active-bets-list');
    const recentResultsList = document.getElementById('recent-results-list');
    const activeCount = document.getElementById('active-count');
    const historyCount = document.getElementById('history-count');

    // Update active bets count
    activeCount.textContent = activeBets.length;

    // Update active bets list
    if (activeBets.length === 0) {
        activeBetsList.innerHTML = '<p class="empty-state"><i class="fas fa-inbox"></i> No active bets yet</p>';
    } else {
        activeBetsList.innerHTML = activeBets.map(bet => {
            const teamObj = getTeamById(bet.team);
            return `
                <div class="bet-item">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>${teamObj.emoji} ${teamObj.code}</span>
                        <span style="color: #00d4ff;">₹${bet.amount}</span>
                    </div>
                    <div style="font-size: 11px; color: #a0aec0; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px;">${bet.type}</div>
                </div>
            `;
        }).join('');
    }

    // Update history count
    historyCount.textContent = bettingHistory.length;

    // Update recent results
    if (bettingHistory.length === 0) {
        recentResultsList.innerHTML = '<p class="empty-state"><i class="fas fa-inbox"></i> No history yet</p>';
    } else {
        recentResultsList.innerHTML = bettingHistory.slice(-5).reverse().map(bet => {
            const teamObj = getTeamById(bet.team);
            const resultColor = bet.status === 'win' ? '#10b981' : '#ef4444';
            return `
                <div class="result-item ${bet.status}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>${teamObj.emoji} ${teamObj.code}</span>
                        <span style="color: ${resultColor}; font-weight: 700;">${bet.result}</span>
                    </div>
                    <div style="font-size: 11px; color: #a0aec0; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px;">${bet.type}</div>
                </div>
            `;
        }).join('');
    }
}

// ==================== IPL WINNER PREDICTION ====================
function loadWinnerTeams() {
    const grid = document.getElementById('winner-grid');
    grid.innerHTML = '';

    IPL_TEAMS.forEach((team, index) => {
        const teamCard = document.createElement('div');
        teamCard.className = 'winner-team-card';
        teamCard.id = `winner-${team.code}`;
        teamCard.style.animationDelay = `${index * 0.05}s`;
        teamCard.innerHTML = `
            <div class="winner-team-emoji">${team.emoji}</div>
            <div class="winner-team-name">${team.code}</div>
            <div class="winner-odds">${WINNER_ODDS[team.code].toFixed(2)}x</div>
        `;
        teamCard.onclick = () => selectWinnerTeam(team.code, team);
        grid.appendChild(teamCard);
    });

    // Load previous selection
    if (winnerPrediction) {
        const team = getTeamById(winnerPrediction);
        selectWinnerTeam(winnerPrediction, team);
    }
}

function selectWinnerTeam(teamCode, teamObj) {
    // Remove previous selection
    document.querySelectorAll('.winner-team-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Add selection to clicked card
    document.getElementById(`winner-${teamCode}`).classList.add('selected');
    selectedWinnerTeam = teamObj;

    // Update display
    const displayDiv = document.getElementById('winner-selection-display');
    displayDiv.innerHTML = `
        <div class="winner-display-team">
            <div class="winner-display-emoji">${teamObj.emoji}</div>
            <div class="winner-display-name">${teamObj.name}</div>
            <div class="winner-display-odds">Odds: <strong>${WINNER_ODDS[teamCode].toFixed(2)}x</strong></div>
        </div>
    `;
}

function submitWinnerPrediction() {
    if (!selectedWinnerTeam) {
        showNotification('❌ Please select a team first!', true);
        return;
    }

    localStorage.setItem('astaar_winner', selectedWinnerTeam.code);
    winnerPrediction = selectedWinnerTeam.code;
    showNotification(`✅ PREDICTED: ${selectedWinnerTeam.name} will win IPL 2026!`);
}

// ==================== LEADERBOARD ====================
function loadLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';

    LEADERBOARD_DATA.forEach((player, index) => {
        const row = document.createElement('tr');
        let badgeClass = 'other';
        if (index === 0) badgeClass = 'gold';
        else if (index === 1) badgeClass = 'silver';
        else if (index === 2) badgeClass = 'bronze';

        row.innerHTML = `
            <td><div class="rank-badge ${badgeClass}">${player.rank}</div></td>
            <td><span class="player-name">${player.name}</span></td>
            <td><span class="coins-value">₹${player.coins.toLocaleString()}</span></td>
            <td><strong>${player.bets}</strong></td>
            <td><span class="win-rate">${player.winRate}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// ==================== UTILITY FUNCTIONS ====================
function updateBalance() {
    const formattedBalance = playerBalance.toLocaleString('en-IN');
    document.getElementById('balance-display').textContent = `₹${formattedBalance}`;
    document.getElementById('bet-balance').textContent = `₹${formattedBalance}`;
    
    // Update balance bar
    const maxBalance = 10000;
    const percentage = Math.min((playerBalance / maxBalance) * 100, 100);
    document.getElementById('balance-fill').style.width = percentage + '%';
}

function resetBalance() {
    if (confirm('Are you sure? This will reset your balance to ₹10,000 and clear all bets.')) {
        playerBalance = 10000;
        activeBets = [];
        bettingHistory = [];
        localStorage.setItem('astaar_balance', playerBalance);
        localStorage.setItem('astaar_bets', JSON.stringify(activeBets));
        localStorage.setItem('astaar_history', JSON.stringify(bettingHistory));
        updateBalance();
        updateActiveBets();
        showNotification('🔄 Balance reset to ₹10,000!');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    const icon = document.getElementById('notification-icon');
    const text = document.getElementById('notification-text');

    text.textContent = message;
    
    if (isError) {
        notification.style.background = `linear-gradient(135deg, #ef4444, #dc2626)`;
        icon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
    } else {
        notification.style.background = `linear-gradient(135deg, #00d4ff, #8338ec)`;
        icon.innerHTML = '<i class="fas fa-check-circle"></i>';
    }

    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3500);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ==================== NAVIGATION SETUP ====================
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';

    document.querySelectorAll('.section').forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Close modal when clicking outside
document.addEventListener('click', function (event) {
    const modal = document.getElementById('betting-modal');
    if (event.target === modal) {
        closeModal('betting-modal');
    }
});