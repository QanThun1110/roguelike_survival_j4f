// =========================================
// HỆ THỐNG VẬT LÝ, CAMERA, ĐIỀU KHIỂN & COMBAT
// =========================================

const player = {
    element: document.getElementById('player'),
    visual: document.getElementById('player-visual'),
    x: 500,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 8,
    jumpForce: 15,
    gravity: 0.8,
    width: 40,
    height: 80, // Thêm chiều cao để tính va chạm
    isGrounded: true,
    direction: 1,
    isAttacking: false
};

// Khai báo Thực thể Kẻ địch
const enemy = {
    element: document.getElementById('enemy-1'),
    hpFill: document.getElementById('enemy-hp-fill'),
    x: 1200,    // Quái đứng ở tọa độ 1200 (Bên phải nhân vật một đoạn)
    y: 0,
    width: 50,
    height: 50,
    maxHp: 3,   // Chém 3 nhát sẽ chết
    hp: 3,
    isDead: false,
    isInvulnerable: false // Thời gian tàng hình ngắn sau khi bị chém (i-frames)
};

const camera = { x: 0, smoothSpeed: 0.08 };

const mountainsBack = document.querySelector('.mountains-back');
const mountainsFront = document.querySelector('.mountains-front');
const ground = document.querySelector('.ground');

const keys = { a: false, d: false, w: false, space: false, j: false };

window.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.a = true;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.d = true;
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.code === 'Space') keys.w = true;
    if ((e.key === 'j' || e.key === 'J') && !player.isAttacking) performAttack();
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.a = false;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.d = false;
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.code === 'Space') keys.w = false;
});

// Hàm kiểm tra va chạm giữa 2 hình chữ nhật (Hitbox)
function checkCollision(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
    return (
        r1x < r2x + r2w &&
        r1x + r1w > r2x &&
        r1y < r2y + r2h &&
        r1y + r1h > r2y
    );
}

// HÀM XỬ LÝ COMBAT & GÂY SÁT THƯƠNG
function performAttack() {
    player.isAttacking = true;
    player.vx = player.direction * 12; // Lướt tới (Dash)
    
    // 1. Tính toán vùng sát thương của nhát chém (Sword Hitbox)
    // Nếu quay phải, vùng chém nằm trước mặt. Quay trái, vùng chém nằm sau lưng (trên trục X)
    let swordHitboxX = player.direction === 1 ? player.x + player.width : player.x - 60;
    let swordHitboxY = player.y; 
    let swordHitboxW = 60; // Chiều dài nhát chém
    let swordHitboxH = 80; // Chiều cao nhát chém

    // 2. Kiểm tra va chạm với Quái
    if (!enemy.isDead && !enemy.isInvulnerable) {
        let isHit = checkCollision(
            swordHitboxX, swordHitboxY, swordHitboxW, swordHitboxH,
            enemy.x, enemy.y, enemy.width, enemy.height
        );

        if (isHit) {
            enemy.hp -= 1; // Trừ 1 máu
            enemy.isInvulnerable = true;
            enemy.element.classList.add('hit'); // Bật hiệu ứng chớp trắng
            
            // Cập nhật thanh máu UI (Tính phần trăm máu còn lại)
            enemy.hpFill.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;

            // Kiểm tra chết
            if (enemy.hp <= 0) {
                enemy.isDead = true;
                enemy.element.classList.add('dead'); // Bật hiệu ứng tan biến
            }

            // Tắt chớp trắng và hết trạng thái bất tử sau 0.4s
            setTimeout(() => {
                enemy.element.classList.remove('hit');
                enemy.isInvulnerable = false;
            }, 400);
        }
    }
    
    // Kết thúc đòn đánh của nhân vật
    setTimeout(() => { player.isAttacking = false; }, 300);
}

function gameLoop() {
    // 1. VẬT LÝ NHÂN VẬT
    if (!player.isAttacking) {
        if (keys.a) { player.vx = -player.speed; player.direction = -1; } 
        else if (keys.d) { player.vx = player.speed; player.direction = 1; } 
        else {
            player.vx *= 0.7; 
            if (Math.abs(player.vx) < 0.5) player.vx = 0;
        }
    } else {
        player.vx *= 0.8; // Ma sát hãm đà lướt
    }

    if (keys.w && player.isGrounded && !player.isAttacking) {
        player.vy = player.jumpForce;
        player.isGrounded = false;
    }
    
    player.vy -= player.gravity;
    player.x += player.vx;
    player.y += player.vy;

    if (player.y <= 0) { player.y = 0; player.vy = 0; player.isGrounded = true; }
    if (player.x < 0) player.x = 0;

    // 2. CAMERA LERP
    let targetCameraX = player.x - (window.innerWidth / 2) + (player.width / 2);
    if (targetCameraX < 0) targetCameraX = 0;
    camera.x += (targetCameraX - camera.x) * camera.smoothSpeed;

    // 3. RENDER NHÂN VẬT
    const screenX = player.x - camera.x;
    player.element.style.transform = `translate(${screenX}px, ${-player.y}px)`;
    
    let transformString = `scaleX(${player.direction})`;
    if (player.isAttacking) player.visual.className = 'player-sprite attacking';
    else if (!player.isGrounded) player.visual.className = 'player-sprite jumping';
    else if (Math.abs(player.vx) > 1) player.visual.className = 'player-sprite running';
    else player.visual.className = 'player-sprite idle';
    
    player.visual.style.transform = transformString;

    // 4. RENDER BACKGROUND PARALLAX
    mountainsBack.style.backgroundPositionX = `${-camera.x * 0.15}px`;  
    mountainsFront.style.backgroundPositionX = `${-camera.x * 0.4}px`;   
    ground.style.backgroundPositionX = `${-camera.x * 1}px`;             

    // 5. RENDER KẺ ĐỊCH VÀO CAMERA THẾ GIỚI MỞ
    if (!enemy.isDead || enemy.element.classList.contains('dead')) {
        const enemyScreenX = enemy.x - camera.x;
        enemy.element.style.transform = `translate(${enemyScreenX}px, ${-enemy.y}px)`;
    }

    requestAnimationFrame(gameLoop);
}
