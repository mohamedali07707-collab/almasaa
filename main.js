/* ============================================
   Almasa Travel Agency - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all functions
  initMobileMenu();
  initScrollAnimations();
  initCounterAnimation();
  initHeaderScroll();
  init3DAirplane();
  initFormHandler();
  initSmoothScroll();
});

/* ============================================
   Mobile Menu Toggle
   ============================================ */
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
      });
    });
  }
}

/* ============================================
   Header Scroll Effect
   ============================================ */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
}

/* ============================================
   Scroll Animations (Intersection Observer)
   ============================================ */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  revealElements.forEach(el => revealObserver.observe(el));
}

/* ============================================
   Counter Animation
   ============================================ */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.counter-number');
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.ceil(current).toLocaleString();
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toLocaleString();
          }
        };
        
        updateCounter();
        counterObserver.unobserve(counter);
      }
    });
  }, {
    threshold: 0.5
  });
  
  counters.forEach(counter => counterObserver.observe(counter));
}

/* ============================================
   3D Airplane Scene (Three.js)
   ============================================ */
function init3DAirplane() {
  const canvasContainer = document.getElementById('airplane-canvas');
  
  if (!canvasContainer) return;
  
  // Check if WebGL is available
  if (!window.WebGLRenderingContext) {
    createFallbackAirplane(canvasContainer);
    return;
  }
  
  // Three.js Scene Setup
  const scene = new THREE.Scene();
  
  // Camera
  const camera = new THREE.PerspectiveCamera(
    50,
    canvasContainer.clientWidth / canvasContainer.clientHeight,
    0.1,
    1000
  );
  camera.position.set(5, 2, 8);
  camera.lookAt(0, 0, 0);
  
  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  canvasContainer.appendChild(renderer.domElement);
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);
  
  const pointLight = new THREE.PointLight(0x87CEEB, 0.5);
  pointLight.position.set(-5, 5, -5);
  scene.add(pointLight);
  
  // Create Airplane
  const airplane = createAirplane();
  airplane.position.set(0, 0, 0);
  airplane.scale.set(0.8, 0.8, 0.8);
  scene.add(airplane);
  
  // Create Clouds
  const clouds = createClouds();
  clouds.forEach(cloud => scene.add(cloud));
  
  // Scroll-based animation
  let targetRotationY = 0;
  let targetPositionY = 0;
  let targetPositionX = 0;
  let currentRotationY = 0;
  let currentPositionY = 0;
  let currentPositionX = 0;
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = scrollY / maxScroll;
    
    // Airplane moves along a path based on scroll
    targetRotationY = scrollPercent * Math.PI * 0.5;
    targetPositionY = Math.sin(scrollPercent * Math.PI) * 1.5;
    targetPositionX = scrollPercent * 2;
  });
  
  // Mouse hover effect
  let isHovering = false;
  let targetTiltX = 0;
  let targetTiltZ = 0;
  
  canvasContainer.addEventListener('mousemove', (e) => {
    if (isHovering) {
      const rect = canvasContainer.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetTiltX = y * 0.3;
      targetTiltZ = -x * 0.3;
    }
  });
  
  canvasContainer.addEventListener('mouseenter', () => {
    isHovering = true;
  });
  
  canvasContainer.addEventListener('mouseleave', () => {
    isHovering = false;
    targetTiltX = 0;
    targetTiltZ = 0;
  });
  
  // Animation Loop
  let time = 0;
  const animate = () => {
    requestAnimationFrame(animate);
    time += 0.01;
    
    // Smooth interpolation
    currentRotationY += (targetRotationY - currentRotationY) * 0.05;
    currentPositionY += (targetPositionY - currentPositionY) * 0.05;
    currentPositionX += (targetPositionX - currentPositionX) * 0.05;
    
    // Idle floating animation
    const idleFloat = Math.sin(time * 2) * 0.1;
    const idleTilt = Math.sin(time * 1.5) * 0.05;
    
    // Apply transformations
    airplane.rotation.y = currentRotationY + idleTilt;
    airplane.rotation.x = targetTiltX + idleFloat * 0.3;
    airplane.rotation.z = targetTiltZ;
    airplane.position.y = currentPositionY + idleFloat;
    airplane.position.x = currentPositionX;
    
    // Animate clouds
    clouds.forEach((cloud, i) => {
      cloud.position.x += 0.005 * (i + 1);
      if (cloud.position.x > 15) {
        cloud.position.x = -15;
      }
    });
    
    renderer.render(scene, camera);
  };
  
  animate();
  
  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
  });
}

/* ============================================
   Create 3D Airplane Model
   ============================================ */
