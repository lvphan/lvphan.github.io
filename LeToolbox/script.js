$(document).ready(function() {
    // Initialize dark mode based on localStorage
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.setAttribute('data-theme', 'dark');
        $('#darkModeToggle').prop('checked', true);
    }
});

// Dark Mode Toggle Functionality
$('#darkModeToggle').change(function() {
    if ($(this).is(':checked')) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('darkMode', 'true');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('darkMode', 'false');
    }
});

function formatText() {
    const input = document.getElementById('textInput').value;
    // Split the text only by commas or new lines
    const text = input.split(/[\n,]+/).filter(text => text.trim());
    // Join back the words, wrapping each in quotes and joining with a comma
    const formatted = text.map(text => `"${text.trim()}"`).join(', ');
    document.getElementById('textOutput').value = formatted;
}

// Defang/refang functions
function defang() {
    const input = document.getElementById('fangInput').value;
    let output = input
        // Replace http with hxxp
        .replace(/http/gi, 'hxxp')
        // Replace dots in URLs/IPs with [.]
        .replace(/\./g, '[.]')
        // Replace @ in URLs with [@]
        .replace(/@/g, '[@]')
        // Replace : with [:]
        .replace(/:/g, '[:]');
    
    document.getElementById('fangOutput').value = output;
}

function refang() {
    const input = document.getElementById('fangInput').value;
    let output = input
        // Replace hxxp with http
        .replace(/hxxp/gi, 'http')
        // Remove brackets around dots
        .replace(/\[\.\]/g, '.')
        // Remove brackets around @
        .replace(/\[@\]/g, '@')
        // Remove brackets around colons
        .replace(/\[:\]/g, ':');
    
    document.getElementById('fangOutput').value = output;
}

function copyText(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');
    
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
        button.textContent = originalText;
    }, 1000);
}

function openVirusTotal() {
    const input = document.getElementById("threatInput").value;
    const items = input.split(/\r?\n/).filter((item) => item.trim());

    if (items.length === 0) {
        alert("Please enter at least one IP or domain.");
        return;
    }

    const url = `https://www.virustotal.com/gui/search/${encodeURIComponent(items[0])}`;
    window.open(url, "_blank");
}

function openAbuseIPDB() {
    const input = document.getElementById("threatInput").value;
    const items = input.split(/\r?\n/).filter((item) => item.trim());

    if (items.length === 0) {
        alert("Please enter at least one IP or domain.");
        return;
    }

    const url = `https://www.abuseipdb.com/check/${encodeURIComponent(items[0])}`;
    window.open(url, "_blank");
}

function searchThreatIntel() {
    const input = document.getElementById('threatInput').value;
    const items = input.split(/\r?\n/).filter(item => item.trim());
    let output = '';

    items.forEach(item => {
        const trimmedItem = item.trim();
        if (trimmedItem) {
            output += `https://www.virustotal.com/gui/search/${encodeURIComponent(trimmedItem)}\n`;
            output += `https://www.abuseipdb.com/check/${encodeURIComponent(trimmedItem)}\n\n`;
        }
    });

    document.getElementById('threatOutput').value = output.trim();
}

function decodeSafelinks() {
    const input = document.getElementById("safelinkInput").value;
    let decodedOutput = [];

    // Split input by new lines or commas, trim any leading/trailing spaces
    const safelinks = input.split(/[\n,]+/).map(item => item.trim()).filter(item => item.length > 0);

    if (safelinks.length === 0) {
        decodedOutput = ["Error: No Safelinks to decode."];
    } else {
        safelinks.forEach(safelink => {
            // Regular expression to extract the 'url' parameter from the Safelink
            const safelinkRegex = /url=([^&]+)/i;
            const match = safelinkRegex.exec(safelink);

            if (match && match[1]) {
                let encodedUrl = match[1];
                let decodedUrl = encodedUrl;

                // First, attempt to decode the URL-encoded string (e.g., '%20' -> space)
                try {
                    decodedUrl = decodeURIComponent(encodedUrl);

                    // If the URL looks like it starts with 'http', it's decoded
                    if (decodedUrl && decodedUrl.indexOf('http') === 0) {
                        decodedOutput.push(decodedUrl);
                    } else {
                        // Otherwise, fallback to base64 decoding (if needed)
                        try {
                            decodedUrl = atob(encodedUrl); // Decode base64
                            decodedUrl = decodeURIComponent(decodedUrl); // Decode any further URL encoding if present
                            decodedOutput.push(decodedUrl);
                        } catch (e) {
                            decodedOutput.push("Error: Unable to decode Safelink URL.");
                        }
                    }
                } catch (e) {
                    decodedOutput.push("Error: Unable to decode URL-encoded string.");
                }
            } else {
                decodedOutput.push("Error: No 'url' parameter found in the Safelink.");
            }
        });
    }

    // Get the format of the input: check if it's separated by commas or new lines
    const delimiter = input.includes(',') ? ',' : '\n';

    // If delimiter is comma, add a space after each comma in the output
    if (delimiter === ',') {
        document.getElementById("safelinkOutput").value = decodedOutput.join(', ');
    } else {
        document.getElementById("safelinkOutput").value = decodedOutput.join('\n');
    }
}

