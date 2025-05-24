document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const grid = document.getElementById('grid');
  const modal = document.getElementById('congratulationModal');
  const badgeModal = document.getElementById('badgeUnlockedModal');
  const congratulationSound = document.getElementById('congratulationSound');
  const badgeSound = document.getElementById('badgeSound');
  const themeToggle = document.getElementById('themeToggle');
  const taskInput = document.getElementById('taskInput');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskList = document.getElementById('taskList');
  const badgesGrid = document.getElementById('badgesGrid');
  const resetBtn = document.getElementById('resetBtn');

  // Stats elements
  const completedDaysEl = document.getElementById('completedDays');
  const completionRateEl = document.getElementById('completionRate');
  const userPointsEl = document.getElementById('userPoints');
  const progressBar = document.getElementById('progressBar');

  // Initialize data
  let progress = JSON.parse(localStorage.getItem('progress100Days')) || [];
  let tasks = JSON.parse(localStorage.getItem('dailyTasks')) || {};
  let badges = JSON.parse(localStorage.getItem('badges')) || {};
  let tasksCompleted = parseInt(localStorage.getItem('tasksCompleted')) || 0;
  let userPoints = parseInt(localStorage.getItem('userPoints')) || 0;
  let currentDate = new Date().toDateString();

  // Theme setup
  const savedTheme = localStorage.getItem('theme') || 'dark-mode';
  document.body.className = savedTheme;
  themeToggle.checked = savedTheme === 'light-mode';


  const badgeDefinitions = [
    { id: 'week_one', name: 'Seeker', description: 'The Journey Just Begins!', threshold: 7, icon: '<img src="assets/Streak7.png" alt="Seeker" style="margin-top: 20px;" />', points: 200 },
    { id: 'month_one', name: 'Ascender', description: 'Excuses are for losers. You\'re not one', threshold: 15, icon: '<img src="assets/Streak15.png" alt="Ascender" style="margin-top: 20px;" />', points: 300 },
    { id: 'streak_30', name: 'Warrior', description: 'You\'ve Built Discipline. Now It\'s a War', threshold: 30, streak: true, icon: '<img src="assets/Streak30.png" alt="Warrior" style="margin-top: 20px;" />', points: 1000 },
    { id: 'half_way', name: 'Grinder', description: 'Most quit in the beginning. You didn\'t', threshold: 50, icon: '<img src="assets/Streak50.png" alt="Grinder" style="margin-top: 20px;" />', points: 1500 },
    { id: 'three_quarters', name: 'Persistent', description: 'Climbing Higher with purpose', threshold: 75, icon: '<img src="assets/Streak75.png" alt="Persistent" style="margin-top: 20px;" />', points: 2000 },
    { id: 'champion', name: 'Champion', description: 'You\'ve Mastered the Art of Consistency 🔥', threshold: 100, icon: '<img src="assets/Streak100.png" alt="Champion" style="margin-top: 20px;" />', points: 3000 }
  ];


  // Points configuration
  const POINTS_CONFIG = {
    dayCompleted: 0,
    taskCompleted: 0,
    streakBonus: 0,
    dailyBonus: 0
  };

  // Initialize the app
  initGrid();
  updateStats();
  loadTasks();
  initBadges();

  // Event listeners
  themeToggle.addEventListener('change', toggleTheme);
  addTaskBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') addTask();
  });
  resetBtn.addEventListener('click', resetProgress);

  // Initialize the grid
  function initGrid() {
    grid.innerHTML = '';

    for (let i = 1; i <= 100; i++) {
      const box = document.createElement('div');
      box.classList.add('day');
      box.textContent = i;

      if (progress.includes(i)) {
        box.classList.add('completed');
      }

      box.addEventListener('click', () => toggleDay(i, box));
      grid.appendChild(box);
    }
  }

  // Toggle day completion
  function toggleDay(dayNumber, box) {
    const wasCompleted = box.classList.contains('completed');

    if (!wasCompleted) {
      box.classList.add('completed');
      progress.push(dayNumber);
      progress.sort((a, b) => a - b);
      checkBadges();

      // Check for streak bonus
      if (isStreak(dayNumber)) {
      }
    } else {
      box.classList.remove('completed');
      progress = progress.filter(d => d !== dayNumber);
    }

    localStorage.setItem('progress100Days', JSON.stringify(progress));
    updateStats();

    if (progress.length === 100) {
      congratulationSound.play();
      modal.style.display = 'flex';
    }
  }

  // Check if day is part of a streak
  function isStreak(dayNumber) {
    return progress.includes(dayNumber - 1) || progress.includes(dayNumber + 1);
  }

  // Update statistics
  function updateStats() {
    const completed = progress.length;
    const completionRate = Math.round((completed / 100) * 100);
    const badgesEarned = Object.keys(badges).filter(b => badges[b]).length;

    completedDaysEl.textContent = badgesEarned;
    completionRateEl.textContent = `${completionRate}%`;
    userPointsEl.textContent = userPoints;
    progressBar.style.width = `${completionRate}%`;

    // Update points display with animation
    userPointsEl.classList.add('points-added');
    setTimeout(() => {
      userPointsEl.classList.remove('points-added');
    }, 500);
  }

  // Add points to user
  function addPoints(points) {
    userPoints += points;
    localStorage.setItem('userPoints', userPoints.toString());
    updateStats();

    // Show floating points indicator
    const pointsFloat = document.createElement('div');
    pointsFloat.className = 'points-float';
    pointsFloat.textContent = `+${points}`;
    userPointsEl.parentNode.appendChild(pointsFloat);

    setTimeout(() => {
      pointsFloat.remove();
    }, 1000);
  }

  // Deduct points from user
  function deductPoints(points) {
    userPoints = Math.max(0, userPoints - points);
    localStorage.setItem('userPoints', userPoints.toString());
    updateStats();
  }

  // Check for unlocked badges
  function checkBadges() {
    const completedDays = progress.length;
    let unlockedNewBadge = false;

    badgeDefinitions.forEach(badge => {
      if (!badges[badge.id]) {
        if (completedDays >= badge.threshold) {
          badges[badge.id] = true;
          unlockedNewBadge = true;
          addPoints(badge.points);
          showBadgeUnlocked(badge);
        }
      }
    });

    if (unlockedNewBadge) {
      localStorage.setItem('badges', JSON.stringify(badges));
      initBadges();
    }
  }

  // Show badge unlocked modal
  function showBadgeUnlocked(badge) {
    badgeSound.play();
    const badgeInfo = document.getElementById('unlockedBadgeInfo');
    badgeInfo.innerHTML = `
          <div class="badge">
            ${badge.icon}
            <h3>${badge.name}</h3>
            <p>${badge.description}</p>
            <p class="points-earned">+${badge.points} points!</p>
          </div>
        `;
    badgeModal.style.display = 'flex';
  }

  // Initialize badges display
  function initBadges() {
    badgesGrid.innerHTML = '';

    badgeDefinitions.forEach(badge => {
      const badgeEl = document.createElement('div');
      badgeEl.classList.add('badge');

      if (badges[badge.id]) {
        badgeEl.classList.add('unlocked');
        badgeEl.innerHTML = `
              ${badge.icon}
              <p>${badge.name}</p>
              <small>${badge.points} pts</small>
            `;
        badgeEl.title = badge.description;
      } else {
        badgeEl.classList.add('locked');
        badgeEl.innerHTML = `
              <span style="font-size: 2rem;">🔒</span>
              <p>Locked</p>
              <small>${badge.points} pts</small>
            `;
        badgeEl.title = `Unlock by: ${badge.description}`;
      }

      badgesGrid.appendChild(badgeEl);
    });
  }

  // Toggle theme
  function toggleTheme() {
    if (themeToggle.checked) {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light-mode');
    } else {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark-mode');
    }
  }

  // Load tasks
  function loadTasks() {
    taskList.innerHTML = '';
    const todayTasks = tasks[currentDate] || [];

    todayTasks.forEach((task, index) => {
      addTaskToDOM(task, index);
    });
  }

  // Add task
  function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    if (!tasks[currentDate]) {
      tasks[currentDate] = [];
    }

    tasks[currentDate].push({
      text: taskText,
      completed: false
    });

    localStorage.setItem('dailyTasks', JSON.stringify(tasks));
    addTaskToDOM(taskText, tasks[currentDate].length - 1);
    taskInput.value = '';
  }

  // Add task to DOM
  function addTaskToDOM(task, index) {
    const li = document.createElement('li');

    if (typeof task === 'object') {
      li.textContent = task.text;
      if (task.completed) {
        li.classList.add('completed');
      }
    } else {
      li.textContent = task;
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (tasks[currentDate][index].completed) {
        tasksCompleted--;
        deductPoints(POINTS_CONFIG.taskCompleted);
        localStorage.setItem('tasksCompleted', tasksCompleted.toString());
        updateStats();
      }
      tasks[currentDate].splice(index, 1);
      localStorage.setItem('dailyTasks', JSON.stringify(tasks));
      li.remove();
    });

