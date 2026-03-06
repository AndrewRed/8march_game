document.addEventListener('DOMContentLoaded', function() {
    const gameBoard = document.getElementById('game-board');
    const flowerCountElement = document.getElementById('flower-count');
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const congratulations = document.getElementById('congratulations');
    const gameOver = document.getElementById('game-over');
    const retryBtn = document.getElementById('retry-btn');
    const shareBtn = document.getElementById('share-btn');
    const heartsContainer = document.getElementById('hearts-container');
    const footerHeart = document.querySelector('footer i.fa-heart');

    let flowerCount = 0;
    let score = 0;
    let timeLeft = 60;
    let gameActive = false;
    let timerInterval;
    let flowers = [];
    const totalFlowersNeeded = 10;
    const maxFlowersOnScreen = 15;

    const flowerTypes = [
        { icon: 'fas fa-spa', color: '#ff6b8b', points: 10 },
        { icon: 'fas fa-leaf', color: '#81c784', points: 15 },
        { icon: 'fas fa-seedling', color: '#a5d6a7', points: 20 },
        { icon: 'far fa-gem', color: '#ba68c8', points: 25 },
        { icon: 'fas fa-star', color: '#ffd54f', points: 30 }
    ];

    const congratulationsMessages = [
        "Ты — самое прекрасное создание на свете! Пусть каждый день будет наполнен счастьем и любовью! 💖",
        "С 8 Марта! Пусть твоя жизнь будет яркой, как весенние цветы, и сладкой, как шоколад! 🌸🍫",
        "Ты заслуживаешь всего самого лучшего! Пусть мечты сбываются, а улыбка никогда не сходит с твоего лица! ✨",
        "С праздником весны! Ты — воплощение нежности, красоты и грации! Будь всегда такой же прекрасной! 🌷",
        "Пусть этот день принесёт тебе море цветов, комплиментов и тёплых пожеланий! Ты этого достойна! 💐"
    ];

    function createHeart(x, y) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '<i class="fas fa-heart"></i>';
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        heart.style.color = getRandomColor();
        
        heartsContainer.appendChild(heart);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        const size = 0.5 + Math.random() * 1.5;
        
        heart.style.fontSize = size + 'rem';
        
        let opacity = 1;
        const fadeInterval = setInterval(() => {
            x += Math.cos(angle) * speed;
            y -= speed;
            opacity -= 0.02;
            
            heart.style.left = x + 'px';
            heart.style.top = y + 'px';
            heart.style.opacity = opacity;
            
            if (opacity <= 0) {
                clearInterval(fadeInterval);
                heart.remove();
            }
        }, 30);
    }

    function getRandomColor() {
        const colors = ['#ff6b8b', '#ff4081', '#ff80ab', '#ffb8d9', '#f48fb1'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function createFlower() {
        if (!gameActive || flowers.length >= maxFlowersOnScreen) return;
        
        const flowerType = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
        const flower = document.createElement('div');
        flower.className = 'flower';
        flower.innerHTML = `<i class="${flowerType.icon}"></i>`;
        
        const x = Math.random() * (gameBoard.offsetWidth - 80);
        const y = Math.random() * (gameBoard.offsetHeight - 80);
        
        flower.style.left = x + 'px';
        flower.style.top = y + 'px';
        flower.style.backgroundColor = flowerType.color + '40';
        flower.style.color = flowerType.color;
        flower.style.border = `3px solid ${flowerType.color}`;
        
        flower.dataset.points = flowerType.points;
        flower.dataset.type = flowerType.icon;
        
        flower.addEventListener('click', function() {
            // Защита от кликов, когда игра уже закончилась,
            // и от повторной обработки одного и того же цветка.
            if (!gameActive || this.classList.contains('collected') || !flowers.includes(this)) return;
            
            collectFlower(this);
        });
        
        gameBoard.appendChild(flower);
        flowers.push(flower);
        
        setTimeout(() => {
            if (flower.parentNode && !flower.classList.contains('collected')) {
                flower.remove();
                flowers = flowers.filter(f => f !== flower);
            }
        }, 3000 + Math.random() * 4000);
    }

    function collectFlower(flower) {
        if (!gameActive || !flower || flower.classList.contains('collected') || !flowers.includes(flower)) {
            return;
        }

        flower.classList.add('collected');
        const points = parseInt(flower.dataset.points);
        
        score += points;
        flowerCount++;
        
        scoreElement.textContent = score;
        flowerCountElement.textContent = flowerCount;
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const rect = flower.getBoundingClientRect();
                createHeart(rect.left + 40, rect.top + 40);
            }, i * 100);
        }
        
        setTimeout(() => {
            flower.remove();
            flowers = flowers.filter(f => f !== flower);
        }, 800);
        
        if (flowerCount >= totalFlowersNeeded) {
            winGame();
        }
        
        updateFlowerCreation();
    }

    function updateFlowerCreation() {
        const targetFlowers = Math.min(maxFlowersOnScreen, 5 + Math.floor(flowerCount / 2));
        
        if (flowers.length < targetFlowers) {
            const flowersToCreate = targetFlowers - flowers.length;
            for (let i = 0; i < flowersToCreate; i++) {
                setTimeout(() => createFlower(), i * 300);
            }
        }
    }

    function startGame() {
        resetGame();
        gameActive = true;
        
        // Плавно скрываем кнопку "Начать игру"
        startBtn.style.opacity = '0';
        startBtn.style.transform = 'scale(0.8)';
        setTimeout(() => {
            startBtn.style.display = 'none';
            startBtn.style.opacity = '1';
            startBtn.style.transform = 'scale(1)';
        }, 300);
        
        resetBtn.disabled = false;
        
        // Скрываем подсказку со стрелкой
        const startHint = document.querySelector('.start-hint');
        if (startHint) {
            startHint.style.opacity = '0';
            setTimeout(() => {
                startHint.style.display = 'none';
                startHint.style.opacity = '1';
            }, 300);
        }
        
        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            
            if (timeLeft <= 10) {
                timerElement.style.color = '#ff4081';
                timerElement.style.fontWeight = 'bold';
                
                if (timeLeft <= 5) {
                    timerElement.style.animation = 'pulse 0.5s infinite';
                }
            }
            
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
        
        document.querySelector('.instructions').classList.add('hidden');
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createFlower(), i * 500);
        }
        
        const flowerInterval = setInterval(() => {
            if (!gameActive) {
                clearInterval(flowerInterval);
                return;
            }
            createFlower();
        }, 1500);
    }

    function resetGame() {
        flowerCount = 0;
        score = 0;
        timeLeft = 60;
        
        flowerCountElement.textContent = flowerCount;
        scoreElement.textContent = score;
        timerElement.textContent = timeLeft;
        timerElement.style.color = '';
        timerElement.style.fontWeight = '';
        timerElement.style.animation = '';
        
        flowers.forEach(flower => flower.remove());
        flowers = [];
        
        document.querySelector('.instructions').classList.remove('hidden');
        
        // Показываем кнопку "Начать игру" снова с анимацией
        startBtn.style.display = 'flex';
        startBtn.style.opacity = '0';
        startBtn.style.transform = 'scale(0.8)';
        startBtn.disabled = false;
        
        setTimeout(() => {
            startBtn.style.opacity = '1';
            startBtn.style.transform = 'scale(1)';
        }, 50);
        
        // Показываем подсказку со стрелкой
        const startHint = document.querySelector('.start-hint');
        if (startHint) {
            startHint.style.display = 'flex';
            startHint.style.opacity = '0';
            setTimeout(() => {
                startHint.style.opacity = '1';
            }, 50);
        }
        
        congratulations.classList.remove('show');
        congratulations.classList.add('hidden');
        gameOver.classList.remove('show');
        gameOver.classList.add('hidden');
        
        if (timerInterval) {
            clearInterval(timerInterval);
        }
    }

    function winGame() {
        gameActive = false;
        clearInterval(timerInterval);
        
        const randomMessage = congratulationsMessages[Math.floor(Math.random() * congratulationsMessages.length)];
        document.querySelector('.congrats-text').textContent = randomMessage;
        
        setTimeout(() => {
            congratulations.classList.remove('hidden');
            congratulations.classList.add('show');
            
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    const x = Math.random() * window.innerWidth;
                    const y = Math.random() * window.innerHeight;
                    createHeart(x, y);
                }, i * 100);
            }
        }, 500);
    }

    function endGame() {
        gameActive = false;
        clearInterval(timerInterval);
        
        setTimeout(() => {
            gameOver.classList.remove('hidden');
            gameOver.classList.add('show');
        }, 500);
    }

    function shareCongratulations() {
        const text = `Я собрала букет из ${flowerCount} цветов и набрала ${score} очков! 🎉💐\n\n${document.querySelector('.congrats-text').textContent}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Поздравление с 8 Марта',
                text: text
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert('Поздравление скопировано в буфер обмена! Поделись им с друзьями! 💖');
            });
        }
    }

    startBtn.addEventListener('click', startGame);
    
    resetBtn.addEventListener('click', function() {
        resetGame();
        gameActive = false;
        startBtn.disabled = false;
        resetBtn.disabled = true;
    });
    
    retryBtn.addEventListener('click', function() {
        gameOver.classList.remove('show');
        gameOver.classList.add('hidden');
        resetGame();
        startGame();
    });
    
    shareBtn.addEventListener('click', shareCongratulations);
    
    footerHeart.addEventListener('click', function() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = window.innerHeight;
                createHeart(x, y);
            }, i * 100);
        }
        
        const surpriseMessages = [
            "Ты нашла секретное сердечко! 💝",
            "С 8 Марта, прекрасная! 🌸",
            "Ты заслуживаешь всего самого лучшего! ✨",
            "Пусть сбываются все мечты! 💫",
            "Ты — самое милое создание! 🥰"
        ];
        
        const randomMessage = surpriseMessages[Math.floor(Math.random() * surpriseMessages.length)];
        alert(randomMessage);
    });

    document.addEventListener('click', function(event) {
        if (gameActive && Math.random() > 0.7) {
            createHeart(event.clientX, event.clientY);
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space' && !gameActive) {
            startGame();
        }
    });

    // Добавляем интерактивность к демо-цветку в инструкциях
    const demoFlower = document.querySelector('.demo-flower');
    if (demoFlower) {
        demoFlower.addEventListener('click', function() {
            this.style.transform = 'scale(0.8)';
            this.style.backgroundColor = '#c8e6c9';
            this.style.color = '#4CAF50';
            this.innerHTML = '<i class="fas fa-check"></i>';
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
                this.style.backgroundColor = '';
                this.style.color = '';
                this.innerHTML = '<i class="fas fa-spa"></i>';
            }, 500);
        });
        
        demoFlower.title = 'Кликни меня! Так будут выглядеть цветы в игре';
    }

    // Добавляем подсказки к примерам цветов
    const exampleFlowers = document.querySelectorAll('.example-flower');
    exampleFlowers.forEach((flower, index) => {
        const points = flower.querySelector('.example-points').textContent;
        const icon = flower.querySelector('i').className;
        
        let flowerType = 'Обычный цветок';
        if (icon.includes('fa-leaf')) flowerType = 'Листик';
        if (icon.includes('fa-star')) flowerType = 'Звездочка';
        if (icon.includes('fa-gem')) flowerType = 'Самоцвет';
        
        flower.title = `${flowerType} - даёт ${points} очков`;
        
        flower.addEventListener('click', function() {
            this.style.transform = 'scale(0.9)';
            this.style.boxShadow = '0 0 20px currentColor';
            
            setTimeout(() => {
                this.style.transform = '';
                this.style.boxShadow = '';
            }, 300);
        });
    });
});