function createAirplane() {
  const airplane = new THREE.Group();
  
  // Fuselage
  const fuselageGeometry = new THREE.CylinderGeometry(0.3, 0.15, 4, 32);
  const fuselageMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 100
  });
  const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
  fuselage.rotation.z = Math.PI / 2;
  airplane.add(fuselage);
  
  // Cockpit
  const cockpitGeometry = new THREE.SphereGeometry(0.25, 32, 32);
  const cockpitMaterial = new THREE.MeshPhongMaterial({
    color: 0x87CEEB,
    transparent: true,
    opacity: 0.8,
    shininess: 150
  });
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  cockpit.position.set(1.2, 0.15, 0);
  cockpit.scale.set(1.5, 1, 1);
  airplane.add(cockpit);
  
  // Wings
  const wingGeometry = new THREE.BoxGeometry(0.8, 0.05, 3);
  const wingMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 80
  });
  const wings = new THREE.Mesh(wingGeometry, wingMaterial);
  wings.position.set(0, 0, 0);
  airplane.add(wings);
  
  // Tail Wing (Horizontal)
  const tailWingGeometry = new THREE.BoxGeometry(0.4, 0.03, 1.2);
  const tailWing = new THREE.Mesh(tailWingGeometry, wingMaterial);
  tailWing.position.set(-1.8, 0, 0);
  airplane.add(tailWing);
  
  // Tail Wing (Vertical)
  const tailFinGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.03);
  const tailFin = new THREE.Mesh(tailFinGeometry, wingMaterial);
  tailFin.position.set(-1.8, 0.25, 0);
  airplane.add(tailFin);
  
  // Engines
  const engineGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 16);
  const engineMaterial = new THREE.MeshPhongMaterial({
    color: 0xADD8E6,
    shininess: 100
  });
  
  const engineLeft = new THREE.Mesh(engineGeometry, engineMaterial);
  engineLeft.rotation.z = Math.PI / 2;
  engineLeft.position.set(0.2, -0.15, 1.2);
  airplane.add(engineLeft);
  
  const engineRight = new THREE.Mesh(engineGeometry, engineMaterial);
  engineRight.rotation.z = Math.PI / 2;
  engineRight.position.set(0.2, -0.15, -1.2);
  airplane.add(engineRight);
  
  return airplane;
}

/* ============================================
   Create Clouds
   ============================================ */
function createClouds() {
  const clouds = [];
  const cloudGeometry = new THREE.SphereGeometry(1, 16, 16);
  const cloudMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.6
  });
  
  for (let i = 0; i < 8; i++) {
    const cloud = new THREE.Group();
    
    // Create cloud from multiple spheres
    for (let j = 0; j < 5; j++) {
      const sphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
      sphere.position.set(
        j * 0.8 - 1.6,
        Math.random() * 0.3,
        Math.random() * 0.5 - 0.25
      );
      sphere.scale.set(
        0.5 + Math.random() * 0.5,
        0.3 + Math.random() * 0.3,
        0.5 + Math.random() * 0.5
      );
      cloud.add(sphere);
    }
    
    cloud.position.set(
      Math.random() * 20 - 10,
      Math.random() * 3 - 1,
      Math.random() * 10 - 5
    );
    cloud.scale.setScalar(0.5 + Math.random() * 0.5);
    
    clouds.push(cloud);
  }
  
  return clouds;
}

/* ============================================
   Fallback Airplane (SVG)
   ============================================ */
function createFallbackAirplane(container) {
  container.innerHTML = `
    <svg viewBox="0 0 400 200" class="fallback-airplane">
      <defs>
        <linearGradient id="planeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#ffffff"/>
          <stop offset="100%" style="stop-color:#ADD8E6"/>
        </linearGradient>
      </defs>
      <g class="airplane-group" transform="translate(100, 80)">
        <!-- Fuselage -->
        <ellipse cx="100" cy="20" rx="80" ry="15" fill="url(#planeGradient)"/>
        <!-- Cockpit -->
        <ellipse cx="160" cy="15" rx="20" ry="10" fill="#87CEEB" opacity="0.8"/>
        <!-- Wings -->
        <path d="M60,20 L140,5 L140,35 L60,20" fill="url(#planeGradient)"/>
        <!-- Tail -->
        <path d="M10,20 L40,5 L40,35 L10,20" fill="url(#planeGradient)"/>
        <rect x="15" y="5" width="20" height="30" fill="url(#planeGradient)"/>
        <!-- Engines -->
        <circle cx="80" cy="35" r="8" fill="#ADD8E6"/>
        <circle cx="80" cy="5" r="8" fill="#ADD8E6"/>
      </g>
    </svg>
  `;
  
  // Add animation to fallback
  const airplaneGroup = container.querySelector('.airplane-group');
  if (airplaneGroup) {
    airplaneGroup.style.animation = 'floatAirplane 3s ease-in-out infinite';
  }
  
  // Add keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatAirplane {
      0%, 100% { transform: translate(100px, 80px) rotate(0deg); }
      50% { transform: translate(100px, 70px) rotate(2deg); }
    }
    .fallback-airplane {
      width: 100%;
      height: 100%;
    }
  `;
  document.head.appendChild(style);
  
  // Add scroll listener for fallback
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = scrollY / maxScroll;
    
    if (airplaneGroup) {
      airplaneGroup.style.transform = `translate(${100 + scrollPercent * 100}px, ${80 - scrollPercent * 30}px) rotate(${scrollPercent * 10}deg)`;
    }
  });
}

/* ============================================
   Contact Form Handler (Mailto)
   ============================================ */
function initFormHandler() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const message = document.getElementById('message')?.value || '';
      
      // Build mailto link
      const mailtoLink = `mailto:info@mohamedali.site?subject=${encodeURIComponent('Contact from Almasa Website')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\nMessage: ${message}`)}`;
      
      // Open default email client
      window.location.href = mailtoLink;
    });
  }
}

/* ============================================
   Smooth Scroll
   ============================================ */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}

/* ============================================
   Service Card CTA Handler
   ============================================ */
function initServiceCta() {
  const serviceCtaButtons = document.querySelectorAll('.service-cta');
  
  serviceCtaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const service = button.getAttribute('data-service');
      const subject = encodeURIComponent(`Inquiry about ${service}`);
      const body = encodeURIComponent(`Hello Almasa,\n\nI am interested in your ${service} service. Please provide more information.\n\nThank you.`);
      window.location.href = `mailto:info@mohamedali.site?subject=${subject}&body=${body}`;
    });
  });
}

// Initialize service CTA when DOM is ready
document.addEventListener('DOMContentLoaded', initServiceCta);