li.addEventListener('click', () => {
  const wasCompleted = li.classList.contains('completed');
  li.classList.toggle('completed');
  tasks[currentDate][index].completed = li.classList.contains('completed');
  localStorage.setItem('dailyTasks', JSON.stringify(tasks));

  if (!wasCompleted && li.classList.contains('completed')) {
    tasksCompleted++;
  } else if (wasCompleted && !li.classList.contains('completed')) {
    tasksCompleted--;
  }

  localStorage.setItem('tasksCompleted', tasksCompleted.toString());
  updateStats();
});

    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  }

  // Reset all progress
  function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      localStorage.removeItem('progress100Days');
      localStorage.removeItem('dailyTasks');
      localStorage.removeItem('badges');
      localStorage.removeItem('tasksCompleted');
      localStorage.removeItem('userPoints');
      localStorage.removeItem('theme');
      location.reload();
    }
  }
});

// Close modal
function closeModal() {
  document.getElementById('congratulationModal').style.display = 'none';
}

// Close badge modal
function closeBadgeModal() {
  document.getElementById('badgeUnlockedModal').style.display = 'none';
}





// Add this to your main JavaScript file
const installButton = document.getElementById('installButton');
let deferredPrompt;

// Only show button if PWA is supported
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installButton.classList.remove('hidden');
});

// Button click handler
installButton.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    installButton.textContent = 'App Installed!';
    installButton.disabled = true;
  }
  deferredPrompt = null;
});

// Hide button after installation
window.addEventListener('appinstalled', () => {
  installButton.classList.add('hidden');
});