//QR Decode from File
async function decodeQRFromFile() {
    const fileInput = document.getElementById('qrFileInput');
    const output = document.getElementById('qrDecodedOutput');

    if (fileInput.files.length === 0) {
        alert("Please select an image file.");
        return;
    }

    const file = fileInput.files[0];
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => processQRImage(img, output);
}

//QR Decode from URL
async function decodeQRFromUrl() {
    const imageUrl = document.getElementById('qrImageUrl').value.trim();
    const output = document.getElementById('qrDecodedOutput');

    if (!imageUrl) {
        alert("Please enter a valid image URL.");
        return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous"; // Ensure CORS handling for external images
    img.src = imageUrl;

    img.onload = () => processQRImage(img, output);
}

function processQRImage(img, outputElement) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

    if (qrCode) {
        outputElement.value = qrCode.data;
    } else {
        outputElement.value = "No QR code detected.";
    }
}

function resetQRDecoder() {
    document.getElementById('qrFileInput').value = ""; // Clear the file input
    document.getElementById('qrImageUrl').value = "";  // Clear the URL input
    document.getElementById('qrDecodedOutput').value = ""; // Clear the decoded output
}

// Encode Text to Base64
function encodeBase64() {
    const input = document.getElementById('base64Input').value.trim();
    try {
        const encoded = btoa(input); // Encode to Base64
        document.getElementById('base64Output').value = encoded;
    } catch (error) {
        document.getElementById('base64Output').value = 'Invalid input for Base64 encoding';
    }
}

// Decode Base64 Input
function decodeBase64() {
    const input = document.getElementById('base64Input').value.trim();
    try {
        const decoded = atob(input); // Decode Base64
        document.getElementById('base64Output').value = decoded;
    } catch (error) {
        document.getElementById('base64Output').value = 'Invalid Base64 input';
    }
}

// WHOIS
function openWhois() {
    const input = document.getElementById("whoisInput").value;
    const url = `https://www.whois.com/whois/${encodeURIComponent(input)}`;
    window.open(url, "_blank");
}

function generateWhoisURL() {
    const input = document.getElementById('whoisInput').value;
    const items = input.split(/\r?\n/).filter(item => item.trim());
    let output = '';
    output += `https://www.whois.com/whois/${encodeURIComponent(input)}\n`;

    document.getElementById('whoisOutput').value = output.trim();
}

//Regex
const regexPatterns = {
    ipv4: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b',
    email: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    url: '(https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|www\\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9]+\\.[^\\s]{2,}|www\\.[a-zA-Z0-9]+\\.[^\\s]{2,})',
    md5: '\\b[a-fA-F0-9]{32}\\b',
    sha256: '\\b[a-fA-F0-9]{64}\\b',
    base64: '\\b[A-Za-z0-9+/]{64}\\b'
};

function updateRegexPattern() {
    const preset = document.getElementById('regexPreset').value;
    const customRegexInput = document.getElementById('customRegex');
    
    if (preset !== 'custom') {
        customRegexInput.value = regexPatterns[preset];
        customRegexInput.disabled = true;
    } else {
        customRegexInput.value = '';
        customRegexInput.disabled = false;
    }
}

function captureMatches() {
    const input = document.getElementById('regexInput').value;
    const preset = document.getElementById('regexPreset').value;
    let pattern = preset === 'custom' 
        ? document.getElementById('customRegex').value 
        : regexPatterns[preset];

    try {
        const regex = new RegExp(pattern, 'gm');
        const matches = [...input.matchAll(regex)];
        
        if (matches.length === 0) {
            document.getElementById('regexOutput').value = 'No matches found.';
            return;
        }

        const output = matches.map(match => match[0]).join('\n');
        document.getElementById('regexOutput').value = output;
    } catch (error) {
        document.getElementById('regexOutput').value = 'Invalid regex pattern: ' + error.message;
    }
}

function resetRegexTool() {
    document.getElementById('regexInput').value = '';
    document.getElementById('regexOutput').value = '';
    document.getElementById('regexPreset').value = 'custom';
    document.getElementById('customRegex').value = '';
    document.getElementById('customRegex').disabled = false;
}
