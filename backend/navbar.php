<?php
session_start();
?>

<nav class="navbar">
  <div class="nav-logo">
    <img src="/assets/logo.png" alt="Logo" class="navbar-image" />
    TaskSpark
  </div>
  <ul class="nav-links">
    <li><a href="/">About</a></li>

    <?php if (!isset($_SESSION['user'])): ?>
      <li><a href="/login.php">Log in</a></li>
    <?php else: ?>
      <li class="profile-dropdown">
        <button onclick="toggleDropdown()" class="profile-btn">
          <?= htmlspecialchars($_SESSION['user']['username']) ?> ⏷
        </button>
        <ul class="dropdown-menu" id="dropdownMenu">
          <li><a href="/logout.php">Log out</a></li>
        </ul>
      </li>
    <?php endif; ?>
  </ul>
</nav>

<script>
function toggleDropdown() {
  const dropdown = document.getElementById('dropdownMenu');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}
</script>
