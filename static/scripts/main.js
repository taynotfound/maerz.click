// log htmx on dev
// htmx.logAll();

// add text/html accept header to receive html instead of json for the requests
document.body.addEventListener("htmx:configRequest", function(evt) {
  evt.detail.headers["Accept"] = "text/html,*/*";
});

// redirect to homepage
document.body.addEventListener("redirectToHomepage", function() {
  setTimeout(() => {
    window.location.replace("/");
  }, 1500);
});

// reset form if event is sent from the backend
function resetForm(id) {
  return function() {
    const form = document.getElementById(id);
    if (!form) return;
    form.reset();
  }
}
document.body.addEventListener("resetChangePasswordForm", resetForm("change-password"));
document.body.addEventListener("resetChangeEmailForm", resetForm("change-email"));

// an htmx extension to use the specifed params in the path instead of the query or body
htmx.defineExtension("path-params", {
  onEvent: function(name, evt) {
    if (name === "htmx:configRequest") {
      evt.detail.path = evt.detail.path.replace(/{([^}]+)}/g, function(_, param) {
        var val = evt.detail.parameters[param]
        delete evt.detail.parameters[param]
        return val === undefined ? "{" + param + "}" : encodeURIComponent(val)
      })
    }
  }
})

// find closest element
function closest(selector, elm) {
  let element = elm || this;

  while (element && element.nodeType === 1) {
    if (element.matches(selector)) {
      return element;
    }

    element = element.parentNode;
  }

  return null;
};

// get url query param
function getQueryParams() {
  const search = window.location.search.replace("?", "");
  const query = {};
  search.split("&").map(q => {
    const keyvalue = q.split("=");
    query[keyvalue[0]] = keyvalue[1];
  });
  return query;
}

// trim text
function trimText(selector, length) {
  const element = document.querySelector(selector);
  if (!element) return;
  let text = element.textContent;
  if (typeof text !== "string") return;
  text = text.trim();
  if (text.length > length) {
    element.textContent = text.split("").slice(0, length).join("") + "...";
  }
}

function formatDateHour(selector) {
  const element = document.querySelector(selector);
  if (!element) return;
  const dateString = element.dataset.date;
  if (!dateString) return;
  const date = new Date(dateString);
  element.textContent = date.getHours() + ":" + date.getMinutes();
}

// show QR code
function handleQRCode(element, id) {
  const dialog = document.getElementById(id);
  const dialogContent = dialog.querySelector(".content-wrapper");
  if (!dialogContent) return;
  
  openDialog(id, "qrcode");
  
  const url = element.dataset.url;
  
  dialogContent.innerHTML = `
    <div class="qrcode-wrapper">
      <div class="modal-header">
        <h3>QR Code Generator</h3>
        <button class="modal-close" onclick="closeDialog('${id}')">
          <svg fill="currentColor" viewBox="0 0 16 16" width="20" height="20">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </button>
      </div>
      <div class="qrcode-content">
        <div class="qrcode-preview">
          <div class="qrcode-container" id="qrcode-display"></div>
          <p class="url-display">
            ${url}
          </p>
        </div>
        <div class="qrcode-customization">
          <h4>Customize QR Code</h4>
          
          <div class="qr-form-group">
            <label>Size</label>
            <select id="qr-size" onchange="updateQRPreview()">
              <option value="128">Small (128×128)</option>
              <option value="192">Medium (192×192)</option>
              <option value="256" selected>Large (256×256)</option>
              <option value="320">X-Large (320×320)</option>
              <option value="384">XX-Large (384×384)</option>
              <option value="512">Huge (512×512)</option>
            </select>
          </div>
          
          <div class="qr-form-group">
            <label>Foreground Color</label>
            <div class="color-input-wrapper">
              <input type="color" id="qr-fg-color" value="#000000" onchange="updateQRPreview()">
              <span class="color-value">#000000</span>
            </div>
          </div>
          
          <div class="qr-form-group">
            <label>Background Color</label>
            <div class="color-input-wrapper">
              <input type="color" id="qr-bg-color" value="#ffffff" onchange="updateQRPreview()">
              <span class="color-value">#ffffff</span>
            </div>
          </div>
          
          <div class="qr-form-group">
            <label>Error Correction Level</label>
            <select id="qr-error-level" onchange="updateQRPreview()">
              <option value="L">Low (7% recovery)</option>
              <option value="M">Medium (15% recovery)</option>
              <option value="Q">Quartile (25% recovery)</option>
              <option value="H" selected>High (30% recovery)</option>
            </select>
          </div>
        </div>
      </div>
      <div class="qrcode-controls">
        <button class="button secondary" onclick="downloadQRCode()">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
          </svg>
          Download PNG
        </button>
        <button class="button secondary" onclick="downloadQRCodeSVG()">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
          </svg>
          Download SVG
        </button>
        <button class="button primary" onclick="resetQRCustomization()">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
            <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
          </svg>
          Reset
        </button>
      </div>
    </div>
  `;
  
  // Initialize QR code
  window.currentQRURL = url;
  updateQRPreview();
  
  // Add color value display handlers
  const fgColorInput = document.getElementById('qr-fg-color');
  const bgColorInput = document.getElementById('qr-bg-color');
  
  fgColorInput.addEventListener('input', function() {
    this.nextElementSibling.textContent = this.value.toUpperCase();
  });
  
  bgColorInput.addEventListener('input', function() {
    this.nextElementSibling.textContent = this.value.toUpperCase();
  });
}

