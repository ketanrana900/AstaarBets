// ==================== IPL TEAMS DATA ====================
const IPL_TEAMS = [
    {
        id: 1,
        name: 'Punjab Kings',
        code: 'PBKS',
        emoji: '👑',
        color: '#FF5733',
        wins: 85,
        losses: 92,
        titles: 0
    },
    {
        id: 2,
        name: 'Royal Challengers Bangalore',
        code: 'RCB',
        emoji: '🦁',
        color: '#DC143C',
        wins: 88,
        losses: 89,
        titles: 0
    },
    {
        id: 3,
        name: 'Mumbai Indians',
        code: 'MI',
        emoji: '⭐',
        color: '#004687',
        wins: 115,
        losses: 70,
        titles: 5
    },
    {
        id: 4,
        name: 'Chennai Super Kings',
        code: 'CSK',
        emoji: '🦗',
        color: '#FFFF00',
        wins: 111,
        losses: 74,
        titles: 5
    },
    {
        id: 5,
        name: 'Lucknow Super Giants',
        code: 'LSG',
        emoji: '🐯',
        color: '#1E90FF',
        wins: 18,
        losses: 14,
        titles: 0
    },
    {
        id: 6,
        name: 'Gujarat Titans',
        code: 'GT',
        emoji: '🦁',
        color: '#FFD700',
        wins: 22,
        losses: 10,
        titles: 1
    },
    {
        id: 7,
        name: 'Sunrisers Hyderabad',
        code: 'SRH',
        emoji: '☀️',
        color: '#FF7F50',
        wins: 83,
        losses: 93,
        titles: 1
    },
    {
        id: 8,
        name: 'Delhi Capitals',
        code: 'DC',
        emoji: '🏛️',
        color: '#4169E1',
        wins: 72,
        losses: 104,
        titles: 0
    },
    {
        id: 9,
        name: 'Rajasthan Royals',
        code: 'RR',
        emoji: '👸',
        color: '#FF1493',
        wins: 88,
        losses: 89,
        titles: 1
    },
    {
        id: 10,
        name: 'Kolkata Knight Riders',
        code: 'KKR',
        emoji: '⚔️',
        color: '#9932CC',
        wins: 94,
        losses: 83,
        titles: 3
    }
];

// ==================== UPCOMING MATCHES DATA ====================
const UPCOMING_MATCHES = [
    {
        id: 1,
        team1: 'MI',
        team2: 'CSK',
        date: '2026-05-07',
        time: '19:30',
        venue: 'Wankhede Stadium, Mumbai',
        matchNumber: 1
    },
    {
        id: 2,
        team1: 'RCB',
        team2: 'KKR',
        date: '2026-05-08',
        time: '19:30',
        venue: 'M. Chinnaswamy Stadium, Bangalore',
        matchNumber: 2
    },
    {
        id: 3,
        team1: 'GT',
        team2: 'SRH',
        date: '2026-05-09',
        time: '19:30',
        venue: 'Narendra Modi Stadium, Ahmedabad',
        matchNumber: 3
    },
    {
        id: 4,
        team1: 'LSG',
        team2: 'PBKS',
        date: '2026-05-10',
        time: '19:30',
        venue: 'BRSABVE Cricket Ground, Lucknow',
        matchNumber: 4
    },
    {
        id: 5,
        team1: 'DC',
        team2: 'RR',
        date: '2026-05-11',
        time: '19:30',
        venue: 'Arun Jaitley Stadium, Delhi',
        matchNumber: 5
    },
    {
        id: 6,
        team1: 'CSK',
        team2: 'RCB',
        date: '2026-05-12',
        time: '19:30',
        venue: 'M. A. Chidambaram Stadium, Chennai',
        matchNumber: 6
    }
];

// ==================== MATCH PREDICTIONS ====================
const PREDICTIONS = {
    1: { // MI vs CSK
        matchWinner: { MI: 52, CSK: 48 },
        tossWinner: { MI: 50, CSK: 50 }
    },
    2: { // RCB vs KKR
        matchWinner: { RCB: 48, KKR: 52 },
        tossWinner: { RCB: 50, KKR: 50 }
    },
    3: { // GT vs SRH
        matchWinner: { GT: 55, SRH: 45 },
        tossWinner: { GT: 50, SRH: 50 }
    },
    4: { // LSG vs PBKS
        matchWinner: { LSG: 50, PBKS: 50 },
        tossWinner: { LSG: 50, PBKS: 50 }
    },
    5: { // DC vs RR
        matchWinner: { DC: 45, RR: 55 },
        tossWinner: { DC: 50, RR: 50 }
    },
    6: { // CSK vs RCB
        matchWinner: { CSK: 54, RCB: 46 },
        tossWinner: { CSK: 50, RCB: 50 }
    }
};

// ==================== IPL 2026 WINNER ODDS ====================
const WINNER_ODDS = {
    'MI': 3.50,
    'CSK': 4.00,
    'RCB': 7.00,
    'KKR': 5.50,
    'GT': 6.00,
    'RR': 8.00,
    'SRH': 9.00,
    'LSG': 10.00,
    'DC': 12.00,
    'PBKS': 15.00
};

// ==================== LEADERBOARD DATA ====================
const LEADERBOARD_DATA = [
    { rank: 1, name: 'CricketKing', coins: 45250, bets: 42, winRate: '66.7%' },
    { rank: 2, name: 'VirtualBettor', coins: 38900, bets: 35, winRate: '62.9%' },
    { rank: 3, name: 'IPLMaster', coins: 35600, bets: 31, winRate: '61.3%' },
    { rank: 4, name: 'StadiumWarrior', coins: 32400, bets: 28, winRate: '57.1%' },
    { rank: 5, name: 'GoldenToss', coins: 28750, bets: 24, winRate: '54.2%' },
    { rank: 6, name: 'BoundaryHunter', coins: 25300, bets: 22, winRate: '50.0%' },
    { rank: 7, name: 'WicketWizard', coins: 21800, bets: 19, winRate: '47.4%' },
    { rank: 8, name: 'SixMachine', coins: 18900, bets: 17, winRate: '47.1%' },
    { rank: 9, name: 'FastBowler', coins: 15600, bets: 14, winRate: '42.9%' },
    { rank: 10, name: 'BatsmanPride', coins: 12450, bets: 11, winRate: '45.5%' }
];

// ==================== HELPER FUNCTIONS ====================
function getTeamEmoji(teamCode) {
    const team = IPL_TEAMS.find(t => t.code === teamCode);
    return team ? team.emoji : '🏏';
}

function getTeamName(teamCode) {
    const team = IPL_TEAMS.find(t => t.code === teamCode);
    return team ? team.name : teamCode;
}

function getTeamById(teamCode) {
    return IPL_TEAMS.find(t => t.code === teamCode);
}