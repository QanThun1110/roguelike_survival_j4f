// Hệ thống tạo hạt (Particle System) cho Background
class ParticleSystem {
    constructor(containerId, count) {
        this.container = document.getElementById(containerId);
        this.count = count;
        this.init();
    }

    init() {
        for (let i = 0; i < this.count; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        
        // Cấu hình CSS inline cho từng hạt
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 3 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = '#00f0ff'; // Màu cyan
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = '0 0 5px #00f0ff';
        particle.style.opacity = Math.random() * 0.5 + 0.2;
        
        // Vị trí ngẫu nhiên
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        
        // Hiệu ứng di chuyển
        const duration = Math.random() * 10 + 5; // 5-15 giây
        particle.animate([
            { transform: 'translateY(0) scale(1)', opacity: particle.style.opacity },
            { transform: `translateY(-100px) scale(0)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            iterations: Infinity,
            easing: 'ease-in-out'
        });

        this.container.appendChild(particle);
    }
}

// Khởi tạo hệ thống khi DOM tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo 50 hạt bụi ma thuật
    new ParticleSystem('particle-container', 50);

    // Xử lý sự kiện click của Menu
    const menuButtons = document.querySelectorAll('.menu-btn');
    
    menuButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.getAttribute('data-action');
            
            // Âm thanh click giả định (bạn có thể chèn Audio object vào đây)
            console.log(`System: Executing [${action}] protocol...`);
            
            // Logic chuyển cảnh sẽ viết ở đây
            switch(action) {
                case 'new-game':
                    startLoadingSequence(); // Gọi hàm Loading cực ngầu vừa viết
                    break;
                //...
                case 'quit':
                    window.close(); // Lưu ý: Trình duyệt có thể chặn lệnh này nếu không phải pop-up
                    break;
                default:
                    console.log('Feature currently in development.');
            }
        });
    });
});
// HÀM XỬ LÝ QUÁ TRÌNH LOADING (Đã bao gồm Bước 4: Kích hoạt Game)
function startLoadingSequence() {
    const menuContainer = document.querySelector('.menu-container');
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const loadingText = document.querySelector('.loading-text');

    const loreTexts = [
        "Synchronizing World Data...",
        "Awakening the Elements...",
        "Calibrating Combat Physics...",
        "Rendering Ethereal Landscapes...",
        "Establishing Connection..."
    ];

    // 1. Làm mờ Menu chính đi
    menuContainer.style.transition = "opacity 0.5s ease";
    menuContainer.style.opacity = "0";

    // 2. Chờ 0.5s cho menu mờ hẳn, rồi hiện Loading Screen lên
    setTimeout(() => {
        loadingScreen.classList.remove('hidden');
        
        let progress = 0;
        let textIndex = 0;

        const textInterval = setInterval(() => {
            textIndex = (textIndex + 1) % loreTexts.length;
            loadingText.innerText = loreTexts[textIndex];
        }, 900);

        const loadInterval = setInterval(() => {
            progress += Math.floor(Math.random() * 6) + 1; 
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadInterval);
                clearInterval(textInterval);
                
                loadingText.innerText = "Welcome to Ethereal.";
                
                // Giữ ở 100% khoảng 1 giây rồi mờ đi
                setTimeout(() => {
                    loadingScreen.classList.add('hidden'); // Ẩn Loading đi
                    console.log("System: Game World Initialized!");
                    
                    // --- ĐOẠN CODE KÍCH HOẠT THẾ GIỚI VÀ NHÂN VẬT ---
                    const gameWorld = document.getElementById('game-world');
                    const particleContainer = document.getElementById('particle-container');
                    
                    // Hiện thế giới game lên
                    gameWorld.classList.add('active');
                    
                    // CHÍNH LÀ CHỖ NÀY: Gọi vòng lặp game để nhân vật bắt đầu hoạt động!
                    gameLoop(); 
                    
                    // Dọn dẹp Menu cho nhẹ máy
                    setTimeout(() => {
                        menuContainer.style.display = 'none';
                        particleContainer.style.display = 'none';
                        document.querySelector('.game-background').style.display = 'none';
                    }, 500); 
                    // ------------------------------------------------

                }, 1000);
            }
            
            progressBar.style.width = `${progress}%`;
            progressText.innerText = `${progress}%`;
            
        }, 120);

    }, 500);
}
// =========================================
// HỆ THỐNG VẬT LÝ VÀ ĐIỀU KHIỂN NHÂN VẬT
// =========================================

// =========================================
// HỆ THỐNG VẬT LÝ, CAMERA VÀ ĐIỀU KHIỂN
// =========================================

const player = {
    element: document.getElementById('player'),
    visual: document.getElementById('player-visual'),
    x: 500,                     // Vị trí X trong THẾ GIỚI THỰC (Không phải trên màn hình nữa)
    y: 0,                       // Vị trí Y (0 là mặt đất)
    vx: 0,                      // Vận tốc trục X
    vy: 0,                      // Vận tốc trục Y
    speed: 8,                   // Tốc độ chạy (Tăng lên một chút cho đã)
    jumpForce: 15,              // Lực nhảy
    gravity: 0.8,               // Trọng lực
    width: 40,
    isGrounded: true,
    direction: 1                
};

// Khởi tạo Camera bám đuổi
const camera = {
    x: 0,
    smoothSpeed: 0.08 // Độ mượt của camera (Càng nhỏ camera bám càng trễ, tạo cảm giác Cinematic)
};

// Lấy các lớp background để làm hiệu ứng Parallax
const mountainsBack = document.querySelector('.mountains-back');
const mountainsFront = document.querySelector('.mountains-front');
const ground = document.querySelector('.ground');

// Theo dõi phím bấm
const keys = { a: false, d: false, w: false, space: false };

window.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.a = true;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.d = true;
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.code === 'Space') keys.w = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.a = false;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.d = false;
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.code === 'Space') keys.w = false;
});

// Vòng lặp Game 60FPS
function gameLoop() {
    // 1. XỬ LÝ VẬT LÝ VÀ DI CHUYỂN
    if (keys.a) {
        player.vx = -player.speed;
        player.direction = -1;
    } else if (keys.d) {
        player.vx = player.speed;
        player.direction = 1;
    } else {
        player.vx *= 0.7; // Ma sát trượt
        if (Math.abs(player.vx) < 0.5) player.vx = 0;
    }

    if (keys.w && player.isGrounded) {
        player.vy = player.jumpForce;
        player.isGrounded = false;
    }
    
    player.vy -= player.gravity;

    // Cập nhật tọa độ thế giới (Vũ trụ game giờ là vô tận!)
    player.x += player.vx;
    player.y += player.vy;

    // Chặn không cho rớt xuống lòng đất
    if (player.y <= 0) {
        player.y = 0;
        player.vy = 0;
        player.isGrounded = true;
    }

    // Chặn không cho đi lùi quá ranh giới bên trái của thế giới (Tọa độ 0)
    if (player.x < 0) player.x = 0;

    // ==========================================
    // 2. XỬ LÝ CAMERA BÁM ĐUỔI (CINEMATIC LERP)
    // ==========================================
    
    // Tính toán vị trí camera lý tưởng: Giữ nhân vật ở chính giữa màn hình
    let targetCameraX = player.x - (window.innerWidth / 2) + (player.width / 2);
    
    // Không cho camera lùi ra ngoài ranh giới bên trái của thế giới
    if (targetCameraX < 0) targetCameraX = 0;

    // Di chuyển camera từ từ về vị trí lý tưởng (Lerp algorithm)
    camera.x += (targetCameraX - camera.x) * camera.smoothSpeed;

    // ==========================================
    // 3. CẬP NHẬT HIỂN THỊ (RENDER & PARALLAX)
    // ==========================================

    // Vị trí nhân vật trên màn hình máy tính = Tọa độ thế giới - Tọa độ Camera
    const screenX = player.x - camera.x;
    player.element.style.transform = `translate(${screenX}px, ${-player.y}px)`;
    
    // Cập nhật Animation nhân vật
    let transformString = `scaleX(${player.direction})`;
    if (!player.isGrounded) {
        player.visual.className = 'player-sprite jumping';
    } else if (Math.abs(player.vx) > 1) {
        player.visual.className = 'player-sprite running';
    } else {
        player.visual.className = 'player-sprite idle';
    }
    player.visual.style.transform = transformString;

    // Cập nhật Parallax Scrolling cho Background
    // Lớp càng xa, nhân với số càng nhỏ để di chuyển chậm lại
    mountainsBack.style.backgroundPositionX = `${-camera.x * 0.15}px`;  // Chậm nhất
    mountainsFront.style.backgroundPositionX = `${-camera.x * 0.4}px`;   // Nhanh vừa
    ground.style.backgroundPositionX = `${-camera.x * 1}px`;             // Nhanh bằng nhân vật (100%)

    requestAnimationFrame(gameLoop);
}