function updateQRPreview() {
  const container = document.getElementById('qrcode-display');
  const size = parseInt(document.getElementById('qr-size').value);
  const fgColor = document.getElementById('qr-fg-color').value;
  const bgColor = document.getElementById('qr-bg-color').value;
  const errorLevel = document.getElementById('qr-error-level').value;
  
  if (container && window.currentQRURL) {
    // Clear previous QR code
    container.innerHTML = '';
    
    try {
      const errorLevels = {
        'L': QRCode.CorrectLevel.L,
        'M': QRCode.CorrectLevel.M,
        'Q': QRCode.CorrectLevel.Q,
        'H': QRCode.CorrectLevel.H
      };
      
      // Create new QR code with updated settings
      window.currentQRCode = new QRCode(container, {
        text: window.currentQRURL,
        width: size,
        height: size,
        colorDark: fgColor,
        colorLight: bgColor,
        correctLevel: errorLevels[errorLevel] || QRCode.CorrectLevel.H
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      container.innerHTML = '<div class="qr-error">Error generating QR code</div>';
    }
  }
}

function resetQRCustomization() {
  // Reset all form values to defaults
  document.getElementById('qr-size').value = '256';
  document.getElementById('qr-fg-color').value = '#000000';
  document.getElementById('qr-bg-color').value = '#ffffff';
  document.getElementById('qr-error-level').value = 'H';
  
  // Update color value displays
  const fgColorSpan = document.querySelector('#qr-fg-color + .color-value');
  const bgColorSpan = document.querySelector('#qr-bg-color + .color-value');
  
  if (fgColorSpan) fgColorSpan.textContent = '#000000';
  if (bgColorSpan) bgColorSpan.textContent = '#FFFFFF';
  
  // Regenerate QR code with default settings
  updateQRPreview();
}

function handleLogoUpload(input) {
  const file = input.files[0];
  const preview = document.getElementById('logo-preview');
  
  if (file) {
    if (file.size > 100 * 1024) { // 100KB limit
      alert('Logo file must be under 100KB');
      input.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
      // You could add logo overlay functionality here
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = 'none';
  }
}

function downloadQRCode() {
  const canvas = document.querySelector('#qrcode-display canvas');
  if (canvas) {
    try {
      const link = document.createElement('a');
      const timestamp = new Date().getTime();
      link.download = `qrcode-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Error downloading QR code. Please try again.');
    }
  } else {
    alert('No QR code found to download.');
  }
}

function downloadQRCodeSVG() {
  const canvas = document.querySelector('#qrcode-display canvas');
  if (canvas) {
    try {
      const size = parseInt(document.getElementById('qr-size').value);
      const fgColor = document.getElementById('qr-fg-color').value;
      const bgColor = document.getElementById('qr-bg-color').value;
      
      // Convert canvas to data URL
      const dataURL = canvas.toDataURL('image/png');
      
      // Create SVG
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${bgColor}"/>
  <image href="${dataURL}" width="${size}" height="${size}"/>
</svg>`;
      
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      const timestamp = new Date().getTime();
      link.download = `qrcode-${timestamp}.svg`;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading SVG:', error);
      alert('Error downloading SVG. Please try again.');
    }
  } else {
    alert('No QR code found to download.');
  }
}



function shareToTwitter(url, title) {
  const text = encodeURIComponent(`Check out this link: ${title || ''}`);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
}

function shareToFacebook(url) {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareToLinkedIn(url, title) {
  const text = encodeURIComponent(title || 'Check out this link');
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${text}`, '_blank');
}

function shareToReddit(url, title) {
  const text = encodeURIComponent(title || 'Check out this link');
  window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${text}`, '_blank');
}

function shareToTelegram(url, title) {
  const text = encodeURIComponent(`${title || 'Check out this link'} ${url}`);
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
}

function shareToWhatsApp(url, title) {
  const text = encodeURIComponent(`${title || 'Check out this link'} ${url}`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

// Enhanced dialog management with proper event handling
function closeDialog(dialogId) {
  let dialog;
  
  if (dialogId) {
    dialog = document.getElementById(dialogId);
  } else {
    dialog = document.querySelector(".dialog.open");
  }
  
  if (dialog) {
    dialog.classList.remove('show', 'open');
    dialog.style.display = 'none';
    
    // Clear any existing content
    const contentWrapper = dialog.querySelector('.content-wrapper');
    if (contentWrapper) {
      contentWrapper.innerHTML = '';
    }
    
    // Remove all dynamic classes except 'dialog'
    const classList = Array.from(dialog.classList);
    classList.forEach(className => {
      if (className !== 'dialog') {
        dialog.classList.remove(className);
      }
    });
    
    // Remove event listeners to prevent memory leaks
    dialog.removeAttribute('data-close-listeners');
  }
}

function openDialog(dialogId, type) {
  // Close any existing dialog first
  closeDialog();
  
  const dialog = document.getElementById(dialogId);
  if (dialog) {
    dialog.classList.add('open');
    dialog.style.display = 'flex';
    
    if (type) {
      dialog.classList.add(type);
    }
    
    // Mark that close listeners are active for this dialog
    dialog.setAttribute('data-close-listeners', 'true');
  }
}

// Enhanced global event handlers for dialog management
document.addEventListener('click', function(event) {
  const dialog = document.querySelector('.dialog.open');
  if (dialog && event.target === dialog && dialog.hasAttribute('data-close-listeners')) {
    closeDialog();
  }
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const dialog = document.querySelector('.dialog.open');
    if (dialog && dialog.hasAttribute('data-close-listeners')) {
      closeDialog();
    }
  }
});

// Enhanced user dropdown menu functionality - Single implementation
document.addEventListener('DOMContentLoaded', function() {
  // Modern user dropdown
  const userTrigger = document.getElementById('user-dropdown-trigger');
  const userPanel = document.getElementById('user-dropdown-menu');
  
  if (userTrigger && userPanel) {
    // Toggle dropdown on click
    userTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const isExpanded = userTrigger.getAttribute('aria-expanded') === 'true';
      userTrigger.setAttribute('aria-expanded', !isExpanded);
    });
    
    // Prevent dropdown from closing when clicking inside
    userPanel.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
  
  // Legacy user dropdown support
  const userMenuToggle = document.querySelector('.user-menu-toggle');
  const userMenu = document.querySelector('.user-menu');
  
  if (userMenuToggle && userMenu) {
    // Toggle dropdown on click
    userMenuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const isExpanded = userMenuToggle.getAttribute('aria-expanded') === 'true';
      userMenuToggle.setAttribute('aria-expanded', !isExpanded);
    });
  }
  
  // Global handlers for all dropdowns (only add once)
  document.addEventListener('click', function(e) {
    // Close modern dropdown when clicking outside
    if (userTrigger && userPanel && !userTrigger.contains(e.target) && !userPanel.contains(e.target)) {
      userTrigger.setAttribute('aria-expanded', 'false');
    }
    
    // Close legacy dropdown when clicking outside
    if (userMenuToggle && userMenu && !userMenuToggle.contains(e.target) && !userMenu.contains(e.target)) {
      userMenuToggle.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Global escape key handler for all dropdowns
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (userTrigger) userTrigger.setAttribute('aria-expanded', 'false');
      if (userMenuToggle) userMenuToggle.setAttribute('aria-expanded', 'false');
    }
  });
});





// handle navigation in the table of links
function setLinksLimit(event) {
  const buttons = Array.from(document.querySelectorAll("table .nav .limit button"));
  const limitInput = document.querySelector("#limit");
  if (!limitInput || !buttons || !buttons.length) return;
  limitInput.value = event.target.textContent;
  buttons.forEach(b => {
    b.disabled = b.textContent === event.target.textContent;
  });
}

function setLinksSkip(event, action) {
  const buttons = Array.from(document.querySelectorAll("table .nav .pagination button"));
  const limitElm = document.querySelector("#limit");
  const totalElm = document.querySelector("#total");
  const skipElm = document.querySelector("#skip");
  if (!buttons || !limitElm || !totalElm || !skipElm) return;
  const skip = parseInt(skipElm.value);
  const limit = parseInt(limitElm.value);
  const total = parseInt(totalElm.value);
  skipElm.value = action === "next" ? skip + limit : Math.max(skip - limit, 0);
  document.querySelectorAll(".pagination .next").forEach(elm => {
    elm.disabled = total <= parseInt(skipElm.value) + limit;
  });
  document.querySelectorAll(".pagination .prev").forEach(elm => {
    elm.disabled = parseInt(skipElm.value) <= 0;
  });
}

function updateLinksNav() {
  const totalElm = document.querySelector("#total");
  const skipElm = document.querySelector("#skip");
  const limitElm = document.querySelector("#limit");
  if (!totalElm || !skipElm || !limitElm) return;
  const total = parseInt(totalElm.value);
  const skip = parseInt(skipElm.value);
  const limit = parseInt(limitElm.value);
  document.querySelectorAll(".pagination .next").forEach(elm => {
    elm.disabled = total <= skip + limit;
  });
  document.querySelectorAll(".pagination .prev").forEach(elm => {
    elm.disabled = skip <= 0;
  });
}

function resetTableNav() {
  const totalElm = document.querySelector("#total");
  const skipElm = document.querySelector("#skip");
  const limitElm = document.querySelector("#limit");
  if (!totalElm || !skipElm || !limitElm) return;
  skipElm.value = 0;
  limitElm.value = 10;
  const total = parseInt(totalElm.value);
  const skip = parseInt(skipElm.value);
  const limit = parseInt(limitElm.value);
  document.querySelectorAll(".pagination .next").forEach(elm => {
    elm.disabled = total <= skip + limit;
  });
  document.querySelectorAll(".pagination .prev").forEach(elm => {
    elm.disabled = skip <= 0;
  });
  document.querySelectorAll("table .nav .limit button").forEach(b => {
    b.disabled = b.textContent === limit.toString();
  });
}

// tab click
function setTab(event, targetId) {
  const tabs = Array.from(closest("nav", event.target).children);
  tabs.forEach(function (tab) {
    tab.classList.remove("active");
  });
  if (targetId) {
    document.getElementById(targetId).classList.add("active");
  } else {
    event.target.classList.add("active");
  }
}

// show clear search button
function onSearchChange(event) {
  const clearButton = event.target.parentElement.querySelector("button.clear");
  if (!clearButton) return;
  clearButton.style.display = event.target.value.length > 0 ? "block" : "none";
}

function clearSeachInput(event) {
  event.preventDefault();
  const button = closest("button", event.target);
  const input = button.parentElement.querySelector("input");
  if (!input) return;
  input.value = "";
  button.style.display = "none";
  htmx.trigger("body", "reloadMainTable");
}

// detect if search inputs have value on load to show clear button
function onSearchInputLoad() {
  const linkSearchInput = document.getElementById("search");
  if (linkSearchInput) {
    const linkClearButton = linkSearchInput.parentElement.querySelector("button.clear");
    if (linkClearButton) {
      linkClearButton.style.display = linkSearchInput.value.length > 0 ? "block" : "none";
    }
  }

  const userSearchInput = document.getElementById("search_user");
  if (userSearchInput) {
    const userClearButton = userSearchInput.parentElement.querySelector("button.clear");
    if (userClearButton) {
      userClearButton.style.display = userSearchInput.value.length > 0 ? "block" : "none";
    }
  }

  const domainSearchInput = document.getElementById("search_domain");
  if (domainSearchInput) {
    const domainClearButton = domainSearchInput.parentElement.querySelector("button.clear");
    if (domainClearButton) {
      domainClearButton.style.display = domainSearchInput.value.length > 0 ? "block" : "none";
    }
  }
}

onSearchInputLoad();

// create user checkbox control
function canSendVerificationEmail() {
  const canSendVerificationEmail = !document.getElementById("create-user-verified").checked && !document.getElementById("create-user-banned").checked;
  const checkbox = document.getElementById("send-email-label");
  if (canSendVerificationEmail)
    checkbox.classList.remove("hidden");
  if (!canSendVerificationEmail && !checkbox.classList.contains("hidden"))
    checkbox.classList.add("hidden");
}

// htmx prefetch extension
// https://github.com/bigskysoftware/htmx-extensions/blob/main/src/preload/README.md
htmx.defineExtension("preload", {
  onEvent: function(name, event) {
    if (name !== "htmx:afterProcessNode") {
      return
    }
    var attr = function(node, property) {
      if (node == undefined) { return undefined }
      return node.getAttribute(property) || node.getAttribute("data-" + property) || attr(node.parentElement, property)
    }
    var load = function(node) {
      var done = function(html) {
        if (!node.preloadAlways) {
          node.preloadState = "DONE"
        }

        if (attr(node, "preload-images") == "true") {
          document.createElement("div").innerHTML = html
        }
      }

      return function() {
        if (node.preloadState !== "READY") {
          return
        }
        var hxGet = node.getAttribute("hx-get") || node.getAttribute("data-hx-get")
        if (hxGet) {
          htmx.ajax("GET", hxGet, {
            source: node,
            handler: function(elt, info) {
              done(info.xhr.responseText)
            }
          })
          return
        }
        if (node.getAttribute("href")) {
          var r = new XMLHttpRequest()
          r.open("GET", node.getAttribute("href"))
          r.onload = function() { done(r.responseText) }
          r.send()
        }
      }
    }
    var init = function(node) {
      if (node.getAttribute("href") + node.getAttribute("hx-get") + node.getAttribute("data-hx-get") == "") {
        return
      }
      if (node.preloadState !== undefined) {
        return
      }
      var on = attr(node, "preload") || "mousedown"
      const always = on.indexOf("always") !== -1
      if (always) {
        on = on.replace("always", "").trim()
      }
      node.addEventListener(on, function(evt) {
        if (node.preloadState === "PAUSE") {
          node.preloadState = "READY"
          if (on === "mouseover") {
            window.setTimeout(load(node), 100)
          } else {
            load(node)()
          }
        }
      })
      switch (on) {
        case "mouseover":
          node.addEventListener("touchstart", load(node))
          node.addEventListener("mouseout", function(evt) {
            if ((evt.target === node) && (node.preloadState === "READY")) {
              node.preloadState = "PAUSE"
            }
          })
          break

        case "mousedown":
          node.addEventListener("touchstart", load(node))
          break
      }
      node.preloadState = "PAUSE"
      node.preloadAlways = always
      htmx.trigger(node, "preload:init")
    }
    const parent = event.target || event.detail.elt;
    parent.querySelectorAll("[preload]").forEach(function(node) {
      init(node)
      node.querySelectorAll("a,[hx-get],[data-hx-get]").forEach(init)
    })
  }
})

// Modern notification system
function showNotification(message, type = 'info', duration = 3000) {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification-toast');
  existingNotifications.forEach(notification => notification.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification-toast notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after duration
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, duration);
}

// Enhanced copy functionality with better feedback and legacy support
function handleCopyLink(element) {
  const url = element.dataset.url;
  if (!url) return;
  
  navigator.clipboard.writeText(url).then(() => {
    showNotification('Link copied to clipboard!', 'success');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showNotification('Link copied to clipboard!', 'success');
  });
}

// Legacy copy function with visual feedback for compatibility
function handleShortURLCopyLink(element) {
  const url = element.dataset.url;
  if (!url) return;
  
  // Use modern copy function
  handleCopyLink(element);
  
  // Keep the old visual feedback for backwards compatibility
  const clipboard = element.parentNode.querySelector(".clipboard") || closest(".clipboard", element);
  if (!clipboard || clipboard.classList.contains("copied")) return;
  clipboard.classList.add("copied");
  setTimeout(function() {
    clipboard.classList.remove("copied");
  }, 1000);
}

// Enhanced share functionality with modern dialog
function handleSocialShare(element, dialogId) {
  const url = element.dataset.url;
  const target = element.dataset.target;
  const dialog = document.getElementById(dialogId);
  const dialogContent = dialog.querySelector(".content-wrapper");
  
  if (!dialogContent) return;
  
  openDialog(dialogId, "share");
  dialogContent.innerHTML = `
    <div class="share-wrapper">
      <div class="modal-header">
        <h3>Share Link</h3>
        <button class="modal-close" onclick="closeDialog('${dialogId}')">
          <svg fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </button>
      </div>
      <div class="share-url-section">
        <p class="share-url">${url}</p>
        <button class="button primary copy-button" onclick="handleCopyLink({dataset: {url: '${url}'}})">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
          </svg>
          Copy Link
        </button>
      </div>
      <div class="social-buttons">
        <button class="social-btn twitter" onclick="shareToTwitter('${url}', '${target}')">
          <span class="social-icon">𝕏</span>
          Twitter / X
        </button>
        <button class="social-btn facebook" onclick="shareToFacebook('${url}')">
          <span class="social-icon">📘</span>
          Facebook
        </button>
        <button class="social-btn linkedin" onclick="shareToLinkedIn('${url}', '${target}')">
          <span class="social-icon">💼</span>
          LinkedIn
        </button>
        <button class="social-btn reddit" onclick="shareToReddit('${url}', '${target}')">
          <span class="social-icon">🔴</span>
          Reddit
        </button>
        <button class="social-btn telegram" onclick="shareToTelegram('${url}', '${target}')">
          <span class="social-icon">✈️</span>
          Telegram
        </button>
        <button class="social-btn whatsapp" onclick="shareToWhatsApp('${url}', '${target}')">
          <span class="social-icon">💬</span>
          WhatsApp
        </button>
      </div>
    </div>
  `;
}

// NEW FEATURES: Splash Page Management
function handleSplashPageEditor(element) {
  const linkId = element.dataset.linkId;
  const dialog = document.getElementById('splash-page-modal') || createSplashPageModal();
  const dialogContent = dialog.querySelector(".content-wrapper");
  
  if (!dialogContent) return;
  
  openDialog(dialog.id, "splash-editor");
  
  // Load existing splash page data
  loadSplashPageData(linkId).then(splashData => {
    dialogContent.innerHTML = createSplashPageEditorHTML(linkId, splashData);
    setupSplashPageEditor(linkId);
  });
}

async function loadSplashPageData(linkId) {
  try {
    const response = await fetch(`/api/splash-pages/${linkId}`);
    if (response.ok) {
      const data = await response.json();
      return data.splashPage;
    }
    return null;
  } catch (error) {
    console.error('Error loading splash page:', error);
    return null;
  }
}

function createSplashPageModal() {
  const modal = document.createElement('div');
  modal.className = 'dialog';
  modal.id = 'splash-page-modal';
  modal.innerHTML = '<div class="box"><div class="content-wrapper"></div></div>';
  document.body.appendChild(modal);
  return modal;
}

function createSplashPageEditorHTML(linkId, splashData) {
  const config = splashData?.branding_config || {};
  
  return `
    <div class="splash-editor-wrapper">
      <div class="modal-header">
        <h3>Customize Splash Page</h3>
        <button class="modal-close" onclick="closeDialog('splash-page-modal')">
          <svg fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </button>
      </div>
      
      <div class="splash-editor-content">
        <div class="splash-form-section">
          <h4>Page Content</h4>
          <div class="form-group">
            <label for="splash-title">Title</label>
            <input type="text" id="splash-title" value="${config.title || ''}" placeholder="Welcome!">
          </div>
          <div class="form-group">
            <label for="splash-description">Description</label>
            <textarea id="splash-description" placeholder="You're about to visit an awesome website...">${config.description || ''}</textarea>
          </div>
        </div>
        
        <div class="splash-form-section">
          <h4>Branding</h4>
          <div class="form-group">
            <label for="splash-primary-color">Primary Color</label>
            <input type="color" id="splash-primary-color" value="${config.primaryColor || '#3B82F6'}">
          </div>
          <div class="form-group">
            <label for="splash-bg-color">Background Color</label>
            <input type="color" id="splash-bg-color" value="${config.backgroundColor || '#FFFFFF'}">
          </div>
          <div class="form-group">
            <label for="splash-text-color">Text Color</label>
            <input type="color" id="splash-text-color" value="${config.textColor || '#1F2937'}">
          </div>
        </div>
        
        <div class="splash-form-section">
          <h4>Behavior</h4>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="splash-auto-redirect" ${config.autoRedirect ? 'checked' : ''}>
              Auto-redirect after delay
            </label>
          </div>
          <div class="form-group" id="redirect-delay-group" style="display: ${config.autoRedirect ? 'block' : 'none'}">
            <label for="splash-delay">Delay (seconds)</label>
            <input type="number" id="splash-delay" value="${config.autoRedirectDelay || 5}" min="1" max="30">
          </div>
        </div>
        
        <div class="splash-form-section">
          <h4>Template</h4>
          <select id="splash-template">
            <option value="minimal" ${splashData?.template_type === 'minimal' ? 'selected' : ''}>Minimal</option>
            <option value="promotional" ${splashData?.template_type === 'promotional' ? 'selected' : ''}>Promotional</option>
            <option value="branded" ${splashData?.template_type === 'branded' ? 'selected' : ''}>Branded</option>
            <option value="warning" ${splashData?.template_type === 'warning' ? 'selected' : ''}>Warning</option>
          </select>
        </div>
      </div>
      
      <div class="splash-editor-actions">
        <button type="button" class="button secondary" onclick="disableSplashPage('${linkId}')">
          Disable Splash Page
        </button>
        <button type="button" class="button secondary" onclick="previewSplashPage('${linkId}')">
          Preview
        </button>
        <button type="button" class="button primary" onclick="saveSplashPage('${linkId}')">
          Save Splash Page
        </button>
      </div>
    </div>
  `;
}

function setupSplashPageEditor(linkId) {
  // Auto-redirect toggle
  const autoRedirectCheck = document.getElementById('splash-auto-redirect');
  const delayGroup = document.getElementById('redirect-delay-group');
  
  autoRedirectCheck.addEventListener('change', function() {
    delayGroup.style.display = this.checked ? 'block' : 'none';
  });
}

async function saveSplashPage(linkId) {
  const data = {
    template_type: document.getElementById('splash-template').value,
    is_active: true,
    branding_config: {
      title: document.getElementById('splash-title').value,
      description: document.getElementById('splash-description').value,
      primaryColor: document.getElementById('splash-primary-color').value,
      backgroundColor: document.getElementById('splash-bg-color').value,
      textColor: document.getElementById('splash-text-color').value,
      autoRedirect: document.getElementById('splash-auto-redirect').checked,
      autoRedirectDelay: parseInt(document.getElementById('splash-delay').value) || 5
    }
  };
  
  try {
    const response = await fetch(`/api/splash-pages/${linkId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showNotification('Splash page saved!', 'success');
      closeDialog('splash-page-modal');
    } else {
      const error = await response.json();
      showNotification(error.error || 'Failed to save splash page', 'error');
    }
  } catch (error) {
    console.error('Error saving splash page:', error);
    showNotification('Failed to save splash page', 'error');
  }
}

async function disableSplashPage(linkId) {
  try {
    const response = await fetch(`/api/splash-pages/${linkId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      showNotification('Splash page disabled', 'success');
      closeDialog('splash-page-modal');
    } else {
      showNotification('Failed to disable splash page', 'error');
    }
  } catch (error) {
    console.error('Error disabling splash page:', error);
    showNotification('Failed to disable splash page', 'error');
  }
}

function previewSplashPage(linkId) {
  window.open(`/s/${linkId}/splash`, '_blank');
}

// NEW FEATURES: Link Preview Generation
async function generateLinkPreview(element) {
  const linkId = element.dataset.linkId;
  
  try {
    const response = await fetch(`/api/link-previews/${linkId}/generate`, {
      method: 'POST'
    });
    
    if (response.ok) {
      showNotification('Preview generated!', 'success');
      // Optionally refresh the link list or show preview
    } else {
      const error = await response.json();
      showNotification(error.error || 'Failed to generate preview', 'error');
    }
  } catch (error) {
    console.error('Error generating preview:', error);
    showNotification('Failed to generate preview', 'error');
  }
}

async function bulkGeneratePreviews() {
  // Get selected links or all links
  const linkElements = document.querySelectorAll('[data-link-id]');
  const linkIds = Array.from(linkElements).map(el => el.dataset.linkId).filter(Boolean);
  
  if (linkIds.length === 0) {
    showNotification('No links found to generate previews', 'warning');
    return;
  }
  
  try {
    const response = await fetch('/api/link-previews/bulk-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ link_ids: linkIds })
    });
    
    if (response.ok) {
      const results = await response.json();
      const successCount = results.results.filter(r => r.success).length;
      showNotification(`Generated ${successCount} previews!`, 'success');
    } else {
      showNotification('Failed to generate previews', 'error');
    }
  } catch (error) {
    console.error('Error generating previews:', error);
    showNotification('Failed to generate previews', 'error');
  }
}